// Formatação de valores em pt-BR, no mesmo padrão dos textos do design
// ("R$ 2.671,90", "R$ 601.945", "R$ 300 mil", "R$ 1,25 mi").

/** Moeda com centavos: R$ 2.671,90 */
export function brl(v: number): string {
  return 'R$ ' + (v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Moeda sem centavos: R$ 601.945 */
export function brl0(v: number): string {
  return 'R$ ' + Math.round(v || 0).toLocaleString('pt-BR');
}

/** Moeda abreviada: R$ 300 mil · R$ 1,25 mi */
export function brlCurto(v: number): string {
  if (v >= 1_000_000) {
    return 'R$ ' + (v / 1_000_000).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + ' mi';
  }
  return 'R$ ' + Math.round((v || 0) / 1000).toLocaleString('pt-BR') + ' mil';
}

/** Número decimal: 10,5 · 0,84 */
export function decimal(v: number, casas = 2): string {
  return (v || 0).toLocaleString('pt-BR', { maximumFractionDigits: casas });
}
