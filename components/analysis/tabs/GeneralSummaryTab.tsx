'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RiskGauge } from '@/components/analysis/RiskGauge';
import { AlertsList } from '@/components/analysis/AlertCard';
import { Calendar, FileText, Building2, User, Loader2, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { GeneralSummaryData } from '@/lib/ai/types';

interface GeneralSummaryTabProps {
  data?: GeneralSummaryData;
}

export function GeneralSummaryTab({ data }: GeneralSummaryTabProps) {
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-3">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-sm">Análise em processamento...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-500">Matrícula</span>
            </div>
            <p className="font-semibold text-slate-900">{data.registration_number}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-500">Data da Análise</span>
            </div>
            <p className="font-semibold text-slate-900">
              {format(new Date(data.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Score Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Score de Risco</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <RiskGauge score={data.risk_score} size={220} />
            <div className="flex-1 space-y-4">
              {data.attention_points.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-900 mb-2">Pontos de Atenção</h4>
                  <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
                    {data.attention_points.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 mb-2">Resumo da Análise</h4>
                <p className="text-sm text-slate-700">{data.summary}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Value */}
      {data.valorEstimado != null && data.valorEstimado > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Valor Estimado de Mercado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg text-center">
                <p className="text-xs text-slate-500 mb-1">Mínimo</p>
                <p className="text-lg font-bold text-slate-700">
                  {data.faixaMinima?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center border border-green-200">
                <p className="text-xs text-slate-500 mb-1">Estimado</p>
                <p className="text-xl font-bold text-green-700">
                  {data.valorEstimado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg text-center">
                <p className="text-xs text-slate-500 mb-1">Máximo</p>
                <p className="text-lg font-bold text-slate-700">
                  {data.faixaMaxima?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerts Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-red-600">Alertas e Restrições</CardTitle>
        </CardHeader>
        <CardContent>
          <AlertsList alerts={data.alerts ?? []} />
        </CardContent>
      </Card>

      {/* Property Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informações do Imóvel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-500">Tipo</span>
              </div>
              <p className="font-medium text-slate-900">{data.property_type ?? '-'}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-500">Proprietário Principal</span>
              </div>
              <p className="font-medium text-slate-900">{data.main_owner ?? '-'}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-500">Situação</span>
              </div>
              <p className="font-medium text-slate-900">{data.situation ?? '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-slate-400 text-center pt-2">
        Minuta gerada por IA — revisar antes de uso oficial
      </p>
    </div>
  );
}
