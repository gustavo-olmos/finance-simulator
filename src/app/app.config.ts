import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

import { routes } from './app.routes';

registerLocaleData(localePt, 'pt-BR');

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' })),
    // provideClientHydration faz a transferência do estado renderizado no servidor
    // para o cliente sem flicker (requisito 3.3 da spec).
    provideClientHydration(),
    provideHttpClient(withFetch()),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
  ],
};
