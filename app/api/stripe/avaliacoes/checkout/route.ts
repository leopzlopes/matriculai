import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PLATFORM_FEE_PERCENT = parseInt(process.env.PLATFORM_FEE_PERCENT ?? '10', 10);

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

  const body = await request.json().catch(() => null);
  const propostaId: string | undefined = body?.propostaId;

  if (!propostaId) {
    return NextResponse.json({ error: 'propostaId obrigatório' }, { status: 400 });
  }

  try {
    // Buscar proposta com solicitação e perfil do avaliador
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: proposta, error: propErr } = await (supabase as any)
      .from('avaliacoes_propostas')
      .select('id, valor, avaliador_id, solicitacao_id, status')
      .eq('id', propostaId)
      .single();

    if (propErr || !proposta) {
      return NextResponse.json({ error: 'Proposta não encontrada' }, { status: 404 });
    }

    if (proposta.status !== 'aceita') {
      return NextResponse.json({ error: 'Proposta não está em status aceita' }, { status: 400 });
    }

    // Verificar que o usuário logado é dono da solicitação
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: sol } = await (supabase as any)
      .from('avaliacoes_solicitacoes')
      .select('id, user_id')
      .eq('id', proposta.solicitacao_id)
      .single();

    if (!sol || sol.user_id !== user.id) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    // Buscar stripe_account_id do avaliador
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: avPerf } = await (supabase as any)
      .from('avaliadores_perfil')
      .select('stripe_account_id')
      .eq('user_id', proposta.avaliador_id)
      .maybeSingle();

    if (!avPerf?.stripe_account_id) {
      return NextResponse.json(
        { error: 'O avaliador ainda não configurou o recebimento de pagamentos' },
        { status: 400 }
      );
    }

    // Calcular valores em centavos
    const amount = Math.round(proposta.valor * 100);
    const applicationFee = Math.floor(proposta.valor * (PLATFORM_FEE_PERCENT / 100)) * 100;

    // Criar PaymentIntent com capture_method=manual (liberação pós-entrega do laudo)
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'brl',
      capture_method: 'manual',
      application_fee_amount: applicationFee,
      transfer_data: {
        destination: avPerf.stripe_account_id,
      },
      metadata: {
        propostaId: proposta.id,
        solicitacaoId: proposta.solicitacao_id,
        avaliadorId: proposta.avaliador_id,
        clienteId: user.id,
      },
    });

    // Salvar payment_intent_id na proposta
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('avaliacoes_propostas')
      .update({ stripe_payment_intent_id: paymentIntent.id })
      .eq('id', propostaId);

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro ao criar pagamento';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
