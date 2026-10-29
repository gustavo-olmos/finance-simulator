import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Guia, guiasPublicados } from '../../config/conteudo.config';
import { GuiaCardComponent } from '../guia-card/guia-card.component';

/**
 * "Antes de assinar, vale ler" da página inicial: os guias do blog.
 * Só aparece quando há guia publicado (conteudo.config.ts). O post reaproveita a seção
 * como "Continue lendo", com outros guias.
 */
@Component({
  selector: 'app-inicio-guias',
  standalone: true,
  imports: [RouterLink, GuiaCardComponent],
  templateUrl: './inicio-guias.component.html',
  styleUrl: './inicio-guias.component.scss',
})
export class InicioGuiasComponent {
  readonly titulo = input('Antes de assinar, vale ler');
  readonly guias = input<Guia[]>(guiasPublicados());
}
