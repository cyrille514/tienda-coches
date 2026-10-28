// src/lib/facturas.ts
import pool from './db';

interface NuevaFactura {
  clienteId: string;
  stripePaymentIntentId: string;
  iva?: number;
  email?: string;
  nombreCliente?: string;
}

export async function crearFactura({ clienteId, stripePaymentIntentId, iva = 21.00, email, nombreCliente }: NuevaFactura): Promise<any> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let finalClienteId = clienteId;

    if (email) {
      // 1. Vérifier si un client existe déjà avec cet e-mail exact
      const existingClientQuery = `SELECT pk_cliente FROM clientes WHERE email = $1 LIMIT 1;`;
      const existingResult = await client.query(existingClientQuery, [email]);

      if (existingResult.rows.length > 0) {
        // Si l'e-mail existe déjà, on utilise son ID existant pour la facture
        finalClienteId = existingResult.rows[0].pk_cliente;
      } else {
        // Sinon, on insère le nouveau client en respectant les colonnes obligatoires
        const insertClientQuery = `
          INSERT INTO clientes (pk_cliente, email, nombre_cliente, tipo, razon_social)
          VALUES ($1, $2, $3, 'autonomo', 'persona natural')
          ON CONFLICT (pk_cliente) DO NOTHING;
        `;
        await client.query(insertClientQuery, [
          clienteId, 
          email, 
          nombreCliente || 'Cliente'
        ]);
      }
    }

    // 2. Insérer la facture dans la table 'facturas' avec le bon ID client garanti
    const query = `
      INSERT INTO facturas (fk_cliente, stripe_payment_intent_id, iva)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    
    const values = [finalClienteId, stripePaymentIntentId, iva];
    const { rows } = await client.query(query, values);
    
    await client.query('COMMIT');
    return rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error al insertar la factura en Postgres:", error);
    throw error;
  } finally {
    client.release();
  }
}
