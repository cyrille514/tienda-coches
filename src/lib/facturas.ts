// src/lib/facturas.ts
import pool from './db';

interface NuevaFactura {
  clienteId: string;
  stripePaymentIntentId: string;
  iva?: number;
}

/**
 * Inserta una nueva factura en la base de datos usando SQL nativo con pg.
 */
export async function crearFactura({ clienteId, stripePaymentIntentId, iva = 21.00 }: NuevaFactura): Promise<any> {
  try {
    const query = `
      INSERT INTO facturas (fk_cliente, stripe_payment_intent_id, iva)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    
    const values = [clienteId, stripePaymentIntentId, iva];
    const { rows } = await pool.query(query, values);
    
    return rows[0]; // Retorna la factura insertada
  } catch (error) {
    console.error("Error al insertar la factura en Postgres:", error);
    throw error;
  }
}
