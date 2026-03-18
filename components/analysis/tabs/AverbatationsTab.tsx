'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockAverbatations } from '@/lib/utils/detailedMockData';
import { FileText, Calendar, ArrowRight } from 'lucide-react';

export function AverbatationsTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Averbações e Registros Complementares
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />
            
            <div className="space-y-6">
              {mockAverbatations.map((averbation, index) => (
                <div key={averbation.id} className="relative flex items-start gap-4">
                  {/* Timeline Dot */}
                  <div className="relative z-10 w-8 h-8 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold text-slate-600">{averbation.numero}</span>
                  </div>
                  
                  {/* Content Card */}
                  <div className="flex-1 bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                      <h4 className="font-semibold text-slate-900">{averbation.tipo}</h4>
                      <div className="flex items-center gap-1 text-sm text-slate-500">
                        <Calendar className="w-4 h-4" />
                        {averbation.data}
                      </div>
                    </div>
                    <p className="text-slate-700">{averbation.descricao}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-slate-900">{mockAverbatations.length}</p>
            <p className="text-sm text-slate-600">Total de Averbações</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-green-600">3</p>
            <p className="text-sm text-slate-600">Regularizações</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-yellow-600">1</p>
            <p className="text-sm text-slate-600">Advertências</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
