import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { track } from '../../core/analytics';
import { Parceiro, PARCEIROS } from '../../config/conteudo.config';
import { SITE } from '../../config/site.config';

/** "Ofertas de parceiros" (patrocinado) da página inicial. Sem parceiros, não renderiza nada. */
@Component({
  selector: 'app-inicio-parceiros',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './inicio-parceiros.component.html',
  styleUrl: './inicio-parceiros.component.scss',
})
export class InicioParceirosComponent {
  readonly parceiros = PARCEIROS;
  readonly anunciarUrl = SITE.anunciarUrl;

  registrar(p: Parceiro): void {
    track('parceiro_click', { parceiro: p.nome });
  }
}
