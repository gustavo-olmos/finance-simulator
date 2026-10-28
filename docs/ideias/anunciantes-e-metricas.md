# Imobiliárias anunciando + métricas para os anunciantes

**Status:** ideia.

## A ideia

Oferecer o site para imobiliárias (e concessionárias) anunciarem. O visitante clica no anúncio, cai na página de simulação daquele imóvel e fala com a imobiliária pelo WhatsApp com a simulação pronta na mensagem. O anunciante recebe métricas que mostram que vale a pena anunciar.

## O que já existe

- Botão **"Falar com a imobiliária"** (ou "o anunciante", para veículo) com ícone de WhatsApp:
  - desktop: no painel do anúncio ([painel-anuncio](../../src/app/components/painel-anuncio/painel-anuncio.component.html));
  - celular: na barra fixa ([barra-whatsapp](../../src/app/components/barra-whatsapp/barra-whatsapp.component.ts));
  - também no card de oferta ([oferta-card](../../src/app/components/oferta-card/oferta-card.component.ts)).
- Mensagem pronta com título, entrada, prazo e parcela SAC ([whatsapp.ts](../../src/app/core/whatsapp.ts)): *"Olá! Vi o anúncio … na RotaFin. Simulei com R$ … de entrada em … anos, parcela de R$ … (SAC). Ainda está disponível?"*, com prévia da mensagem visível antes do clique.
- Botões "Ligar" e "Site do anunciante".
- Eventos `track()`: `lead_whatsapp`, `lead_telefone`, `lead_site_anunciante`, `oferta_click`, `compartilhar`, `simulacao_interacao`.

## O que falta

### 1. Métrica que o anunciante consiga ver

- **Se o site estiver no Hobby, os eventos não são gravados**: o Vercel só grava eventos personalizados no Pro e Enterprise (ver [README.md](README.md)).
- Mesmo no Pro, o painel do Vercel é só seu: não separa os números por imobiliária e guarda pouco histórico.
- Para ter números por anunciante, os eventos precisam ficar num banco seu ([backend-leve.md](backend-leve.md)).

### 2. Ser honesto sobre o que é um lead

- Clique não é lead: o link `wa.me` não informa se a mensagem foi enviada.
- **A melhor prova já existe:** a mensagem diz "Vi o anúncio … na RotaFin", e o corretor vê isso chegando no próprio WhatsApp. Isso convence mais que qualquer painel.
- **Reforço possível:** um código curto na mensagem (ex.: "Ref. RF-4K2") gravado junto com o clique. Dá para cruzar os cliques com os leads que o corretor confirmar. Ponto a avaliar: o código pode deixar a mensagem com cara de robô.

### 3. Funil por anúncio

| Etapa | Rastreado hoje? |
|---|---|
| Card exibido (impressão) | Não |
| Clique no card | Sim (`oferta_click`) |
| Visita à página do anúncio | Sim (pageview do Vercel) |
| Interagiu com o simulador | Sim (`simulacao_interacao`), mas sem o slug do anúncio |
| Clique em WhatsApp, Ligar ou Site | Sim |

### 4. O diferencial: o lead já chega qualificado

ZAP e OLX entregam um contato. A RotaFin entrega alguém que já sabe a entrada que tem e a parcela que cabe no bolso. No relatório: "quem chamou no seu imóvel tem entrada média de 22% e simulou prazo de 30 anos". Para isso, gravar entrada, prazo e parcela junto com o evento de lead.

### 5. Detalhe de interface

O botão poderia usar o nome do anunciante ("Falar com a Imobiliária X"), o que passa mais confiança que o genérico. O campo `anunciante_nome` já existe no modelo.

## O gargalo real: ovo e galinha

Hoje são 6 anúncios fictícios, sem anunciante. Sem tráfego, a métrica não convence ninguém. Antes de construir painel, fazer um **piloto feito à mão**:

1. 2–3 imobiliárias locais, de graça, por 60–90 dias.
2. Anúncios cadastrados por você (no JSON ou no Supabase).
3. Relatório mensal feito à mão (impressões, cliques, leads, perfil financeiro dos interessados).
4. No fim: elas pagariam? Quanto? Por anúncio, por lead ou mensalidade?

Só depois disso construir login de anunciante e painel próprio.

## Pré-requisitos

- `/contato` ou `SITE.anunciarUrl` preenchido, para o "Quero anunciar" funcionar.
- Conferir o plano do Vercel.
- Tráfego: ver [conteudo-organico.md](conteudo-organico.md).

## Decisões em aberto

- [ ] Modelo de cobrança (por anúncio, por lead, mensal, destaque).
- [ ] Usar ou não o código de referência na mensagem.
- [ ] Formato do relatório: PDF mensal ou link privado por anunciante (ver [backend-leve.md](backend-leve.md)).
- [ ] Quais imobiliárias abordar no piloto.
