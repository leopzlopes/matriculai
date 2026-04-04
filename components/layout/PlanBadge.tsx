import Link from 'next/link';
import { Zap, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { PlanInfo } from '@/lib/actions/profile';

interface PlanBadgeProps {
  planInfo: PlanInfo;
}

export function PlanBadge({ planInfo }: PlanBadgeProps) {
  const { plan, used, limit, canUpload } = planInfo;

  if (plan === 'standard') {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-sm">
        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
        <span className="text-green-800 font-medium">Plano Standard ativo</span>
        <span className="text-green-600">— {used} de {limit} análises usadas este mês</span>
      </div>
    );
  }

  const percentage = Math.min((used / limit) * 100, 100);
  const isAtLimit = !canUpload;

  if (isAtLimit) {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-300 rounded-lg text-sm">
        <div className="flex items-center gap-2 flex-1">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span className="text-amber-900 font-medium">Limite atingido — {used} de {limit} análises gratuitas usadas</span>
        </div>
        <Link
          href="/planos"
          className="flex items-center gap-1 px-3 py-1.5 bg-[#0C447C] text-white rounded-md text-xs font-semibold hover:bg-[#185FA5] transition-colors whitespace-nowrap"
        >
          <Zap className="w-3 h-3" />
          Fazer upgrade
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-slate-700">
          <span className="font-semibold">{used}</span> de{' '}
          <span className="font-semibold">{limit}</span> análises gratuitas usadas
        </span>
        <Link
          href="/planos"
          className="text-xs text-slate-500 hover:text-slate-900 underline underline-offset-2"
        >
          Ver planos
        </Link>
      </div>
      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${percentage >= 66 ? 'bg-amber-500' : 'bg-[#0C447C]'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
