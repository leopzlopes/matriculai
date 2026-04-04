'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FileText, Calendar, ChevronRight } from 'lucide-react';
import { Analysis, getRiskColor, getRiskLabel } from '@/types';
import Link from 'next/link';

interface AnalysisCardProps {
  analysis: Analysis;
}

export function AnalysisCard({ analysis }: AnalysisCardProps) {
  const riskColor = getRiskColor(analysis.riskScore);
  const riskLabel = getRiskLabel(analysis.riskScore);

  return (
    <Link href={`/analysis/${analysis.id}`}>
      <div className="group flex items-center gap-4 bg-white rounded-xl border border-black/[0.08] shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-5 py-4 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:border-[#0C447C]/20 transition-all duration-200 cursor-pointer">
        <div className="w-10 h-10 bg-[#0C447C]/8 rounded-xl flex items-center justify-center flex-shrink-0">
          <FileText className="w-5 h-5 text-[#0C447C]" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-400 mb-0.5">Matrícula {analysis.registrationNumber}</p>
          <h3 className="font-semibold text-[#111219] truncate text-sm leading-snug">
            {analysis.propertyName}
          </h3>
          <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
            <Calendar className="w-3 h-3" />
            <span>
              {format(new Date(analysis.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </span>
            {analysis.status === 'processing' && (
              <span className="ml-2 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-medium">
                Processando...
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold text-white ${riskColor}`}>
              {analysis.riskScore}/100
            </span>
            <p className="text-xs text-slate-400 mt-0.5">{riskLabel}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#0C447C] transition-colors" />
        </div>
      </div>
    </Link>
  );
}
