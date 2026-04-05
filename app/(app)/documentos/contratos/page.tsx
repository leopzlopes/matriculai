import { ContratosClient } from './ContratosClient';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ContratosPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/documentos" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar para Documentos
        </Link>
        <h1 className="text-2xl font-bold text-[#111219] mb-1">Contratos Particulares</h1>
        <p className="text-sm text-slate-500">Selecione o tipo e preencha os dados para gerar o contrato.</p>
      </div>

      <div className="bg-white border border-black/[0.08] rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-6 md:p-8">
        <ContratosClient />
      </div>
    </div>
  );
}
