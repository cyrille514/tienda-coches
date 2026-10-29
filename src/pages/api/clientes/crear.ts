import type { APIRoute } from 'astro';
import { pool } from '../../../lib/db';
import { supabase } from '../../../lib/supabase'; // Assurez-vous d'importer votre client Supabase

export const POST: APIRoute = async ({ request, redirect, cookies }) => {
  try {
    // 1. Valider la session directement côté serveur via les cookies
    const accessToken = cookies.get('sb-access-token');
    const refreshToken = cookies.get('sb-refresh-token');

    if (!accessToken || !refreshToken) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken.value,
      refresh_token: refreshToken.value,
    });

    if (sessionError || !sessionData.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // L'ID utilisateur officiel et infalsifiable vient de la session du serveur !
    const pk_cliente = sessionData.user.id;
    const email = sessionData.user.email; // Récupéré aussi de la session pour plus de sécurité

    const formData = await request.formData();
    const nombre = formData.get('nombre')?.toString() || '';
    const telefono = formData.get('telefono')?.toString() || '';

    if (!nombre) {
      return new Response('Missing required fields', { status: 400 });
    }

    // 2. Mise à jour / Insertion dans la base de données PostgreSQL (Supabase)
    const client = await pool.connect();
    try {
      await client.query(
        `INSERT INTO clientes (pk_cliente, nombre_cliente, email, telefono_movil)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (pk_cliente) 
         DO UPDATE SET 
           nombre_cliente = EXCLUDED.nombre_cliente,
           email = EXCLUDED.email,
           telefono_movil = EXCLUDED.telefono_movil`,
        [pk_cliente, nombre, email, telefono]
      );
    } finally {
      client.release();
    }

    // 3. Synchronisation avec l'API Brevo (inchangé)
    const brevoApiKey = import.meta.env.BREVO_API_KEY;

    if (brevoApiKey && email) {
      const telefonoString = telefono ? telefono.trim() : '';

      const brevoData = {
        email: email,
        attributes: {
          NOM: nombre,
          TELEFONO: telefonoString
        },
        updateEnabled: true
      };

      const brevoResponse = await fetch('https://api.brevo.com/v3/contacts', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': brevoApiKey,
          'content-type': 'application/json'
        },
        body: JSON.stringify(brevoData)
      });

      if (!brevoResponse.ok) {
        const errorText = await brevoResponse.text();
        console.error('Erreur API Brevo :', errorText);
      }
    }

    return redirect('/perfil?success=true', 302);
  } catch (error) {
    console.error('Erreur dans /api/clientes/crear :', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};
