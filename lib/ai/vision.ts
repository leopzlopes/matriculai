import { getAnthropicClient, AI_MODEL } from '@/lib/ai/anthropic';

// Keywords that appear ONLY in the body of a matrícula, never in the standard
// institutional header ("OFÍCIO DE REGISTRO DE IMÓVEIS DA COMARCA DE...").
// At least one must be present for the text to be considered sufficient.
const BODY_KEYWORDS = [
  'proprietário', 'proprietario',
  'averbação', 'averbacao',
  'confronta',
  'lote n',           // "lote nº", "lote n."
  'área de',          // area description
  'area de',
  'imóvel:', 'imovel:',
  'título aquisitivo', 'titulo aquisitivo',
  'promitente', 'promissário', 'promissario',
  'compra e venda',
  'av.', 'r.1', 'r.2', 'r.3', // registro/averbação numbered entries
];

export function isTextSufficient(text: string): boolean {
  if (!text || text.length < 200) return false;
  const lower = text.toLowerCase();
  return BODY_KEYWORDS.some((kw) => lower.includes(kw));
}

export async function ocrPdfWithVision(pdfBase64: string): Promise<string> {
  const client = getAnthropicClient();

  const message = await client.beta.messages.create({
    model: AI_MODEL,
    max_tokens: 8192,
    betas: ['pdfs-2024-09-25'],
    messages: [
      {
        role: 'user',
        content: [
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          {
            type: 'document',
            source: {
              type: 'base64',
              media_type: 'application/pdf',
              data: pdfBase64,
            },
          } as any,
          {
            type: 'text',
            text: `Este documento é uma certidão de matrícula de imóvel brasileiro. Leia TODAS as páginas com atenção, incluindo o corpo manuscrito e impresso das imagens escaneadas. Transcreva na íntegra:
- O cabeçalho da matrícula (número, cartório, comarca, data)
- Todos os registros de aquisição (R.) com números, datas e texto completo
- Todas as averbações (Av.) com números, datas e texto completo
- O nome e qualificação do(s) proprietário(s)
- A descrição do imóvel (área, confrontações, localização)
Não omita nenhuma informação. Se houver texto manuscrito, transcreva da melhor forma possível.
Se houver texto ilegível, indique com [ilegível].
Responda apenas com o texto transcrito, sem introdução ou comentários.`,
          },
        ],
      },
    ],
  });

  const textBlock = message.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') return '';
  return textBlock.text.trim();
}
