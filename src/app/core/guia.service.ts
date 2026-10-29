import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, of, shareReplay, switchMap } from 'rxjs';
import type { Guia } from '../config/conteudo.config';
import { GuiaCompleto, GuiaResumo } from '../models/guia.model';

/** Card de um guia (mesmo formato dos cards da página inicial). */
export function cardDoGuia(g: GuiaResumo): Guia {
  return { tag: g.tag, tom: g.tom, titulo: g.titulo, resumo: g.resumo, url: `/guias/${g.slug}` };
}

/**
 * Lê os guias gerados no build (scripts/build-blog.mjs) em assets/data/guias/. Mesmo
 * padrão do AnuncioService: com provideClientHydration, o que o SSR leu passa para o
 * navegador sem nova requisição.
 */
@Injectable({ providedIn: 'root' })
export class GuiaService {
  private readonly http = inject(HttpClient);
  private readonly base = 'assets/data/guias';

  private readonly guias$: Observable<GuiaResumo[]> = this.http.get<GuiaResumo[]>(`${this.base}/index.json`).pipe(
    catchError(() => of([])),
    shareReplay({ bufferSize: 1, refCount: false }),
  );

  /** Todos os guias do build, mais recente primeiro (rascunhos só fora de produção). */
  getTodos(): Observable<GuiaResumo[]> {
    return this.guias$;
  }

  /**
   * undefined = guia inexistente. Confere o slug na lista antes de buscar o arquivo:
   * um .json que não existe cairia no SSR (rewrite da Vercel) em vez de dar 404.
   */
  getPorSlug(slug: string): Observable<GuiaCompleto | undefined> {
    return this.guias$.pipe(
      switchMap((lista) =>
        lista.some((g) => g.slug === slug)
          ? this.http.get<GuiaCompleto>(`${this.base}/${slug}.json`).pipe(catchError(() => of(undefined)))
          : of(undefined),
      ),
    );
  }
}
