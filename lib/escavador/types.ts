export interface ProcessoCNJ {
  id: number;
  numero_cnj: string;
  titulo_polo_ativo: string;
  titulo_polo_passivo: string;
  situacao: string | null;
  tribunal: { sigla: string; nome: string } | null;
  data_inicio: string | null;
  ultima_movimentacao: string | null;
}

export interface Movimentacao {
  id: number;
  data: string;
  descricao: string;
  tipo: string | null;
}

export interface ProcessoEnvolvido {
  id: number;
  numero_cnj: string;
  titulo_polo_ativo: string;
  titulo_polo_passivo: string;
  polo: string;
  situacao: string | null;
  tribunal: { sigla: string } | null;
  data_inicio: string | null;
  ultima_movimentacao: string | null;
}

export interface ParecerResult {
  parecer: string;
  nivel_risco: 'alto' | 'medio' | 'baixo';
}
