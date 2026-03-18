'use client';

import { AlertTriangle, AlertCircle, Home, Banknote, Scale, FileWarning } from 'lucide-react';
import { Alert } from '@/types';

interface AlertCardProps {
  alert: Alert;
}

export function AlertCard({ alert }: AlertCardProps) {
  const getIcon = () => {
    switch (alert.type) {
      case 'inalienability':
        return <Scale className="w-5 h-5" />;
      case 'impenhorability':
        return <Home className="w-5 h-5" />;
      case 'usufruct':
        return <FileWarning className="w-5 h-5" />;
      case 'pledge':
      case 'mortgage':
        return <Banknote className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getSeverityStyles = () => {
    switch (alert.severity) {
      case 'high':
        return 'bg-red-50 border-red-300 text-red-900';
      case 'medium':
        return 'bg-yellow-50 border-yellow-300 text-yellow-900';
      case 'low':
        return 'bg-blue-50 border-blue-300 text-blue-900';
      default:
        return 'bg-gray-50 border-gray-300 text-gray-900';
    }
  };

  const getSeverityIcon = () => {
    switch (alert.severity) {
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'medium':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getSeverityStyles()}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getSeverityIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {getIcon()}
            <h4 className="font-semibold">{alert.title}</h4>
          </div>
          <p className="text-sm opacity-90">{alert.description}</p>
        </div>
      </div>
    </div>
  );
}

interface AlertsListProps {
  alerts: Alert[];
}

export function AlertsList({ alerts }: AlertsListProps) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="text-center py-8 bg-green-50 rounded-lg border border-green-200">
        <AlertCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
        <p className="text-green-800 font-medium">Nenhum alerta identificado</p>
        <p className="text-sm text-green-600">Não foram encontrados ônus ou gravames de risco.</p>
      </div>
    );
  }

  // Sort by severity (high first)
  const sortedAlerts = [...alerts].sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  return (
    <div className="space-y-3">
      {sortedAlerts.map((alert, index) => (
        <AlertCard key={index} alert={alert} />
      ))}
    </div>
  );
}
