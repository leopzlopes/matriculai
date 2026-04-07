import Link from 'next/link';
import { FileText, Scroll, ArrowRight, Clock, Trash2, ExternalLink } from 'lucide-react';
import { getUserDocumentos } from '@/lib/actions/documentos';
import { deleteDocumento } from '@/lib/actions/documentos';

async function DeleteButton({ id }: { id: string }) {
  async function handleDelete() {
    'use server';
    await deleteDocumento(id);
  }
  return (
    <form action={handleDelete}>
      <button
        type="submit"
        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        title="Deletar minuta"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </form>
  );
}

export default async function DocumentosPage() {
  const documentos = await getUserDocumentos();

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#111219] mb-1">Geração de Minutas</h1>
        <p className="text-sm text-slate-500">
          Gere minutas jurídicas completas com IA, prontas para revisão com advogado e tabelião.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Escrituras */}
        <Link
          href="/documentos/escrituras"
          className="group bg-white border border-black/[0.08] rounded-2xl p-6 hover:border-[#0C447C]/30 hover:shadow-[0_4px_20px_rgba(12,68,124,0.08)] transition-all"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-[#0C447C]/8 rounded-xl flex items-center justify-center">
              <Scroll className="w-6 h-6 text-[#0C447C]" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#0C447C] transition-colors" />
          </div>
          <h2 className="text-base font-bold text-[#111219] mb-2">Escrituras Públicas</h2>
          <p className="text-sm text-slate-500 mb-4 leading-relaxed">
            Minutas para lavratura em tabelionato de notas.
          </p>
          <ul className="space-y-1">
            {[
              'Compra e Venda Simples',
              'C&V com Alienação Fiduciária',
              'Doação',
              'Permuta',
              'C&V com Hipoteca',
            ].map((item) => (
              <li key={item} className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-1 h-1 rounded-full bg-slate-300 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </Link>

        {/* Contratos */}
        <Link
          href="/documentos/contratos"
          className="group bg-white border border-black/[0.08] rounded-2xl p-6 hover:border-[#0C447C]/30 hover:shadow-[0_4px_20px_rgba(12,68,124,0.08)] transition-all"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-emerald-600" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-colors" />
          </div>
          <h2 className="text-base font-bold text-[#111219] mb-2">Contratos Particulares</h2>
          <p className="text-sm text-slate-500 mb-4 leading-relaxed">
            Contratos imobiliários sem necessidade de tabelionato.
          </p>
          <ul className="space-y-1">
            {[
              'Compromisso de C&V',
              'C&V com Financiamento',
              'Locação Residencial',
              'Locação Comercial',
              'Cessão de Direitos',
            ].map((item) => (
              <li key={item} className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-1 h-1 rounded-full bg-slate-300 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </Link>
      </div>

      {/* Histórico */}
      <div className="mt-10">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-700">Minutas Geradas</h2>
          {documentos.length > 0 && (
            <span className="ml-auto text-xs text-slate-400">{documentos.length} minuta{documentos.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        {documentos.length === 0 ? (
          <div className="bg-white border border-black/[0.06] rounded-2xl p-8 text-center">
            <p className="text-sm text-slate-400">Nenhuma minuta gerada ainda.</p>
            <p className="text-xs text-slate-300 mt-1">As minutas geradas aparecerão aqui automaticamente.</p>
          </div>
        ) : (
          <div className="bg-white border border-black/[0.08] rounded-2xl divide-y divide-black/[0.05]">
            {documentos.map((doc) => {
              const isEscritura = doc.tipo === 'escritura';
              const dataFormatada = new Date(doc.created_at).toLocaleDateString('pt-BR', {
                day: '2-digit', month: 'short', year: 'numeric',
              });
              return (
                <div key={doc.id} className="flex items-center gap-3 px-4 py-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isEscritura ? 'bg-[#0C447C]/8' : 'bg-emerald-50'}`}>
                    {isEscritura
                      ? <Scroll className="w-4 h-4 text-[#0C447C]" />
                      : <FileText className="w-4 h-4 text-emerald-600" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#111219] truncate">{doc.titulo}</p>
                    <p className="text-xs text-slate-400">{dataFormatada}</p>
                  </div>
                  <Link
                    href={`/documentos/${doc.id}`}
                    className="inline-flex items-center gap-1 text-xs text-[#0C447C] hover:underline flex-shrink-0"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Abrir
                  </Link>
                  <DeleteButton id={doc.id} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400 text-center mt-8">
        Minutas geradas por IA — revisar com advogado e tabelião antes da lavratura ou assinatura
      </p>
    </div>
  );
}
