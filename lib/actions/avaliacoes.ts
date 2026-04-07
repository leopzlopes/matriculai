'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { FotoUploadConfig } from '@/lib/avaliacoes/types';
import type {
  AvaliadorPerfil,
  SolicitacaoSalva,
  PropostaSalva,
  MensagemSalva,
  NovaSolicitacaoPayload,
  NovaPropostaPayload,
} from '@/lib/avaliacoes/types';

const CREA_REGEX = /^[A-Z]{2}-\d+\/[A-Z]$/;

// -------------------------------------------------------
// Solicitações
// -------------------------------------------------------

export async function createSolicitacao(
  payload: NovaSolicitacaoPayload
): Promise<{ id?: string; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Não autenticado' };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('avaliacoes_solicitacoes')
      .insert({ ...payload, user_id: user.id })
      .select('id')
      .single();

    if (error) return { error: error.message };
    return { id: data.id };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Erro ao criar solicitação' };
  }
}

export async function getSolicitacoesAbertas(): Promise<SolicitacaoSalva[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('avaliacoes_solicitacoes')
      .select('*')
      .eq('status', 'aberta')
      .order('created_at', { ascending: false });

    return (data ?? []) as SolicitacaoSalva[];
  } catch {
    return [];
  }
}

export async function getMySolicitacoes(): Promise<SolicitacaoSalva[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('avaliacoes_solicitacoes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    return (data ?? []) as SolicitacaoSalva[];
  } catch {
    return [];
  }
}

export async function getSolicitacao(id: string): Promise<SolicitacaoSalva | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('avaliacoes_solicitacoes')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return data as SolicitacaoSalva;
  } catch {
    return null;
  }
}

export async function cancelSolicitacao(id: string): Promise<{ error?: string }> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Não autenticado' };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('avaliacoes_solicitacoes')
      .update({ status: 'cancelada' })
      .eq('id', id)
      .eq('user_id', user.id)
      .eq('status', 'aberta');

    if (error) return { error: error.message };
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Erro ao cancelar' };
  }
}

// -------------------------------------------------------
// Propostas
// -------------------------------------------------------

export async function createProposta(
  payload: NovaPropostaPayload
): Promise<{ id?: string; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Não autenticado' };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('avaliacoes_propostas')
      .insert({ ...payload, avaliador_id: user.id })
      .select('id')
      .single();

    if (error) {
      if (error.code === '23505') return { error: 'Você já enviou uma proposta para esta solicitação' };
      return { error: error.message };
    }

    // Atualizar status da solicitação para em_negociacao se ainda estava aberta
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('avaliacoes_solicitacoes')
      .update({ status: 'em_negociacao' })
      .eq('id', payload.solicitacao_id)
      .eq('status', 'aberta');

    return { id: data.id };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Erro ao enviar proposta' };
  }
}

export async function getPropostasDaSolicitacao(
  solicitacaoId: string
): Promise<PropostaSalva[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('avaliacoes_propostas')
      .select('*')
      .eq('solicitacao_id', solicitacaoId)
      .order('created_at', { ascending: true });

    if (!data) return [];

    // Buscar perfis dos avaliadores
    const avaliadorIds: string[] = [...new Set((data as PropostaSalva[]).map((p) => p.avaliador_id))];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: perfis } = await (supabase as any)
      .from('avaliadores_perfil')
      .select('*')
      .in('user_id', avaliadorIds);

    const perfilMap = new Map<string, AvaliadorPerfil>(
      (perfis ?? []).map((p: AvaliadorPerfil) => [p.user_id, p])
    );

    // Contar mensagens não lidas por proposta
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: msgs } = await (supabase as any)
      .from('avaliacoes_mensagens')
      .select('proposta_id, lida')
      .in('proposta_id', (data as PropostaSalva[]).map((p) => p.id))
      .eq('lida', false)
      .neq('remetente_id', user.id);

    const unreadMap = new Map<string, number>();
    (msgs ?? []).forEach((m: { proposta_id: string }) => {
      unreadMap.set(m.proposta_id, (unreadMap.get(m.proposta_id) ?? 0) + 1);
    });

    return (data as PropostaSalva[]).map((p) => ({
      ...p,
      avaliador: perfilMap.get(p.avaliador_id),
      mensagens_nao_lidas: unreadMap.get(p.id) ?? 0,
    }));
  } catch {
    return [];
  }
}

export async function aceitarProposta(propostaId: string): Promise<{ error?: string; propostaId?: string; solicitacaoId?: string }> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Não autenticado' };

    // Buscar a proposta para obter solicitacao_id e avaliador_id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: proposta, error: fetchError } = await (supabase as any)
      .from('avaliacoes_propostas')
      .select('solicitacao_id, avaliador_id')
      .eq('id', propostaId)
      .single();

    if (fetchError || !proposta) return { error: 'Proposta não encontrada' };

    // Verificar que o usuário é dono da solicitação
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: sol } = await (supabase as any)
      .from('avaliacoes_solicitacoes')
      .select('id, user_id')
      .eq('id', proposta.solicitacao_id)
      .single();

    if (!sol || sol.user_id !== user.id) return { error: 'Sem permissão' };

    // Guard: verificar se avaliador tem stripe_account_id configurado
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: avPerf } = await (supabase as any)
      .from('avaliadores_perfil')
      .select('stripe_account_id')
      .eq('user_id', proposta.avaliador_id)
      .maybeSingle();

    if (!avPerf?.stripe_account_id) {
      return { error: 'O avaliador ainda não configurou o recebimento de pagamentos. Aguarde ou escolha outra proposta.' };
    }

    // Marcar proposta aceita
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('avaliacoes_propostas')
      .update({ status: 'aceita' })
      .eq('id', propostaId);

    // Marcar demais propostas desta solicitação como recusadas
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('avaliacoes_propostas')
      .update({ status: 'recusada' })
      .eq('solicitacao_id', proposta.solicitacao_id)
      .neq('id', propostaId);

    // Atualizar solicitação
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
      .from('avaliacoes_solicitacoes')
      .update({ status: 'contratada', avaliador_id: proposta.avaliador_id })
      .eq('id', proposta.solicitacao_id);

    if (updateError) return { error: updateError.message };

    // Retornar IDs para o front iniciar o checkout de pagamento
    return { propostaId, solicitacaoId: proposta.solicitacao_id };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Erro ao aceitar proposta' };
  }
}

