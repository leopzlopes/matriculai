'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockEncumbrances } from '@/lib/utils/detailedMockData';
import { Scale, AlertTriangle, AlertCircle } from 'lucide-react';

export function EncumbrancesTab() {
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
      case 'Alto':
        return 'bg-red-50 border-red-200';
      case 'Médio':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getSituacaoBadge = (situacao: string) => {
    if (situacao === 'Ativa') {
      return <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">ATIVA</span>;
    }
    return <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">QUITADA</span>;
  };

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
            {mockEncumbrances.map((encumbrance) => (
              <div
                key={encumbrance.id}
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
              <p className="text-2xl font-bold text-red-600">2</p>
              <p className="text-sm text-slate-600">Gravames de Alto Risco</p>
            </div>
            <div className="bg-white p-3 rounded border">
              <p className="text-2xl font-bold text-yellow-600">2</p>
              <p className="text-sm text-slate-600">Gravames de Médio Risco</p>
            </div>
            <div className="bg-white p-3 rounded border">
              <p className="text-2xl font-bold text-slate-900">R$ 1.245.230,50</p>
              <p className="text-sm text-slate-600">Total em Dívidas Garantidas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
