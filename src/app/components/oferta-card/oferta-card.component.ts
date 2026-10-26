import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { track } from '@vercel/analytics';
import { Anuncio } from '../../models/anuncio.model';
import { brl, brl0 } from '../../core/formato';

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

  // Pede ao Unsplash uma versão redimensionada/comprimida (a URL original é a foto em
  // resolução nativa, várias vezes maior que o necessário para o card).
  readonly imagemThumb = computed(() => {
    const url = this.anuncio().imagem_url;
    return url ? `${url}?auto=format&fit=crop&w=480&h=360&q=60` : null;
  });

  /** "Bairro, cidade · 2 quartos · 64 m²" (imóvel) ou "Cidade · 2024 · 32.000 km" (veículo). */
  readonly detalhes = computed(() => {
    const a = this.anuncio();
    const local = [a.bairro, a.cidade].filter(Boolean).join(', ');
    const partes =
      a.categoria === 'veiculo'
        ? [local, a.ano, a.km != null ? `${a.km.toLocaleString('pt-BR')} km` : null]
        : [local, a.quartos != null ? `${a.quartos} ${a.quartos === 1 ? 'quarto' : 'quartos'}` : null, a.area_m2 != null ? `${a.area_m2} m²` : null];
    return partes.filter((p) => p != null && p !== '').join(' · ');
  });

  readonly linkWhatsapp = computed(() => {
    const a = this.anuncio();
    if (!a.whatsapp) return null;
    const s = this.simulacao();
    const texto = `Olá! Vi o anúncio ${a.titulo} na RotaFin. Simulei com ${brl0(s.entrada)} de entrada em ${s.prazoAnos} anos, parcela de ${brl(s.parcelaSac)} (SAC). Ainda está disponível?`;
    return `https://wa.me/${a.whatsapp}?text=${encodeURIComponent(texto)}`;
  });

  registrarClique(): void {
    track('oferta_click', { slug: this.anuncio().slug, posicao: this.posicao() });
  }

  registrarWhatsapp(): void {
    track('lead_whatsapp', { slug: this.anuncio().slug, origem: 'card' });
  }
}
