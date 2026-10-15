// src/pages/api/clientes/crear.ts
import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  try {
    const accessToken = cookies.get('sb-access-token')?.value;
    const refreshToken = cookies.get('sb-refresh-token')?.value;

    if (!accessToken || !refreshToken) {
      return new Response(JSON.stringify({ error: 'Usuario no autenticado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Sesión no válida' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const formData = await request.formData();
    const nombre = formData.get('nombre')?.toString() || '';
    const telefono = formData.get('telefono')?.toString() || '';
    const email = user.email || '';
    const pk_cliente = user.id;

    if (!nombre || !telefono) {
      return new Response(JSON.stringify({ error: 'Nombre y teléfono son obligatorios' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 1. Enregistrement / Mise à jour directe via Supabase
    const { error: dbError } = await supabase
      .from('clientes')
      .upsert({
        pk_cliente: pk_cliente,
        nombre_cliente: nombre,
        telefono_movil: telefono,
        email: email
      }, { onConflict: 'pk_cliente' });

    if (dbError) {
      console.error('Erreur Supabase :', dbError);
    }

    // 2. Synchronisation avec Brevo
    const brevoApiKey = import.meta.env.BREVO_API_KEY;

    if (brevoApiKey) {
      const numClean = parseInt(telefono.replace(/\D/g, ''), 10);

      const brevoResponse = await fetch('https://api.brevo.com/v3/contacts', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'api-key': brevoApiKey,
        },
        body: JSON.stringify({
          email: email,
          attributes: {
            NOM: nombre,
            TELEFONO: isNaN(numClean) ? telefono : numClean,
          },
          updateEnabled: true,
        }),
      });

      if (!brevoResponse.ok) {
        const errorData = await brevoResponse.json();
        console.error('Erreur API Brevo :', JSON.stringify(errorData));
      } else {
        console.log('Contact synchronisé avec succès sur Brevo !');
      }
    }

    return redirect('/perfil?success=true');
  } catch (error) {
    console.error('Erreur interne dans crear.ts :', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
