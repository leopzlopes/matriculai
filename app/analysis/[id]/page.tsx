import { Header } from '@/components/layout/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GeneralSummaryTab } from '@/components/analysis/tabs/GeneralSummaryTab';
import { PropertyDataTab } from '@/components/analysis/tabs/PropertyDataTab';
import { OwnersTab } from '@/components/analysis/tabs/OwnersTab';
import { EncumbrancesTab } from '@/components/analysis/tabs/EncumbrancesTab';
import { AverbatationsTab } from '@/components/analysis/tabs/AverbatationsTab';
import { DueDiligenceChecklistTab } from '@/components/analysis/tabs/DueDiligenceChecklistTab';
import { AnalysisTrigger } from '@/components/analysis/AnalysisTrigger';
import { ExportButtons } from '@/components/analysis/ExportButtons';
import { getAnalysis } from '@/lib/actions/analyses';
import { getUserPlanInfo } from '@/lib/actions/profile';
import { getRiskColor, getRiskLabel } from '@/types';
import { Badge } from '@/components/ui/badge';
import type {
  GeneralSummaryData,
  PropertyData,
  Owner,
  Encumbrance,
  Averbation,
  ChecklistItem,
  Modulo1Result,
  Modulo2Result,
  Modulo3Result,
} from '@/lib/ai/types';
import {
  ArrowLeft,
  FileText,
  Building2,
  Users,
  Scale,
  ClipboardList,
  CheckSquare,
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface AnalysisDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AnalysisDetailPage({ params }: AnalysisDetailPageProps) {
  const { id } = await params;
  const [result, planInfo] = await Promise.all([getAnalysis(id), getUserPlanInfo()]);

  if (!result) {
    notFound();
  }

  const { analysis, tabData } = result;
  const riskScore = analysis.risk_score ?? 0;
  const riskColor = getRiskColor(riskScore);
  const riskLabel = getRiskLabel(riskScore);

  // Extract typed tab data (cast via unknown — Supabase Json type is too broad)
  const generalSummaryData = tabData['general_summary'] as unknown as GeneralSummaryData | undefined;
  const registralData = tabData['registral'] as unknown as Modulo1Result | undefined;
  const penhorabilidadeData = tabData['penhorabilidade'] as unknown as Modulo2Result | undefined;

  const propertyData: PropertyData | undefined = registralData?.property_data;
  const ownersData: Owner[] | undefined = registralData?.owners;
  const encumbrancesData: Encumbrance[] | undefined = registralData?.encumbrances;
  const averbatationsData: Averbation[] | undefined = registralData?.averbatations;
  const checklistData: ChecklistItem[] | undefined = penhorabilidadeData?.checklist;

  return (
    <div className="min-h-screen">
      <Header isAdmin={planInfo?.plan === 'admin'} />

      <main className="container mx-auto px-4 py-8">
        {/* Back Link and Header */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Voltar para Dashboard
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">
                {analysis.property_name}
              </h1>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500">
                  Matrícula {analysis.registration_number}
                </span>
                <Badge className={`${riskColor} text-white`}>
                  Score: {riskScore}/100 - {riskLabel}
                </Badge>
              </div>
            </div>
            <ExportButtons
              analysisId={analysis.id}
              registrationNumber={analysis.registration_number}
              plan={planInfo?.plan ?? 'freemium'}
              analysisStatus={analysis.status}
            />
          </div>
        </div>

        {/* Processing Banner */}
        <AnalysisTrigger analysisId={analysis.id} status={analysis.status ?? 'pending'} />

        {/* Tabs */}
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

          <TabsContent value="checklist" className="mt-0">
            <DueDiligenceChecklistTab data={checklistData} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
