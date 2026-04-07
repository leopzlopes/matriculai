import { getDocumento } from '@/lib/actions/documentos';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Scroll, FileText } from 'lucide-react';
import { ExportarDocxButton } from './ExportarDocxButton';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DocumentoDetalhePage({ params }: PageProps) {
  const { id } = await params;
  const doc = await getDocumento(id);
  if (!doc) notFound();

  const isEscritura = doc.tipo === 'escritura';
  const dataFormatada = new Date(doc.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Link href="/documentos" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar para Documentos
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isEscritura ? 'bg-[#0C447C]/8' : 'bg-emerald-50'}`}>
              {isEscritura
                ? <Scroll className="w-5 h-5 text-[#0C447C]" />
                : <FileText className="w-5 h-5 text-emerald-600" />
              }
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#111219] leading-tight">{doc.titulo}</h1>
              <p className="text-xs text-slate-400 mt-0.5">Gerado em {dataFormatada}</p>
            </div>
          </div>

          <ExportarDocxButton titulo={doc.titulo} texto={doc.texto} />
        </div>
      </div>

      {/* Document preview */}
      <div className="bg-white border border-black/[0.08] rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-8">
        <h2 className="text-base font-bold text-center text-[#111219] mb-8 uppercase tracking-wide">
          {doc.titulo}
        </h2>
        <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-line font-serif">
          {doc.texto}
        </div>
      </div>

      <p className="text-xs text-slate-400 text-center mt-6 italic">
        Minuta gerada por IA — revisar com advogado e tabelião antes da lavratura ou assinatura
      </p>
    </div>
  );
}
