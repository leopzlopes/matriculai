'use client';

import { useState } from 'react';
import { updateUserPlan } from '@/lib/actions/admin';
import { useRouter } from 'next/navigation';

type Plan = 'freemium' | 'standard' | 'admin';

const PLAN_LABELS: Record<Plan, string> = {
  freemium: 'Freemium',
  standard: 'Standard',
  admin: 'Admin',
};

const PLAN_COLORS: Record<Plan, string> = {
  freemium: 'bg-slate-100 text-slate-600',
  standard: 'bg-[#0C447C]/10 text-[#0C447C]',
  admin: 'bg-indigo-50 text-indigo-700',
};

export function ChangePlanButton({ userId, currentPlan }: { userId: string; currentPlan: Plan }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const plans: Plan[] = ['freemium', 'standard', 'admin'];

  async function handleChange(plan: Plan) {
    if (plan === currentPlan) { setOpen(false); return; }
    setLoading(true);
    await updateUserPlan(userId, plan);
    setLoading(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        disabled={loading}
        className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${PLAN_COLORS[currentPlan]} hover:opacity-80 disabled:opacity-50`}
      >
        {loading ? '...' : PLAN_LABELS[currentPlan]}
        {' ▾'}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-32 bg-white rounded-xl border border-black/[0.08] shadow-lg z-20 overflow-hidden">
            {plans.map(plan => (
              <button
                key={plan}
                onClick={() => handleChange(plan)}
                className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors hover:bg-slate-50 ${plan === currentPlan ? 'text-[#0C447C] font-semibold' : 'text-slate-700'}`}
              >
                {plan === currentPlan && '✓ '}{PLAN_LABELS[plan]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
