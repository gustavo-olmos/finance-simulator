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
      const win = this.doc.defaultView;
      if (!alvo || !win) return;

      // Listener de scroll em vez de IntersectionObserver: o IO só avisa quando o card
      // cruza a tela, e um salto por âncora (de "abaixo" direto para "acima") não cruza.
      // Roda fora da zona e só entra nela quando o estado muda, para não disparar
      // detecção de mudanças a cada evento de scroll.
      let agendado = false;
      const atualizar = () => {
        agendado = false;
        const r = alvo.getBoundingClientRect();
        const limite = win.innerHeight - ALTURA_GAVETA;
        const novo: Estado = r.top >= limite ? 'gaveta' : r.bottom <= 0 ? 'compacta' : 'oculta';
        if (novo !== this.estado()) zone.run(() => this.estado.set(novo));
      };
      const aoRolar = () => {
        if (agendado) return;
        agendado = true;
        win.requestAnimationFrame(atualizar);
      };

      zone.runOutsideAngular(() => {
        win.addEventListener('scroll', aoRolar, { passive: true });
        win.addEventListener('resize', aoRolar, { passive: true });
      });
      atualizar();
      destroyRef.onDestroy(() => {
        win.removeEventListener('scroll', aoRolar);
        win.removeEventListener('resize', aoRolar);
      });
    });
  }

  rolar(id: string): void {
    this.scroller.scrollToAnchor(id);
  }
}
