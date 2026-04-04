'use client';

import { useCallback, useState } from 'react';
import { Upload, File, X, Loader2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface FileUploadProps {
  onFileSelect?: (file: File) => void;
}

const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

export function FileUpload({ onFileSelect }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isLimitReached, setIsLimitReached] = useState(false);
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

      if (res.status === 402) {
        setUploadError(json.error ?? 'Limite de análises atingido.');
        setIsLimitReached(true);
        return;
      }

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
      <div className="rounded-xl border-2 border-dashed border-slate-200 p-6 bg-white">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <File className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="font-semibold text-[#111219] text-sm">{selectedFile.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB · PDF
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearFile}
              disabled={isUploading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              <X className="w-3.5 h-3.5" />
              Remover
            </button>
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="flex items-center gap-2 px-5 py-2 bg-[#0C447C] text-white rounded-full text-sm font-semibold hover:bg-[#185FA5] transition-colors disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  Iniciar Análise
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
        {uploadError && (
          <div className="mt-4 p-3 bg-red-50 rounded-lg">
            <p className="text-sm text-red-600">{uploadError}</p>
            {isLimitReached && (
              <Link
                href="/planos"
                className="inline-flex items-center gap-1 mt-2 text-sm font-semibold text-[#0C447C] hover:underline"
              >
                Ver planos e fazer upgrade →
              </Link>
            )}
          </div>
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
        relative rounded-xl border-2 border-dashed p-12 text-center cursor-pointer transition-all duration-200
        ${isDragging
          ? 'border-[#0C447C] bg-blue-50/50'
          : 'border-slate-200 bg-white hover:border-[#0C447C]/40 hover:bg-slate-50/50'
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
        <div className={`
          w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 transition-colors
          ${isDragging ? 'bg-[#0C447C]' : 'bg-[#0C447C]/8'}
        `}>
          <Upload className={`w-7 h-7 ${isDragging ? 'text-white' : 'text-[#0C447C]'}`} />
        </div>
        <h3 className="text-lg font-semibold text-[#111219] mb-1.5">
          Arraste o PDF da matrícula aqui
        </h3>
        <p className="text-sm text-slate-400 mb-5">
          ou clique para selecionar o arquivo
        </p>
        <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0C447C] text-white rounded-full text-sm font-semibold hover:bg-[#185FA5] transition-colors">
          <Upload className="w-4 h-4" />
          Selecionar Arquivo
        </span>
        <p className="text-xs text-slate-400 mt-4">
          Apenas PDF · Máximo 50 MB
        </p>
      </label>
    </div>
  );
}
