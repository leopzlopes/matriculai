import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from '@react-pdf/renderer';
import type {
  GeneralSummaryData,
  Modulo1Result,
  Modulo2Result,
  Modulo3Result,
} from '@/lib/ai/types';

export interface ReportData {
  analysisId: string;
  registrationNumber: string;
  propertyName: string;
  riskScore: number;
  createdAt: string;
  generalSummary?: GeneralSummaryData;
  registral?: Modulo1Result;
  penhorabilidade?: Modulo2Result;
  avaliacao?: Modulo3Result;
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 56,
    paddingBottom: 52,
    paddingHorizontal: 48,
    fontFamily: 'Helvetica',
    fontSize: 9.5,
    color: '#1e293b',
    lineHeight: 1.4,
  },
  headerFixed: {
    position: 'absolute',
    top: 20,
    left: 48,
    right: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerBrand: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    letterSpacing: 0.5,
  },
  headerMeta: {
    fontSize: 8,
    color: '#64748b',
    textAlign: 'right',
  },
  footerFixed: {
    position: 'absolute',
    bottom: 18,
    left: 48,
    right: 48,
    borderTopWidth: 0.5,
    borderTopColor: '#e2e8f0',
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerDisclaimer: {
    fontSize: 7.5,
    color: '#94a3b8',
    fontFamily: 'Helvetica-Oblique',
  },
  footerPage: {
    fontSize: 7.5,
    color: '#94a3b8',
  },
  sectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: '#0f172a',
    marginTop: 18,
    marginBottom: 6,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
  },
  fieldRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  fieldLabel: {
    width: '32%',
    color: '#64748b',
    fontSize: 9,
  },
  fieldValue: {
    flex: 1,
    color: '#1e293b',
    fontSize: 9,
  },
  paragraph: {
    marginBottom: 6,
    fontSize: 9.5,
    lineHeight: 1.5,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  bullet: {
    width: 12,
    color: '#64748b',
    fontSize: 9,
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    padding: 5,
    marginBottom: 1,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0',
  },
  scoreBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  scoreBadge: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    color: '#ffffff',
  },
  divider: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0',
    marginVertical: 8,
  },
});

function fmt(val?: number): string {
  if (val == null || val === 0) return '—';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(val);
}

function fmtDate(iso?: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('pt-BR');
  } catch {
    return iso;
  }
}

function penhoravelLabel(val?: string): string {
  if (val === 'livre') return 'Livre (penhoravel)';
  if (val === 'parcialmente_penhoravel') return 'Parcialmente penhoravel';
  if (val === 'impenhoravel') return 'Impenhoravel';
  return val ?? '—';
}

function riskBgColor(score: number): string {
  if (score >= 70) return '#dc2626';
  if (score >= 40) return '#d97706';
  return '#16a34a';
}

function riskLabel(score: number): string {
  if (score >= 70) return 'Alto Risco';
  if (score >= 40) return 'Risco Moderado';
  return 'Baixo Risco';
}

function statusLabel(s: string): string {
  if (s === 'completed') return 'OK';
  if (s === 'pending') return 'Pendente';
  if (s === 'attention') return 'Atencao';
  if (s === 'not_applicable') return 'N/A';
  return s;
}

function Field({ label, value }: { label: string; value?: string | number }) {
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value ?? '—'}</Text>
    </View>
  );
}

function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

function TableHeaderCell({
  children,
  flex = 1,
}: {
  children: string;
  flex?: number;
}) {
  return (
    <Text
      style={{ flex, fontFamily: 'Helvetica-Bold', fontSize: 8.5, color: '#475569' }}
    >
      {children}
    </Text>
  );
}

