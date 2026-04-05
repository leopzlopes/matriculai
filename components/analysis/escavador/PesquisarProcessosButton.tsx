'use client';

import { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Loader2, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { ProcessoEnvolvido, ParecerResult } from '@/lib/escavador/types';

interface PesquisarProcessosButtonProps {
  nomeProprietario: string;
}

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'open'; processos: ProcessoEnvolvido[]; parecer: ParecerResult }
  | { status: 'error'; message: string };

const RISCO_CONFIG = {
  alto: { label: 'Alto Risco', className: 'bg-red-100 text-red-700 border-red-200', Icon: AlertTriangle },
  medio: { label: 'Médio Risco', className: 'bg-yellow-100 text-yellow-700 border-yellow-200', Icon: AlertCircle },
  baixo: { label: 'Baixo Risco', className: 'bg-green-100 text-green-700 border-green-200', Icon: CheckCircle2 },
};

const POLO_LABEL: Record<string, string> = {
  ativo: 'Autor',
  passivo: 'Réu',
};

export function PesquisarProcessosButton({ nomeProprietario }: PesquisarProcessosButtonProps) {
  const [state, setState] = useState<State>({ status: 'idle' });

  async function handleClick() {
    if (state.status === 'open') {
      setState({ status: 'idle' });
      return;
    }

    setState({ status: 'loading' });
    try {
      const envolvidoRes = await fetch('/api/escavador/envolvido', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nomeProprietario }),
      });

      const envolvidoData = await envolvidoRes.json();
      if (!envolvidoRes.ok) {
        setState({ status: 'error', message: envolvidoData.error ?? 'Erro ao pesquisar processos' });
        return;
      }

      const processos: ProcessoEnvolvido[] = envolvidoData.processos ?? [];

      const parecerRes = await fetch('/api/escavador/parecer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'envolvido',
          dados: processos,
          contexto: nomeProprietario,
        }),
      });

      const parecerData = await parecerRes.json();
      if (!parecerRes.ok) {
        setState({ status: 'error', message: parecerData.error ?? 'Erro ao gerar parecer' });
        return;
      }

      setState({ status: 'open', processos, parecer: parecerData });
    } catch {
      setState({ status: 'error', message: 'Erro de conexão. Tente novamente.' });
    }
  }

  const isLoading = state.status === 'loading';
  const isOpen = state.status === 'open';

  return (
    <div className="mt-2">
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
        {isLoading ? 'Pesquisando...' : 'Pesquisar Processos'}
        {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : !isLoading && <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {state.status === 'error' && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          {state.message}
        </div>
      )}

      {state.status === 'open' && (
        <div className="mt-3 border border-black/[0.08] rounded-xl overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-slate-50 border-b border-black/[0.06] flex items-center justify-between">
            <p className="text-xs font-semibold text-[#111219]">
              {state.processos.length} processo{state.processos.length !== 1 ? 's' : ''} encontrado{state.processos.length !== 1 ? 's' : ''}
            </p>
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

          {/* Tabela de processos */}
          {state.processos.length > 0 && (
            <div className="border-b border-black/[0.06] overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="text-left px-4 py-2 font-semibold text-slate-400 uppercase tracking-wide">Processo</th>
                    <th className="text-left px-3 py-2 font-semibold text-slate-400 uppercase tracking-wide">Tribunal</th>
                    <th className="text-left px-3 py-2 font-semibold text-slate-400 uppercase tracking-wide">Polo</th>
                    <th className="text-left px-3 py-2 font-semibold text-slate-400 uppercase tracking-wide">Situação</th>
                    <th className="text-left px-3 py-2 font-semibold text-slate-400 uppercase tracking-wide">Início</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04]">
                  {state.processos.map((p, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="px-4 py-2 font-mono text-[#111219]">{p.numero_cnj}</td>
                      <td className="px-3 py-2 text-slate-600">{p.tribunal?.sigla ?? '—'}</td>
                      <td className="px-3 py-2">
                        <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${p.polo === 'passivo' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                          {POLO_LABEL[p.polo] ?? p.polo}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-600">{p.situacao ?? '—'}</td>
                      <td className="px-3 py-2 text-slate-500">{p.data_inicio ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {state.processos.length === 0 && (
            <div className="px-4 py-6 text-center text-xs text-slate-400">
              Nenhum processo encontrado para este nome.
            </div>
          )}

          {/* Parecer Claude */}
          <div className="px-4 py-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Parecer IA</p>
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{state.parecer.parecer}</p>
            <p className="text-xs text-slate-400 mt-2 italic">Minuta gerada por IA — revisar antes de uso oficial</p>
          </div>
        </div>
      )}
    </div>
  );
}
