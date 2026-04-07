import { ProcessosClient } from './ProcessosClient';
import { Scale } from 'lucide-react';

export default function ProcessosPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-1">
          <Scale className="w-5 h-5 text-[#0C447C]" />
          <h1 className="text-2xl font-bold text-[#111219]">Pesquisa Judicial</h1>
        </div>
        <p className="text-sm text-slate-500">
          Consulte processos judiciais por nome/CPF da pessoa ou pelo número CNJ do processo.
        </p>
      </div>

      <ProcessosClient />
    </div>
  );
}
