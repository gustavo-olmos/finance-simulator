import { Component, computed, input, output } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { FaixasSimulacao } from '../../models/tema.model';

/**
 * Formulário de simulação (sliders). Componente "burro": recebe os valores
 * atuais como inputs e emite mudanças via outputs — o estado vive no SimuladorComponent.
 */
@Component({
  selector: 'app-finance-form',
  standalone: true,
  imports: [CurrencyPipe, DecimalPipe],
  templateUrl: './finance-form.component.html',
  styleUrl: './finance-form.component.scss',
})
export class FinanceFormComponent {
  readonly labelValor = input.required<string>();
  readonly faixas = input.required<FaixasSimulacao>();

  readonly valorBem = input.required<number>();
  readonly entrada = input.required<number>();
  readonly prazo = input.required<number>();
  readonly taxa = input.required<number>();

  readonly valorBemChange = output<number>();
  readonly entradaChange = output<number>();
  readonly prazoChange = output<number>();
  readonly taxaChange = output<number>();

  readonly entradaPct = computed(() =>
    this.valorBem() > 0 ? Math.round((this.entrada() / this.valorBem()) * 100) : 0,
  );
  readonly anos = computed(() => Math.round(this.prazo() / 12));
  readonly taxaMes = computed(() => (Math.pow(1 + this.taxa() / 100, 1 / 12) - 1) * 100);

  emitir(saida: 'valor' | 'entrada' | 'prazo' | 'taxa', valor: string): void {
    const n = Number(valor);
    switch (saida) {
      case 'valor':
        this.valorBemChange.emit(n);
        break;
      case 'entrada':
        this.entradaChange.emit(n);
        break;
      case 'prazo':
        this.prazoChange.emit(n);
        break;
      case 'taxa':
        this.taxaChange.emit(n);
        break;
    }
  }
}
