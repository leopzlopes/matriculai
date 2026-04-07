import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getSolicitacao, getPropostasDaSolicitacao } from '@/lib/actions/avaliacoes';
import { getProfileData } from '@/lib/actions/profile';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import {
  LABEL_TIPO_IMOVEL,
  LABEL_FINALIDADE,
  LABEL_STATUS,
  STATUS_COLOR,
} from '@/lib/avaliacoes/types';
import { SolicitacaoTabs } from './SolicitacaoTabs';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SolicitacaoDetalhePage({ params }: PageProps) {
  const { id } = await params;

  const [sol, profile, supabase] = await Promise.all([
    getSolicitacao(id),
    getProfileData(),
    createSupabaseServerClient(),
  ]);

  if (!sol) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const propostas = await getPropostasDaSolicitacao(id);
  const isDono = sol.user_id === user.id;
  const isAvaliador = profile?.tipo_usuario === 'avaliador';

  // Verificar se o avaliador já enviou proposta
  const minhaPropostaId = isAvaliador
    ? propostas.find((p) => p.avaliador_id === user.id)?.id
    : undefined;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Link href="/avaliacoes" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar para Avaliações
        </Link>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-[#111219]">
                {LABEL_TIPO_IMOVEL[sol.tipo_imovel]} · {LABEL_FINALIDADE[sol.finalidade]}
              </h1>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[sol.status]}`}>
                {LABEL_STATUS[sol.status]}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              {sol.endereco} — {sol.cidade}/{sol.uf}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Publicada em {new Date(sol.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>

          {isDono && sol.status === 'aberta' && (
            <form action={async () => {
              'use server';
              const { cancelSolicitacao } = await import('@/lib/actions/avaliacoes');
              await cancelSolicitacao(id);
            }}>
              <button type="submit"
                className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors">
                Cancelar solicitação
              </button>
            </form>
          )}
        </div>
      </div>

      <SolicitacaoTabs
        sol={sol}
        propostas={propostas}
        userId={user.id}
        isDono={isDono}
        isAvaliador={isAvaliador}
        minhaPropostaId={minhaPropostaId}
      />
    </div>
  );
}
