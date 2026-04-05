'use client';

import { useState } from 'react';
import { Gavel, Search, Loader2, AlertTriangle, AlertCircle, CheckCircle2, FileSearch } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { extractCNJ } from '@/lib/escavador/cnj';
import type { Encumbrance } from '@/lib/ai/types';
import type { Owner } from '@/lib/ai/types';
import type { ProcessoCNJ, Movimentacao, ProcessoEnvolvido, ParecerResult } from '@/lib/escavador/types';

interface ProcessoMatricula {
  numeroCnj: string;
  processo: ProcessoCNJ;
  movimentacoes: Movimentacao[];
}

interface ProcessoProprietario {
  nome: string;
  processos: ProcessoEnvolvido[];
}

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'complete'; processosMatricula: ProcessoMatricula[]; processosProprietarios: ProcessoProprietario[]; parecer: ParecerResult }
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

interface ProcessosJudiciaisTabProps {
  encumbrances?: Encumbrance[];
  owners?: Owner[];
  onRiskResult: (nivel: 'alto' | 'medio' | 'baixo') => void;
  contexto?: string;
}

export function ProcessosJudiciaisTab({ encumbrances, owners, onRiskResult, contexto }: ProcessosJudiciaisTabProps) {
  const [state, setState] = useState<State>({ status: 'idle' });

  async function handleConsultar() {
    setState({ status: 'loading' });

    try {
      // Extract CNJs from encumbrances
      const cnjs: string[] = [];
      if (encumbrances) {
        for (const enc of encumbrances) {
          const cnj = extractCNJ(enc.descricao) ?? extractCNJ(enc.numeroRegistro);
          if (cnj && !cnjs.includes(cnj)) cnjs.push(cnj);
        }
      }

      // Extract owner names
      const nomes: string[] = owners?.map((o) => o.nome).filter(Boolean) ?? [];

      // Fetch processos da matrícula (parallel)
      const processosMatricula: ProcessoMatricula[] = [];
      await Promise.all(
        cnjs.map(async (numeroCnj) => {
          const res = await fetch('/api/escavador/processo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ numeroCnj }),
          });
          if (res.ok) {
            const data = await res.json();
            processosMatricula.push({ numeroCnj, processo: data.processo, movimentacoes: data.movimentacoes });
          }
        })
      );

      // Fetch processos dos proprietários (parallel)
      const processosProprietarios: ProcessoProprietario[] = [];
      await Promise.all(
        nomes.map(async (nome) => {
          const res = await fetch('/api/escavador/envolvido', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome }),
          });
          if (res.ok) {
            const data = await res.json();
            processosProprietarios.push({ nome, processos: data.processos ?? [] });
          } else {
            processosProprietarios.push({ nome, processos: [] });
          }
        })
      );

      // Generate consolidated parecer
      const parecerRes = await fetch('/api/escavador/parecer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'consolidado',
          dados: { processos_matricula: processosMatricula, processos_proprietarios: processosProprietarios },
          contexto: contexto ?? 'Matrícula do imóvel',
        }),
      });

      const parecerData = await parecerRes.json();
      if (!parecerRes.ok) {
        setState({ status: 'error', message: parecerData.error ?? 'Erro ao gerar parecer' });
        return;
      }

      const parecer = parecerData as ParecerResult;
      onRiskResult(parecer.nivel_risco);
      setState({ status: 'complete', processosMatricula, processosProprietarios, parecer });
    } catch {
      setState({ status: 'error', message: 'Erro de conexão. Tente novamente.' });
    }
  }

  if (state.status === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <Gavel className="w-10 h-10 text-slate-300" />
        <div className="text-center">
          <p className="text-slate-700 font-medium mb-1">Consulta Judicial Consolidada</p>
          <p className="text-sm text-slate-500 mb-4">
            Pesquisa processos vinculados aos ônus da matrícula e aos proprietários em uma única consulta.
          </p>
        </div>
        <button
          onClick={handleConsultar}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#0C447C] text-white hover:bg-[#0C447C]/90 transition-colors"
        >
          <Search className="w-4 h-4" />
          Consultar Processos Judiciais
        </button>
      </div>
    );
  }

  if (state.status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-[#0C447C]" />
        <p className="text-sm">Consultando processos judiciais...</p>
        <p className="text-xs text-slate-400">Isso pode levar alguns segundos</p>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 max-w-md text-center">
          {state.message}
        </div>
        <button
          onClick={() => setState({ status: 'idle' })}
          className="text-sm text-slate-500 hover:text-slate-700 underline"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  const { processosMatricula, processosProprietarios, parecer } = state;
  const riscoCfg = RISCO_CONFIG[parecer.nivel_risco];

  return (
    <div className="space-y-6">
      {/* Seção A — Processos da Matrícula */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileSearch className="w-4 h-4" />
            Processos da Matrícula
            <span className="ml-auto text-xs font-normal text-slate-500">
              {processosMatricula.length} processo{processosMatricula.length !== 1 ? 's' : ''} identificado{processosMatricula.length !== 1 ? 's' : ''}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {processosMatricula.length === 0 ? (
            <p className="text-sm text-slate-500 py-4 text-center">
              Nenhum número de processo (CNJ) identificado nos ônus desta matrícula.
            </p>
          ) : (
            <div className="space-y-4">
              {processosMatricula.map((pm, i) => (
                <div key={i} className="border rounded-lg overflow-hidden">
                  {/* Cabeçalho processo */}
                  <div className="px-4 py-3 bg-slate-50 border-b flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#111219] font-mono">{pm.processo.numero_cnj}</p>
                      {pm.processo.tribunal && (
                        <p className="text-xs text-slate-500 mt-0.5">{pm.processo.tribunal.sigla} — {pm.processo.tribunal.nome}</p>
                      )}
                    </div>
                    {pm.processo.situacao && (
                      <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-700">
                        {pm.processo.situacao}
                      </span>
                    )}
                  </div>
                  {/* Partes */}
                  <div className="px-4 py-3 grid grid-cols-2 gap-3 border-b">
                    <div>
                      <p className="text-xs text-slate-400 mb-0.5">Polo Ativo</p>
                      <p className="text-xs font-medium text-[#111219]">{pm.processo.titulo_polo_ativo || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-0.5">Polo Passivo</p>
                      <p className="text-xs font-medium text-[#111219]">{pm.processo.titulo_polo_passivo || '—'}</p>
                    </div>
                  </div>
                  {/* Movimentações */}
                  {pm.movimentacoes.length > 0 && (
                    <div className="px-4 py-3">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Últimas movimentações</p>
                      <div className="space-y-1.5">
                        {pm.movimentacoes.map((mov, j) => (
                          <div key={j} className="flex gap-2 text-xs">
                            <span className="text-slate-400 flex-shrink-0 w-20">{mov.data}</span>
                            <span className="text-[#111219]">{mov.descricao}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Seção B — Processos dos Proprietários */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Gavel className="w-4 h-4" />
            Processos dos Proprietários
          </CardTitle>
        </CardHeader>
        <CardContent>
          {processosProprietarios.length === 0 ? (
            <p className="text-sm text-slate-500 py-4 text-center">Nenhum proprietário identificado.</p>
          ) : (
            <div className="space-y-5">
              {processosProprietarios.map((pp, i) => (
                <div key={i}>
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm font-semibold text-[#111219]">{pp.nome}</p>
                    <span className="text-xs text-slate-500">
                      {pp.processos.length} processo{pp.processos.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {pp.processos.length === 0 ? (
                    <p className="text-xs text-slate-400 pl-2">Nenhum processo encontrado.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs border rounded-lg overflow-hidden">
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
                          {pp.processos.map((p, j) => (
                            <tr key={j} className="hover:bg-slate-50/50">
                              <td className="px-3 py-2 font-mono text-[#111219]">{p.numero_cnj}</td>
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
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Seção C — Parecer Consolidado */}
      <Card className="border-2" style={{ borderColor: parecer.nivel_risco === 'alto' ? '#fca5a5' : parecer.nivel_risco === 'medio' ? '#fde68a' : '#86efac' }}>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <riscoCfg.Icon className="w-4 h-4" />
            Parecer Judicial Consolidado
            <span className={`ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${riscoCfg.className}`}>
              <riscoCfg.Icon className="w-3 h-3" />
              {riscoCfg.label}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {parecer.resumo_riscos && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Resumo dos Riscos</p>
              <p className="text-sm text-slate-700">{parecer.resumo_riscos}</p>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Parecer</p>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{parecer.parecer}</p>
          </div>

          {parecer.impacto_negociabilidade && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Impacto na Negociabilidade</p>
              <p className="text-sm text-slate-700">{parecer.impacto_negociabilidade}</p>
            </div>
          )}

          {parecer.recomendacoes && parecer.recomendacoes.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Recomendações</p>
              <ul className="space-y-1">
                {parecer.recomendacoes.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-slate-400 flex-shrink-0 mt-0.5">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-xs text-slate-400 italic pt-2 border-t">Minuta gerada por IA — revisar antes de uso oficial</p>
        </CardContent>
      </Card>
    </div>
  );
}
