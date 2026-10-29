import { TemaId } from '../models/tema.model';
import { GUIAS_GERADOS } from './guias.generated';

export interface ItemFaq {
  pergunta: string;
  resposta: string;
  /** Temas em que a pergunta aparece (omitido = todos). */
  temas?: TemaId[];
}

/**
 * Perguntas frequentes. A mesma lista alimenta a seção visível e o JSON-LD FAQPage,
 * para os dois nunca divergirem.
 */
export const FAQ: ItemFaq[] = [
  {
    pergunta: 'Quanto de renda preciso para financiar?',
    resposta: 'Os bancos costumam aceitar parcela de até 30% da renda bruta familiar. O simulador já mostra essa renda mínima estimada.',
  },
  {
    pergunta: 'Posso usar o FGTS na entrada?',
    resposta: 'Em muitos casos, sim, se você e o imóvel cumprirem as regras do FGTS. Some o saldo à entrada.',
    temas: ['imovel'],
  },
  {
    pergunta: 'Os valores são exatos?',
    resposta: 'São estimativas para comparar cenários. A proposta do banco inclui correção (como a TR), tarifas e depende do seu perfil.',
  },
  {
    pergunta: 'Os anúncios são da RotaFin?',
    resposta: 'Não. São publicados por imobiliárias e concessionárias parceiras. A negociação é feita direto com o anunciante.',
  },
  {
    pergunta: 'A taxa de juros é mensal ou anual?',
    resposta: 'Você informa a taxa anual e o simulador converte para a taxa mensal equivalente automaticamente.',
  },
  {
    pergunta: 'Preciso me cadastrar?',
    resposta: 'Não. O cálculo é gratuito, instantâneo e não exige nenhum dado pessoal.',
  },
];

export function faqDoTema(tema: TemaId): ItemFaq[] {
  return FAQ.filter((f) => !f.temas || f.temas.includes(tema));
}

/** Perguntas da página inicial (/). Também geram o JSON-LD FAQPage dela. */
export const FAQ_INICIO: ItemFaq[] = [
  {
    pergunta: 'O RotaFin é gratuito?',
    resposta: 'Sim. Você pode simular quantas vezes quiser, sem criar conta.',
  },
  {
    pergunta: 'O valor da parcela é exato?',
    resposta: 'É uma estimativa. A parcela final depende da análise de crédito e inclui seguros, tarifas e IOF, que entram no Custo Efetivo Total (CET).',
  },
  {
    pergunta: 'Qual a diferença entre SAC e Price?',
    resposta: 'Na Price as parcelas são iguais do início ao fim. Na SAC elas começam mais altas e diminuem com o tempo, e o total de juros costuma ser menor.',
  },
  {
    pergunta: 'O RotaFin oferece financiamento?',
    resposta: 'Não. O RotaFin é uma ferramenta de simulação e não concede crédito. Use os números para negociar com o banco ou a financeira.',
  },
];

export interface Guia {
  /** Etiqueta do card (ex.: 'SAC × Price'). */
  tag: string;
  /** Cor da etiqueta. */
  tom: 'ambar' | 'verde';
  titulo: string;
  resumo: string;
  /** Caminho do post. Vazio = card não aparece. */
  url: string;
}

/**
 * Seção "Antes de assinar, vale ler" da página inicial: os guias publicados, gerados
 * no build a partir de src/content/blog/*.md (scripts/build-blog.mjs). Rascunhos não
 * entram. Sem nenhum publicado, a seção e os links "Guias" do cabeçalho e do rodapé da
 * página inicial não aparecem.
 *
 * Pauta (cards do design da página inicial, ainda sem post):
 * - SAC × Price (âmbar): "SAC ou Price: qual tabela pesa menos no bolso?" —
 *   Parcela fixa ou decrescente? Entenda o que muda no total de juros.
 * - Veículo (verde): "Quanto dar de entrada no financiamento do carro" —
 *   Como a entrada afeta parcela, juros e a aprovação do crédito.
 * - Básico (verde): "CET: o número que o banco precisa te mostrar" —
 *   Por que a taxa de juros sozinha não conta a história inteira.
 */
export const GUIAS: Guia[] = GUIAS_GERADOS;

export function guiasPublicados(): Guia[] {
  return GUIAS.filter((g) => g.url);
}

export interface Parceiro {
  tipo: 'Imobiliária' | 'Concessionária';
  nome: string;
  /** Chamada da oferta. */
  chamada: string;
  logoUrl?: string;
  /** Destino do botão "Ver ofertas" (site ou página do parceiro). */
  url: string;
}

/**
 * Seção "Ofertas de parceiros" (patrocinada) da página inicial.
 * TODO: preencher com os parceiros contratados. Lista vazia = seção não aparece.
 */
export const PARCEIROS: Parceiro[] = [];

export interface TaxaReferencia {
  rotulo: string;
  /** Faixa exibida, ex.: '10 a 12'. Vazio = card não aparece. */
  faixa: string;
  fonte: string;
}

/**
 * Taxas de referência da seção "Qual taxa de juros colocar?".
 * TODO: preencher faixas, fontes e data. Enquanto nenhuma faixa estiver preenchida,
 * a seção e o link "Qual taxa usar?" da calculadora não aparecem.
 */
export const TAXAS_REFERENCIA: Record<TemaId, { atualizadoEm: string; itens: TaxaReferencia[] }> = {
  imovel: {
    atualizadoEm: '',
    itens: [
      { rotulo: 'Bancos públicos', faixa: '', fonte: '' },
      { rotulo: 'Bancos privados', faixa: '', fonte: '' },
      { rotulo: 'Minha Casa, Minha Vida', faixa: '', fonte: '' },
    ],
  },
  veiculo: {
    atualizadoEm: '',
    itens: [
      { rotulo: 'Carros novos', faixa: '', fonte: '' },
      { rotulo: 'Carros usados', faixa: '', fonte: '' },
      { rotulo: 'Motos', faixa: '', fonte: '' },
    ],
  },
};

export function taxasDoTema(tema: TemaId): TaxaReferencia[] {
  return TAXAS_REFERENCIA[tema].itens.filter((t) => t.faixa);
}
