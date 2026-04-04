import { getAdminStats, getAllAnalyses } from '@/lib/actions/admin';
import { getRiskColor, getRiskLabel } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Users, FileText, TrendingUp, Calendar } from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboard() {
  const [stats, { analyses }] = await Promise.all([
    getAdminStats(),
    getAllAnalyses({ limit: 10 }),
  ]);

  const planBreakdown = [
    { label: 'Freemium', count: stats.freemiumUsers, color: 'bg-slate-400', pct: stats.totalUsers ? Math.round((stats.freemiumUsers / stats.totalUsers) * 100) : 0 },
    { label: 'Standard', count: stats.standardUsers, color: 'bg-[#0C447C]', pct: stats.totalUsers ? Math.round((stats.standardUsers / stats.totalUsers) * 100) : 0 },
    { label: 'Admin', count: stats.adminUsers, color: 'bg-indigo-500', pct: stats.totalUsers ? Math.round((stats.adminUsers / stats.totalUsers) * 100) : 0 },
  ];

  const riskBreakdown = [
    { label: 'Alto Risco', count: stats.highRisk, color: 'bg-red-500' },
    { label: 'Médio Risco', count: stats.mediumRisk, color: 'bg-amber-400' },
    { label: 'Baixo Risco', count: stats.lowRisk, color: 'bg-green-500' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#111219]">Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">Visão geral do produto</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Usuários', value: stats.totalUsers, icon: Users, sub: `${stats.standardUsers} standard` },
          { label: 'Total de Análises', value: stats.totalAnalyses, icon: FileText, sub: 'desde o início' },
          { label: 'Análises este mês', value: stats.analysesThisMonth, icon: Calendar, sub: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) },
          { label: 'Conversão', value: `${stats.totalUsers ? Math.round((stats.standardUsers / stats.totalUsers) * 100) : 0}%`, icon: TrendingUp, sub: 'freemium → standard' },
        ].map(({ label, value, icon: Icon, sub }) => (
          <div key={label} className="bg-white rounded-xl border border-black/[0.08] shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</span>
              <div className="w-8 h-8 bg-[#0C447C]/8 rounded-lg flex items-center justify-center">
                <Icon className="w-4 h-4 text-[#0C447C]" />
              </div>
            </div>
            <p className="text-3xl font-bold text-[#111219]">{value}</p>
            <p className="text-xs text-slate-400 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Plan breakdown */}
        <div className="bg-white rounded-xl border border-black/[0.08] shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6">
          <h2 className="text-sm font-semibold text-[#111219] mb-4">Distribuição de Planos</h2>
          <div className="space-y-3">
            {planBreakdown.map(({ label, count, color, pct }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-600">{label}</span>
                  <span className="text-sm font-semibold text-[#111219]">{count} <span className="text-slate-400 font-normal">({pct}%)</span></span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk breakdown */}
        <div className="bg-white rounded-xl border border-black/[0.08] shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6">
          <h2 className="text-sm font-semibold text-[#111219] mb-4">Distribuição de Risco (análises concluídas)</h2>
          <div className="space-y-3">
            {riskBreakdown.map(({ label, count, color }) => {
              const total = stats.highRisk + stats.mediumRisk + stats.lowRisk;
              const pct = total ? Math.round((count / total) * 100) : 0;
              return (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-600">{label}</span>
                    <span className="text-sm font-semibold text-[#111219]">{count} <span className="text-slate-400 font-normal">({pct}%)</span></span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent analyses */}
      <div className="bg-white rounded-xl border border-black/[0.08] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06]">
          <h2 className="text-sm font-semibold text-[#111219]">Análises Recentes</h2>
          <Link href="/admin/analises" className="text-xs text-[#0C447C] font-medium hover:underline">
            Ver todas →
          </Link>
        </div>
        <div className="divide-y divide-black/[0.04]">
          {analyses.map(a => (
            <Link
              key={a.id}
              href={`/analysis/${a.id}`}
              className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#111219] truncate">{a.propertyName}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {a.userEmail} · Mat. {a.registrationNumber} · {format(new Date(a.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold text-white flex-shrink-0 ${getRiskColor(a.riskScore)}`}>
                {a.riskScore}/100
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
