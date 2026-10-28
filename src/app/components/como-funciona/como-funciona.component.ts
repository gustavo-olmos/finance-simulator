import { afterNextRender, Component, DestroyRef, ElementRef, inject, NgZone } from '@angular/core';
import { DOCUMENT } from '@angular/common';

const limitar01 = (x: number) => Math.min(1, Math.max(0, x));
/** Easing "ease-out cubic". */
const suave = (x: number) => 1 - Math.pow(1 - limitar01(x), 3);

/**
 * "Como funciona" da página inicial: três passos sobre fundo escuro. Conforme a lista sobe
 * na tela, a trilha âmbar enche e os passos acendem um a um (variáveis --trilho e --e no
 * CSS). Sem JS ou com prefers-reduced-motion, tudo aparece no estado final.
 */
@Component({
  selector: 'app-como-funciona',
  standalone: true,
  templateUrl: './como-funciona.component.html',
  styleUrl: './como-funciona.component.scss',
})
export class ComoFuncionaComponent {
  private readonly doc = inject(DOCUMENT);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);

  readonly passos = [
    {
      titulo: 'Escolha imóvel ou veículo',
      texto: 'Cada tipo de financiamento já vem com valores de exemplo para você partir de algum lugar.',
      curto: 'Cada tipo já vem com valores de exemplo para você partir de algum lugar.',
    },
    {
      titulo: 'Informe os seus números',
      texto: 'Valor do bem, entrada, prazo e a taxa de juros que o banco te ofereceu.',
      curto: 'Valor do bem, entrada, prazo e a taxa que o banco te ofereceu.',
    },
    {
      titulo: 'Ajuste até caber no bolso',
      texto: 'Veja parcela, total pago e juros mudarem na hora enquanto você testa outros cenários.',
      curto: 'Parcela, total pago e juros mudam na hora a cada cenário.',
    },
  ];

  constructor() {
    afterNextRender(() => {
      const win = this.doc.defaultView;
      if (!win || win.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
      // A rolagem não muda estado do Angular: roda fora da zona e escreve direto no DOM.
      this.zone.runOutsideAngular(() => this.acompanharRolagem(win));
    });
  }

  private acompanharRolagem(win: Window): void {
    const raiz = this.host.nativeElement;
    const cabeca = raiz.querySelector<HTMLElement>('.cabeca');
    const lista = raiz.querySelector<HTMLElement>('.passos');
    if (!cabeca || !lista) return;
    const passos = Array.from(lista.children) as HTMLElement[];

    let raf = 0;
    const atualizar = () => {
      raf = 0;
      const vh = win.innerHeight;
      const p = limitar01((vh * 0.92 - lista.getBoundingClientRect().top) / (vh * 0.6));
      raiz.style.setProperty('--trilho', Math.min(1, p / 0.96).toFixed(3));
      cabeca.style.setProperty('--e', suave(p / 0.15).toFixed(3));
      passos.forEach((li, i) => {
        const e = suave((p - 0.12 - i * 0.28) / 0.26);
        li.style.setProperty('--e', e.toFixed(3));
        li.classList.toggle('apagado', e <= 0.98);
      });
    };
    const agendar = () => {
      if (!raf) raf = win.requestAnimationFrame(atualizar);
    };

    win.addEventListener('scroll', agendar, { passive: true });
    win.addEventListener('resize', agendar, { passive: true });
    atualizar();
    this.destroyRef.onDestroy(() => {
      win.removeEventListener('scroll', agendar);
      win.removeEventListener('resize', agendar);
      if (raf) win.cancelAnimationFrame(raf);
    });
  }
}
