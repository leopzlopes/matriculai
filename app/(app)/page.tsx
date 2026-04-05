import { FileUpload } from '@/components/upload/FileUpload';
import { RealTimeAnalysisList } from '@/components/analysis/RealTimeAnalysisList';
import { PlanBadge } from '@/components/layout/PlanBadge';
import { Card, CardContent } from '@/components/ui/card';
import { History, Upload } from 'lucide-react';
import { getUserPlanInfo } from '@/lib/actions/profile';

export default async function Home() {
  const planInfo = await getUserPlanInfo();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Plan Badge */}
      {planInfo && (
        <div className="mb-6">
          <PlanBadge planInfo={planInfo} />
        </div>
      )}

      {/* Upload Section */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Upload className="w-5 h-5 text-slate-700" />
          <h2 className="text-xl font-semibold text-slate-900">
            Nova Análise
          </h2>
        </div>
        <Card>
          <CardContent className="p-6">
            <FileUpload />
          </CardContent>
        </Card>
      </section>

      {/* Analysis History Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-slate-700" />
          <h2 className="text-xl font-semibold text-slate-900">
            Análises Realizadas
          </h2>
        </div>
        <RealTimeAnalysisList />
      </section>
    </div>
  );
}
