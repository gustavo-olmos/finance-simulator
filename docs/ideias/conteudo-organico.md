# Conteúdo para tráfego orgânico

**Status:** ideia. O primeiro passo (3 posts de blog) está em [landing-page-e-blog.md](landing-page-e-blog.md).

## Por que primeiro

Conteúdo traz o tráfego de que as outras ideias dependem: sem visitantes, nenhuma métrica convence imobiliária ([anunciantes-e-metricas.md](anunciantes-e-metricas.md)), e nenhuma avaliação tem volume ([avaliacao-de-imoveis.md](avaliacao-de-imoveis.md)). E não depende de backend.

## O que já está encaminhado

- **Texto de SEO da página `/financiamento-imovel`**: escopo aprovado, falta redigir (ver [TODO.md](../../TODO.md)).
- **Landing `/quanto-posso-financiar`**: fase 3 da memória `produto-modo-inverso`. O modo "Sei quanto posso pagar" já existe na calculadora.
- **Taxas de referência**: a seção existe, mas fica escondida porque as faixas estão vazias em [conteudo.config.ts](../../src/app/config/conteudo.config.ts).

## Frentes, em ordem de retorno esperado

### 1. Páginas geradas pelo simulador para buscas específicas

Páginas para buscas com valor concreto, por exemplo:
- "financiamento de imóvel de 300 mil"
- "quanto preciso ganhar para financiar 400 mil"
- "parcela de carro de 80 mil em 48x"

Quem busca isso está perto de decidir. Cada página traz, renderizado no SSR: tabela calculada pelo motor, renda mínima, SAC x PRICE, botão para o simulador pré-preenchido e **anúncios dessa faixa de preço** (liga com a ideia de anunciantes).

**Cuidado:** centenas de páginas quase iguais o Google trata como conteúdo raso. Começar com 20–30 faixas, as mais buscadas, e com texto que muda de verdade de uma faixa para outra (o que muda na renda, no prazo, no peso dos juros).

### 2. Taxas de referência atualizadas todo mês

Preencher a seção que já existe com faixas de bancos públicos, privados e MCMV (e veículos), com fonte e data. É conteúdo recorrente: dá motivo para voltar e para outros sites citarem.

### 3. Guias e calculadoras novas

- Guias: FGTS na entrada, Minha Casa Minha Vida, custos da compra (ITBI, escritura, registro), SAC x PRICE.
- Calculadoras: amortização antecipada, alugar ou comprar, ITBI. Calculadoras costumam atrair links de outros sites.

### 4. Fora do Google

- Vídeos curtos (Reels, Shorts, TikTok) feitos com o simulador: "o que R$ 3 mil por mês compra em SP".
- O compartilhamento da simulação pelo WhatsApp já existe e espalha o site naturalmente (ex.: o casal decidindo junto). Vale medir e reforçar.

### 5. Os dados próprios viram conteúdo

Depois do backend ([backend-leve.md](backend-leve.md)): "o que os compradores simularam em outubro" (entrada média, faixa de preço, prazo), com dados agregados e anônimos. É o mesmo dado que vende para as imobiliárias, então serve de conteúdo e de argumento de venda.

## Técnico

Guias e posts como Markdown no repositório, renderizados pelo SSR. Sem CMS por enquanto. O `sitemap.xml` é estático: com muitas páginas, vale gerá-lo no build ou no servidor.

## Decisões em aberto

- [ ] Ordem das frentes depois do blog.
- [ ] Quais faixas de valor entram nas primeiras páginas (pesquisar volume de busca).
- [ ] Quem mantém as taxas de referência todo mês, e de qual fonte.
