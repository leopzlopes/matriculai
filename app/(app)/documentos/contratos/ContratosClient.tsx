'use client';

import { useState } from 'react';
import { Loader2, Download, RefreshCw, FileText, ChevronRight } from 'lucide-react';
import type { TipoContrato, DadosDocumento, DocumentoGerado, Parte, DadosImovel } from '@/lib/documentos/types';
import { LABEL_CONTRATO } from '@/lib/documentos/types';

const TIPOS = Object.entries(LABEL_CONTRATO) as [TipoContrato, string][];

const ESTADOS_CIVIS = ['solteiro(a)', 'casado(a)', 'divorciado(a)', 'viúvo(a)', 'união estável'];
const REGIMES = ['comunhão parcial de bens', 'comunhão universal de bens', 'separação total de bens', 'participação final nos aquestos'];

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'complete'; documento: DocumentoGerado }
  | { status: 'error'; message: string };

function emptyParte(): Parte {
  return { nome: '', cpfCnpj: '', estadoCivil: 'solteiro(a)', regimeBens: '', endereco: '', qualificacao: '' };
}

function emptyImovel(): DadosImovel {
  return { matricula: '', cartorio: '', comarca: '', descricao: '', area: '', endereco: '' };
}

function inputClass() {
  return 'w-full px-3 py-2 rounded-lg border border-black/[0.12] bg-white text-sm text-[#111219] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0C447C]/20 focus:border-[#0C447C] transition-colors';
}

