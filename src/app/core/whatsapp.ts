import { brl0 } from './formato';

/** Mensagem enviada ao anunciante (texto do handoff), usada no card de oferta e na página do anúncio. */
export function mensagemAnuncio(titulo: string, entrada: number, prazoAnos: number, parcelaSac: number): string {
  return `Olá! Vi o anúncio ${titulo} na RotaFin. Simulei com ${brl0(entrada)} de entrada em ${prazoAnos} anos, parcela de ${brl0(parcelaSac)} (SAC). Ainda está disponível?`;
}

/** Link wa.me para um telefone (só dígitos, com DDI) com a mensagem já preenchida. */
export function linkWhatsapp(telefone: string, texto: string): string {
  return `https://wa.me/${telefone}?text=${encodeURIComponent(texto)}`;
}
