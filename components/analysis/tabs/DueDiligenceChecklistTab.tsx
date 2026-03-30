'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, AlertCircle, MinusCircle, Clock, Loader2 } from 'lucide-react';
import type { ChecklistItem } from '@/lib/ai/types';

interface DueDiligenceChecklistTabProps {
  data?: ChecklistItem[];
}

export function DueDiligenceChecklistTab({ data }: DueDiligenceChecklistTabProps) {
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-3">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-sm">Análise em processamento...</p>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'pending': return <Clock className="w-5 h-5 text-blue-600" />;
      case 'attention': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'not_applicable': return <MinusCircle className="w-5 h-5 text-gray-400" />;
      default: return <XCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return <span className="text-green-600 text-sm font-medium">Concluído</span>;
      case 'pending': return <span className="text-blue-600 text-sm font-medium">Pendente</span>;
      case 'attention': return <span className="text-yellow-600 text-sm font-medium">Atenção</span>;
      case 'not_applicable': return <span className="text-gray-400 text-sm font-medium">N/A</span>;
      default: return <span className="text-red-600 text-sm font-medium">Pendente</span>;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-50 border-green-200';
      case 'pending': return 'bg-blue-50 border-blue-200';
      case 'attention': return 'bg-yellow-50 border-yellow-200';
      case 'not_applicable': return 'bg-gray-50 border-gray-200';
      default: return 'bg-white border-slate-200';
    }
  };

  // Group by category
  const grouped = data.reduce((acc, item) => {
    if (!acc[item.categoria]) acc[item.categoria] = [];
    acc[item.categoria].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  const total = data.length;
  const completed = data.filter((i) => i.status === 'completed').length;
  const pending = data.filter((i) => i.status === 'pending').length;
  const attention = data.filter((i) => i.status === 'attention').length;
  const notApplicable = data.filter((i) => i.status === 'not_applicable').length;

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{total}</p>
            <p className="text-xs text-slate-600">Total de Itens</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{completed}</p>
            <p className="text-xs text-slate-600">Concluídos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{pending}</p>
            <p className="text-xs text-slate-600">Pendentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{attention}</p>
            <p className="text-xs text-slate-600">Atenção</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-400">{notApplicable}</p>
            <p className="text-xs text-slate-600">N/A</p>
          </CardContent>
        </Card>
      </div>

      {/* Checklist by Category */}
      {Object.entries(grouped).map(([categoria, items]) => (
        <Card key={categoria}>
          <CardHeader>
            <CardTitle className="text-lg">{categoria}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${getStatusBg(item.status)}`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getStatusIcon(item.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-slate-900">{item.item}</p>
                      {getStatusLabel(item.status)}
                    </div>
                    {item.observacao && (
                      <p className="text-sm text-slate-600 mt-1">{item.observacao}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <p className="text-xs text-slate-400 text-center pt-2">
        Minuta gerada por IA — revisar antes de uso oficial
      </p>
    </div>
  );
}
