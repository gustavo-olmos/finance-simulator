import { Component, computed, input } from '@angular/core';
import { Parcela } from '../../models/simulacao.model';

interface Barra {
  amortPx: number;
  jurosPx: number;
}

const ALTURA_MAX = 120;
const MAX_BARRAS = 40;

/** Gráfico de composição das parcelas (amortização x juros) ao longo do tempo. */
@Component({
  selector: 'app-amortization-chart',
  standalone: true,
  templateUrl: './amortization-chart.component.html',
  styleUrl: './amortization-chart.component.scss',
})
export class AmortizationChartComponent {
  readonly parcelas = input.required<Parcela[]>();
  readonly prazo = input.required<number>();

  /** Amostra as parcelas e converte em alturas (px) proporcionais à maior parcela. */
  readonly barras = computed<Barra[]>(() => {
    const p = this.parcelas();
    if (!p.length) return [];

    const total = p.length;
    const num = Math.min(total, MAX_BARRAS);
    const passo = total / num;
    const maxParcela = Math.max(...p.map((x) => x.parcela)) || 1;

    const barras: Barra[] = [];
    for (let b = 0; b < num; b++) {
      const item = p[Math.min(total - 1, Math.floor(b * passo))];
      barras.push({
        amortPx: (item.amortizacao / maxParcela) * ALTURA_MAX,
        jurosPx: (item.juros / maxParcela) * ALTURA_MAX,
      });
    }
    return barras;
  });
}
