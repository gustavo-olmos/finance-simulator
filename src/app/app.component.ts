import { Component, inject } from '@angular/core';
import { DOCUMENT, ViewportScroller } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class AppComponent {
  private readonly doc = inject(DOCUMENT);

  constructor() {
    // O header é sticky: ao rolar até uma âncora (#duvidas, #ofertas…), desconta a
    // altura dele para o título da seção não ficar escondido embaixo.
    inject(ViewportScroller).setOffset(() => {
      const header = this.doc.querySelector('app-site-header') as HTMLElement | null;
      return [0, (header?.offsetHeight ?? 0) + 8];
    });
  }
}
