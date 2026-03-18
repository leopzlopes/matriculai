'use client';

import { Header } from '@/components/layout/Header';
import { FileUpload } from '@/components/upload/FileUpload';
import { RealTimeAnalysisList } from '@/components/analysis/RealTimeAnalysisList';
import { Card, CardContent } from '@/components/ui/card';
import { History, Upload } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
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
      </main>
    </div>
  );
}
