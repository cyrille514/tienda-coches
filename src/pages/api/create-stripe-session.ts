// src/pages/api/create-stripe-session.ts
import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY || '');

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // 1. Récupération optionnelle de l'utilisateur connecté via les cookies Supabase
    const accessToken = cookies.get('sb-access-token');
    const refreshToken = cookies.get('sb-refresh-token');
    let userId = 'invitado'; // Valeur par défaut si non connecté

    if (accessToken && refreshToken) {
      const { data } = await supabase.auth.setSession({
        access_token: accessToken.value,
        refresh_token: refreshToken.value,
      });
      if (data?.user) {
        userId = data.user.id;
      }
    }

    const body = await request.json();
    const items = body.items || [];

    if (items.length === 0) {
      return new Response(JSON.stringify({ error: 'El carrito está vacío' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Récupération propre de l'origine (domaine)
    const headerHost = request.headers.get('x-forwarded-host') || request.headers.get('host');
    const headerProto = request.headers.get('x-forwarded-proto') || 'https';
    const origin = headerHost ? `${headerProto}://${headerHost}` : new URL(request.url).origin;

    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.nombre_producto || item.nombre || 'Vehículo',
          images: item.url_imagen ? [item.url_imagen] : [],
        },
        unit_amount: Math.round(Number(item.precio) * 100),
      },
      quantity: item.cantidad || 1,
    }));

    // 2. Création de la session Stripe avec le bon userId dans les metadata
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      metadata: {
        userId: userId, // 👈 ID récupéré dynamiquement et proprement de Supabase
      },
      success_url: `${origin}/exito?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/carrito?canceled=true`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('Erreur Stripe session:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
