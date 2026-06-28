import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TemaId } from '../../models/tema.model';

/** Cabeçalho da zona principal: marca + navegação entre as landing pages temáticas. */
@Component({
  selector: 'app-site-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './site-header.component.html',
  styleUrl: './site-header.component.scss',
})
export class SiteHeaderComponent {
  readonly temaAtivo = input<TemaId | null>(null);
}
