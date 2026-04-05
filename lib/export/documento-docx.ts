import {
  Document,
  Footer,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
} from 'docx';

// Twip conversions (1 cm = 566.93 twips)
const CM = (cm: number) => Math.round(cm * 567);

function dateByExtension(): string {
  const now = new Date();
  const months = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
  ];
  return `${now.getDate()} de ${months[now.getMonth()]} de ${now.getFullYear()}`;
}

function isClauseHeader(line: string): boolean {
  const trimmed = line.trim();
  // Clause headers: "CLÁUSULA PRIMEIRA", "ART. 1", "I -", all-caps short lines
  return (
    /^(CL[ÁA]USULA|ART\.|ARTIGO|CAPÍTULO|SE[CÇ][ÃA]O)\s/i.test(trimmed) ||
    /^[IVXLCDM]+\s*[–\-]/.test(trimmed) ||
    (trimmed === trimmed.toUpperCase() && trimmed.length > 3 && trimmed.length < 80 && /[A-Z]/.test(trimmed))
  );
}

function buildBodyParagraph(line: string): Paragraph {
  const trimmed = line.trim();
  const isHeader = isClauseHeader(trimmed);

  return new Paragraph({
    children: [
      new TextRun({
        text: trimmed,
        font: 'Times New Roman',
        size: 24, // 12pt (half-points)
        bold: isHeader,
      }),
    ],
    alignment: isHeader ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
    indent: isHeader ? undefined : { firstLine: CM(1.25) },
    spacing: {
      line: 360,      // 1.5 line spacing (240 = single)
      lineRule: 'auto' as const,
      after: isHeader ? 120 : 0,
      before: isHeader ? 120 : 0,
    },
  });
}

export async function gerarDocumentoDocxBuffer(titulo: string, texto: string, cidade?: string): Promise<Buffer> {
  const lines = texto.split('\n');
  const bodyParagraphs = lines
    .map((line) => {
      if (line.trim() === '') {
        // Empty line → small spacer
        return new Paragraph({
          text: '',
          spacing: { after: 80 },
        });
      }
      return buildBodyParagraph(line);
    });

  const footerText = `${cidade ?? 'Local'}, ${dateByExtension()}. — Minuta gerada por IA — revisar com advogado e tabelião antes da lavratura.`;

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Times New Roman', size: 24, color: '000000' },
          paragraph: {
            spacing: { line: 360, lineRule: 'auto' as const },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: CM(3),
              bottom: CM(2),
              left: CM(3),
              right: CM(2),
            },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: footerText,
                    font: 'Times New Roman',
                    size: 18, // 9pt
                    italics: true,
                    color: '666666',
                  }),
                ],
                alignment: AlignmentType.CENTER,
                border: {
                  top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
                },
              }),
            ],
          }),
        },
        children: [
          // Title
          new Paragraph({
            children: [
              new TextRun({
                text: titulo.toUpperCase(),
                font: 'Times New Roman',
                size: 28, // 14pt
                bold: true,
                color: '000000',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 480, line: 360, lineRule: 'auto' as const },
          }),

          // Body
          ...bodyParagraphs,
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}
