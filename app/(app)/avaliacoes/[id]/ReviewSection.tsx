'use client';

import { useState } from 'react';
import { Star, CheckCircle, AlertCircle } from 'lucide-react';
import { criarReview } from '@/lib/actions/avaliacoes';
import type { AvaliacaoReview } from '@/lib/avaliacoes/types';

// -------------------------------------------------------
// Estrelas clicáveis
// -------------------------------------------------------
function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          className="focus:outline-none"
        >
          <Star
            className={`w-7 h-7 transition-colors ${
              i <= (hover || value)
                ? 'text-amber-400 fill-amber-400'
                : 'text-slate-200 fill-slate-200'
            }`}
          />
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 text-sm text-slate-500">
          {['', 'Muito ruim', 'Ruim', 'Regular', 'Bom', 'Excelente'][value]}
        </span>
      )}
    </div>
  );
}

// -------------------------------------------------------
// Exibição de estrelas estáticas
// -------------------------------------------------------
function StarDisplay({ nota }: { nota: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i <= Math.round(nota) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`}
        />
      ))}
    </div>
  );
}

// -------------------------------------------------------
// Props
// -------------------------------------------------------
interface Props {
  solicitacaoId: string;
  isDono: boolean;
  isAvaliador: boolean;
  review: AvaliacaoReview | null;
  avaliadorNome?: string;
}

export function ReviewSection({ solicitacaoId, isDono, isAvaliador, review: initialReview, avaliadorNome }: Props) {
  const [review, setReview] = useState(initialReview);
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const jaAvaliouComoCliente = isDono && review?.nota_ao_avaliador !== null && review?.nota_ao_avaliador !== undefined;
  const jaAvaliouComoAvaliador = isAvaliador && review?.nota_ao_cliente !== null && review?.nota_ao_cliente !== undefined;
  const jaAvaliou = jaAvaliouComoCliente || jaAvaliouComoAvaliador;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (nota === 0) { setError('Selecione uma nota.'); return; }
    setSaving(true);
    setError('');

    const { error: err } = await criarReview(solicitacaoId, nota, comentario);
    setSaving(false);
    if (err) { setError(err); return; }

    // Atualizar estado local
    const novaNota = isDono ? { nota_ao_avaliador: nota, comentario_avaliador: comentario } : { nota_ao_cliente: nota, comentario_cliente: comentario };
    setReview((prev) => prev ? { ...prev, ...novaNota } : {
      id: '',
      solicitacao_id: solicitacaoId,
      avaliador_id: '',
      cliente_id: '',
      created_at: new Date().toISOString(),
      nota_ao_avaliador: null,
      nota_ao_cliente: null,
      comentario_avaliador: null,
      comentario_cliente: null,
      ...novaNota,
    });
    setSuccess('Avaliação enviada!');
  }

  return (
    <div className="space-y-4">
      {success && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* ---- Formulário de avaliação ---- */}
      {!jaAvaliou && (
        <div className="bg-white border border-black/[0.08] rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-[#111219] mb-1">
            {isDono ? `Avalie ${avaliadorNome ?? 'o avaliador'}` : 'Avalie o cliente'}
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            {isDono
              ? 'Sua avaliação é pública e ajuda outros clientes a escolherem um avaliador.'
              : 'Sua avaliação é interna e ajuda avaliadores a conhecerem o cliente.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <StarPicker value={nota} onChange={setNota} />

            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value.slice(0, 500))}
              rows={3}
              placeholder={isDono ? 'Descreva sua experiência com este avaliador...' : 'Descreva sua experiência com este cliente...'}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0C447C]/20 focus:border-[#0C447C] outline-none resize-none"
            />
            <p className="text-xs text-slate-400 text-right -mt-2">{comentario.length}/500</p>

            <button
              type="submit"
              disabled={saving || nota === 0}
              className="w-full py-2.5 bg-[#0C447C] text-white text-sm font-medium rounded-xl hover:bg-[#0C447C]/90 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Enviando...' : 'Enviar avaliação'}
            </button>
          </form>
        </div>
      )}

      {/* ---- Avaliação já enviada por quem está vendo ---- */}
      {jaAvaliou && (
        <div className="bg-white border border-black/[0.08] rounded-2xl p-5">
          <div className="flex items-center gap-2 text-sm text-emerald-700 mb-3">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium">Sua avaliação</span>
          </div>
          <StarDisplay nota={isDono ? (review?.nota_ao_avaliador ?? 0) : (review?.nota_ao_cliente ?? 0)} />
          {(isDono ? review?.comentario_avaliador : review?.comentario_cliente) && (
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              {isDono ? review?.comentario_avaliador : review?.comentario_cliente}
            </p>
          )}
        </div>
      )}

      {/* ---- Avaliação recebida ---- */}
      {isDono && review?.nota_ao_cliente !== null && review?.nota_ao_cliente !== undefined && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Avaliação do avaliador sobre você</p>
          <StarDisplay nota={review.nota_ao_cliente} />
          {review.comentario_cliente && (
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">{review.comentario_cliente}</p>
          )}
        </div>
      )}

      {isAvaliador && review?.nota_ao_avaliador !== null && review?.nota_ao_avaliador !== undefined && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Avaliação do cliente sobre você</p>
          <StarDisplay nota={review.nota_ao_avaliador} />
          {review.comentario_avaliador && (
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">{review.comentario_avaliador}</p>
          )}
        </div>
      )}
    </div>
  );
}
