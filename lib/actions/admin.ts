'use server';

import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Database } from '@/lib/supabase/database.types';
import { redirect } from 'next/navigation';

function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export type AdminUser = {
  id: string;
  email: string;
  plan: 'freemium' | 'standard' | 'admin';
  analysisCount: number;
  createdAt: string;
};

export type AdminStats = {
  totalUsers: number;
  freemiumUsers: number;
  standardUsers: number;
  adminUsers: number;
  totalAnalyses: number;
  analysesThisMonth: number;
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
};

export type AdminAnalysis = {
  id: string;
  propertyName: string;
  registrationNumber: string;
  riskScore: number;
  status: string;
  createdAt: string;
  userEmail: string;
  userId: string;
};

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single();

  if (profile?.plan !== 'admin') redirect('/');
}

export async function getAdminStats(): Promise<AdminStats> {
  await requireAdmin();
  const admin = createAdminClient();

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    profilesResult,
    totalAnalysesResult,
    monthAnalysesResult,
    riskResult,
  ] = await Promise.all([
    admin.from('profiles').select('plan'),
    admin.from('analyses').select('id', { count: 'exact', head: true }),
    admin
      .from('analyses')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString()),
    admin.from('analyses').select('risk_score').eq('status', 'completed'),
  ]);

  const profiles = profilesResult.data ?? [];
  const riskScores = (riskResult.data ?? []).map(r => r.risk_score ?? 0);

  return {
    totalUsers: profiles.length,
    freemiumUsers: profiles.filter(p => p.plan === 'freemium').length,
    standardUsers: profiles.filter(p => p.plan === 'standard').length,
    adminUsers: profiles.filter(p => p.plan === 'admin').length,
    totalAnalyses: totalAnalysesResult.count ?? 0,
    analysesThisMonth: monthAnalysesResult.count ?? 0,
    highRisk: riskScores.filter(s => s >= 66).length,
    mediumRisk: riskScores.filter(s => s >= 33 && s < 66).length,
    lowRisk: riskScores.filter(s => s < 33).length,
  };
}

export async function getAllUsers(): Promise<AdminUser[]> {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: authUsers } = await admin.auth.admin.listUsers();
  const { data: profiles } = await admin.from('profiles').select('id, plan, created_at');
  const { data: analysisCounts } = await admin
    .from('analyses')
    .select('user_id');

  const profileMap = new Map((profiles ?? []).map(p => [p.id, p]));
  const countMap = new Map<string, number>();
  for (const a of analysisCounts ?? []) {
    countMap.set(a.user_id, (countMap.get(a.user_id) ?? 0) + 1);
  }

  return (authUsers?.users ?? []).map(u => ({
    id: u.id,
    email: u.email ?? '—',
    plan: (profileMap.get(u.id)?.plan ?? 'freemium') as AdminUser['plan'],
    analysisCount: countMap.get(u.id) ?? 0,
    createdAt: profileMap.get(u.id)?.created_at ?? u.created_at,
  })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function updateUserPlan(
  userId: string,
  plan: 'freemium' | 'standard' | 'admin'
): Promise<{ error?: string }> {
  await requireAdmin();
  const admin = createAdminClient();

  const { error } = await admin
    .from('profiles')
    .update({ plan })
    .eq('id', userId);

  if (error) return { error: error.message };
  return {};
}

export async function getAllAnalyses(opts?: {
  search?: string;
  status?: string;
  minRisk?: number;
  maxRisk?: number;
  limit?: number;
  offset?: number;
}): Promise<{ analyses: AdminAnalysis[]; total: number }> {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: authUsers } = await admin.auth.admin.listUsers();
  const emailMap = new Map((authUsers?.users ?? []).map(u => [u.id, u.email ?? '—']));

  let query = admin
    .from('analyses')
    .select('id, user_id, property_name, registration_number, risk_score, status, created_at', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (opts?.search) {
    query = query.or(
      `property_name.ilike.%${opts.search}%,registration_number.ilike.%${opts.search}%`
    );
  }
  if (opts?.status && opts.status !== 'all') {
    query = query.eq('status', opts.status);
  }
  if (opts?.minRisk !== undefined) query = query.gte('risk_score', opts.minRisk);
  if (opts?.maxRisk !== undefined) query = query.lte('risk_score', opts.maxRisk);
  if (opts?.limit) query = query.limit(opts.limit);
  if (opts?.offset) query = query.range(opts.offset, (opts.offset + (opts.limit ?? 20)) - 1);

  const { data, count } = await query;

  return {
    total: count ?? 0,
    analyses: (data ?? []).map(a => ({
      id: a.id,
      propertyName: a.property_name ?? '—',
      registrationNumber: a.registration_number ?? '—',
      riskScore: a.risk_score ?? 0,
      status: a.status ?? 'pending',
      createdAt: a.created_at ?? '',
      userId: a.user_id,
      userEmail: emailMap.get(a.user_id) ?? '—',
    })),
  };
}
