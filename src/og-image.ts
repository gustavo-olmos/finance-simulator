import { Request, Response } from 'express';
import { mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';
import { FinanceCalculatorService } from './app/core/finance-calculator.service';
import { SistemaAmortizacao } from './app/models/simulacao.model';

/**
 * Rota GET /api/og — imagem Open Graph (1200x630) gerada pelo próprio servidor SSR.
 * Monta um SVG com o resultado da simulação (reutilizando o FinanceCalculatorService)
 * e converte para PNG com Sharp. Sem Edge Functions nem dependência de Vercel.
 */

const LARGURA = 1200;
const ALTURA = 630;

// O serviço é puro e sem dependências — pode ser instanciado fora do DI do Angular.
const calculadora = new FinanceCalculatorService();

/** Formata como BRL inteiro (R$ 1.234). Node tem ICU completo. */
function brl(n: number): string {
  return n.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  });
}

function num(valor: unknown, padrao: number): number {
  const n = parseFloat(String(valor ?? ''));
  return Number.isFinite(n) ? n : padrao;
}

function escaparXml(texto: string): string {
  return texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * O Sharp (libvips/pango) resolve fontes via fontconfig. Em serverless Linux não há
 * nenhuma fonte instalada, então apontamos FONTCONFIG_PATH para um fonts.conf gerado
 * em runtime que usa a Manrope embarcada em assets/og.
 */
let fontesConfiguradas = false;
function configurarFontes(dirFontes: string): void {
  if (fontesConfiguradas || process.env['FONTCONFIG_PATH']) {
    fontesConfiguradas = true;
    return;
  }
  const dirConf = join(tmpdir(), 'simulae-fontconfig');
  mkdirSync(dirConf, { recursive: true });
  writeFileSync(
    join(dirConf, 'fonts.conf'),
    `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir>${escaparXml(dirFontes)}</dir>
  <cachedir>${escaparXml(join(tmpdir(), 'simulae-fontcache'))}</cachedir>
</fontconfig>
`,
  );
  process.env['FONTCONFIG_PATH'] = dirConf;
  fontesConfiguradas = true;
}

/** Largura aproximada de um texto (para dimensionar os chips e o selo do sistema). */
function larguraTexto(texto: string, fontSize: number, fator = 0.62): number {
  return Math.ceil(texto.length * fontSize * fator);
}

interface DadosImagem {
  sistema: SistemaAmortizacao;
  parcela: string;
  chips: { label: string; valor: string }[];
}

function construirSvg(d: DadosImagem): string {
  const isSAC = d.sistema === 'SAC';
  const corInicio = isSAC ? '#1a7a4f' : '#c0820e';
  const corFim = isSAC ? '#0d4d2e' : '#7a5010';
  const fonte = 'Manrope, sans-serif';

  // Selo do sistema (canto superior direito)
  const seloTexto = d.sistema;
  const seloLargura = larguraTexto(seloTexto, 14, 0.85) + 40;
  const seloX = LARGURA - 80 - seloLargura;

  // Chips dinâmicos (label pequeno + valor)
  let chipX = 80;
  const chipsSvg = d.chips
    .map((chip) => {
      const label = escaparXml(chip.label.toUpperCase());
      const valor = escaparXml(chip.valor);
      const largura = Math.max(larguraTexto(label, 11, 0.78), larguraTexto(valor, 24, 0.6)) + 44;
      const svg = `
  <g>
    <rect x="${chipX}" y="332" width="${largura}" height="82" rx="14" fill="rgba(0,0,0,0.2)"/>
    <text x="${chipX + 22}" y="364" font-family="${fonte}" font-size="11" font-weight="700" letter-spacing="0.7" fill="rgba(255,255,255,0.55)">${label}</text>
    <text x="${chipX + 22}" y="397" font-family="${fonte}" font-size="24" font-weight="700" fill="#ffffff">${valor}</text>
  </g>`;
      chipX += largura + 14;
      return svg;
    })
    .join('');

  return `<svg width="${LARGURA}" height="${ALTURA}" viewBox="0 0 ${LARGURA} ${ALTURA}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${corInicio}"/>
      <stop offset="100%" stop-color="${corFim}"/>
    </linearGradient>
  </defs>
  <rect width="${LARGURA}" height="${ALTURA}" fill="url(#bg)"/>

  <!-- Header -->
  <text x="80" y="92" font-family="${fonte}" font-size="28" font-weight="800" letter-spacing="-0.5" fill="rgba(255,255,255,0.75)">Simulae</text>
  <rect x="${seloX}" y="62" width="${seloLargura}" height="36" rx="18" fill="rgba(0,0,0,0.22)"/>
  <text x="${seloX + seloLargura / 2}" y="85" text-anchor="middle" font-family="${fonte}" font-size="14" font-weight="800" letter-spacing="1.4" fill="#ffffff">${escaparXml(seloTexto)}</text>

  <!-- Parcela principal -->
  <text x="80" y="188" font-family="${fonte}" font-size="16" font-weight="700" letter-spacing="1.3" fill="rgba(255,255,255,0.6)">PARCELA INICIAL</text>
  <text x="80" y="282" font-family="${fonte}" font-size="84" font-weight="800" letter-spacing="-2.9" fill="#ffffff">${escaparXml(d.parcela)}</text>
${chipsSvg}

  <!-- Footer -->
  <text x="80" y="572" font-family="${fonte}" font-size="15" fill="rgba(255,255,255,0.4)">simulae.com.br · simulador gratuito de financiamento</text>
</svg>`;
}

/**
 * Cria o handler Express da rota. Recebe o diretório das fontes embarcadas
 * (dist/browser/assets/og), resolvido pelo server.ts.
 */
export function criarOgImageHandler(dirFontes: string) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      configurarFontes(dirFontes);

      const q = req.query;
      const valorBem = num(q['valor'], 300000);
      const entrada = num(q['entrada'], 60000);
      const prazoMeses = Math.floor(num(q['prazo'], 360));
      const taxaAnual = num(q['taxa'], 10.5);
      const seguroMensal = num(q['seguro'], 0);
      const sistema: SistemaAmortizacao = q['sistema'] === 'PRICE' ? 'PRICE' : 'SAC';

      const r = calculadora.calcular(
        { valorBem, entrada, taxaAnual, prazoMeses, seguroMensal },
        sistema,
      );

      const svg = construirSvg({
        sistema,
        parcela: brl(r.primeiraParcela),
        chips: [
          { label: 'Total a pagar', valor: brl(r.totalPago) },
          { label: 'Juros', valor: brl(r.totalJuros) },
          { label: 'Prazo', valor: `${prazoMeses} meses` },
        ],
      });

      const png = await sharp(Buffer.from(svg)).png().toBuffer();

      res
        .set({
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
        })
        .send(png);
    } catch (erro) {
      console.error('Erro ao gerar imagem OG:', erro);
      res.status(500).send('Erro ao gerar imagem');
    }
  };
}
