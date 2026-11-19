// src/lib/facturas.ts
import pool from './db';

interface NuevaFactura {
  clienteId: string;
  stripePaymentIntentId: string;
  iva?: number;
  email?: string;
  nombreCliente?: string;
}

export async function crearFactura({
  clienteId,
  stripePaymentIntentId,
  iva = 21.0,
  email,
  nombreCliente,
}: NuevaFactura) {
  if (!clienteId || !stripePaymentIntentId) {
    throw new Error('clienteId y stripePaymentIntentId son obligatorios.');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Vérifier si la facture existe déjà pour ce paiement Stripe (idempotence)
    const existingFacturaRes = await client.query(
      `SELECT * FROM facturas WHERE stripe_payment_intent_id = $1 LIMIT 1;`,
      [stripePaymentIntentId]
    );

    if (existingFacturaRes.rows.length > 0) {
      await client.query('COMMIT');
      return {
        ...existingFacturaRes.rows[0],
        yaExistia: true,
      };
    }

    // 2. Résoudre ou créer le client
    let finalClienteId = clienteId;

    if (email) {
      const normalizedEmail = email.trim().toLowerCase();
      const existingClientRes = await client.query(
        `SELECT pk_cliente FROM clientes WHERE LOWER(email) = $1 LIMIT 1;`,
        [normalizedEmail]
      );

      if (existingClientRes.rows.length > 0) {
        finalClienteId = existingClientRes.rows[0].pk_cliente;
      } else {
        await client.query(
          `
          INSERT INTO clientes (pk_cliente, email, nombre_cliente, tipo, razon_social)
          VALUES ($1, $2, $3, 'autonomo', 'persona natural')
          ON CONFLICT (pk_cliente) DO NOTHING;
          `,
          [clienteId, normalizedEmail, (nombreCliente || 'Cliente').trim()]
        );

        // Récupérer l'ID réel au cas où une insertion concurrente a eu lieu
        const checkAfterInsert = await client.query(
          `SELECT pk_cliente FROM clientes WHERE LOWER(email) = $1 LIMIT 1;`,
          [normalizedEmail]
        );
        if (checkAfterInsert.rows.length > 0) {
          finalClienteId = checkAfterInsert.rows[0].pk_cliente;
        }
      }
    }

    // 3. Insérer la nouvelle facture en toute sécurité
    const insertFacturaRes = await client.query(
      `
      INSERT INTO facturas (fk_cliente, stripe_payment_intent_id, iva)
      VALUES ($1, $2, $3)
      ON CONFLICT (stripe_payment_intent_id) DO NOTHING
      RETURNING *;
      `,
      [finalClienteId, stripePaymentIntentId, iva]
    );

    let factura = insertFacturaRes.rows[0];
    let yaExistia = false;

    if (!factura) {
      const fallbackRes = await client.query(
        `SELECT * FROM facturas WHERE stripe_payment_intent_id = $1 LIMIT 1;`,
        [stripePaymentIntentId]
      );
      factura = fallbackRes.rows[0];
      yaExistia = true;
    }

    await client.query('COMMIT');
    return {
      ...factura,
      yaExistia,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al insertar la factura en Postgres:', error);
    throw error;
  } finally {
    client.release();
  }
}
