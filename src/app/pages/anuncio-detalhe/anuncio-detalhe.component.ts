import { Component, computed, effect, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs';
import { AnuncioService } from '../../core/anuncio.service';
import { SeoService } from '../../core/seo.service';
import { FinanceCalculatorService } from '../../core/finance-calculator.service';
import { getTema, inferirTema } from '../../config/temas.config';
import { TemaId } from '../../models/tema.model';
import { SiteHeaderComponent } from '../../components/site-header/site-header.component';
import { SimuladorComponent } from '../../components/simulador/simulador.component';
import { AdSlotComponent } from '../../components/ad-slot/ad-slot.component';

/**
 * Página de detalhe do anúncio (/anuncios/:slug) — rota dinâmica de SEO (req. 3.3).
 * Renderiza no SSR com title/description/og/canonical preenchidos a partir do anúncio
 * e com a simulação padrão pré-carregada com o preço do item.
 */
@Component({
  selector: 'app-anuncio-detalhe',
  standalone: true,
  imports: [CurrencyPipe, RouterLink, SiteHeaderComponent, SimuladorComponent, AdSlotComponent],
  templateUrl: './anuncio-detalhe.component.html',
  styleUrl: './anuncio-detalhe.component.scss',
})
export class AnuncioDetalheComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly anuncioService = inject(AnuncioService);
  private readonly seo = inject(SeoService);
  private readonly calc = inject(FinanceCalculatorService);

  private readonly slug$ = this.route.paramMap.pipe(map((p) => p.get('slug') ?? ''));

  readonly anuncio = toSignal(
    this.slug$.pipe(switchMap((slug) => this.anuncioService.getPorSlug(slug))),
    { initialValue: undefined },
  );

  /** Tema inferido pelo preço, para escolher faixas adequadas dos sliders. */
  readonly temaId = computed<TemaId>(() => inferirTema(this.anuncio()?.preco ?? 0));
  readonly config = computed(() => getTema(this.temaId()));
  readonly valorInicial = computed(() => this.anuncio()?.preco ?? null);

  constructor() {
    // Aplica SEO quando o anúncio é carregado (executa no servidor durante o SSR).
    effect(() => {
      const a = this.anuncio();
      if (!a) return;

      const cfg = this.config();
      const d = cfg.defaults;
      const entrada = Math.round(a.preco * (d.entrada / d.valorBem));
      const sim = this.calc.calcularSAC({
        valorBem: a.preco,
        entrada,
        taxaAnual: d.taxaAnual,
        prazoMeses: d.prazoMeses,
      });
      const parcela = sim.primeiraParcela.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });

      this.seo.aplicar({
        titulo: `${a.titulo} — Financiamento | Simulae`,
        descricao: `${a.descricao} Simule: a partir de ${parcela}/mês (SAC).`,
        imagem: a.imagem_url,
        canonicalPath: `/anuncios/${a.slug}`,
      });
    });
  }

}
