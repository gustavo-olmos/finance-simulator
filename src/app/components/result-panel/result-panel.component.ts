import { Component, computed, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ResultadoSimulacao, SistemaAmortizacao } from '../../models/simulacao.model';

/** Painel de resultado em destaque: parcela inicial + chips de resumo. */
@Component({
  selector: 'app-result-panel',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './result-panel.component.html',
  styleUrl: './result-panel.component.scss',
})
export class ResultPanelComponent {
  readonly resultado = input.required<ResultadoSimulacao>();
  readonly prazo = input.required<number>();
  readonly sistema = input.required<SistemaAmortizacao>();

  readonly resumo = computed(() => {
    const r = this.resultado();
    const n = this.prazo();
    if (this.sistema() === 'SAC') {
      const ultima = r.ultimaParcela.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });
      return `1ª de ${n} parcelas (SAC) · cai para ${ultima}`;
    }
    return `parcela fixa · ${n} meses (PRICE)`;
  });
}
