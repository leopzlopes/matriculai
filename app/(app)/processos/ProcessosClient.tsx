'use client';

import { useState } from 'react';
import {
  Search, Loader2, AlertTriangle, AlertCircle,
  CheckCircle2, Scale, Hash,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ProcessoCNJ, Movimentacao, ProcessoEnvolvido, ParecerResult } from '@/lib/escavador/types';

type Modo = 'nome' | 'cnj';

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'complete_nome'; processos: ProcessoEnvolvido[]; parecer: ParecerResult }
  | { status: 'complete_cnj'; processo: ProcessoCNJ; movimentacoes: Movimentacao[]; parecer: ParecerResult }
  | { status: 'error'; message: string };

const RISCO_CONFIG = {
  alto: { label: 'Alto Risco', className: 'bg-red-100 text-red-700 border-red-200', Icon: AlertTriangle },
  medio: { label: 'Médio Risco', className: 'bg-yellow-100 text-yellow-700 border-yellow-200', Icon: AlertCircle },
  baixo: { label: 'Baixo Risco', className: 'bg-green-100 text-green-700 border-green-200', Icon: CheckCircle2 },
};

const POLO_LABEL: Record<string, string> = { ativo: 'Autor', passivo: 'Réu' };

function inputClass() {
  return 'flex-1 px-4 py-2.5 rounded-lg border border-black/[0.12] bg-white text-sm text-[#111219] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0C447C]/20 focus:border-[#0C447C] transition-colors';
}

function RiscoBadge({ nivel }: { nivel: 'alto' | 'medio' | 'baixo' }) {
  const cfg = RISCO_CONFIG[nivel];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.className}`}>
      <cfg.Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

export function ProcessosClient() {
  const [modo, setModo] = useState<Modo>('nome');
  const [query, setQuery] = useState('');
  const [state, setState] = useState<State>({ status: 'idle' });

  async function handleBuscar() {
    const q = query.trim();
    if (!q) return;
    setState({ status: 'loading' });

    try {
      if (modo === 'nome') {
        const envolvidoRes = await fetch('/api/escavador/envolvido', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome: q }),
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
          body: JSON.stringify({ tipo: 'envolvido', dados: processos, contexto: q }),
        });
        const parecerData = await parecerRes.json();
        if (!parecerRes.ok) {
          setState({ status: 'error', message: parecerData.error ?? 'Erro ao gerar parecer' });
          return;
        }
        setState({ status: 'complete_nome', processos, parecer: parecerData as ParecerResult });

      } else {
        const processoRes = await fetch('/api/escavador/processo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ numeroCnj: q }),
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
            contexto: q,
          }),
        });
        const parecerData = await parecerRes.json();
        if (!parecerRes.ok) {
          setState({ status: 'error', message: parecerData.error ?? 'Erro ao gerar parecer' });
          return;
        }
        setState({
          status: 'complete_cnj',
          processo: processoData.processo,
          movimentacoes: processoData.movimentacoes,
          parecer: parecerData as ParecerResult,
        });
      }
    } catch {
      setState({ status: 'error', message: 'Erro de conexão. Tente novamente.' });
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleBuscar();
  }

  function handleModoChange(m: Modo) {
    setModo(m);
    setQuery('');
    setState({ status: 'idle' });
  }

  const isLoading = state.status === 'loading';

  return (
    <div className="space-y-6">
      {/* Modo toggle */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        <button
          onClick={() => handleModoChange('nome')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            modo === 'nome' ? 'bg-white text-[#0C447C] shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          Por Nome / CPF
        </button>
        <button
          onClick={() => handleModoChange('cnj')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            modo === 'cnj' ? 'bg-white text-[#0C447C] shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Hash className="w-3.5 h-3.5" />
          Por Número CNJ
        </button>
      </div>

      {/* Search bar */}
      <div className="flex gap-2">
        <input
          type="text"
          className={inputClass()}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            modo === 'nome'
              ? 'Nome completo ou CPF da pessoa...'
              : 'Ex: 1234567-89.2023.8.26.0100'
          }
          disabled={isLoading}
        />
        <button
          onClick={handleBuscar}
          disabled={isLoading || !query.trim()}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#0C447C] text-white hover:bg-[#0C447C]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          {isLoading ? 'Consultando...' : 'Consultar'}
        </button>
      </div>

      {/* Error */}
      {state.status === 'error' && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {state.message}
        </div>
      )}

      {/* Result: Nome */}
      {state.status === 'complete_nome' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Scale className="w-4 h-4" />
                  Processos encontrados
                </span>
                <span className="text-xs font-normal text-slate-500">
                  {state.processos.length} processo{state.processos.length !== 1 ? 's' : ''}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {state.processos.length === 0 ? (
                <p className="text-sm text-slate-500 py-4 text-center">Nenhum processo encontrado para este nome.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="text-left px-3 py-2 font-semibold text-slate-400 uppercase tracking-wide">Processo</th>
                        <th className="text-left px-3 py-2 font-semibold text-slate-400 uppercase tracking-wide">Tribunal</th>
                        <th className="text-left px-3 py-2 font-semibold text-slate-400 uppercase tracking-wide">Polo</th>
                        <th className="text-left px-3 py-2 font-semibold text-slate-400 uppercase tracking-wide">Situação</th>
                        <th className="text-left px-3 py-2 font-semibold text-slate-400 uppercase tracking-wide">Início</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/[0.04]">
                      {state.processos.map((p, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="px-3 py-2 font-mono text-[#111219]">{p.numero_cnj}</td>
                          <td className="px-3 py-2 text-slate-600">{p.tribunal?.sigla ?? '—'}</td>
                          <td className="px-3 py-2">
                            <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                              p.polo === 'passivo' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                            }`}>
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
            </CardContent>
          </Card>

          <ParecerCard parecer={state.parecer} />
        </div>
      )}

      {/* Result: CNJ */}
      {state.status === 'complete_cnj' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span className="font-mono text-sm">{state.processo.numero_cnj}</span>
                {state.processo.situacao && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-700 font-sans">
                    {state.processo.situacao}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {state.processo.tribunal && (
                <p className="text-xs text-slate-500">
                  {state.processo.tribunal.sigla} — {state.processo.tribunal.nome}
                </p>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Polo Ativo</p>
                  <p className="text-sm font-medium text-[#111219]">{state.processo.titulo_polo_ativo || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Polo Passivo</p>
                  <p className="text-sm font-medium text-[#111219]">{state.processo.titulo_polo_passivo || '—'}</p>
                </div>
              </div>

              {state.movimentacoes.length > 0 && (
                <div>
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
            </CardContent>
          </Card>

          <ParecerCard parecer={state.parecer} />
        </div>
      )}
    </div>
  );
}

function ParecerCard({ parecer }: { parecer: ParecerResult }) {
  return (
    <Card className="border-2" style={{
      borderColor:
        parecer.nivel_risco === 'alto' ? '#fca5a5' :
        parecer.nivel_risco === 'medio' ? '#fde68a' : '#86efac',
    }}>
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <span>Parecer IA</span>
          <RiscoBadge nivel={parecer.nivel_risco} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{parecer.parecer}</p>
        <p className="text-xs text-slate-400 italic pt-2 border-t">
          Minuta gerada por IA — revisar antes de uso oficial
        </p>
      </CardContent>
    </Card>
  );
}
