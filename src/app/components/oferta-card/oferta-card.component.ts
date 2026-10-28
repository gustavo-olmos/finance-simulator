import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { track } from '../../core/analytics';
import { Anuncio } from '../../models/anuncio.model';
import { brl0, NBSP } from '../../core/formato';
import { imagemRedimensionada } from '../../core/imagem';
import { linkWhatsapp, mensagemAnuncio } from '../../core/whatsapp';

/** Simulação aplicada a um anúncio (mesmo motor da calculadora). */
export interface SimulacaoOferta {
  entrada: number;   // R$ — fração de entrada do usuário aplicada ao preço do anúncio
  prazoAnos: number;
  parcelaSac: number; // 1ª parcela SAC
}

/**
 * Card de oferta patrocinada. Foto/título/"Simular" levam à página do anúncio;
 * "WhatsApp" é o atalho direto para o anunciante (só aparece se houver telefone).
 */
@Component({
  selector: 'app-oferta-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './oferta-card.component.html',
  styleUrl: './oferta-card.component.scss',
})
export class OfertaCardComponent {
  readonly anuncio = input.required<Anuncio>();
  readonly simulacao = input.required<SimulacaoOferta>();
  /** Posição do card na lista (1, 2…), para o evento oferta_click. */
  readonly posicao = input.required<number>();

  protected readonly fmt = { brl0 };

  readonly imagemThumb = computed(() => imagemRedimensionada(this.anuncio().imagem_url, 480, 360));

  /** "Bairro, cidade · 2 quartos · 64 m²" (imóvel) ou "Cidade · 2024 · 32.000 km" (veículo). */
  readonly detalhes = computed(() => {
    const a = this.anuncio();
    const local = [a.bairro, a.cidade].filter(Boolean).join(', ');
    const partes =
      a.categoria === 'veiculo'
        ? [local, a.ano, a.km != null ? `${a.km.toLocaleString('pt-BR')}${NBSP}km` : null]
        : [local, a.quartos != null ? `${a.quartos} ${a.quartos === 1 ? 'quarto' : 'quartos'}` : null, a.area_m2 != null ? `${a.area_m2}${NBSP}m²` : null];
    return partes.filter((p) => p != null && p !== '').join(' · ');
  });

  readonly linkWhatsapp = computed(() => {
    const a = this.anuncio();
    if (!a.whatsapp) return null;
    const s = this.simulacao();
    return linkWhatsapp(a.whatsapp, mensagemAnuncio(a.titulo, s.entrada, s.prazoAnos, s.parcelaSac));
  });

  registrarClique(): void {
    track('oferta_click', { slug: this.anuncio().slug, posicao: this.posicao() });
  }

  registrarWhatsapp(): void {
    track('lead_whatsapp', { slug: this.anuncio().slug, origem: 'card' });
  }
}
