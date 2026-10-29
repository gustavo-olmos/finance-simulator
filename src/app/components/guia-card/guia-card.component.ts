import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Guia } from '../../config/conteudo.config';

/** Card de um guia (página inicial, lista de guias e "Continue lendo" do post). */
@Component({
  selector: 'app-guia-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './guia-card.component.html',
  styleUrl: './guia-card.component.scss',
})
export class GuiaCardComponent {
  readonly guia = input.required<Guia>();
  /** Marca o card como rascunho (só na lista, fora de produção). */
  readonly rascunho = input(false);
}
