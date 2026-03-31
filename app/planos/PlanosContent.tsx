'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Zap, AlertCircle, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PlanosContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success') === 'true';
  const canceled = searchParams.get('canceled') === 'true';

  const [isLoading, setIsLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  async function handleCheckout() {
    setIsLoading(true);
    setCheckoutError(null);
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' });
      const json = await res.json();
      if (!res.ok) {
        setCheckoutError(json.error ?? 'Erro ao iniciar checkout');
        return;
      }
      window.location.href = json.url;
    } catch {
      setCheckoutError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-slate-900">
            MatriculAI
          </Link>
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-900">
            ← Voltar ao dashboard
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {success && (
          <div className="mb-8 flex items-start gap-3 px-5 py-4 bg-green-50 border border-green-200 rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-900">Assinatura ativada com sucesso!</p>
              <p className="text-sm text-green-700 mt-0.5">
                Seu plano Standard já está ativo. Aproveite até 30 análises por mês.
              </p>
            </div>
          </div>
        )}

        {canceled && (
          <div className="mb-8 flex items-start gap-3 px-5 py-4 bg-slate-100 border border-slate-200 rounded-xl">
            <AlertCircle className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-slate-600">
              O processo de pagamento foi cancelado. Seu plano não foi alterado.
            </p>
          </div>
        )}

        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-3">Planos MatriculAI</h1>
          <p className="text-slate-500 text-lg">
            Análise de matrículas com inteligência artificial — rápida, precisa e segura.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Freemium */}
          <Card className="border-2 border-slate-200">
            <CardHeader className="pb-4">
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-1">
                Freemium
              </p>
              <CardTitle className="text-3xl font-bold text-slate-900">
                Grátis
              </CardTitle>
              <p className="text-sm text-slate-500">Para começar a explorar</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-8">
                <FeatureRow included>3 análises completas (vitalício)</FeatureRow>
                <FeatureRow included>Módulo Registral (RI)</FeatureRow>
                <FeatureRow included>Módulo Penhorabilidade (CPC/CLT)</FeatureRow>
                <FeatureRow included>Módulo Avaliação de mercado</FeatureRow>
                <FeatureRow included>OCR para PDFs escaneados</FeatureRow>
                <FeatureRow>Suporte prioritário</FeatureRow>
                <FeatureRow>Volume acima de 3 análises</FeatureRow>
              </ul>
              <Button variant="outline" className="w-full" disabled>
                Plano atual
              </Button>
            </CardContent>
          </Card>

          {/* Standard */}
          <Card className="border-2 border-slate-900 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-slate-900 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Recomendado
              </span>
            </div>
            <CardHeader className="pb-4">
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-1">
                Standard
              </p>
              <CardTitle className="text-3xl font-bold text-slate-900">
                R$&nbsp;497
                <span className="text-base font-normal text-slate-500">/mês</span>
              </CardTitle>
              <p className="text-sm text-slate-500">Para uso profissional contínuo</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-8">
                <FeatureRow included>30 análises por mês</FeatureRow>
                <FeatureRow included>Módulo Registral (RI)</FeatureRow>
                <FeatureRow included>Módulo Penhorabilidade (CPC/CLT)</FeatureRow>
                <FeatureRow included>Módulo Avaliação de mercado</FeatureRow>
                <FeatureRow included>OCR para PDFs escaneados</FeatureRow>
                <FeatureRow included>Suporte prioritário</FeatureRow>
                <FeatureRow included>Renovação automática mensal</FeatureRow>
              </ul>

              {checkoutError && (
                <p className="text-sm text-red-600 mb-3">{checkoutError}</p>
              )}

              <Button
                className="w-full"
                onClick={handleCheckout}
                disabled={isLoading}
              >
                <Zap className="w-4 h-4 mr-2" />
                {isLoading ? 'Aguarde...' : 'Assinar agora'}
              </Button>
              <p className="text-xs text-slate-400 text-center mt-3">
                Pagamento seguro via Stripe · Cancele quando quiser
              </p>
            </CardContent>
          </Card>
        </div>

        <p className="text-center text-xs text-slate-400 mt-10">
          Dúvidas? Entre em contato pelo e-mail suporte@matriculai.com.br
        </p>
      </main>
    </div>
  );
}

function FeatureRow({
  children,
  included = false,
}: {
  children: React.ReactNode;
  included?: boolean;
}) {
  return (
    <li className="flex items-center gap-3">
      {included ? (
        <Check className="w-4 h-4 text-slate-900 flex-shrink-0" />
      ) : (
        <X className="w-4 h-4 text-slate-300 flex-shrink-0" />
      )}
      <span className={`text-sm ${included ? 'text-slate-700' : 'text-slate-400'}`}>
        {children}
      </span>
    </li>
  );
}
