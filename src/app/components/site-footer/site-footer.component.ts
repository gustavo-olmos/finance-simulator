import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TemaId } from '../../models/tema.model';
import { LogoComponent } from '../logo/logo.component';

/** Rodapé escuro: logotipo, links institucionais e aviso legal. */
@Component({
  selector: 'app-site-footer',
  standalone: true,
  imports: [RouterLink, LogoComponent],
  templateUrl: './site-footer.component.html',
  styleUrl: './site-footer.component.scss',
})
export class SiteFooterComponent {
  readonly temaAtivo = input<TemaId | null>(null);

  readonly rotaSimulador = computed(() =>
    this.temaAtivo() === 'veiculo' ? '/financiamento-veiculo' : '/financiamento-imovel',
  );
}
