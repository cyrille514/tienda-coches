import { db } from './db';

// Récupérer les informations d'un client par son ID
export async function getDatosCliente(pk_cliente: string | number) {
  const { data, error } = await db
    .from('CLIENTES')
    .select('*')
    .eq('pk_cliente', pk_cliente)
    .single();

  if (error) {
    console.error('Error fetching cliente:', error);
    return null;
  }

  return data;
}

// Créer un nouveau client lors de l'inscription / achat
export async function crearCliente(datosCliente: Record<string, any>) {
  const { data, error } = await db
    .from('CLIENTES')
    .insert([datosCliente])
    .select();

  if (error) {
    console.error('Error creating cliente:', error);
    return null;
  }

  return data[0];
}
