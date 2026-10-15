// src/pages/api/auth/signout.ts
import type { APIRoute } from 'astro';
import { supabase } from '@/lib/supabase';

export const GET: APIRoute = async ({ cookies, redirect }) => {
  // Déconnexion côté Supabase
  await supabase.auth.signOut();

  // Suppression des cookies locaux
  cookies.delete('sb-access-token', { path: '/' });
  cookies.delete('sb-refresh-token', { path: '/' });

  return redirect('/productos?categoria=1');
};

