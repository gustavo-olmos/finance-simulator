import { computed, Directive, ElementRef, inject, input, output, signal } from '@angular/core';

/**
 * Campo numérico digitável em pt-BR (`<input appNumero [appNumero]="valor()" (valorChange)="…">`).
 *
 * - Fora de foco mostra o valor formatado ("300.000", "10,5").
 * - Durante a digitação mantém o texto do usuário (não reformata a cada tecla, para não
 *   pular o cursor nem apagar a vírgula de "10,") e emite `valorChange` a cada número válido.
 * - Ao sair do campo emite `confirmar`, onde o pai aplica limites (ex.: entrada ≤ valor).
 *
 * Com `casas = 0` aceita só dígitos (moeda, anos); com `casas > 0` aceita vírgula ou ponto
 * como separador decimal (taxa, seguro).
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
    '(input)': 'onInput()',
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
    // rascunho. Se o valor mudou por fora (slider, botões −/+), mostra o novo valor.
    if (this.focado() && (r.trim() === '' || this.parse(r) === this.valor())) return r;
    return this.formatar(this.valor());
  });

  onFocus(): void {
    this.rascunho.set(this.formatar(this.valor()));
    this.focado.set(true);
  }

  onInput(): void {
    const txt = this.el.nativeElement.value;
    this.rascunho.set(txt);
    const v = this.parse(txt);
    if (!Number.isNaN(v)) this.valorChange.emit(v);
  }

  onBlur(): void {
    this.focado.set(false);
    this.confirmar.emit(this.valor());
  }

  private parse(txt: string): number {
    if (this.casas() === 0) {
      const digitos = txt.replace(/\D/g, '');
      return digitos === '' ? NaN : Number(digitos);
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
