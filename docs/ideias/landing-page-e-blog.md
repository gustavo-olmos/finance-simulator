# Landing page da RotaFin + primeiros posts do blog

**Status:** prioridade atual (out/2026). Este arquivo define objetivo e conteúdo; o design visual será definido pelo Gustavo antes da implementação.

## Objetivo

1. **Estabelecer a marca:** o nome **RotaFin** e de onde ele vem (**Rota Financeira**), e o que o site se propõe a fazer.
2. **Publicar pelo menos 3 posts de blog** como primeiro conteúdo do site (primeiro passo de [conteudo-organico.md](conteudo-organico.md)).

## O que o site faz (base para o texto da landing)

Tudo isso já existe no código:

- Simula financiamento de **imóvel** e **veículo** nos sistemas **SAC** e **PRICE**, lado a lado.
- Dois jeitos de simular: **"Sei o valor do imóvel"** (calcula a parcela) e **"Sei quanto posso pagar"** (calcula quanto dá para financiar). O segundo nasceu de teste com usuários leigos (memória `produto-modo-inverso`, jul/2026).
- Mostra a **renda mínima estimada** (parcela até 30% da renda).
- **Grátis, instantâneo e sem cadastro**: nenhum dado pessoal (já afirmado no FAQ, [conteudo.config.ts](../../src/app/config/conteudo.config.ts)).
- Mostra **anúncios de imobiliárias e concessionárias na faixa de preço simulada**. Dá para falar com o anunciante pelo WhatsApp com a simulação já escrita na mensagem.
- **Não é banco nem corretora**: a negociação é feita direto com o anunciante (também já está no FAQ).

## Públicos

- **Principal:** quem quer comprar e precisa entender se cabe no bolso. Linguagem para leigo, sem jargão.
- **Secundário:** imobiliárias e concessionárias. O componente [banner-anuncie](../../src/app/components/banner-anuncie/banner-anuncie.component.ts) já existe e pode ser reaproveitado.

## Estrutura proposta (conteúdo, não design)

1. **Topo:** nome + promessa em uma frase + botão "Simular agora" (leva a `/financiamento-imovel`). Rascunhos de frase, a decidir:
   - "A rota até o seu imóvel começa pela parcela que cabe no bolso."
   - "Descubra quanto você pode financiar antes de falar com o banco."
2. **O que dá para fazer** (3 blocos): simular a parcela · descobrir quanto pode financiar · encontrar imóveis na sua faixa e falar com o anunciante.
3. **Por que confiar:** grátis, sem cadastro, cálculo explicado (fórmulas do [finance-calculator.service.ts](../../src/app/core/finance-calculator.service.ts)), não vendemos crédito.
4. **O nome:** parágrafo curto: RotaFin = Rota Financeira, o caminho do "quero comprar" até a parcela que cabe no orçamento.
5. **Do blog:** os 3 posts mais recentes.
6. **Para anunciantes:** banner "É imobiliária ou concessionária?".
7. **Rodapé** com `/privacidade` e `/contato`, que precisam existir antes (ver [README.md](README.md)).

SEO: o JSON-LD `Organization` e `WebSite` hoje é montado em [simulador-page.component.ts](../../src/app/pages/simulador-page/simulador-page.component.ts). A landing é o lugar mais natural para ele. Decidir se ele passa para a landing ou fica nos dois lugares.

## Blog: os 3 primeiros posts

**Formato sugerido:** arquivos Markdown no repositório, renderizados pelo SSR numa rota tipo `/blog/:slug`. Sem CMS. Cada post termina com um botão para o simulador **já preenchido** via query params: o mecanismo existe (`valor`, `entrada`, `prazo` em meses, `taxa`, `seguro`, em [simulacao.store.ts](../../src/app/core/simulacao.store.ts)).

**Candidatos** (escolher 3). A prioridade é intenção de busca alta e ligação direta com a calculadora:

| # | Post | Por quê | Cuidado |
|---|---|---|---|
| 1 | Quanto preciso ganhar para financiar um imóvel? | É a dúvida do usuário leigo; leva ao modo "Sei quanto posso pagar" | Exemplos com números calculados pelo motor do site |
| 2 | SAC ou PRICE: qual escolher? | Já planejado no [TODO.md](../../TODO.md) como seção da página do simulador | Decidir: vira post **ou** fica na página. Os dois competiriam pela mesma busca |
| 3 | Custos além da parcela: ITBI, escritura e registro | Comprador esquece; muda o valor da entrada necessária | Alíquotas variam por município: citar fonte |
| 4 | Como usar o FGTS na entrada | Muita busca; já é pergunta do FAQ | Regras mudam: conferir na Caixa na data de publicar |
| 5 | Financiamento de veículo: quanto custa de verdade | Cobre o tema veículo | — |
| 6 | Minha Casa, Minha Vida 2026: faixas e regras | Muita busca | Muda com frequência: exige manutenção |

**Recomendação:** 1, 3 e 2 (se SAC x PRICE sair da página do simulador) ou 4.

**Regras editoriais:**
- Números sempre calculados pelo próprio simulador, nunca inventados.
- Regra legal ou bancária com fonte e data.
- Texto aprovado pelo Gustavo antes de publicar (regra que já vale no TODO.md).

**SEO de cada post:** title, description e canonical via [seo.service.ts](../../src/app/core/seo.service.ts); JSON-LD `Article`; entrada no [sitemap.xml](../../src/sitemap.xml) (hoje é arquivo estático, precisa ser atualizado a cada post); avaliar se o gerador de imagem OG (`/api/og`) aceita o título do post.

## Decisões em aberto

- [ ] **Design** da landing (Gustavo).
- [ ] A landing fica em `/` ou numa rota própria (`/sobre`)? Hoje `/` redireciona para o simulador, e o redesign foi feito para mostrar a parcela já na primeira tela. Pôr uma landing em `/` acrescenta um clique antes do cálculo. Ver no Vercel Analytics quanto tráfego entra por `/` antes de decidir.
- [ ] A landing é **institucional** (tráfego orgânico) ou para **tráfego pago** (Google/Meta Ads)? Página para anúncio pede uma única ação principal e menos navegação.
- [ ] Confirmar a grafia do nome por extenso: "Rota Financeira".
- [ ] Caminho do blog: `/blog` ou `/guias`.
- [ ] Quais 3 posts.
