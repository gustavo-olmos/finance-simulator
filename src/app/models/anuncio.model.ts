import { TemaId } from './tema.model';

/**
 * Contrato de dados do anúncio (requisito 3.4 da spec).
 * Chaves estritas e tipos primitivos equivalentes a colunas SQL, para futura
 * portabilidade a um banco relacional (ex.: Supabase/PostgreSQL).
 * Campos opcionais equivalem a colunas NULL: a interface esconde o que não vier preenchido.
 */
export interface Anuncio {
  id: string;          // UUID PRIMARY KEY
  titulo: string;      // VARCHAR/TEXT NOT NULL
  slug: string;        // VARCHAR UNIQUE NOT NULL (uso em rotas SEO)
  categoria: TemaId;   // VARCHAR NOT NULL ('imovel' | 'veiculo') — em qual simulador aparece
  preco: number;       // NUMERIC/DECIMAL NOT NULL
  descricao: string;   // TEXT NOT NULL
  imagem_url: string;  // VARCHAR/TEXT para tags og:image
  criado_em: string;   // TIMESTAMPTZ (ISO 8601)

  // Localização e características (NULL quando não se aplica ou não informado)
  bairro?: string | null;     // VARCHAR
  cidade?: string | null;     // VARCHAR
  quartos?: number | null;    // SMALLINT (imóvel)
  area_m2?: number | null;    // NUMERIC (imóvel)
  ano?: number | null;        // SMALLINT (veículo)
  km?: number | null;         // INTEGER (veículo)

  // Anunciante
  anunciante_nome?: string | null;  // VARCHAR
  /** Telefone com DDI e DDD, só dígitos (ex.: 5511999999999) — usado no link wa.me. */
  whatsapp?: string | null;         // VARCHAR
}
