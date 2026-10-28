import { Component, computed, inject, signal } from '@angular/core';
import { DOCUMENT, ViewportScroller } from '@angular/common';
import { Router } from '@angular/router';
import { track } from '../../core/analytics';
import { SimulacaoStore } from '../../core/simulacao.store';
import { SeoService } from '../../core/seo.service';
import { brl, brl0, brlCurto } from '../../core/formato';
import { copiarTexto } from '../../core/clipboard';

/**
 * Card de resultado (branco, ao lado da calculadora no desktop e abaixo no celular).
 * SAC e PRICE lado a lado, sem toggle; no modo "Sei quanto posso pagar" mostra o
 * valor máximo do bem em cada sistema.
 */
@Component({
  selector: 'app-resultado-card',
  standalone: true,
  templateUrl: './resultado-card.component.html',
  styleUrl: './resultado-card.component.scss',
})
export class ResultadoCardComponent {
  readonly store = inject(SimulacaoStore);
  private readonly doc = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly seo = inject(SeoService);
  private readonly scroller = inject(ViewportScroller);

  protected readonly fmt = { brl, brl0, brlCurto };

  readonly tema = this.store.tema;
  readonly maximos = this.store.maximos;
  readonly sac = computed(() => this.store.resultado().sac);
  readonly price = computed(() => this.store.resultado().price);
  readonly copiado = signal(false);

  /** Link da simulação atual, montado do estado (a URL da barra de endereço é sincronizada com atraso). */
  readonly link = computed(() => {
    const origin = this.doc.location?.origin || this.seo.ORIGIN;
    const path = this.router.url.split(/[?#]/)[0];
    const qs = new URLSearchParams(
      Object.entries(this.store.queryParams()).map(([k, v]) => [k, String(v)]),
    );
    return `${origin}${path}?${qs}`;
  });

  readonly linkWhatsapp = computed(() => {
    const bem = this.tema().bemNome;
    const m = this.maximos();
    const texto = m
      ? `Simulei na RotaFin: pagando até ${brl0(this.store.parcelaMax())}/mês, dá para comprar um ${bem} de até ${brlCurto(Math.max(m.sac, m.price))}. Veja: ${this.link()}`
      : `Simulei o financiamento de um ${bem} de ${brl0(this.store.valor())} na RotaFin: parcela de ${brl(this.sac().primeiraParcela)} no SAC ou ${brl(this.price().primeiraParcela)} no PRICE. Veja: ${this.link()}`;
    return `https://wa.me/?text=${encodeURIComponent(texto)}`;
  });

  verOfertas(): void {
    this.scroller.scrollToAnchor('ofertas');
  }

  registrarCompartilhamento(canal: 'whatsapp' | 'copiar_link'): void {
    track('compartilhar', { canal, tema: this.tema().id });
  }

  async copiarLink(): Promise<void> {
    await copiarTexto(this.doc, this.link());
    this.registrarCompartilhamento('copiar_link');
    this.copiado.set(true);
    setTimeout(() => this.copiado.set(false), 2000);
  }
}
