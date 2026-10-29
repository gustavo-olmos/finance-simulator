---
titulo: "Quanto preciso ganhar para financiar um imóvel?"
tituloSeo: "Quanto preciso ganhar para financiar um imóvel? Veja a tabela"
descricao: "Veja a renda necessária para financiar imóveis de R$ 200 mil a R$ 700 mil, a conta que o banco faz e o que muda com entrada, prazo e juros."
slug: quanto-preciso-ganhar-para-financiar-imovel
tag: Renda
tom: verde
resumo: "A conta dos 30% que o banco faz, com tabela de renda por valor de imóvel."
status: rascunho          # rascunho | publicado — só publicar depois da aprovação do Gustavo
atualizadoEm: 2026-10-28
revisarEm: 2027-01-28     # conferir taxa de referência e regras a cada 3 meses
capa: quanto-preciso-ganhar-para-financiar-imovel.jpg
capaAlt: "Mão segurando chaves com um chaveiro em forma de casa, na entrada de um apartamento"
capaCredito: "Foto: Jakub Żerdzicki / Unsplash"
premissas: "Números do motor do RotaFin (finance-calculator.service.ts): taxa de 11% ao ano, 30 anos (360 meses), sem seguro, entrada de 20% salvo indicação."
cta:
  titulo: "Faça a conta com os seus números"
  subtitulo: "A tabela usa valores redondos. Para ver a sua situação, coloque o valor do imóvel, a sua entrada, o prazo e a taxa no simulador. Ele mostra a parcela no SAC e na Price e a renda mínima estimada, na hora e sem cadastro."
  texto: "Simular com os meus números"
  url: "/financiamento-imovel?valor=300000&entrada=60000&prazo=360&taxa=11&seguro=0"
---

**Resposta curta:** os bancos costumam aceitar que a parcela do financiamento ocupe **até 30% da renda bruta** da família. Para um imóvel de **R$ 300 mil**, com **R$ 60 mil de entrada**, em **30 anos** e juros de **11% ao ano**, a primeira parcela fica em cerca de **R$ 2.763** no SAC. Isso pede uma renda familiar de aproximadamente **R$ 9.210 por mês**. Na tabela Price, a parcela é de **R$ 2.192** e a renda cai para cerca de **R$ 7.307**.

Abaixo você vê a conta passo a passo, uma tabela para outros valores de imóvel e o caminho contrário: quanto dá para financiar com a renda que você tem.

## A conta que o banco faz

A lógica é simples e cabe em três passos:

1. **Calcule a parcela.** Ela depende do valor financiado (preço do imóvel menos a entrada), do prazo e da taxa de juros.
2. **Divida a parcela por 0,30.** O resultado é a renda mínima que o banco espera ver.
3. **Some outras dívidas.** Se você já paga um carro ou um empréstimo, o banco desconta essas parcelas do espaço disponível. Na prática, sobra menos renda para o imóvel.

> [!conta] R$ 2.763 ÷ 0,30 = R$ 9.210 de renda

A renda considerada é a **bruta** (antes dos descontos) e pode ser **familiar**: dá para somar a renda de outra pessoa que vai comprar junto, como cônjuge ou parente, dentro das regras de cada banco.

## Tabela: renda necessária por valor do imóvel

Premissas: entrada de 20%, prazo de 30 anos, juros de 11% ao ano. No SAC, a tabela mostra a **primeira** parcela, que é a mais alta.

| Valor do imóvel | Entrada (20%) | 1ª parcela SAC | Renda mínima (SAC) | Parcela Price | Renda mínima (Price) |
|---|---|---|---|---|---|
| R$ 200.000 | R$ 40.000 | R$ 1.842 | R$ 6.140 | R$ 1.461 | R$ 4.871 |
| R$ 300.000 | R$ 60.000 | R$ 2.763 | R$ 9.210 | R$ 2.192 | R$ 7.307 |
| R$ 400.000 | R$ 80.000 | R$ 3.684 | R$ 12.280 | R$ 2.923 | R$ 9.742 |
| R$ 500.000 | R$ 100.000 | R$ 4.605 | R$ 15.350 | R$ 3.653 | R$ 12.178 |
| R$ 700.000 | R$ 140.000 | R$ 6.447 | R$ 21.490 | R$ 5.115 | R$ 17.049 |

> [!destaque] ≈ R$ 3 mil | de renda para cada **R$ 100 mil** de imóvel, no SAC, com essas condições. Um jeito rápido de ler a tabela.

## Por que o SAC pede mais renda?

No SAC, a parcela **começa mais alta e diminui todo mês**. No imóvel de R$ 300 mil da tabela, ela sai de R$ 2.763 e termina em cerca de R$ 672. Na Price, a parcela fica **igual** do começo ao fim.

Como o banco olha para a primeira parcela, o SAC exige mais renda na largada. Em troca, você paga menos juros no total: no mesmo exemplo, são cerca de R$ 378 mil de juros no SAC contra R$ 549 mil na Price.

## O caminho contrário: tenho essa renda, quanto consigo financiar?

Se você já sabe quanto ganha, a pergunta muda: qual o maior valor que o banco empresta? A parcela máxima é 30% da renda. A partir dela, o simulador calcula o valor financiável.

