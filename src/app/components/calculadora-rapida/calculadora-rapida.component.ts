import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FinanceCalculatorService } from '../../core/finance-calculator.service';
import { track } from '../../core/analytics';
import { brl } from '../../core/formato';
import { getTema } from '../../config/temas.config';
import { TemaId } from '../../models/tema.model';
import { CampoNumeroDirective } from '../calculadora/campo-numero.directive';

/** Campos da calculadora rápida. Como no design, prazo em meses e taxa em % ao mês. */
export interface CamposRapidos {
  valor: number;
  entrada: number;
  prazo: number;
  taxaMes: number;
}

export const VALORES_INICIAIS: Record<TemaId, CamposRapidos> = {
  imovel: { valor: 400000, entrada: 80000, prazo: 360, taxaMes: 0.95 },
  veiculo: { valor: 80000, entrada: 20000, prazo: 48, taxaMes: 1.79 },
};

/**
 * Calculadora do topo da página inicial: só Tabela Price, com abas Imóvel/Veículo (cada
 * aba guarda os próprios valores). "Ver simulação completa" abre o simulador do tema com
 * os mesmos números, com a taxa convertida para anual (a unidade do simulador).
 */
@Component({
  selector: 'app-calculadora-rapida',
  standalone: true,
  imports: [RouterLink, CampoNumeroDirective],
  templateUrl: './calculadora-rapida.component.html',
  styleUrl: './calculadora-rapida.component.scss',
})
export class CalculadoraRapidaComponent {
  private readonly calc = inject(FinanceCalculatorService);

  protected readonly fmt = { brl };

  readonly aba = signal<TemaId>('imovel');
  private readonly campos = signal<Record<TemaId, CamposRapidos>>(VALORES_INICIAIS);
  readonly atual = computed(() => this.campos()[this.aba()]);

  /** Prazo usado no cálculo, limitado ao máximo do tema (evita laços enormes durante a digitação). */
  readonly prazoMeses = computed(() =>
    Math.min(Math.max(0, Math.round(this.atual().prazo)), getTema(this.aba()).faixas.prazoMax),
  );

  private readonly taxaAnual = computed(() => this.calc.taxaAnualPercentual(this.atual().taxaMes));

  readonly resultado = computed(() => {
    const c = this.atual();
    return this.calc.calcularPRICE({
      valorBem: c.valor,
      entrada: c.entrada,
      prazoMeses: this.prazoMeses(),
      taxaAnual: this.taxaAnual(),
      seguroMensal: 0,
    });
  });

  readonly ok = computed(() => this.resultado().parcelas.length > 0);

  /** Fração do total pago que é juros (barra de composição). */
  readonly jurosFracao = computed(() => {
    const r = this.resultado();
    return r.totalPago > 0 ? r.totalJuros / r.totalPago : 0;
  });
  readonly jurosPct = computed(() => Math.round(this.jurosFracao() * 100));

  readonly entradaTexto = computed(() => {
    const c = this.atual();
    return c.valor > 0 ? `${Math.round((c.entrada / c.valor) * 100)}% do valor` : '';
  });

  readonly prazoTexto = computed(() => {
    const n = Math.round(this.atual().prazo);
    if (n < 12) return '';
    const anos = Math.floor(n / 12);
    const meses = n % 12;
    const a = `${anos} ${anos === 1 ? 'ano' : 'anos'}`;
    return meses ? `${a} e ${meses} ${meses === 1 ? 'mês' : 'meses'}` : a;
  });

  readonly linkSimulacao = computed(() => {
    const c = this.atual();
    return {
      rota: this.aba() === 'veiculo' ? '/financiamento-veiculo' : '/financiamento-imovel',
      queryParams: {
        valor: Math.round(c.valor),
        entrada: Math.round(Math.min(c.entrada, c.valor)),
        prazo: this.prazoMeses(),
        // 6 casas: com menos, a parcela do simulador pode diferir em 1 centavo.
        taxa: Number(this.taxaAnual().toFixed(6)),
        seguro: 0,
      },
    };
  });

  set(campo: keyof CamposRapidos, v: number): void {
    const aba = this.aba();
    this.campos.update((c) => ({ ...c, [aba]: { ...c[aba], [campo]: v } }));
  }

  /** Entrada nunca maior que o valor do bem. */
  confirmarValor(): void {
    const c = this.atual();
    if (c.entrada > c.valor) this.set('entrada', c.valor);
  }

  confirmarPrazo(): void {
    const max = getTema(this.aba()).faixas.prazoMax;
    this.set('prazo', Math.min(max, Math.max(1, Math.round(this.atual().prazo))));
  }

  registrarSimular(): void {
    track('inicio_simular', { tema: this.aba() });
  }
}
