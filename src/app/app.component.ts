import { Component, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DOCUMENT, ViewportScroller } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class AppComponent {
  private readonly theme = inject(ThemeService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly doc = inject(DOCUMENT);

  constructor() {
    // O header é sticky: ao rolar até uma âncora (#duvidas, #ofertas…), desconta a
    // altura dele para o título da seção não ficar escondido embaixo.
    inject(ViewportScroller).setOffset(() => {
      const header = this.doc.querySelector('app-site-header') as HTMLElement | null;
      return [0, (header?.offsetHeight ?? 0) + 8];
    });

    effect(() => {
      const cores = this.theme.cores();
      if (!isPlatformBrowser(this.platformId)) return;
      const root = this.doc.documentElement;
      root.style.setProperty('--app-bg', cores.bg);
      root.style.setProperty('--app-ink', cores.ink);
    });
  }
}