function RelatorioPDF({ data }: { data: ReportData }) {
  const { registrationNumber, propertyName, riskScore, createdAt, generalSummary, registral, penhorabilidade, avaliacao } = data;
  const prop = registral?.property_data;

  return (
    <Document
      title={`Relatorio MatriculAI - Matricula ${registrationNumber}`}
      author="MatriculAI"
      subject="Analise de Matricula de Imovel"
    >
      <Page size="A4" style={styles.page}>
        {/* Fixed Header */}
        <View style={styles.headerFixed} fixed>
          <Text style={styles.headerBrand}>MatriculAI</Text>
          <Text style={styles.headerMeta}>
            Matricula {registrationNumber} | Gerado em {fmtDate(createdAt)}
          </Text>
        </View>

        {/* Fixed Footer */}
        <View style={styles.footerFixed} fixed>
          <Text style={styles.footerDisclaimer}>
            Minuta gerada por IA — revisar antes de uso oficial
          </Text>
          <Text
            style={styles.footerPage}
            render={({ pageNumber, totalPages }) =>
              `Pagina ${pageNumber} de ${totalPages}`
            }
          />
        </View>

        {/* Title */}
        <Text
          style={{
            fontFamily: 'Helvetica-Bold',
            fontSize: 16,
            color: '#0f172a',
            marginBottom: 4,
          }}
        >
          {propertyName}
        </Text>
        <View style={styles.scoreBox}>
          <Text
            style={[
              styles.scoreBadge,
              { backgroundColor: riskBgColor(riskScore) },
            ]}
          >
            Score: {riskScore}/100
          </Text>
          <Text
            style={{
              fontFamily: 'Helvetica-Bold',
              fontSize: 10,
              color: riskBgColor(riskScore),
            }}
          >
            {riskLabel(riskScore)}
          </Text>
        </View>

        {/* 1. Resumo Geral */}
        <SectionTitle>1. Resumo Geral</SectionTitle>
        {generalSummary ? (
          <>
            <Field label="Penhorabilidade" value={penhoravelLabel(generalSummary.penhorabilidade)} />
            {generalSummary.valorEstimado ? (
              <Field label="Valor estimado" value={fmt(generalSummary.valorEstimado)} />
            ) : null}
            {generalSummary.faixaMinima && generalSummary.faixaMaxima ? (
              <Field
                label="Faixa de valor"
                value={`${fmt(generalSummary.faixaMinima)} a ${fmt(generalSummary.faixaMaxima)}`}
              />
            ) : null}
            <View style={styles.divider} />
            <Text style={[styles.paragraph, { fontFamily: 'Helvetica-Bold', fontSize: 9 }]}>Sumario</Text>
            <Text style={styles.paragraph}>{generalSummary.summary}</Text>
            {generalSummary.attention_points?.length > 0 && (
              <>
                <Text style={[styles.paragraph, { fontFamily: 'Helvetica-Bold', fontSize: 9, marginBottom: 3 }]}>
                  Pontos de Atencao
                </Text>
                {generalSummary.attention_points.map((pt, i) => (
                  <View key={i} style={styles.bulletItem}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.bulletText}>{pt}</Text>
                  </View>
                ))}
              </>
            )}
          </>
        ) : (
          <Text style={styles.paragraph}>Dados nao disponiveis.</Text>
        )}

        {/* 2. Dados do Imovel */}
        <SectionTitle>2. Dados do Imovel</SectionTitle>
        {prop ? (
          <>
            <Field label="Tipo de imovel" value={prop.tipoImovel} />
            <Field label="Matricula" value={prop.matricula} />
            <Field label="Oficio" value={prop.oficio} />
            <Field label="Comarca" value={prop.comarca} />
            <Field label="Situacao" value={prop.situacao} />
            <Field label="Insc. imobiliaria" value={prop.inscricaoImobiliaria} />
            {prop.endereco && (
              <Field
                label="Endereco"
                value={[
                  prop.endereco.logradouro,
                  prop.endereco.numero,
                  prop.endereco.complemento,
                  prop.endereco.bairro,
                  prop.endereco.cidade,
                  prop.endereco.estado,
                  prop.endereco.cep,
                ]
                  .filter(Boolean)
                  .join(', ')}
              />
            )}
            {prop.metragem && (
              <>
                <Field label="Area privativa" value={prop.metragem.areaPrivativa ? `${prop.metragem.areaPrivativa} ${prop.metragem.unidadeMedida ?? 'm2'}` : undefined} />
                <Field label="Area total" value={prop.metragem.areaTotal ? `${prop.metragem.areaTotal} ${prop.metragem.unidadeMedida ?? 'm2'}` : undefined} />
              </>
            )}
            <Field label="Valor venal" value={fmt(prop.valorVenal)} />
          </>
        ) : (
          <Text style={styles.paragraph}>Dados nao disponiveis.</Text>
        )}

        {/* 3. Proprietarios */}
        <SectionTitle>3. Proprietarios</SectionTitle>
        {registral?.owners?.length ? (
          <>
            <View style={styles.tableHeader}>
              <TableHeaderCell flex={2}>Nome</TableHeaderCell>
              <TableHeaderCell>CPF/CNPJ</TableHeaderCell>
              <TableHeaderCell>Forma de Aquisicao</TableHeaderCell>
              <TableHeaderCell>Data</TableHeaderCell>
              <TableHeaderCell>%</TableHeaderCell>
            </View>
            {registral.owners.map((o, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={{ flex: 2, fontSize: 8.5 }}>{o.nome}</Text>
                <Text style={{ flex: 1, fontSize: 8.5 }}>{o.cpfCnpj}</Text>
                <Text style={{ flex: 1, fontSize: 8.5 }}>{o.formaAquisicao}</Text>
                <Text style={{ flex: 1, fontSize: 8.5 }}>{fmtDate(o.dataAquisicao)}</Text>
                <Text style={{ flex: 1, fontSize: 8.5 }}>{o.percentualPropriedade}</Text>
              </View>
            ))}
          </>
        ) : (
          <Text style={styles.paragraph}>Nenhum proprietario registrado.</Text>
        )}

        {/* 4. Onus e Gravames */}
        <SectionTitle>4. Onus e Gravames</SectionTitle>
        {registral?.encumbrances?.length ? (
          registral.encumbrances.map((enc, i) => (
            <View key={i} style={{ marginBottom: 8 }}>
              <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9, marginBottom: 2 }}>
                {i + 1}. {enc.tipo} — {enc.situacao} | Gravame: {enc.gravame}
              </Text>
              <Field label="Descricao" value={enc.descricao} />
              <Field label="Valor" value={enc.valor} />
              <Field label="Data de registro" value={fmtDate(enc.dataRegistro)} />
              <Field label="No. de registro" value={enc.numeroRegistro} />
            </View>
          ))
        ) : (
          <Text style={styles.paragraph}>Nenhum onus ou gravame registrado.</Text>
        )}

        {/* 5. Averbacoes */}
        <SectionTitle>5. Averbacoes</SectionTitle>
        {registral?.averbatations?.length ? (
          <>
            <View style={styles.tableHeader}>
              <TableHeaderCell>Tipo</TableHeaderCell>
              <TableHeaderCell>Numero</TableHeaderCell>
              <TableHeaderCell>Data</TableHeaderCell>
              <TableHeaderCell flex={2}>Descricao</TableHeaderCell>
            </View>
            {registral.averbatations.map((av, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={{ flex: 1, fontSize: 8.5 }}>{av.tipo}</Text>
                <Text style={{ flex: 1, fontSize: 8.5 }}>{av.numero}</Text>
                <Text style={{ flex: 1, fontSize: 8.5 }}>{fmtDate(av.data)}</Text>
                <Text style={{ flex: 2, fontSize: 8.5 }}>{av.descricao}</Text>
              </View>
            ))}
          </>
        ) : (
          <Text style={styles.paragraph}>Nenhuma averbacao registrada.</Text>
        )}

        {/* 6. Checklist Due Diligence */}
        <SectionTitle>6. Checklist Due Diligence</SectionTitle>
        {penhorabilidade?.checklist?.length ? (
          (() => {
            const byCategory = penhorabilidade.checklist.reduce<Record<string, typeof penhorabilidade.checklist>>(
              (acc, item) => {
                if (!acc[item.categoria]) acc[item.categoria] = [];
                acc[item.categoria].push(item);
                return acc;
              },
              {}
            );
            return Object.entries(byCategory).map(([cat, items]) => (
              <View key={cat} style={{ marginBottom: 8 }}>
                <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9, color: '#475569', marginBottom: 4 }}>
                  {cat}
                </Text>
                {items.map((item, j) => (
                  <View key={j} style={styles.tableRow}>
                    <Text style={{ flex: 3, fontSize: 8.5 }}>{item.item}</Text>
                    <Text style={{ width: 60, fontSize: 8.5, color: '#475569' }}>
                      {statusLabel(item.status)}
                    </Text>
                    <Text style={{ flex: 2, fontSize: 8, color: '#64748b' }}>{item.observacao}</Text>
                  </View>
                ))}
              </View>
            ));
          })()
        ) : (
          <Text style={styles.paragraph}>Checklist nao disponivel.</Text>
        )}

        {/* Penhorabilidade fundamentacao */}
        {penhorabilidade?.fundamentacao && (
          <>
            <SectionTitle>Fundamentacao Juridica — Penhorabilidade</SectionTitle>
            <Text style={styles.paragraph}>{penhorabilidade.fundamentacao}</Text>
          </>
        )}

        {/* Avaliacao */}
        {avaliacao && (
          <>
            <SectionTitle>Avaliacao de Mercado</SectionTitle>
            <Field label="Valor estimado" value={fmt(avaliacao.valorEstimado)} />
            <Field label="Faixa minima" value={fmt(avaliacao.faixaMinima)} />
            <Field label="Faixa maxima" value={fmt(avaliacao.faixaMaxima)} />
            <Field label="Metodologia" value={avaliacao.metodologia} />
            {avaliacao.observacoes && (
              <>
                <Text style={[styles.paragraph, { fontFamily: 'Helvetica-Bold', fontSize: 9, marginTop: 6 }]}>
                  Observacoes
                </Text>
                <Text style={styles.paragraph}>{avaliacao.observacoes}</Text>
              </>
            )}
          </>
        )}
      </Page>
    </Document>
  );
}

export async function generatePdfBuffer(data: ReportData): Promise<Buffer> {
  return renderToBuffer(<RelatorioPDF data={data} />);
}
