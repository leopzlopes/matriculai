'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { Upload, Link2, X, ChevronRight, ChevronLeft, Info, Plus } from 'lucide-react';
import { createSolicitacao } from '@/lib/actions/avaliacoes';
import {
  FotoUploadConfig,
  LABEL_TIPO_IMOVEL,
  LABEL_FINALIDADE,
  type TipoImovel,
  type FinalidadeAvaliacao,
  type AcessoImovel,
  type Caracteristicas,
} from '@/lib/avaliacoes/types';

// -------------------------------------------------------
// Helpers
// -------------------------------------------------------
const TIPOS_IMOVEL: TipoImovel[] = ['residencial', 'comercial', 'rural', 'industrial', 'terreno'];
const FINALIDADES: FinalidadeAvaliacao[] = ['compra_venda', 'financiamento', 'judicial', 'seguro', 'inventario', 'outros'];
const UF_LIST = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

function isValidUrl(str: string) {
  try { new URL(str); return true; } catch { return false; }
}

// Calcula data mínima (hoje + 7 dias) para prazo
function minDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().split('T')[0];
}

// Calcula data mínima (hoje + 15 dias) para validade da proposta
function defaultValidade(): string {
  const d = new Date();
  d.setDate(d.getDate() + 15);
  return d.toISOString().split('T')[0];
}

// -------------------------------------------------------
// Props
// -------------------------------------------------------
interface InitialData {
  from_matricula?: string;
  tipo?: string;
  uf?: string;
  cidade?: string;
  endereco?: string;
  area_total_m2?: number;
}

interface Props {
  initialData?: InitialData;
  hasPreFill?: boolean;
}

