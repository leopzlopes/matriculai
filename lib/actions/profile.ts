'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/supabase/database.types';

const FREEMIUM_LIMIT = 3;
const STANDARD_LIMIT = 30;

export type PlanInfo = {
  plan: 'freemium' | 'standard';
  used: number;
  limit: number;
  canUpload: boolean;
};

export async function getUserPlanInfo(): Promise<PlanInfo | null> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  return getPlanInfoForUser(user.id);
}

export async function getPlanInfoForUser(userId: string): Promise<PlanInfo> {
  const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const [profileResult, countResult] = await Promise.all([
    supabaseAdmin
      .from('profiles')
      .select('plan')
      .eq('id', userId)
      .single(),
    supabaseAdmin
      .from('analyses')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),
  ]);

  const plan = (profileResult.data?.plan ?? 'freemium') as 'freemium' | 'standard';

  if (plan === 'standard') {
    // Count only this month's analyses
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count } = await supabaseAdmin
      .from('analyses')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString());

    const used = count ?? 0;
    return { plan, used, limit: STANDARD_LIMIT, canUpload: used < STANDARD_LIMIT };
  }

  const used = countResult.count ?? 0;
  return { plan, used, limit: FREEMIUM_LIMIT, canUpload: used < FREEMIUM_LIMIT };
}
