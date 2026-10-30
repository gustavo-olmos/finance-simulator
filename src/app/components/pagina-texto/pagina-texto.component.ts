import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InicioTopoComponent } from '../inicio-topo/inicio-topo.component';
import { InicioRodapeComponent } from '../inicio-rodape/inicio-rodape.component';

/**
 * Layout das páginas de texto (contato, privacidade, termos): cabeçalho e rodapé da
 * página inicial e o mesmo topo dos guias. O conteúdo projetado usa a tipografia do
 * corpo dos guias (.artigo-corpo, em styles/_artigo.scss).
 */
@Component({
  selector: 'app-pagina-texto',
  standalone: true,
  imports: [DatePipe, RouterLink, InicioTopoComponent, InicioRodapeComponent],
  templateUrl: './pagina-texto.component.html',
  styleUrl: './pagina-texto.component.scss',
})
export class PaginaTextoComponent {
  readonly titulo = input.required<string>();
  readonly intro = input('');
  /** AAAA-MM-DD. Vazio = sem data no topo. */
  readonly atualizadoEm = input('');
}
