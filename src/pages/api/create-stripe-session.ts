// src/pages/api/create-stripe-session.ts
import type { APIRoute } from 'astro';
import Stripe from 'stripe';

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY || '');

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const items = body.items || [];

    if (items.length === 0) {
      return new Response(JSON.stringify({ error: 'El carrito está vacío' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Récupération propre et sécurisée de l'origine (domaine) de la requête
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

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/carrito?success=true`,
      cancel_url: `${origin}/carrito?canceled=true`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
