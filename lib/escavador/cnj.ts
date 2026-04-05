export const CNJ_FORMATTED = /\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}/;
export const CNJ_RAW = /\d[\d\s]{18}\d/; // 20 dígitos com possíveis espaços intercalados

export function formatCNJ(digits: string): string {
  const d = digits.replace(/\D/g, '');
  return `${d.slice(0, 7)}-${d.slice(7, 9)}.${d.slice(9, 13)}.${d.slice(13, 14)}.${d.slice(14, 16)}.${d.slice(16, 20)}`;
}

export function extractCNJ(text: string): string | null {
  if (!text) return null;
  const formatted = text.match(CNJ_FORMATTED);
  if (formatted) return formatted[0];

  const raw = text.match(CNJ_RAW);
  if (raw) {
    const digits = raw[0].replace(/\D/g, '');
    if (digits.length === 20) return formatCNJ(digits);
  }

  return null;
}
