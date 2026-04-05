'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Building2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.push('/');
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const result = await signIn(email, password);
    if (result.error) {
      setError(result.error.message);
      setIsLoading(false);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <a href="/landing.html" className="flex items-center justify-center gap-3 mb-8 group">
          <div className="w-11 h-11 bg-[#0C447C] rounded-xl flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#111219] group-hover:text-[#0C447C] transition-colors">MatriculAI</h1>
            <p className="text-xs text-slate-400">Due Diligence Imobiliária</p>
          </div>
        </a>

        <div className="bg-white rounded-2xl border border-black/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-8">
          <h2 className="text-xl font-bold text-[#111219] mb-1">Entrar</h2>
          <p className="text-sm text-slate-400 mb-6">Acesse sua conta</p>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              Entrar
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-400">
            Não tem uma conta?{' '}
            <Link href="/signup" className="text-[#0C447C] font-medium hover:underline">
              Cadastre-se
            </Link>
          </p>

          <div className="mt-4 pt-4 border-t border-black/[0.06] text-center">
            <a href="/landing.html" className="text-xs text-slate-400 hover:text-[#0C447C] transition-colors">
              ← Conhecer o MatriculAI
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
