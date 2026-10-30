import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE } from '../../config/site.config';

/** Banner "É imobiliária ou concessionária? Quero anunciar" (âncora #anunciar do header). */
@Component({
  selector: 'app-banner-anuncie',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section id="anunciar" class="wrap secao">
      <div class="caixa">
        <div class="texto">
          <h2>É imobiliária ou concessionária?</h2>
          <p class="desk">Mostre seus imóveis e veículos para quem já está calculando a parcela, na faixa de preço que a pessoa simulou.</p>
          <p class="mob">Apareça para quem já está calculando a parcela, na faixa de preço certa.</p>
        </div>
        @if (anunciarUrl) {
          <a class="btn" [href]="anunciarUrl" target="_blank" rel="noopener">Quero anunciar</a>
        } @else {
          <a class="btn" routerLink="/contato" fragment="anunciar">Quero anunciar</a>
        }
      </div>
    </section>
  `,
  styles: `
    :host { display: block; }
    .secao { padding-top: 8px; padding-bottom: 40px; scroll-margin-top: 120px; }
    .caixa {
      background: var(--escuro-2);
      color: #FFFFFF;
      border-radius: 18px;
      padding: 28px;
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      align-items: center;
      justify-content: space-between;
    }
    .texto { flex: 1 1 420px; }
    h2 {
      margin: 0 0 6px;
      font-family: var(--fonte-titulo);
      font-size: 24px;
      font-weight: 700;
    }
    p {
      margin: 0;
      font-size: 16px;
      line-height: 1.5;
      color: #D5E3DA;
    }
    .mob { display: none; }
    .btn {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 50px;
      padding: 0 22px;
      border-radius: 11px;
      background: var(--verde-menta);
      color: var(--escuro);
      font-weight: 700;
      font-size: 16px;
      text-decoration: none;
      &:hover { background: #A4EBC6; }
      &:focus-visible { outline: 2px solid #FFFFFF; outline-offset: 2px; }
    }
    @media (max-width: 760px) {
      .secao { padding-top: 4px; padding-bottom: 20px; }
      .caixa { display: block; border-radius: 16px; padding: 20px; }
      h2 { font-size: 20px; }
      p { margin-bottom: 14px; font-size: 14px; }
      .desk { display: none; }
      .mob { display: block; }
      .btn { min-height: 48px; font-size: 15px; }
    }
  `,
})
export class BannerAnuncieComponent {
  readonly anunciarUrl = SITE.anunciarUrl;
}
