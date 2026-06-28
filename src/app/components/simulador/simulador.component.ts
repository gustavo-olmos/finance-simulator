import {
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { FinanceCalculatorService } from '../../core/finance-calculator.service';
import { ThemeService } from '../../core/theme.service';
import { TemaConfig } from '../../models/tema.model';
import { SystemToggleComponent } from '../system-toggle/system-toggle.component';
import { ResultPanelComponent } from '../result-panel/result-panel.component';
import { FinanceFormComponent } from '../finance-form/finance-form.component';
import { AmortizationChartComponent } from '../amortization-chart/amortization-chart.component';

/**
 * Widget de simulação reaproveitável (card verde/âmbar).
 * Estado em Signals; o resultado é um `computed` que recalcula sincronicamente
 * sempre que qualquer input ou o sistema (ThemeService) muda — requisito 3.2.
 */
@Component({
  selector: 'app-simulador',
  standalone: true,
  imports: [
    SystemToggleComponent,
    ResultPanelComponent,
    FinanceFormComponent,
    AmortizationChartComponent,
  ],
  templateUrl: './simulador.component.html',
  styleUrl: './simulador.component.scss',
})
export class SimuladorComponent implements OnInit {
  private readonly calc = inject(FinanceCalculatorService);
  readonly theme = inject(ThemeService);

  /** Configuração do tema (faixas, defaults, rótulos). */
  readonly config = input.required<TemaConfig>();
  /** Valor inicial do bem (ex.: preço de um anúncio). Sobrepõe o default do tema. */
  readonly valorInicial = input<number | null>(null);

  // Estado do formulário (Signals).
  readonly valorBem = signal(0);
  readonly entrada = signal(0);
  readonly prazo = signal(0);
  readonly taxa = signal(0);

  // Resultado derivado — recalcula sozinho quando qualquer signal acima muda.
  readonly resultado = computed(() =>
    this.calc.calcular(
      {
        valorBem: this.valorBem(),
        entrada: this.entrada(),
        taxaAnual: this.taxa(),
        prazoMeses: this.prazo(),
      },
      this.theme.sistema(),
    ),
  );

  ngOnInit(): void {
    const d = this.config().defaults;
    const base = this.valorInicial() ?? d.valorBem;
    this.valorBem.set(base);
    this.entrada.set(Math.round(base * (d.entrada / d.valorBem)));
    this.prazo.set(d.prazoMeses);
    this.taxa.set(d.taxaAnual);
  }

  onValorBem(v: number): void {
    this.valorBem.set(v);
    // Mantém a entrada nunca maior que o valor do bem.
    if (this.entrada() > v) this.entrada.set(v);
  }
}
