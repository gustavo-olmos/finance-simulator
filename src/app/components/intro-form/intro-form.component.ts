import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FinanceCalculatorService } from '../../core/finance-calculator.service';
import { ThemeService } from '../../core/theme.service';
import { ParametrosSimulacao, SistemaAmortizacao } from '../../models/simulacao.model';

type Modo = 'parcela' | 'inverso';

/**
 * Formulário de entrada leigo-friendly, exibido acima da calculadora (com sliders).
 * Dois modos: "quanto ficaria a parcela" (fluxo normal) ou "quanto posso financiar"
 * (inverso — parte da parcela que a pessoa pode pagar e descobre o valor do imóvel).
 * Emite os parâmetros já resolvidos, prontos para pré-preencher a calculadora abaixo.
 */
@Component({
  selector: 'app-intro-form',
  standalone: true,
  templateUrl: './intro-form.component.html',
  styleUrl: './intro-form.component.scss',
})
export class IntroFormComponent {
  private readonly calc = inject(FinanceCalculatorService);
  readonly theme = inject(ThemeService);

  readonly labelValor = input.required<string>();
  readonly defaults = input.required<ParametrosSimulacao>();

  readonly calcular = output<ParametrosSimulacao>();

  readonly modo = signal<Modo>('inverso');

  readonly campo1 = signal<number | null>(null);
  readonly entrada = signal<number | null>(null);
  readonly prazoAnos = signal<number | null>(null);
  readonly taxa = signal<number | null>(null);

  /** Exemplo de valor do imóvel, usado como placeholder no modo "parcela". */
  readonly placeholderValor = computed(() => Math.round(this.defaults().valorBem));
  readonly placeholderEntrada = computed(() => Math.round(this.defaults().entrada));
  readonly placeholderAnos = computed(() => Math.round(this.defaults().prazoMeses / 12));
  readonly placeholderTaxa = computed(() => this.defaults().taxaAnual);

  /** Exemplo de parcela (primeira parcela do cenário padrão), usado como placeholder no modo "inverso". */
  readonly placeholderParcela = computed(() => {
    const r = this.calc.calcular(this.defaults(), this.theme.sistema());
    return Math.round(r.primeiraParcela);
  });

  readonly valido = computed(() => {
    const c1 = this.campo1();
    const ent = this.entrada();
    const anos = this.prazoAnos();
    const tx = this.taxa();
    return c1 !== null && c1 > 0 && ent !== null && ent >= 0 && anos !== null && anos > 0 && tx !== null && tx >= 0;
  });

  setSistema(sistema: SistemaAmortizacao): void {
    this.theme.setSistema(sistema);
  }

  parseNum(valor: string): number | null {
    if (valor.trim() === '') return null;
    const n = Number(valor);
    return Number.isFinite(n) ? n : null;
  }

  enviar(): void {
    if (!this.valido()) return;

    const prazoMeses = Math.round((this.prazoAnos() ?? 0) * 12);
    const taxaAnual = this.taxa() ?? 0;
    let entrada = this.entrada() ?? 0;
    let valorBem: number;

    if (this.modo() === 'parcela') {
      valorBem = this.campo1() ?? 0;
      entrada = Math.min(entrada, valorBem);
    } else {
      const principal = this.calc.calcularPrincipalMaximo(
        this.campo1() ?? 0,
        prazoMeses,
        taxaAnual,
        this.theme.sistema(),
      );
      valorBem = principal + entrada;
    }

    this.calcular.emit({ valorBem, entrada, taxaAnual, prazoMeses, seguroMensal: 0 });
  }
}
