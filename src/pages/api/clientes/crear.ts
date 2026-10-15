// src/pages/api/clientes/crear.ts
import type { APIRoute } from 'astro';
import { supabase } from '@/lib/supabase';
import { pool } from '@/lib/db';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  try {
    // 1. Récupérer les tokens de session depuis les cookies
    const accessToken = cookies.get('sb-access-token')?.value;
    const refreshToken = cookies.get('sb-refresh-token')?.value;

    if (!accessToken || !refreshToken) {
      return new Response(JSON.stringify({ error: 'Usuario no autenticado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. Vérifier la session avec Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Sesión no válida' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 3. Extraction des données du formulaire
    const formData = await request.formData();
    const nombre = formData.get('nombre_cliente')?.toString() || formData.get('nombre')?.toString() || '';
    const telefono = formData.get('telefono_movil')?.toString() || formData.get('telefono')?.toString() || '';
    const email = user.email || '';
    const pk_cliente = user.id;

    if (!nombre || !telefono) {
      return new Response(JSON.stringify({ error: 'Nombre y teléfono son obligatorios' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 4. Inscription / Mise à jour dans Supabase (pg pool)
    const textQuery = `
      INSERT INTO clientes (pk_cliente, nombre_cliente, telefono_movil, email)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (pk_cliente) DO UPDATE 
      SET nombre_cliente = EXCLUDED.nombre_cliente, 
          telefono_movil = EXCLUDED.telefono_movil,
          email = EXCLUDED.email;
    `;

    const values = [pk_cliente, nombre, telefono, email];
    await pool.query(textQuery, values);

    // 5. Envoi vers l'API Brevo avec les attributs NOM et TELEFONO
    // 5. Envoi vers l'API Brevo (Sendinblue)
    const brevoApiKey = import.meta.env.BREVO_API_KEY;

    if (brevoApiKey) {
      // Nettoyage pour ne garder que les chiffres (ex: 34631172184)
      const soloNumeros = telefono.replace(/\D/g, '');
      const numeroConvertido = parseInt(soloNumeros, 10);

      const payloadBrevo = {
        email: email,
        attributes: {
          NOM: nombre,
          // Envoyons le nombre si lisible, ou la chaîne nettoyée
          TELEFONO: isNaN(numeroConvertido) ? soloNumeros : numeroConvertido,
        },
        updateEnabled: true,
      };

      console.log('Envoi vers Brevo avec payload:', JSON.stringify(payloadBrevo));

      const brevoResponse = await fetch('https://api.brevo.com/v3/contacts', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'api-key': brevoApiKey,
        },
        body: JSON.stringify(payloadBrevo),
      });

      const responseData = await brevoResponse.json();

      if (!brevoResponse.ok) {
        console.error('Erreur API Brevo (Status ' + brevoResponse.status + ') :', JSON.stringify(responseData));
      } else {
        console.log('Contact synchronisé avec succès sur Brevo ! ID:', responseData);
      }
    } else {
      console.warn('BREVO_API_KEY introuvable dans les variables d’environnement.');
    }

    // Redirection vers le profil
    return redirect('/perfil?success=true');
  } catch (error) {
    console.error('Erreur dans crear.ts :', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
