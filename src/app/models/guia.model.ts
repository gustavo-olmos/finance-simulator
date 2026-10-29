/**
 * Guias (blog). Os posts são escritos em src/content/blog/*.md e convertidos no build
 * por scripts/build-blog.mjs para assets/data/guias/ (index.json e <slug>.json).
 */
export interface GuiaResumo {
  slug: string;
  titulo: string;
  descricao: string;
  /** Etiqueta do card (ex.: 'Renda'). */
  tag: string;
  tom: 'ambar' | 'verde';
  /** Texto do card e subtítulo do post. */
  resumo: string;
  /** AAAA-MM-DD */
  atualizadoEm: string;
  /** AAAA-MM-DD; sem o campo no .md, igual a atualizadoEm. */
  publicadoEm: string;
  /** Rascunhos só existem fora de produção (npm start e prévias da Vercel). */
  rascunho: boolean;
  /** Minutos. */
  tempoLeitura: number;
}

export interface SecaoGuia {
  id: string;
  titulo: string;
}

/** Imagem de capa (campos capa/capaAlt/capaCredito do post), já otimizada no build. */
export interface CapaGuia {
  /** Versão menor (740 px), para navegadores sem srcset. */
  src: string;
  srcset: string;
  /** Tamanho da maior versão (16:9), para reservar o espaço antes de carregar. */
  largura: number;
  altura: number;
  /** 1200×630, para o compartilhamento. */
  og: string;
  alt: string;
  /** Crédito da foto (ex.: banco de imagens). Vazio = sem legenda. */
  credito: string;
}

/** Chamada final para o simulador (campo cta do post). */
export interface CtaGuia {
  titulo: string;
  subtitulo: string;
  texto: string;
  /** Caminho do site, com os parâmetros da simulação. */
  url: string;
}

export interface GuiaCompleto extends GuiaResumo {
  tituloSeo: string;
  capa: CapaGuia | null;
  cta: CtaGuia | null;
  /** Títulos ## do post (índice "Nesta página"). */
  secoes: SecaoGuia[];
  /** HTML do primeiro parágrafo, sem o rótulo "Resposta curta:". Vazio = sem bloco. */
  respostaCurta: string;
  html: string;
  /** HTML do que vem depois do último --- (fontes, avisos). */
  notas: string;
}
