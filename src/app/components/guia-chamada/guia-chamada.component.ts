import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { track } from '../../core/analytics';
import { CtaGuia } from '../../models/guia.model';

/** Chamada final do guia para o simulador (campo cta do post). */
@Component({
  selector: 'app-guia-chamada',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './guia-chamada.component.html',
  styleUrl: './guia-chamada.component.scss',
})
export class GuiaChamadaComponent {
  readonly cta = input.required<CtaGuia>();
  readonly simulador = input.required<{ caminho: string; params: Record<string, string> }>();
  readonly slug = input.required<string>();

  registrar(): void {
    track('guia_cta', { slug: this.slug() });
  }
}
