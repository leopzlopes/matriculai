'use client';

import { useState } from 'react';
import { updateProfile } from '@/lib/actions/profile';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface ProfileFormProps {
  initialData: {
    tipo_usuario: string | null;
    oab_numero: string | null;
    oab_uf: string | null;
    creci_numero: string | null;
    creci_uf: string | null;
  };
}

const TIPO_LABELS: Record<string, string> = {
  comprador: 'Comprador / Investidor',
  advogado: 'Advogado',
  corretor: 'Corretor de Imóveis',
  credor: 'Credor / Gestor de Crédito',
};

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [tipoUsuario, setTipoUsuario] = useState(initialData.tipo_usuario ?? '');
  const [oabNumero, setOabNumero] = useState(initialData.oab_numero ?? '');
  const [oabUf, setOabUf] = useState(initialData.oab_uf ?? '');
  const [creciNumero, setCreciNumero] = useState(initialData.creci_numero ?? '');
  const [creciUf, setCreciUf] = useState(initialData.creci_uf ?? '');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const result = await updateProfile({
      tipo_usuario: tipoUsuario || undefined,
      oab_numero: oabNumero || undefined,
      oab_uf: oabUf || undefined,
      creci_numero: creciNumero || undefined,
      creci_uf: creciUf || undefined,
    });

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="tipo" className="block text-sm font-medium text-[#111219] mb-1.5">
          Perfil profissional
        </label>
        <select
          id="tipo"
          value={tipoUsuario}
          onChange={(e) => setTipoUsuario(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-black/[0.12] bg-white text-sm text-[#111219] focus:outline-none focus:ring-2 focus:ring-[#0C447C]/30 focus:border-[#0C447C] transition-colors"
        >
          <option value="">Não informado</option>
          {Object.entries(TIPO_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>

      {tipoUsuario === 'advogado' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="oab_numero" className="block text-sm font-medium text-[#111219] mb-1.5">
              Número OAB
            </label>
            <input
              id="oab_numero"
              type="text"
              placeholder="Ex: 123456"
              value={oabNumero}
              onChange={(e) => setOabNumero(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-black/[0.12] bg-white text-sm text-[#111219] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0C447C]/30 focus:border-[#0C447C] transition-colors"
            />
          </div>
          <div>
            <label htmlFor="oab_uf" className="block text-sm font-medium text-[#111219] mb-1.5">
              UF da OAB
            </label>
            <input
              id="oab_uf"
              type="text"
              placeholder="Ex: SP"
              value={oabUf}
              onChange={(e) => setOabUf(e.target.value.toUpperCase())}
              maxLength={2}
              className="w-full px-4 py-2.5 rounded-xl border border-black/[0.12] bg-white text-sm text-[#111219] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0C447C]/30 focus:border-[#0C447C] transition-colors"
            />
          </div>
        </div>
      )}

      {tipoUsuario === 'corretor' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="creci_numero" className="block text-sm font-medium text-[#111219] mb-1.5">
              Número CRECI
            </label>
            <input
              id="creci_numero"
              type="text"
              placeholder="Ex: 123456"
              value={creciNumero}
              onChange={(e) => setCreciNumero(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-black/[0.12] bg-white text-sm text-[#111219] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0C447C]/30 focus:border-[#0C447C] transition-colors"
            />
          </div>
          <div>
            <label htmlFor="creci_uf" className="block text-sm font-medium text-[#111219] mb-1.5">
              UF do CRECI
            </label>
            <input
              id="creci_uf"
              type="text"
              placeholder="Ex: SP"
              value={creciUf}
              onChange={(e) => setCreciUf(e.target.value.toUpperCase())}
              maxLength={2}
              className="w-full px-4 py-2.5 rounded-xl border border-black/[0.12] bg-white text-sm text-[#111219] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0C447C]/30 focus:border-[#0C447C] transition-colors"
            />
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          Perfil atualizado com sucesso!
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0C447C] text-white rounded-full font-semibold text-sm hover:bg-[#185FA5] transition-colors disabled:opacity-50"
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        Salvar alterações
      </button>
    </form>
  );
}
