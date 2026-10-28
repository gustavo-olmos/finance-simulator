# Ideias — RotaFin

Ideias para analisar com calma e decidir a implementação depois. Cada arquivo é uma ideia independente: contexto, proposta, decisões em aberto e pré-requisitos. Origem: conversa de 28/10/2026 (análise feita sobre o código da época — conferir se continua valendo antes de implementar).

| Arquivo | Ideia | Status |
|---|---|---|
| [landing-page-e-blog.md](landing-page-e-blog.md) | Landing page da marca + 3 primeiros posts do blog | **Prioridade atual** — aguardando o design |
| [conteudo-organico.md](conteudo-organico.md) | Estratégia de conteúdo para trazer tráfego orgânico | Ideia |
| [anunciantes-e-metricas.md](anunciantes-e-metricas.md) | Imobiliárias anunciando no site + relatório de métricas para elas | Ideia |
| [avaliacao-de-imoveis.md](avaliacao-de-imoveis.md) | Avaliação rápida do anúncio pelo visitante | Ideia |
| [backend-leve.md](backend-leve.md) | Supabase + rotas no Express para anúncios, eventos e avaliações | Ideia — base para as duas anteriores |

## Pendências de base (valem para todas as ideias)

Encontradas no código em 28/10/2026. Nenhuma precisa de backend.

- **Plano do Vercel.** Os eventos personalizados (`track()` do `@vercel/analytics`, ex.: `lead_whatsapp`) só são gravados nos planos Pro e Enterprise. No Hobby, nenhum clique está sendo registrado. O Hobby também proíbe uso comercial, e AdSense ou anúncios pagos contam como comercial. Conferir o plano atual. Fontes: [Custom Events](https://vercel.com/docs/analytics/custom-events.md), [Hobby](https://vercel.com/docs/plans/hobby), [Fair use](https://vercel.com/docs/limits/fair-use-guidelines).
- **Rotas que não existem.** `/privacidade` está linkada no rodapé ([site-footer.component.html](../../src/app/components/site-footer/site-footer.component.html)) e `/contato` no banner "Quero anunciar" ([banner-anuncie.component.ts](../../src/app/components/banner-anuncie/banner-anuncie.component.ts)), mas nenhuma das duas está em [app.routes.ts](../../src/app/app.routes.ts): caem no redirect para `/financiamento-imovel`. O AdSense exige política de privacidade.
- **Anúncios sem anunciante.** Os 6 anúncios de [anuncios.json](../../src/assets/data/anuncios.json) são fictícios e nenhum tem `whatsapp` ou `anunciante_nome`. Por isso o botão "Falar com a imobiliária" não aparece em nenhum.
- **Configurações vazias.** `SITE.anunciarUrl` e os IDs do AdSense estão vazios em [site.config.ts](../../src/app/config/site.config.ts).

## Ordem sugerida

1. Landing + blog e pendências de base (sem backend). O conteúdo traz o tráfego que todas as outras ideias precisam.
2. Piloto com 2–3 imobiliárias + backend mínimo (só a tabela de eventos).
3. Avaliação de imóveis, quando cada anúncio tiver tráfego suficiente para os números significarem algo.
