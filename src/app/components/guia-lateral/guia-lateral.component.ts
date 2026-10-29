import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SecaoGuia } from '../../models/guia.model';

/** Coluna lateral do guia (desktop): índice "Nesta página" e atalho para o simulador. */
@Component({
  selector: 'app-guia-lateral',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './guia-lateral.component.html',
  styleUrl: './guia-lateral.component.scss',
})
export class GuiaLateralComponent {
  readonly secoes = input.required<SecaoGuia[]>();
  /** id da seção em leitura (fica marcada). */
  readonly ativa = input('');
  readonly simulador = input.required<{ caminho: string; params: Record<string, string> }>();
}
