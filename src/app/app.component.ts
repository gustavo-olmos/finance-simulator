import { Component, inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser, ViewportScroller } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { iniciarGa4, paginaVista } from './core/analytics';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class AppComponent {
  private readonly doc = inject(DOCUMENT);

  constructor() {
    const scroller = inject(ViewportScroller);
    const browser = isPlatformBrowser(inject(PLATFORM_ID));
    if (browser) iniciarGa4(this.doc);

    // O header é sticky: ao rolar até uma âncora (#duvidas, #ofertas…), desconta a
    // altura dele para o título da seção não ficar escondido embaixo. 
    scroller.setOffset(() => {
      const header = this.doc.querySelector('app-site-header') as HTMLElement | null;
      return [0, (header?.offsetHeight ?? 0) + 8];
    });

    // A restauração de scroll do router fica desligada porque o simulador reescreve os
    // query params a cada ajuste. Ao trocar de página (outro caminho, sem âncora), volta ao topo.
    // A mesma regra define o page_view do GA4 (inclusive o da primeira página).
    let caminhoAnterior: string | null = null;
    inject(Router).events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe((e) => {
        const caminho = e.urlAfterRedirects.split(/[?#]/)[0];
        const temAncora = e.urlAfterRedirects.includes('#');
        if (caminhoAnterior !== null && caminho !== caminhoAnterior && !temAncora) {
          scroller.scrollToPosition([0, 0]);
        }
        // setTimeout: o <title> da nova página é definido na inicialização dela, logo depois.
        if (browser && caminho !== caminhoAnterior) setTimeout(() => paginaVista(this.doc));
        caminhoAnterior = caminho;
      });
  }
}
