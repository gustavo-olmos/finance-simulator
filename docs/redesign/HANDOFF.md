# Redesign RotaFin — handoff para implementação

Objetivo: reduzir o bounce (o visitante precisa entender o site e ver a parcela na primeira tela), dar "cara de site de verdade" e organizar a página em torno dos anúncios de imobiliárias/concessionárias + 1 bloco do Google AdSense. **Mobile-first**: a maior parte do tráfego vem do celular.

Canvas com o design visual (privado, só o dono abre): https://claude.ai/artifact/U3GawR134Uw61djFRTc1uk

## Arquivos de referência (`docs/redesign/design/`)

São HTML com estilos inline exportados do canvas. Servem de referência exata de layout, cores, espaçamentos e textos. **Não rodam sozinhos** (usam um runtime próprio: `<x-dc>`, `{{variáveis}}`, `<sc-for>`, `<sc-if>`). A lógica de cálculo de referência está no `<script>` no fim de cada arquivo.

| Arquivo | O que é |
|---|---|
| `simulador-desktop.dc.html` | Página do simulador completa, responsiva (breakpoint 760px). **Fonte principal.** |
| `simulador-mobile-dobra.dc.html` | Primeira dobra no celular (390×844), com gaveta de resultado fixa |
| `simulador-mobile-rolagem.dc.html` | Rolagem no celular: resultado, anúncios em carrossel, AdSense, FAQ, barra fixa |
| `anuncio-desktop.dc.html` | Página do anúncio (nova), responsiva |
| `anuncio-mobile.dc.html` | Página do anúncio no celular, com barra de WhatsApp fixa |
| `marca.dc.html` | Logotipo, ícone/favicon e especificação |

## Tokens

**Cores**
- Verde marca `#0E6B43` · verde escuro hover `#0A4D31` · verde menta destaque `#7FE0AE` · verde médio `#2E9B67`
- Hero (fundo): `radial-gradient(ellipse 90% 70% at 50% 35%, #1F7A52 0%, #11573A 45%, #0A3524 100%)`
- Rodapé / blocos escuros: `#0A3524` e `#10241A`
- Texto: principal `#10241A` · secundário `#3D5046` / `#33463C` · auxiliar `#52655A`
- Bordas: `#DDE5E0` (padrão) · `#C9D5CE` (inputs/botões secundários) · `#E4EBE7` (divisores)
- Superfícies claras: `#F3F7F4`, `#F7FAF8`
- SAC = verde: fundo `#E6F2EC`, texto `#0A4D31`, cor da série `#0E6B43`
- PRICE = âmbar: fundo `#FDF3E3`, texto `#7A4706`, cor da série `#E39B2D`
- Texto sobre o hero escuro: `#FFFFFF`, `#E3F1E9`, `#D8EEE2`, `#B9D6C6`; inputs no hero: fundo `rgba(0,0,0,0.2)`, borda `rgba(255,255,255,0.18)`; painel: fundo `rgba(255,255,255,0.07)`, borda `rgba(255,255,255,0.16)`

**Tipografia** (Google Fonts)
- Logotipo: **DM Sans Bold Italic 700**, letter-spacing ≈ −0.04em. "Rota" `#10241A` + "Fin" `#0E6B43` no claro; "Rota" `#FFFFFF` + "Fin" `#7FE0AE` no escuro. Sem símbolo ao lado.
- Títulos e números grandes: **Bricolage Grotesque 700**
- Interface e texto: **Inter 400/500/600/700**

**Forma**: raios 8–12px em controles, 14–18px em cards; alvos de toque ≥ 44px; container `max-width: 1160px`, padding lateral 24px (16px no celular).

**Favicon / ícone do app**: "R" em DM Sans Bold Italic, branco, centralizado em quadrado `#0E6B43` com cantos arredondados (≈ 25% do lado). Gerar 16, 32, 180 (apple-touch-icon) e 512.

## Página do simulador (`/financiamento-imovel`, idem `/financiamento-veiculo`)

Ordem das seções:
1. **Header** branco, sticky. Desktop: logotipo · abas Imóvel / Veículo (com ícone, ativa com sublinhado 3px `#0E6B43`) · Como funciona · Dúvidas · botão "Anuncie aqui". Celular (≤760px): linha 1 = logotipo + menu hambúrguer; linha 2 = abas Imóvel / Veículo em largura total (min-height 46–48px).
2. **Hero verde** com título "Quanto vai ficar a parcela do seu imóvel?", subtítulo e selos (Grátis · Sem cadastro · Resultado em segundos).
3. **Calculadora única** (substitui o formulário do topo + o bloco de sliders antigo):
   - Abas de modo: "Sei o valor do imóvel" (padrão) / "Sei quanto posso pagar".
   - Campos digitáveis + slider: valor do imóvel (ou parcela máxima no outro modo), entrada (mostra % do imóvel; texto de ajuda sobre FGTS e 20%).
   - Prazo e juros com botões − / + (44px) e input central; abaixo, a taxa mensal equivalente e o link "Qual taxa usar?".
   - "Seguro obrigatório (opcional)" recolhido em `<details>`, com explicação do MIP/DFI.
