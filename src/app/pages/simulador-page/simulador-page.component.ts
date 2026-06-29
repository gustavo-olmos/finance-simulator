import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
import { ResultadoSimulacao } from '../../models/simulacao.model';

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
  private readonly seo = inject(SeoService);
  private readonly anuncioService = inject(AnuncioService);

  readonly temaId = signal<TemaId>('imovel');
  readonly config = computed(() => getTema(this.temaId()));
  readonly resultadoAtual = signal<ResultadoSimulacao | null>(null);

  readonly anuncios = toSignal(this.anuncioService.getTodos(), { initialValue: [] });

  ngOnInit(): void {
    const tema = (this.route.snapshot.data['tema'] as TemaId) ?? 'imovel';
    this.temaId.set(tema);

    const cfg = getTema(tema);
    this.seo.aplicar({
      titulo: cfg.seo.titulo,
      descricao: cfg.seo.descricao,
      canonicalPath: `/${this.route.snapshot.routeConfig?.path ?? ''}`,
    });
  }
}
