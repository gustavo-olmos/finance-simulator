import { computed, inject, Injectable, signal } from '@angular/core';
import { track } from '@vercel/analytics';
import { FinanceCalculatorService } from './finance-calculator.service';
import { getTema } from '../config/temas.config';
import { TemaConfig } from '../models/tema.model';
import { ParametrosSimulacao } from '../models/simulacao.model';
import { UltimaSimulacao } from './ultima-simulacao.service';

export type ModoCalculadora = 'valor' | 'renda';

/** Valores iniciais aceitos pelo store (vindos da URL ou do preço de um anúncio). */
export interface IniciaisSimulacao {
  valorBem?: number | null;
  entrada?: number | null;
  prazoMeses?: number | null;
  taxaAnual?: number | null;
  seguroMensal?: number | null;
}

/**
 * Estado da simulação da página (calculadora, card de resultado, barra fixa e, nas
 * próximas seções, ofertas/gráfico/tabela). Fornecido no componente da página
 * (`providers: [SimulacaoStore]`), não na raiz — cada página tem a sua simulação.
 *
 * O cálculo continua no FinanceCalculatorService; aqui só ficam os signals de
 * entrada e os `computed` que derivam o resultado (requisito 3.2).
 */
@Injectable()
export class SimulacaoStore {
  private readonly calc = inject(FinanceCalculatorService);

  readonly tema = signal<TemaConfig>(getTema('imovel'));
  readonly modo = signal<ModoCalculadora>('valor');

  // Campos da calculadora. O prazo fica em anos na tela; o motor recebe meses.
  readonly valor = signal(0);
  readonly entrada = signal(0);
  readonly prazoAnos = signal(0);
  readonly taxa = signal(0);
  readonly seguro = signal(0);
  readonly parcelaMax = signal(0);

  /** true enquanto algum campo da calculadora tem foco (a barra fixa do celular se esconde). */
  readonly editando = signal(false);

  readonly prazoMeses = computed(() => Math.round(this.prazoAnos() * 12));
  readonly taxaMensal = computed(() => this.calc.taxaMensalPercentual(this.taxa()));
  readonly prazoMaxAnos = computed(() => Math.floor(this.tema().faixas.prazoMax / 12));

  /** Modo "Sei quanto posso pagar": valor máximo do bem em cada sistema (financiável + entrada). */
  readonly maximos = computed(() => {
    if (this.modo() !== 'renda') return null;
    const args = [this.parcelaMax(), this.prazoMeses(), this.taxa()] as const;
    return {
      sac: this.calc.calcularPrincipalMaximo(...args, 'SAC', this.seguro()) + this.entrada(),
      price: this.calc.calcularPrincipalMaximo(...args, 'PRICE', this.seguro()) + this.entrada(),
    };
  });

  /**
   * Parâmetros efetivos da simulação. No modo renda segue a referência do design:
   * simula o financiamento máximo do PRICE (o maior dos dois).
   */
  readonly parametros = computed<ParametrosSimulacao>(() => ({
    valorBem: this.maximos()?.price ?? this.valor(),
    entrada: this.entrada(),
    taxaAnual: this.taxa(),
    prazoMeses: this.prazoMeses(),
    seguroMensal: this.seguro(),
  }));

  readonly resultado = computed(() => this.calc.simularAmbos(this.parametros()));

  /**
   * Resumo por ano de contrato (gráfico e tabela "Parcelas ano a ano"): parcela do 1º mês
   * de cada ano em cada sistema e o saldo devedor do SAC ao fim do ano.
   */
  readonly anos = computed(() => {
    const { sac, price } = this.resultado();
    const linhas: { ano: number; sac: number; price: number; saldo: number }[] = [];
    for (let k = 0; k < sac.parcelas.length; k += 12) {
      const fimDoAno = sac.parcelas[Math.min(k + 11, sac.parcelas.length - 1)];
      linhas.push({
        ano: k / 12 + 1,
        sac: sac.parcelas[k].parcela,
        price: price.parcelas[k].parcela,
        saldo: fimDoAno.saldoDevedor,
      });
    }
    return linhas;
  });

  /** Entrada como fração do valor do bem — aplicada ao preço de cada anúncio ("≈ R$ X/mês com sua entrada"). */
  readonly entradaFracao = computed(() => {
    const p = this.parametros();
    return p.valorBem > 0 ? Math.min(1, p.entrada / p.valorBem) : 0;
  });

  /** Resumo guardado em localStorage como "última simulação" (UltimaSimulacaoService). */
  readonly ultimaSimulacao = computed<UltimaSimulacao>(() => ({
    valor: Math.round(this.parametros().valorBem),
    entradaPct: this.entradaFracao(),
    prazoAnos: this.prazoAnos(),
    taxa: this.taxa(),
    seguro: this.seguro(),
  }));

  /** Query params da simulação (prefill e compartilhamento). O prazo segue em meses na URL. */
  readonly queryParams = computed(() => {
    const p = this.parametros();
    return {
      valor: Math.round(p.valorBem),
      entrada: Math.round(p.entrada),
      prazo: p.prazoMeses,
      taxa: p.taxaAnual,
      seguro: p.seguroMensal ?? 0,
    };
  });

  /** Teto de preço usado no CTA "Ver imóveis de até…" e, depois, no filtro das ofertas. */
  readonly faixaMax = computed(() => {
    const m = this.maximos();
    return m ? Math.max(m.sac, m.price) : this.valor();
  });

  inicializar(tema: TemaConfig, iniciais: IniciaisSimulacao = {}): void {
    const d = tema.defaults;
    const valor = iniciais.valorBem ?? d.valorBem;
    this.tema.set(tema);
    this.valor.set(valor);
    this.entrada.set(iniciais.entrada ?? Math.round(valor * (d.entrada / d.valorBem)));
    this.prazoAnos.set(Math.max(1, Math.round((iniciais.prazoMeses ?? d.prazoMeses) / 12)));
    this.taxa.set(iniciais.taxaAnual ?? d.taxaAnual);
    this.seguro.set(iniciais.seguroMensal ?? 0);
    this.parcelaMax.set(tema.parcelaPadrao);
  }

  // Dispara uma vez por carregamento, na primeira mexida do usuário em qualquer campo
  // (não conta o preenchimento vindo da URL) — evita contar quem usou o simulador como bounce.
  readonly interagiu = signal(false);
  registrarInteracao(): void {
    if (this.interagiu()) return;
    this.interagiu.set(true);
    track('simulacao_interacao', { tema: this.tema().id, modo: this.modo() });
  }

  passoPrazo(delta: number): void {
    this.prazoAnos.set(this.limitar(this.prazoAnos() + delta, 1, this.prazoMaxAnos()));
  }

  passoTaxa(delta: number): void {
    const f = this.tema().faixas;
    this.taxa.set(this.limitar(Math.round((this.taxa() + delta) * 10) / 10, f.taxaMin, f.taxaMax));
  }

  limitar(v: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, v));
  }
}
