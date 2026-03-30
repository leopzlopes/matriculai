'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale, AlertTriangle, AlertCircle, Loader2 } from 'lucide-react';
import type { Encumbrance } from '@/lib/ai/types';

interface EncumbrancesTabProps {
  data?: Encumbrance[];
}

export function EncumbrancesTab({ data }: EncumbrancesTabProps) {
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-3">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-sm">Análise em processamento...</p>
      </div>
    );
  }

  const getGravameIcon = (gravame: string) => {
    switch (gravame) {
      case 'Alto':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'Médio':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
    }
  };

  const getGravameColor = (gravame: string) => {
    switch (gravame) {
      case 'Alto': return 'bg-red-50 border-red-200';
      case 'Médio': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  const getSituacaoBadge = (situacao: string) => {
    if (situacao === 'Ativa') {
      return <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">ATIVA</span>;
    }
    return <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">QUITADA</span>;
  };

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-3">
        <Scale className="w-8 h-8" />
        <p className="text-sm font-medium text-green-700">Nenhum ônus ou gravame identificado.</p>
      </div>
    );
  }

  const altoRisco = data.filter((e) => e.gravame === 'Alto').length;
  const medioRisco = data.filter((e) => e.gravame === 'Médio').length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Scale className="w-5 h-5" />
            Ônus e Gravames Registrados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.map((encumbrance, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${getGravameColor(encumbrance.gravame)}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getGravameIcon(encumbrance.gravame)}
                      <h4 className="font-semibold text-slate-900">{encumbrance.tipo}</h4>
                      {getSituacaoBadge(encumbrance.situacao)}
                    </div>
                    <p className="text-slate-700 mb-3">{encumbrance.descricao}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500">Valor: </span>
                        <span className="font-medium">{encumbrance.valor}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Data de Registro: </span>
                        <span className="font-medium">{encumbrance.dataRegistro}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Registro nº: </span>
                        <span className="font-medium font-mono">{encumbrance.numeroRegistro}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card className="bg-slate-50">
        <CardContent className="p-4">
          <h4 className="font-semibold text-slate-900 mb-3">Resumo dos Ônus</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-3 rounded border">
              <p className="text-2xl font-bold text-red-600">{altoRisco}</p>
              <p className="text-sm text-slate-600">Gravames de Alto Risco</p>
            </div>
            <div className="bg-white p-3 rounded border">
              <p className="text-2xl font-bold text-yellow-600">{medioRisco}</p>
              <p className="text-sm text-slate-600">Gravames de Médio Risco</p>
            </div>
            <div className="bg-white p-3 rounded border">
              <p className="text-2xl font-bold text-slate-900">{data.length}</p>
              <p className="text-sm text-slate-600">Total de Ônus</p>
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
