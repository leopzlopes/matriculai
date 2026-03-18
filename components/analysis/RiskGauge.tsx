'use client';

import { getRiskLevel } from '@/types';

interface RiskGaugeProps {
  score: number;
  size?: number;
}

export function RiskGauge({ score, size = 200 }: RiskGaugeProps) {
  const riskLevel = getRiskLevel(score);
  
  const getColor = () => {
    switch (riskLevel) {
      case 'low': return '#22c55e';
      case 'medium': return '#eab308';
      case 'high': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getLabel = () => {
    switch (riskLevel) {
      case 'low': return 'Baixo Risco';
      case 'medium': return 'Risco Médio';
      case 'high': return 'Alto Risco';
      default: return 'Indefinido';
    }
  };

  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * (circumference * 0.75);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size * 0.7 }}>
        <svg
          width={size}
          height={size * 0.7}
          viewBox={`0 0 ${size} ${size * 0.7}`}
          className="transform -rotate-[135deg] origin-center"
        >
          {/* Background arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference * 0.25}
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={getColor()}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-slate-900">{score}</span>
          <span className="text-sm text-slate-500">/ 100</span>
        </div>
      </div>
      <div className="mt-4 text-center">
        <span 
          className="text-lg font-semibold px-4 py-2 rounded-full text-white"
          style={{ backgroundColor: getColor() }}
        >
          {getLabel()}
        </span>
      </div>
    </div>
  );
}
