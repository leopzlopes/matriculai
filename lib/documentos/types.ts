export type TipoEscritura =
  | 'compra_venda_simples'
  | 'compra_venda_alienacao_fiduciaria'
  | 'doacao'
  | 'permuta'
  | 'compra_venda_hipoteca';

export type TipoContrato =
  | 'compromisso_compra_venda'
  | 'compra_venda_financiamento'
  | 'locacao_residencial'
  | 'locacao_comercial'
  | 'cessao_direitos';

export type TipoDocumento = TipoEscritura | TipoContrato;

export interface Parte {
  nome: string;
  cpfCnpj: string;
  estadoCivil: string;
  regimeBens?: string;
  endereco: string;
  qualificacao?: string;
}

export interface DadosImovel {
  matricula: string;
  cartorio: string;
  comarca: string;
  descricao: string;
  area: string;
  endereco: string;
}

export interface DadosDocumento {
  tipo: TipoDocumento;
  outorgantes: Parte[];
  outorgados: Parte[];
  imovel: DadosImovel;
  valor?: string;
  condicoesPagamento?: string;
  camposEspecificos?: Record<string, string>;
}

export interface DocumentoGerado {
  titulo: string;
  texto: string;
}

export const LABEL_ESCRITURA: Record<TipoEscritura, string> = {
  compra_venda_simples: 'Escritura de Compra e Venda Simples',
  compra_venda_alienacao_fiduciaria: 'Escritura de C&V com Alienação Fiduciária',
  doacao: 'Escritura de Doação',
  permuta: 'Escritura de Permuta',
  compra_venda_hipoteca: 'Escritura de C&V com Pacto Adjeto de Hipoteca',
};

export const LABEL_CONTRATO: Record<TipoContrato, string> = {
  compromisso_compra_venda: 'Contrato de Compromisso de Compra e Venda',
  compra_venda_financiamento: 'Contrato de C&V com Financiamento',
  locacao_residencial: 'Contrato de Locação Residencial',
  locacao_comercial: 'Contrato de Locação Comercial',
  cessao_direitos: 'Contrato de Cessão de Direitos',
};
