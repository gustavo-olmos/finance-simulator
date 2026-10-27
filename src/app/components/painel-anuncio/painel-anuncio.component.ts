import { Component, computed, inject, input } from '@angular/core';
import { track } from '@vercel/analytics';
import { SimulacaoStore } from '../../core/simulacao.store';
import { brl, brl0, decimal } from '../../core/formato';
import { Anuncio } from '../../models/anuncio.model';

/**
 * "Sua simulação para este imóvel" na página do anúncio. Lê e escreve no SimulacaoStore
 * da página (valor = preço do anúncio). Desktop: painel sticky na coluna direita, com o
 * CTA do WhatsApp, prévia da mensagem, Ligar e Site. Celular: no fluxo da página, sem o
 * CTA (fica na barra fixa) e sem Ligar/Site (o Ligar fica no card do anunciante).
 */
@Component({
  selector: 'app-painel-anuncio',
  standalone: true,
  templateUrl: './painel-anuncio.component.html',
  styleUrl: './painel-anuncio.component.scss',
})
export class PainelAnuncioComponent {
  readonly store = inject(SimulacaoStore);

  readonly anuncio = input.required<Anuncio>();
  readonly mensagem = input.required<string>();
  /** null quando o anúncio não tem WhatsApp: some o CTA e a prévia da mensagem. */
  readonly linkWhatsapp = input<string | null>(null);
  readonly linkTelefone = input<string | null>(null);
  /** Se os valores vieram da última simulação do usuário (muda o texto de apoio). */
  readonly simulacaoSalva = input(false);

  protected readonly fmt = { brl, brl0 };

  readonly bemNome = computed(() => this.store.tema().bemNome);
  readonly sac = computed(() => this.store.resultado().sac);
  readonly price = computed(() => this.store.resultado().price);
  readonly entradaPct = computed(() => Math.round(this.store.entradaFracao() * 100));
  readonly taxaFmt = computed(() => decimal(this.store.taxa()) + '%');

  setEntrada(e: Event): void {
    this.store.registrarInteracao();
    this.store.entrada.set(Number((e.target as HTMLInputElement).value));
  }

  passoPrazo(delta: number): void {
    this.store.registrarInteracao();
    this.store.passoPrazo(delta);
  }

  passoTaxa(delta: number): void {
    this.store.registrarInteracao();
    this.store.passoTaxa(delta);
  }

  registrarWhatsapp(): void {
    track('lead_whatsapp', { slug: this.anuncio().slug, origem: 'pagina' });
  }

  registrarTelefone(): void {
    track('lead_telefone', { slug: this.anuncio().slug });
  }

  registrarSite(): void {
    track('lead_site_anunciante', { slug: this.anuncio().slug });
  }
}
