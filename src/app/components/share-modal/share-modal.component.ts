import { Component, inject, input, output, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { DOCUMENT } from '@angular/common';
import { ResultadoSimulacao } from '../../models/simulacao.model';

@Component({
  selector: 'app-share-modal',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './share-modal.component.html',
  styleUrl: './share-modal.component.scss',
})
export class ShareModalComponent {
  private readonly doc = inject(DOCUMENT);

  readonly resultado = input.required<ResultadoSimulacao>();
  readonly fechar = output<void>();

  readonly copiado = signal(false);

  async copiarLink(): Promise<void> {
    await navigator.clipboard.writeText(this.doc.location.href);
    this.copiado.set(true);
    setTimeout(() => { this.copiado.set(false); this.fechar.emit(); }, 1500);
  }

  async compartilhar(): Promise<void> {
    const url = this.doc.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Simulação de financiamento — Simulae', url });
        this.fechar.emit();
        return;
      }
    } catch { /* usuário cancelou */ }
    await this.copiarLink();
  }
}
