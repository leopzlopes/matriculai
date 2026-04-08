import {
  Document,
  Footer,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  WidthType,
  BorderStyle,
  ShadingType,
} from 'docx';
import type { ReportData } from './pdf';

function fmtDate(iso?: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('pt-BR');
  } catch {
    return iso;
  }
}

function fmt(val?: number): string {
  if (val == null || val === 0) return '—';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(val);
}

function penhoravelLabel(val?: string): string {
  if (val === 'livre') return 'Livre (penhorável)';
  if (val === 'parcialmente_penhoravel') return 'Parcialmente penhorável';
  if (val === 'impenhoravel') return 'Impenhorável';
  return val ?? '—';
}

function statusLabel(s: string): string {
  if (s === 'completed') return '✓ OK';
  if (s === 'pending') return '⏳ Pendente';
  if (s === 'attention') return '⚠ Atenção';
  if (s === 'not_applicable') return '— N/A';
  return s;
}

function riskLabel(score: number): string {
  if (score >= 70) return 'Alto Risco';
  if (score >= 40) return 'Risco Moderado';
  return 'Baixo Risco';
}

const NO_BORDER = {
  top: { style: BorderStyle.NONE, size: 0 },
  bottom: { style: BorderStyle.NONE, size: 0 },
  left: { style: BorderStyle.NONE, size: 0 },
  right: { style: BorderStyle.NONE, size: 0 },
};

const THIN_BORDER = {
  top: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
  left: { style: BorderStyle.NONE, size: 0 },
  right: { style: BorderStyle.NONE, size: 0 },
};

function heading1(text: string): Paragraph {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 300, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' } },
  });
}

function heading2(text: string): Paragraph {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 80 },
  });
}

function fieldRow(label: string, value?: string | number): Paragraph {
  return new Paragraph({
    spacing: { after: 40 },
    children: [
      new TextRun({ text: `${label}: `, bold: true, size: 18, color: '475569' }),
      new TextRun({ text: String(value ?? '—'), size: 18 }),
    ],
  });
}

function tableHeaderRow(cells: string[]): TableRow {
  return new TableRow({
    children: cells.map((text) =>
      new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ text, bold: true, size: 16, color: '475569' })],
          }),
        ],
        borders: THIN_BORDER,
        shading: { type: ShadingType.CLEAR, fill: 'F1F5F9' },
        margins: { top: 60, bottom: 60, left: 80, right: 80 },
      })
    ),
  });
}

function tableDataRow(cells: string[]): TableRow {
  return new TableRow({
    children: cells.map((text) =>
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text, size: 16 })] })],
        borders: THIN_BORDER,
        margins: { top: 60, bottom: 60, left: 80, right: 80 },
      })
    ),
  });
}

