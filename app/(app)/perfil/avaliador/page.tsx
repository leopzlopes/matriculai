'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, AlertCircle, CreditCard, ExternalLink } from 'lucide-react';
import {
  getOrCreateAvaliadorPerfil,
  updateAvaliadorPerfil,
  aceitarDeclaracao,
} from '@/lib/actions/avaliacoes';
import type { AvaliadorPerfil } from '@/lib/avaliacoes/types';
import { LABEL_TIPO_IMOVEL, type TipoImovel } from '@/lib/avaliacoes/types';

const CREA_REGEX = /^[A-Z]{2}-\d+\/[A-Z]$/;
const ESPECIALIDADES: TipoImovel[] = ['residencial', 'comercial', 'rural', 'industrial', 'terreno'];

function validarCrea(valor: string): boolean {
  if (!valor.trim()) return true; // vazio é ok (opcional)
  return CREA_REGEX.test(valor.trim().toUpperCase());
}

export default function PerfilAvaliadorPage() {
  const searchParams = useSearchParams();
  const [perfil, setPerfil] = useState<AvaliadorPerfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [onboardingLoading, setOnboardingLoading] = useState(false);

  // Feedback de retorno do onboarding Stripe
  const onboardStatus = searchParams.get('onboard');

  // Credenciais
  const [creaNumero, setCreaNumero] = useState('');
  const [cnaiNumero, setCnaiNumero] = useState('');
  const [declaracaoCheck, setDeclaracaoCheck] = useState(false);

  // Perfil público
  const [bio, setBio] = useState('');
  const [especialidades, setEspecialidades] = useState<TipoImovel[]>([]);

  useEffect(() => {
    getOrCreateAvaliadorPerfil().then((p) => {
      if (p) {
        setPerfil(p);
        setCreaNumero(p.crea_numero ?? '');
        setCnaiNumero(p.cnai_numero ?? '');
        setBio(p.bio ?? '');
        setEspecialidades(p.especialidades ?? []);
        if (p.declaracao_aceita) setDeclaracaoCheck(true);
      }
      setLoading(false);
    });
  }, []);

  const creaValido = validarCrea(creaNumero);
  const creaVerificado = perfil?.credencial_verificada ?? false;
  const declaracaoJaAceita = perfil?.declaracao_aceita ?? false;

  async function handleSaveCredenciais(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (creaNumero.trim() && !creaValido) {
      setError('Formato de CREA inválido. Use: UF-XXXXX/D (ex: MS-12345/T)');
      return;
    }
    if (!declaracaoJaAceita && !declaracaoCheck) {
      setError('Você precisa aceitar a declaração para salvar.');
      return;
    }

    setSaving(true);
    const { error: err } = await updateAvaliadorPerfil({
      crea_numero: creaNumero.trim().toUpperCase() || null,
      cnai_numero: cnaiNumero.trim() || null,
    });

    if (!err && !declaracaoJaAceita && declaracaoCheck) {
      await aceitarDeclaracao();
    }

    setSaving(false);
    if (err) { setError(err); return; }

    setSuccess('Credenciais salvas com sucesso!');
    setPerfil((p) => p ? { ...p, crea_numero: creaNumero.trim().toUpperCase() || null, cnai_numero: cnaiNumero.trim() || null, declaracao_aceita: true } : p);
    setTimeout(() => setSuccess(''), 3000);
  }

  async function handleSavePerfil(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    const { error: err } = await updateAvaliadorPerfil({
      bio: bio.trim() || null,
      especialidades,
    });

    setSaving(false);
    if (err) { setError(err); return; }
    setSuccess('Perfil atualizado!');
    setTimeout(() => setSuccess(''), 3000);
  }

  async function handleOnboarding() {
    setOnboardingLoading(true);
    try {
      const res = await fetch('/api/stripe/connect/onboard', { method: 'POST' });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setError(data.error ?? 'Erro ao configurar pagamentos');
    } catch {
      setError('Erro ao conectar com o servidor');
    } finally {
      setOnboardingLoading(false);
    }
  }

  function toggleEspecialidade(e: TipoImovel) {
    setEspecialidades((prev) =>
      prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]
    );
  }

  const inputClass = 'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0C447C]/20 focus:border-[#0C447C] outline-none bg-white';
  const labelClass = 'block text-xs font-medium text-slate-700 mb-1';

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="h-8 bg-slate-100 rounded-lg w-48 animate-pulse mb-6" />
        <div className="bg-white border border-black/[0.08] rounded-2xl p-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#111219]">Perfil de Avaliador</h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure suas credenciais e perfil público para receber solicitações de avaliação.
        </p>
      </div>

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

      {/* ---- Seção 1: Credenciais ---- */}
      <div className="bg-white border border-black/[0.08] rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-[#111219] mb-5">Credenciais Profissionais</h2>

        <form onSubmit={handleSaveCredenciais} className="space-y-4">
          {/* CREA */}
          <div>
            <label className={labelClass}>Número do CREA</label>
            <div className="relative">
              <input
                value={creaNumero}
                onChange={(e) => { setCreaNumero(e.target.value); setError(''); }}
                placeholder="Ex: MS-12345/T"
                className={`${inputClass} pr-8 ${
                  creaNumero.trim()
                    ? creaValido
                      ? 'border-emerald-300 focus:border-emerald-400'
                      : 'border-red-300 focus:border-red-400'
                    : ''
                }`}
              />
              {creaNumero.trim() && (
                <div className="absolute right-2.5 top-2.5">
                  {creaValido ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              )}
            </div>
            {creaNumero.trim() && !creaValido && (
              <p className="text-xs text-red-500 mt-1">Formato esperado: UF-XXXXX/D (ex: MS-12345/T)</p>
            )}
            {creaNumero.trim() && creaValido && (
              <p className="text-xs text-emerald-600 mt-1">Formato válido</p>
            )}
            {creaVerificado ? (
              <span className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <CheckCircle className="w-3 h-3" />
                Verificado via CONFEA
              </span>
            ) : null}
          </div>

          {/* CNAI */}
          <div>
            <label className={labelClass}>Número do CNAI (opcional)</label>
            <input
              value={cnaiNumero}
              onChange={(e) => setCnaiNumero(e.target.value)}
              placeholder="Cadastro Nacional de Avaliadores Imobiliários"
              className={inputClass}
            />
          </div>

          {/* Declaração (somente se não verificado e ainda não aceito) */}
          {!creaVerificado && (
            <div className={`rounded-xl border p-4 ${declaracaoJaAceita ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
              {declaracaoJaAceita ? (
                <div className="flex items-center gap-2 text-sm text-emerald-700">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  Declaração de responsabilidade aceita.
                </div>
              ) : (
                <>
                  <p className="text-xs text-amber-800 leading-relaxed mb-3">
                    {'"'}Declaro, sob responsabilidade pessoal e ciente de que a prestação de informações
                    falsas resultará na suspensão imediata desta conta, que sou profissional habilitado
                    pelo CREA/CONFEA com o número informado acima.{'"'}
                  </p>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={declaracaoCheck}
                      onChange={(e) => setDeclaracaoCheck(e.target.checked)}
                      className="w-4 h-4 accent-[#0C447C] mt-0.5 flex-shrink-0"
                    />
                    <span className="text-xs text-amber-800 font-medium">
                      Li e aceito os termos acima
                    </span>
                  </label>
                </>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={saving || (!declaracaoJaAceita && !declaracaoCheck) || (!!creaNumero.trim() && !creaValido)}
            className="w-full py-2.5 bg-[#0C447C] text-white text-sm font-medium rounded-xl hover:bg-[#0C447C]/90 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Salvando...' : 'Salvar credenciais'}
          </button>
        </form>
      </div>

      {/* ---- Seção 2: Perfil público ---- */}
      <div className="bg-white border border-black/[0.08] rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-[#111219] mb-5">Perfil Público</h2>

        <form onSubmit={handleSavePerfil} className="space-y-4">
          <div>
            <label className={labelClass}>Bio (máx 300 caracteres)</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 300))}
              rows={4}
              placeholder="Conte sua experiência profissional, certificações e áreas de atuação..."
              className={`${inputClass} resize-none`}
            />
            <p className="text-xs text-slate-400 text-right mt-0.5">{bio.length}/300</p>
          </div>

          <div>
            <label className={labelClass}>Especialidades</label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {ESPECIALIDADES.map((e) => (
                <label key={e} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer transition-colors ${
                  especialidades.includes(e)
                    ? 'bg-[#E6F1FB] border-[#0C447C]/30 text-[#0C447C]'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}>
                  <input
                    type="checkbox"
                    checked={especialidades.includes(e)}
                    onChange={() => toggleEspecialidade(e)}
                    className="sr-only"
                  />
                  <span className="text-xs font-medium">{LABEL_TIPO_IMOVEL[e]}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 bg-[#0C447C] text-white text-sm font-medium rounded-xl hover:bg-[#0C447C]/90 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Salvando...' : 'Salvar perfil'}
          </button>
        </form>
      </div>

      {/* ---- Seção 3: Pagamentos ---- */}
      <div className="bg-white border border-black/[0.08] rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <CreditCard className="w-4 h-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-[#111219]">Recebimento de Pagamentos</h2>
        </div>

        {onboardStatus === 'success' && (
          <div className="mb-4 flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            Conta configurada com sucesso!
          </div>
        )}
        {onboardStatus === 'refresh' && (
          <div className="mb-4 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            O link expirou. Clique abaixo para tentar novamente.
          </div>
        )}

        {perfil?.stripe_account_id ? (
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
              <CheckCircle className="w-3.5 h-3.5" />
              Pagamentos configurados
            </span>
            <a
              href="/api/stripe/connect/dashboard"
              className="inline-flex items-center gap-1 text-xs text-[#0C447C] hover:underline"
            >
              <ExternalLink className="w-3 h-3" />
              Ver dashboard
            </a>
          </div>
        ) : (
          <div>
            <p className="text-xs text-slate-500 mb-3">
              Configure sua conta para receber pagamentos pelas avaliações realizadas na plataforma.
            </p>
            <button
              type="button"
              onClick={handleOnboarding}
              disabled={onboardingLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0C447C] text-white text-sm font-medium rounded-xl hover:bg-[#0C447C]/90 disabled:opacity-50 transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              {onboardingLoading ? 'Redirecionando...' : 'Configurar recebimento de pagamentos'}
            </button>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400 text-center">
        Seu perfil é visível para clientes ao receberem sua proposta.
      </p>
    </div>
  );
}
