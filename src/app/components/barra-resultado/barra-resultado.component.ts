import { afterNextRender, Component, computed, DestroyRef, inject, NgZone, signal } from '@angular/core';
import { DOCUMENT, ViewportScroller } from '@angular/common';
import { SimulacaoStore } from '../../core/simulacao.store';
import { brl, brlCurto } from '../../core/formato';

type Estado = 'gaveta' | 'oculta' | 'compacta';

/** Altura aproximada da gaveta: o card só conta como "visível" quando aparece acima dela. */
const ALTURA_GAVETA = 190;

/**
 * Barra fixa no rodapé, só no celular (≤760px; escondida por CSS no desktop).
 * - Card de resultado abaixo da tela (primeira dobra) → gaveta com SAC/PRICE e CTA.
 * - Card de resultado visível → some (não duplica a informação).
 * - Card de resultado acima da tela (rolou para o conteúdo) → barra compacta com "Ajustar".
 * Também some enquanto um campo da calculadora tem foco, para não cobrir o teclado.
 */
@Component({
  selector: 'app-barra-resultado',
  standalone: true,
  templateUrl: './barra-resultado.component.html',
  styleUrl: './barra-resultado.component.scss',
})
export class BarraResultadoComponent {
  readonly store = inject(SimulacaoStore);
  private readonly doc = inject(DOCUMENT);
  private readonly scroller = inject(ViewportScroller);

  protected readonly fmt = { brl, brlCurto };

  readonly tema = this.store.tema;
  readonly maximos = this.store.maximos;
  readonly sac = computed(() => this.store.resultado().sac);
  readonly price = computed(() => this.store.resultado().price);

  // No SSR a página abre no topo, com o card abaixo da dobra: começa como gaveta.
  private readonly estado = signal<Estado>('gaveta');
  readonly mostrarGaveta = computed(() => this.estado() === 'gaveta' && !this.store.editando());
  readonly mostrarCompacta = computed(() => this.estado() === 'compacta' && !this.store.editando());

  constructor() {
    const destroyRef = inject(DestroyRef);
    const zone = inject(NgZone);
    afterNextRender(() => {
      const alvo = this.doc.getElementById('resultado');
      if (!alvo || typeof IntersectionObserver === 'undefined') return;
      const io = new IntersectionObserver(
        // O zone.js não intercepta o IntersectionObserver: sem o run() a mudança do
        // signal não dispara a renderização.
        ([e]) => zone.run(() => {
          if (e.isIntersecting) this.estado.set('oculta');
          else this.estado.set(e.boundingClientRect.top > 0 ? 'gaveta' : 'compacta');
        }),
        { rootMargin: `0px 0px -${ALTURA_GAVETA}px 0px` },
      );
      io.observe(alvo);
      destroyRef.onDestroy(() => io.disconnect());
    });
  }

  rolar(id: string): void {
    this.scroller.scrollToAnchor(id);
  }
}
