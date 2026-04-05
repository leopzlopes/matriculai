import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { buscarProcessosPorNome } from '@/lib/escavador/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const nome: string | undefined = body?.nome;
  if (!nome || nome.trim().length < 3) {
    return NextResponse.json({ error: 'nome é obrigatório (mínimo 3 caracteres)' }, { status: 400 });
  }

  try {
    const processos = await buscarProcessosPorNome(nome.trim());
    return NextResponse.json({ processos });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro ao consultar Escavador';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
