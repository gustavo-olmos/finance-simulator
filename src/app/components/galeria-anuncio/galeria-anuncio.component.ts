import { Component, computed, ElementRef, input, signal, viewChild } from '@angular/core';
import { imagemRedimensionada } from '../../core/imagem';
import { Anuncio } from '../../models/anuncio.model';

/**
 * Galeria da página do anúncio. Uma lista só de fotos: no desktop vira a grade
 * principal (2/3) + 2 miniaturas; no celular, carrossel com scroll-snap e contador.
 * "Ver as N fotos" abre todas num <dialog>.
 */
@Component({
  selector: 'app-galeria-anuncio',
  standalone: true,
  templateUrl: './galeria-anuncio.component.html',
  styleUrl: './galeria-anuncio.component.scss',
})
export class GaleriaAnuncioComponent {
  readonly anuncio = input.required<Anuncio>();

  readonly fotos = computed(() => {
    const a = this.anuncio();
    return [a.imagem_url, ...(a.fotos ?? [])].filter(Boolean).map((url, i) => ({
      // A principal é o LCP da página: maior e sem lazy loading.
      src: imagemRedimensionada(url, i === 0 ? 1200 : 800, i === 0 ? 800 : 600)!,
      grande: imagemRedimensionada(url, 1600, 1066)!,
    }));
  });

  readonly atual = signal(1);
  private readonly trilho = viewChild<ElementRef<HTMLElement>>('trilho');
  private readonly dialogo = viewChild<ElementRef<HTMLDialogElement>>('dialogo');

  onScroll(): void {
    const el = this.trilho()?.nativeElement;
    if (!el || !el.clientWidth) return;
    this.atual.set(Math.min(this.fotos().length, Math.round(el.scrollLeft / el.clientWidth) + 1));
  }

  abrir(): void {
    this.dialogo()?.nativeElement.showModal();
  }

  fechar(): void {
    this.dialogo()?.nativeElement.close();
  }

  /** Clique no fundo (fora do conteúdo) fecha o diálogo. */
  cliqueFundo(e: MouseEvent): void {
    if (e.target === this.dialogo()?.nativeElement) this.fechar();
  }
}
