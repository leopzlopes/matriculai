'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Building2, Loader2, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState('');
  const [oabNumero, setOabNumero] = useState('');
  const [oabUf, setOabUf] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { signUp, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.push('/');
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const result = await signUp(email, password, name, {
      tipoUsuario: tipoUsuario || undefined,
      oabNumero: oabNumero || undefined,
      oabUf: oabUf || undefined,
    });
    if (result.error) {
      setError(result.error.message);
      setIsLoading(false);
    } else {
      setSuccess(true);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-11 h-11 bg-[#0C447C] rounded-xl flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#111219]">MatriculAI</h1>
            <p className="text-xs text-slate-400">Due Diligence Imobiliária</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-black/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-8">
          <h2 className="text-xl font-bold text-[#111219] mb-1">Criar Conta</h2>
          <p className="text-sm text-slate-400 mb-6">Comece gratuitamente</p>

          {success ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-[#0C447C]/8 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Mail className="w-8 h-8 text-[#0C447C]" />
              </div>
              <h3 className="text-base font-bold text-[#111219] mb-2">Confirme seu e-mail</h3>
              <p className="text-sm text-slate-500 mb-1">
                Enviamos um link de confirmação para:
              </p>
              <p className="text-sm font-semibold text-[#111219] mb-5">{email}</p>
              <p className="text-sm text-slate-500 mb-6">
                Acesse seu e-mail e clique no link para ativar sua conta. Se não encontrar, verifique a pasta de spam ou lixo eletrônico.
              </p>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 text-left mb-6">
                <span className="font-semibold">Não recebeu?</span> O e-mail pode levar alguns minutos. Verifique também a pasta <span className="font-semibold">Spam</span> ou <span className="font-semibold">Promoções</span>.
              </div>
              <Link href="/login" className="inline-flex items-center justify-center w-full py-2.5 bg-[#0C447C] text-white rounded-full font-semibold text-sm hover:bg-[#185FA5] transition-colors">
                Ir para o login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#111219] mb-1.5">
                  Nome completo
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-black/[0.12] bg-white text-sm text-[#111219] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0C447C]/30 focus:border-[#0C447C] transition-colors"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#111219] mb-1.5">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-black/[0.12] bg-white text-sm text-[#111219] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0C447C]/30 focus:border-[#0C447C] transition-colors"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#111219] mb-1.5">
                  Senha
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-2.5 rounded-xl border border-black/[0.12] bg-white text-sm text-[#111219] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0C447C]/30 focus:border-[#0C447C] transition-colors"
                />
              </div>

                <div>
                <label htmlFor="tipo" className="block text-sm font-medium text-[#111219] mb-1.5">
                  Qual é o seu perfil?
                </label>
                <select
                  id="tipo"
                  value={tipoUsuario}
                  onChange={(e) => setTipoUsuario(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-black/[0.12] bg-white text-sm text-[#111219] focus:outline-none focus:ring-2 focus:ring-[#0C447C]/30 focus:border-[#0C447C] transition-colors"
                >
                  <option value="" disabled>Selecione seu perfil</option>
                  <option value="comprador">Comprador / Investidor</option>
                  <option value="advogado">Advogado</option>
                  <option value="corretor">Corretor de Imóveis</option>
                  <option value="credor">Credor / Gestor de Crédito</option>
                </select>
              </div>

              {tipoUsuario === 'advogado' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="oab_numero" className="block text-sm font-medium text-[#111219] mb-1.5">
                      Número OAB <span className="text-slate-400 font-normal">(opcional)</span>
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
                      UF da OAB <span className="text-slate-400 font-normal">(opcional)</span>
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

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#0C447C] text-white rounded-full font-semibold text-sm hover:bg-[#185FA5] transition-colors disabled:opacity-50"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Criar Conta
              </button>
            </form>
          )}

          {!success && (
            <p className="mt-5 text-center text-sm text-slate-400">
              Já tem uma conta?{' '}
              <Link href="/login" className="text-[#0C447C] font-medium hover:underline">
                Entrar
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
