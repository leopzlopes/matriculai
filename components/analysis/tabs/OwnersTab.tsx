'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Calendar, FileText, Percent, Loader2 } from 'lucide-react';
import type { Owner } from '@/lib/ai/types';

interface OwnersTabProps {
  data?: Owner[];
}

export function OwnersTab({ data }: OwnersTabProps) {
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-3">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-sm">Análise em processamento...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-3">
        <User className="w-8 h-8" />
        <p className="text-sm">Nenhum proprietário identificado na matrícula.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="w-5 h-5" />
            Cadeia Proprietária Atual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.map((owner, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-slate-500">Nome</label>
                    <p className="font-semibold text-slate-900">{owner.nome}</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-500">Tipo de Titularidade</label>
                    <p className="font-medium text-slate-900">{owner.tipo}</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-500">CPF/CNPJ</label>
                    <p className="font-medium text-slate-900 font-mono">{owner.cpfCnpj ?? '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Data de Aquisição
                    </label>
                    <p className="font-medium text-slate-900">{owner.dataAquisicao ?? '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-500 flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      Forma de Aquisição
                    </label>
                    <p className="font-medium text-slate-900">{owner.formaAquisicao ?? '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-500 flex items-center gap-1">
                      <Percent className="w-3 h-3" />
                      Percentual
                    </label>
                    <p className="font-medium text-slate-900">{owner.percentualPropriedade ?? '-'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-slate-400 text-center pt-2">
        Minuta gerada por IA — revisar antes de uso oficial
      </p>
    </div>
  );
}
