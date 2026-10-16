import type { APIRoute } from 'astro';
import Stripe from 'stripe';

// @ts-ignore - Ignore le contrôle de type strict sur la clé API
const stripeSecret = import.meta.env.STRIPE_SECRET_KEY || '';
const stripe = new Stripe(stripeSecret);

export const POST: APIRoute = async ({ request, url }) => {
  try {
    const body = await request.json();
    const items = body.items || [];

    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.nombre_producto || item.nom_producto || 'Vehículo',
        },
        unit_amount: Math.round(Number(item.precio || 0) * 100),
      },
      quantity: item.cantidad || 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${url.origin}/carrito?success=true`,
      cancel_url: `${url.origin}/carrito?canceled=true`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Erreur Stripe Checkout :', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};