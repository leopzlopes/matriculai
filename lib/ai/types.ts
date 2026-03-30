import { Alert } from '@/types';

export interface PropertyData {
  tipoImovel?: string;
  matricula?: string;
  oficio?: string;
  comarca?: string;
  estado?: string;
  inscricaoImobiliaria?: string;
  endereco?: {
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
  };
  metragem?: {
    areaPrivativa?: number;
    areaComum?: number;
    areaTotal?: number;
    unidadeMedida?: string;
  };
  valorVenal?: number;
  situacao?: string;
}

export interface Owner {
  nome: string;
  tipo: string;
  cpfCnpj: string;
  dataAquisicao: string;
  formaAquisicao: string;
  percentualPropriedade: string;
}

export interface Encumbrance {
  tipo: string;
  descricao: string;
  valor: string;
  dataRegistro: string;
  numeroRegistro: string;
  situacao: 'Ativa' | 'Quitada';
  gravame: 'Alto' | 'Médio' | 'Baixo';
}

export interface Averbation {
  tipo: string;
  descricao: string;
  data: string;
  numero: string;
}

export interface ChecklistItem {
  categoria: string;
  item: string;
  status: 'completed' | 'pending' | 'attention' | 'not_applicable';
  observacao: string;
}

export interface Modulo1Result {
  registration_number: string;
  property_data: PropertyData;
  owners: Owner[];
  encumbrances: Encumbrance[];
  averbatations: Averbation[];
  alerts: Alert[];
  risk_score: number;
}

export interface Modulo2Result {
  penhorabilidade: 'livre' | 'parcialmente_penhoravel' | 'impenhoravel';
  fundamentacao: string;
  checklist: ChecklistItem[];
  risk_score: number;
}

export interface Modulo3Result {
  valorEstimado: number;
  faixaMinima: number;
  faixaMaxima: number;
  metodologia: string;
  observacoes: string;
  risk_score: number;
}

export interface GeneralSummaryData {
  registration_number: string;
  created_at: string;
  risk_score: number;
  penhorabilidade?: string;
  summary: string;
  attention_points: string[];
  property_type?: string;
  main_owner?: string;
  situation?: string;
  alerts: Alert[];
  valorEstimado?: number;
  faixaMinima?: number;
  faixaMaxima?: number;
}
