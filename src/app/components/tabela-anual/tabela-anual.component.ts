import { Component, computed, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { SimulacaoStore } from '../../core/simulacao.store';
import { brl, brl0 } from '../../core/formato';

const ANOS_INICIAIS = 5;

/**
 * "Parcelas ano a ano": mostra os 5 primeiros anos, com botão para ver todos, e um
 * link para baixar o CSV mês a mês (substitui a tabela aberta de 360 linhas).
 * No celular a tabela começa recolhida atrás do botão "Ver parcelas ano a ano".
 */
@Component({
  selector: 'app-tabela-anual',
  standalone: true,
  templateUrl: './tabela-anual.component.html',
  styleUrl: './tabela-anual.component.scss',
})
export class TabelaAnualComponent {
  private readonly store = inject(SimulacaoStore);
  private readonly doc = inject(DOCUMENT);

  protected readonly fmt = { brl, brl0 };

  readonly mostrarTodos = signal(false);
  /** Só tem efeito no celular (no desktop a tabela fica sempre visível). */
  readonly abertaNoCelular = signal(false);

  readonly total = computed(() => this.store.anos().length);
  readonly linhas = computed(() =>
    this.mostrarTodos() ? this.store.anos() : this.store.anos().slice(0, ANOS_INICIAIS),
  );

  baixarCsv(): void {
    const { sac, price } = this.store.resultado();
    const num = (v: number) => v.toFixed(2).replace('.', ',');
    // Separador ";" e vírgula decimal: abre direto no Excel em pt-BR.
    const linhas = [
      ['Mês', 'Parcela SAC', 'Amortização SAC', 'Juros SAC', 'Seguro SAC', 'Saldo SAC',
        'Parcela PRICE', 'Amortização PRICE', 'Juros PRICE', 'Seguro PRICE', 'Saldo PRICE'].join(';'),
      ...sac.parcelas.map((s, k) => {
        const p = price.parcelas[k];
        return [s.numero, num(s.parcela), num(s.amortizacao), num(s.juros), num(s.seguro), num(s.saldoDevedor),
          num(p.parcela), num(p.amortizacao), num(p.juros), num(p.seguro), num(p.saldoDevedor)].join(';');
      }),
    ];
    // BOM para o Excel reconhecer UTF-8 (acentos).
    const blob = new Blob(['﻿' + linhas.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = this.doc.createElement('a');
    a.href = url;
    a.download = `simulacao-rotafin-${this.store.tema().id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
