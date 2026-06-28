import { Component, computed, effect, ElementRef, inject, input, output, signal } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { FaixasSimulacao } from '../../models/tema.model';

type Campo = 'valor' | 'entrada' | 'prazo' | 'taxa';

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

  readonly editandoCampo = signal<Campo | null>(null);

  private el = inject(ElementRef<HTMLElement>);

  constructor() {
    effect(() => {
      const campo = this.editandoCampo();
      if (campo) {
        setTimeout(() => {
          const input = this.el.nativeElement.querySelector(
            `input[data-edit="${campo}"]`,
          ) as HTMLInputElement | null;
          input?.select();
        });
      }
    });
  }

  iniciarEdicao(campo: Campo): void {
    this.editandoCampo.set(campo);
  }

  confirmarEdicao(campo: Campo, valor: string): void {
    const n = Number(valor);
    if (!isNaN(n) && valor.trim() !== '') {
      this.emitir(campo, String(this.clamp(campo, n)));
    }
    this.editandoCampo.set(null);
  }

  onKeyDown(event: KeyboardEvent, campo: Campo): void {
    if (event.key === 'Enter') {
      this.confirmarEdicao(campo, (event.target as HTMLInputElement).value);
    } else if (event.key === 'Escape') {
      this.editandoCampo.set(null);
    }
  }

  private clamp(campo: Campo, n: number): number {
    const f = this.faixas();
    switch (campo) {
      case 'valor':   return Math.min(f.bemMax, Math.max(f.bemMin, n));
      case 'entrada': return Math.min(this.valorBem(), Math.max(0, n));
      case 'prazo':   return Math.min(f.prazoMax, Math.max(f.prazoMin, n));
      case 'taxa':    return Math.min(f.taxaMax, Math.max(f.taxaMin, n));
    }
  }

  emitir(saida: Campo, valor: string): void {
    const n = Number(valor);
    switch (saida) {
      case 'valor':   this.valorBemChange.emit(n); break;
      case 'entrada': this.entradaChange.emit(n);  break;
      case 'prazo':   this.prazoChange.emit(n);    break;
      case 'taxa':    this.taxaChange.emit(n);     break;
    }
  }
}
