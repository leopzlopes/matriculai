'use client';

import { useState, useEffect } from 'react';
import { X, Award, Star } from 'lucide-react';
import type { AvaliadorPerfil, AvaliacaoReview } from '@/lib/avaliacoes/types';
import { LABEL_TIPO_IMOVEL } from '@/lib/avaliacoes/types';
import { getReviewsDoAvaliador } from '@/lib/actions/avaliacoes';

interface Props {
  perfil: AvaliadorPerfil;
  onClose: () => void;
}

function StarRating({ nota }: { nota: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i <= Math.round(nota) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`}
        />
      ))}
      <span className="ml-1 text-sm text-slate-600 font-medium">{nota.toFixed(1)}</span>
      <span className="text-xs text-slate-400 ml-0.5">({nota} avaliações)</span>
    </div>
  );
}

export function AvaliadorDrawer({ perfil, onClose }: Props) {
  const [reviews, setReviews] = useState<AvaliacaoReview[]>([]);

  useEffect(() => {
    if (perfil.total_avaliacoes > 0) {
      getReviewsDoAvaliador(perfil.user_id).then(setReviews);
    }
  }, [perfil.user_id, perfil.total_avaliacoes]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-50 shadow-xl flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-[#111219]">Perfil do Avaliador</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 px-5 py-6 space-y-5">
          {/* Avatar + nome */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#0C447C]/10 flex items-center justify-center text-xl font-bold text-[#0C447C] flex-shrink-0">
              {perfil.nome?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div>
              <h3 className="text-base font-bold text-[#111219]">{perfil.nome ?? 'Avaliador'}</h3>
              {perfil.crea_numero && (
                <p className="text-xs text-slate-500">CREA {perfil.crea_numero}</p>
              )}
              {perfil.cnai_numero && (
                <p className="text-xs text-slate-500">CNAI {perfil.cnai_numero}</p>
              )}
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {perfil.parceiro_fundador && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200">
                <Award className="w-3 h-3" />
                Parceiro Fundador
              </span>
            )}
            {perfil.credencial_verificada && (
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
                CREA Verificado
              </span>
            )}
            {!perfil.credencial_verificada && perfil.declaracao_aceita && (
              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
                Declaração Assinada
              </span>
            )}
          </div>

          {/* Nota */}
          {perfil.nota_media > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Avaliação</p>
              <StarRating nota={perfil.nota_media} />
            </div>
          )}

          {/* Especialidades */}
          {perfil.especialidades.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Especialidades</p>
              <div className="flex flex-wrap gap-1.5">
                {perfil.especialidades.map((e) => (
                  <span key={e} className="px-2.5 py-1 bg-[#E6F1FB] text-[#0C447C] text-xs font-medium rounded-full">
                    {LABEL_TIPO_IMOVEL[e]}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Bio */}
          {perfil.bio && (
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Sobre</p>
              <p className="text-sm text-slate-600 leading-relaxed">{perfil.bio}</p>
            </div>
          )}

          {/* Reviews recentes */}
          {reviews.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-3 uppercase tracking-wide">
                Avaliações recentes
              </p>
              <div className="space-y-3">
                {reviews.map((r) => (
                  <div key={r.id} className="bg-slate-50 rounded-xl p-3">
                    <div className="flex items-center gap-0.5 mb-1.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${i <= (r.nota_ao_avaliador ?? 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`}
                        />
                      ))}
                      <span className="ml-1.5 text-xs text-slate-400">
                        {new Date(r.created_at).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    {r.comentario_avaliador && (
                      <p className="text-xs text-slate-600 leading-relaxed">{r.comentario_avaliador}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sem informações */}
          {!perfil.bio && perfil.especialidades.length === 0 && perfil.nota_media === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">
              Este avaliador ainda não completou o perfil.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
