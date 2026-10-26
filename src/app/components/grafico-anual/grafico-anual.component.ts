import { Component, computed, input } from '@angular/core';
import { brl } from '../../core/formato';

export interface LinhaAnual {
  ano: number;
  sac: number;
  price: number;
  saldo: number;
}

/**
 * Gráfico de barras "Parcela mensal por ano de contrato" (SAC verde, PRICE âmbar).
 * Desktop: uma dupla de barras por ano. Celular: até 10 amostras, como no design mobile.
 */
@Component({
  selector: 'app-grafico-anual',
  standalone: true,
  templateUrl: './grafico-anual.component.html',
  styleUrl: './grafico-anual.component.scss',
})
export class GraficoAnualComponent {
  readonly anos = input.required<LinhaAnual[]>();

  private readonly maximo = computed(() =>
    Math.max(1, ...this.anos().map((a) => Math.max(a.sac, a.price))),
  );

  private barra(a: LinhaAnual) {
    const max = this.maximo();
    return {
      ano: a.ano,
      sacH: Math.round((a.sac / max) * 1000) / 10,
      priceH: Math.round((a.price / max) * 1000) / 10,
      titulo: `Ano ${a.ano}: SAC ${brl(a.sac)} · PRICE ${brl(a.price)}`,
    };
  }

  readonly barrasDesk = computed(() =>
    this.anos().map((a) => ({ ...this.barra(a), rotulo: a.ano === 1 || a.ano % 5 === 0 ? String(a.ano) : '' })),
  );

  readonly barrasMob = computed(() => {
    const anos = this.anos();
    const passo = Math.max(1, Math.ceil(anos.length / 10));
    return anos.filter((_, i) => i % passo === 0).map((a) => this.barra(a));
  });

  /** Rótulos do eixo no celular: primeiro, meio e último ano do contrato. */
  readonly eixoMob = computed(() => {
    const n = this.anos().length;
    if (n === 0) return [];
    return [...new Set([1, Math.round(n / 2), n])];
  });

  readonly descricao = computed(() => {
    const anos = this.anos();
    if (!anos.length) return 'Sem dados para o gráfico.';
    const ult = anos[anos.length - 1];
    return `Parcela SAC começa em ${brl(anos[0].sac)} e cai até ${brl(ult.sac)}; parcela PRICE começa em ${brl(anos[0].price)} e fica em ${brl(ult.price)} no último ano.`;
  });
}
