import { Injectable } from '@angular/core';
import {
  ParametrosSimulacao,
  Parcela,
  ResultadoSimulacao,
  SistemaAmortizacao,
} from '../models/simulacao.model';

/**
 * Motor de cálculo de financiamento (requisito 3.1).
 * Funções PURAS, determinísticas e testáveis — sem estado e sem dependências.
 * Inclui validações para evitar divisão por zero e prazos/valores inválidos.
 */
@Injectable({ providedIn: 'root' })
export class FinanceCalculatorService {
  /** Converte taxa nominal anual (%) em taxa efetiva mensal (decimal). */
  private taxaMensal(taxaAnual: number): number {
    if (taxaAnual <= 0) return 0;
    return Math.pow(1 + taxaAnual / 100, 1 / 12) - 1;
  }

  /** Normaliza e valida os parâmetros de entrada. */
  private sanitizar(p: ParametrosSimulacao): { principal: number; n: number; i: number } {
    const valorBem = Math.max(0, p.valorBem || 0);
    const entrada = Math.min(Math.max(0, p.entrada || 0), valorBem);
    const principal = Math.max(0, valorBem - entrada);
    const n = Math.max(0, Math.floor(p.prazoMeses || 0));
    const i = this.taxaMensal(p.taxaAnual || 0);
    return { principal, n, i };
  }

  /** Ponto de entrada: calcula pelo sistema escolhido. */
  calcular(p: ParametrosSimulacao, sistema: SistemaAmortizacao): ResultadoSimulacao {
    return sistema === 'SAC' ? this.calcularSAC(p) : this.calcularPRICE(p);
  }

  /**
   * Sistema SAC: amortização constante.
   * Juros recalculados sobre o saldo devedor → parcelas decrescentes.
   */
  calcularSAC(p: ParametrosSimulacao): ResultadoSimulacao {
    const { principal, n, i } = this.sanitizar(p);
    if (n === 0 || principal === 0) return this.resultadoVazio('SAC', principal);

    const amortizacao = principal / n;
    const parcelas: Parcela[] = [];
    let saldo = principal;

    for (let k = 1; k <= n; k++) {
      const juros = saldo * i;
      const seguro = 0; // Reservado para evolução (MIP/DFI). MVP = 0.
      const parcela = amortizacao + juros + seguro;
      saldo = Math.max(0, saldo - amortizacao);
      parcelas.push({ numero: k, amortizacao, juros, seguro, parcela, saldoDevedor: saldo });
    }

    return this.consolidar('SAC', parcelas, principal);
  }

  /**
   * Sistema PRICE: prestações iguais e constantes.
   * Amortização crescente e juros decrescentes ao longo do tempo.
   */
  calcularPRICE(p: ParametrosSimulacao): ResultadoSimulacao {
    const { principal, n, i } = this.sanitizar(p);
    if (n === 0 || principal === 0) return this.resultadoVazio('PRICE', principal);

    // Fórmula PRICE; quando i = 0, cai para amortização linear (evita divisão por zero).
    const parcelaFixa =
      i > 0 ? (principal * i) / (1 - Math.pow(1 + i, -n)) : principal / n;

    const parcelas: Parcela[] = [];
    let saldo = principal;

    for (let k = 1; k <= n; k++) {
      const juros = saldo * i;
      const seguro = 0;
      const amortizacao = parcelaFixa - juros;
      saldo = Math.max(0, saldo - amortizacao);
      parcelas.push({
        numero: k,
        amortizacao,
        juros,
        seguro,
        parcela: parcelaFixa,
        saldoDevedor: saldo,
      });
    }

    return this.consolidar('PRICE', parcelas, principal);
  }

  private consolidar(
    sistema: SistemaAmortizacao,
    parcelas: Parcela[],
    valorFinanciado: number,
  ): ResultadoSimulacao {
    let totalPago = 0;
    let totalJuros = 0;
    for (const p of parcelas) {
      totalPago += p.parcela;
      totalJuros += p.juros;
    }
    return {
      sistema,
      parcelas,
      valorFinanciado,
      totalPago,
      totalJuros,
      primeiraParcela: parcelas[0]?.parcela ?? 0,
      ultimaParcela: parcelas[parcelas.length - 1]?.parcela ?? 0,
    };
  }

  private resultadoVazio(sistema: SistemaAmortizacao, valorFinanciado: number): ResultadoSimulacao {
    return {
      sistema,
      parcelas: [],
      valorFinanciado,
      totalPago: 0,
      totalJuros: 0,
      primeiraParcela: 0,
      ultimaParcela: 0,
    };
  }
}
