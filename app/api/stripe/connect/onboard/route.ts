import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-03-25.dahlia',
  });

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) =>
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          ),
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const origin = request.headers.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  try {
    // Buscar stripe_account_id existente
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: perfil } = await (supabase as any)
      .from('avaliadores_perfil')
      .select('stripe_account_id')
      .eq('user_id', user.id)
      .maybeSingle();

    let accountId: string = perfil?.stripe_account_id ?? '';

    if (!accountId) {
      // Criar Express Account
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'BR',
        email: user.email,
        capabilities: {
          transfers: { requested: true },
        },
        business_type: 'individual',
        metadata: { userId: user.id },
      });
      accountId = account.id;

      // Salvar no perfil
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('avaliadores_perfil')
        .upsert({ user_id: user.id, stripe_account_id: accountId });
    }

    // Criar link de onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/perfil/avaliador?onboard=refresh`,
      return_url: `${origin}/perfil/avaliador?onboard=success`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro ao iniciar configuração de pagamento';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
