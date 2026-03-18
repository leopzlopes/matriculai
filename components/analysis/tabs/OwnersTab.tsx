'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockOwners } from '@/lib/utils/detailedMockData';
import { User, Calendar, FileText, Percent } from 'lucide-react';

export function OwnersTab() {
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
            {mockOwners.map((owner) => (
              <div
                key={owner.id}
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
                    <p className="font-medium text-slate-900 font-mono">{owner.cpfCnpj}</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Data de Aquisição
                    </label>
                    <p className="font-medium text-slate-900">{owner.dataAquisicao}</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-500 flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      Forma de Aquisição
                    </label>
                    <p className="font-medium text-slate-900">{owner.formaAquisicao}</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-500 flex items-center gap-1">
                      <Percent className="w-3 h-3" />
                      Percentual
                    </label>
                    <p className="font-medium text-slate-900">{owner.percentualPropriedade}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Explanation Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Observação sobre Titularidade</h4>
          <p className="text-sm text-blue-800">
            Este imóvel possui <strong>nua propriedade</strong> em nome de Carlos Eduardo Mendes 
            e <strong>usufruto vitalício</strong> em favor de Maria Aparecida Santos. Isso significa 
            que Carlos Eduardo é o proprietário legal, mas Maria Aparecida tem o direito de 
            usar e usufruir do imóvel durante toda a sua vida.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
