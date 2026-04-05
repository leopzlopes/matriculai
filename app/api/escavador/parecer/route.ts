import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getAnthropicClient, AI_MODEL } from '@/lib/ai/anthropic';
import type { ParecerResult } from '@/lib/escavador/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PROMPT_PROCESSO = `Você é um advogado especialista em direito imobiliário e direito processual civil.
Analise os dados do processo judicial abaixo e avalie o impacto na negociabilidade do imóvel.

Contexto do ônus/gravame na matrícula:
{contexto}

Dados do processo:
{dados}

Responda em JSON com o seguinte formato:
{
  "parecer": "Texto do parecer em português, máximo 3 parágrafos, objetivo e técnico.",
  "nivel_risco": "alto" | "medio" | "baixo"
}

Critérios de risco:
- alto: processo ativo com risco de constrição do imóvel, penhora vigente, ação real imobiliária em curso
- medio: processo em fase recursal, constrição suspensa, ação pessoal contra o proprietário
- baixo: processo arquivado, quitado, ou sem impacto direto sobre o imóvel`;

const PROMPT_ENVOLVIDO = `Você é um advogado especialista em direito imobiliário e fraude à execução.
Analise a lista de processos judiciais do proprietário abaixo e avalie o risco de fraude à execução e passivo oculto.

Nome do proprietário: {contexto}

Processos encontrados:
{dados}

Responda em JSON com o seguinte formato:
{
  "parecer": "Texto do parecer em português, máximo 3 parágrafos, objetivo e técnico.",
  "nivel_risco": "alto" | "medio" | "baixo"
}

Critérios de risco:
- alto: múltiplos processos ativos como réu, execuções fiscais ou trabalhistas relevantes, indícios de fraude à execução
- medio: alguns processos como réu, sem execuções significativas, ou processos antigos
- baixo: apenas processos como autor, arquivados, ou sem relevância patrimonial`;

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const tipo: string | undefined = body?.tipo;
  const dados = body?.dados;
  const contexto: string | undefined = body?.contexto;

  if (!tipo || !dados || !contexto) {
    return NextResponse.json({ error: 'tipo, dados e contexto são obrigatórios' }, { status: 400 });
  }

  if (tipo !== 'processo' && tipo !== 'envolvido') {
    return NextResponse.json({ error: 'tipo deve ser "processo" ou "envolvido"' }, { status: 400 });
  }

  const promptTemplate = tipo === 'processo' ? PROMPT_PROCESSO : PROMPT_ENVOLVIDO;
  const prompt = promptTemplate
    .replace('{contexto}', contexto)
    .replace('{dados}', JSON.stringify(dados, null, 2));

  try {
    const anthropic = getAnthropicClient();
    const message = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Resposta inválida da IA' }, { status: 500 });
    }

    const result = JSON.parse(jsonMatch[0]) as ParecerResult;
    return NextResponse.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro ao gerar parecer';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
