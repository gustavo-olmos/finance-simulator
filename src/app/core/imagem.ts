/**
 * Pede ao Unsplash uma versão redimensionada/comprimida da foto (a URL original é a foto
 * em resolução nativa, várias vezes maior que o necessário). Outras origens passam intactas.
 */
export function imagemRedimensionada(url: string | null | undefined, largura: number, altura: number): string | null {
  if (!url) return null;
  if (!url.includes('images.unsplash.com')) return url;
  return `${url}?auto=format&fit=crop&w=${largura}&h=${altura}&q=60`;
}
