# Simulae — Simulador de Financiamento (Angular 17 · Standalone · Signals · SSR)

Implementação da especificação técnica (MVP): simulador de financiamento **SAC/PRICE**
100% client-side, com **listagem de anúncios** e **SEO via SSR**.

## Stack
- **Angular 17+** com **Standalone Components** (sem NgModules).
- **Angular Signals** para o estado do formulário e cálculo derivado (`computed`), sem RxJS em operações síncronas.
- **Angular SSR** (`@angular/ssr` + Express) para indexação.
- **SCSS por componente** (sem framework de CSS).
- Dados mock em **JSON estático** (`src/assets/data/anuncios.json`).

## Como rodar
```bash
cd angular
npm install
npm start              # dev server (CSR) → http://localhost:4200
npm run build          # build de produção (browser + server)
npm run serve:ssr      # roda o SSR em http://localhost:4000
```

## Rotas
| Rota | Componente | Observação |
|------|------------|------------|
| `/financiamento-imovel` | `SimuladorPageComponent` (data `tema: 'imovel'`) | Landing temática |
| `/financiamento-veiculo` | `SimuladorPageComponent` (data `tema: 'veiculo'`) | Landing temática |
| `/anuncios/:slug` | `AnuncioDetalheComponent` | Rota dinâmica de SEO (req. 3.3) |

## Estrutura
```
src/app/
  app.component.ts            # shell + efeito que aplica o tema (CSS vars)
  app.config.ts               # router, hydration, HttpClient, locale pt-BR
  app.config.server.ts        # provideServerRendering
  app.routes.ts               # rotas (lazy standalone)
  models/                     # simulacao, anuncio (contrato SQL-like), tema
  config/temas.config.ts      # faixas/defaults/SEO por tema
  core/
    finance-calculator.service.ts  # Etapa 1 — cálculo PURO SAC/PRICE
    anuncio.service.ts             # Etapa 3 — lê anuncios.json (shareReplay)
    seo.service.ts                 # Title/Meta/OG/canonical
    theme.service.ts               # sistema (signal) → cores (computed)
  components/
    simulador/                 # widget reaproveitável (toggle+result+form+chart)
    system-toggle/ result-panel/ amortization-chart/ finance-form/
    comparison-table/ faq/ ads-grid/ ad-card/ ad-slot/ site-header/
  pages/
    simulador-page/            # landing temática
    anuncio-detalhe/           # /anuncios/:slug
assets/data/anuncios.json      # mock de banco (contrato `Anuncio`)
```

## Mapa do design → componentes
- **Zona "app" (verde/âmbar)**: `SimuladorPageComponent` → `SiteHeaderComponent` + `SimuladorComponent`.
- **Cálculo em tempo real**: `SimuladorComponent` mantém os inputs em signals; `resultado = computed(() => FinanceCalculatorService.calcular(...))` recalcula a cada mudança (req. 3.2).
- **Tema SAC=verde / PRICE=âmbar**: `ThemeService.sistema` (signal) → `cores` (computed); `AppComponent` escreve `--app-bg`/`--app-ink` no `:root`.
- **Zona de conteúdo (SEO)**: `ComparisonTableComponent`, `FaqComponent`, `AdsGridComponent`.
- **Anúncios AdSense**: `AdSlotComponent` (placeholders), sempre **fora** da zona principal.
- **Catálogo**: `anuncios.json` → `AdCardComponent` → `/anuncios/:slug` (`AnuncioDetalheComponent`), que pré-carrega a simulação com o `preco` do item e injeta as meta tags.

## Notas / decisões
- **`Anuncio`** segue o contrato estrito da spec (chaves SQL-like). O tema da página de
  detalhe é **inferido pelo preço** (`<= 150k → veículo`), já que a interface não tem campo
  de categoria — se desejar, adicione `categoria`/`tema` ao contrato e ao JSON para filtrar
  os anúncios por tema na home.
- **`seguro`** está no contrato de `Parcela`, fixado em `0` no MVP (reservado para MIP/DFI).
- **`SeoService.ORIGIN`**: ajuste para o domínio de produção (usado em canonical/OG).
- **Hydration**: `provideClientHydration()` + `HttpClient` com `withFetch()` transferem o
  estado do SSR para o cliente sem flicker (req. 3.3).
- O design original em Design Component (`Simulador de Financiamento.dc.html` e as páginas
  `financiamento-*.dc.html`) permanece na raiz do projeto como referência visual.
```
