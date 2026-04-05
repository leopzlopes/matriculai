import { Header } from '@/components/layout/Header';
import { AnalysisTabsSection } from '@/components/analysis/AnalysisTabsSection';
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
} from '@/lib/ai/types';
import { ArrowLeft } from 'lucide-react';
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

  const contexto = `${analysis.property_name} — Matrícula ${analysis.registration_number}`;

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
        <AnalysisTabsSection
          generalSummaryData={generalSummaryData}
          propertyData={propertyData}
          ownersData={ownersData}
          encumbrancesData={encumbrancesData}
          averbatationsData={averbatationsData}
          checklistData={checklistData}
          contexto={contexto}
        />
      </main>
    </div>
  );
}
