import { Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { guiasPublicados } from '../../config/conteudo.config';

interface ItemNav {
  rotulo: string;
  link: string;
  fragmento?: string;
  ativo?: boolean;
}

/**
 * Cabeçalho da página inicial (docs/landingpage/): logotipo, âncoras das seções e
 * "Simular agora"; no celular, menu sanduíche. Os links são "/" + âncora, então o
 * cabeçalho funciona também nas outras páginas no mesmo visual. Nos guias
 * (atual="guias"), "Guias" fica destacado e leva à lista de guias.
 */
@Component({
  selector: 'app-inicio-topo',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './inicio-topo.component.html',
  styleUrl: './inicio-topo.component.scss',
})
export class InicioTopoComponent {
  readonly atual = input<'guias' | null>(null);

  readonly secoes = computed<ItemNav[]>(() => {
    const guias: ItemNav[] =
      this.atual() === 'guias'
        ? [{ rotulo: 'Guias', link: '/guias', ativo: true }]
        : guiasPublicados().length
          ? [{ rotulo: 'Guias', link: '/', fragmento: 'guias' }]
          : [];
    return [
      { rotulo: 'Simuladores', link: '/', fragmento: 'simuladores' },
      { rotulo: 'Como funciona', link: '/', fragmento: 'como-funciona' },
      ...guias,
      { rotulo: 'Dúvidas', link: '/', fragmento: 'duvidas' },
    ];
  });

  readonly menuAberto = signal(false);
}
