import { Component } from '@angular/core';

interface LinhaComparativo {
  caracteristica: string;
  sac: string;
  price: string;
}

/** Tabela comparativa SAC × PRICE (conteúdo de SEO, abaixo da dobra). */
@Component({
  selector: 'app-comparison-table',
  standalone: true,
  templateUrl: './comparison-table.component.html',
  styleUrl: './comparison-table.component.scss',
})
export class ComparisonTableComponent {
  readonly linhas: LinhaComparativo[] = [
    { caracteristica: 'Parcelas', sac: 'Decrescentes', price: 'Fixas' },
    { caracteristica: 'Primeira parcela', sac: 'Mais alta', price: 'Menor que no SAC' },
    { caracteristica: 'Total de juros', sac: 'Menor', price: 'Maior' },
    { caracteristica: 'Indicado para', sac: 'Pagar menos juros', price: 'Previsibilidade' },
  ];
}
