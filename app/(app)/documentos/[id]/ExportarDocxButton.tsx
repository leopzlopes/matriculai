'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';

interface ExportarDocxButtonProps {
  titulo: string;
  texto: string;
}

export function ExportarDocxButton({ titulo, texto }: ExportarDocxButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/documentos/exportar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, texto }),
      });
      if (!res.ok) throw new Error('Erro ao exportar');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${titulo.replace(/[^a-zA-Z0-9\s]/g, '').trim()}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Erro ao exportar DOCX. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="inline-flex items-center gap-2 px-4 py-2 bg-[#0C447C] text-white text-sm font-medium rounded-xl hover:bg-[#0C447C]/90 disabled:opacity-50 transition-colors flex-shrink-0"
    >
      <Download className="w-4 h-4" />
      {loading ? 'Exportando...' : 'Exportar DOCX'}
    </button>
  );
}
