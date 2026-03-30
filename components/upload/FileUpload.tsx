'use client';

import { useCallback, useState } from 'react';
import { Upload, File, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface FileUploadProps {
  onFileSelect?: (file: File) => void;
}

const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

export function FileUpload({ onFileSelect }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const router = useRouter();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
        setUploadError(null);
        onFileSelect?.(file);
      } else {
        alert('Por favor, envie apenas arquivos PDF');
      }
    }
  }, [onFileSelect]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      setUploadError(null);
      onFileSelect?.(files[0]);
    }
  }, [onFileSelect]);

  const clearFile = useCallback(() => {
    setSelectedFile(null);
    setUploadError(null);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;

    if (selectedFile.size > MAX_SIZE_BYTES) {
      setUploadError('O arquivo deve ter no máximo 50 MB');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const json = await res.json();

      if (!res.ok) {
        setUploadError(json.error ?? 'Erro ao enviar arquivo');
        return;
      }

      router.push(`/analysis/${json.analysisId}`);
    } catch {
      setUploadError('Erro de conexão. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, router]);

  if (selectedFile) {
    return (
      <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 bg-slate-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <File className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="font-medium text-slate-900">{selectedFile.name}</p>
              <p className="text-sm text-slate-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={clearFile} disabled={isUploading}>
              <X className="w-4 h-4 mr-2" />
              Remover
            </Button>
            <Button onClick={handleUpload} disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Iniciar Análise'
              )}
            </Button>
          </div>
        </div>
        {uploadError && (
          <p className="text-sm text-red-600 mt-3">{uploadError}</p>
        )}
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
        transition-all duration-200
        ${isDragging
          ? 'border-slate-900 bg-slate-100'
          : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50'
        }
      `}
    >
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Upload className={`w-8 h-8 ${isDragging ? 'text-slate-900' : 'text-slate-500'}`} />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Arraste o PDF da matrícula aqui
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          ou clique para selecionar o arquivo
        </p>
        <Button variant="outline" type="button">
          Selecionar Arquivo
        </Button>
        <p className="text-xs text-slate-400 mt-4">
          Apenas arquivos PDF são aceitos • Máximo 50 MB
        </p>
      </label>
    </div>
  );
}
