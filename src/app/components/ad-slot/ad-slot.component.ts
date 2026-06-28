import { Component, input } from '@angular/core';

/**
 * Espaço de anúncio (placeholder do Google AdSense). Fica SEMPRE fora da zona
 * principal (app), apenas na zona de conteúdo abaixo da dobra.
 * Substitua o conteúdo do placeholder pelo <ins class="adsbygoogle"> real.
 */
@Component({
  selector: 'app-ad-slot',
  standalone: true,
  templateUrl: './ad-slot.component.html',
  styleUrl: './ad-slot.component.scss',
})
export class AdSlotComponent {
  /** Texto descritivo do formato (ex.: "responsivo (728×90 / 970×90)"). */
  readonly formato = input<string>('responsivo');
  /** Altura mínima do bloco, conforme o formato. */
  readonly alturaMin = input<number>(120);
  /** Largura máxima do contêiner. */
  readonly larguraMax = input<number>(970);
  /** Identificador do slot (data-ad-slot do AdSense). */
  readonly slotId = input<string>('');
}