// -------------------------------------------------------
// Barra de progresso
// -------------------------------------------------------
function ProgressBar({ step }: { step: number }) {
  const steps = ['O imóvel', 'Características', 'Orçamento'];
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        {steps.map((label, i) => (
          <div key={label} className="flex-1 flex items-center">
            <div className={`flex items-center gap-2 ${i < steps.length - 1 ? 'flex-1' : ''}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                i < step ? 'bg-[#0C447C] text-white' :
                i === step ? 'bg-[#0C447C]/15 text-[#0C447C] ring-2 ring-[#0C447C]/30' :
                'bg-slate-100 text-slate-400'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:inline ${i === step ? 'text-[#0C447C]' : 'text-slate-400'}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-[#0C447C]' : 'bg-slate-200'}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------
// Dropzone de fotos
// -------------------------------------------------------
interface FileWithPreview {
  file: File;
  preview: string;
  name: string;
  size: number;
}

function FotoDropzone({
  files,
  onChange,
}: {
  files: FileWithPreview[];
  onChange: (files: FileWithPreview[]) => void;
}) {
  const [errors, setErrors] = useState<string[]>([]);

  const onDrop = useCallback((accepted: File[]) => {
    const errs: string[] = [];
    const newFiles: FileWithPreview[] = [];

    for (const f of accepted) {
      if (!FotoUploadConfig.acceptedMimeTypes.includes(f.type)) {
        errs.push(`${f.name}: tipo não permitido`);
        continue;
      }
      if (f.size > FotoUploadConfig.maxSizeBytes) {
        errs.push(`${f.name}: maior que 10 MB`);
        continue;
      }
      if (files.length + newFiles.length >= FotoUploadConfig.maxFiles) {
        errs.push('Limite de 10 arquivos atingido');
        break;
      }
      newFiles.push({
        file: f,
        preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : '',
        name: f.name,
        size: f.size,
      });
    }

    setErrors(errs);
    if (newFiles.length > 0) onChange([...files, ...newFiles]);
  }, [files, onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'application/pdf': ['.pdf'],
    },
    maxSize: FotoUploadConfig.maxSizeBytes,
    maxFiles: FotoUploadConfig.maxFiles,
  });

  const remove = (idx: number) => {
    const updated = files.filter((_, i) => i !== idx);
    onChange(updated);
  };

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-[#0C447C] bg-[#E6F1FB]' : 'border-slate-200 hover:border-[#0C447C]/40'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
        <p className="text-sm text-slate-600">
          {isDragActive ? 'Solte os arquivos aqui' : 'Arraste arquivos ou clique para selecionar'}
        </p>
        <p className="text-xs text-slate-400 mt-1">JPG, PNG, WEBP, PDF · máx 10 MB · máx 10 arquivos</p>
        <p className="text-xs text-slate-400">Adicione fotos da fachada, interior e planta baixa</p>
      </div>

      {errors.length > 0 && (
        <div className="mt-2 space-y-1">
          {errors.map((e, i) => (
            <p key={i} className="text-xs text-red-500">{e}</p>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {files.map((f, i) => (
            <div key={i} className="relative group">
              {f.preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={f.preview} alt={f.name} className="w-full h-14 object-cover rounded-lg" />
              ) : (
                <div className="w-full h-14 bg-slate-100 rounded-lg flex items-center justify-center text-xs text-slate-500">PDF</div>
              )}
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------
// Componente principal
// -------------------------------------------------------
export function NovaAvaliacaoForm({ initialData, hasPreFill }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1
  const [tipo, setTipo] = useState<TipoImovel>((initialData?.tipo as TipoImovel) ?? 'residencial');
  const [finalidade, setFinalidade] = useState<FinalidadeAvaliacao>('compra_venda');
  const [endereco, setEndereco] = useState(initialData?.endereco ?? '');
  const [cidade, setCidade] = useState(initialData?.cidade ?? '');
  const [uf, setUf] = useState(initialData?.uf ?? '');
  const [areaTotalM2, setAreaTotalM2] = useState(initialData?.area_total_m2?.toString() ?? '');
  const [areaConstruidaM2, setAreaConstruidaM2] = useState('');
  const [matriculaDisponivel, setMatriculaDisponivel] = useState(false);
  const [acessoImovel, setAcessoImovel] = useState<AcessoImovel>('livre');

  // Step 2
  const [caracteristicas, setCaracteristicas] = useState<Record<string, unknown>>({});
  const [observacoes, setObservacoes] = useState('');
  const [fotosTipo, setFotosTipo] = useState<'upload' | 'link'>('upload');
  const [fotosFiles, setFotosFiles] = useState<{ file: File; preview: string; name: string; size: number }[]>([]);
  const [fotosLinks, setFotosLinks] = useState<string[]>([]);
  const [linkInput, setLinkInput] = useState('');
  const [linkError, setLinkError] = useState('');

  // Step 3
  const [orcamentoMin, setOrcamentoMin] = useState('');
  const [orcamentoMax, setOrcamentoMax] = useState('');
  const [prazoDesejado, setPrazoDesejado] = useState('');

  // -------------------------------------------------------
  // Características dinâmicas por tipo
  // -------------------------------------------------------
  function CaracteristicasFields() {
    const set = (key: string, value: unknown) =>
      setCaracteristicas((prev) => ({ ...prev, [key]: value }));

    if (tipo === 'residencial' || tipo === 'comercial') {
      return (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Quartos</label>
            <input type="number" min="0" value={(caracteristicas.quartos as number) ?? ''} onChange={(e) => set('quartos', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0C447C]/20 focus:border-[#0C447C] outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Vagas</label>
            <input type="number" min="0" value={(caracteristicas.vagas as number) ?? ''} onChange={(e) => set('vagas', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0C447C]/20 focus:border-[#0C447C] outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Pavimentos</label>
            <input type="number" min="1" value={(caracteristicas.pavimentos as number) ?? ''} onChange={(e) => set('pavimentos', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0C447C]/20 focus:border-[#0C447C] outline-none" />
          </div>
          <div className="flex items-center gap-2 pt-5">
            <input type="checkbox" id="piscina" checked={!!(caracteristicas.piscina)} onChange={(e) => set('piscina', e.target.checked)}
              className="w-4 h-4 accent-[#0C447C]" />
            <label htmlFor="piscina" className="text-sm text-slate-700">Piscina</label>
          </div>
        </div>
      );
    }
    if (tipo === 'rural') {
      return (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Área (alqueires)</label>
            <input type="number" min="0" step="0.01" value={(caracteristicas.area_alqueires as number) ?? ''} onChange={(e) => set('area_alqueires', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0C447C]/20 focus:border-[#0C447C] outline-none" />
          </div>
          <div className="flex items-center gap-2 pt-5">
            <input type="checkbox" id="benfeitorias" checked={!!(caracteristicas.possui_benfeitorias)} onChange={(e) => set('possui_benfeitorias', e.target.checked)}
              className="w-4 h-4 accent-[#0C447C]" />
            <label htmlFor="benfeitorias" className="text-sm text-slate-700">Possui benfeitorias</label>
          </div>
        </div>
      );
    }
    if (tipo === 'industrial') {
      return (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Pé-direito (m)</label>
            <input type="number" min="0" step="0.1" value={(caracteristicas.pe_direito_m as number) ?? ''} onChange={(e) => set('pe_direito_m', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0C447C]/20 focus:border-[#0C447C] outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Docas</label>
            <input type="number" min="0" value={(caracteristicas.docas as number) ?? ''} onChange={(e) => set('docas', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0C447C]/20 focus:border-[#0C447C] outline-none" />
          </div>
        </div>
      );
    }
    if (tipo === 'terreno') {
      return (
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Topografia</label>
          <select value={(caracteristicas.topografia as string) ?? ''} onChange={(e) => set('topografia', e.target.value || undefined)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0C447C]/20 focus:border-[#0C447C] outline-none bg-white">
            <option value="">Selecionar...</option>
            <option value="plano">Plano</option>
            <option value="aclive">Aclive</option>
            <option value="declive">Declive</option>
            <option value="irregular">Irregular</option>
          </select>
        </div>
      );
    }
    return null;
  }

  // -------------------------------------------------------
  // Navegação entre steps
  // -------------------------------------------------------
  function validateStep1() {
    if (!tipo || !finalidade || !endereco.trim() || !cidade.trim() || !uf) {
      setError('Preencha todos os campos obrigatórios.');
      return false;
    }
    setError('');
    return true;
  }

  function validateStep3() {
    if (prazoDesejado && prazoDesejado < minDate()) {
      setError('O prazo deve ser de pelo menos 7 dias a partir de hoje.');
      return false;
    }
    setError('');
    return true;
  }

  async function handleSubmit() {
    if (!validateStep3()) return;
    setLoading(true);
    setError('');

    // Montar fotos_urls
    const fotosUrls = fotosTipo === 'link' ? fotosLinks : [];

    const payload = {
      tipo_imovel: tipo,
      finalidade,
      endereco: endereco.trim(),
      cidade: cidade.trim(),
      uf,
      area_total_m2: areaTotalM2 ? parseFloat(areaTotalM2) : undefined,
      area_construida_m2: areaConstruidaM2 && tipo !== 'terreno' ? parseFloat(areaConstruidaM2) : undefined,
      matricula_disponivel: matriculaDisponivel,
      acesso_imovel: acessoImovel,
      caracteristicas: caracteristicas as Caracteristicas,
      observacoes_livres: observacoes.trim() || undefined,
      fotos_tipo: fotosUrls.length > 0 ? ('link' as const) : (fotosFiles.length > 0 ? ('upload' as const) : undefined),
      fotos_urls: fotosUrls,
      orcamento_min: orcamentoMin ? parseFloat(orcamentoMin) : undefined,
      orcamento_max: orcamentoMax ? parseFloat(orcamentoMax) : undefined,
      prazo_desejado: prazoDesejado || undefined,
      from_matricula_id: initialData?.from_matricula,
    };

    const { id, error: err } = await createSolicitacao(payload);
    setLoading(false);

    if (err) { setError(err); return; }
    router.push(`/avaliacoes/${id}`);
  }

  const addLink = () => {
    if (!isValidUrl(linkInput)) { setLinkError('URL inválida'); return; }
    if (fotosLinks.length >= 10) { setLinkError('Máximo de 10 links'); return; }
    setFotosLinks([...fotosLinks, linkInput]);
    setLinkInput('');
    setLinkError('');
  };

  // -------------------------------------------------------
  // Render
  // -------------------------------------------------------
  const inputClass = 'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0C447C]/20 focus:border-[#0C447C] outline-none bg-white';
  const labelClass = 'block text-xs font-medium text-slate-700 mb-1';

  return (
    <div className="bg-white border border-black/[0.08] rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
      <ProgressBar step={step} />

      {hasPreFill && (
        <div className="mb-5 flex items-center gap-2 bg-[#E6F1FB] border border-[#0C447C]/20 rounded-xl px-4 py-3">
          <Info className="w-4 h-4 text-[#0C447C] flex-shrink-0" />
          <p className="text-xs text-[#0C447C]">Dados importados da análise de matrícula</p>
        </div>
      )}

      {/* ---- STEP 1 ---- */}
      {step === 0 && (
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Tipo de imóvel *</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {TIPOS_IMOVEL.map((t) => (
                <button key={t} type="button" onClick={() => setTipo(t)}
                  className={`py-2 px-1 rounded-lg text-xs font-medium border transition-colors ${
                    tipo === t ? 'bg-[#E6F1FB] text-[#0C447C] border-[#0C447C]/30' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}>
                  {LABEL_TIPO_IMOVEL[t]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>Finalidade *</label>
            <select value={finalidade} onChange={(e) => setFinalidade(e.target.value as FinalidadeAvaliacao)} className={inputClass}>
              {FINALIDADES.map((f) => (
                <option key={f} value={f}>{LABEL_FINALIDADE[f]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Endereço *</label>
            <input value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder="Rua, número, bairro" className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Cidade *</label>
              <input value={cidade} onChange={(e) => setCidade(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>UF *</label>
              <select value={uf} onChange={(e) => setUf(e.target.value)} className={inputClass}>
                <option value="">Selecionar</option>
                {UF_LIST.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Área total (m²)</label>
              <input type="number" min="0" step="0.01" value={areaTotalM2} onChange={(e) => setAreaTotalM2(e.target.value)} className={inputClass} />
            </div>
            {tipo !== 'terreno' && (
              <div>
                <label className={labelClass}>Área construída (m²)</label>
                <input type="number" min="0" step="0.01" value={areaConstruidaM2} onChange={(e) => setAreaConstruidaM2(e.target.value)} className={inputClass} />
              </div>
            )}
          </div>

          <div>
            <label className={labelClass}>Acesso ao imóvel</label>
            <div className="flex gap-3">
              {(['livre', 'agendamento', 'indisponivel'] as AcessoImovel[]).map((a) => (
                <label key={a} className="flex items-center gap-1.5 cursor-pointer text-sm text-slate-600">
                  <input type="radio" name="acesso" value={a} checked={acessoImovel === a} onChange={() => setAcessoImovel(a)}
                    className="accent-[#0C447C]" />
                  {a === 'livre' ? 'Livre' : a === 'agendamento' ? 'Com agendamento' : 'Indisponível'}
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="matricula" checked={matriculaDisponivel} onChange={(e) => setMatriculaDisponivel(e.target.checked)}
              className="w-4 h-4 accent-[#0C447C]" />
            <label htmlFor="matricula" className="text-sm text-slate-600">Tenho a matrícula do imóvel disponível</label>
          </div>
        </div>
      )}

      {/* ---- STEP 2 ---- */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Características</h3>
            <CaracteristicasFields />
          </div>

          <div>
            <label className={labelClass}>Observações livres</label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value.slice(0, 500))}
              rows={3}
              placeholder="Descreva detalhes relevantes do imóvel..."
              className={`${inputClass} resize-none`}
            />
            <p className="text-xs text-slate-400 text-right mt-0.5">{observacoes.length}/500</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Fotos do imóvel</h3>
            <div className="flex gap-3 mb-3">
              {(['upload', 'link'] as const).map((t) => (
                <button key={t} type="button" onClick={() => setFotosTipo(t)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    fotosTipo === t ? 'bg-[#E6F1FB] text-[#0C447C] border-[#0C447C]/30' : 'bg-white text-slate-600 border-slate-200'
                  }`}>
                  {t === 'upload' ? <Upload className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
                  {t === 'upload' ? 'Upload de arquivos' : 'Links externos'}
                </button>
              ))}
            </div>

            {fotosTipo === 'upload' ? (
              <FotoDropzone files={fotosFiles} onChange={setFotosFiles} />
            ) : (
              <div>
                <div className="flex gap-2">
                  <input
                    value={linkInput}
                    onChange={(e) => { setLinkInput(e.target.value); setLinkError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLink())}
                    placeholder="https://drive.google.com/..."
                    className={inputClass}
                  />
                  <button type="button" onClick={addLink}
                    className="px-3 py-2 bg-[#0C447C]/10 text-[#0C447C] rounded-lg text-sm font-medium hover:bg-[#0C447C]/20 transition-colors flex-shrink-0">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {linkError && <p className="text-xs text-red-500 mt-1">{linkError}</p>}
                {fotosLinks.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {fotosLinks.map((l, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                        <Link2 className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span className="flex-1 truncate">{l}</span>
                        <button type="button" onClick={() => setFotosLinks(fotosLinks.filter((_, j) => j !== i))}
                          className="text-slate-400 hover:text-red-500 transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="text-xs text-slate-400 mt-2">
                  Aceita links do Google Fotos, Drive, Dropbox etc. Máx 10 links.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---- STEP 3 ---- */}
      {step === 2 && (
        <div className="space-y-5">
          <div>
            <label className={labelClass}>Orçamento de referência (R$)</label>
            <div className="flex items-center gap-2">
              <input type="number" min="0" step="100" value={orcamentoMin} onChange={(e) => setOrcamentoMin(e.target.value)}
                placeholder="Mínimo" className={inputClass} />
              <span className="text-slate-400 text-sm">até</span>
              <input type="number" min="0" step="100" value={orcamentoMax} onChange={(e) => setOrcamentoMax(e.target.value)}
                placeholder="Máximo" className={inputClass} />
            </div>
            <div className="flex items-start gap-1.5 mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <Info className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                Este valor é apenas uma referência. Avaliadores podem enviar propostas fora desta faixa.
              </p>
            </div>
          </div>

          <div>
            <label className={labelClass}>Prazo desejado</label>
            <input
              type="date"
              value={prazoDesejado}
              min={minDate()}
              onChange={(e) => setPrazoDesejado(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Resumo */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-2">
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3">Resumo da solicitação</h3>
            {[
              ['Tipo', LABEL_TIPO_IMOVEL[tipo]],
              ['Finalidade', LABEL_FINALIDADE[finalidade]],
              ['Localização', `${cidade}/${uf}`],
              ['Área total', areaTotalM2 ? `${areaTotalM2} m²` : '—'],
              ['Orçamento', orcamentoMin || orcamentoMax ? `R$ ${orcamentoMin || '?'} – ${orcamentoMax || '?'}` : 'A negociar'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-xs">
                <span className="text-slate-500">{label}</span>
                <span className="text-slate-800 font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Erro */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Navegação */}
      <div className="flex justify-between mt-6 gap-3">
        {step > 0 ? (
          <button type="button" onClick={() => setStep(step - 1)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Voltar
          </button>
        ) : (
          <div />
        )}

        {step < 2 ? (
          <button type="button" onClick={() => { if (step === 0 && !validateStep1()) return; setStep(step + 1); }}
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#0C447C] text-white text-sm font-medium rounded-xl hover:bg-[#0C447C]/90 transition-colors">
            Próximo
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button type="button" onClick={handleSubmit} disabled={loading}
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#0C447C] text-white text-sm font-medium rounded-xl hover:bg-[#0C447C]/90 disabled:opacity-50 transition-colors">
            {loading ? 'Publicando...' : 'Publicar solicitação'}
          </button>
        )}
      </div>
    </div>
  );
}

// Suprimir warning de import
export { defaultValidade };
