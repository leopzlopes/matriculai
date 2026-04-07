import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-03-25.dahlia',
  });

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  switch (event.type) {
    // Pagamento autorizado e aguardando captura (capture_method=manual)
    case 'payment_intent.amount_capturable_updated': {
      const pi = event.data.object as Stripe.PaymentIntent;
      const propostaId = pi.metadata?.propostaId;
      const solicitacaoId = pi.metadata?.solicitacaoId;

      if (propostaId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabaseAdmin as any)
          .from('avaliacoes_propostas')
          .update({ status: 'pago' })
          .eq('id', propostaId);
      }

      if (solicitacaoId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabaseAdmin as any)
          .from('avaliacoes_solicitacoes')
          .update({ status: 'aguardando_entrega' })
          .eq('id', solicitacaoId);
      }
      break;
    }

    // Pagamento capturado (liberado manualmente via dashboard ou Fase 4)
    case 'payment_intent.succeeded': {
      const pi = event.data.object as Stripe.PaymentIntent;
      const propostaId = pi.metadata?.propostaId;
      const solicitacaoId = pi.metadata?.solicitacaoId;
      const avaliadorId = pi.metadata?.avaliadorId;

      if (propostaId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabaseAdmin as any)
          .from('avaliacoes_propostas')
          .update({ status: 'concluido' })
          .eq('id', propostaId);
      }

      if (solicitacaoId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabaseAdmin as any)
          .from('avaliacoes_solicitacoes')
          .update({ status: 'concluida', valor_pago: pi.amount / 100 })
          .eq('id', solicitacaoId);
      }

      // Incrementar total_avaliacoes do avaliador
      if (avaliadorId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: perf } = await (supabaseAdmin as any)
          .from('avaliadores_perfil')
          .select('total_avaliacoes')
          .eq('user_id', avaliadorId)
          .single();

        if (perf) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabaseAdmin as any)
            .from('avaliadores_perfil')
            .update({ total_avaliacoes: (perf.total_avaliacoes ?? 0) + 1 })
            .eq('user_id', avaliadorId);
        }
      }
      break;
    }

    // Conta Express atualizada
    case 'account.updated': {
      const account = event.data.object as Stripe.Account;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: perfis } = await (supabaseAdmin as any)
        .from('avaliadores_perfil')
        .select('user_id')
        .eq('stripe_account_id', account.id);

      if (!perfis || perfis.length === 0) break;
      const userId = (perfis as { user_id: string }[])[0].user_id;

      const updates: Record<string, unknown> = {};

      if (account.charges_enabled) {
        updates.credencial_verificada = true;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const disabledReason = (account as any).disabled_reason;
      if (disabledReason) {
        updates.status = 'suspended';
      } else if (account.charges_enabled) {
        updates.status = 'active';
      }

      if (Object.keys(updates).length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabaseAdmin as any)
          .from('avaliadores_perfil')
          .update(updates)
          .eq('user_id', userId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
