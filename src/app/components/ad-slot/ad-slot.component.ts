import { afterNextRender, Component, computed, inject, input } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { SITE } from '../../config/site.config';

declare global {
  interface Window { adsbygoogle?: unknown[]; }
}

/**
 * Bloco do Google AdSense (um por página). Reserva a altura (250px; 300×250 no celular)
 * para não causar CLS. Sem placeholder visível: se o AdSense não estiver configurado o
 * bloco não é renderizado, e se o anúncio não for preenchido o bloco some (ver SCSS).
 */
@Component({
  selector: 'app-ad-slot',
  standalone: true,
  templateUrl: './ad-slot.component.html',
  styleUrl: './ad-slot.component.scss',
})
export class AdSlotComponent {
  /** data-ad-slot do bloco (ver SITE.adsense.slots). */
  readonly slot = input.required<string>();

  readonly client = SITE.adsense.client;
  readonly ativo = computed(() => !!this.client && !!this.slot());

  constructor() {
    const doc = inject(DOCUMENT);
    afterNextRender(() => {
      if (!this.ativo()) return;
      // O script do AdSense é carregado uma única vez, só quando há bloco na página.
      if (!doc.querySelector('script[src*="adsbygoogle.js"]')) {
        const s = doc.createElement('script');
        s.async = true;
        s.crossOrigin = 'anonymous';
        s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${this.client}`;
        doc.head.appendChild(s);
      }
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {
        // Bloqueador de anúncios ou erro do AdSense: o espaço continua reservado e vazio.
      }
    });
  }
}
