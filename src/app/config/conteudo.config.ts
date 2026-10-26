import { TemaId } from '../models/tema.model';

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
