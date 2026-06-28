import { Component, input } from '@angular/core';
import { Anuncio } from '../../models/anuncio.model';
import { AdCardComponent } from '../ad-card/ad-card.component';

/** Grid de anúncios do catálogo. */
@Component({
  selector: 'app-ads-grid',
  standalone: true,
  imports: [AdCardComponent],
  templateUrl: './ads-grid.component.html',
  styleUrl: './ads-grid.component.scss',
})
export class AdsGridComponent {
  readonly anuncios = input.required<Anuncio[]>();
  readonly titulo = input<string>('Anúncios em destaque');
}
