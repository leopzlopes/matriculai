'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { DadosDocumento } from '@/lib/documentos/types';

export interface DocumentoSalvo {
  id: string;
  tipo: string;
  subtipo: string;
  titulo: string;
  texto: string;
  dados: DadosDocumento;
  created_at: string;
}

export async function getUserDocumentos(): Promise<DocumentoSalvo[]> {
  try {
    const supabase = await createSupabaseServerClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('documentos_gerados')
      .select('id, tipo, subtipo, titulo, texto, dados, created_at')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data as DocumentoSalvo[];
  } catch {
    return [];
  }
}

export async function getDocumento(id: string): Promise<DocumentoSalvo | null> {
  try {
    const supabase = await createSupabaseServerClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('documentos_gerados')
      .select('id, tipo, subtipo, titulo, texto, dados, created_at')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return data as DocumentoSalvo;
  } catch {
    return null;
  }
}

export async function deleteDocumento(id: string): Promise<{ error?: string }> {
  try {
    const supabase = await createSupabaseServerClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('documentos_gerados')
      .delete()
      .eq('id', id);

    if (error) return { error: error.message };
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Erro ao deletar documento' };
  }
}
