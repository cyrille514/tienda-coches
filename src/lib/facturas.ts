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

    // 1. S'assurer que le client existe en gérant les conflits sur pk_cliente ou email
    await client.query(`
      INSERT INTO clientes (pk_cliente, email, nombre_cliente, tipo, razon_social)
      VALUES ($1, $2, $3, 'autonomo', 'persona natural')
      ON CONFLICT (pk_cliente) 
      DO UPDATE SET 
        email = COALESCE(EXCLUDED.email, clientes.email),
        nombre_cliente = COALESCE(EXCLUDED.nombre_cliente, clientes.nombre_cliente);
    `, [
      clienteId, 
      email || 'cliente@example.com', 
      nombreCliente || 'Cliente'
    ]);

    // 2. Insérer la facture dans la table 'facturas'
    const query = `
      INSERT INTO facturas (fk_cliente, stripe_payment_intent_id, iva)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    
    const values = [clienteId, stripePaymentIntentId, iva];
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
