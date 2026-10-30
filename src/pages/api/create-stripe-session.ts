// src/pages/api/create-stripe-session.ts
import type { APIRoute } from 'astro';
import Stripe from 'stripe';

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-28.acacia' as any,
});

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

    // Transformation des articles pour Stripe Checkout (les prix doivent être en centimes)
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

    // Création de la session de paiement Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${new URL(request.url).origin}/carrito?success=true`,
      cancel_url: `${new URL(request.url).origin}/carrito?canceled=true`,
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
