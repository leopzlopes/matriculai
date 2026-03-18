import { Header } from '@/components/layout/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GeneralSummaryTab } from '@/components/analysis/tabs/GeneralSummaryTab';
import { PropertyDataTab } from '@/components/analysis/tabs/PropertyDataTab';
import { OwnersTab } from '@/components/analysis/tabs/OwnersTab';
import { EncumbrancesTab } from '@/components/analysis/tabs/EncumbrancesTab';
import { AverbatationsTab } from '@/components/analysis/tabs/AverbatationsTab';
import { DueDiligenceChecklistTab } from '@/components/analysis/tabs/DueDiligenceChecklistTab';
import { detailedAnalysisMock } from '@/lib/utils/detailedMockData';
import { getRiskColor, getRiskLabel } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  FileText, 
  Building2, 
  Users, 
  Scale, 
  ClipboardList, 
  CheckSquare,
  Download,
  Share2
} from 'lucide-react';
import Link from 'next/link';

interface AnalysisDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AnalysisDetailPage({ params }: AnalysisDetailPageProps) {
  const { id } = await params;
  const analysis = detailedAnalysisMock;
  const riskColor = getRiskColor(analysis.riskScore);
  const riskLabel = getRiskLabel(analysis.riskScore);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
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
                {analysis.propertyName}
              </h1>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500">
                  Matrícula {analysis.registrationNumber}
                </span>
                <Badge className={`${riskColor} text-white`}>
                  Score: {analysis.riskScore}/100 - {riskLabel}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>
              <Button size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar PDF
              </Button>
            </div>
          </div>
        </div>

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
            <GeneralSummaryTab />
          </TabsContent>

          <TabsContent value="property" className="mt-0">
            <PropertyDataTab />
          </TabsContent>

          <TabsContent value="owners" className="mt-0">
            <OwnersTab />
          </TabsContent>

          <TabsContent value="encumbrances" className="mt-0">
            <EncumbrancesTab />
          </TabsContent>

          <TabsContent value="averbatations" className="mt-0">
            <AverbatationsTab />
          </TabsContent>

          <TabsContent value="checklist" className="mt-0">
            <DueDiligenceChecklistTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
