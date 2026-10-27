/** Copia um texto para a área de transferência, com fallback para navegadores sem Clipboard API. */
export async function copiarTexto(doc: Document, texto: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(texto);
  } catch {
    // Clipboard API indisponível (contexto não seguro, navegador antigo): fallback com textarea.
    const ta = doc.createElement('textarea');
    ta.value = texto;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    doc.body.appendChild(ta);
    ta.select();
    doc.execCommand('copy');
    ta.remove();
  }
}
