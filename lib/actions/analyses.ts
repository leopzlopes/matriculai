'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Database } from '@/lib/supabase/database.types';

type AnalysisRow = Database['public']['Tables']['analyses']['Row'];
type AnalysisDataRow = Database['public']['Tables']['analysis_data']['Row'];

export type AnalysisWithTabs = {
  analysis: AnalysisRow;
  tabData: Record<string, AnalysisDataRow['content']>;
};

export async function getAnalysis(id: string): Promise<AnalysisWithTabs | null> {
  const supabase = await createSupabaseServerClient();

  const { data: analysis, error: analysisError } = await supabase
    .from('analyses')
    .select('*')
    .eq('id', id)
    .single();

  if (analysisError || !analysis) {
    return null;
  }

  const { data: tabRows } = await supabase
    .from('analysis_data')
    .select('tab_name, content')
    .eq('analysis_id', id);

  const tabData: Record<string, AnalysisDataRow['content']> = {};
  for (const row of tabRows ?? []) {
    tabData[row.tab_name] = row.content;
  }

  return { analysis, tabData };
}

export async function getUserAnalyses(): Promise<AnalysisRow[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('analyses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data;
}