4. **Card de resultado** (branco, ao lado da calculadora no desktop, abaixo no celular): SAC e PRICE lado a lado (sem toggle), mini-tabela total pago / renda mínima, frase comparando os dois, CTA principal "Ver imóveis de até {faixa}" (rola até as ofertas), botões WhatsApp e Copiar link.
5. **Ofertas patrocinadas** "Imóveis que cabem nessa simulação": grid de 4 no desktop, carrossel com scroll-snap no celular (card a 78% da largura). Card: foto + selo ANÚNCIO, preço, "≈ R$ X/mês com sua entrada" (calculado com o mesmo motor), título, bairro, imobiliária, botões **Simular** (vai para a página do anúncio) e **WhatsApp** (atalho direto).
6. **Um bloco do Google AdSense** depois das ofertas. Reservar a altura (250px; 300×250 no celular) para não causar CLS. Não exibir placeholder visível se o anúncio não carregar.
7. Banner "É imobiliária ou concessionária? Quero anunciar".
8. SAC × PRICE: explicação curta + gráfico de barras por ano (SAC verde, PRICE âmbar).
9. Tabela "Parcelas ano a ano" (5 primeiros anos, botão "Ver os N anos"; link para CSV mês a mês). Substitui a tabela de 360 linhas aberta.
10. "Qual taxa de juros colocar?": 3 cards de referência com data de atualização.
11. FAQ (inclui "Os anúncios são da RotaFin?").
12. Rodapé escuro com logotipo, links (Simular imóvel/veículo, Anuncie, Como calculamos, Sobre, Contato, Privacidade, Termos) e aviso "Não somos instituição financeira".
13. **Celular**: barra fixa no rodapé com parcela SAC e PRICE + botão "Detalhes"/"Ajustar" (padding-bottom na página para não cobrir conteúdo).

**Remover**: textos de placeholder "Google AdSense · responsivo (728×90…)", anúncios fictícios genéricos e o "R otaFin" quebrado do logo antigo.

## Página do anúncio (`/anuncios/{slug}`) — nova

Clique no card (ou em "Simular") → esta página. O botão WhatsApp do card pula direto para o contato.
- "Voltar à minha simulação" + breadcrumb.
- Galeria (principal 2/3 + 2 miniaturas no desktop; carrossel com contador no celular), selo ANÚNCIO.
- Título, preço, condomínio/IPTU, características (área, quartos, banheiros, vagas), descrição, card do anunciante (logo, nome, CRECI, "Ver outros imóveis").
- **Painel de simulação sticky** (desktop, coluna direita): pré-preenchido com o preço do anúncio + entrada %, prazo e juros da última simulação do usuário; SAC/PRICE, renda mínima; CTA principal "Falar com a imobiliária" (WhatsApp) com **prévia da mensagem**; secundários Ligar e Site do anunciante; aviso legal.
- "Outros imóveis na mesma faixa" + 1 bloco AdSense + rodapé.
- Celular: barra fixa com parcela SAC + "Falar no WhatsApp".

Mensagem do WhatsApp (link `https://wa.me/{telefone}?text=` + `encodeURIComponent`):
> Olá! Vi o anúncio {título} na RotaFin. Simulei com {entrada} de entrada em {prazo} anos, parcela de {parcelaSAC} (SAC). Ainda está disponível?

## Regras de cálculo (manter o motor atual, conferir com estas)

- Taxa mensal equivalente: `i = (1 + taxaAnual/100)^(1/12) − 1`
- Financiado `P = valor − entrada`; `n = anos × 12`; seguro mensal `s` (% a.m./100) sobre o saldo
- SAC: amortização `A = P/n`; parcela k = `A + saldo_k × (i + s)`
- PRICE: `pmt = P·i / (1 − (1+i)^−n)`; parcela = `pmt + saldo_k × s`
- Renda mínima estimada = primeira parcela / 0,30
- Modo "Sei quanto posso pagar" (parcela máx. `pm`): financiável SAC = `pm / (1/n + i + s)`; PRICE = `pm·(1 − (1+i)^−n)/i`; imóvel máx. = financiável + entrada
- Conferência: R$ 300.000, entrada R$ 60.000, 30 anos, 10,5% a.a., seguro 0 → SAC 1ª R$ 2.671,90, última R$ 672,24, total R$ 601.945; PRICE R$ 2.110,82, total R$ 759.894; renda SAC R$ 8.906.

## Estado e parâmetros

- Manter a URL com `valor, entrada, prazo, taxa, seguro, sistema` (prefill e compartilhamento; a imagem OG dinâmica já existe).
- Salvar a última simulação (entrada como %, prazo, taxa) em `localStorage` (com try/catch) para pré-preencher a página do anúncio e o "≈ R$ X/mês" dos cards.

## Eventos de analytics (GA4)

`simulacao_interacao` (primeira mudança em qualquer campo — evita contar quem usou o simulador como bounce), `oferta_click` {slug, posicao}, `lead_whatsapp` {slug, origem: card|pagina}, `lead_telefone`, `lead_site_anunciante`, `compartilhar` {canal}. Esses eventos viram o relatório de contatos enviado aos anunciantes.

## A preencher (placeholders entre colchetes no design)

Dados reais dos anúncios (fotos, título, bairro, características, imobiliária, CRECI, telefone), faixas de taxa de referência + fonte + data, CNPJ/responsável no rodapé, páginas Sobre/Contato/Privacidade/Termos.

## Ordem sugerida

1. Tokens, fontes, header e rodapé novos, favicon
2. Hero + calculadora unificada + card de resultado (+ barra fixa no celular)
3. Ofertas patrocinadas + slot AdSense + banner Anuncie
4. Seções de conteúdo (SAC×PRICE, gráfico, tabela anual, taxas, FAQ)
5. Página do anúncio + WhatsApp + localStorage
6. Eventos GA4; checar mobile em 360–390px, CLS e Lighthouse
