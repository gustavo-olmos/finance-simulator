import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TemaId } from '../models/tema.model';

/** Última simulação do usuário, guardada por tema (imóvel e veículo têm prazos e taxas bem diferentes). */
export interface UltimaSimulacao {
  /** Valor do bem simulado na página do simulador (link "Voltar à minha simulação"). */
  valor?: number;
  /** Entrada como fração do valor do bem (0–1), para aplicar ao preço de cada anúncio. */
  entradaPct: number;
  prazoAnos: number;
  taxa: number;
  seguro: number;
}

const CHAVE = 'rotafin:simulacao:';

/**
 * Guarda a última simulação em localStorage para pré-preencher a página do anúncio
 * (e o "≈ R$ X/mês" dos cards dela). Tudo em try/catch: no SSR, em aba anônima ou com
 * armazenamento bloqueado, simplesmente não há simulação salva.
 */
@Injectable({ providedIn: 'root' })
export class UltimaSimulacaoService {
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));

  ler(tema: TemaId): UltimaSimulacao | null {
    if (!this.browser) return null;
    try {
      const s = JSON.parse(localStorage.getItem(CHAVE + tema) ?? 'null') as Partial<UltimaSimulacao> | null;
      const ok = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
      if (!s || !ok(s.entradaPct) || !ok(s.prazoAnos) || !ok(s.taxa)) return null;
      return {
        valor: ok(s.valor) ? s.valor : undefined,
        entradaPct: Math.min(1, Math.max(0, s.entradaPct)),
        prazoAnos: s.prazoAnos,
        taxa: s.taxa,
        seguro: ok(s.seguro) ? s.seguro : 0,
      };
    } catch {
      return null;
    }
  }

  /** Mescla com o que já estava salvo (a página do anúncio não sobrescreve o `valor`). */
  salvar(tema: TemaId, dados: UltimaSimulacao): void {
    if (!this.browser) return;
    try {
      const atual = this.ler(tema);
      localStorage.setItem(CHAVE + tema, JSON.stringify({ ...atual, ...dados, valor: dados.valor ?? atual?.valor }));
    } catch {
      // Armazenamento cheio ou bloqueado: segue sem salvar.
    }
  }
}
