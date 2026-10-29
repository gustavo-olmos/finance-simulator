// Gera os guias (blog) a partir de src/content/blog/*.md. Roda antes do build e do
// start (prebuild/prestart); o Angular só consome os arquivos gerados:
//
//   src/assets/data/guias/index.json     lista (sem o HTML), mais recente primeiro
//   src/assets/data/guias/<slug>.json    metadados + HTML do post
//   src/app/config/guias.generated.ts    cards publicados da página inicial
//   src/sitemap.xml                      páginas fixas + anúncios + guias publicados
//
// Rascunhos (status: rascunho) entram só fora de produção (VERCEL_ENV !== 'production'):
// aparecem em `npm start` e nas prévias da Vercel, nunca no sitemap nem nos cards.
//
// Marcação além do Markdown (GFM):
//   - 1º parágrafo começando com **Resposta curta:** → bloco "Resposta curta" do topo.
//   - Parágrafo começando com "Premissas:" → texto menor, em cinza.
//   - > [!destaque] ≈ R$ 3 mil | de renda para cada **R$ 100 mil**   → número em destaque
//   - > [!conta] R$ 2.763 ÷ 0,30 = R$ 9.210 de renda                → conta em linha
//   - > [!atalho] /caminho | Título | Texto                          → card de atalho
//   - Tabelas: SAC/Price no cabeçalho viram chip (na 1ª coluna de cada sistema; nas
//     seguintes, saem do texto). Colunas "Renda…" de um sistema, ou com o cabeçalho em
//     **negrito**, ficam na cor do sistema.
//   - O que vier depois do último --- são as notas (fontes, avisos), exibidas depois
//     da chamada final.
//
// Capa (opcional): `capa` é uma imagem ao lado do .md (jpg, png, webp ou svg) e
// `capaAlt` descreve a imagem. Sai cortada em 16:9 (740 e 1480 px, webp) e em 1200×630
// (jpg) para o compartilhamento, em src/assets/guias/.

