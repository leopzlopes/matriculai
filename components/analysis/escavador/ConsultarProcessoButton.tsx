'use client';

import { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Loader2, AlertTriangle, AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react';
import type { ProcessoCNJ, Movimentacao, ParecerResult } from '@/lib/escavador/types';

interface ConsultarProcessoButtonProps {
  numeroCnj: string;
  contexto: string;
}

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'open'; processo: ProcessoCNJ; movimentacoes: Movimentacao[]; parecer: ParecerResult }
  | { status: 'error'; message: string };

const RISCO_CONFIG = {
  alto: { label: 'Alto Risco', className: 'bg-red-100 text-red-700 border-red-200', Icon: AlertTriangle },
  medio: { label: 'Médio Risco', className: 'bg-yellow-100 text-yellow-700 border-yellow-200', Icon: AlertCircle },
  baixo: { label: 'Baixo Risco', className: 'bg-green-100 text-green-700 border-green-200', Icon: CheckCircle2 },
};

export function ConsultarProcessoButton({ numeroCnj, contexto }: ConsultarProcessoButtonProps) {
  const [state, setState] = useState<State>({ status: 'idle' });

  async function handleClick() {
    if (state.status === 'open') {
      setState({ status: 'idle' });
      return;
    }

    setState({ status: 'loading' });
    try {
      const processoRes = await fetch('/api/escavador/processo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numeroCnj }),
      });

      const processoData = await processoRes.json();
      if (!processoRes.ok) {
        setState({ status: 'error', message: processoData.error ?? 'Erro ao consultar processo' });
        return;
      }

      const parecerRes = await fetch('/api/escavador/parecer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'processo',
          dados: { processo: processoData.processo, movimentacoes: processoData.movimentacoes },
          contexto,
        }),
      });

      const parecerData = await parecerRes.json();
      if (!parecerRes.ok) {
        setState({ status: 'error', message: parecerData.error ?? 'Erro ao gerar parecer' });
        return;
      }

      setState({
        status: 'open',
        processo: processoData.processo,
        movimentacoes: processoData.movimentacoes,
        parecer: parecerData,
      });
    } catch {
      setState({ status: 'error', message: 'Erro de conexão. Tente novamente.' });
    }
  }

  const isLoading = state.status === 'loading';
  const isOpen = state.status === 'open';

  return (
    <div className="mt-3">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0C447C]/8 text-[#0C447C] border border-[#0C447C]/20 hover:bg-[#0C447C]/15 transition-colors disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Search className="w-3.5 h-3.5" />
        )}
        {isLoading ? 'Consultando...' : 'Consultar Processo'}
        {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : !isLoading && <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      <p className="text-xs text-slate-400 mt-1">CNJ: <span className="font-mono">{numeroCnj}</span></p>

      {state.status === 'error' && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          {state.message}
        </div>
      )}

      {state.status === 'open' && (
        <div className="mt-3 border border-black/[0.08] rounded-xl overflow-hidden">
          {/* Header processo */}
          <div className="px-4 py-3 bg-slate-50 border-b border-black/[0.06]">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#111219] font-mono truncate">{state.processo.numero_cnj}</p>
                {state.processo.tribunal && (
                  <p className="text-xs text-slate-500 mt-0.5">{state.processo.tribunal.sigla} — {state.processo.tribunal.nome}</p>
                )}
              </div>
              {state.processo.situacao && (
                <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-700">
                  {state.processo.situacao}
                </span>
              )}
            </div>
          </div>

          {/* Partes */}
          <div className="px-4 py-3 grid grid-cols-2 gap-3 border-b border-black/[0.06]">
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Polo Ativo</p>
              <p className="text-xs font-medium text-[#111219]">{state.processo.titulo_polo_ativo || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Polo Passivo</p>
              <p className="text-xs font-medium text-[#111219]">{state.processo.titulo_polo_passivo || '—'}</p>
            </div>
          </div>

          {/* Movimentações */}
          {state.movimentacoes.length > 0 && (
            <div className="px-4 py-3 border-b border-black/[0.06]">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Últimas movimentações</p>
              <div className="space-y-2">
                {state.movimentacoes.map((mov, i) => (
                  <div key={i} className="flex gap-2 text-xs">
                    <span className="text-slate-400 flex-shrink-0 w-20">{mov.data}</span>
                    <span className="text-[#111219]">{mov.descricao}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Parecer Claude */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Parecer IA</p>
              {(() => {
                const cfg = RISCO_CONFIG[state.parecer.nivel_risco];
                return (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.className}`}>
                    <cfg.Icon className="w-3 h-3" />
                    {cfg.label}
                  </span>
                );
              })()}
            </div>
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{state.parecer.parecer}</p>
            <p className="text-xs text-slate-400 mt-2 italic">Minuta gerada por IA — revisar antes de uso oficial</p>
          </div>
        </div>
      )}
    </div>
  );
}
