import { afterNextRender, Component, computed, DestroyRef, ElementRef, inject, NgZone, signal } from '@angular/core';
import { DatePipe, DOCUMENT } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap, tap } from 'rxjs';
import { cardDoGuia, GuiaService } from '../../core/guia.service';
import { SeoService } from '../../core/seo.service';
import { GuiaCompleto } from '../../models/guia.model';
import { InicioTopoComponent } from '../../components/inicio-topo/inicio-topo.component';
import { GuiaLateralComponent } from '../../components/guia-lateral/guia-lateral.component';
import { GuiaChamadaComponent } from '../../components/guia-chamada/guia-chamada.component';
import { InicioGuiasComponent } from '../../components/inicio-guias/inicio-guias.component';
import { InicioRodapeComponent } from '../../components/inicio-rodape/inicio-rodape.component';

/** Caminho e query params de uma URL do site (para o routerLink). */
function destino(url: string): { caminho: string; params: Record<string, string> } {
  const u = new URL(url, 'https://www.rotafin.com.br');
  return { caminho: u.pathname, params: Object.fromEntries(u.searchParams) };
}

/**
 * Post do blog (/guias/:slug), renderizado no SSR. O conteúdo vem do .md convertido no
 * build (scripts/build-blog.mjs); design em docs/blog/design/. A tipografia do corpo
 * fica em styles/_artigo.scss (global, porque o HTML entra por innerHTML).
 */
@Component({
  selector: 'app-guia-detalhe',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    InicioTopoComponent,
    GuiaLateralComponent,
    GuiaChamadaComponent,
    InicioGuiasComponent,
    InicioRodapeComponent,
  ],
  templateUrl: './guia-detalhe.component.html',
  styleUrl: './guia-detalhe.component.scss',
})
export class GuiaDetalheComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly guiaService = inject(GuiaService);
  private readonly seo = inject(SeoService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly doc = inject(DOCUMENT);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);

  /** Seção do índice lateral em destaque: a última cujo título já passou do topo. */
  readonly secaoAtiva = signal('');

  // Depois de secaoAtiva: no navegador, o guia vem do cache do SSR na hora da inscrição,
  // e aplicarSeo já mexe nela.
  /** null = carregando; undefined = slug inexistente (ou rascunho em produção). */
  readonly guia = toSignal(
    this.route.paramMap.pipe(
      map((p) => p.get('slug') ?? ''),
      switchMap((slug) => this.guiaService.getPorSlug(slug)),
      tap((g) => this.aplicarSeo(g)),
    ),
    { initialValue: null },
  );

  // O HTML é gerado no build a partir dos .md do repositório, e o script recusa HTML cru
  // e links fora de http(s)/mailto/caminho do site. O sanitizer do Angular tiraria os
  // id dos títulos (âncoras do índice) e os ícones.
  readonly html = computed(() => this.confiavel(this.guia()?.html));
  readonly respostaCurta = computed(() => this.confiavel(this.guia()?.respostaCurta));
  readonly notas = computed(() => this.confiavel(this.guia()?.notas));

  private readonly todos = toSignal(this.guiaService.getTodos(), { initialValue: [] });

  /** "Continue lendo": até 2 outros guias publicados. */
  readonly outros = computed(() => {
    const slug = this.guia()?.slug;
    return this.todos()
      .filter((g) => !g.rascunho && g.slug !== slug)
      .slice(0, 2)
      .map(cardDoGuia);
  });

  /** Simulador da chamada final e do card lateral (sem cta, o de imóvel). */
  readonly simulador = computed(() => destino(this.guia()?.cta?.url ?? '/financiamento-imovel'));

  constructor() {
    afterNextRender(() => {
      const win = this.doc.defaultView;
      if (win) this.zone.runOutsideAngular(() => this.acompanharLeitura(win));
    });
  }

  /** Links internos do corpo (href "/…") navegam pelo router, sem recarregar a página. */
  seguirLink(e: MouseEvent): void {
    if (e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    const a = (e.target as HTMLElement).closest('a');
    const href = a?.getAttribute('href');
    if (!a || !href || !href.startsWith('/') || href.startsWith('//') || a.target) return;
    e.preventDefault();
    this.router.navigateByUrl(href);
  }

  private confiavel(html: string | undefined): SafeHtml | null {
    return html ? this.sanitizer.bypassSecurityTrustHtml(html) : null;
  }

  private acompanharLeitura(win: Window): void {
    let quadro = 0;
    const atualizar = () => {
      quadro = 0;
      const titulos = this.host.nativeElement.querySelectorAll<HTMLElement>('.artigo-corpo h2[id]');
      let id = titulos[0]?.id ?? '';
      for (const t of Array.from(titulos)) {
        if (t.getBoundingClientRect().top > 120) break;
        id = t.id;
      }
      if (id && id !== this.secaoAtiva()) this.zone.run(() => this.secaoAtiva.set(id));
    };
    const aoRolar = () => {
      if (!quadro) quadro = win.requestAnimationFrame(atualizar);
    };
    win.addEventListener('scroll', aoRolar, { passive: true });
    this.destroyRef.onDestroy(() => {
      win.removeEventListener('scroll', aoRolar);
      if (quadro) win.cancelAnimationFrame(quadro);
    });
  }

  private aplicarSeo(g: GuiaCompleto | undefined): void {
    if (!g) {
      this.seo.aplicar({
        titulo: 'Guia não encontrado | RotaFin',
        descricao: 'Este guia não existe ou ainda não foi publicado.',
        noindex: true,
      });
      return;
    }

    this.secaoAtiva.set(g.secoes[0]?.id ?? '');
    const caminho = `/guias/${g.slug}`;
    const url = this.seo.ORIGIN + caminho;

    this.seo.aplicar({
      titulo: `${g.tituloSeo} | RotaFin`,
      descricao: g.descricao,
      canonicalPath: caminho,
      tipo: 'article',
      modificadoEm: g.atualizadoEm,
      noindex: g.rascunho,
    });

    // Imagem de compartilhamento: a capa do post; sem capa, a simulação da chamada do post
    // (sem cta, os padrões do /api/og).
    const origin = this.doc.location?.origin || this.seo.ORIGIN;
    let og: string;
    if (g.capa) {
      og = origin + g.capa.og;
      this.seo.setOgImage(og, 'image/jpeg');
    } else {
      const simulacao = new URL(`${origin}/api/og`);
      if (g.cta) {
        const params = new URL(g.cta.url, origin).searchParams;
        for (const k of ['valor', 'entrada', 'prazo', 'taxa', 'seguro']) {
          const v = params.get(k);
          if (v) simulacao.searchParams.set(k, v);
        }
      }
      og = simulacao.toString();
      this.seo.setOgImage(og);
    }

    const organizacao = { '@type': 'Organization', name: 'RotaFin', url: this.seo.ORIGIN };

    this.seo.injetarJsonLd('article', {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: g.titulo,
      description: g.descricao,
      image: og,
      datePublished: g.publicadoEm,
      dateModified: g.atualizadoEm,
      inLanguage: 'pt-BR',
      author: organizacao,
      publisher: organizacao,
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    });

    this.seo.injetarJsonLd('breadcrumb', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: this.seo.ORIGIN },
        { '@type': 'ListItem', position: 2, name: 'Guias', item: `${this.seo.ORIGIN}/guias` },
        { '@type': 'ListItem', position: 3, name: g.titulo, item: url },
      ],
    });
  }
}
