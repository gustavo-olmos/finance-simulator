import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { guiasPublicados } from '../../config/conteudo.config';

/**
 * Cabeçalho da página inicial (docs/landingpage/): logotipo, âncoras das seções e
 * "Simular agora"; no celular, menu sanduíche. Os links são "/" + âncora, então o
 * cabeçalho funciona também em outras páginas no mesmo visual (ex.: blog).
 */
@Component({
  selector: 'app-inicio-topo',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './inicio-topo.component.html',
  styleUrl: './inicio-topo.component.scss',
})
export class InicioTopoComponent {
  readonly secoes = [
    { id: 'simuladores', rotulo: 'Simuladores' },
    { id: 'como-funciona', rotulo: 'Como funciona' },
    ...(guiasPublicados().length ? [{ id: 'guias', rotulo: 'Guias' }] : []),
    { id: 'duvidas', rotulo: 'Dúvidas' },
  ];

  readonly menuAberto = signal(false);
}
