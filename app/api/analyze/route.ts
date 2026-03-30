import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/supabase/database.types';
import { getAnthropicClient, AI_MODEL } from '@/lib/ai/anthropic';
import { MODULO1_SYSTEM_PROMPT, buildModulo1UserMessage } from '@/lib/ai/prompts/modulo1-registral';
import { MODULO2_SYSTEM_PROMPT, buildModulo2UserMessage } from '@/lib/ai/prompts/modulo2-penhorabilidade';
import { MODULO3_SYSTEM_PROMPT, buildModulo3UserMessage } from '@/lib/ai/prompts/modulo3-avaliacao';
import type { Modulo1Result, Modulo2Result, Modulo3Result, GeneralSummaryData } from '@/lib/ai/types';
import { Alert } from '@/types';
import { isTextSufficient, ocrPdfWithVision } from '@/lib/ai/vision';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

async function runModule<T>(
  systemPrompt: string,
  userMessage: string,
  fallback: T
): Promise<T> {
  try {
    const client = getAnthropicClient();
    const message = await client.messages.create({
      model: AI_MODEL,
      max_tokens: 8192,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    const textBlock = message.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') return fallback;

    const raw = textBlock.text.trim();
    // Strip markdown code fences if model wraps output despite instructions
    const jsonStr = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    return JSON.parse(jsonStr) as T;
  } catch (err) {
    console.error('AI module error:', err);
    return fallback;
  }
}

export async function POST(request: NextRequest) {
  let body: { analysisId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Requisição inválida' }, { status: 400 });
  }

  const { analysisId } = body;
  if (!analysisId) {
    return NextResponse.json({ error: 'analysisId obrigatório' }, { status: 400 });
  }

  // Authenticate
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) =>
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          ),
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch analysis — verify ownership and status
  const { data: analysis, error: fetchError } = await supabaseAdmin
    .from('analyses')
    .select('id, user_id, status, storage_path, pdf_url')
    .eq('id', analysisId)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !analysis) {
    return NextResponse.json({ error: 'Análise não encontrada' }, { status: 404 });
  }

  if (analysis.status === 'completed') {
    return NextResponse.json({ success: true, message: 'already_completed' });
  }

  if (analysis.status === 'processing') {
    return NextResponse.json({ success: true, message: 'already_processing' });
  }

  // Mark as processing
  await supabaseAdmin
    .from('analyses')
    .update({ status: 'processing' })
    .eq('id', analysisId);

  // Fetch raw text
  const { data: rawTextRow } = await supabaseAdmin
    .from('analysis_data')
    .select('content')
    .eq('analysis_id', analysisId)
    .eq('tab_name', 'raw_text')
    .single();

  let rawText: string =
    (rawTextRow?.content as { text?: string } | null)?.text ?? '';

  if (!rawText) {
    await supabaseAdmin
      .from('analyses')
      .update({ status: 'error' })
      .eq('id', analysisId);
    return NextResponse.json({ error: 'Texto do PDF não disponível' }, { status: 422 });
  }

  // OCR fallback: if extracted text is insufficient, use Claude vision
  if (!isTextSufficient(rawText)) {
    try {
      let pdfBase64: string | null = null;

      if (analysis.storage_path) {
        // Download from Supabase Storage using path
        const { data: fileData, error: downloadError } = await supabaseAdmin.storage
          .from('matriculas')
          .download(analysis.storage_path);
        if (!downloadError && fileData) {
          pdfBase64 = Buffer.from(await fileData.arrayBuffer()).toString('base64');
        }
      } else if (analysis.pdf_url) {
        // Fallback for older analyses without storage_path: fetch via signed URL
        const pdfRes = await fetch(analysis.pdf_url);
        if (pdfRes.ok) {
          pdfBase64 = Buffer.from(await pdfRes.arrayBuffer()).toString('base64');
        }
      }

      if (pdfBase64) {
        const ocrText = await ocrPdfWithVision(pdfBase64);
        if (ocrText && ocrText.length > rawText.length) {
          rawText = ocrText;
          // Update raw_text in DB with OCR result
          await supabaseAdmin
            .from('analysis_data')
            .update({ content: { text: rawText, source: 'vision_ocr', extractedAt: new Date().toISOString() } })
            .eq('analysis_id', analysisId)
            .eq('tab_name', 'raw_text');
        }
      }
    } catch (err) {
      console.error('Vision OCR fallback failed:', err);
      // Non-fatal: continue with original text
    }
  }

  // Fallback values for failed modules
  const fallback1: Modulo1Result = {
    registration_number: 'A EXTRAIR',
    property_data: {},
    owners: [],
    encumbrances: [],
    averbatations: [],
    alerts: [],
    risk_score: 50,
  };

  const fallback2: Modulo2Result = {
    penhorabilidade: 'livre',
    fundamentacao: 'Análise não disponível.',
    checklist: [],
    risk_score: 50,
  };

  const fallback3: Modulo3Result = {
    valorEstimado: 0,
    faixaMinima: 0,
    faixaMaxima: 0,
    metodologia: 'Não disponível',
    observacoes: 'Análise não disponível.',
    risk_score: 50,
  };

  // Run all 3 modules in parallel
  const [mod1, mod2, mod3] = await Promise.all([
    runModule<Modulo1Result>(MODULO1_SYSTEM_PROMPT, buildModulo1UserMessage(rawText), fallback1),
    runModule<Modulo2Result>(MODULO2_SYSTEM_PROMPT, buildModulo2UserMessage(rawText), fallback2),
    runModule<Modulo3Result>(MODULO3_SYSTEM_PROMPT, buildModulo3UserMessage(rawText), fallback3),
  ]);

  // Save module results to analysis_data
  await supabaseAdmin.from('analysis_data').insert([
    { analysis_id: analysisId, tab_name: 'registral', content: mod1 as unknown as Database['public']['Tables']['analysis_data']['Insert']['content'] },
    { analysis_id: analysisId, tab_name: 'penhorabilidade', content: mod2 as unknown as Database['public']['Tables']['analysis_data']['Insert']['content'] },
    { analysis_id: analysisId, tab_name: 'avaliacao', content: mod3 as unknown as Database['public']['Tables']['analysis_data']['Insert']['content'] },
  ]);

  // Compute final risk_score (weighted: 50% registral, 30% penhorabilidade, 20% avaliacao)
  const finalRiskScore = Math.round(
    (mod1.risk_score ?? 50) * 0.5 +
    (mod2.risk_score ?? 50) * 0.3 +
    (mod3.risk_score ?? 50) * 0.2
  );

  // Build general_summary
  const alerts: Alert[] = mod1.alerts ?? [];
  const attentionPoints = alerts
    .filter((a) => a.severity === 'high' || a.severity === 'medium')
    .map((a) => a.title);

  const mainOwner = mod1.owners?.[0]?.nome ?? undefined;

  const generalSummary: GeneralSummaryData = {
    registration_number: mod1.registration_number ?? 'A EXTRAIR',
    created_at: new Date().toISOString(),
    risk_score: finalRiskScore,
    penhorabilidade: mod2.penhorabilidade,
    summary: mod2.fundamentacao ?? '',
    attention_points: attentionPoints,
    property_type: mod1.property_data?.tipoImovel ?? undefined,
    main_owner: mainOwner,
    situation: mod1.property_data?.situacao ?? undefined,
    alerts,
    valorEstimado: mod3.valorEstimado,
    faixaMinima: mod3.faixaMinima,
    faixaMaxima: mod3.faixaMaxima,
  };

  await supabaseAdmin.from('analysis_data').insert(
    [{ analysis_id: analysisId, tab_name: 'general_summary', content: generalSummary as unknown as Database['public']['Tables']['analysis_data']['Insert']['content'] }]
  );

  // Update analyses record
  await supabaseAdmin
    .from('analyses')
    .update({
      status: 'completed',
      risk_score: finalRiskScore,
      registration_number: mod1.registration_number ?? 'A EXTRAIR',
    })
    .eq('id', analysisId);

  return NextResponse.json({ success: true });
}
