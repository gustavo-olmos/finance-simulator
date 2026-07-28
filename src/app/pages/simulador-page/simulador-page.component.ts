import { Component, computed, inject, OnInit, signal, afterNextRender } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AnuncioService } from '../../core/anuncio.service';
import { SeoService } from '../../core/seo.service';
import { getTema } from '../../config/temas.config';
import { TemaId } from '../../models/tema.model';
import { SiteHeaderComponent } from '../../components/site-header/site-header.component';
import { SimuladorComponent } from '../../components/simulador/simulador.component';
import { ComparisonTableComponent } from '../../components/comparison-table/comparison-table.component';
import { FaqComponent } from '../../components/faq/faq.component';
import { AdsGridComponent } from '../../components/ads-grid/ads-grid.component';
import { AdSlotComponent } from '../../components/ad-slot/ad-slot.component';
import { AmortizationTableComponent } from '../../components/amortization-table/amortization-table.component';
import { ShareModalComponent } from '../../components/share-modal/share-modal.component';
import { ParametrosSimulacao, ResultadoSimulacao } from '../../models/simulacao.model';

/**
 * Landing page temática (imóvel / veículo). O tema vem de route.data.
 * Zona principal (app) limpa; conteúdo de SEO e anúncios abaixo da dobra.
 */
@Component({
  selector: 'app-simulador-page',
  standalone: true,
  imports: [
    SiteHeaderComponent,
    SimuladorComponent,
    ComparisonTableComponent,
    FaqComponent,
    AdsGridComponent,
    AdSlotComponent,
    AmortizationTableComponent,
    ShareModalComponent,
  ],
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
  readonly resultadoAtual = signal<ResultadoSimulacao | null>(null);

  // Parâmetros lidos da URL na abertura da página.
  readonly valorParam = signal<number | null>(null);
  readonly entradaParam = signal<number | null>(null);
  readonly prazoParam = signal<number | null>(null);
  readonly taxaParam = signal<number | null>(null);
  readonly seguroParam = signal<number | null>(null);

  readonly mostrarModal = signal(false);

  // Só sincroniza a URL após a primeira renderização para não poluir o histórico no carregamento.
  private urlSincronizada = false;
  private urlTimer: ReturnType<typeof setTimeout> | null = null;

  readonly anuncios = toSignal(this.anuncioService.getTodos(), { initialValue: [] });

  constructor() {
    afterNextRender(() => { this.urlSincronizada = true; });
  }

  ngOnInit(): void {
    const tema = (this.route.snapshot.data['tema'] as TemaId) ?? 'imovel';
    this.temaId.set(tema);

    const qp = this.route.snapshot.queryParams;
    if (qp['valor'])   this.valorParam.set(Number(qp['valor']));
    if (qp['entrada']) this.entradaParam.set(Number(qp['entrada']));
    if (qp['prazo'])   this.prazoParam.set(Number(qp['prazo']));
    if (qp['taxa'])    this.taxaParam.set(Number(qp['taxa']));
    if (qp['seguro'])  this.seguroParam.set(Number(qp['seguro']));

    const cfg = getTema(tema);
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
    ogUrl.searchParams.set('sistema', 'SAC');
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
        { '@type': 'ListItem', position: 2, name: cfg.seo.h1, item: url },
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
      mainEntity: [
        { '@type': 'Question', name: 'Para qual tipo de financiamento serve?',
          acceptedAnswer: { '@type': 'Answer', text: 'Imóvel, veículo, crédito com garantia e outros financiamentos com parcelas mensais. Basta informar valor, entrada, prazo e taxa.' } },
        { '@type': 'Question', name: 'A taxa de juros é mensal ou anual?',
          acceptedAnswer: { '@type': 'Answer', text: 'Você informa a taxa anual e o simulador converte para a taxa mensal equivalente automaticamente.' } },
        { '@type': 'Question', name: 'Os valores são exatos?',
          acceptedAnswer: { '@type': 'Answer', text: 'São estimativas para fins de comparação. As condições reais variam conforme a instituição financeira e o seu perfil.' } },
        { '@type': 'Question', name: 'Preciso me cadastrar?',
          acceptedAnswer: { '@type': 'Answer', text: 'Não. O cálculo é gratuito, instantâneo e não exige nenhum dado pessoal.' } },
      ],
    });
  }

  onParametrosChange(p: ParametrosSimulacao): void {
    if (!this.urlSincronizada) return;
    if (this.urlTimer) clearTimeout(this.urlTimer);
    this.urlTimer = setTimeout(() => {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          valor: p.valorBem,
          entrada: p.entrada,
          prazo: p.prazoMeses,
          taxa: p.taxaAnual,
          seguro: p.seguroMensal ?? 0,
        },
        replaceUrl: true,
      });
    }, 400);
  }
}
