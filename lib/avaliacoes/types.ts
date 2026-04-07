// ============================================================
// lib/avaliacoes/types.ts — Módulo Avaliações Imobiliárias
// ============================================================

export type TipoImovel =
  | 'residencial'
  | 'comercial'
  | 'rural'
  | 'industrial'
  | 'terreno';

export type FinalidadeAvaliacao =
  | 'compra_venda'
  | 'financiamento'
  | 'judicial'
  | 'seguro'
  | 'inventario'
  | 'outros';

export type StatusSolicitacao =
  | 'aberta'
  | 'em_negociacao'
  | 'contratada'
  | 'concluida'
  | 'cancelada'
  | 'em_disputa';

export type StatusProposta =
  | 'enviada'
  | 'aceita'
  | 'recusada'
  | 'cancelada';

export type AcessoImovel = 'livre' | 'agendamento' | 'indisponivel';

export type FotosTipo = 'upload' | 'link';

// Características dinâmicas por tipo de imóvel (armazenadas como JSONB)
export interface CaracteristicasResidencial {
  quartos?: number;
  vagas?: number;
  pavimentos?: number;
  piscina?: boolean;
}
export interface CaracteristicasComercial {
  vagas?: number;
  pavimentos?: number;
  piscina?: boolean;
}
export interface CaracteristicasRural {
  area_alqueires?: number;
  possui_benfeitorias?: boolean;
}
export interface CaracteristicasIndustrial {
  pe_direito_m?: number;
  docas?: number;
}
export interface CaracteristicasTerreno {
  topografia?: 'plano' | 'aclive' | 'declive' | 'irregular';
}

export type Caracteristicas =
  | CaracteristicasResidencial
  | CaracteristicasComercial
  | CaracteristicasRural
  | CaracteristicasIndustrial
  | CaracteristicasTerreno
  | Record<string, unknown>;

// -------------------------------------------------------
// Entidades salvas (retornadas do banco)
// -------------------------------------------------------

export interface AvaliadorPerfil {
  user_id: string;
  crea_numero: string | null;
  crea_uf: string | null;
  cnai_numero: string | null;
  especialidades: TipoImovel[];
  bio: string | null;
  nota_media: number;
  total_avaliacoes: number;
  stripe_account_id: string | null;
  credencial_verificada: boolean;
  declaracao_aceita: boolean;
  declaracao_aceita_at: string | null;
  parceiro_fundador: boolean;
  status: 'active' | 'suspended';
  created_at: string;
  // join opcional com auth.users
  nome?: string;
  email?: string;
  avatar_url?: string;
}

export interface SolicitacaoSalva {
  id: string;
  user_id: string;
  tipo_imovel: TipoImovel;
  finalidade: FinalidadeAvaliacao;
  endereco: string;
  cidade: string;
  uf: string;
  area_total_m2: number | null;
  area_construida_m2: number | null;
  matricula_disponivel: boolean;
  acesso_imovel: AcessoImovel | null;
  caracteristicas: Caracteristicas;
  observacoes_livres: string | null;
  fotos_tipo: FotosTipo | null;
  fotos_urls: string[];
  orcamento_min: number | null;
  orcamento_max: number | null;
  prazo_desejado: string | null;
  status: StatusSolicitacao;
  avaliador_id: string | null;
  valor_pago: number | null;
  from_matricula_id: string | null;
  created_at: string;
}

export interface PropostaSalva {
  id: string;
  solicitacao_id: string;
  avaliador_id: string;
  valor: number;
  prazo_execucao: number;
  validade_proposta: string;
  metodologia: string | null;
  observacoes: string | null;
  status: StatusProposta;
  stripe_payment_intent_id: string | null;
  created_at: string;
  // join opcional
  avaliador?: AvaliadorPerfil;
  mensagens_nao_lidas?: number;
}

export interface MensagemSalva {
  id: string;
  proposta_id: string;
  remetente_id: string;
  mensagem: string;
  lida: boolean;
  created_at: string;
}

export interface AvaliacaoReview {
  id: string;
  solicitacao_id: string;
  avaliador_id: string;
  cliente_id: string;
  nota_ao_avaliador: number | null;
  nota_ao_cliente: number | null;
  comentario_avaliador: string | null;
  comentario_cliente: string | null;
  created_at: string;
}

// -------------------------------------------------------
// Payloads de input
// -------------------------------------------------------

export interface NovaSolicitacaoPayload {
  tipo_imovel: TipoImovel;
  finalidade: FinalidadeAvaliacao;
  endereco: string;
  cidade: string;
  uf: string;
  area_total_m2?: number;
  area_construida_m2?: number;
  matricula_disponivel?: boolean;
  acesso_imovel?: AcessoImovel;
  caracteristicas?: Caracteristicas;
  observacoes_livres?: string;
  fotos_tipo?: FotosTipo;
  fotos_urls?: string[];
  orcamento_min?: number;
  orcamento_max?: number;
  prazo_desejado?: string;
  from_matricula_id?: string;
}

export interface NovaPropostaPayload {
  solicitacao_id: string;
  valor: number;
  prazo_execucao: number;
  validade_proposta: string;
  metodologia?: string;
  observacoes?: string;
}

// -------------------------------------------------------
// Config de upload
// -------------------------------------------------------

export const FotoUploadConfig = {
  maxFiles: 10,
  maxSizeBytes: 10 * 1024 * 1024,
  acceptedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'] as string[],
  acceptedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.pdf'] as string[],
} as const;

// -------------------------------------------------------
// Labels para UI
// -------------------------------------------------------

export const LABEL_TIPO_IMOVEL: Record<TipoImovel, string> = {
  residencial: 'Residencial',
  comercial: 'Comercial',
  rural: 'Rural',
  industrial: 'Industrial',
  terreno: 'Terreno',
};

export const LABEL_FINALIDADE: Record<FinalidadeAvaliacao, string> = {
  compra_venda: 'Compra e Venda',
  financiamento: 'Financiamento',
  judicial: 'Judicial',
  seguro: 'Seguro',
  inventario: 'Inventário',
  outros: 'Outros',
};

export const LABEL_STATUS: Record<StatusSolicitacao, string> = {
  aberta: 'Aberta',
  em_negociacao: 'Em Negociação',
  contratada: 'Contratada',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
  em_disputa: 'Em Disputa',
};

export const STATUS_COLOR: Record<StatusSolicitacao, string> = {
  aberta: 'bg-emerald-50 text-emerald-700',
  em_negociacao: 'bg-amber-50 text-amber-700',
  contratada: 'bg-blue-50 text-blue-700',
  concluida: 'bg-slate-100 text-slate-600',
  cancelada: 'bg-red-50 text-red-600',
  em_disputa: 'bg-orange-50 text-orange-700',
};
