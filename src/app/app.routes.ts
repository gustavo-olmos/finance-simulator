import { Routes } from '@angular/router';

// Rotas. As páginas de simulador recebem o tema via `data`.
// /anuncios/:slug é a rota dinâmica de SEO (requisito 3.3).
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'financiamento-imovel' },
  {
    path: 'financiamento-imovel',
    loadComponent: () =>
      import('./pages/simulador-page/simulador-page.component').then((m) => m.SimuladorPageComponent),
    data: { tema: 'imovel' },
  },
  {
    path: 'financiamento-veiculo',
    loadComponent: () =>
      import('./pages/simulador-page/simulador-page.component').then((m) => m.SimuladorPageComponent),
    data: { tema: 'veiculo' },
  },
  {
    path: 'anuncios/:slug',
    loadComponent: () =>
      import('./pages/anuncio-detalhe/anuncio-detalhe.component').then((m) => m.AnuncioDetalheComponent),
  },
  { path: '**', redirectTo: 'financiamento-imovel' },
];
