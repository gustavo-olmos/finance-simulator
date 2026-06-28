// Modelos do motor de cálculo (SAC / PRICE).

export type SistemaAmortizacao = 'SAC' | 'PRICE';

/** Parâmetros de entrada da simulação. */
export interface ParametrosSimulacao {
  valorBem: number;   // Valor total do bem
  entrada: number;    // Valor da entrada
  taxaAnual: number;  // Taxa de juros nominal anual (% a.a.)
  prazoMeses: number; // Prazo em meses
}

/** Uma parcela da tabela de amortização (linha do array de saída — requisito 3.1). */
export interface Parcela {
  numero: number;        // Número da parcela
  amortizacao: number;   // Amortização do principal
  juros: number;         // Juros do período
  seguro: number;        // Seguro / taxas (0 no MVP, reservado para evolução)
  parcela: number;       // Valor total da prestação (amortizacao + juros + seguro)
  saldoDevedor: number;  // Saldo devedor após a parcela
}

/** Resultado consolidado de uma simulação. */
export interface ResultadoSimulacao {
  sistema: SistemaAmortizacao;
  parcelas: Parcela[];
  valorFinanciado: number;
  totalPago: number;
  totalJuros: number;
  primeiraParcela: number;
  ultimaParcela: number;
}
