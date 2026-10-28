import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { track } from '../../core/analytics';
import { FinanceCalculatorService } from '../../core/finance-calculator.service';
import { SimulacaoStore } from '../../core/simulacao.store';
import { brl0, NBSP } from '../../core/formato';
import { imagemRedimensionada } from '../../core/imagem';
import { Anuncio } from '../../models/anuncio.model';

const MAX_OUTROS = 4;

/**
 * "Outros imóveis na mesma faixa" na página do anúncio: anúncios da mesma categoria
 * com preço mais próximo do atual. O "≈ R$ X/mês" usa a simulação da página (entrada %,
 * prazo, taxa e seguro), com o mesmo motor. Grid de 4 no desktop, carrossel no celular.
 */
@Component({
  selector: 'app-outros-anuncios',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './outros-anuncios.component.html',
  styleUrl: './outros-anuncios.component.scss',
})
export class OutrosAnunciosComponent {
  private readonly calc = inject(FinanceCalculatorService);
  private readonly store = inject(SimulacaoStore);

  readonly anuncio = input.required<Anuncio>();
  readonly anuncios = input.required<Anuncio[]>();

  protected readonly fmt = { brl0 };

  readonly bemPlural = computed(() => this.store.tema().bemPlural);

  readonly itens = computed(() => {
    const atual = this.anuncio();
    const p = this.store.parametros();
    const fracao = this.store.entradaFracao();
    return this.anuncios()
      .filter((a) => a.categoria === atual.categoria && a.id !== atual.id)
      .sort((a, b) => Math.abs(a.preco - atual.preco) - Math.abs(b.preco - atual.preco))
      .slice(0, MAX_OUTROS)
      .map((a) => ({
        anuncio: a,
        foto: imagemRedimensionada(a.imagem_url, 480, 360),
        parcela: this.calc.calcularSAC({ ...p, valorBem: a.preco, entrada: a.preco * fracao }).primeiraParcela,
        detalhes: this.detalhes(a),
      }));
  });

  /** "Bairro · 2 quartos · 64 m²" (imóvel) ou "Cidade · 2024 · 32.000 km" (veículo). */
  private detalhes(a: Anuncio): string {
    const partes =
      a.categoria === 'veiculo'
        ? [a.cidade, a.ano, a.km != null ? `${a.km.toLocaleString('pt-BR')}${NBSP}km` : null]
        : [a.bairro, a.quartos != null ? `${a.quartos} ${a.quartos === 1 ? 'quarto' : 'quartos'}` : null, a.area_m2 != null ? `${a.area_m2}${NBSP}m²` : null];
    return partes.filter((p) => p != null && p !== '').join(' · ');
  }

  registrarClique(slug: string, posicao: number): void {
    track('oferta_click', { slug, posicao, origem: 'anuncio' });
  }
}
