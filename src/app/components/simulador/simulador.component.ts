import {
  Component,
  computed,
  effect,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { FinanceCalculatorService } from '../../core/finance-calculator.service';
import { ParametrosSimulacao, ResultadoSimulacao } from '../../models/simulacao.model';
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

  readonly resultadoChange = output<ResultadoSimulacao>();
  readonly parametrosChange = output<ParametrosSimulacao>();

  /** Configuração do tema (faixas, defaults, rótulos). */
  readonly config = input.required<TemaConfig>();
  /** Valor inicial do bem (ex.: preço de um anúncio). Sobrepõe o default do tema. */
  readonly valorInicial = input<number | null>(null);
  /** Parâmetros iniciais vindos da URL (query params). Sobrepõem defaults e valorInicial. */
  readonly entradaInicial = input<number | null>(null);
  readonly prazoInicial = input<number | null>(null);
  readonly taxaInicial = input<number | null>(null);

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

  constructor() {
    effect(() => this.resultadoChange.emit(this.resultado()));
    effect(() => this.parametrosChange.emit({
      valorBem: this.valorBem(),
      entrada: this.entrada(),
      taxaAnual: this.taxa(),
      prazoMeses: this.prazo(),
    }));
  }

  ngOnInit(): void {
    const d = this.config().defaults;
    const base = this.valorInicial() ?? d.valorBem;
    this.valorBem.set(base);
    this.entrada.set(this.entradaInicial() ?? Math.round(base * (d.entrada / d.valorBem)));
    this.prazo.set(this.prazoInicial() ?? d.prazoMeses);
    this.taxa.set(this.taxaInicial() ?? d.taxaAnual);
  }

  onValorBem(v: number): void {
    this.valorBem.set(v);
    // Mantém a entrada nunca maior que o valor do bem.
    if (this.entrada() > v) this.entrada.set(v);
  }
}
