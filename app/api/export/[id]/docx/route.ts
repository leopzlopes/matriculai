import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getPlanInfoForUser } from '@/lib/actions/profile';
import { generateDocxBuffer } from '@/lib/export/docx';
import type { ReportData } from '@/lib/export/pdf';
import type { Database } from '@/lib/supabase/database.types';
import type {
  GeneralSummaryData,
  Modulo1Result,
  Modulo2Result,
  Modulo3Result,
} from '@/lib/ai/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // 1. Auth
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  // 2. Plan check — export is Standard-only
  const planInfo = await getPlanInfoForUser(user.id);
  if (planInfo.plan !== 'standard') {
    return NextResponse.json(
      { error: 'Exportação disponível apenas no plano Standard' },
      { status: 403 }
    );
  }

  // 3. Fetch analysis data
  const admin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: analysis, error: analysisError } = await admin
    .from('analyses')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (analysisError || !analysis) {
    return NextResponse.json({ error: 'Análise não encontrada' }, { status: 404 });
  }

  const { data: tabRows } = await admin
    .from('analysis_data')
    .select('tab_name, content')
    .eq('analysis_id', id);

  const tabData: Record<string, unknown> = {};
  for (const row of tabRows ?? []) {
    tabData[row.tab_name] = row.content;
  }

  const reportData: ReportData = {
    analysisId: analysis.id,
    registrationNumber: analysis.registration_number,
    propertyName: analysis.property_name,
    riskScore: analysis.risk_score ?? 0,
    createdAt: analysis.created_at ?? new Date().toISOString(),
    generalSummary: tabData['general_summary'] as GeneralSummaryData | undefined,
    registral: tabData['registral'] as Modulo1Result | undefined,
    penhorabilidade: tabData['penhorabilidade'] as Modulo2Result | undefined,
    avaliacao: tabData['avaliacao'] as Modulo3Result | undefined,
  };

  // 4. Generate DOCX
  const buf = await generateDocxBuffer(reportData);
  const safeName = analysis.registration_number.replace(/[^a-zA-Z0-9-]/g, '-');

  const body = new Uint8Array(buf);
  return new Response(body, {
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="matricula-${safeName}.docx"`,
      'Content-Length': String(body.length),
    },
  });
}
