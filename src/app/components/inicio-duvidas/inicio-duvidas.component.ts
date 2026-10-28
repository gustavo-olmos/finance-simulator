import { Component } from '@angular/core';
import { FAQ_INICIO } from '../../config/conteudo.config';

/** "Dúvidas frequentes" da página inicial (a página gera o JSON-LD FAQPage da mesma lista). */
@Component({
  selector: 'app-inicio-duvidas',
  standalone: true,
  templateUrl: './inicio-duvidas.component.html',
  styleUrl: './inicio-duvidas.component.scss',
})
export class InicioDuvidasComponent {
  readonly itens = FAQ_INICIO;
}
