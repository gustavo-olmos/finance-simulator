import { Component, computed, input } from '@angular/core';
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

  // Pede ao Unsplash uma versão redimensionada/comprimida (a URL original é a foto em
  // resolução nativa, várias vezes maior que o necessário para um card de 380x150).
  readonly imagemThumb = computed(() => `${this.anuncio().imagem_url}?auto=format&fit=crop&w=480&h=300&q=60`);
}
