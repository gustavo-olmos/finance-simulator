import { Routes } from '@angular/router';

// Rotas. A raiz é a página inicial (landing); as páginas de simulador recebem o tema via `data`.
// /anuncios/:slug é a rota dinâmica de SEO (requisito 3.3).
export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./pages/inicio-page/inicio-page.component').then((m) => m.InicioPageComponent),
  },
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
  // Blog: posts em src/content/blog/*.md, convertidos no build (scripts/build-blog.mjs).
  {
    path: 'guias',
    loadComponent: () => import('./pages/guias-lista/guias-lista.component').then((m) => m.GuiasListaComponent),
  },
  {
    path: 'guias/:slug',
    loadComponent: () => import('./pages/guia-detalhe/guia-detalhe.component').then((m) => m.GuiaDetalheComponent),
  },
  {
    path: 'contato',
    loadComponent: () => import('./pages/contato-page/contato-page.component').then((m) => m.ContatoPageComponent),
  },
  {
    path: 'privacidade',
    loadComponent: () =>
      import('./pages/privacidade-page/privacidade-page.component').then((m) => m.PrivacidadePageComponent),
  },
  {
    path: 'termos',
    loadComponent: () => import('./pages/termos-page/termos-page.component').then((m) => m.TermosPageComponent),
  },
  { path: '**', redirectTo: 'financiamento-imovel' },
];
