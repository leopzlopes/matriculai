import type { DadosDocumento, TipoDocumento } from './types';

const SYSTEM_PROMPT = `Você é um advogado especialista em direito imobiliário e tabelionato de notas brasileiro com 20 anos de experiência.
Redija minutas jurídicas completas, tecnicamente corretas e no padrão cartorário brasileiro.

REGRAS OBRIGATÓRIAS:
- Responda EXCLUSIVAMENTE em JSON com o formato: { "titulo": "...", "texto": "..." }
- O título deve estar em maiúsculas, sem marcação markdown
- O texto deve ser a minuta completa, com cláusulas numeradas no estilo jurídico brasileiro
- Use linguagem jurídica formal e técnica, conforme padrão notarial brasileiro
- Inclua todas as qualificações das partes, descrição do imóvel, cláusulas essenciais e disposições finais
- Não use markdown (sem **, sem #, sem -)
- Separe parágrafos e cláusulas com quebras de linha (\n)
- O texto deve estar pronto para ser levado ao cartório, sujeito apenas a revisão do advogado`;

const TITULOS: Record<TipoDocumento, string> = {
  compra_venda_simples: 'ESCRITURA PÚBLICA DE COMPRA E VENDA',
  compra_venda_alienacao_fiduciaria: 'ESCRITURA PÚBLICA DE COMPRA E VENDA COM ALIENAÇÃO FIDUCIÁRIA EM GARANTIA',
  doacao: 'ESCRITURA PÚBLICA DE DOAÇÃO',
  permuta: 'ESCRITURA PÚBLICA DE PERMUTA',
  compra_venda_hipoteca: 'ESCRITURA PÚBLICA DE COMPRA E VENDA COM PACTO ADJETO DE HIPOTECA',
  compromisso_compra_venda: 'CONTRATO PARTICULAR DE COMPROMISSO DE COMPRA E VENDA DE IMÓVEL',
  compra_venda_financiamento: 'CONTRATO PARTICULAR DE COMPRA E VENDA DE IMÓVEL COM FINANCIAMENTO',
  locacao_residencial: 'CONTRATO DE LOCAÇÃO RESIDENCIAL',
  locacao_comercial: 'CONTRATO DE LOCAÇÃO COMERCIAL',
  cessao_direitos: 'CONTRATO DE CESSÃO E TRANSFERÊNCIA DE DIREITOS',
};

function formatarParte(parte: DadosDocumento['outorgantes'][0], papel: string): string {
  const regimeBens = parte.estadoCivil.toLowerCase().includes('casad') && parte.regimeBens
    ? `, casado(a) sob o regime de ${parte.regimeBens}`
    : '';
  return `${papel.toUpperCase()}: ${parte.nome}, ${parte.qualificacao ? parte.qualificacao + ', ' : ''}${parte.estadoCivil}${regimeBens}, inscrito(a) no CPF/CNPJ sob nº ${parte.cpfCnpj}, residente e domiciliado(a) em ${parte.endereco}`;
}

