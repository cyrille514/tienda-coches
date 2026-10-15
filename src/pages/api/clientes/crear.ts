import type { APIRoute } from 'astro';
import { pool } from '../../../lib/db';

export const POST: APIRoute = async ({ request, redirect }) => {
  try {
    const formData = await request.formData();
    const pk_cliente = formData.get('pk_cliente')?.toString() || '';
    const nombre = formData.get('nombre')?.toString() || '';
    const email = formData.get('email')?.toString() || '';
    const telefono = formData.get('telefono')?.toString() || '';

    // Vérification des champs obligatoires
    if (!pk_cliente || !email) {
      return new Response('Missing required fields', { status: 400 });
    }

    // 1. Mise à jour / Insertion dans la base de données PostgreSQL (Supabase)
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

    // 2. Synchronisation avec l'API Brevo
    const brevoApiKey = import.meta.env.BREVO_API_KEY;

    if (brevoApiKey) {
      // Nettoyage de la chaîne du téléphone
      const telefonoString = telefono ? telefono.trim() : '';

      const brevoData = {
        email: email,
        attributes: {
          NOM: nombre,           // Utilise l'attribut "NOM" de votre Brevo
          TELEFONO: telefonoString // Format texte (string)
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
      } else {
        console.log('Contact synchronisé avec succès sur Brevo !');
      }
    }

    return redirect('/perfil?success=true', 302);
  } catch (error) {
    console.error('Erreur dans /api/clientes/crear :', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};
