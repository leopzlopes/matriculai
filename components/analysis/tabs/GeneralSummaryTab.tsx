'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RiskGauge } from '@/components/analysis/RiskGauge';
import { AlertsList } from '@/components/analysis/AlertCard';
import { detailedAnalysisMock, detailedAnalysisData } from '@/lib/utils/detailedMockData';
import { Calendar, FileText, Building2, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function GeneralSummaryTab() {
  const data = detailedAnalysisData;
  const analysis = detailedAnalysisMock;

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
            <p className="font-semibold text-slate-900">{analysis.registrationNumber}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-500">Data da Análise</span>
            </div>
            <p className="font-semibold text-slate-900">
              {format(new Date(analysis.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
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
            <RiskGauge score={analysis.riskScore} size={220} />
            <div className="flex-1 space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-2">Pontos de Atenção</h4>
                <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
                  <li>Impenhorabilidade urbana declarada</li>
                  <li>Hipoteca ativa de valor significativo</li>
                  <li>Penhor de cotas condominiais</li>
                  <li>Usufruto vitalício registrado</li>
                </ul>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 mb-2">Resumo da Análise</h4>
                <p className="text-sm text-slate-700">
                  A matrícula apresenta múltiplos ônus e gravames que impactam a negociabilidade 
                  do imóvel. A presença de impenhorabilidade e usufruto vitalício reduzem 
                  drasticamente o valor de mercado. Recomenda-se negociação com desconto 
                  significativo ou quitação prévia dos ônus.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-red-600">Alertas e Restrições</CardTitle>
        </CardHeader>
        <CardContent>
          <AlertsList alerts={data.alerts || []} />
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
              <p className="font-medium text-slate-900">{(data.extractedData as { tipoImovel?: string })?.tipoImovel || '-'}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-500">Proprietário Principal</span>
              </div>
              <p className="font-medium text-slate-900">Carlos Eduardo Mendes</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-500">Situação</span>
              </div>
              <p className="font-medium text-slate-900">{(data.extractedData as { situacao?: string })?.situacao || '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
