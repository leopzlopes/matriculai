'use client';

import { useCallback, useState } from 'react';
import { Upload, File, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  onFileSelect?: (file: File) => void;
}

export function FileUpload({ onFileSelect }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
      onFileSelect?.(files[0]);
    }
  }, [onFileSelect]);

  const clearFile = useCallback(() => {
    setSelectedFile(null);
  }, []);

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
            <Button variant="outline" onClick={clearFile}>
              <X className="w-4 h-4 mr-2" />
              Remover
            </Button>
            <Button>Iniciar Análise</Button>
          </div>
        </div>
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
          Apenas arquivos PDF são aceitos
        </p>
      </label>
    </div>
  );
}
