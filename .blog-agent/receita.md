# Receita: como escrever um guia do RotaFin

Instruções para quem escreve os guias do blog (`/guias`): o blog-agent e o Claude Code no VS Code. Siga tudo à risca. O build valida o formato e falha se algo estiver errado.

## Regras que não mudam

1. **Nenhum texto vai ao ar sem aprovação do Gustavo.** Todo post novo sai com `status: rascunho`. Nunca troque para `publicado`: isso é feito pelo Gustavo depois de revisar.
2. **Nenhum número de cabeça.** Toda parcela, renda, juro ou prazo sai das ferramentas `simular_financiamento` e `quanto_posso_financiar` (ver "Números"). Todo fato (regra, taxa, teto, dado de mercado) tem fonte com link nas notas do fim.
3. **Um arquivo por post:** `src/content/blog/<slug>.md`. A capa vem do Unsplash pela URL, sem arquivo de imagem (ver "Capa"). Não altere nenhum outro arquivo do projeto.
4. **Antes de terminar, rode `npm run blog`** e corrija até passar sem erros. Ele valida os metadados, a marcação e a capa.

## Antes de escrever

- Liste `src/content/blog/` e leia pelo menos um post inteiro: é o modelo de estrutura e de tom.
- Não repita um tema que já existe. Se o tema pedido se sobrepõe a um post existente, escreva com outro ângulo e coloque um link para o post existente (`/guias/<slug>`).
- Pesquise as regras e números atuais na web. Prefira fontes oficiais (Caixa, Banco Central, gov.br, Conselho Curador do FGTS) e veículos grandes. Anote a data de cada dado.

## Metadados (frontmatter)

Copie este modelo e preencha todos os campos:

```yaml
---
titulo: "Pergunta ou frase que a pessoa digita no Google"
tituloSeo: "Versão para o <title>, com a palavra-chave no começo (até ~60 caracteres)"
descricao: "Meta description de 140 a 160 caracteres: o que o post responde, com números ou termos concretos."
slug: palavras-chave-sem-acento-com-hifens
tag: Etiqueta curta
tom: verde
resumo: "Uma frase curta para o card da página inicial."
status: rascunho         # rascunho | publicado — só publicar depois da aprovação do Gustavo
publicadoEm: AAAA-MM-DD
atualizadoEm: AAAA-MM-DD
revisarEm: AAAA-MM-DD     # o que conferir a cada 3 meses (taxas, tetos, regras)
capaUnsplash:            # bloco devolvido por escolher_foto_unsplash, sem mudar nada
  url: "https://images.unsplash.com/photo-...?ixid=..."
  autor: "Nome do fotógrafo"
  perfil: "https://unsplash.com/@usuario"
capaAlt: "Descrição do que aparece na foto, para quem não vê a imagem"
premissas: "Todas as premissas das contas: valor do imóvel, entrada, prazo em anos e meses, sistema, taxa ao ano, seguro, TR."
cta:
  titulo: "Faça a conta com os seus números"
  subtitulo: "Uma ou duas frases que ligam o exemplo do post ao simulador."
  texto: "Simular com os meus números"
  url: "/financiamento-imovel?valor=300000&entrada=60000&prazo=360&taxa=11&seguro=0"
---
```

Regras dos campos:

- `slug`: só minúsculas, números e hífens, sem acento. **O nome do arquivo é igual ao slug** (`<slug>.md`).
- `tag`: uma ou duas palavras (exemplos em uso: `Renda`, `FGTS`, `Primeiro imóvel`).
- `tom`: `verde` ou `ambar`. Muda só a cor da etiqueta. Use um tom diferente do post mais recente.
- `publicadoEm` e `atualizadoEm`: a data de hoje. `revisarEm`: hoje + 3 meses, com um comentário dizendo o que conferir.
- `cta.url`: sempre um caminho do site (começa com `/`) com os números do exemplo do post.

Parâmetros dos simuladores (`/financiamento-imovel` e `/financiamento-veiculo`):

| Parâmetro | Significado | Exemplo |
|---|---|---|
| `valor` | valor do bem, em reais | `300000` |
| `entrada` | entrada, em reais | `60000` |
| `prazo` | prazo **em meses** | `360` |
| `taxa` | juros **ao ano**, em %, com ponto decimal | `11.5` |
| `seguro` | seguro mensal em % (use `0`) | `0` |
| `modo=renda` + `parcela` | abre no modo "Sei quanto posso pagar por mês" | `modo=renda&parcela=3000` |

## Estrutura do corpo

Siga esta ordem:

