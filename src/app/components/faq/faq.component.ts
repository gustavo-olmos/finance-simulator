import { Component } from '@angular/core';

interface ItemFaq {
  q: string;
  a: string;
}

/** Perguntas frequentes (conteúdo de SEO). */
@Component({
  selector: 'app-faq',
  standalone: true,
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss',
})
export class FaqComponent {
  readonly itens: ItemFaq[] = [
    {
      q: 'Para qual tipo de financiamento serve?',
      a: 'Imóvel, veículo, crédito com garantia e outros financiamentos com parcelas mensais. Basta informar valor, entrada, prazo e taxa.',
    },
    {
      q: 'A taxa de juros é mensal ou anual?',
      a: 'Você informa a taxa anual e o simulador converte para a taxa mensal equivalente automaticamente.',
    },
    {
      q: 'Os valores são exatos?',
      a: 'São estimativas para fins de comparação. As condições reais variam conforme a instituição financeira e o seu perfil.',
    },
    {
      q: 'Preciso me cadastrar?',
      a: 'Não. O cálculo é gratuito, instantâneo e não exige nenhum dado pessoal.',
    },
  ];
}
