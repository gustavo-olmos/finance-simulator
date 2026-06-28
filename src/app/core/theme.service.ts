import { computed, Injectable, signal } from '@angular/core';
import { SistemaAmortizacao } from '../models/simulacao.model';

/**
 * Estado global do tema visual, derivado do sistema de amortização selecionado.
 * SAC = verde · PRICE = âmbar.
 *
 * Mantém o sistema como única fonte de verdade (usado tanto pelo cálculo quanto
 * pela cor). O AppComponent observa `cores()` e atualiza as variáveis CSS.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  /** Sistema de amortização atualmente selecionado. */
  readonly sistema = signal<SistemaAmortizacao>('SAC');

  /** Cores da zona principal derivadas do sistema. */
  readonly cores = computed(() =>
    this.sistema() === 'PRICE'
      ? { bg: '#b07a1e', ink: '#8a5e12' }
      : { bg: '#1f8a5b', ink: '#15623f' },
  );

  setSistema(sistema: SistemaAmortizacao): void {
    this.sistema.set(sistema);
  }
}