1. **Resposta curta.** O primeiro parágrafo começa com `**Resposta curta:**` e responde à pergunta do título em 2 a 4 frases, com os números principais em **negrito**. Vira o bloco destacado do topo.
2. **Parágrafo-ponte.** Uma ou duas frases dizendo o que vem abaixo, ou o ponto que a maioria das pessoas esquece.
3. **De 4 a 7 seções `##`.** Os títulos são perguntas ou termos que as pessoas buscam ("Quem pode usar o FGTS", "Por que o SAC pede mais renda?"). Use `###` para subseções. **Nunca use `#`**: o H1 vem do `titulo`.
4. **Pelo menos um exemplo com números do motor**, numa tabela ou conta, com um parágrafo `Premissas: ...` logo abaixo da tabela.
5. **Um bloco `[!atalho]`** que leva ao simulador com os números do exemplo, no meio do texto, depois do exemplo.
6. **`## Em resumo`** com uma lista numerada de 3 a 6 passos práticos, cada um com o início em negrito.
7. **Notas do fim**, depois de uma linha `---`, em itálico:
   - `*Sobre os números: ...*` diz como as contas foram feitas, o que não incluem (seguros, tarifas, TR), a data em que as regras valiam e que **o RotaFin não concede crédito: a aprovação e as condições finais dependem da análise do banco.*`
   - `*Fontes: assunto — [Veículo](url); assunto — [Veículo](url).*`

Tamanho: de 1.500 a 2.000 palavras.

## Marcação disponível

Só Markdown (GFM) mais os marcadores abaixo. **HTML cru não é permitido** e quebra o build.

```md
> [!destaque] ≈ R$ 3 mil | de renda para cada **R$ 100 mil** de imóvel, no SAC.
> [!conta] R$ 2.763 ÷ 0,30 = R$ 9.210 de renda
> [!atalho] /financiamento-imovel?valor=400000&entrada=120000&prazo=360&taxa=11.5&seguro=0 | Simular este exemplo | Mude a entrada e veja a parcela.

Premissas: entrada de 20%, prazo de 30 anos, juros de 11% ao ano.
```

- `[!destaque]`: `valor | texto`. Use uma ou duas vezes no post, no número que a pessoa deve guardar.
- `[!conta]`: precisa de um `=`; operadores `÷ × + −` separados por espaços.
- `[!atalho]`: `/caminho | Título | Texto`.
- Um parágrafo que começa com `Premissas:` sai menor e em cinza.
- **Tabelas:** escrever `SAC` ou `Price` no cabeçalho vira o chip colorido do sistema; uma coluna "Renda…" depois de SAC/Price fica na cor do sistema. Números em células próprias (`R$ 2.593`, `4,75%`, `8,0 anos`).
- **Links:** só `https://`, caminhos do site (`/guias/...`, `/financiamento-imovel...`), `mailto:` ou `#`. Links externos abrem em nova aba sozinhos.

## Tom de voz

- Português do Brasil, falando com "você". Frases curtas e diretas, um assunto por parágrafo.
- Responda primeiro, explique depois. Nada de introdução genérica ("Comprar um imóvel é o sonho de muitos...").
- Termo técnico só com explicação na mesma frase (ex.: "amortizar, ou seja, abater parte da dívida").
- Sem exagero nem promessa ("o guia definitivo", "segredo", "imperdível"), sem emojis, sem pontos de exclamação.
- Números no padrão brasileiro: `R$ 2.763`, `R$ 280 mil`, `R$ 2,25 milhões`, `11,5% ao ano`, `30 anos (360 meses)`.
- Neutro sobre bancos e produtos: compare, não recomende um banco.

## Números

Calcule tudo com as ferramentas `simular_financiamento` (parcelas, juros e renda) e `quanto_posso_financiar` (caminho inverso). Elas usam a **mesma fórmula do simulador** (`src/app/core/finance-calculator.service.ts`). Não estime. Para referência, a fórmula é:

- Taxa mensal efetiva: `i = (1 + taxaAnual/100)^(1/12) − 1`
- Valor financiado: `P = valor − entrada`; `n` = prazo em meses
- **SAC:** amortização `P/n`; 1ª parcela `P/n + P·i` (é a mais alta, a que o banco usa na análise)
- **Price:** parcela `P·i / (1 − (1+i)^−n)`
- Renda mínima estimada: `parcela ÷ 0,30`
- Juros totais: some os juros mês a mês (saldo × i)
- Arredonde para reais na apresentação e repita os mesmos valores em `premissas`, no parágrafo `Premissas:` e no `cta.url`.

## Capa

- **Foto real** do Unsplash. **Nunca** imagem gerada por IA nem ilustração.
- Use `buscar_foto_unsplash` (termos em inglês), olhe as miniaturas e escolha uma foto horizontal, sem texto escrito na imagem, que combine com o tema: pessoas reais, casas, chaves, mudança, carros. Se nenhuma servir, busque com outros termos.
- Chame `escolher_foto_unsplash` com o id e cole o bloco `capaUnsplash` que ela devolve no frontmatter, sem mudar nada. **Não baixe a imagem:** o site a exibe pela URL do Unsplash, como pedem os termos da API, e o build corta em 16:9 e 1200×630.
- Escreva `capaAlt` em português, descrevendo a cena para quem não vê a imagem. O crédito com links é montado pelo site.
- Capa feita à mão pelo Gustavo (arquivo `.jpg` ao lado do post, com `capa` e `capaCredito`) continua valendo. Não use os dois formatos no mesmo post.

## Pautas sugeridas

Temas da lista de conteúdo do RotaFin ainda sem post: Minha Casa Minha Vida (faixas e taxas), custos da compra (ITBI, escritura e registro), SAC ou Price, amortização antecipada (prazo ou parcela), alugar ou comprar, entrada do carro, CET.

## Checklist final

- [ ] `npm run blog` passa sem erros.
- [ ] `status: rascunho`.
- [ ] Todo número saiu das ferramentas de simulação; todo fato tem fonte nas notas.
- [ ] Tem `**Resposta curta:**`, pelo menos um `Premissas:`, um `[!atalho]`, `## Em resumo` e as notas depois de `---`.
- [ ] Capa é foto real do Unsplash, com o bloco `capaUnsplash` intacto e `capaAlt` em português.
- [ ] Nenhum arquivo além do `.md` foi alterado.
