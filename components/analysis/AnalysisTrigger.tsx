'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface AnalysisTriggerProps {
  analysisId: string;
  status: string;
}

export function AnalysisTrigger({ analysisId, status: initialStatus }: AnalysisTriggerProps) {
  const router = useRouter();
  const triggered = useRef(false);
  const [localStatus, setLocalStatus] = useState(initialStatus);
  const [error, setError] = useState<string | null>(null);

  // Trigger analysis on mount if pending
  useEffect(() => {
    if (triggered.current) return;
    if (initialStatus !== 'pending') return;
    triggered.current = true;

    fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analysisId }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (!json.success) {
          setError(json.error ?? 'Erro ao iniciar análise');
          setLocalStatus('error');
        }
      })
      .catch(() => {
        setError('Erro de conexão ao iniciar análise');
        setLocalStatus('error');
      });
  }, [analysisId, initialStatus]);

  // Poll via router.refresh() while processing
  useEffect(() => {
    if (localStatus === 'completed' || localStatus === 'error') return;
    if (initialStatus === 'completed') return;

    const interval = setInterval(() => {
      router.refresh();
    }, 4000);

    return () => clearInterval(interval);
  }, [localStatus, initialStatus, router]);

  // Sync localStatus when server re-renders with new status
  useEffect(() => {
    setLocalStatus(initialStatus);
  }, [initialStatus]);

  if (initialStatus === 'completed') return null;

  if (localStatus === 'error') {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm mb-6">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <span>{error ?? 'Erro ao processar análise. Tente novamente.'}</span>
      </div>
    );
  }

  if (localStatus === 'completed') {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm mb-6">
        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
        <span>Análise concluída com sucesso.</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm mb-6">
      <Loader2 className="w-5 h-5 flex-shrink-0 animate-spin" />
      <span>Analisando documento com IA... Isso pode levar até 60 segundos.</span>
    </div>
  );
}
