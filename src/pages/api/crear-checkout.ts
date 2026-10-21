// src/pages/api/crear-checkout.ts

import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase'; 
import Stripe from 'stripe';
import { BUCKET } from '../../config';

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY);

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // 1. Verificamos la sesión del usuario directamente desde las cookies en el servidor
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

    // 2. Si no hay usuario autenticado, rechazamos la petición
    if (!userId) {
      return new Response(JSON.stringify({ error: 'No autorizado. Debes iniciar sesión para comprar.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 3. Leemos los productos que envió el carrito del cliente
    const body = await request.json();
    const items = body.items;

    if (!items || items.length === 0) {
      return new Response(JSON.stringify({ error: 'El carrito está vacío' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 4. Mapeamos los productos para Stripe con normalización robusta (soporta estructura anidada o plana)
    const lineItems = items.map((item: any) => {
      const producto = item.producto || item;
      
      const nombre = producto.nombre_producto || producto.nombre || "Producto";
      const precio = parseFloat(producto.precio) || 0;
      const cantidad = item.cantidad || 1;
      
      let cleanPath = producto.url_imagen ? producto.url_imagen.trim() : "";
      if (cleanPath && !cleanPath.startsWith("/")) {
        cleanPath = "/" + cleanPath;
      }
      const imagen = cleanPath ? `${BUCKET.replace(/\/$/, "")}${cleanPath}` : undefined;

      return {
        price_data: {
          currency: 'eur',
          product_data: {
            name: nombre,
            images: imagen ? [imagen] : [],
          },
          unit_amount: Math.round(precio * 100), // Stripe usa céntimos
        },
        quantity: cantidad,
      };
    });

    // 5. Creamos la sesión de Stripe Checkout incluyendo el ID del usuario en los metadata
    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: 'payment',
      success_url: `${new URL(request.url).origin}/exito?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${new URL(request.url).origin}/carrito`,
      metadata: {
        userId: userId, // ID seguro verificado en el servidor
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
