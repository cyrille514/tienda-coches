// src/lib/facturas.ts
import pool from './db';

interface NuevaFactura {
  clienteId: string;
  stripePaymentIntentId: string;
  iva?: number;
}

/**
 * Inserta una nueva factura asegurando que el cliente exista en la tabla 'clientes'.
 */
export async function crearFactura({ clienteId, stripePaymentIntentId, iva = 21.00 }: NuevaFactura): Promise<any> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. S'assurer que le client existe dans la table 'clientes' (évite l'erreur de clé étrangère)
    await client.query(`
      INSERT INTO clientes (pk_cliente)
      VALUES ($1)
      ON CONFLICT (pk_cliente) DO NOTHING;
    `, [clienteId]);

    // 2. Insérer la facture dans la table 'facturas'
    const query = `
      INSERT INTO facturas (fk_cliente, stripe_payment_intent_id, iva)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    
    const values = [clienteId, stripePaymentIntentId, iva];
    const { rows } = await client.query(query, values);
    
    await client.query('COMMIT');
    return rows[0]; // Retorna la factura insertada
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error al insertar la factura en Postgres:", error);
    throw error;
  } finally {
    client.release();
  }
}
