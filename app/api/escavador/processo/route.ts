import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { buscarProcessoPorCNJ, buscarMovimentacoes } from '@/lib/escavador/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const numeroCnj: string | undefined = body?.numeroCnj;
  if (!numeroCnj) {
    return NextResponse.json({ error: 'numeroCnj é obrigatório' }, { status: 400 });
  }

  try {
    const [processo, movimentacoes] = await Promise.all([
      buscarProcessoPorCNJ(numeroCnj),
      buscarMovimentacoes(numeroCnj),
    ]);

    if (!processo) {
      return NextResponse.json({ error: 'Processo não encontrado no Escavador.' }, { status: 404 });
    }

    return NextResponse.json({ processo, movimentacoes: movimentacoes.slice(0, 5) });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro ao consultar Escavador';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
