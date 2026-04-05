import { EscriturasClient } from './EscriturasClient';
import { getAnalysis } from '@/lib/actions/analyses';
import type { Modulo1Result } from '@/lib/ai/types';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface EscriturasPageProps {
  searchParams: Promise<{ analysisId?: string }>;
}

export default async function EscriturasPage({ searchParams }: EscriturasPageProps) {
  const { analysisId } = await searchParams;

  let initialData = undefined;

  if (analysisId) {
    const result = await getAnalysis(analysisId).catch(() => null);
    if (result) {
      const registral = result.tabData['registral'] as unknown as Modulo1Result | undefined;
      const prop = registral?.property_data;
      const owner = registral?.owners?.[0];

      if (prop || owner) {
        const enderecoImovel = prop?.endereco
          ? [prop.endereco.logradouro, prop.endereco.numero, prop.endereco.bairro, prop.endereco.cidade, prop.endereco.estado, prop.endereco.cep]
              .filter(Boolean).join(', ')
          : '';

        initialData = {
          imovel: {
            matricula: prop?.matricula ?? result.analysis.registration_number ?? '',
            cartorio: prop?.oficio ?? '',
            comarca: prop?.comarca ?? '',
            descricao: '',
            area: prop?.metragem?.areaTotal ? `${prop.metragem.areaTotal} ${prop.metragem.unidadeMedida ?? 'm²'}` : '',
            endereco: enderecoImovel,
          },
          outorgante: {
            nome: owner?.nome ?? '',
            cpfCnpj: owner?.cpfCnpj ?? '',
            estadoCivil: 'solteiro(a)',
            endereco: '',
          },
        };
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/documentos" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar para Documentos
        </Link>
        <h1 className="text-2xl font-bold text-[#111219] mb-1">Escrituras Públicas</h1>
        <p className="text-sm text-slate-500">Selecione o tipo e preencha os dados para gerar a minuta.</p>
      </div>

      <div className="bg-white border border-black/[0.08] rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-6 md:p-8">
        <EscriturasClient initialData={initialData} />
      </div>
    </div>
  );
}
