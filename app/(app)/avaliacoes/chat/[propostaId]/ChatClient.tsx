'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Send } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { sendMensagem, marcarMensagensLidas } from '@/lib/actions/avaliacoes';
import type { MensagemSalva } from '@/lib/avaliacoes/types';

interface Props {
  propostaId: string;
  userId: string;
  initialMensagens: MensagemSalva[];
}

export function ChatClient({ propostaId, userId, initialMensagens }: Props) {
  const [mensagens, setMensagens] = useState<MensagemSalva[]>(initialMensagens);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [mensagens, scrollToBottom]);

  // Marcar como lidas ao entrar
  useEffect(() => {
    marcarMensagensLidas(propostaId);
  }, [propostaId]);

  // Supabase Realtime
  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const channel = supabase
      .channel(`chat-${propostaId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'avaliacoes_mensagens',
          filter: `proposta_id=eq.${propostaId}`,
        },
        (payload) => {
          const nova = payload.new as MensagemSalva;
          setMensagens((prev) => {
            // Evitar duplicata se já foi adicionada otimisticamente
            if (prev.some((m) => m.id === nova.id)) return prev;
            return [...prev, nova];
          });
          // Marcar como lida se não é nossa
          if (nova.remetente_id !== userId) {
            marcarMensagensLidas(propostaId);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [propostaId, userId]);

  async function handleSend() {
    if (!input.trim()) return;
    setSending(true);
    setError('');

    const texto = input.trim();
    setInput('');

    // Otimista: adicionar localmente com ID temporário
    const tempMsg: MensagemSalva = {
      id: `temp-${Date.now()}`,
      proposta_id: propostaId,
      remetente_id: userId,
      mensagem: texto,
      lida: false,
      created_at: new Date().toISOString(),
    };
    setMensagens((prev) => [...prev, tempMsg]);

    const { error: err } = await sendMensagem(propostaId, texto);
    setSending(false);
    if (err) {
      setError(err);
      // Remover mensagem otimista em caso de erro
      setMensagens((prev) => prev.filter((m) => m.id !== tempMsg.id));
    }
  }

  function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  }

  // Agrupar mensagens por dia
  const groups: { date: string; msgs: MensagemSalva[] }[] = [];
  for (const msg of mensagens) {
    const date = msg.created_at.split('T')[0];
    const last = groups[groups.length - 1];
    if (last?.date === date) {
      last.msgs.push(msg);
    } else {
      groups.push({ date, msgs: [msg] });
    }
  }

  return (
    <div className="bg-white border border-black/[0.08] rounded-2xl flex flex-col" style={{ height: '60vh', minHeight: '400px' }}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {mensagens.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-slate-400">Nenhuma mensagem ainda. Inicie a conversa!</p>
          </div>
        )}

        {groups.map((group) => (
          <div key={group.date}>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-xs text-slate-400">{formatDate(group.date)}</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            <div className="space-y-2">
              {group.msgs.map((msg) => {
                const isMine = msg.remetente_id === userId;
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isMine
                        ? 'bg-[#0C447C] text-white rounded-br-sm'
                        : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                    } ${msg.id.startsWith('temp-') ? 'opacity-70' : ''}`}>
                      <p>{msg.mensagem}</p>
                      <p className={`text-[10px] mt-1 ${isMine ? 'text-white/60 text-right' : 'text-slate-400'}`}>
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-100 text-xs text-red-600">
          {error}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-slate-100 p-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
          placeholder="Digite uma mensagem..."
          className="flex-1 px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0C447C]/20 focus:border-[#0C447C] outline-none"
          disabled={sending}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={sending || !input.trim()}
          className="px-4 py-2.5 bg-[#0C447C] text-white rounded-xl hover:bg-[#0C447C]/90 disabled:opacity-50 transition-colors flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
