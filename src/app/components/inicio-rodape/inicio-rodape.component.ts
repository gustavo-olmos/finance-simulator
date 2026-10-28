import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { guiasPublicados } from '../../config/conteudo.config';
import { SITE } from '../../config/site.config';

/** Rodapé claro da página inicial (docs/landingpage/): marca, links e aviso legal. */
@Component({
  selector: 'app-inicio-rodape',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './inicio-rodape.component.html',
  styleUrl: './inicio-rodape.component.scss',
})
export class InicioRodapeComponent {
  readonly temGuias = guiasPublicados().length > 0;
  readonly anunciarUrl = SITE.anunciarUrl;
}
