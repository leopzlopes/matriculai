import { NovaAvaliacaoForm } from './NovaAvaliacaoForm';

interface PageProps {
  searchParams: Promise<{
    from_matricula?: string;
    tipo?: string;
    uf?: string;
    cidade?: string;
    endereco?: string;
    area_total_m2?: string;
  }>;
}

export default async function NovaAvaliacaoPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const initialData = {
    from_matricula: params.from_matricula,
    tipo: params.tipo,
    uf: params.uf,
    cidade: params.cidade,
    endereco: params.endereco,
    area_total_m2: params.area_total_m2 ? parseFloat(params.area_total_m2) : undefined,
  };

  const hasPreFill = Boolean(params.from_matricula);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-[#111219] mb-1">Nova Solicitação de Avaliação</h1>
      <p className="text-sm text-slate-500 mb-6">
        Preencha os dados do imóvel para receber propostas de avaliadores credenciados.
      </p>
      <NovaAvaliacaoForm initialData={initialData} hasPreFill={hasPreFill} />
    </div>
  );
}
