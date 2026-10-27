import { Component, input } from '@angular/core';
import { track } from '@vercel/analytics';
import { brl } from '../../core/formato';

/**
 * Barra fixa da página do anúncio, só no celular (≤760px; escondida por CSS no desktop):
 * parcela SAC + "Falar no WhatsApp". A página só a renderiza quando o anúncio tem WhatsApp.
 */
@Component({
  selector: 'app-barra-whatsapp',
  standalone: true,
  templateUrl: './barra-whatsapp.component.html',
  styleUrl: './barra-whatsapp.component.scss',
})
export class BarraWhatsappComponent {
  readonly link = input.required<string>();
  readonly parcela = input.required<number>();
  readonly slug = input.required<string>();

  protected readonly fmt = { brl };

  registrarWhatsapp(): void {
    track('lead_whatsapp', { slug: this.slug(), origem: 'pagina' });
  }
}