export async function recusarProposta(propostaId: string): Promise<{ error?: string }> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Não autenticado' };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('avaliacoes_propostas')
      .update({ status: 'recusada' })
      .eq('id', propostaId)
      .in('solicitacao_id', (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (await (supabase as any)
          .from('avaliacoes_solicitacoes')
          .select('id')
          .eq('user_id', user.id)).data ?? []
      ).map((s: { id: string }) => s.id));

    if (error) return { error: error.message };
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Erro ao recusar proposta' };
  }
}

// -------------------------------------------------------
// Chat
// -------------------------------------------------------

export async function sendMensagem(
  propostaId: string,
  mensagem: string
): Promise<{ error?: string }> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Não autenticado' };
    if (!mensagem.trim()) return { error: 'Mensagem vazia' };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('avaliacoes_mensagens')
      .insert({ proposta_id: propostaId, remetente_id: user.id, mensagem: mensagem.trim() });

    if (error) return { error: error.message };
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Erro ao enviar mensagem' };
  }
}

export async function getMensagens(propostaId: string): Promise<MensagemSalva[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('avaliacoes_mensagens')
      .select('*')
      .eq('proposta_id', propostaId)
      .order('created_at', { ascending: true });

    return (data ?? []) as MensagemSalva[];
  } catch {
    return [];
  }
}

export async function marcarMensagensLidas(propostaId: string): Promise<void> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('avaliacoes_mensagens')
      .update({ lida: true })
      .eq('proposta_id', propostaId)
      .neq('remetente_id', user.id)
      .eq('lida', false);
  } catch {
    // silencioso
  }
}

// -------------------------------------------------------
// Perfil Avaliador
// -------------------------------------------------------

export async function getOrCreateAvaliadorPerfil(): Promise<AvaliadorPerfil | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('avaliadores_perfil')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) return null;
    if (data) return data as AvaliadorPerfil;

    // Criar perfil vazio
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: novo } = await (supabase as any)
      .from('avaliadores_perfil')
      .insert({ user_id: user.id })
      .select('*')
      .single();

    return novo as AvaliadorPerfil ?? null;
  } catch {
    return null;
  }
}

export async function updateAvaliadorPerfil(
  dados: Partial<Omit<AvaliadorPerfil, 'user_id' | 'created_at' | 'nota_media' | 'total_avaliacoes' | 'credencial_verificada' | 'parceiro_fundador'>>
): Promise<{ error?: string }> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Não autenticado' };

    // Validar formato CREA se fornecido
    if (dados.crea_numero && dados.crea_numero.trim()) {
      const creaFormatado = dados.crea_numero.trim().toUpperCase();
      if (!CREA_REGEX.test(creaFormatado)) {
        return { error: 'Formato de CREA inválido. Use: UF-XXXXX/D (ex: MS-12345/T)' };
      }
      dados = { ...dados, crea_numero: creaFormatado };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('avaliadores_perfil')
      .upsert({ ...dados, user_id: user.id });

    if (error) return { error: error.message };
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Erro ao salvar perfil' };
  }
}

export async function aceitarDeclaracao(): Promise<{ error?: string }> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Não autenticado' };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('avaliadores_perfil')
      .upsert({
        user_id: user.id,
        declaracao_aceita: true,
        declaracao_aceita_at: new Date().toISOString(),
      });

    if (error) return { error: error.message };
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Erro ao aceitar declaração' };
  }
}

// -------------------------------------------------------
// Upload de fotos
// -------------------------------------------------------

export async function uploadFotoSolicitacao(
  file: File,
  userId: string
): Promise<{ url?: string; error?: string }> {
  try {
    // Validar mime type
    if (!FotoUploadConfig.acceptedMimeTypes.includes(file.type)) {
      return { error: 'Tipo de arquivo não permitido. Use JPG, PNG, WEBP ou PDF.' };
    }
    // Validar tamanho
    if (file.size > FotoUploadConfig.maxSizeBytes) {
      return { error: 'Arquivo muito grande. Máximo: 10 MB.' };
    }

    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== userId) return { error: 'Não autenticado' };

    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('avaliacoes-fotos')
      .upload(path, file);

    if (uploadError) return { error: uploadError.message };

    const { data: signedData, error: urlError } = await supabase.storage
      .from('avaliacoes-fotos')
      .createSignedUrl(path, 60 * 60 * 24 * 30); // 30 dias

    if (urlError || !signedData) return { error: urlError?.message ?? 'Erro ao gerar URL' };
    return { url: signedData.signedUrl };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Erro no upload' };
  }
}