function labelClass() {
  return 'block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1';
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold text-[#111219] mb-3 pb-2 border-b border-slate-100">{children}</h3>;
}

// Labels das partes conforme tipo
const PARTE_LABELS: Record<TipoContrato, { outorgante: string; outorgado: string }> = {
  compromisso_compra_venda: { outorgante: 'Promitente Vendedor', outorgado: 'Promitente Comprador' },
  compra_venda_financiamento: { outorgante: 'Vendedor', outorgado: 'Comprador' },
  locacao_residencial: { outorgante: 'Locador', outorgado: 'Locatário' },
  locacao_comercial: { outorgante: 'Locador', outorgado: 'Locatário' },
  cessao_direitos: { outorgante: 'Cedente', outorgado: 'Cessionário' },
};

export function ContratosClient() {
  const [tipo, setTipo] = useState<TipoContrato | ''>('');
  const [outorgante, setOutorgante] = useState<Parte>(emptyParte());
  const [outorgado, setOutorgado] = useState<Parte>(emptyParte());
  const [imovel, setImovel] = useState<DadosImovel>(emptyImovel());
  const [valor, setValor] = useState('');
  const [condicoes, setCondicoes] = useState('');
  const [campos, setCampos] = useState<Record<string, string>>({});
  const [state, setState] = useState<State>({ status: 'idle' });
  const [downloadingDocx, setDownloadingDocx] = useState(false);

  function updateCampo(key: string, value: string) {
    setCampos((prev) => ({ ...prev, [key]: value }));
  }

  const parteLabels = tipo ? PARTE_LABELS[tipo] : { outorgante: 'Parte 1', outorgado: 'Parte 2' };

  async function handleGerar() {
    if (!tipo) return;
    setState({ status: 'loading' });

    const dados: DadosDocumento = {
      tipo,
      outorgantes: [outorgante],
      outorgados: [outorgado],
      imovel,
      valor,
      condicoesPagamento: condicoes,
      camposEspecificos: campos,
    };

    try {
      const res = await fetch('/api/documentos/gerar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dados }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState({ status: 'error', message: data.error ?? 'Erro ao gerar documento' });
        return;
      }
      setState({ status: 'complete', documento: data as DocumentoGerado });
    } catch {
      setState({ status: 'error', message: 'Erro de conexão. Tente novamente.' });
    }
  }

  async function handleDownloadDocx() {
    if (state.status !== 'complete') return;
    setDownloadingDocx(true);
    try {
      const res = await fetch('/api/documentos/exportar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: state.documento.titulo, texto: state.documento.texto }),
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `minuta-${tipo}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloadingDocx(false);
    }
  }

  // ── Preview ─────────────────────────────────────────────────────────────
  if (state.status === 'complete') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#111219]">{state.documento.titulo}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setState({ status: 'idle' })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Gerar Novamente
            </button>
            <button
              onClick={handleDownloadDocx}
              disabled={downloadingDocx}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0C447C] text-white hover:bg-[#0C447C]/90 transition-colors disabled:opacity-50"
            >
              {downloadingDocx ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              Exportar DOCX
            </button>
          </div>
        </div>

        <div className="bg-white border border-black/[0.08] rounded-xl p-8 shadow-sm">
          <h3 className="text-base font-bold text-center text-[#111219] mb-6 uppercase tracking-wide">
            {state.documento.titulo}
          </h3>
          <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-line font-serif">
            {state.documento.texto}
          </div>
        </div>

        <p className="text-xs text-slate-400 text-center italic">
          Minuta gerada por IA — revisar com advogado antes da assinatura
        </p>
      </div>
    );
  }

  // ── Form ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Type selector */}
      <div>
        <SectionTitle>Tipo de Contrato</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {TIPOS.map(([value, label]) => (
            <button
              key={value}
              onClick={() => setTipo(value)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm text-left transition-colors ${
                tipo === value
                  ? 'border-[#0C447C] bg-[#E6F1FB] text-[#0C447C] font-semibold'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <FileText className={`w-4 h-4 flex-shrink-0 ${tipo === value ? 'text-[#0C447C]' : 'text-slate-400'}`} />
              <span className="leading-tight">{label}</span>
              {tipo === value && <ChevronRight className="w-3 h-3 ml-auto flex-shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      {tipo && (
        <>
          {/* Outorgante */}
          <div>
            <SectionTitle>{parteLabels.outorgante}</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={labelClass()}>Nome completo *</label>
                <input className={inputClass()} value={outorgante.nome} onChange={(e) => setOutorgante({ ...outorgante, nome: e.target.value })} placeholder="Nome como no documento" />
              </div>
              <div>
                <label className={labelClass()}>CPF / CNPJ *</label>
                <input className={inputClass()} value={outorgante.cpfCnpj} onChange={(e) => setOutorgante({ ...outorgante, cpfCnpj: e.target.value })} placeholder="000.000.000-00" />
              </div>
              <div>
                <label className={labelClass()}>Estado Civil</label>
                <select className={inputClass()} value={outorgante.estadoCivil} onChange={(e) => setOutorgante({ ...outorgante, estadoCivil: e.target.value })}>
                  {ESTADOS_CIVIS.map((ec) => <option key={ec} value={ec}>{ec}</option>)}
                </select>
              </div>
              {outorgante.estadoCivil.includes('casad') && (
                <div>
                  <label className={labelClass()}>Regime de Bens</label>
                  <select className={inputClass()} value={outorgante.regimeBens} onChange={(e) => setOutorgante({ ...outorgante, regimeBens: e.target.value })}>
                    <option value="">Selecione...</option>
                    {REGIMES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className={labelClass()}>Qualificação</label>
                <input className={inputClass()} value={outorgante.qualificacao ?? ''} onChange={(e) => setOutorgante({ ...outorgante, qualificacao: e.target.value })} placeholder="Ex: empresário, autônomo..." />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass()}>Endereço completo *</label>
                <input className={inputClass()} value={outorgante.endereco} onChange={(e) => setOutorgante({ ...outorgante, endereco: e.target.value })} placeholder="Rua, nº, bairro, cidade, estado, CEP" />
              </div>
            </div>
          </div>

          {/* Outorgado */}
          <div>
            <SectionTitle>{parteLabels.outorgado}</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={labelClass()}>Nome completo *</label>
                <input className={inputClass()} value={outorgado.nome} onChange={(e) => setOutorgado({ ...outorgado, nome: e.target.value })} placeholder="Nome como no documento" />
              </div>
              <div>
                <label className={labelClass()}>CPF / CNPJ *</label>
                <input className={inputClass()} value={outorgado.cpfCnpj} onChange={(e) => setOutorgado({ ...outorgado, cpfCnpj: e.target.value })} placeholder="000.000.000-00" />
              </div>
              <div>
                <label className={labelClass()}>Estado Civil</label>
                <select className={inputClass()} value={outorgado.estadoCivil} onChange={(e) => setOutorgado({ ...outorgado, estadoCivil: e.target.value })}>
                  {ESTADOS_CIVIS.map((ec) => <option key={ec} value={ec}>{ec}</option>)}
                </select>
              </div>
              {outorgado.estadoCivil.includes('casad') && (
                <div>
                  <label className={labelClass()}>Regime de Bens</label>
                  <select className={inputClass()} value={outorgado.regimeBens} onChange={(e) => setOutorgado({ ...outorgado, regimeBens: e.target.value })}>
                    <option value="">Selecione...</option>
                    {REGIMES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className={labelClass()}>Qualificação</label>
                <input className={inputClass()} value={outorgado.qualificacao ?? ''} onChange={(e) => setOutorgado({ ...outorgado, qualificacao: e.target.value })} placeholder="Ex: empresário, autônomo..." />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass()}>Endereço completo *</label>
                <input className={inputClass()} value={outorgado.endereco} onChange={(e) => setOutorgado({ ...outorgado, endereco: e.target.value })} placeholder="Rua, nº, bairro, cidade, estado, CEP" />
              </div>
            </div>
          </div>

          {/* Imóvel */}
          <div>
            <SectionTitle>Dados do Imóvel</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={labelClass()}>Matrícula nº</label>
                <input className={inputClass()} value={imovel.matricula} onChange={(e) => setImovel({ ...imovel, matricula: e.target.value })} placeholder="Ex: 12.345" />
              </div>
              <div>
                <label className={labelClass()}>Cartório (Ofício de RI)</label>
                <input className={inputClass()} value={imovel.cartorio} onChange={(e) => setImovel({ ...imovel, cartorio: e.target.value })} placeholder="Ex: 1º Oficial de Registro de Imóveis" />
              </div>
              <div>
                <label className={labelClass()}>Comarca</label>
                <input className={inputClass()} value={imovel.comarca} onChange={(e) => setImovel({ ...imovel, comarca: e.target.value })} placeholder="Ex: São Paulo" />
              </div>
              <div>
                <label className={labelClass()}>Área</label>
                <input className={inputClass()} value={imovel.area} onChange={(e) => setImovel({ ...imovel, area: e.target.value })} placeholder="Ex: 120,00 m²" />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass()}>Endereço do imóvel *</label>
                <input className={inputClass()} value={imovel.endereco} onChange={(e) => setImovel({ ...imovel, endereco: e.target.value })} placeholder="Rua, nº, bairro, cidade, estado, CEP" />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass()}>Descrição</label>
                <textarea className={`${inputClass()} resize-none`} rows={2} value={imovel.descricao} onChange={(e) => setImovel({ ...imovel, descricao: e.target.value })} placeholder="Descrição do imóvel..." />
              </div>
            </div>
          </div>

          {/* Negócio */}
          <div>
            <SectionTitle>Negócio</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={labelClass()}>
                  {tipo === 'locacao_residencial' || tipo === 'locacao_comercial' ? 'Valor do Aluguel (R$/mês) *' : 'Valor (R$) *'}
                </label>
                <input className={inputClass()} value={valor} onChange={(e) => setValor(e.target.value)} placeholder="Ex: R$ 3.500,00" />
              </div>
              <div>
                <label className={labelClass()}>Condições de pagamento</label>
                <input className={inputClass()} value={condicoes} onChange={(e) => setCondicoes(e.target.value)} placeholder="Ex: à vista, parcelado..." />
              </div>
            </div>
          </div>

          {/* Campos específicos */}
          {(tipo === 'locacao_residencial' || tipo === 'locacao_comercial') && (
            <div>
              <SectionTitle>Dados da Locação</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className={labelClass()}>Prazo (meses)</label>
                  <input className={inputClass()} value={campos.prazoMeses ?? ''} onChange={(e) => updateCampo('prazoMeses', e.target.value)} placeholder="Ex: 30" />
                </div>
                <div>
                  <label className={labelClass()}>Dia de vencimento</label>
                  <input className={inputClass()} value={campos.diaVencimento ?? ''} onChange={(e) => updateCampo('diaVencimento', e.target.value)} placeholder="Ex: 5" />
                </div>
                <div>
                  <label className={labelClass()}>Garantia locatícia</label>
                  <input className={inputClass()} value={campos.caucao ?? ''} onChange={(e) => updateCampo('caucao', e.target.value)} placeholder="Ex: caução 3 meses" />
                </div>
              </div>
            </div>
          )}

          {tipo === 'compromisso_compra_venda' && (
            <div>
              <SectionTitle>Dados do Compromisso</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass()}>Prazo para escritura definitiva</label>
                  <input className={inputClass()} value={campos.prazoEscritura ?? ''} onChange={(e) => updateCampo('prazoEscritura', e.target.value)} placeholder="Ex: 90 dias" />
                </div>
                <div>
                  <label className={labelClass()}>Arras (%)</label>
                  <input className={inputClass()} value={campos.arrasPercentual ?? ''} onChange={(e) => updateCampo('arrasPercentual', e.target.value)} placeholder="Ex: 10" />
                </div>
              </div>
            </div>
          )}

          {tipo === 'compra_venda_financiamento' && (
            <div>
              <SectionTitle>Dados do Financiamento</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-3">
                  <label className={labelClass()}>Banco / Agente Financiador</label>
                  <input className={inputClass()} value={campos.bancoFinanciador ?? ''} onChange={(e) => updateCampo('bancoFinanciador', e.target.value)} placeholder="Ex: Caixa Econômica Federal" />
                </div>
                <div>
                  <label className={labelClass()}>Valor Financiado</label>
                  <input className={inputClass()} value={campos.valorFinanciado ?? ''} onChange={(e) => updateCampo('valorFinanciado', e.target.value)} placeholder="Ex: R$ 350.000,00" />
                </div>
                <div>
                  <label className={labelClass()}>Prazo (meses)</label>
                  <input className={inputClass()} value={campos.prazoMeses ?? ''} onChange={(e) => updateCampo('prazoMeses', e.target.value)} placeholder="Ex: 240" />
                </div>
              </div>
            </div>
          )}

          {tipo === 'cessao_direitos' && (
            <div>
              <SectionTitle>Direitos Cedidos</SectionTitle>
              <div>
                <label className={labelClass()}>Descrição dos direitos objeto da cessão</label>
                <textarea className={`${inputClass()} resize-none`} rows={3} value={campos.descricaoDireitos ?? ''} onChange={(e) => updateCampo('descricaoDireitos', e.target.value)} placeholder="Descreva os direitos a serem cedidos..." />
              </div>
            </div>
          )}

          {state.status === 'error' && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {state.message}
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={handleGerar}
              disabled={state.status === 'loading' || !tipo || !outorgante.nome || !outorgado.nome || !imovel.endereco}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold bg-[#0C447C] text-white hover:bg-[#0C447C]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {state.status === 'loading' ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Gerando contrato...</>
              ) : (
                <><FileText className="w-4 h-4" />Gerar Contrato</>
              )}
            </button>
            <p className="text-xs text-slate-400 mt-2">A geração leva cerca de 15–30 segundos</p>
          </div>
        </>
      )}
    </div>
  );
}
