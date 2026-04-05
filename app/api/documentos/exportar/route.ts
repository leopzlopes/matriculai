import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { gerarDocumentoDocxBuffer } from '@/lib/export/documento-docx';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const titulo: string | undefined = body?.titulo;
  const texto: string | undefined = body?.texto;
  const cidade: string | undefined = body?.cidade;

  if (!titulo || !texto) {
    return NextResponse.json({ error: 'titulo e texto são obrigatórios' }, { status: 400 });
  }

  try {
    const buffer = await gerarDocumentoDocxBuffer(titulo, texto, cidade);

    const safeName = titulo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="minuta-${safeName}.docx"`,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro ao gerar DOCX';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
