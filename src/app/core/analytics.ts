import { track as trackVercel } from '@vercel/analytics';
import { SITE } from '../config/site.config';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

type Params = Record<string, string | number | boolean | null>;

/**
 * Eventos de analytics (relatório de contatos para os anunciantes): vão para o Vercel
 * Analytics e, com SITE.ga4.id preenchido, para o GA4. Nomes e parâmetros do handoff:
 * simulacao_interacao, oferta_click {slug, posicao}, lead_whatsapp {slug, origem},
 * lead_telefone, lead_site_anunciante, compartilhar {canal}.
 */
export function track(evento: string, params: Params = {}): void {
  if (typeof window === 'undefined') return;
  trackVercel(evento, params);
  window.gtag?.('event', evento, params);
}

/**
 * Carrega o gtag.js (só no navegador e só se houver ID). O page_view automático fica
 * desligado: o simulador reescreve os query params a cada ajuste, e isso contaria como
 * uma visualização por mexida. As visualizações são enviadas por `paginaVista`.
 */
export function iniciarGa4(doc: Document): void {
  const id = SITE.ga4.id;
  const win = doc.defaultView;
  if (!id || !win || win.gtag) return;
  win.dataLayer = win.dataLayer || [];
  // O gtag.js espera o objeto `arguments`, não um array.
  win.gtag = function () {
    // eslint-disable-next-line prefer-rest-params
    win.dataLayer!.push(arguments);
  };
  win.gtag('js', new Date());
  win.gtag('config', id, { send_page_view: false });
  const s = doc.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  doc.head.appendChild(s);
}

/** page_view do GA4 a cada troca de página (caminho diferente, não a cada query param). */
export function paginaVista(doc: Document): void {
  doc.defaultView?.gtag?.('event', 'page_view', {
    page_location: doc.location.href,
    page_title: doc.title,
  });
}
