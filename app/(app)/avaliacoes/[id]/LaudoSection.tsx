'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, CheckCircle, ExternalLink, AlertCircle } from 'lucide-react';
import { uploadLaudo, confirmarRecebimento } from '@/lib/actions/avaliacoes';
import type { PropostaSalva } from '@/lib/avaliacoes/types';

interface Props {
  proposta: PropostaSalva;
  isDono: boolean;
  isAvaliador: boolean;
}

export function LaudoSection({ proposta, isDono, isAvaliador }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [laudoUrl, setLaudoUrl] = useState<string | null>(proposta.laudo_url);
  const [laudoAt, setLaudoAt] = useState<string | null>(proposta.laudo_entregue_at);
  const [propostaStatus, setPropostaStatus] = useState(proposta.status);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');

    const { url, error: err } = await uploadLaudo(proposta.id, file);
    setUploading(false);
    if (err) { setError(err); return; }
    if (url) {
      setLaudoUrl(url);
      setLaudoAt(new Date().toISOString());
      setSuccess('Laudo entregue com sucesso!');
    }
    if (fileRef.current) fileRef.current.value = '';
  }

  async function handleConfirmar() {
    setConfirming(true);
    setError('');
    const { error: err } = await confirmarRecebimento(proposta.id);
    setConfirming(false);
    if (err) { setError(err); return; }
    setPropostaStatus('concluido');
    setSuccess('Recebimento confirmado! O pagamento foi liberado ao avaliador.');
    setTimeout(() => router.refresh(), 1500);
  }

  const isConcluido = propostaStatus === 'concluido';

  return (
    <div className="space-y-4">
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

      {/* ---- Avaliador: upload do laudo ---- */}
      {isAvaliador && !isDono && (
        <div className="bg-white border border-black/[0.08] rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-[#111219] mb-1">Entrega do Laudo</h3>
          <p className="text-xs text-slate-500 mb-4">
            Faça o upload do laudo em PDF. Após a entrega, o cliente será notificado para confirmar o recebimento.
          </p>

          {laudoUrl ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-emerald-700">Laudo entregue</p>
                  {laudoAt && (
                    <p className="text-xs text-emerald-600">
                      {new Date(laudoAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
                <a href={laudoUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[#0C447C] hover:underline">
                  <ExternalLink className="w-3 h-3" />
                  Ver
                </a>
              </div>

              {!isConcluido && (
                <p className="text-xs text-slate-400 text-center">
                  Aguardando o cliente confirmar o recebimento...
                </p>
              )}
              {isConcluido && (
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-600">
                  <CheckCircle className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  Recebimento confirmado. Pagamento liberado.
                </div>
              )}
            </div>
          ) : (
            <div>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={handleUpload}
                disabled={uploading}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl py-8 hover:border-[#0C447C]/40 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-[#0C447C] border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-slate-500">Enviando laudo...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-slate-400" />
                    <span className="text-sm font-medium text-slate-600">Clique para selecionar o laudo</span>
                    <span className="text-xs text-slate-400">PDF · máx. 20 MB</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ---- Cliente: visualizar e confirmar ---- */}
      {isDono && (
        <div className="bg-white border border-black/[0.08] rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-[#111219] mb-1">Laudo de Avaliação</h3>
          <p className="text-xs text-slate-500 mb-4">
            {isConcluido
              ? 'O laudo foi entregue e o recebimento confirmado.'
              : 'Após receber o laudo, confirme o recebimento para liberar o pagamento ao avaliador.'}
          </p>

          {laudoUrl ? (
            <div className="space-y-4">
              <a href={laudoUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 hover:border-[#0C447C]/30 transition-colors group">
                <FileText className="w-5 h-5 text-[#0C447C] flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#111219] group-hover:text-[#0C447C]">Baixar laudo de avaliação</p>
                  {laudoAt && (
                    <p className="text-xs text-slate-400">
                      Entregue em {new Date(laudoAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                    </p>
                  )}
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-[#0C447C]" />
              </a>

              {!isConcluido && (
                <button
                  type="button"
                  onClick={handleConfirmar}
                  disabled={confirming}
                  className="w-full py-3 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  {confirming ? 'Confirmando...' : 'Confirmar recebimento e liberar pagamento'}
                </button>
              )}

              {isConcluido && (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  Recebimento confirmado. Avaliação concluída com sucesso.
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center py-8 text-center">
              <FileText className="w-10 h-10 text-slate-200 mb-3" />
              <p className="text-sm text-slate-500">Aguardando o avaliador enviar o laudo...</p>
              <p className="text-xs text-slate-400 mt-1">Você receberá uma notificação quando estiver disponível.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
