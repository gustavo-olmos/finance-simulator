import { Component, computed, inject, input, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { NavigationStart, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { TemaId } from '../../models/tema.model';
import { LogoComponent } from '../logo/logo.component';

/**
 * Header branco e sticky. Desktop: logotipo · abas Imóvel/Veículo · Como funciona ·
 * Dúvidas · "Anuncie aqui". Celular (≤760px): logotipo + hambúrguer na 1ª linha e as
 * abas em largura total na 2ª.
 */
@Component({
  selector: 'app-site-header',
  standalone: true,
  imports: [RouterLink, NgTemplateOutlet, LogoComponent],
  templateUrl: './site-header.component.html',
  styleUrl: './site-header.component.scss',
})
export class SiteHeaderComponent {
  readonly temaAtivo = input<TemaId | null>(null);
  readonly menuAberto = signal(false);

  /** Página do simulador que recebe os links de seção (#como-funciona, #duvidas…). */
  readonly rotaSimulador = computed(() =>
    this.temaAtivo() === 'veiculo' ? '/financiamento-veiculo' : '/financiamento-imovel',
  );

  constructor() {
    inject(Router).events
      .pipe(filter((e) => e instanceof NavigationStart), takeUntilDestroyed())
      .subscribe(() => this.menuAberto.set(false));
  }
}
