import { Component, inject } from '@angular/core';
import { DOCUMENT, ViewportScroller } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';

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

    // O header é sticky: ao rolar até uma âncora (#duvidas, #ofertas…), desconta a
    // altura dele para o título da seção não ficar escondido embaixo.
    scroller.setOffset(() => {
      const header = this.doc.querySelector('app-site-header') as HTMLElement | null;
      return [0, (header?.offsetHeight ?? 0) + 8];
    });

    // A restauração de scroll do router fica desligada porque o simulador reescreve os
    // query params a cada ajuste. Ao trocar de página (outro caminho, sem âncora), volta ao topo.
    let caminhoAnterior: string | null = null;
    inject(Router).events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe((e) => {
        const caminho = e.urlAfterRedirects.split(/[?#]/)[0];
        const temAncora = e.urlAfterRedirects.includes('#');
        if (caminhoAnterior !== null && caminho !== caminhoAnterior && !temAncora) {
          scroller.scrollToPosition([0, 0]);
        }
        caminhoAnterior = caminho;
      });
  }
}