function instrucoesPorTipo(tipo: TipoDocumento, campos: Record<string, string> | undefined, dados: DadosDocumento): string {
  switch (tipo) {
    case 'compra_venda_simples':
      return `Inclua obrigatoriamente: qualificação completa das partes, descrição detalhada do imóvel (conforme matrícula), preço e condições de pagamento, declarações de quitação, cláusulas de evicção e vícios redibitórios, anuência do cônjuge se casado, e disposições finais com menção à tributação (ITBI).`;

    case 'compra_venda_alienacao_fiduciaria':
      return `Inclua: qualificação das partes e do credor fiduciário (${campos?.credorFiduciario ?? 'instituição financeira'}), descrição do imóvel, valor total (${dados.valor}), valor financiado (${campos?.valorFinanciado ?? ''}), prazo (${campos?.prazoMeses ?? ''} meses), constituição da propriedade fiduciária, cláusulas de inadimplemento e consolidação da propriedade, direito de purga da mora, e leilão extrajudicial conforme Lei 9.514/97.`;

    case 'doacao':
      return `Inclua: qualificação do doador e donatário, descrição do imóvel, modalidade da doação (pura e simples ou com encargos: ${campos?.encargos ?? 'sem encargos'}), aceitação expressa do donatário, declaração de inexistência de dívidas, cláusulas de ingratidão, e disposições sobre ITCMD.`;

    case 'permuta':
      return `Inclua: qualificação das partes (ambas na condição de permutantes), descrição do imóvel objeto (matrícula ${dados.imovel.matricula}) e do imóvel a ser recebido em permuta (${campos?.imovelPermutado ?? 'a ser descrito'}), eventual torna em dinheiro, declarações de quitação recíproca, e obrigações tributárias.`;

    case 'compra_venda_hipoteca':
      return `Inclua: qualificação das partes e do credor hipotecário (${campos?.credor ?? ''}), descrição do imóvel, valor de venda (${dados.valor}), valor da hipoteca (${campos?.valorHipoteca ?? ''}), prazo (${campos?.prazoMeses ?? ''} meses), grau da hipoteca, direitos e obrigações do devedor hipotecante, execução da hipoteca, e registro obrigatório no CRI conforme CC arts. 1.473 e seguintes.`;

    case 'compromisso_compra_venda':
      return `Inclua: qualificação das partes, descrição do imóvel, preço (${dados.valor}), condições de pagamento (${dados.condicoesPagamento ?? ''}), prazo para lavratura da escritura definitiva (${campos?.prazoEscritura ?? ''}), arras confirmatórias (${campos?.arrasPercentual ?? ''}% do valor), consequências do inadimplemento, irretratabilidade e irrevogabilidade, e averbação na matrícula.`;

    case 'compra_venda_financiamento':
      return `Inclua: qualificação das partes e do agente financiador (${campos?.bancoFinanciador ?? ''}), descrição do imóvel, valor total (${dados.valor}), valor financiado (${campos?.valorFinanciado ?? ''}), prazo (${campos?.prazoMeses ?? ''} meses), condições do financiamento, alienação fiduciária ou hipoteca em favor do banco, declarações do vendedor sobre inexistência de ônus, e protocolo de transferência.`;

    case 'locacao_residencial':
      return `Inclua: qualificação do locador e locatário, descrição do imóvel, finalidade exclusivamente residencial, prazo (${campos?.prazoMeses ?? '30'} meses), valor do aluguel (${dados.valor}), dia de vencimento (${campos?.diaVencimento ?? '5'}), garantia locatícia (${campos?.caucao ?? 'caução equivalente a 3 meses'}), obrigações das partes, multa rescisória, vistoria, e conformidade com Lei 8.245/91.`;

    case 'locacao_comercial':
      return `Inclua: qualificação do locador e locatário, descrição do imóvel, finalidade comercial (especificar atividade), prazo (${campos?.prazoMeses ?? '24'} meses), valor do aluguel (${dados.valor}), reajuste anual pelo IGPM, garantia locatícia (${campos?.caucao ?? 'caução'}), benfeitorias, direito de preferência na renovação, ação renovatória, e conformidade com Lei 8.245/91 arts. 51 e seguintes.`;

    case 'cessao_direitos':
      return `Inclua: qualificação do cedente e cessionário, descrição dos direitos cedidos (${campos?.descricaoDireitos ?? ''}), vinculados ao imóvel de matrícula ${dados.imovel.matricula}, valor da cessão (${dados.valor}), condições de pagamento, responsabilidade do cedente pela existência dos direitos, obrigações do cessionário, e necessidade de averbação/registro.`;

    default:
      return '';
  }
}

export function buildPromptDocumento(dados: DadosDocumento): { system: string; user: string } {
  const titulo = TITULOS[dados.tipo];
  const outorgante = formatarParte(dados.outorgantes[0], 'outorgante vendedor');
  const outorgado = formatarParte(dados.outorgados[0], 'outorgado comprador');
  const instrucoes = instrucoesPorTipo(dados.tipo, dados.camposEspecificos, dados);

  const user = `Tipo de documento: ${titulo}

PARTES:
${outorgante}

${outorgado}

IMÓVEL:
Matrícula: ${dados.imovel.matricula}
Cartório: ${dados.imovel.cartorio}
Comarca: ${dados.imovel.comarca}
Descrição: ${dados.imovel.descricao}
Área: ${dados.imovel.area}
Endereço: ${dados.imovel.endereco}

NEGÓCIO:
Valor: ${dados.valor ?? 'a combinar'}
Condições de pagamento: ${dados.condicoesPagamento ?? 'à vista'}

INSTRUÇÕES ESPECÍFICAS:
${instrucoes}

Gere a minuta completa agora.`;

  return { system: SYSTEM_PROMPT, user };
}
