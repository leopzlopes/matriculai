import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import { PagamentoClient } from './PagamentoClient';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ propostaId?: string; pago?: string }>;
}

export default async function PagamentoPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { propostaId, pago } = await searchParams;

  if (!propostaId) redirect(`/avaliacoes/${id}`);

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  // Buscar proposta com avaliador
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: proposta } = await (supabase as any)
    .from('avaliacoes_propostas')
    .select('id, valor, prazo_execucao, avaliador_id, solicitacao_id, status, stripe_payment_intent_id, avaliadores_perfil(bio, crea_numero, nota_media)')
    .eq('id', propostaId)
    .single();

  if (!proposta) notFound();

  // Verificar permissão: deve ser dono da solicitação
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: sol } = await (supabase as any)
    .from('avaliacoes_solicitacoes')
    .select('id, user_id')
    .eq('id', id)
    .single();

  if (!sol || sol.user_id !== user.id) notFound();

  // Se já foi pago, redirecionar de volta
  if (pago === 'true' || proposta.status === 'pago' || proposta.status === 'concluido') {
    redirect(`/avaliacoes/${id}?pago=true`);
  }

  // Gerar clientSecret via API interna
  const headerStore = await headers();
  const host = headerStore.get('host') ?? 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const origin = `${protocol}://${host}`;

  let clientSecret: string | null = null;
  let checkoutError: string | null = null;

  try {
    const res = await fetch(`${origin}/api/stripe/avaliacoes/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: headerStore.get('cookie') ?? '',
      },
      body: JSON.stringify({ propostaId }),
    });
    const data = await res.json();
    if (data.clientSecret) {
      clientSecret = data.clientSecret;
    } else {
      checkoutError = data.error ?? 'Erro ao iniciar pagamento';
    }
  } catch {
    checkoutError = 'Erro ao conectar com o servidor de pagamento';
  }

  const platformFee = Math.floor(proposta.valor * 0.1);
  const avaliadorRecebe = proposta.valor - platformFee;

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <Link href={`/avaliacoes/${id}`} className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-6">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Voltar para a solicitação
      </Link>

      <h1 className="text-xl font-bold text-[#111219] mb-1">Confirmar Pagamento</h1>
      <p className="text-sm text-slate-500 mb-6">Seu pagamento é retido até a entrega do laudo.</p>

      {/* Resumo da proposta */}
      <div className="bg-white border border-black/[0.08] rounded-2xl p-5 mb-6">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Resumo</h2>
        <div className="space-y-2.5">
          {[
            ['Valor total', `R$ ${proposta.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
            ['Taxa da plataforma (10%)', `R$ ${platformFee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
            ['Avaliador recebe', `R$ ${avaliadorRecebe.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
            ['Prazo de execução', `${proposta.prazo_execucao} dias`],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-slate-500">{label}</span>
              <span className="font-medium text-[#111219]">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Aviso de segurança */}
      <div className="flex items-start gap-2 bg-[#E6F1FB] border border-[#0C447C]/20 rounded-xl px-4 py-3 mb-6">
        <ShieldCheck className="w-4 h-4 text-[#0C447C] flex-shrink-0 mt-0.5" />
        <p className="text-xs text-[#0C447C]">
          O valor é retido pela plataforma e liberado ao avaliador somente após a entrega do laudo.
        </p>
      </div>

      {checkoutError ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-sm text-red-600 font-medium mb-1">Não foi possível iniciar o pagamento</p>
          <p className="text-xs text-red-500">{checkoutError}</p>
          <Link href={`/avaliacoes/${id}`}
            className="inline-block mt-4 text-xs text-[#0C447C] hover:underline">
            Voltar para a solicitação
          </Link>
        </div>
      ) : clientSecret ? (
        <PagamentoClient
          clientSecret={clientSecret}
          valor={proposta.valor}
          solicitacaoId={id}
        />
      ) : null}
    </div>
  );
}
