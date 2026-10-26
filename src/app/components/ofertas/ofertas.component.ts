import { Component, computed, ElementRef, inject, input, signal, viewChild } from '@angular/core';
import { FinanceCalculatorService } from '../../core/finance-calculator.service';
import { SimulacaoStore } from '../../core/simulacao.store';
import { brlCurto } from '../../core/formato';
import { Anuncio } from '../../models/anuncio.model';
import { OfertaCardComponent, SimulacaoOferta } from '../oferta-card/oferta-card.component';

const MAX_OFERTAS = 4;

/**
 * Ofertas patrocinadas "Imóveis que cabem nessa simulação": anúncios do tema da página
 * com preço até o teto simulado (do mais caro para o mais barato). Se nenhum couber,
 * mostra os mais próximos do teto com outro título. Grid de 4 no desktop; carrossel
 * com scroll-snap no celular.
 */
@Component({
  selector: 'app-ofertas',
  standalone: true,
  imports: [OfertaCardComponent],
  templateUrl: './ofertas.component.html',
  styleUrl: './ofertas.component.scss',
})
export class OfertasComponent {
  private readonly calc = inject(FinanceCalculatorService);
  readonly store = inject(SimulacaoStore);

  readonly anuncios = input.required<Anuncio[]>();

  readonly tema = this.store.tema;
  readonly faixa = computed(() => brlCurto(this.store.faixaMax()));
  readonly pluralTitulo = computed(() => {
    const p = this.tema().bemPlural;
    return p.charAt(0).toUpperCase() + p.slice(1);
  });

  readonly selecao = computed(() => {
    const teto = this.store.faixaMax();
    const doTema = this.anuncios().filter((a) => a.categoria === this.tema().id);
    const cabem = doTema.filter((a) => a.preco <= teto).sort((a, b) => b.preco - a.preco);
    const lista = cabem.length
      ? cabem
      : [...doTema].sort((a, b) => Math.abs(a.preco - teto) - Math.abs(b.preco - teto));
    return { cabem: cabem.length > 0, anuncios: lista.slice(0, MAX_OFERTAS) };
  });

  /** "≈ R$ X/mês com sua entrada": mesmo motor, com a entrada (%), prazo, taxa e seguro do usuário. */
  readonly itens = computed(() => {
    const p = this.store.parametros();
    const fracao = this.store.entradaFracao();
    return this.selecao().anuncios.map((anuncio) => {
      const entrada = anuncio.preco * fracao;
      const sac = this.calc.calcularSAC({ ...p, valorBem: anuncio.preco, entrada });
      const simulacao: SimulacaoOferta = {
        entrada,
        prazoAnos: this.store.prazoAnos(),
        parcelaSac: sac.primeiraParcela,
      };
      return { anuncio, simulacao };
    });
  });

  // Indicador de posição do carrossel (celular).
  private readonly lista = viewChild<ElementRef<HTMLElement>>('lista');
  readonly ativo = signal(0);

  onScroll(): void {
    const el = this.lista()?.nativeElement;
    const card = el?.firstElementChild as HTMLElement | null;
    if (!el || !card) return;
    const passo = card.offsetWidth + 12;
    this.ativo.set(Math.min(this.itens().length - 1, Math.round(el.scrollLeft / passo)));
  }
}
