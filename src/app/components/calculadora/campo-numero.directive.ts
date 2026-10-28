import { computed, Directive, ElementRef, inject, input, output, signal } from '@angular/core';

/**
 * Campo numérico digitável em pt-BR (`<input appNumero [appNumero]="valor()" (valorChange)="…">`).
 *
 * - Máscara durante a digitação: moeda ganha separador de milhar a cada tecla
 *   ("300000" → "300.000"); decimais aceitam uma vírgula (ponto vira vírgula) e no
 *   máximo `casas` dígitos depois dela. O cursor fica no mesmo lugar em relação aos dígitos.
 * - Emite `valorChange` a cada número válido e `confirmar` ao sair do campo, onde o pai
 *   aplica limites (ex.: entrada ≤ valor).
 *
 * Com `casas = 0` aceita só dígitos (moeda, anos); com `casas > 0`, decimais (taxa, seguro).
 */
@Directive({
  selector: 'input[appNumero]',
  standalone: true,
  host: {
    type: 'text',
    autocomplete: 'off',
    '[attr.inputmode]': 'casas() > 0 ? "decimal" : "numeric"',
    '[value]': 'texto()',
    '(focus)': 'onFocus()',
    '(input)': 'onInput($event)',
    '(blur)': 'onBlur()',
  },
})
export class CampoNumeroDirective {
  private readonly el = inject<ElementRef<HTMLInputElement>>(ElementRef);

  readonly valor = input.required<number>({ alias: 'appNumero' });
  readonly casas = input(0);
  readonly valorChange = output<number>();
  readonly confirmar = output<number>();

  private readonly focado = signal(false);
  private readonly rascunho = signal('');

  protected readonly texto = computed(() => {
    const r = this.rascunho();
    // Enquanto o texto digitado corresponde ao valor atual (ou está vazio), preserva o
    // rascunho ("10," no meio da digitação). Se o valor mudou por fora (slider, −/+), mostra o novo.
    if (this.focado() && (r.trim() === '' || this.parse(r) === this.valor())) return r;
    return this.formatar(this.valor());
  });

  onFocus(): void {
    this.rascunho.set(this.formatar(this.valor()));
    this.focado.set(true);
  }

  onInput(e: Event): void {
    const el = this.el.nativeElement;
    let bruto = el.value;
    let cursor = el.selectionStart ?? bruto.length;

    // Backspace/Delete sobre um separador de milhar não mudaria nada (a máscara o recolocaria):
    // apaga o dígito vizinho, como o usuário espera.
    const tipo = (e as InputEvent).inputType;
    if (this.casas() === 0 && this.digitos(bruto) === this.digitos(this.rascunho())) {
      if (tipo === 'deleteContentBackward' && cursor > 0) {
        bruto = bruto.slice(0, cursor - 1) + bruto.slice(cursor);
        cursor--;
      } else if (tipo === 'deleteContentForward') {
        bruto = bruto.slice(0, cursor) + bruto.slice(cursor + 1);
      }
    }

    const antes = [...bruto.slice(0, cursor)].filter((c) => this.significativo(c)).length;
    const txt = this.mascarar(bruto);
    if (txt !== el.value) {
      el.value = txt;
      const pos = this.posicao(txt, antes);
      el.setSelectionRange(pos, pos);
    }

    this.rascunho.set(txt);
    const v = this.parse(txt);
    if (!Number.isNaN(v)) this.valorChange.emit(v);
  }

  onBlur(): void {
    this.focado.set(false);
    this.confirmar.emit(this.valor());
  }

  private mascarar(txt: string): string {
    if (this.casas() === 0) {
      // Até 9 dígitos (R$ 999.999.999), sem zeros à esquerda.
      const d = this.digitos(txt).replace(/^0+(?=\d)/, '').slice(0, 9);
      return d === '' ? '' : Number(d).toLocaleString('pt-BR');
    }
    const s = txt.replace(/\./g, ',').replace(/[^\d,]/g, '');
    const [inteiro, ...resto] = s.split(',');
    const int = inteiro.replace(/^0+(?=\d)/, '').slice(0, 3);
    return resto.length ? `${int || '0'},${resto.join('').slice(0, this.casas())}` : int;
  }

  /** Posição logo após o n-ésimo caractere significativo do texto mascarado. */
  private posicao(txt: string, n: number): number {
    if (n <= 0) return 0;
    let conta = 0;
    for (let i = 0; i < txt.length; i++) {
      if (this.significativo(txt[i]) && ++conta === n) return i + 1;
    }
    return txt.length;
  }

  /**
   * Caracteres que contam para a posição do cursor: dígitos e, nos decimais, o separador
   * (o ponto digitado vira vírgula). Na moeda o ponto é separador de milhar e não conta.
   */
  private significativo(c: string): boolean {
    return this.casas() > 0 ? /[\d,.]/.test(c) : /\d/.test(c);
  }

  private digitos(txt: string): string {
    return txt.replace(/\D/g, '');
  }

  private parse(txt: string): number {
    if (this.casas() === 0) {
      const d = this.digitos(txt);
      return d === '' ? NaN : Number(d);
    }
    const limpo = txt.replace(',', '.').replace(/[^\d.]/g, '');
    return limpo === '' ? NaN : parseFloat(limpo);
  }

  private formatar(v: number): string {
    return this.casas() === 0
      ? Math.round(v || 0).toLocaleString('pt-BR')
      : (v || 0).toLocaleString('pt-BR', { maximumFractionDigits: this.casas(), useGrouping: false });
  }
}
