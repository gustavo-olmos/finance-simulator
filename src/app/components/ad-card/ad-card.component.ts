import { Component, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Anuncio } from '../../models/anuncio.model';

/** Card de um anúncio do catálogo. Liga para a página de detalhe /anuncios/:slug. */
@Component({
  selector: 'app-ad-card',
  standalone: true,
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './ad-card.component.html',
  styleUrl: './ad-card.component.scss',
})
export class AdCardComponent {
  readonly anuncio = input.required<Anuncio>();
}
