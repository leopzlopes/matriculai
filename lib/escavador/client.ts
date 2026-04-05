import type { ProcessoCNJ, Movimentacao, ProcessoEnvolvido } from './types';

const BASE = 'https://api.escavador.com/api/v2';

function getHeaders(): HeadersInit {
  const key = process.env.ESCAVADOR_API_KEY;
  if (!key) throw new Error('ESCAVADOR_API_KEY não configurada');
  return {
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

async function fetchEscavador<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: getHeaders(),
    next: { revalidate: 0 },
  });

  if (res.status === 404) {
    throw new EscavadorNotFoundError();
  }

  if (res.status === 429) {
    throw new Error('Limite de requisições Escavador atingido. Tente novamente em instantes.');
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Escavador API error ${res.status}: ${body}`);
  }

  return res.json() as Promise<T>;
}

export class EscavadorNotFoundError extends Error {
  constructor() {
    super('Processo não encontrado no Escavador.');
  }
}

export async function buscarProcessoPorCNJ(numeroCnj: string): Promise<ProcessoCNJ | null> {
  const encoded = encodeURIComponent(numeroCnj);
  try {
    const data = await fetchEscavador<{ item: ProcessoCNJ }>(`/processos/numero_cnj/${encoded}`);
    return data.item ?? null;
  } catch (e) {
    if (e instanceof EscavadorNotFoundError) return null;
    throw e;
  }
}

export async function buscarMovimentacoes(numeroCnj: string): Promise<Movimentacao[]> {
  const encoded = encodeURIComponent(numeroCnj);
  try {
    const data = await fetchEscavador<{ items: Movimentacao[] }>(
      `/processos/numero_cnj/${encoded}/movimentacoes`
    );
    return data.items ?? [];
  } catch (e) {
    if (e instanceof EscavadorNotFoundError) return [];
    throw e;
  }
}

export async function buscarProcessosPorNome(nome: string): Promise<ProcessoEnvolvido[]> {
  const encoded = encodeURIComponent(nome);
  try {
    const data = await fetchEscavador<{ items: ProcessoEnvolvido[] }>(
      `/envolvido/processos?nome=${encoded}`
    );
    return data.items ?? [];
  } catch (e) {
    if (e instanceof EscavadorNotFoundError) return [];
    throw e;
  }
}
