export interface Analysis {
  id: string;
  propertyName: string;
  registrationNumber: string;
  pdfUrl?: string;
  riskScore: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  createdAt: string;
  updatedAt: string;
  clientId?: string;
  clientName?: string;
}

export interface AnalysisDetail {
  id: string;
  analysisId: string;
  extractedData?: Record<string, unknown>;
  alerts?: Alert[];
  chainOfTitle?: ChainOfTitleItem[];
  notes?: string;
}

export interface Alert {
  type: 'inalienability' | 'impenhorability' | 'usufruct' | 'pledge' | 'mortgage' | 'other';
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
}

export interface ChainOfTitleItem {
  date: string;
  grantor: string;
  grantee: string;
  transaction: string;
  document: string;
}

export type RiskLevel = 'low' | 'medium' | 'high';

export function getRiskLevel(score: number): RiskLevel {
  if (score <= 30) return 'low';
  if (score <= 70) return 'medium';
  return 'high';
}

export function getRiskColor(score: number): string {
  const level = getRiskLevel(score);
  switch (level) {
    case 'low':
      return 'bg-green-500 hover:bg-green-600';
    case 'medium':
      return 'bg-yellow-500 hover:bg-yellow-600';
    case 'high':
      return 'bg-red-500 hover:bg-red-600';
    default:
      return 'bg-gray-500 hover:bg-gray-600';
  }
}

export function getRiskLabel(score: number): string {
  const level = getRiskLevel(score);
  switch (level) {
    case 'low':
      return 'Baixo Risco';
    case 'medium':
      return 'Risco Médio';
    case 'high':
      return 'Alto Risco';
    default:
      return 'Indefinido';
  }
}
