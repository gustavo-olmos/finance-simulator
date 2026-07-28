# TODO — RotaFin

## SEO / Conteúdo — página financiamento-imovel

**Status:** escopo e posicionamento aprovados; falta redigir o texto final (precisa aprovação do Gustavo antes de publicar).

Expandir a seção `.texto` já existente em `simulador-page.component.html` (hoje fica entre `app-amortization-table` e `app-comparison-table`), **sem alterar nenhum componente funcional** (simulador, comparison-table, amortization-table, faq):

- **H2 (existente):** "Como funciona o simulador de financiamento de imóvel" — manter a intro atual e adicionar um H3 "Passo a passo" com 5 itens mapeados aos campos reais do formulário: valor do imóvel, entrada, prazo, taxa de juros anual, sistema (SAC/PRICE).
- **H2 novo:** "Como é feito o cálculo do SAC e do PRICE" — H3 SAC (amortização constante = valor financiado ÷ prazo; parcela = amortização + juros sobre o saldo devedor, por isso decresce) e H3 PRICE (parcela fixa via a fórmula de prestação constante), mais a explicação da conversão taxa anual → mensal que o simulador já faz. Fórmulas confirmadas em `finance-calculator.service.ts`, não inventar números.
- **H2 novo:** "SAC ou PRICE: qual escolher" — texto decisório complementando a `comparison-table` visual (não duplicar o que a tabela já mostra).

**Posicionamento:** mantém onde o `.texto` já está (depois da tabela de amortização, antes da comparação) — decisão explícita de não mover para cima da calculadora. Motivo: o usuário quer ver o resultado da simulação (tabela de amortização) antes de um bloco de texto longo; SEO não é sensível à posição visual do conteúdo na página; evita interferir no `app-ad-slot` "topo" que fica logo após a calculadora.

**Referência de tom/estrutura:** investidorsardinha.r7.com/calculadoras/{primeiro-milhao, calculadora-de-renda, calculadora-de-juros-compostos} — intro curta, "passo a passo" mapeado aos campos reais, fórmula explicada em linguagem simples. Essas páginas não usam FAQ separado (nós já temos).

---

## UX — reduzir bounce rate com formulário de entrada

**Status:** em discussão, nada implementado ainda.

Ideia do Gustavo: formulário curto (máx. 4 campos) acima da calculadora atual, mostrando só título + formulário na primeira dobra (sem os sliders visíveis), com um CTA "Me leve à calculadora ↓" que rola até o componente da calculadora de verdade. Objetivo: reduzir a fricção para usuário leigo que não sabe usar sliders; usuário recorrente/experiente pula direto pra calculadora.

Ver discussão detalhada na conversa — pontos em aberto antes de implementar:
1. Os valores digitados no formulário de entrada devem pré-preencher a calculadora abaixo (reaproveitando o mecanismo de query params que já existe) — senão o usuário digita duas vezes.
2. Decidir se os 4 campos duplicam os campos da calculadora (valor/entrada/prazo/taxa) ou se already é uma versão simplificada do "modo inverso" (renda mensal → quanto consigo financiar) já planejado em `produto-modo-inverso` (memória, jul/2026) — pesquisa com usuários leigos mostrou que eles tentam digitar quanto podem pagar por mês, não o valor do imóvel.
3. Onde fica o H1 "Calculadora de Financiamento" nessa nova estrutura — precisa continuar sendo o primeiro heading visível da página.
4. Vale validar com analytics (Vercel Analytics já instalado) antes de assumir que resolve o bounce rate — é uma mudança na página de maior tráfego do site.
