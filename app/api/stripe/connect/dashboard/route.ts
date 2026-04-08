import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-03-25.dahlia' });

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const origin = req.nextUrl.origin;
    return NextResponse.redirect(`${origin}/login`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: perfil } = await (supabase as any)
    .from('avaliadores_perfil')
    .select('stripe_account_id')
    .eq('user_id', user.id)
    .single();

  if (!perfil?.stripe_account_id) {
    return NextResponse.json({ error: 'Conta Stripe não configurada' }, { status: 400 });
  }

  try {
    const loginLink = await stripe.accounts.createLoginLink(perfil.stripe_account_id);
    return NextResponse.redirect(loginLink.url);
  } catch (err) {
    console.error('Stripe login link error:', err);
    return NextResponse.json({ error: 'Não foi possível acessar o dashboard' }, { status: 500 });
  }
}
