import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

export interface MetadadosSeo {
  titulo: string;
  descricao: string;
  imagem?: string;
  /** Caminho da rota (ex.: /anuncios/apartamento-2-quartos-centro). */
  canonicalPath?: string;
  /** og:type. Padrão: website. */
  tipo?: 'website' | 'article';
  /** Última atualização (AAAA-MM-DD) de um article: vira article:modified_time. */
  modificadoEm?: string;
  /** Pede aos buscadores para não indexar (rascunhos, página não encontrada). */
  noindex?: boolean;
}

/**
 * Serviço de SEO técnico (requisito 3.3).
 * Injeta title, description, Open Graph e canonical no HTML — preenchidos no
 * servidor (SSR) para indexação eficiente.
 *
 * Ajuste ORIGIN para o domínio de produção (usado nas URLs canônicas/og).
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);

  readonly ORIGIN = 'https://www.rotafin.com.br';

  aplicar(dados: MetadadosSeo): void {
    this.title.setTitle(dados.titulo);
    this.meta.updateTag({ name: 'description', content: dados.descricao });

    this.meta.updateTag({ property: 'og:title', content: dados.titulo });
    this.meta.updateTag({ property: 'og:description', content: dados.descricao });
    this.meta.updateTag({ property: 'og:type', content: dados.tipo ?? 'website' });

    // Cada página chama aplicar(): o que não vale para ela é removido (navegação no navegador).
    if (dados.tipo === 'article' && dados.modificadoEm) {
      this.meta.updateTag({ property: 'article:modified_time', content: dados.modificadoEm });
    } else {
      this.meta.removeTag("property='article:modified_time'");
    }

    if (dados.noindex) {
      this.meta.updateTag({ name: 'robots', content: 'noindex' });
    } else {
      this.meta.removeTag("name='robots'");
    }

    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: dados.titulo });
    this.meta.updateTag({ name: 'twitter:description', content: dados.descricao });

    if (dados.imagem) {
      this.meta.updateTag({ property: 'og:image', content: dados.imagem });
      this.meta.updateTag({ name: 'twitter:image', content: dados.imagem });
    }

    const url = dados.canonicalPath ? this.ORIGIN + dados.canonicalPath : undefined;
    if (url) {
      this.meta.updateTag({ property: 'og:url', content: url });
      this.setCanonical(url);
    }
  }

  /** Imagem de compartilhamento, sempre 1200×630 (a do /api/og é PNG). */
  setOgImage(url: string, tipo = 'image/png'): void {
    this.meta.updateTag({ property: 'og:image',        content: url });
    this.meta.updateTag({ property: 'og:image:width',  content: '1200' });
    this.meta.updateTag({ property: 'og:image:height', content: '630' });
    this.meta.updateTag({ property: 'og:image:type',   content: tipo });
    this.meta.updateTag({ name: 'twitter:card',  content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:image', content: url });
  }

  injetarJsonLd(id: string, schema: object): void {
    const scriptId = `ld-json-${id}`;
    let script = this.doc.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = this.doc.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('id', scriptId);
      this.doc.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema);
  }

  private setCanonical(href: string): void {
    let link = this.doc.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', href);
  }
}
