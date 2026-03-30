'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, MapPin, Ruler, DollarSign, Loader2 } from 'lucide-react';
import type { PropertyData } from '@/lib/ai/types';

interface PropertyDataTabProps {
  data?: PropertyData;
}

export function PropertyDataTab({ data }: PropertyDataTabProps) {
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
      {/* Identification */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Identificação da Matrícula
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="text-sm text-slate-500">Número da Matrícula</label>
              <p className="font-semibold text-slate-900">{data.matricula ?? '-'}</p>
            </div>
            <div>
              <label className="text-sm text-slate-500">Ofício de Registro</label>
              <p className="font-semibold text-slate-900">{data.oficio ?? '-'}</p>
            </div>
            <div>
              <label className="text-sm text-slate-500">Comarca</label>
              <p className="font-semibold text-slate-900">{data.comarca ?? '-'}</p>
            </div>
            <div>
              <label className="text-sm text-slate-500">Estado</label>
              <p className="font-semibold text-slate-900">{data.estado ?? '-'}</p>
            </div>
            <div>
              <label className="text-sm text-slate-500">Inscrição Imobiliária</label>
              <p className="font-semibold text-slate-900">{data.inscricaoImobiliaria ?? '-'}</p>
            </div>
            <div>
              <label className="text-sm text-slate-500">Situação</label>
              <p className="font-semibold text-slate-900">{data.situacao ?? '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Type and Address */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Localização e Tipo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-slate-500">Tipo de Imóvel</label>
              <p className="font-semibold text-slate-900">{data.tipoImovel ?? '-'}</p>
            </div>
            {data.endereco && (
              <div className="md:col-span-2">
                <label className="text-sm text-slate-500">Endereço Completo</label>
                <p className="font-semibold text-slate-900">
                  {data.endereco.logradouro}{data.endereco.numero ? `, ${data.endereco.numero}` : ''}
                  {data.endereco.complemento ? ` - ${data.endereco.complemento}` : ''}
                </p>
                {(data.endereco.bairro || data.endereco.cidade) && (
                  <p className="text-slate-700">
                    {[data.endereco.bairro, data.endereco.cidade, data.endereco.estado].filter(Boolean).join(' - ')}
                  </p>
                )}
                {data.endereco.cep && (
                  <p className="text-slate-700">CEP: {data.endereco.cep}</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Measurements */}
      {data.metragem && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Ruler className="w-5 h-5" />
              Metragens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-50 p-4 rounded-lg">
                <label className="text-sm text-slate-500">Área Privativa</label>
                <p className="text-2xl font-bold text-slate-900">
                  {data.metragem.areaPrivativa ?? '-'} {data.metragem.unidadeMedida}
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <label className="text-sm text-slate-500">Área Comum</label>
                <p className="text-2xl font-bold text-slate-900">
                  {data.metragem.areaComum ?? '-'} {data.metragem.unidadeMedida}
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <label className="text-sm text-slate-500">Área Total</label>
                <p className="text-2xl font-bold text-slate-900">
                  {data.metragem.areaTotal ?? '-'} {data.metragem.unidadeMedida}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Value */}
      {data.valorVenal != null && data.valorVenal > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Valor Venal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 p-6 rounded-lg">
              <p className="text-sm text-slate-600 mb-1">Valor registrado na matrícula</p>
              <p className="text-3xl font-bold text-green-700">
                {data.valorVenal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-slate-400 text-center pt-2">
        Minuta gerada por IA — revisar antes de uso oficial
      </p>
    </div>
  );
}
