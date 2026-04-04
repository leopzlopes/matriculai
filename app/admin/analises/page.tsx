import { getAllAnalyses } from '@/lib/actions/admin';
import { getRiskColor, getRiskLabel } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FileText, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { AnalysesFilters } from './AnalysesFilters';

const PAGE_SIZE = 20;

function riskParamToRange(risk?: string): { minRisk?: number; maxRisk?: number } {
  if (risk === 'high') return { minRisk: 66 };
  if (risk === 'medium') return { minRisk: 33, maxRisk: 65 };
  if (risk === 'low') return { maxRisk: 32 };
  return {};
}

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; risk?: string; page?: string }>;
}

export default async function AdminAnalises({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? '1', 10));
  const offset = (page - 1) * PAGE_SIZE;
  const riskRange = riskParamToRange(params.risk);

  const { analyses, total } = await getAllAnalyses({
    search: params.q,
    status: params.status,
    ...riskRange,
    limit: PAGE_SIZE,
    offset,
  });

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#111219]">Análises</h1>
        <p className="text-sm text-slate-400 mt-1">{total} análise{total !== 1 ? 's' : ''} encontrada{total !== 1 ? 's' : ''}</p>
      </div>

      <Suspense>
        <AnalysesFilters />
      </Suspense>

      <div className="bg-white rounded-xl border border-black/[0.08] shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 items-center px-6 py-3 bg-slate-50 border-b border-black/[0.06] text-xs font-semibold text-slate-400 uppercase tracking-wide">
          <span className="w-8" />
          <span>Imóvel</span>
          <span className="w-36">Usuário</span>
          <span className="w-28 text-center">Data</span>
          <span className="w-20 text-right">Score</span>
        </div>

        {analyses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <FileText className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-sm">Nenhuma análise encontrada</p>
          </div>
        ) : (
          <div className="divide-y divide-black/[0.04]">
            {analyses.map(a => (
              <Link
                key={a.id}
                href={`/analysis/${a.id}`}
                className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 items-center px-6 py-3.5 hover:bg-slate-50 transition-colors group"
              >
                <div className="w-8 h-8 bg-[#0C447C]/8 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-3.5 h-3.5 text-[#0C447C]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#111219] truncate">{a.propertyName}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Mat. {a.registrationNumber}</p>
                </div>
                <span className="w-36 text-xs text-slate-400 truncate">{a.userEmail}</span>
                <span className="w-28 text-center text-xs text-slate-400">
                  {format(new Date(a.createdAt), 'dd/MM/yy HH:mm', { locale: ptBR })}
                </span>
                <div className="w-20 flex items-center justify-end gap-1.5">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold text-white ${getRiskColor(a.riskScore)}`}>
                    {a.riskScore}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#0C447C] transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-black/[0.06]">
            <span className="text-xs text-slate-400">
              Página {page} de {totalPages} · {total} resultados
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/analises?${new URLSearchParams({ ...params, page: String(page - 1) }).toString()}`}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 border border-black/[0.12] hover:bg-slate-50 transition-colors"
                >
                  ← Anterior
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/analises?${new URLSearchParams({ ...params, page: String(page + 1) }).toString()}`}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#0C447C] border border-[#0C447C]/30 hover:bg-[#0C447C]/5 transition-colors"
                >
                  Próxima →
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
