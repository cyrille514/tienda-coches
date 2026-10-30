// src/pages/api/create-stripe-session.ts
import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY || '');

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const accessToken = cookies.get('sb-access-token');
    const refreshToken = cookies.get('sb-refresh-token');
    let userId = 'invitado';

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

    const origin = 'https://tienda-coches.vercel.app';

    const lineItems = items.map((item: any) => {
      const imageUrl = item.url_imagen || item.imagen;
      const validImages = (imageUrl && imageUrl.startsWith('http')) ? [imageUrl] : [];

      return {
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.nombre_producto || item.nombre || 'Vehículo',
            ...(validImages.length > 0 && { images: validImages }),
          },
          unit_amount: Math.round(Number(item.precio) * 100),
        },
        quantity: Number(item.cantidad) || 1,
      };
    });

    // Création de la session Stripe (sans payment_method_types obsolète)
    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: 'payment',
      metadata: {
        userId: userId,
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
    return new Response(JSON.stringify({ error: err.message || 'Error interno' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