Premissas: 30 anos, 11% ao ano. O valor abaixo é **o que o banco financia**. Some a sua entrada para chegar ao preço do imóvel.

| Renda familiar | Parcela máxima (30%) | **Dá para financiar (SAC)** | **Dá para financiar (Price)** |
|---|---|---|---|
| R$ 4.000 | R$ 1.200 | R$ 104.236 | R$ 131.383 |
| R$ 6.000 | R$ 1.800 | R$ 156.354 | R$ 197.075 |
| R$ 8.000 | R$ 2.400 | R$ 208.471 | R$ 262.767 |
| R$ 10.000 | R$ 3.000 | R$ 260.589 | R$ 328.458 |
| R$ 15.000 | R$ 4.500 | R$ 390.884 | R$ 492.688 |

Exemplo: com renda de R$ 10 mil e R$ 65 mil de entrada, dá para mirar em imóveis de até cerca de R$ 325 mil no SAC (R$ 260.589 + R$ 65.000).

No RotaFin, essa conta está no modo **"Sei quanto posso pagar"**: você informa a parcela que cabe no bolso e o simulador mostra até quanto o imóvel pode custar.

> [!atalho] /financiamento-imovel?modo=renda&parcela=3000&entrada=65000&prazo=360&taxa=11&seguro=0 | Sei quanto posso pagar por mês | Veja até quanto o imóvel pode custar.

## Três coisas que mudam a renda necessária

Todos os exemplos abaixo usam o imóvel de R$ 300 mil.

### 1. A entrada (o que mais pesa)

| Entrada | 1ª parcela SAC | Renda mínima (SAC) |
|---|---|---|
| 10% (R$ 30 mil) | R$ 3.108 | R$ 10.361 |
| 20% (R$ 60 mil) | R$ 2.763 | R$ 9.210 |
| 30% (R$ 90 mil) | R$ 2.418 | R$ 8.059 |
| 40% (R$ 120 mil) | R$ 2.072 | R$ 6.907 |

Cada 10% a mais de entrada reduz a renda exigida em cerca de R$ 1.150. Se você tem saldo de FGTS, ele pode entrar como parte da entrada, desde que você e o imóvel cumpram as regras do fundo.

### 2. O prazo (ajuda menos do que parece)

| Prazo | 1ª parcela SAC | Renda mínima (SAC) | Juros totais (SAC) |
|---|---|---|---|
| 20 anos | R$ 3.096 | R$ 10.321 | R$ 252.604 |
| 25 anos | R$ 2.896 | R$ 9.654 | R$ 315.494 |
| 30 anos | R$ 2.763 | R$ 9.210 | R$ 378.383 |
| 35 anos | R$ 2.668 | R$ 8.892 | R$ 441.272 |

Passar de 30 para 35 anos baixa a parcela em menos de R$ 100, mas acrescenta mais de R$ 60 mil em juros. Esticar o prazo ajuda a aprovar, mas sai caro.

### 3. A taxa de juros

| Taxa ao ano | 1ª parcela SAC | Renda mínima (SAC) |
|---|---|---|
| 9% | R$ 2.396 | R$ 7.988 |
| 10% | R$ 2.580 | R$ 8.602 |
| 11% | R$ 2.763 | R$ 9.210 |
| 12% | R$ 2.944 | R$ 9.813 |
| 13% | R$ 3.124 | R$ 10.412 |

Cada ponto percentual a mais na taxa pede cerca de R$ 600 a mais de renda. Por isso vale comparar bancos: a taxa muda com o relacionamento (conta salário, débito automático) e com a linha de crédito.

## O que essa conta não inclui

Os números acima são uma estimativa para comparar cenários. A parcela real costuma ser um pouco maior, porque o banco acrescenta:

- **Seguros obrigatórios** (de morte e invalidez e de danos ao imóvel), cobrados junto com a parcela;
- **Taxa de administração** mensal, em alguns bancos;
- **Correção do saldo** pela TR ou por outro índice, conforme a modalidade.

O conjunto de tudo isso aparece no **CET (Custo Efetivo Total)**, que o banco é obrigado a informar na proposta. Por isso, deixe uma folga: se a sua renda bate no limite exato da tabela, a aprovação pode não sair.

Além disso, a compra tem custos que não entram no financiamento, como ITBI, escritura e registro. Eles saem do seu bolso e diminuem o dinheiro disponível para a entrada.

---

*Sobre os números: todos foram calculados pelo simulador do RotaFin com taxa de 11% ao ano, que fica dentro da faixa de taxas de balcão dos grandes bancos em 2026 (cerca de 11% a 12% ao ano, mais TR). Não incluem seguros, tarifas nem correção. Valores atualizados em 28/10/2026. O RotaFin não concede crédito: a aprovação e as condições finais dependem da análise do banco.*

*Fontes: regra de comprometimento de até 30% da renda bruta — [Serasa, jun/2026](https://www.serasa.com.br/credito/blog/comprometimento-de-renda-financiamento-imobiliario/); taxas de balcão de 2026 — [Larya, ranking de bancos](https://larya.com.br/blog/qual-e-o-melhor-banco-para-financiar-um-imovel/) e [MySide, radar de taxas](https://myside.com.br/guia-imoveis/taxa-juros-financiamento-imobiliario).*
