'use client';

import { AnalysisCard } from './AnalysisCard';
import { Analysis } from '@/types';

interface AnalysisListProps {
  analyses: Analysis[];
}

export function AnalysisList({ analyses }: AnalysisListProps) {
  if (analyses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Nenhuma análise realizada ainda.</p>
        <p className="text-sm text-slate-400 mt-1">
          Faça upload de uma matrícula para começar.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {analyses.map((analysis) => (
        <AnalysisCard key={analysis.id} analysis={analysis} />
      ))}
    </div>
  );
}
