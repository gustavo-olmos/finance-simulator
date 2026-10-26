import { Component, computed, input } from '@angular/core';
import { faqDoTema } from '../../config/conteudo.config';
import { TemaId } from '../../models/tema.model';

/** Perguntas frequentes (conteúdo de SEO). A mesma lista gera o JSON-LD FAQPage da página. */
@Component({
  selector: 'app-faq',
  standalone: true,
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss',
})
export class FaqComponent {
  readonly tema = input.required<TemaId>();
  readonly itens = computed(() => faqDoTema(this.tema()));
}
