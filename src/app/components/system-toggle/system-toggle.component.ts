import { Component, inject } from '@angular/core';
import { ThemeService } from '../../core/theme.service';
import { SistemaAmortizacao } from '../../models/simulacao.model';

/** Seletor segmentado SAC / PRICE. Dirige o ThemeService (cor + sistema de cálculo). */
@Component({
  selector: 'app-system-toggle',
  standalone: true,
  templateUrl: './system-toggle.component.html',
  styleUrl: './system-toggle.component.scss',
})
export class SystemToggleComponent {
  readonly theme = inject(ThemeService);

  selecionar(sistema: SistemaAmortizacao): void {
    this.theme.setSistema(sistema);
  }
}
