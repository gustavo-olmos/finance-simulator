import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { guiasPublicados } from '../../config/conteudo.config';

/**
 * "Antes de assinar, vale ler" da página inicial: os guias do blog.
 * Só aparece quando algum guia tem url (conteudo.config.ts).
 */
@Component({
  selector: 'app-inicio-guias',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './inicio-guias.component.html',
  styleUrl: './inicio-guias.component.scss',
})
export class InicioGuiasComponent {
  readonly guias = guiasPublicados();
}
