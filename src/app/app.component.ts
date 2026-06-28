import { Component, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
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
    // Sincroniza as variáveis CSS de tema (verde/âmbar) sempre que o sistema muda.
    // Só roda no browser; no servidor os valores padrão de styles.scss são usados.
    effect(() => {
      const cores = this.theme.cores();
      if (!isPlatformBrowser(this.platformId)) return;
      const root = this.doc.documentElement;
      root.style.setProperty('--app-bg', cores.bg);
      root.style.setProperty('--app-ink', cores.ink);
    });
  }
}
