import { Component, computed, effect, inject, OnInit, signal, afterNextRender } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AnuncioService } from '../../core/anuncio.service';
import { SeoService } from '../../core/seo.service';
import { getTema } from '../../config/temas.config';
import { TemaId } from '../../models/tema.model';
import { SiteHeaderComponent } from '../../components/site-header/site-header.component';
import { SiteFooterComponent } from '../../components/site-footer/site-footer.component';
import { FaqComponent } from '../../components/faq/faq.component';
import { OfertasComponent } from '../../components/ofertas/ofertas.component';
import { BannerAnuncieComponent } from '../../components/banner-anuncie/banner-anuncie.component';
import { AdSlotComponent } from '../../components/ad-slot/ad-slot.component';
import { GraficoAnualComponent } from '../../components/grafico-anual/grafico-anual.component';
import { TabelaAnualComponent } from '../../components/tabela-anual/tabela-anual.component';
import { TaxasReferenciaComponent } from '../../components/taxas-referencia/taxas-referencia.component';
import { CalculadoraComponent } from '../../components/calculadora/calculadora.component';
import { ResultadoCardComponent } from '../../components/resultado-card/resultado-card.component';
import { BarraResultadoComponent } from '../../components/barra-resultado/barra-resultado.component';
import { SimulacaoStore } from '../../core/simulacao.store';
import { SITE } from '../../config/site.config';
import { faqDoTema } from '../../config/conteudo.config';

/**
 * Landing page temática (imóvel / veículo). O tema vem de route.data.
 * Hero com a calculadora e o card de resultado; conteúdo de SEO e anúncios abaixo.
 * O estado da simulação fica no SimulacaoStore, fornecido aqui.
 */
@Component({
  selector: 'app-simulador-page',
  standalone: true,
  imports: [
    SiteHeaderComponent,
    SiteFooterComponent,
    FaqComponent,
    OfertasComponent,
    BannerAnuncieComponent,
    AdSlotComponent,
    GraficoAnualComponent,
    TabelaAnualComponent,
    TaxasReferenciaComponent,
    CalculadoraComponent,
    ResultadoCardComponent,
    BarraResultadoComponent,
  ],
  providers: [SimulacaoStore],
  templateUrl: './simulador-page.component.html',
  styleUrl: './simulador-page.component.scss',
})
export class SimuladorPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly seo = inject(SeoService);
  private readonly anuncioService = inject(AnuncioService);
  private readonly doc = inject(DOCUMENT);
  readonly temaId = signal<TemaId>('imovel');
  readonly config = computed(() => getTema(this.temaId()));
  readonly store = inject(SimulacaoStore);

  readonly selos = ['Grátis', 'Sem cadastro', 'Resultado em segundos'];
  readonly adsenseSlot = SITE.adsense.slots.simulador;

  // Só sincroniza a URL após a primeira renderização para não poluir o histórico no carregamento.
  private urlSincronizada = false;
  private urlTimer: ReturnType<typeof setTimeout> | null = null;

  readonly anuncios = toSignal(this.anuncioService.getTodos(), { initialValue: [] });

  constructor() {
    afterNextRender(() => { this.urlSincronizada = true; });

    // Mantém a URL com os parâmetros da simulação (prefill e compartilhamento).
    effect(() => {
      const queryParams = this.store.queryParams();
      if (!this.urlSincronizada) return;
      if (this.urlTimer) clearTimeout(this.urlTimer);
      this.urlTimer = setTimeout(() => {
        this.router.navigate([], { relativeTo: this.route, queryParams, replaceUrl: true });
      }, 400);
    });
  }

  ngOnInit(): void {
    const tema = (this.route.snapshot.data['tema'] as TemaId) ?? 'imovel';
    this.temaId.set(tema);

    const qp = this.route.snapshot.queryParams;
    const num = (k: string): number | null => {
      const v = Number(qp[k]);
      return qp[k] != null && qp[k] !== '' && Number.isFinite(v) ? v : null;
    };

    const cfg = getTema(tema);
    this.store.inicializar(cfg, {
      valorBem: num('valor'),
      entrada: num('entrada'),
      prazoMeses: num('prazo'),
      taxaAnual: num('taxa'),
      seguroMensal: num('seguro'),
    });
    const path = this.route.snapshot.routeConfig?.path ?? '';
    this.seo.aplicar({
      titulo: cfg.seo.titulo,
      descricao: cfg.seo.descricao,
      canonicalPath: `/${path}`,
    });

    const url = `${this.seo.ORIGIN}/${path}`;

    const origin = this.doc.location?.origin || this.seo.ORIGIN;
    const ogUrl = new URL(`${origin}/api/og`);
    ogUrl.searchParams.set('valor',   (Number(qp['valor']   ?? cfg.defaults.valorBem)).toString());
    ogUrl.searchParams.set('entrada', (Number(qp['entrada'] ?? cfg.defaults.entrada)).toString());
    ogUrl.searchParams.set('prazo',   (Number(qp['prazo']   ?? cfg.defaults.prazoMeses)).toString());
    ogUrl.searchParams.set('taxa',    (Number(qp['taxa']    ?? cfg.defaults.taxaAnual)).toString());
    ogUrl.searchParams.set('seguro',  (Number(qp['seguro']  ?? 0)).toString());
    ogUrl.searchParams.set('sistema', qp['sistema'] === 'PRICE' ? 'PRICE' : 'SAC');
    this.seo.setOgImage(ogUrl.toString());

    const organizacao = { '@type': 'Organization', name: 'RotaFin', url: this.seo.ORIGIN };

    this.seo.injetarJsonLd('organization', { '@context': 'https://schema.org', ...organizacao });

    this.seo.injetarJsonLd('website', {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'RotaFin',
      url: this.seo.ORIGIN,
      inLanguage: 'pt-BR',
    });

    this.seo.injetarJsonLd('breadcrumb', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: this.seo.ORIGIN },
        { '@type': 'ListItem', position: 2, name: cfg.seo.produtoNome, item: url },
      ],
    });

    this.seo.injetarJsonLd('web-application', {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: cfg.seo.titulo,
      description: cfg.seo.descricao,
      url,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
    });

    this.seo.injetarJsonLd('financial-product', {
      '@context': 'https://schema.org',
      '@type': 'FinancialProduct',
      name: cfg.seo.produtoNome,
      description: cfg.seo.descricao,
      url,
      feesAndCommissionsSpecification: 'Estimativa para fins de comparação. Não constitui proposta de crédito.',
      provider: organizacao,
    });

    this.seo.injetarJsonLd('faq', {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqDoTema(tema).map((f) => ({
        '@type': 'Question',
        name: f.pergunta,
        acceptedAnswer: { '@type': 'Answer', text: f.resposta },
      })),
    });
  }
}
