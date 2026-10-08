import { db } from './db';

export async function getFactura(pk_factura: number | string) {
  const { data, error } = await db
    .from('FACTURAS')
    .select('*, DETALLE_FACTURA(*)')
    .eq('pk_factura', pk_factura)
    .single();

  if (error) {
    console.error('Error fetching factura:', error);
    return null;
  }

  return data;
}

export async function crearFactura(datosFactura: Record<string, any>) {
  const { data, error } = await db
    .from('FACTURAS')
    .insert([datosFactura])
    .select();

  if (error) {
    console.error('Error creating factura:', error);
    return null;
  }

  return data[0];
}
