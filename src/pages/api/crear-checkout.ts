// src/pages/api/crear-checkout.ts

import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase'; 
import Stripe from 'stripe';
import { BUCKET } from '../../config';

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY);

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // 1. Verificamos la sesión del usuario directamente desde las cookies
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

    // 4. Détermination sécurisée de l'origine pour Vercel et le développement local
    const url = new URL(request.url);
    const origin = request.headers.get('origin') || `${url.protocol}//${url.host}`;

    // 5. Mapeamos los productos para Stripe con normalización robusta de imágenes y URLs
    const lineItems = items.map((item: any) => {
      const producto = item.producto || item;
      
      const nombre = producto.nombre_producto || producto.nombre || "Producto";
      const precio = parseFloat(producto.precio) || 0;
      const cantidad = item.cantidad || 1;
      
      // Construction sécurisée et optionnelle de l'image pour éviter l'erreur de URL invalide
      let imagen = undefined;
      if (producto.url_imagen) {
        let cleanPath = producto.url_imagen.trim();
        if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
          imagen = cleanPath;
        } else if (typeof BUCKET !== 'undefined' && BUCKET) {
          if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;
          imagen = `${BUCKET.replace(/\/$/, "")}${cleanPath}`;
        }
      }

      const productData: any = {
        name: nombre,
      };

      // N'ajoute le tableau des images que si l'URL est valide
      if (imagen) {
        productData.images = [imagen];
      }

      return {
        price_data: {
          currency: 'eur',
          product_data: productData,
          unit_amount: Math.round(precio * 100), // Stripe usa céntimos
        },
        quantity: cantidad,
      };
    });

    // 6. Creamos la sesión de Stripe Checkout con URLs absolutas garantizadas
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


