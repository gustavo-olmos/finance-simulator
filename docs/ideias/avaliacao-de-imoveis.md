# Avaliação rápida do imóvel pelo visitante

**Status:** ideia. Faz sentido só quando cada anúncio tiver tráfego (ver [README.md](README.md), ordem sugerida).

## A ideia original

Um pop-up com poucas perguntas de múltipla escolha:

- "O imóvel está bem conservado?"
- "As fotos estão boas?"
- "A região é boa?"
- "O preço está adequado?"

Alternativas: **Sim · Podia ser melhor · Não**, agrupadas, e **Não sei** separado das outras.

## Decisão principal: para quem é o dado?

- **Se a nota for pública:** uma avaliação negativa visível afasta justamente quem paga (conflito de interesse). E, com pouco tráfego, cada anúncio terá 1 a 3 votos, o que é ruído.
- **Recomendação: privado, como relatório para o anunciante** ("62% acharam as fotos fracas"). Vira produto e argumento de venda ([anunciantes-e-metricas.md](anunciantes-e-metricas.md)).
- Se um dia for público: só agregado e só a partir de um número mínimo de votos por anúncio.

## Formato: evitar o pop-up que bloqueia a tela

- **SEO:** o Google penaliza pop-ups que cobrem o conteúdo no celular, e as páginas de anúncio dependem de busca.
- **Conversão:** o pop-up interrompe a pessoa antes do clique no WhatsApp, que é justamente o que se vende ao anunciante.
- **Alternativa:** um painel que não bloqueia a tela, aberto num bom momento:
  - **Melhor momento:** quando a pessoa volta do WhatsApp (evento `visibilitychange`): "O que achou deste imóvel?"
  - Ou depois que ela usou o simulador e rolou até o fim da página.
  - No desktop, opcionalmente, quando o mouse sai em direção a fechar a aba.
- Uma pergunta por vez, avançando sozinho; pode fechar a qualquer momento, e as respostas parciais contam.

## Ajustes nas perguntas

- **"Bem conservado?" e "Fotos boas?" se sobrepõem:** o visitante só julga a conservação pelas fotos. Juntar ou trocar uma delas.
- **"A região é boa?":** só quem conhece a região responde. O "Não sei" é essencial aqui.
- **"O preço está adequado?"** com "Podia ser melhor" não diz se a pessoa acha caro ou barato. Para essa pergunta, **"Caro · Justo · Barato · Não sei"** informa mais. Isso quebra a escala única, mas a informação vale a troca.
- **Falta a pergunta mais valiosa para o anunciante: "Você visitaria este imóvel?"**, que mede intenção.
- **"Não sei" separado:** manter. Separar a opção que não opina das três que opinam reduz o chute, e o "Não sei" fica fora da média.

Proposta revisada (a validar):
1. As fotos mostram bem o imóvel? — Sim · Podia ser melhor · Não | Não sei
2. A região é boa? — Sim · Podia ser melhor · Não | Não sei
3. O preço parece… — Caro · Justo · Barato | Não sei
4. Você visitaria este imóvel? — Sim · Talvez · Não

## Cuidados

- **Abuso:** concorrentes ou o próprio anunciante podem manipular votos. Usar um ID anônimo salvo no navegador, 1 voto por anúncio por ID e limite de envios por IP no servidor. Isso não impede tudo, por isso também não publicar as notas.
- **LGPD:** um ID anônimo que persiste entre visitas é dado pseudonimizado. Exige política de privacidade explicando o uso (a página `/privacidade` ainda não existe).
- **Volume:** só mostrar resultado ao anunciante a partir de um mínimo de respostas.

## Depende de

- Backend para gravar as respostas ([backend-leve.md](backend-leve.md), tabela `avaliacoes`).
- Página `/privacidade`.
- Tráfego por anúncio.

## Decisões em aberto

- [ ] Público ou privado (recomendação: privado).
- [ ] Gatilho de abertura.
- [ ] Lista final de perguntas e escalas.
- [ ] Mínimo de respostas para mostrar resultado.
