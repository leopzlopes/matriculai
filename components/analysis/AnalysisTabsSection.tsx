'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GeneralSummaryTab } from '@/components/analysis/tabs/GeneralSummaryTab';
import { PropertyDataTab } from '@/components/analysis/tabs/PropertyDataTab';
import { OwnersTab } from '@/components/analysis/tabs/OwnersTab';
import { EncumbrancesTab } from '@/components/analysis/tabs/EncumbrancesTab';
import { AverbatationsTab } from '@/components/analysis/tabs/AverbatationsTab';
import { DueDiligenceChecklistTab } from '@/components/analysis/tabs/DueDiligenceChecklistTab';
import { ProcessosJudiciaisTab } from '@/components/analysis/tabs/ProcessosJudiciaisTab';
import {
  FileText,
  Building2,
  Users,
  Scale,
  ClipboardList,
  CheckSquare,
  Gavel,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import type {
  GeneralSummaryData,
  PropertyData,
  Owner,
  Encumbrance,
  Averbation,
  ChecklistItem,
} from '@/lib/ai/types';

interface AnalysisTabsSectionProps {
  generalSummaryData?: GeneralSummaryData;
  propertyData?: PropertyData;
  ownersData?: Owner[];
  encumbrancesData?: Encumbrance[];
  averbatationsData?: Averbation[];
  checklistData?: ChecklistItem[];
  contexto?: string;
}

const RISCO_BADGE = {
  alto: { label: 'Alto', className: 'bg-red-100 text-red-700', Icon: AlertTriangle },
  medio: { label: 'Médio', className: 'bg-yellow-100 text-yellow-700', Icon: AlertCircle },
  baixo: { label: 'Baixo', className: 'bg-green-100 text-green-700', Icon: CheckCircle2 },
};

export function AnalysisTabsSection({
  generalSummaryData,
  propertyData,
  ownersData,
  encumbrancesData,
  averbatationsData,
  checklistData,
  contexto,
}: AnalysisTabsSectionProps) {
  const [judicialRisk, setJudicialRisk] = useState<'alto' | 'medio' | 'baixo' | null>(null);

  return (
    <Tabs defaultValue="summary" className="w-full">
      <TabsList className="w-full justify-start flex-wrap h-auto gap-2 mb-6">
        <TabsTrigger value="summary" className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Resumo Geral
        </TabsTrigger>
        <TabsTrigger value="property" className="flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          Dados do Imóvel
        </TabsTrigger>
        <TabsTrigger value="owners" className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          Proprietários
        </TabsTrigger>
        <TabsTrigger value="encumbrances" className="flex items-center gap-2">
          <Scale className="w-4 h-4" />
          Ônus e Gravames
        </TabsTrigger>
        <TabsTrigger value="averbatations" className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4" />
          Averbações
        </TabsTrigger>
        <TabsTrigger value="processos" className="flex items-center gap-2">
          <Gavel className="w-4 h-4" />
          Processos Judiciais
          {judicialRisk && (() => {
            const cfg = RISCO_BADGE[judicialRisk];
            return (
              <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${cfg.className}`}>
                <cfg.Icon className="w-2.5 h-2.5" />
                {cfg.label}
              </span>
            );
          })()}
        </TabsTrigger>
        <TabsTrigger value="checklist" className="flex items-center gap-2">
          <CheckSquare className="w-4 h-4" />
          Checklist DD
        </TabsTrigger>
      </TabsList>

      <TabsContent value="summary" className="mt-0">
        <GeneralSummaryTab data={generalSummaryData} />
      </TabsContent>

      <TabsContent value="property" className="mt-0">
        <PropertyDataTab data={propertyData} />
      </TabsContent>

      <TabsContent value="owners" className="mt-0">
        <OwnersTab data={ownersData} />
      </TabsContent>

      <TabsContent value="encumbrances" className="mt-0">
        <EncumbrancesTab data={encumbrancesData} />
      </TabsContent>

      <TabsContent value="averbatations" className="mt-0">
        <AverbatationsTab data={averbatationsData} />
      </TabsContent>

      <TabsContent value="processos" className="mt-0">
        <ProcessosJudiciaisTab
          encumbrances={encumbrancesData}
          owners={ownersData}
          onRiskResult={(nivel) => setJudicialRisk(nivel)}
          contexto={contexto}
        />
      </TabsContent>

      <TabsContent value="checklist" className="mt-0">
        <DueDiligenceChecklistTab data={checklistData} />
      </TabsContent>
    </Tabs>
  );
}
