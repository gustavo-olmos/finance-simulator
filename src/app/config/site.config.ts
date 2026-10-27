/**
 * Configurações do site que dependem de contas externas.
 * Enquanto um valor estiver vazio, o recurso correspondente não aparece
 * (o bloco do AdSense não é renderizado; "Quero anunciar" cai na página de contato).
 */
export const SITE = {
  adsense: {
    /** ID do editor do AdSense (ex.: 'ca-pub-1234567890123456'). TODO: preencher. */
    client: '',
    /** data-ad-slot de cada bloco. TODO: preencher. */
    slots: {
      simulador: '',
      anuncio: '',
    },
  },
  /** Destino do botão "Quero anunciar" (mailto: ou link de WhatsApp). TODO: preencher. */
  anunciarUrl: '',
};
