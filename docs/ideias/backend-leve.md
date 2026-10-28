# Backend leve

**Status:** ideia. É a base para [anunciantes-e-metricas.md](anunciantes-e-metricas.md) e [avaliacao-de-imoveis.md](avaliacao-de-imoveis.md); não é necessário para a landing nem para o blog.

## Para que serve

- Gravar eventos por anúncio (impressões, cliques, leads) num banco próprio, para o relatório do anunciante.
- Gravar avaliações dos visitantes.
- Cadastrar anunciantes e anúncios fora do `anuncios.json`.
- Guardar as fotos dos anúncios.

## Escolha: Supabase

- O modelo [anuncio.model.ts](../../src/app/models/anuncio.model.ts) e a [ARCHITECTURE.md](../../ARCHITECTURE.md) já foram pensados para migrar para Supabase/PostgreSQL (colunas e tipos SQL comentados).
- Cobre banco (Postgres), armazenamento de fotos (Storage) e, no futuro, login de anunciante (Auth).
- O [anuncio.service.ts](../../src/app/core/anuncio.service.ts) foi isolado para trocar a fonte de dados sem mexer nos componentes.
- Plano grátis: conferir os limites atuais (projetos inativos podem ser pausados).

## Arquitetura

- **Escritas passam pelo servidor Express que já existe** ([server.ts](../../src/server.ts), rodando na Vercel via [api/index.mjs](../../api/index.mjs)):
  - `POST /api/eventos` e `POST /api/avaliacoes`
  - a chave secreta do Supabase fica só no servidor;
  - validação dos dados e limite de envios por IP ficam ali.
- **Leituras de anúncios** no SSR, com cache na CDN (`s-maxage` + `stale-while-revalidate`) para não consultar o banco a cada visita.
- **Sessão anônima sem tabela:** um UUID aleatório no `localStorage`, enviado junto com cada evento. Nada além disso.

## Tabelas mínimas (rascunho)

```sql
anunciantes (
  id uuid primary key,
  nome text not null,
  creci text,
  logo_url text,
  site text,
  whatsapp text,
  telefone text,
  token_relatorio text unique,   -- link privado do relatório, sem login
  criado_em timestamptz default now()
)

anuncios (
  -- mesmas colunas da interface Anuncio de hoje, trocando os campos anunciante_* por:
  anunciante_id uuid references anunciantes,
  ativo boolean default true
)

eventos (
  id bigint generated always as identity primary key,
  tipo text not null,            -- impressao | oferta_click | pageview | simulacao | lead_whatsapp | lead_telefone | lead_site
  anuncio_id uuid references anuncios,
  sessao_id uuid not null,
  origem text,                   -- card | pagina | ...
  entrada numeric,               -- perfil financeiro do interessado no momento do evento
  prazo_meses smallint,
  parcela numeric,
  ref text,                      -- código curto da mensagem do WhatsApp, se adotado
  criado_em timestamptz default now()
)

avaliacoes (
  anuncio_id uuid references anuncios,
  sessao_id uuid not null,
  pergunta text not null,
  resposta text not null,        -- sim | podia_melhor | nao | nao_sei | caro | justo | barato ...
  criado_em timestamptz default now(),
  primary key (anuncio_id, sessao_id, pergunta)
)
```

Fotos: Supabase Storage, com a URL pública salva em `anuncios.imagem_url` e `anuncios.fotos`.

## O que NÃO construir agora

- Login de anunciante.
- Upload de fotos pelo próprio anunciante.
- Painel do anunciante.

Enquanto houver poucos anunciantes, você é o administrador: cadastra pelo painel do Supabase (Studio) e o relatório sai de uma view SQL. O relatório vai como **link privado por anunciante** (`/relatorio/:token`) ou PDF mensal.

## Relação com o Vercel Analytics

Manter o Vercel Analytics para as suas visitas e páginas vistas. Os eventos por anunciante vão para a tabela `eventos`, que você controla, separa por imobiliária e guarda pelo tempo que quiser. Mesmo assim, o uso comercial provavelmente exige o plano Pro do Vercel (ver [README.md](README.md)).

## Decisões em aberto

- [ ] Quando começar (sugestão: com o primeiro anunciante real do piloto).
- [ ] Migrar todos os anúncios para o banco de uma vez ou manter o JSON para os fictícios.
- [ ] Relatório: link privado ou PDF.
- [ ] Política de retenção dos eventos (LGPD).
