'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Lock } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// -------------------------------------------------------
// Formulário interno (precisa estar dentro de <Elements>)
// -------------------------------------------------------
function CheckoutForm({
  valor,
  solicitacaoId,
}: {
  valor: number;
  solicitacaoId: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError('');

    const returnUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/avaliacoes/${solicitacaoId}?pago=true`
        : `/avaliacoes/${solicitacaoId}?pago=true`;

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
      },
    });

    setLoading(false);

    if (stripeError) {
      // Traduzir erros comuns do Stripe
      const msg = traduzirErroStripe(stripeError.message ?? '');
      setError(msg);
    }
    // Se não houver erro, o Stripe redireciona automaticamente para return_url
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-white border border-black/[0.08] rounded-2xl p-5">
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full py-3 bg-[#0C447C] text-white text-sm font-semibold rounded-xl hover:bg-[#0C447C]/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
      >
        <Lock className="w-4 h-4" />
        {loading
          ? 'Processando...'
          : `Pagar R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
      </button>

      <p className="text-center text-xs text-slate-400">
        Pagamento seguro via Stripe · Seus dados estão protegidos
      </p>
    </form>
  );
}

// -------------------------------------------------------
// Tradutor de erros Stripe → PT-BR
// -------------------------------------------------------
function traduzirErroStripe(msg: string): string {
  const map: Record<string, string> = {
    'Your card was declined': 'Cartão recusado. Verifique os dados ou use outro cartão.',
    'Your card has insufficient funds': 'Saldo insuficiente no cartão.',
    'Your card has expired': 'Cartão expirado.',
    'Your card\'s security code is incorrect': 'Código de segurança incorreto.',
    'An error occurred while processing your card': 'Erro ao processar o cartão. Tente novamente.',
    'Your card number is incorrect': 'Número do cartão incorreto.',
    'Your card does not support this type of purchase': 'Cartão não suporta este tipo de compra.',
  };
  for (const [en, pt] of Object.entries(map)) {
    if (msg.toLowerCase().includes(en.toLowerCase())) return pt;
  }
  return msg || 'Erro ao processar pagamento. Tente novamente.';
}

// -------------------------------------------------------
// Componente exportado (Provider de Elements)
// -------------------------------------------------------
interface Props {
  clientSecret: string;
  valor: number;
  solicitacaoId: string;
}

export function PagamentoClient({ clientSecret, valor, solicitacaoId }: Props) {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        locale: 'pt-BR',
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#0C447C',
            colorBackground: '#ffffff',
            colorText: '#111219',
            colorDanger: '#ef4444',
            fontFamily: 'system-ui, sans-serif',
            borderRadius: '8px',
          },
        },
      }}
    >
      <CheckoutForm valor={valor} solicitacaoId={solicitacaoId} />
    </Elements>
  );
}
