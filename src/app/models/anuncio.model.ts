/**
 * Contrato de dados do anúncio (requisito 3.4 da spec).
 * Chaves estritas e tipos primitivos equivalentes a colunas SQL, para futura
 * portabilidade a um banco relacional (ex.: Supabase/PostgreSQL).
 */
export interface Anuncio {
  id: string;          // UUID PRIMARY KEY
  titulo: string;      // VARCHAR/TEXT NOT NULL
  slug: string;        // VARCHAR UNIQUE NOT NULL (uso em rotas SEO)
  preco: number;       // NUMERIC/DECIMAL NOT NULL
  descricao: string;   // TEXT NOT NULL
  imagem_url: string;  // VARCHAR/TEXT para tags og:image
  criado_em: string;   // TIMESTAMPTZ (ISO 8601)
}
