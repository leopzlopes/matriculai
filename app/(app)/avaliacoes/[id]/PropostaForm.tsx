'use client';

import { useState } from 'react';
import { createProposta } from '@/lib/actions/avaliacoes';

interface Props {
  solicitacaoId: string;
  onSuccess?: () => void;
}

export function PropostaForm({ solicitacaoId, onSuccess }: Props) {
  const [valor, setValor] = useState('');
  const [prazo, setPrazo] = useState('');
  const [validade, setValidade] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  });
  const [metodologia, setMetodologia] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valor || !prazo) { setError('Preencha valor e prazo.'); return; }
    if (validade < today) { setError('A validade da proposta deve ser hoje ou uma data futura.'); return; }

    setLoading(true);
    setError('');
    const { error: err } = await createProposta({
      solicitacao_id: solicitacaoId,
      valor: parseFloat(valor),
      prazo_execucao: parseInt(prazo),
      validade_proposta: validade,
      metodologia: metodologia.trim() || undefined,
      observacoes: observacoes.trim() || undefined,
    });
    setLoading(false);
    if (err) { setError(err); return; }
    onSuccess?.();
  }

  const inputClass = 'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0C447C]/20 focus:border-[#0C447C] outline-none bg-white';
  const labelClass = 'block text-xs font-medium text-slate-700 mb-1';

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-black/[0.08] rounded-2xl p-6 space-y-4">
      <h2 className="text-base font-semibold text-[#111219]">Enviar Proposta</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Valor (R$) *</label>
          <input
            type="number"
            min="0"
            step="50"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="Ex: 1500"
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Prazo de execução (dias) *</label>
          <input
            type="number"
            min="1"
            max="365"
            value={prazo}
            onChange={(e) => setPrazo(e.target.value)}
            placeholder="Ex: 15"
            className={inputClass}
            required
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Validade desta proposta *</label>
        <input
          type="date"
          value={validade}
          min={today}
          onChange={(e) => setValidade(e.target.value)}
          className={inputClass}
          required
        />
        <p className="text-xs text-slate-400 mt-0.5">Após esta data a proposta expira automaticamente.</p>
      </div>

      <div>
        <label className={labelClass}>Metodologia (opcional)</label>
        <textarea
          value={metodologia}
          onChange={(e) => setMetodologia(e.target.value)}
          rows={3}
          placeholder="Descreva a metodologia que utilizará (ABNT NBR 14653, método comparativo, etc.)"
          className={`${inputClass} resize-none`}
        />
      </div>

      <div>
        <label className={labelClass}>Observações (opcional)</label>
        <textarea
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          rows={2}
          placeholder="Condições, requisitos ou informações adicionais"
          className={`${inputClass} resize-none`}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-[#0C447C] text-white text-sm font-medium rounded-xl hover:bg-[#0C447C]/90 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Enviando...' : 'Enviar proposta'}
      </button>
    </form>
  );
}
