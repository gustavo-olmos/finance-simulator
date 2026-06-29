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

  readonly copiado = signal(false);

  // Só sincroniza a URL após a primeira renderização para não poluir o histórico no carregamento.
  private urlSincronizada = false;

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

    const cfg = getTema(tema);
    this.seo.aplicar({
      titulo: cfg.seo.titulo,
      descricao: cfg.seo.descricao,
      canonicalPath: `/${this.route.snapshot.routeConfig?.path ?? ''}`,
    });
  }

  async copiarLink(): Promise<void> {
    await navigator.clipboard.writeText(this.doc.location.href);
    this.copiado.set(true);
    setTimeout(() => this.copiado.set(false), 2000);
  }

  onParametrosChange(p: ParametrosSimulacao): void {
    if (!this.urlSincronizada) return;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { valor: p.valorBem, entrada: p.entrada, prazo: p.prazoMeses, taxa: p.taxaAnual },
      replaceUrl: true,
    });
  }
}
