// src/pages/api/clientes/crear.ts
import type { APIRoute } from 'astro';
import pool from '@/lib/db';
import { supabase } from '@/lib/supabase';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const nombre = formData.get('nombre')?.toString() || '';
  const telefono = formData.get('telefono')?.toString() || '';
  const enviarBrevo = formData.get('enviar-brevo')?.toString() === 'true';

  const accessToken = cookies.get('sb-access-token');
  const refreshToken = cookies.get('sb-refresh-token');

  if (!accessToken || !refreshToken) {
    return new Response('No autorizado', { status: 401 });
  }

  const { data: { user }, error: authError } = await supabase.auth.setSession({
    access_token: accessToken.value,
    refresh_token: refreshToken.value,
  });

  if (authError || !user) {
    return new Response('Sesión inválida', { status: 401 });
  }

  const textQuery = `
    INSERT INTO clientes (id, nombre, telefono, email)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (id) DO UPDATE 
    SET nombre = EXCLUDED.nombre, 
        telefono = EXCLUDED.telefono;
  `;
  
  const values = [user.id, nombre, telefono, user.email];

  try {
    await pool.query(textQuery, values);
  } catch (err: any) {
    console.error('Error SQL:', err);
    return new Response(`Error en Base de Datos: ${err.message}`, { status: 500 });
  }

  if (enviarBrevo && user.email) {
    await enviarABrevo(user.email, nombre, telefono);
  }

  return redirect('/perfil');
};

async function enviarABrevo(email: string, nombre: string, telefono: string) {
  const BREVO_API_KEY = import.meta.env.BREVO_API_KEY;

  if (!BREVO_API_KEY) return;

  await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
      'api-key': BREVO_API_KEY,
    },
    body: JSON.stringify({
      email: email,
      attributes: {
        NOMBRE: nombre,
        TELEFONO: telefono,
      },
      updateEnabled: true,
    }),
  });
}
