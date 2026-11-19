import type { APIRoute } from 'astro';
import Stripe from 'stripe';

const stripeSecret = import.meta.env.STRIPE_SECRET_KEY;

if (!stripeSecret) {
  console.warn('STRIPE_SECRET_KEY manquante dans les variables d’environnement.');
}

const stripe = new Stripe(stripeSecret || '');

interface CheckoutItem {
  nombre_producto?: string;
  nom_producto?: string;
  precio?: number | string;
  cantidad?: number;
}

export const POST: APIRoute = async ({ request, url }) => {
  try {
    if (!stripeSecret) {
      return new Response(
        JSON.stringify({ error: 'Configuration de paiement manquante.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const items: CheckoutItem[] = Array.isArray(body?.items) ? body.items : [];

    if (items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Le panier est vide.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => {
      const prixUnitaire = Number(item.precio ?? 0);
      const unitAmount = Math.round(prixUnitaire * 100);
      const quantity = Math.max(1, Math.floor(Number(item.cantidad ?? 1)));
      const name = (item.nombre_producto || item.nom_producto || 'Vehículo').toString().trim();

      if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
        throw new Error(`Prix invalide pour l’article : ${name}`);
      }

      return {
        price_data: {
          currency: 'eur',
          product_data: {
            name,
          },
          unit_amount: unitAmount,
        },
        quantity,
      };
    });

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
    return new Response(
      JSON.stringify({ error: error?.message || 'Erreur lors de la création de la session.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
