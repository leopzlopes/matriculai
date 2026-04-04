import Link from 'next/link';
import { Zap, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { PlanInfo } from '@/lib/actions/profile';

interface PlanBadgeProps {
  planInfo: PlanInfo;
}

export function PlanBadge({ planInfo }: PlanBadgeProps) {
  const { plan, used, limit, canUpload } = planInfo;

  if (plan === 'admin') {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-[#0C447C]/8 border border-[#0C447C]/20 rounded-xl text-sm">
        <CheckCircle2 className="w-4 h-4 text-[#0C447C] flex-shrink-0" />
        <span className="text-[#0C447C] font-semibold">Admin</span>
        <span className="text-[#0C447C]/70">— acesso ilimitado</span>
      </div>
    );
  }

  if (plan === 'standard') {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-xl text-sm">
        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
        <span className="text-green-800 font-semibold">Plano Standard</span>
        <span className="text-green-600">— {used} de {limit} análises usadas este mês</span>
      </div>
    );
  }

  const percentage = Math.min((used / limit) * 100, 100);
  const isAtLimit = !canUpload;

  if (isAtLimit) {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm">
        <div className="flex items-center gap-2 flex-1">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <span className="text-amber-900 font-medium">Limite atingido — {used} de {limit} análises gratuitas usadas</span>
        </div>
        <Link
          href="/planos"
          className="flex items-center gap-1.5 px-4 py-1.5 bg-[#0C447C] text-white rounded-full text-xs font-semibold hover:bg-[#185FA5] transition-colors whitespace-nowrap"
        >
          <Zap className="w-3 h-3" />
          Fazer upgrade
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 px-4 py-3 bg-white border border-black/[0.08] rounded-xl text-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-slate-600 text-xs">
            <span className="font-semibold text-[#111219]">{used}</span> de{' '}
            <span className="font-semibold text-[#111219]">{limit}</span> análises gratuitas
          </span>
          <Link
            href="/planos"
            className="text-xs text-[#0C447C] font-medium hover:underline"
          >
            Ver planos →
          </Link>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${percentage >= 66 ? 'bg-amber-500' : 'bg-[#0C447C]'}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
