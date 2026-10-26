import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ModoCalculadora, SimulacaoStore } from '../../core/simulacao.store';
import { decimal } from '../../core/formato';
import { CampoNumeroDirective } from './campo-numero.directive';

/**
 * Calculadora única do hero (substitui o intro-form + o bloco de sliders antigo).
 * Dois modos: "Sei o valor do imóvel" e "Sei quanto posso pagar". Lê e escreve no
 * SimulacaoStore da página; o resultado é exibido pelo ResultadoCardComponent.
 */
@Component({
  selector: 'app-calculadora',
  standalone: true,
  imports: [RouterLink, CampoNumeroDirective],
  templateUrl: './calculadora.component.html',
  styleUrl: './calculadora.component.scss',
})
export class CalculadoraComponent {
  readonly store = inject(SimulacaoStore);

  readonly tema = this.store.tema;
  readonly faixas = computed(() => this.tema().faixas);

  readonly entradaPct = computed(() => {
    const v = this.store.valor();
    return this.store.modo() === 'valor' && v > 0 ? Math.round((this.store.entrada() / v) * 100) : null;
  });

  readonly entradaMax = computed(() =>
    this.store.modo() === 'valor' ? Math.max(this.store.valor(), 0) : this.faixas().bemMax,
  );

  readonly taxaMes = computed(() => decimal(this.store.taxaMensal()) + '%');

  slider(e: Event): number {
    return Number((e.target as HTMLInputElement).value);
  }

  setModo(modo: ModoCalculadora): void {
    if (this.store.modo() === modo) return;
    this.store.registrarInteracao();
    this.store.modo.set(modo);
  }

  setValor(v: number): void {
    this.store.registrarInteracao();
    this.store.valor.set(v);
  }

  setParcela(v: number): void {
    this.store.registrarInteracao();
    this.store.parcelaMax.set(v);
  }

  setEntrada(v: number): void {
    this.store.registrarInteracao();
    this.store.entrada.set(v);
  }

  setPrazo(v: number): void {
    this.store.registrarInteracao();
    this.store.prazoAnos.set(v);
  }

  setTaxa(v: number): void {
    this.store.registrarInteracao();
    this.store.taxa.set(v);
  }

  setSeguro(v: number): void {
    this.store.registrarInteracao();
    this.store.seguro.set(v);
  }

  passoPrazo(delta: number): void {
    this.store.registrarInteracao();
    this.store.passoPrazo(delta);
  }

  passoTaxa(delta: number): void {
    this.store.registrarInteracao();
    this.store.passoTaxa(delta);
  }

  /** Entrada nunca maior que o valor do bem (só no modo "Sei o valor"). */
  confirmarValor(): void {
    if (this.store.modo() === 'valor' && this.store.entrada() > this.store.valor()) {
      this.store.entrada.set(this.store.valor());
    }
  }

  confirmarPrazo(): void {
    this.store.prazoAnos.set(this.store.limitar(Math.round(this.store.prazoAnos()), 1, this.store.prazoMaxAnos()));
  }

  confirmarTaxa(): void {
    const f = this.faixas();
    this.store.taxa.set(this.store.limitar(this.store.taxa(), f.taxaMin, f.taxaMax));
  }
}
