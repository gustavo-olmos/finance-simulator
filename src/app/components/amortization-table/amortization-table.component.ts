import { Component, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ResultadoSimulacao } from '../../models/simulacao.model';

@Component({
  selector: 'app-amortization-table',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './amortization-table.component.html',
  styleUrl: './amortization-table.component.scss',
})
export class AmortizationTableComponent {
  readonly resultado = input<ResultadoSimulacao | null>(null);
}
