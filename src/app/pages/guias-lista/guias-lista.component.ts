import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';
import { cardDoGuia, GuiaService } from '../../core/guia.service';
import { SeoService } from '../../core/seo.service';
import { GuiaResumo } from '../../models/guia.model';
import { GuiaCardComponent } from '../../components/guia-card/guia-card.component';
import { InicioTopoComponent } from '../../components/inicio-topo/inicio-topo.component';
import { InicioRodapeComponent } from '../../components/inicio-rodape/inicio-rodape.component';

/** Lista dos guias (/guias): publicados e, fora de produção, os rascunhos marcados. */
@Component({
  selector: 'app-guias-lista',
  standalone: true,
  imports: [RouterLink, GuiaCardComponent, InicioTopoComponent, InicioRodapeComponent],
  templateUrl: './guias-lista.component.html',
  styleUrl: './guias-lista.component.scss',
})
export class GuiasListaComponent {
  private readonly seo = inject(SeoService);

  readonly guias = toSignal(inject(GuiaService).getTodos().pipe(tap((lista) => this.aplicarSeo(lista))), {
    initialValue: [],
  });

  readonly cards = computed(() => this.guias().map((g) => ({ card: cardDoGuia(g), rascunho: g.rascunho })));

  private aplicarSeo(lista: GuiaResumo[]): void {
    this.seo.aplicar({
      titulo: 'Guias de financiamento | RotaFin',
      descricao: 'Guias com as contas do financiamento de imóvel e veículo: renda necessária, entrada, prazo, juros e custos, com números do simulador.',
      canonicalPath: '/guias',
      // Sem nenhum guia publicado, a lista não deve aparecer na busca.
      noindex: !lista.some((g) => !g.rascunho),
    });

    this.seo.injetarJsonLd('breadcrumb', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: this.seo.ORIGIN },
        { '@type': 'ListItem', position: 2, name: 'Guias', item: `${this.seo.ORIGIN}/guias` },
      ],
    });
  }
}
