import Link from 'next/link';
import { ClipboardList, Plus, MapPin, Calendar, DollarSign, Clock, ArrowRight, Star } from 'lucide-react';
import { getMySolicitacoes, getSolicitacoesAbertas } from '@/lib/actions/avaliacoes';
import { getProfileData } from '@/lib/actions/profile';
import {
  LABEL_TIPO_IMOVEL,
  LABEL_FINALIDADE,
  LABEL_STATUS,
  STATUS_COLOR,
  type SolicitacaoSalva,
} from '@/lib/avaliacoes/types';

// -------------------------------------------------------
// Stepper visual de status para clientes
// -------------------------------------------------------
const STEPS = ['aberta', 'em_negociacao', 'contratada', 'concluida'] as const;
const STEP_LABEL: Record<string, string> = {
  aberta: 'Aberta',
  em_negociacao: 'Negociando',
  contratada: 'Contratada',
  concluida: 'Concluída',
};

function StatusStepper({ status }: { status: string }) {
  const currentIdx = STEPS.indexOf(status as (typeof STEPS)[number]);
  if (currentIdx === -1) return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[status as keyof typeof STATUS_COLOR] ?? 'bg-slate-100 text-slate-600'}`}>
      {LABEL_STATUS[status as keyof typeof LABEL_STATUS] ?? status}
    </span>
  );
  return (
    <div className="flex items-center gap-1">
      {STEPS.map((step, idx) => (
        <div key={step} className="flex items-center">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
            idx < currentIdx ? 'bg-[#0C447C] text-white' :
            idx === currentIdx ? 'bg-[#0C447C]/20 text-[#0C447C] ring-2 ring-[#0C447C]/30' :
            'bg-slate-100 text-slate-400'
          }`}>
            {idx < currentIdx ? '✓' : idx + 1}
          </div>
          {idx < STEPS.length - 1 && (
            <div className={`w-4 h-0.5 ${idx < currentIdx ? 'bg-[#0C447C]' : 'bg-slate-200'}`} />
          )}
        </div>
      ))}
      <span className="ml-1 text-xs text-slate-500">{STEP_LABEL[status]}</span>
    </div>
  );
}

// -------------------------------------------------------
// Tempo relativo
// -------------------------------------------------------
function tempoRelativo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h}h`;
  const d = Math.floor(h / 24);
  return `há ${d}d`;
}

// -------------------------------------------------------
// Dashboard do Avaliador
// -------------------------------------------------------
async function AvaliadoresDashboard() {
  const solicitacoes = await getSolicitacoesAbertas();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#111219]">Solicitações Abertas</h1>
          <p className="text-sm text-slate-500 mt-0.5">Envie sua proposta nas avaliações disponíveis</p>
        </div>
        <Link
          href="/perfil/avaliador"
          className="text-xs text-[#0C447C] hover:underline"
        >
          Editar meu perfil
        </Link>
      </div>

      {solicitacoes.length === 0 ? (
        <div className="bg-white border border-black/[0.06] rounded-2xl p-12 text-center">
          <ClipboardList className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Nenhuma solicitação aberta no momento.</p>
          <p className="text-xs text-slate-400 mt-1">Verifique novamente em breve.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {solicitacoes.map((sol) => (
            <SolicitacaoCard key={sol.id} sol={sol} showPropostaBtn />
          ))}
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------
// Dashboard do Cliente
// -------------------------------------------------------
async function ClienteDashboard() {
  const solicitacoes = await getMySolicitacoes();

  const abertas = solicitacoes.filter((s) => s.status === 'aberta').length;
  const negociando = solicitacoes.filter((s) => s.status === 'em_negociacao').length;
  const contratadas = solicitacoes.filter((s) => s.status === 'contratada').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#111219]">Minhas Solicitações</h1>
          <p className="text-sm text-slate-500 mt-0.5">Gerencie suas solicitações de avaliação</p>
        </div>
        <Link
          href="/avaliacoes/nova"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0C447C] text-white text-sm font-medium rounded-xl hover:bg-[#0C447C]/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Solicitação
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Abertas', value: abertas, color: 'text-emerald-600' },
          { label: 'Negociando', value: negociando, color: 'text-amber-600' },
          { label: 'Contratadas', value: contratadas, color: 'text-blue-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-black/[0.06] rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {solicitacoes.length === 0 ? (
        <div className="bg-white border border-black/[0.06] rounded-2xl p-12 text-center">
          <ClipboardList className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Você ainda não fez nenhuma solicitação.</p>
          <Link
            href="/avaliacoes/nova"
            className="inline-flex items-center gap-1.5 mt-4 text-sm text-[#0C447C] font-medium hover:underline"
          >
            <Plus className="w-4 h-4" />
            Criar primeira solicitação
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {solicitacoes.map((sol) => (
            <SolicitacaoCard key={sol.id} sol={sol} showStepper />
          ))}
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------
// Card de solicitação (compartilhado)
// -------------------------------------------------------
function SolicitacaoCard({
  sol,
  showPropostaBtn,
  showStepper,
}: {
  sol: SolicitacaoSalva;
  showPropostaBtn?: boolean;
  showStepper?: boolean;
}) {
  const orcamento =
    sol.orcamento_min && sol.orcamento_max
      ? `R$ ${sol.orcamento_min.toLocaleString('pt-BR')} – ${sol.orcamento_max.toLocaleString('pt-BR')}`
      : sol.orcamento_min
      ? `A partir de R$ ${sol.orcamento_min.toLocaleString('pt-BR')}`
      : 'A negociar';

  return (
    <Link
      href={`/avaliacoes/${sol.id}`}
      className="block bg-white border border-black/[0.08] rounded-2xl p-5 hover:border-[#0C447C]/20 hover:shadow-sm transition-all group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-[#111219]">
              {LABEL_TIPO_IMOVEL[sol.tipo_imovel]}
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500">{LABEL_FINALIDADE[sol.finalidade]}</span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            {sol.cidade}/{sol.uf}
            {sol.area_total_m2 && (
              <span className="text-slate-400 ml-1">· {sol.area_total_m2} m²</span>
            )}
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#0C447C] transition-colors flex-shrink-0 mt-0.5" />
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
        <span className="flex items-center gap-1">
          <DollarSign className="w-3 h-3" />
          {orcamento}
        </span>
        {sol.prazo_desejado && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Prazo: {new Date(sol.prazo_desejado).toLocaleDateString('pt-BR')}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {tempoRelativo(sol.created_at)}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between">
        {showStepper && <StatusStepper status={sol.status} />}
        {!showStepper && (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[sol.status]}`}>
            {LABEL_STATUS[sol.status]}
          </span>
        )}
        {showPropostaBtn && (
          <span className="text-xs font-medium text-[#0C447C] group-hover:underline">
            Enviar proposta →
          </span>
        )}
      </div>
    </Link>
  );
}

// -------------------------------------------------------
// Page (Server Component)
// -------------------------------------------------------
export default async function AvaliacoesPage() {
  const profile = await getProfileData();
  const isAvaliador = profile?.tipo_usuario === 'avaliador';

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {isAvaliador ? <AvaliadoresDashboard /> : <ClienteDashboard />}
    </div>
  );
}

// Suprimir warning de importação não usada
export { Star };
