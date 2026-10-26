import { ParametrosSimulacao } from './simulacao.model';

export type TemaId = 'imovel' | 'veiculo';

/** Faixas (min/max/step) dos sliders e botões −/+ por tema. */
export interface FaixasSimulacao {
  bemMin: number;
  bemMax: number;
  bemStep: number;
  entradaStep: number;
  /** Slider do modo "Sei quanto posso pagar". */
  parcelaMin: number;
  parcelaMax: number;
  parcelaStep: number;
  prazoMin: number;
  prazoMax: number;
  prazoStep: number;
  taxaMin: number;
  taxaMax: number;
  taxaStep: number;
}

/** Configuração de uma landing page temática (imóvel / veículo). */
export interface TemaConfig {
  id: TemaId;
  labelValor: string;       // Rótulo do slider principal ("Valor do imóvel" etc.)
  bemNome: string;          // "imóvel" / "veículo" — usado nos textos da calculadora
  bemPlural: string;        // "imóveis" / "veículos" — CTA "Ver imóveis de até…"
  defaults: ParametrosSimulacao;
  /** Parcela inicial do modo "Sei quanto posso pagar". */
  parcelaPadrao: number;
  faixas: FaixasSimulacao;
  seo: {
    titulo: string;
    descricao: string;
    /** H1 único da página — título do hero. */
    h1: string;
    /** Subtítulo do hero (desktop). */
    subtitulo: string;
    /** Subtítulo curto do hero no celular (primeira dobra mais enxuta). */
    subtituloCurto: string;
    /** Nome do produto financeiro para o JSON-LD (distinto do <title>, sem repetir a marca). */
    produtoNome: string;
    h2: string;
    intro: string;
  };
}
