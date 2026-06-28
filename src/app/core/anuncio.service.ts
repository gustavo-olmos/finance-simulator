import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';
import { Anuncio } from '../models/anuncio.model';

/**
 * Serviço de dados (requisito 3.4). Lê o arquivo estático anuncios.json
 * (mock de banco). Com provideClientHydration + HttpClient/fetch, o resultado
 * é transferido do SSR para o cliente sem nova requisição (sem flicker).
 *
 * Portabilidade: trocar a URL local por um endpoint REST/Supabase mantém a
 * mesma interface `Anuncio`, sem alterar os componentes.
 */
@Injectable({ providedIn: 'root' })
export class AnuncioService {
  private readonly http = inject(HttpClient);
  private readonly url = 'assets/data/anuncios.json';

  private readonly anuncios$: Observable<Anuncio[]> = this.http
    .get<Anuncio[]>(this.url)
    .pipe(shareReplay({ bufferSize: 1, refCount: false }));

  getTodos(): Observable<Anuncio[]> {
    return this.anuncios$;
  }

  getPorSlug(slug: string): Observable<Anuncio | undefined> {
    return this.anuncios$.pipe(map((lista) => lista.find((a) => a.slug === slug)));
  }
}
