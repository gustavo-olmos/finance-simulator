import { Component, computed, input } from '@angular/core';
import { TAXAS_REFERENCIA, taxasDoTema } from '../../config/conteudo.config';
import { TemaId } from '../../models/tema.model';

/** "Qual taxa de juros colocar?": cards de referência (destino do link "Qual taxa usar?"). */
@Component({
  selector: 'app-taxas-referencia',
  standalone: true,
  template: `
    @if (itens().length) {
      <section id="taxas" class="wrap secao" aria-labelledby="taxas-titulo">
        <h2 id="taxas-titulo">Qual taxa de juros colocar?</h2>
        <p class="intro">
          Sem proposta do banco ainda? Use uma referência.
          @if (atualizadoEm()) { Atualizado em {{ atualizadoEm() }}. }
        </p>
        <div class="cards">
          @for (t of itens(); track t.rotulo) {
            <div class="card">
              <p class="rotulo">{{ t.rotulo }}</p>
              <p class="faixa">{{ t.faixa }}% a.a.</p>
              @if (t.fonte) { <p class="fonte">Fonte: {{ t.fonte }}</p> }
            </div>
          }
        </div>
      </section>
    }
  `,
  styles: `
    :host { display: block; }
    .secao { padding-top: 48px; padding-bottom: 24px; scroll-margin-top: 120px; }
    h2 {
      margin: 0 0 6px;
      font-family: var(--fonte-titulo);
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.4px;
    }
    p { margin: 0; }
    .intro { margin-bottom: 20px; font-size: 16px; color: var(--texto-2); }
    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 12px;
    }
    .card { border: 1px solid var(--borda); border-radius: 14px; padding: 18px; }
    .rotulo { margin-bottom: 4px; font-size: 14px; font-weight: 600; color: var(--texto-aux); }
    .faixa { font-family: var(--fonte-titulo); font-size: 24px; font-weight: 700; }
    .fonte { margin-top: 4px; font-size: 13px; color: var(--texto-aux); }
    @media (max-width: 760px) {
      .secao { padding-top: 28px; padding-bottom: 8px; }
      h2 { font-size: 23px; letter-spacing: 0; }
      .intro { margin-bottom: 14px; font-size: 15px; }
    }
  `,
})
export class TaxasReferenciaComponent {
  readonly tema = input.required<TemaId>();
  readonly itens = computed(() => taxasDoTema(this.tema()));
  readonly atualizadoEm = computed(() => TAXAS_REFERENCIA[this.tema()].atualizadoEm);
}
