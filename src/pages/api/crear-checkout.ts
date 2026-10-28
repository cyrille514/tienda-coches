// src/pages/api/crear-checkout.ts
import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';
import Stripe from 'stripe';

const stripeSecret = import.meta.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY || '';
const stripe = new Stripe(stripeSecret);
const SUPABASE_PUBLIC_URL = "https://nuhubizsvumyespdvzef.supabase.co/storage/v1/object/public";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    let userId: string | null = null;

    // 1. Récupération des tokens depuis les cookies ou les headers
    const accessToken = cookies.get('sb-access-token')?.value || cookies.get('sb:token')?.value;
    const refreshToken = cookies.get('sb-refresh-token')?.value;

    if (accessToken) {
      if (refreshToken) {
        const { data } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        userId = data?.user?.id || null;
      } else {
        const { data } = await supabase.auth.getUser(accessToken);
        userId = data?.user?.id || null;
      }
    }

    // 2. Si non authentifié via cookies, tenter la vérification Authorization header
    if (!userId) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const { data } = await supabase.auth.getUser(token);
        userId = data?.user?.id || null;
      }
    }

    // Si toujours pas d'utilisateur, renvoyer 401
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'No autorizado. Debes iniciar sesión para comprar.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const items = body.items || [];

    if (!items.length) {
      return new Response(
        JSON.stringify({ error: 'El carrito está vacío' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(request.url);
    const origin = request.headers.get('origin') || `${url.protocol}//${url.host}`;

    // 3. Traitement des articles et validation des URLs d'images pour Stripe
    const lineItems = items.map((item: any) => {
      const producto = item.producto || item;
      
      const nombre = producto.nombre_producto || producto.nombre || producto.modelo || producto.title || producto.titulo || producto.marca || "Vehículo Exclusivo";
      const precio = parseFloat(producto.precio || producto.precio_producto || producto.price) || 0;
      const cantidad = item.cantidad || 1;
      
      const rawImg = producto.url_imagen || producto.imagen_url || producto.imagen || producto.foto || producto.img || producto.image || producto.path || "";
      let imagenFinal: string | undefined = undefined;

      if (rawImg && typeof rawImg === 'string') {
        let cleanPath = rawImg.trim();
        if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
          imagenFinal = encodeURI(cleanPath);
        } else if (cleanPath) {
          cleanPath = cleanPath.replace(/^\/?vehiculos\//, '');
          cleanPath = cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath;
          imagenFinal = encodeURI(`${SUPABASE_PUBLIC_URL}/vehiculos${cleanPath}`);
        }
      }

      const productData: any = { name: nombre };

      if (imagenFinal) {
        try {
          const parsedUrl = new URL(imagenFinal);
          if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
            productData.images = [imagenFinal];
          }
        } catch (e) {
          console.warn("URL d'image invalide ignorée pour Stripe :", imagenFinal);
        }
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

    // 4. Création de la session Stripe Checkout
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
    console.error("ERREUR CRITIQUE [crear-checkout]:", error.message || error);
    return new Response(JSON.stringify({ error: error.message || 'Error interno en el servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
