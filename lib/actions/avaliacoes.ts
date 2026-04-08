'use server';

import Stripe from 'stripe';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { FotoUploadConfig } from '@/lib/avaliacoes/types';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-03-25.dahlia' });
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
// Entrega do laudo
// -------------------------------------------------------

export async function uploadLaudo(
  propostaId: string,
  file: File
): Promise<{ url?: string; error?: string }> {
  try {
    if (file.type !== 'application/pdf') {
      return { error: 'O laudo deve ser um arquivo PDF.' };
    }
    if (file.size > 20 * 1024 * 1024) {
      return { error: 'Arquivo muito grande. Máximo: 20 MB.' };
    }

    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Não autenticado' };

    // Verificar que o usuário é o avaliador desta proposta e que está paga
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: proposta } = await (supabase as any)
      .from('avaliacoes_propostas')
      .select('id, avaliador_id, status')
      .eq('id', propostaId)
      .single();

    if (!proposta || proposta.avaliador_id !== user.id) return { error: 'Sem permissão' };
    if (proposta.status !== 'pago') return { error: 'Esta proposta não está apta para entrega de laudo.' };

    const path = `laudos/${propostaId}/${Date.now()}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from('avaliacoes-fotos')
      .upload(path, file, { upsert: true });

    if (uploadError) return { error: uploadError.message };

    const { data: signedData, error: urlError } = await supabase.storage
      .from('avaliacoes-fotos')
      .createSignedUrl(path, 60 * 60 * 24 * 365); // 1 ano

    if (urlError || !signedData) return { error: urlError?.message ?? 'Erro ao gerar URL' };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
      .from('avaliacoes_propostas')
      .update({ laudo_url: signedData.signedUrl, laudo_entregue_at: new Date().toISOString() })
      .eq('id', propostaId);

    if (updateError) return { error: updateError.message };
    return { url: signedData.signedUrl };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Erro no upload do laudo' };
  }
}

export async function confirmarRecebimento(
  propostaId: string
): Promise<{ error?: string }> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Não autenticado' };

    // Buscar proposta
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: proposta } = await (supabase as any)
      .from('avaliacoes_propostas')
      .select('id, solicitacao_id, avaliador_id, valor, status, stripe_payment_intent_id, laudo_url')
      .eq('id', propostaId)
      .single();

    if (!proposta) return { error: 'Proposta não encontrada' };
    if (proposta.status !== 'pago') return { error: 'Pagamento ainda não confirmado.' };
    if (!proposta.laudo_url) return { error: 'O avaliador ainda não entregou o laudo.' };

    // Verificar que o usuário é dono da solicitação
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: sol } = await (supabase as any)
      .from('avaliacoes_solicitacoes')
      .select('id, user_id')
      .eq('id', proposta.solicitacao_id)
      .single();

    if (!sol || sol.user_id !== user.id) return { error: 'Sem permissão' };

    // Capturar o PaymentIntent no Stripe
    if (proposta.stripe_payment_intent_id) {
      try {
        await stripe.paymentIntents.capture(proposta.stripe_payment_intent_id);
      } catch (stripeErr) {
        console.error('Stripe capture error:', stripeErr);
        return { error: 'Erro ao processar o pagamento. Tente novamente.' };
      }
    }

    // Atualizar proposta → concluido
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('avaliacoes_propostas')
      .update({ status: 'concluido' })
      .eq('id', propostaId);

    // Atualizar solicitação → concluida + valor_pago
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('avaliacoes_solicitacoes')
      .update({ status: 'concluida', valor_pago: proposta.valor })
      .eq('id', proposta.solicitacao_id);

    // Incrementar total_avaliacoes do avaliador
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).rpc('increment_total_avaliacoes', { avaliador_uid: proposta.avaliador_id });

    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Erro ao confirmar recebimento' };
  }
}

// -------------------------------------------------------
// Reviews
// -------------------------------------------------------

export async function criarReview(
  solicitacaoId: string,
  nota: number,
  comentario: string
): Promise<{ error?: string }> {
  try {
    if (nota < 1 || nota > 5) return { error: 'Nota deve ser entre 1 e 5.' };

    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Não autenticado' };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: sol } = await (supabase as any)
      .from('avaliacoes_solicitacoes')
      .select('id, user_id, avaliador_id, status')
      .eq('id', solicitacaoId)
      .single();

    if (!sol) return { error: 'Solicitação não encontrada' };
    if (sol.status !== 'concluida') return { error: 'Avaliação só é possível após a conclusão.' };

    const isCliente = sol.user_id === user.id;
    const isAvaliador = sol.avaliador_id === user.id;
    if (!isCliente && !isAvaliador) return { error: 'Sem permissão' };

    // Verificar se já existe review desta solicitação para este usuário
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (supabase as any)
      .from('avaliacoes_reviews')
      .select('id, nota_ao_avaliador, nota_ao_cliente')
      .eq('solicitacao_id', solicitacaoId)
      .single();

    if (existing) {
      // Já existe registro — verificar se quem chama já avaliou
      if (isCliente && existing.nota_ao_avaliador !== null) return { error: 'Você já avaliou esta avaliação.' };
      if (isAvaliador && existing.nota_ao_cliente !== null) return { error: 'Você já avaliou este cliente.' };

      // Atualizar o campo correto
      const update = isCliente
        ? { nota_ao_avaliador: nota, comentario_avaliador: comentario.trim() || null }
        : { nota_ao_cliente: nota, comentario_cliente: comentario.trim() || null };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateErr } = await (supabase as any)
        .from('avaliacoes_reviews')
        .update(update)
        .eq('id', existing.id);

      if (updateErr) return { error: updateErr.message };
    } else {
      // Criar novo registro
      const insert = isCliente
        ? {
            solicitacao_id: solicitacaoId,
            avaliador_id: sol.avaliador_id,
            cliente_id: sol.user_id,
            nota_ao_avaliador: nota,
            comentario_avaliador: comentario.trim() || null,
          }
        : {
            solicitacao_id: solicitacaoId,
            avaliador_id: sol.avaliador_id,
            cliente_id: sol.user_id,
            nota_ao_cliente: nota,
            comentario_cliente: comentario.trim() || null,
          };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: insertErr } = await (supabase as any)
        .from('avaliacoes_reviews')
        .insert(insert);

      if (insertErr) return { error: insertErr.message };
    }

    // Recalcular nota_media do avaliador
    if (isCliente) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).rpc('recalcular_nota_media', { avaliador_uid: sol.avaliador_id });
    }

    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Erro ao salvar avaliação' };
  }
}

export async function getReviewsDaSolicitacao(
  solicitacaoId: string
): Promise<import('@/lib/avaliacoes/types').AvaliacaoReview | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('avaliacoes_reviews')
      .select('*')
      .eq('solicitacao_id', solicitacaoId)
      .maybeSingle();

    return data ?? null;
  } catch {
    return null;
  }
}

export async function getReviewsDoAvaliador(
  avaliadorId: string,
  limit = 5
): Promise<import('@/lib/avaliacoes/types').AvaliacaoReview[]> {
  try {
    const supabase = await createSupabaseServerClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('avaliacoes_reviews')
      .select('*')
      .eq('avaliador_id', avaliadorId)
      .not('nota_ao_avaliador', 'is', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    return (data ?? []) as import('@/lib/avaliacoes/types').AvaliacaoReview[];
  } catch {
    return [];
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
