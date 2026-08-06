# Mapa do Sorriso — de quiz para experiência cinematográfica

## Diagnóstico de UI/UX (tela atual)

Problemas observados no fluxo e na tela 5:

1. **Densidade uniforme.** Todas as telas têm o mesmo ritmo: cabeçalho + lista de cards iguais. Sem variação de escala, o cérebro lê "formulário".
2. **Peso visual do chrome.** Header + barra "Passo X de 5" + botão fixo ocupam ~30% da tela, competindo com o conteúdo. O rótulo "Passo X de 5" é a assinatura mais forte de quiz.
3. **Radio/checkbox explícitos.** O quadradinho/bolinha ao lado do texto é vocabulário de formulário; a seleção deveria acontecer no próprio bloco visual.
4. **Duplo esforço.** Selecionar e depois tocar "Continuar" custa dois toques por tela — 8 toques até o resultado.
5. **Telas 2, 3 e 4 sem imagem.** Só texto em cards cinzas; contraste enorme com a Tela 1 e queda de percepção de valor.
6. **Tela 5 é uma parede de cartões.** Seis blocos empilhados com o mesmo raio, mesma borda e muito texto corrido; sem hierarquia, sem imagem, o CTA some no fim do scroll.
7. **Formulário de nome/telefone no meio do resultado** quebra o clima aspiracional exatamente antes da conversão.
8. **Transições secas.** Só um fade-up genérico entre etapas; nada conecta uma escolha à seguinte.

## Direção escolhida

**Linha do tempo cinematográfica** — a jornada é uma faixa vertical contínua; cada escolha faz a próxima cena deslizar para o centro. Avanço **instantâneo com micro-confirmação** (~400ms). Resultado como **cena única com scroll cinematográfico**. Identidade **aberta a evolução**.

Duas mudanças estruturais confirmadas:
- **Fluxo cortado para 3 escolhas + Mapa.** A objeção (antiga Tela 3) sai do caminho e passa a ser perguntada *dentro* do Mapa, depois do resultado — quando o desejo já está ativado e a resposta tem mais valor.
- **A espera vira construção.** Em vez de 2s de "Organizando seu Mapa", o Mapa se monta na frente da pessoa com as respostas dela se encaixando na composição.

## Novo fluxo

```text
Cena 1  Estilo (grid 2x2 de imagens)
Cena 2  O que incomoda (até 2)
Cena 3  Seu momento
Cena 4  Construção do Mapa (animada, ~2s)
Cena 5  Mapa do Sorriso  →  pergunta de objeção embutida
```

## Como fica cada tela

**Chrome minimalista**
- Sai a barra "Passo X de 5". Entra um trilho vertical fino na borda esquerda, com 3 nós; o nó ativo pulsa em dourado e os anteriores ficam preenchidos. Progresso sem linguagem de questionário.
- Header reduz para a logo + nome da clínica, transparente sobre o conteúdo.
- O botão fixo desaparece das telas de escolha única (avanço automático). Fica apenas um "voltar" discreto no canto.

**Cena 1 — Estilo**
- Mantém o grid 2x2 de imagens, mas o card selecionado expande brevemente com escurecimento dos vizinhos antes da transição.

**Cenas 2 e 3 — sem lista de radio**
- Cards viram faixas horizontais largas com fundo texturizado/imagem sutil e o texto em escala grande; a seleção pinta a faixa inteira em dourado suave, sem bolinha nem quadradinho.
- Cena 2 (até 2 queixas): ao marcar a 2ª, avanço automático; com 1 marcada, aparece um "Seguir com esta" flutuante.
- Cena 3 (momento): avanço automático no toque.

**Transição entre cenas**
- Saída da cena atual para cima + entrada da próxima de baixo, com escala leve (efeito de trilho contínuo). Respeita `prefers-reduced-motion`.

**Cena 4 — Construção do Mapa**
- Substitui o spinner. As respostas da pessoa entram na tela uma a uma (estilo → queixas → momento), cada uma se encaixando numa linha da composição, e ao fim a peça se resolve no Mapa. Mesma duração de hoje, mas como recompensa em vez de latência.

**Cena 5 — Mapa (cena única)**
- Abertura em tela cheia: imagem do estilo escolhido, gradiente, nome do perfil em serifa grande e o resumo da jornada — sem cartão, sem borda.
- Abaixo, blocos que se revelam conforme o scroll (impacto, protocolo em 3 pilares numerados, nota de autoridade), com tipografia editorial e menos molduras: separadores finos no lugar de cartões empilhados.
- **Objeção embutida:** um bloco "O que ainda te segura?" com as 5 opções em faixas; ao escolher, o texto de tranquilidade correspondente se revela ali mesmo, sem mudar de tela. Resposta opcional — não bloqueia o CTA.
- CTA de WhatsApp flutuante fixo desde o topo do resultado (não só no fim).
- O formulário nome/telefone sai do meio e vira um passo opcional no toque do CTA (folha deslizante), preservando o rastreio de lead atual.

**Evolução de identidade**
- Mantém dourado + serifa (base white-label), mas com escala tipográfica mais dramática, mais respiro, menos bordas e sombras, e um fundo levemente texturizado para diferenciar do visual "cartão shadcn".

## Detalhes técnicos

- `src/components/smile/SmileQuiz.tsx`: `STEPS` passa a ser hero → style → concerns → decision → building → result; substituir `ProgressBar` por `StepRail` (3 nós); `SingleChoiceStep` ganha `autoAdvance` (seleciona → `setTimeout` ~400ms → `next()`); `MultiChoiceStep` avança ao atingir `max` e mostra CTA flutuante com 1 seleção; `OptionCard` perde o indicador radio/checkbox e vira faixa; `StickyCTA` só aparece onde ainda é necessário.
- `LoadingMap` vira `BuildingMap`, recebendo `answers` para animar a montagem em etapas.
- `ResultMap` é reescrito: hero full-bleed com `clinic.images[answers.style]`, blocos revelados por `IntersectionObserver`, bloco de objeção interativo que chama `onObjection(id)` (grava via `track`) e revela `REASSURANCE_BY_OBJECTION`, CTA flutuante e captura de lead em folha deslizante.
- `src/config/quiz.ts`: `buildSmileMap` continua igual, mas a objeção passa a ser aplicada depois (o mapa é montado sem ela e o texto de tranquilidade é resolvido no clique). Copys e ids inalterados.
- `src/config/funnel.ts`: a etapa `objection` deixa de ser passo 3 do funil e passa a marcar "objeção respondida no Mapa"; `decision` vira o passo 3 e `result` o 4. Os rótulos do funil no admin acompanham a mudança.
- `src/styles.css`: novos tokens/utilities para transições de cena, textura de fundo e escala tipográfica; keyframes respeitando `prefers-reduced-motion`.
- Analytics e painel admin continuam recebendo os mesmos campos (`style`, `concerns`, `objection`, `decision`, `completed`, `whatsappClicked`, lead) — só muda a ordem em que `objection` chega.

## Checklist

- Zero scroll horizontal em 360/390/430px.
- Escolha única avança sozinha; Cena 2 avança na 2ª seleção e oferece seguir com 1.
- Voltar funciona em todas as cenas e desfaz o avanço automático.
- Construção do Mapa mostra as respostas reais da pessoa, não um spinner.
- Objeção respondida dentro do Mapa grava em `clinic_sessions.objection` e revela o texto certo.
- Tela final com CTA sempre alcançável e captura de lead opcional preservada.
- Nenhum texto de "Passo X de 5" ou controle com cara de formulário.