export async function generateDocxBuffer(data: ReportData): Promise<Buffer> {
  const {
    registrationNumber,
    propertyName,
    riskScore,
    createdAt,
    generalSummary,
    registral,
    penhorabilidade,
    avaliacao,
  } = data;

  const prop = registral?.property_data;
  const sections: Paragraph[] = [];

  // ── Título ──────────────────────────────────────────────────────────────
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'RELATÓRIO DE ANÁLISE DE MATRÍCULA',
          bold: true,
          size: 28,
          color: '0F172A',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: propertyName, bold: true, size: 22 }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `Matrícula: ${registrationNumber}  |  Score de Risco: ${riskScore}/100 — ${riskLabel(riskScore)}  |  ${fmtDate(createdAt)}`, size: 18, color: '64748B' }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
    }),
  );

  // ── 1. Resumo Geral ──────────────────────────────────────────────────────
  sections.push(heading1('1. Resumo Geral'));

  if (generalSummary) {
    sections.push(
      fieldRow('Penhorabilidade', penhoravelLabel(generalSummary.penhorabilidade)),
    );
    if (generalSummary.valorEstimado)
      sections.push(fieldRow('Valor estimado', fmt(generalSummary.valorEstimado)));
    if (generalSummary.faixaMinima && generalSummary.faixaMaxima)
      sections.push(fieldRow('Faixa de valor', `${fmt(generalSummary.faixaMinima)} a ${fmt(generalSummary.faixaMaxima)}`));

    sections.push(
      new Paragraph({ spacing: { before: 120, after: 60 }, children: [new TextRun({ text: 'Sumário', bold: true, size: 19 })] }),
      new Paragraph({ children: [new TextRun({ text: generalSummary.summary, size: 18 })], spacing: { after: 120 } }),
    );

    if (generalSummary.attention_points?.length) {
      sections.push(
        new Paragraph({ spacing: { before: 80, after: 60 }, children: [new TextRun({ text: 'Pontos de Atenção', bold: true, size: 19 })] }),
        ...generalSummary.attention_points.map(
          (pt) =>
            new Paragraph({
              children: [new TextRun({ text: pt, size: 18 })],
              bullet: { level: 0 },
              spacing: { after: 40 },
            })
        ),
      );
    }
  } else {
    sections.push(new Paragraph({ children: [new TextRun({ text: 'Dados não disponíveis.', size: 18, italics: true })] }));
  }

  // ── 2. Dados do Imóvel ──────────────────────────────────────────────────
  sections.push(heading1('2. Dados do Imóvel'));

  if (prop) {
    sections.push(
      fieldRow('Tipo de imóvel', prop.tipoImovel),
      fieldRow('Matrícula', prop.matricula),
      fieldRow('Ofício', prop.oficio),
      fieldRow('Comarca', prop.comarca),
      fieldRow('Estado', prop.estado),
      fieldRow('Situação', prop.situacao),
      fieldRow('Inscrição imobiliária', prop.inscricaoImobiliaria),
    );
    if (prop.endereco) {
      sections.push(
        fieldRow(
          'Endereço',
          [prop.endereco.logradouro, prop.endereco.numero, prop.endereco.complemento, prop.endereco.bairro, prop.endereco.cidade, prop.endereco.estado, prop.endereco.cep]
            .filter(Boolean)
            .join(', '),
        ),
      );
    }
    if (prop.metragem) {
      const u = prop.metragem.unidadeMedida ?? 'm²';
      if (prop.metragem.areaPrivativa) sections.push(fieldRow('Área privativa', `${prop.metragem.areaPrivativa} ${u}`));
      if (prop.metragem.areaComum) sections.push(fieldRow('Área comum', `${prop.metragem.areaComum} ${u}`));
      if (prop.metragem.areaTotal) sections.push(fieldRow('Área total', `${prop.metragem.areaTotal} ${u}`));
    }
    sections.push(fieldRow('Valor venal', fmt(prop.valorVenal)));
  } else {
    sections.push(new Paragraph({ children: [new TextRun({ text: 'Dados não disponíveis.', size: 18, italics: true })] }));
  }

  // ── 3. Proprietários ──────────────────────────────────────────────────────
  sections.push(heading1('3. Proprietários'));

  if (registral?.owners?.length) {
    sections.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          tableHeaderRow(['Nome', 'CPF/CNPJ', 'Forma de Aquisição', 'Data', '%']),
          ...registral.owners.map((o) =>
            tableDataRow([o.nome, o.cpfCnpj, o.formaAquisicao, fmtDate(o.dataAquisicao), o.percentualPropriedade])
          ),
        ],
      }) as unknown as Paragraph,
      new Paragraph({ text: '', spacing: { after: 120 } }),
    );
  } else {
    sections.push(new Paragraph({ children: [new TextRun({ text: 'Nenhum proprietário registrado.', size: 18, italics: true })] }));
  }

  // ── 4. Ônus e Gravames ──────────────────────────────────────────────────
  sections.push(heading1('4. Ônus e Gravames'));

  if (registral?.encumbrances?.length) {
    registral.encumbrances.forEach((enc, i) => {
      sections.push(
        heading2(`${i + 1}. ${enc.tipo} — ${enc.situacao} | Gravame: ${enc.gravame}`),
        fieldRow('Descrição', enc.descricao),
        fieldRow('Valor', enc.valor),
        fieldRow('Data de registro', fmtDate(enc.dataRegistro)),
        fieldRow('Nº de registro', enc.numeroRegistro),
        new Paragraph({ text: '', spacing: { after: 80 } }),
      );
    });
  } else {
    sections.push(new Paragraph({ children: [new TextRun({ text: 'Nenhum ônus ou gravame registrado.', size: 18, italics: true })] }));
  }

  // ── 5. Averbações ──────────────────────────────────────────────────────
  sections.push(heading1('5. Averbações'));

  if (registral?.averbatations?.length) {
    sections.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          tableHeaderRow(['Tipo', 'Número', 'Data', 'Descrição']),
          ...registral.averbatations.map((av) =>
            tableDataRow([av.tipo, av.numero, fmtDate(av.data), av.descricao])
          ),
        ],
      }) as unknown as Paragraph,
      new Paragraph({ text: '', spacing: { after: 120 } }),
    );
  } else {
    sections.push(new Paragraph({ children: [new TextRun({ text: 'Nenhuma averbação registrada.', size: 18, italics: true })] }));
  }

  // ── 6. Checklist Due Diligence ──────────────────────────────────────────
  sections.push(heading1('6. Checklist Due Diligence'));

  if (penhorabilidade?.checklist?.length) {
    const byCategory = penhorabilidade.checklist.reduce<Record<string, typeof penhorabilidade.checklist>>(
      (acc, item) => {
        if (!acc[item.categoria]) acc[item.categoria] = [];
        acc[item.categoria].push(item);
        return acc;
      },
      {}
    );

    for (const [cat, items] of Object.entries(byCategory)) {
      sections.push(heading2(cat));
      sections.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            tableHeaderRow(['Item', 'Status', 'Observação']),
            ...items.map((item) =>
              tableDataRow([item.item, statusLabel(item.status), item.observacao ?? ''])
            ),
          ],
        }) as unknown as Paragraph,
        new Paragraph({ text: '', spacing: { after: 80 } }),
      );
    }

    if (penhorabilidade.fundamentacao) {
      sections.push(
        heading1('Fundamentação Jurídica — Penhorabilidade'),
        new Paragraph({ children: [new TextRun({ text: penhorabilidade.fundamentacao, size: 18 })], spacing: { after: 120 } }),
      );
    }
  } else {
    sections.push(new Paragraph({ children: [new TextRun({ text: 'Checklist não disponível.', size: 18, italics: true })] }));
  }

  // ── Avaliação de Mercado ──────────────────────────────────────────────
  if (avaliacao) {
    sections.push(
      heading1('Avaliação de Mercado'),
      fieldRow('Valor estimado', fmt(avaliacao.valorEstimado)),
      fieldRow('Faixa mínima', fmt(avaliacao.faixaMinima)),
      fieldRow('Faixa máxima', fmt(avaliacao.faixaMaxima)),
      fieldRow('Metodologia', avaliacao.metodologia),
    );
    if (avaliacao.observacoes) {
      sections.push(
        new Paragraph({ spacing: { before: 100, after: 60 }, children: [new TextRun({ text: 'Observações', bold: true, size: 19 })] }),
        new Paragraph({ children: [new TextRun({ text: avaliacao.observacoes, size: 18 })], spacing: { after: 120 } }),
      );
    }
  }

  // ── Rodapé / Disclaimer ──────────────────────────────────────────────
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Minuta gerada por IA — revisar antes de uso oficial',
          italics: true,
          size: 16,
          color: '94A3B8',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 400 },
      border: { top: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' } },
    })
  );

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Calibri', size: 18, color: '1E293B' },
        },
      },
      paragraphStyles: [
        {
          id: 'Heading1',
          name: 'Heading 1',
          basedOn: 'Normal',
          run: { bold: true, size: 22, color: '0F172A', font: 'Calibri' },
          paragraph: {
            spacing: { before: 300, after: 120 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' } },
          },
        },
        {
          id: 'Heading2',
          name: 'Heading 2',
          basedOn: 'Normal',
          run: { bold: true, size: 19, color: '334155', font: 'Calibri' },
          paragraph: { spacing: { before: 200, after: 80 } },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Minuta gerada por IA — revisar antes de uso oficial  |  Imovalia  |  ' + fmtDate(createdAt),
                    size: 14,
                    color: '94A3B8',
                    italics: true,
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        },
        children: sections,
      },
    ],
  });

  return Packer.toBuffer(doc);
}
