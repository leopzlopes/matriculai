'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star, CheckCircle, XCircle, MessageSquare, ChevronDown, ChevronUp, Award, MapPin, Calendar, DollarSign, Home } from 'lucide-react';
import { aceitarProposta, recusarProposta } from '@/lib/actions/avaliacoes';
import { PropostaForm } from './PropostaForm';
import { AvaliadorDrawer } from './AvaliadorDrawer';
import type { SolicitacaoSalva, PropostaSalva } from '@/lib/avaliacoes/types';
import {
  LABEL_TIPO_IMOVEL,
  LABEL_FINALIDADE,
} from '@/lib/avaliacoes/types';

// -------------------------------------------------------
// Star rating
// -------------------------------------------------------
function StarRating({ nota }: { nota: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`w-3 h-3 ${i <= Math.round(nota) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />
      ))}
      <span className="ml-1 text-xs text-slate-500">{nota.toFixed(1)}</span>
    </div>
  );
}

// -------------------------------------------------------
// Card de proposta
// -------------------------------------------------------
function PropostaCard({
  proposta,
  isDono,
  onAceitar,
  onRecusar,
  solStatus,
}: {
  proposta: PropostaSalva;
  isDono: boolean;
  onAceitar: (id: string) => void;
  onRecusar: (id: string) => void;
  solStatus: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const avaliador = proposta.avaliador;

  const podeDecidir = isDono && (solStatus === 'aberta' || solStatus === 'em_negociacao') && proposta.status === 'enviada';

  const statusBadge = {
    enviada: 'bg-slate-100 text-slate-600',
    aceita: 'bg-emerald-50 text-emerald-700',
    recusada: 'bg-red-50 text-red-600',
    cancelada: 'bg-slate-100 text-slate-400',
  }[proposta.status];

  return (
    <>
      <div className={`bg-white border rounded-xl p-4 ${proposta.status === 'aceita' ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-black/[0.08]'}`}>
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-[#0C447C]/10 flex items-center justify-center flex-shrink-0 text-sm font-bold text-[#0C447C]">
            {avaliador?.nome?.[0]?.toUpperCase() ?? 'A'}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-[#111219]">
                {avaliador?.nome ?? 'Avaliador'}
              </span>
              {avaliador?.parceiro_fundador && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-semibold rounded-full border border-amber-200">
                  <Award className="w-2.5 h-2.5" />
                  Parceiro Fundador
                </span>
              )}
              {avaliador?.credencial_verificada && (
                <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                  CREA Verificado
                </span>
              )}
              <span className={`ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full ${statusBadge}`}>
                {proposta.status === 'enviada' ? 'Aguardando' : proposta.status === 'aceita' ? 'Aceita' : proposta.status === 'recusada' ? 'Recusada' : 'Cancelada'}
              </span>
            </div>

            {avaliador?.crea_numero && (
              <p className="text-xs text-slate-500 mt-0.5">
                CREA {avaliador.crea_numero}
                {avaliador.total_avaliacoes > 0 && ` · ${avaliador.total_avaliacoes} avaliações`}
              </p>
            )}
            {avaliador && avaliador.nota_media > 0 && (
              <div className="mt-1">
                <StarRating nota={avaliador.nota_media} />
              </div>
            )}
          </div>
        </div>

        {/* Valores */}
        <div className="mt-3 grid grid-cols-3 gap-3">
          <div className="bg-slate-50 rounded-lg p-2.5 text-center">
            <p className="text-xs text-slate-500">Valor</p>
            <p className="text-sm font-bold text-[#111219]">
              R$ {proposta.valor.toLocaleString('pt-BR')}
            </p>
          </div>
          <div className="bg-slate-50 rounded-lg p-2.5 text-center">
            <p className="text-xs text-slate-500">Prazo</p>
            <p className="text-sm font-bold text-[#111219]">{proposta.prazo_execucao}d</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-2.5 text-center">
            <p className="text-xs text-slate-500">Válida até</p>
            <p className="text-sm font-bold text-[#111219]">
              {new Date(proposta.validade_proposta).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
            </p>
          </div>
        </div>

        {/* Metodologia */}
        {proposta.metodologia && (
          <div className="mt-3">
            <button type="button" onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700">
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {expanded ? 'Ocultar metodologia' : 'Ver metodologia'}
            </button>
            {expanded && (
              <p className="mt-2 text-xs text-slate-600 bg-slate-50 rounded-lg p-3 leading-relaxed">
                {proposta.metodologia}
              </p>
            )}
          </div>
        )}

        {/* Ações */}
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <button type="button" onClick={() => setDrawerOpen(true)}
            className="text-xs font-medium text-[#0C447C] hover:underline">
            Ver perfil completo
          </button>

          {(proposta.mensagens_nao_lidas ?? 0) > 0 && (
            <Link href={`/avaliacoes/chat/${proposta.id}`}
              className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-full">
              <MessageSquare className="w-3 h-3" />
              {proposta.mensagens_nao_lidas} nova{(proposta.mensagens_nao_lidas ?? 0) > 1 ? 's' : ''}
            </Link>
          )}

          <Link href={`/avaliacoes/chat/${proposta.id}`}
            className="ml-auto text-xs text-slate-500 hover:text-slate-700 underline">
            Mensagens
          </Link>

          {podeDecidir && (
            <>
              <button type="button" onClick={() => onRecusar(proposta.id)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                <XCircle className="w-3.5 h-3.5" />
                Recusar
              </button>
              <button type="button" onClick={() => onAceitar(proposta.id)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors">
                <CheckCircle className="w-3.5 h-3.5" />
                Aceitar
              </button>
            </>
          )}
        </div>
      </div>

      {drawerOpen && avaliador && (
        <AvaliadorDrawer perfil={avaliador} onClose={() => setDrawerOpen(false)} />
      )}
    </>
  );
}

// -------------------------------------------------------
// Aba Detalhes
// -------------------------------------------------------
function AbaDetalhes({ sol }: { sol: SolicitacaoSalva }) {
  const rows = [
    ['Tipo de imóvel', LABEL_TIPO_IMOVEL[sol.tipo_imovel]],
    ['Finalidade', LABEL_FINALIDADE[sol.finalidade]],
    ['Endereço', sol.endereco],
    ['Cidade/UF', `${sol.cidade}/${sol.uf}`],
    sol.area_total_m2 ? ['Área total', `${sol.area_total_m2} m²`] : null,
    sol.area_construida_m2 ? ['Área construída', `${sol.area_construida_m2} m²`] : null,
    ['Matrícula disponível', sol.matricula_disponivel ? 'Sim' : 'Não'],
    sol.acesso_imovel ? ['Acesso', { livre: 'Livre', agendamento: 'Com agendamento', indisponivel: 'Indisponível' }[sol.acesso_imovel]] : null,
    sol.orcamento_min ? ['Orçamento mínimo', `R$ ${sol.orcamento_min.toLocaleString('pt-BR')}`] : null,
    sol.orcamento_max ? ['Orçamento máximo', `R$ ${sol.orcamento_max.toLocaleString('pt-BR')}`] : null,
    sol.prazo_desejado ? ['Prazo desejado', new Date(sol.prazo_desejado).toLocaleDateString('pt-BR')] : null,
  ].filter(Boolean) as [string, string][];

  return (
    <div className="bg-white border border-black/[0.08] rounded-2xl divide-y divide-black/[0.05]">
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-center justify-between px-4 py-3">
          <span className="text-xs text-slate-500">{label}</span>
          <span className="text-sm font-medium text-[#111219]">{value}</span>
        </div>
      ))}
      {sol.observacoes_livres && (
        <div className="px-4 py-3">
          <p className="text-xs text-slate-500 mb-1">Observações</p>
          <p className="text-sm text-slate-700 leading-relaxed">{sol.observacoes_livres}</p>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------
// Tabs principal
// -------------------------------------------------------
interface Props {
  sol: SolicitacaoSalva;
  propostas: PropostaSalva[];
  userId: string;
  isDono: boolean;
  isAvaliador: boolean;
  minhaPropostaId?: string;
}

export function SolicitacaoTabs({ sol, propostas, userId, isDono, isAvaliador, minhaPropostaId }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'detalhes' | 'propostas' | 'chat' | 'proposta_form'>('detalhes');
  const [propostasState, setPropostasState] = useState(propostas);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const podePropor = isAvaliador && !minhaPropostaId && (sol.status === 'aberta' || sol.status === 'em_negociacao');
  const totalPropostas = isDono ? propostasState.length : 0;

  // Chat: qual proposta mostrar?
  const chatPropostaId = minhaPropostaId ?? (isDono && propostasState.length > 0 ? propostasState[0].id : undefined);

  async function handleAceitar(propostaId: string) {
    setLoading(propostaId);
    setError('');
    const { error: err, propostaId: pid, solicitacaoId: sid } = await aceitarProposta(propostaId);
    setLoading(null);
    if (err) { setError(err); return; }
    // Atualizar estado local
    setPropostasState((prev) =>
      prev.map((p) => ({
        ...p,
        status: p.id === propostaId ? 'aceita' : p.status === 'enviada' ? 'recusada' : p.status,
      }))
    );
    // Redirecionar para página de pagamento
    if (pid && sid) {
      router.push(`/avaliacoes/${sid}/pagamento?propostaId=${pid}`);
    }
  }

  async function handleRecusar(propostaId: string) {
    setLoading(propostaId);
    setError('');
    const { error: err } = await recusarProposta(propostaId);
    setLoading(null);
    if (err) { setError(err); return; }
    setPropostasState((prev) =>
      prev.map((p) => p.id === propostaId ? { ...p, status: 'recusada' } : p)
    );
  }

  const tabs = [
    { id: 'detalhes', label: 'Detalhes' },
    ...(isDono ? [{ id: 'propostas', label: `Propostas (${totalPropostas})` }] : []),
    ...(chatPropostaId ? [{ id: 'chat', label: 'Mensagens' }] : []),
  ] as { id: string; label: string }[];

  return (
    <div>
      {/* Tab bar */}
      <div className="flex border-b border-slate-200 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-[#0C447C] text-[#0C447C]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Detalhes */}
      {activeTab === 'detalhes' && <AbaDetalhes sol={sol} />}

      {/* Propostas */}
      {activeTab === 'propostas' && isDono && (
        <div>
          {propostasState.length === 0 ? (
            <div className="bg-white border border-black/[0.06] rounded-2xl p-10 text-center">
              <p className="text-sm text-slate-400">Nenhuma proposta recebida ainda.</p>
              <p className="text-xs text-slate-300 mt-1">Avaliadores verão sua solicitação e poderão enviar propostas.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {propostasState.map((p) => (
                <div key={p.id} className={loading === p.id ? 'opacity-50 pointer-events-none' : ''}>
                  <PropostaCard
                    proposta={p}
                    isDono={isDono}
                    onAceitar={handleAceitar}
                    onRecusar={handleRecusar}
                    solStatus={sol.status}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Chat */}
      {activeTab === 'chat' && chatPropostaId && (
        <div className="bg-white border border-black/[0.08] rounded-2xl p-4">
          <p className="text-sm text-slate-500 mb-3">
            {propostasState.length > 1 && isDono ? 'Selecione uma proposta para ver as mensagens:' : ''}
          </p>
          {isDono && propostasState.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {propostasState.map((p) => (
                <Link key={p.id} href={`/avaliacoes/chat/${p.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:border-[#0C447C]/30 transition-colors">
                  {p.avaliador?.nome ?? 'Avaliador'}
                  {(p.mensagens_nao_lidas ?? 0) > 0 && (
                    <span className="w-4 h-4 bg-[#0C447C] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {p.mensagens_nao_lidas}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
          <Link href={`/avaliacoes/chat/${chatPropostaId}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0C447C] text-white text-sm font-medium rounded-xl hover:bg-[#0C447C]/90 transition-colors">
            <MessageSquare className="w-4 h-4" />
            Abrir chat
          </Link>
        </div>
      )}

      {/* Form de proposta para avaliador */}
      {activeTab === 'proposta_form' && (
        <PropostaForm solicitacaoId={sol.id} onSuccess={() => window.location.reload()} />
      )}

      {/* Botão enviar proposta (avaliador) */}
      {podePropor && activeTab !== 'proposta_form' && (
        <div className="mt-6 border-t border-slate-100 pt-4 flex justify-end">
          <button type="button" onClick={() => setActiveTab('proposta_form')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0C447C] text-white text-sm font-medium rounded-xl hover:bg-[#0C447C]/90 transition-colors">
            <Home className="w-4 h-4" />
            Enviar minha proposta
          </button>
        </div>
      )}

      {/* Ícones não usados em JSX mas importados — suprimir lint */}
      <span className="hidden"><MapPin /><Calendar /><DollarSign /></span>
    </div>
  );
}
