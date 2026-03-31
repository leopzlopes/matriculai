'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, Loader2, Lock } from 'lucide-react';

interface ExportButtonsProps {
  analysisId: string;
  registrationNumber: string;
  plan: 'freemium' | 'standard';
  analysisStatus?: string | null;
}

export function ExportButtons({
  analysisId,
  registrationNumber,
  plan,
  analysisStatus,
}: ExportButtonsProps) {
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingDocx, setLoadingDocx] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isStandard = plan === 'standard';
  const isReady = analysisStatus === 'completed';
  const disabled = !isStandard || !isReady;

  async function download(format: 'pdf' | 'docx') {
    setError(null);
    const setLoading = format === 'pdf' ? setLoadingPdf : setLoadingDocx;
    setLoading(true);

    try {
      const res = await fetch(`/api/export/${analysisId}/${format}`);
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.error ?? 'Erro ao gerar arquivo');
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const safeName = registrationNumber.replace(/[^a-zA-Z0-9-]/g, '-');
      a.href = url;
      a.download = `matricula-${safeName}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  const lockedTitle = !isStandard
    ? 'Disponível no plano Standard'
    : !isReady
    ? 'Análise ainda não concluída'
    : undefined;

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => download('docx')}
          disabled={disabled || loadingDocx}
          title={lockedTitle}
        >
          {loadingDocx ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : disabled ? (
            <Lock className="w-4 h-4 mr-2" />
          ) : (
            <FileText className="w-4 h-4 mr-2" />
          )}
          Exportar DOCX
        </Button>

        <Button
          size="sm"
          onClick={() => download('pdf')}
          disabled={disabled || loadingPdf}
          title={lockedTitle}
        >
          {loadingPdf ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : disabled ? (
            <Lock className="w-4 h-4 mr-2" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Exportar PDF
        </Button>
      </div>

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}

      {!isStandard && (
        <p className="text-xs text-slate-400">
          Exportação disponível no{' '}
          <a href="/planos" className="underline hover:text-slate-700">
            plano Standard
          </a>
        </p>
      )}
    </div>
  );
}
