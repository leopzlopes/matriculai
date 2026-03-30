import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { extractText } from 'unpdf';
import { Database } from '@/lib/supabase/database.types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function sanitizeFilename(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9.\-_]/g, '_')
    .slice(0, 100);
}

export async function POST(request: NextRequest) {
  // 1. Parse form data
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Requisição inválida' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
  }
  if (file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'Apenas PDFs são aceitos' }, { status: 400 });
  }

  // 2. Authenticate
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

  // 3. Admin client (server-side only — SERVICE_ROLE_KEY never exposed to client)
  const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 4. Prepare buffer and storage path
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  const safeName = sanitizeFilename(file.name);
  const storagePath = `${user.id}/${Date.now()}-${safeName}`;

  // 5. Upload to Supabase Storage
  const { error: storageError } = await supabaseAdmin.storage
    .from('matriculas')
    .upload(storagePath, uint8Array, { contentType: 'application/pdf' });

  if (storageError) {
    return NextResponse.json({ error: 'Falha ao armazenar arquivo' }, { status: 500 });
  }

  // 6. Get signed URL (bucket is private)
  const { data: signedUrlData } = await supabaseAdmin.storage
    .from('matriculas')
    .createSignedUrl(storagePath, 60 * 60 * 24 * 7); // 7 days

  const pdfUrl = signedUrlData?.signedUrl ?? null;

  // 7. Extract text from PDF (non-fatal)
  let extractedText = '';
  let pageCount = 0;
  try {
    const { text, totalPages } = await extractText(uint8Array, { mergePages: true });
    extractedText = text ?? '';
    pageCount = totalPages ?? 0;
  } catch (err) {
    console.error('PDF text extraction failed:', err);
  }

  // 8. Insert into analyses
  const { data: analysis, error: dbError } = await supabaseAdmin
    .from('analyses')
    .insert({
      user_id: user.id,
      property_name: file.name,
      registration_number: 'A EXTRAIR',
      pdf_url: pdfUrl,
      storage_path: storagePath,
      status: 'pending',
    })
    .select('id')
    .single();

  if (dbError || !analysis) {
    // Cleanup orphaned file
    await supabaseAdmin.storage.from('matriculas').remove([storagePath]).catch(() => {});
    return NextResponse.json({ error: 'Falha ao criar análise' }, { status: 500 });
  }

  // 9. Insert extracted text into analysis_data (non-fatal)
  try {
    await supabaseAdmin
      .from('analysis_data')
      .insert({
        analysis_id: analysis.id,
        tab_name: 'raw_text',
        content: {
          text: extractedText,
          pages: pageCount,
          extractedAt: new Date().toISOString(),
        },
      });
  } catch (err) {
    console.error('analysis_data insert failed:', err);
  }

  return NextResponse.json({ analysisId: analysis.id });
}
