'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { detailedAnalysisData } from '@/lib/utils/detailedMockData';
import { Building2, MapPin, Ruler, DollarSign } from 'lucide-react';

export function PropertyDataTab() {
  const data = detailedAnalysisData;
  const extractedData = data.extractedData as {
    tipoImovel?: string;
    matricula?: string;
    oficio?: string;
    comarca?: string;
    estado?: string;
    inscricaoImobiliaria?: string;
    endereco?: {
      logradouro?: string;
      numero?: string;
      complemento?: string;
      bairro?: string;
      cidade?: string;
      estado?: string;
      cep?: string;
    };
    metragem?: {
      areaPrivativa?: number;
      areaComum?: number;
      areaTotal?: number;
      unidadeMedida?: string;
    };
    valorVenal?: number;
    situacao?: string;
  };

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
              <p className="font-semibold text-slate-900">{extractedData.matricula}</p>
            </div>
            <div>
              <label className="text-sm text-slate-500">Ofício de Registro</label>
              <p className="font-semibold text-slate-900">{extractedData.oficio}</p>
            </div>
            <div>
              <label className="text-sm text-slate-500">Comarca</label>
              <p className="font-semibold text-slate-900">{extractedData.comarca}</p>
            </div>
            <div>
              <label className="text-sm text-slate-500">Estado</label>
              <p className="font-semibold text-slate-900">{extractedData.estado}</p>
            </div>
            <div>
              <label className="text-sm text-slate-500">Inscrição Imobiliária</label>
              <p className="font-semibold text-slate-900">{extractedData.inscricaoImobiliaria}</p>
            </div>
            <div>
              <label className="text-sm text-slate-500">Situação</label>
              <p className="font-semibold text-slate-900">{extractedData.situacao}</p>
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
              <p className="font-semibold text-slate-900">{extractedData.tipoImovel}</p>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-slate-500">Endereço Completo</label>
              <p className="font-semibold text-slate-900">
                {extractedData.endereco?.logradouro}, {extractedData.endereco?.numero}
                {extractedData.endereco?.complemento && ` - ${extractedData.endereco.complemento}`}
              </p>
              <p className="text-slate-700">
                {extractedData.endereco?.bairro} - {extractedData.endereco?.cidade}/{extractedData.endereco?.estado}
              </p>
              <p className="text-slate-700">CEP: {extractedData.endereco?.cep}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Measurements */}
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
                {extractedData.metragem?.areaPrivativa} {extractedData.metragem?.unidadeMedida}
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
              <label className="text-sm text-slate-500">Área Comum</label>
              <p className="text-2xl font-bold text-slate-900">
                {extractedData.metragem?.areaComum} {extractedData.metragem?.unidadeMedida}
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
              <label className="text-sm text-slate-500">Área Total</label>
              <p className="text-2xl font-bold text-slate-900">
                {extractedData.metragem?.areaTotal} {extractedData.metragem?.unidadeMedida}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Value */}
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
              {extractedData.valorVenal?.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
