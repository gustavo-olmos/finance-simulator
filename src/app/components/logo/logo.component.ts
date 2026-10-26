import { Component, input } from '@angular/core';

/**
 * Logotipo RotaFin (texto em DM Sans Bold Italic, sem símbolo).
 * "Rota" na cor do texto + "Fin" em verde; no fundo escuro, branco + menta.
 * O tamanho vem do font-size definido pelo pai.
 */
@Component({
  selector: 'app-logo',
  standalone: true,
  template: `<span class="logo" [class.escuro]="variante() === 'escuro'">Rota<span class="fin">Fin</span></span>`,
  styles: `
    :host { display: inline-flex; }
    .logo {
      font-family: var(--fonte-logo);
      font-style: italic;
      font-weight: 700;
      letter-spacing: -0.04em;
      line-height: 1;
      color: var(--texto);
      white-space: nowrap;
    }
    .fin { color: var(--verde); }
    .escuro { color: #FFFFFF; }
    .escuro .fin { color: var(--verde-menta); }
  `,
})
export class LogoComponent {
  readonly variante = input<'claro' | 'escuro'>('claro');
}
