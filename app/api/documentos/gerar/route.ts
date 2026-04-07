import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getAnthropicClient, AI_MODEL } from '@/lib/ai/anthropic';
import { buildPromptDocumento } from '@/lib/documentos/prompts';
import type { DadosDocumento, DocumentoGerado, TipoContrato } from '@/lib/documentos/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TIPOS_CONTRATO = new Set<TipoContrato>([
  'compromisso_compra_venda',
  'compra_venda_financiamento',
  'locacao_residencial',
  'locacao_comercial',
  'cessao_direitos',
]);

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const dados: DadosDocumento | undefined = body?.dados;

  if (!dados?.tipo || !dados?.outorgantes?.length || !dados?.outorgados?.length || !dados?.imovel) {
    return NextResponse.json({ error: 'Dados incompletos para gerar o documento' }, { status: 400 });
  }

  try {
    const { system, user: userPrompt } = buildPromptDocumento(dados);
    const anthropic = getAnthropicClient();

    const message = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 4096,
      system,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Resposta inválida da IA' }, { status: 500 });
    }

    const result = JSON.parse(jsonMatch[0]) as DocumentoGerado;

    // Salvar no histórico (falha silenciosa — não bloqueia retorno ao cliente)
    const tipo = TIPOS_CONTRATO.has(dados.tipo as TipoContrato) ? 'contrato' : 'escritura';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: saved } = await (supabase as any)
      .from('documentos_gerados')
      .insert({
        user_id: user.id,
        tipo,
        subtipo: dados.tipo,
        titulo: result.titulo,
        texto: result.texto,
        dados: dados,
      })
      .select('id')
      .single();

    return NextResponse.json({ ...result, savedId: saved?.id ?? null });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro ao gerar documento';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
