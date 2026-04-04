'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos status' },
  { value: 'completed', label: 'Concluída' },
  { value: 'processing', label: 'Processando' },
  { value: 'pending', label: 'Pendente' },
  { value: 'error', label: 'Erro' },
];

const RISK_OPTIONS = [
  { value: 'all', label: 'Todos os riscos' },
  { value: 'high', label: 'Alto Risco (≥66)' },
  { value: 'medium', label: 'Médio Risco (33-65)' },
  { value: 'low', label: 'Baixo Risco (<33)' },
];

export function AnalysesFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('q') ?? '');
  const status = searchParams.get('status') ?? 'all';
  const risk = searchParams.get('risk') ?? 'all';

  const updateParams = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v === 'all' || v === '') params.delete(k);
      else params.set(k, v);
    }
    params.delete('page');
    router.push(`/admin/analises?${params.toString()}`);
  }, [router, searchParams]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateParams({ q: search });
  }

  function clearFilters() {
    setSearch('');
    router.push('/admin/analises');
  }

  const hasFilters = status !== 'all' || risk !== 'all' || search;

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 min-w-52">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por imóvel ou matrícula..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-black/[0.12] bg-white text-sm text-[#111219] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0C447C]/30 focus:border-[#0C447C] transition-colors"
          />
        </div>
      </form>

      <select
        value={status}
        onChange={e => updateParams({ status: e.target.value })}
        className="px-3 py-2 rounded-xl border border-black/[0.12] bg-white text-sm text-[#111219] focus:outline-none focus:ring-2 focus:ring-[#0C447C]/30 focus:border-[#0C447C]"
      >
        {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      <select
        value={risk}
        onChange={e => updateParams({ risk: e.target.value })}
        className="px-3 py-2 rounded-xl border border-black/[0.12] bg-white text-sm text-[#111219] focus:outline-none focus:ring-2 focus:ring-[#0C447C]/30 focus:border-[#0C447C]"
      >
        {RISK_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      {hasFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Limpar
        </button>
      )}
    </div>
  );
}
