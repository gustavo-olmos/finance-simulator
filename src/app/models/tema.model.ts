import { ParametrosSimulacao } from './simulacao.model';

export type TemaId = 'imovel' | 'veiculo';

/** Faixas (min/max/step) dos sliders por tema. */
export interface FaixasSimulacao {
  bemMin: number;
  bemMax: number;
  bemStep: number;
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
  defaults: ParametrosSimulacao;
  faixas: FaixasSimulacao;
  seo: {
    titulo: string;
    descricao: string;
    /** H1 único da página — o texto principal exibido acima do simulador. */
    h1: string;
    /** H2 de apoio, logo abaixo do H1. */
    subtitulo: string;
    /** Nome do produto financeiro para o JSON-LD (distinto do <title>, sem repetir a marca). */
    produtoNome: string;
    h2: string;
    intro: string;
  };
}
