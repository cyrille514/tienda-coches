// src/pages/api/crear-checkout.ts
import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase'; 
import Stripe from 'stripe';
import { BUCKET } from '../../config';

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY);

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const accessToken = cookies.get('sb-access-token');
    const refreshToken = cookies.get('sb-refresh-token');

    let userId = null;

    if (accessToken && refreshToken) {
      const { data } = await supabase.auth.setSession({
        access_token: accessToken.value,
        refresh_token: refreshToken.value,
      });
      if (data.user) {
        userId = data.user.id;
      }
    }

    if (!userId) {
      return new Response(JSON.stringify({ error: 'No autorizado. Debes iniciar sesión para comprar.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const items = body.items;

    if (!items || items.length === 0) {
      return new Response(JSON.stringify({ error: 'El carrito está vacío' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(request.url);
    const origin = request.headers.get('origin') || `${url.protocol}//${url.host}`;

    const lineItems = items.map((item: any) => {
      const producto = item.producto || item;
      
      const nombre = producto.nombre_producto || producto.nombre || producto.modelo || producto.title || producto.titulo || producto.marca || "Producto";
      const precio = parseFloat(producto.precio || producto.precio_producto || producto.price) || 0;
      const cantidad = item.cantidad || 1;
      
      // Recherche exhaustive et sécurisée de l'image
      const rawImg = producto.url_imagen || producto.imagen_url || producto.imagen || producto.foto || producto.img || producto.image || producto.path || "";
      let imagenFinal = undefined;

      if (rawImg && typeof rawImg === 'string') {
        const cleanPath = rawImg.trim();
        if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
          imagenFinal = cleanPath;
        } else if (typeof BUCKET !== 'undefined' && BUCKET) {
          const formattedBucket = BUCKET.replace(/\/$/, "");
          const formattedPath = cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath;
          imagenFinal = `${formattedBucket}${formattedPath}`;
        }
      }

      const productData: any = {
        name: nombre,
      };

      // N'ajoute l'image à Stripe que si c'est une URL absolue valide
      if (imagenFinal && (imagenFinal.startsWith('http://') || imagenFinal.startsWith('https://'))) {
        productData.images = [imagenFinal];
      }

      return {
        price_data: {
          currency: 'eur',
          product_data: productData,
          unit_amount: Math.round(precio * 100),
        },
        quantity: cantidad,
      };
    });

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/exito?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/carrito`,
      metadata: {
        userId: userId,
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("Error en crear-checkout:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
