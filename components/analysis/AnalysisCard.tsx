'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FileText, Calendar, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Analysis, getRiskColor, getRiskLabel, getRiskLevel } from '@/types';

interface AnalysisCardProps {
  analysis: Analysis;
}

export function AnalysisCard({ analysis }: AnalysisCardProps) {
  const riskLevel = getRiskLevel(analysis.riskScore);
  const riskColor = getRiskColor(analysis.riskScore);
  const riskLabel = getRiskLabel(analysis.riskScore);

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-500">
                Matrícula {analysis.registrationNumber}
              </span>
            </div>
            <h3 className="font-semibold text-slate-900 truncate">
              {analysis.propertyName}
            </h3>
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>
                  {format(new Date(analysis.createdAt), "dd/MM/yyyy 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </span>
              </div>
              {analysis.clientName && (
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>{analysis.clientName}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge className={`${riskColor} text-white font-semibold`}>
              {analysis.riskScore}/100
            </Badge>
            <span className="text-xs text-slate-500">{riskLabel}</span>
            {analysis.status === 'processing' && (
              <Badge variant="outline" className="text-blue-600 border-blue-600">
                Processando...
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