import { access, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { Marked } from 'marked';
import sharp from 'sharp';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const ORIGEM = join(RAIZ, 'src/content/blog');
const SAIDA_DADOS = join(RAIZ, 'src/assets/data/guias');
const SAIDA_IMAGENS = join(RAIZ, 'src/assets/guias');
const SAIDA_CARDS = join(RAIZ, 'src/app/config/guias.generated.ts');
const SAIDA_SITEMAP = join(RAIZ, 'src/sitemap.xml');
const ANUNCIOS = join(RAIZ, 'src/assets/data/anuncios.json');
const SITE = 'https://www.rotafin.com.br';

const COM_RASCUNHOS = process.env.VERCEL_ENV !== 'production';

// Nome de arquivo simples, na própria pasta dos posts.
const CAPA_VALIDA = /^[\w.-]+\.(jpe?g|png|webp|svg)$/i;

// Páginas fixas do sitemap (lastmod mantido à mão, como no sitemap estático anterior).
const PAGINAS = [
  { caminho: '/', lastmod: '2026-10-28' },
  { caminho: '/financiamento-imovel', lastmod: '2026-07-04' },
  { caminho: '/financiamento-veiculo', lastmod: '2026-07-04' },
];

// Chamada final quando o post não define cta.titulo / cta.subtitulo.
const CTA_PADRAO = {
  titulo: 'Faça a conta com os seus números',
  subtitulo: 'Parcela no SAC e na Price e a renda mínima estimada. Grátis e sem cadastro.',
};

// ids que a página já usa fora do artigo.
const IDS_RESERVADOS = ['topo', 'menu-inicio', 'conteudo'];

const SETA =
  '<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>';

const erros = [];

function escapar(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function paraSlug(texto) {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Texto puro de uma lista de tokens inline (para ids e para o índice). */
function textoPuro(tokens) {
  return tokens
    .map((t) => (t.tokens ? textoPuro(t.tokens) : t.text ?? ''))
    .join('')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

/** gray-matter (js-yaml) transforma AAAA-MM-DD em Date; aqui volta a ser texto. */
function data(v) {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return typeof v === 'string' ? v.trim() : v;
}

/** Cria o conversor de um post. `ctx` recebe as seções (##) e falhas de marcação. */
function criarConversor(ctx) {
  const marked = new Marked({ gfm: true });
  const usados = new Set(IDS_RESERVADOS);

  const idUnico = (texto) => {
    const base = paraSlug(texto) || 'secao';
    let id = base;
    for (let n = 2; usados.has(id); n++) id = `${base}-${n}`;
    usados.add(id);
    return id;
  };

  const inline = (md) => marked.parseInline(md.trim());

  const destinoValido = (href) => /^(https?:\/\/|mailto:|\/(?!\/)|#)/i.test(href);

  marked.use({
    renderer: {
      heading({ tokens, depth }) {
        const texto = textoPuro(tokens);
        if (depth === 1) {
          ctx.falhas.push(`"# ${texto}": use ## ou ### no corpo (o H1 vem do campo titulo)`);
          return '';
        }
        const html = this.parser.parseInline(tokens);
        if (depth > 3) return `<h${depth}>${html}</h${depth}>\n`;
        const id = idUnico(texto);
        if (depth === 2) ctx.secoes.push({ id, titulo: texto });
        return `<h${depth} id="${id}">${html}</h${depth}>\n`;
      },

      paragraph({ tokens, text }) {
        const classe = /^Premissas:/.test(text) ? ' class="premissa"' : '';
        return `<p${classe}>${this.parser.parseInline(tokens)}</p>\n`;
      },

      blockquote({ tokens, text }) {
        const m = text.trim().match(/^\[!([a-z]+)\]\s*([\s\S]*)$/i);
        if (!m) return `<blockquote>\n${this.parser.parse(tokens)}</blockquote>\n`;

        const tipo = m[1].toLowerCase();
        const partes = m[2].split('|').map((p) => p.trim());

        if (tipo === 'destaque') {
          if (partes.length !== 2) ctx.falhas.push(`[!destaque] precisa de "valor | texto": ${text.trim()}`);
          return `<div class="destaque"><span class="destaque-valor">${inline(partes[0])}</span><p>${inline(partes[1] ?? '')}</p></div>\n`;
        }

        if (tipo === 'conta') {
          const [conta, resultado] = m[2].split('=');
          if (resultado === undefined) {
            ctx.falhas.push(`[!conta] precisa de um "=": ${text.trim()}`);
            return '';
          }
          const termos = conta
            .trim()
            .split(/\s+([÷×+−-])\s+/)
            .map((t, i) => (i % 2 ? `<span class="conta-op">${escapar(t)}</span>` : `<span>${inline(t)}</span>`));
          return `<p class="conta">${termos.join('')}<span class="conta-op">=</span><span class="conta-resultado">${inline(resultado)}</span></p>\n`;
        }

        if (tipo === 'atalho') {
          const [href, titulo, descricao] = partes;
          if (!href || !titulo || !destinoValido(href)) {
            ctx.falhas.push(`[!atalho] precisa de "/caminho | Título | Texto": ${text.trim()}`);
            return '';
          }
          const desc = descricao ? `<span class="atalho-desc">${inline(descricao)}</span>` : '';
          return `<a class="atalho" href="${escapar(href)}"><span class="atalho-texto"><span class="atalho-titulo">${inline(titulo)}</span>${desc}</span>${SETA}</a>\n`;
        }

        ctx.falhas.push(`marcador desconhecido [!${m[1]}] (use destaque, conta ou atalho)`);
        return '';
      },

      table(token) {
        const colunas = token.header.length;
        let grupo = null; // último sistema (SAC/Price) visto nos cabeçalhos
        const classes = [];

        const ths = token.header.map((cell) => {
          let texto = cell.text.trim();
          const negrito = /^\*\*([\s\S]+)\*\*$/.exec(texto);
          if (negrito) texto = negrito[1].trim();

          const m = /\(?\b(SAC|Price)\b\)?/i.exec(texto);
          const sistema = m ? (m[1].toUpperCase() === 'SAC' ? 'sac' : 'price') : null;
          if (m) texto = (texto.slice(0, m.index) + texto.slice(m.index + m[0].length)).replace(/\s{2,}/g, ' ').trim();

          const chip = sistema && sistema !== grupo ? `<span class="chip chip-${sistema}">${sistema === 'sac' ? 'SAC' : 'Price'}</span> ` : '';
          if (sistema) grupo = sistema;

          const doSistema = sistema ?? grupo;
          const destaque = negrito || (/^renda\b/i.test(texto) && doSistema);
          classes.push(destaque ? `forte forte-${doSistema ?? 'sac'}` : '');

          return `<th scope="col">${chip}${inline(texto)}</th>`;
        });

        const linhas = token.rows.map(
          (linha) =>
            `<tr>${linha
              .map((cell, i) => `<td${classes[i] ? ` class="${classes[i]}"` : ''}>${this.parser.parseInline(cell.tokens)}</td>`)
              .join('')}</tr>`,
        );

        // Tabelas largas rolam de lado no celular; a dica só aparece nelas.
        const dica = colunas >= 4 ? '<p class="rolagem-dica">Deslize para ver tudo</p>\n' : '';
        return `${dica}<div class="tabela-rolagem" tabindex="0"><table><thead><tr>${ths.join('')}</tr></thead><tbody>${linhas.join('')}</tbody></table></div>\n`;
      },

      link({ href, title, tokens }) {
        const texto = this.parser.parseInline(tokens);
        if (!destinoValido(href)) {
          ctx.falhas.push(`link com destino não permitido: ${href}`);
          return texto;
        }
        // Links absolutos para o próprio site viram caminhos (navegação sem recarregar).
        const interno = /^https?:\/\/(www\.)?rotafin\.com\.br(\/|$)/i.exec(href);
        const destino = interno ? href.slice(interno[0].length - 1) || '/' : href;
        const externo = /^https?:\/\//i.test(destino);
        const t = title ? ` title="${escapar(title)}"` : '';
        const alvo = externo ? ' target="_blank" rel="noopener"' : '';
        return `<a href="${escapar(destino)}"${t}${alvo}>${texto}</a>`;
      },

      // HTML cru no .md sai como texto: só a marcação acima vira HTML.
      html({ text }) {
        ctx.falhas.push(`HTML cru não é permitido no post: ${text.trim().slice(0, 60)}`);
        return escapar(text);
      },
    },
  });

  return marked;
}

function validar(arquivo, d) {
  const falta = (campo) => erros.push(`${arquivo}: campo obrigatório "${campo}" ausente`);
  for (const campo of ['titulo', 'descricao', 'slug', 'tag', 'tom', 'resumo', 'status', 'atualizadoEm']) {
    if (d[campo] === undefined || d[campo] === null || String(d[campo]).trim() === '') falta(campo);
  }
  if (d.slug && d.slug !== basename(arquivo, '.md')) {
    erros.push(`${arquivo}: o nome do arquivo deve ser igual ao slug ("${d.slug}.md")`);
  }
  if (d.slug && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(d.slug)) {
    erros.push(`${arquivo}: slug "${d.slug}" deve ter só letras minúsculas, números e hífens`);
  }
  if (d.tom && !['ambar', 'verde'].includes(d.tom)) erros.push(`${arquivo}: tom deve ser "ambar" ou "verde"`);
  if (d.status && !['rascunho', 'publicado'].includes(d.status)) {
    erros.push(`${arquivo}: status deve ser "rascunho" ou "publicado"`);
  }
  for (const campo of ['atualizadoEm', 'publicadoEm', 'revisarEm']) {
    if (d[campo] && !/^\d{4}-\d{2}-\d{2}$/.test(d[campo])) erros.push(`${arquivo}: ${campo} deve estar no formato AAAA-MM-DD`);
  }
  if (d.cta) {
    if (!d.cta.texto) erros.push(`${arquivo}: cta.texto ausente`);
    if (!d.cta.url) erros.push(`${arquivo}: cta.url ausente`);
    else if (!String(d.cta.url).startsWith('/')) erros.push(`${arquivo}: cta.url deve ser um caminho do site (começar com /)`);
  }
  if (d.capa) {
    if (!CAPA_VALIDA.test(d.capa)) {
      erros.push(`${arquivo}: capa deve ser o nome de uma imagem jpg, png, webp ou svg na pasta dos posts`);
    }
    if (!d.capaAlt) erros.push(`${arquivo}: capaAlt é obrigatório com capa (descreva a imagem para quem não a vê)`);
  }
}

const LARGURAS_CAPA = [740, 1480];

/** Gera as versões da capa e devolve o que a página precisa (null = sem capa). */
async function gerarCapa(arquivo, d) {
  if (!d.capa || !d.capaAlt || !CAPA_VALIDA.test(d.capa)) return null;
  const origem = join(ORIGEM, d.capa);
  try {
    await access(origem);
  } catch {
    erros.push(`${arquivo}: imagem de capa não encontrada: src/content/blog/${d.capa}`);
    return null;
  }

  const base = `/assets/guias/${d.slug}`;
  try {
    for (const largura of LARGURAS_CAPA) {
      await sharp(origem)
        .resize(largura, Math.round((largura * 9) / 16), { fit: 'cover' })
        .webp({ quality: 80 })
        .toFile(join(SAIDA_IMAGENS, `${d.slug}-${largura}.webp`));
    }
    await sharp(origem)
      .resize(1200, 630, { fit: 'cover' })
      .flatten({ background: '#FFFFFF' })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(join(SAIDA_IMAGENS, `${d.slug}-og.jpg`));
  } catch (e) {
    erros.push(`${arquivo}: não foi possível processar a capa ${d.capa}: ${e.message.split('\n')[0]}`);
    return null;
  }

  const maior = LARGURAS_CAPA[LARGURAS_CAPA.length - 1];
  return {
    src: `${base}-${LARGURAS_CAPA[0]}.webp`,
    srcset: LARGURAS_CAPA.map((l) => `${base}-${l}.webp ${l}w`).join(', '),
    largura: maior,
    altura: Math.round((maior * 9) / 16),
    og: `${base}-og.jpg`,
    alt: d.capaAlt,
    credito: d.capaCredito || '',
  };
}

/** Separa a resposta curta (1º parágrafo) e as notas (depois do último ---) do corpo. */
function converter(arquivo, corpo) {
  const ctx = { secoes: [], falhas: [] };
  const marked = criarConversor(ctx);
  // "R$" não fica no fim de uma linha e o valor na seguinte.
  const tokens = marked.lexer(corpo.replace(/R\$ (?=\d)/g, 'R$ '));

  let respostaCurta = '';
  const primeiro = tokens.findIndex((t) => t.type !== 'space');
  const rotulo = /^\*\*Resposta curta:?\*\*:?\s*/i;
  if (primeiro >= 0 && tokens[primeiro].type === 'paragraph' && rotulo.test(tokens[primeiro].raw)) {
    // Sem o rótulo, a frase começa em maiúscula.
    const texto = tokens[primeiro].raw.replace(rotulo, '').trim().replace(/^([^\p{L}]*)(\p{L})/u, (_, a, b) => a + b.toUpperCase());
    respostaCurta = marked.parseInline(texto);
    tokens.splice(primeiro, 1);
  }

  const hr = tokens.findLastIndex((t) => t.type === 'hr');
  const tokensNotas = hr >= 0 ? tokens.splice(hr).slice(1) : [];

  const html = marked.parser(tokens);
  const notas = tokensNotas.length ? marked.parser(tokensNotas) : '';
  for (const f of ctx.falhas) erros.push(`${arquivo}: ${f}`);

  const palavras = corpo.replace(/[#>*_`|[\]()-]/g, ' ').split(/\s+/).filter(Boolean).length;
  return { respostaCurta, html, notas, secoes: ctx.secoes, tempoLeitura: Math.max(1, Math.ceil(palavras / 200)) };
}

async function lerPosts() {
  let arquivos = [];
  try {
    arquivos = (await readdir(ORIGEM)).filter((f) => f.endsWith('.md')).sort();
  } catch {
    // Sem pasta de posts: gera tudo vazio.
  }

  const posts = [];
  for (const arquivo of arquivos) {
    const { data: meta, content } = matter(await readFile(join(ORIGEM, arquivo), 'utf8'));
    const d = { ...meta, atualizadoEm: data(meta.atualizadoEm), publicadoEm: data(meta.publicadoEm), revisarEm: data(meta.revisarEm) };
    validar(arquivo, d);
    if (d.status === 'rascunho' && !COM_RASCUNHOS) continue;

    const corpo = converter(arquivo, content);
    const capa = await gerarCapa(arquivo, d);
    posts.push({
      slug: d.slug,
      titulo: d.titulo,
      tituloSeo: d.tituloSeo || d.titulo,
      descricao: d.descricao,
      tag: d.tag,
      tom: d.tom,
      resumo: d.resumo,
      atualizadoEm: d.atualizadoEm,
      publicadoEm: d.publicadoEm || d.atualizadoEm,
      rascunho: d.status === 'rascunho',
      tempoLeitura: corpo.tempoLeitura,
      capa,
      cta: d.cta
        ? {
            texto: d.cta.texto,
            url: d.cta.url,
            titulo: d.cta.titulo || CTA_PADRAO.titulo,
            subtitulo: d.cta.subtitulo || CTA_PADRAO.subtitulo,
          }
        : null,
      secoes: corpo.secoes,
      respostaCurta: corpo.respostaCurta,
      html: corpo.html,
      notas: corpo.notas,
    });
  }

  // Mais recente primeiro.
  return posts.sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm) || a.titulo.localeCompare(b.titulo));
}

function resumo(p) {
  const { slug, titulo, descricao, tag, tom, resumo, atualizadoEm, publicadoEm, rascunho, tempoLeitura } = p;
  return { slug, titulo, descricao, tag, tom, resumo, atualizadoEm, publicadoEm, rascunho, tempoLeitura };
}

function gerarCards(publicados) {
  const cards = publicados.map((p) => ({ tag: p.tag, tom: p.tom, titulo: p.titulo, resumo: p.resumo, url: `/guias/${p.slug}` }));
  return `// Gerado por scripts/build-blog.mjs a partir de src/content/blog/*.md (npm run blog).
// Não editar: as mudanças se perdem no próximo build.
import type { Guia } from './conteudo.config';

export const GUIAS_GERADOS: Guia[] = ${JSON.stringify(cards, null, 2)};
`;
}

async function gerarSitemap(publicados) {
  const hoje = new Date().toISOString().slice(0, 10);
  let anuncios = [];
  try {
    anuncios = JSON.parse(await readFile(ANUNCIOS, 'utf8'));
  } catch {
    erros.push(`não foi possível ler ${ANUNCIOS}`);
  }

  const url = (caminho, lastmod, changefreq, priority) =>
    `  <url>\n    <loc>${SITE}${caminho}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;

  const blocos = [
    '  <!-- Páginas principais -->',
    ...PAGINAS.map((p) => url(p.caminho, p.lastmod, 'weekly', '1.0')),
    '',
    '  <!-- Páginas de anúncio -->',
    ...anuncios.map((a) => url(`/anuncios/${a.slug}`, (a.criado_em || hoje).slice(0, 10), 'monthly', '0.7')),
  ];

  if (publicados.length) {
    blocos.push(
      '',
      '  <!-- Guias -->',
      url('/guias', publicados[0].atualizadoEm, 'weekly', '0.8'),
      ...publicados.map((p) => url(`/guias/${p.slug}`, p.atualizadoEm, 'monthly', '0.8')),
    );
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Gerado por scripts/build-blog.mjs (npm run blog). Não editar. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

${blocos.join('\n')}

</urlset>
`;
}

async function main() {
  // As capas são escritas enquanto os posts são lidos.
  await rm(SAIDA_IMAGENS, { recursive: true, force: true });
  await mkdir(SAIDA_IMAGENS, { recursive: true });

  const posts = await lerPosts();
  const publicados = posts.filter((p) => !p.rascunho);
  const sitemap = await gerarSitemap(publicados);

  if (erros.length) {
    console.error(`\n[blog] ${erros.length} problema(s) nos posts:\n  - ${erros.join('\n  - ')}\n`);
    process.exit(1);
  }

  await rm(SAIDA_DADOS, { recursive: true, force: true });
  await mkdir(SAIDA_DADOS, { recursive: true });
  await writeFile(join(SAIDA_DADOS, 'index.json'), JSON.stringify(posts.map(resumo)));
  for (const p of posts) await writeFile(join(SAIDA_DADOS, `${p.slug}.json`), JSON.stringify(p));
  await writeFile(SAIDA_CARDS, gerarCards(publicados));
  await writeFile(SAIDA_SITEMAP, sitemap);

  const rascunhos = posts.length - publicados.length;
  console.log(
    `[blog] ${publicados.length} publicado(s)` +
      (COM_RASCUNHOS ? `, ${rascunhos} rascunho(s) incluído(s) (fora de produção)` : ', rascunhos ignorados (produção)'),
  );
}

main().catch((e) => {
  console.error('[blog]', e);
  process.exit(1);
});
