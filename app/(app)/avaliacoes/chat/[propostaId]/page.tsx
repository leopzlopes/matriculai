import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getMensagens } from '@/lib/actions/avaliacoes';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ChatClient } from './ChatClient';

interface PageProps {
  params: Promise<{ propostaId: string }>;
}

export default async function ChatPage({ params }: PageProps) {
  const { propostaId } = await params;

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  // Verificar acesso à proposta
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: proposta } = await (supabase as any)
    .from('avaliacoes_propostas')
    .select('id, solicitacao_id, avaliador_id, avaliacoes_solicitacoes(user_id, tipo_imovel, cidade, uf)')
    .eq('id', propostaId)
    .single();

  if (!proposta) notFound();

  const sol = proposta.avaliacoes_solicitacoes;
  const isDono = sol?.user_id === user.id;
  const isAvaliador = proposta.avaliador_id === user.id;

  if (!isDono && !isAvaliador) notFound();

  const mensagens = await getMensagens(propostaId);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-4">
        <Link href={`/avaliacoes/${proposta.solicitacao_id}`}
          className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-2">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar para a solicitação
        </Link>
        <h1 className="text-lg font-bold text-[#111219]">
          Mensagens
          {sol && <span className="text-slate-500 font-normal text-sm ml-2">· {sol.cidade}/{sol.uf}</span>}
        </h1>
      </div>

      <ChatClient
        propostaId={propostaId}
        userId={user.id}
        initialMensagens={mensagens}
      />
    </div>
  );
}
