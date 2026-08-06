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

## Como fica cada tela

**Chrome minimalista**
- Sai a barra "Passo X de 5". Entra um trilho vertical fino na borda esquerda, com 5 nós; o nó ativo pulsa em dourado e os anteriores ficam preenchidos. Progresso sem linguagem de questionário.
- Header reduz para a logo + nome da clínica, transparente sobre o conteúdo.
- O botão fixo desaparece das telas de escolha única (avanço automático). Fica apenas um "voltar" discreto no canto.

**Tela 1 — Estilo**
- Mantém o grid 2x2 de imagens, mas o card selecionado expande brevemente com escurecimento dos vizinhos antes da transição.

**Telas 2, 3 e 4 — sem lista de radio**
- Cards viram faixas horizontais largas com fundo texturizado/imagem sutil e o texto em escala grande; a seleção pinta a faixa inteira em dourado suave, sem bolinha nem quadradinho.
- Tela 2 (até 2 queixas): ao marcar a 2ª, avanço automático; com 1 marcada, aparece um "Seguir com esta" flutuante.
- Telas 3 e 4: avanço automático no toque.

**Transição entre cenas**
- Saída da cena atual para cima + entrada da próxima de baixo, com escala leve (efeito de trilho contínuo). Respeita `prefers-reduced-motion`.

**Tela 5 — Mapa (cena única)**
- Abertura em tela cheia: imagem do estilo escolhido, gradiente, nome do perfil em serifa grande e o resumo da jornada — sem cartão, sem borda.
- Abaixo, blocos que se revelam conforme o scroll (impacto, protocolo em 3 pilares numerados, tranquilidade, nota de autoridade), com tipografia editorial e menos molduras: separadores finos no lugar de cartões empilhados.
- CTA de WhatsApp flutuante fixo desde o topo do resultado (não só no fim).
- O formulário nome/telefone sai do meio e vira um passo opcional no toque do CTA (folha deslizante), preservando o rastreio de lead atual.

**Evolução de identidade**
- Mantém dourado + serifa (base white-label), mas com escala tipográfica mais dramática, mais respiro, menos bordas e sombras, e um fundo levemente texturizado para diferenciar do visual "cartão shadcn".

## Detalhes técnicos

- `src/components/smile/SmileQuiz.tsx`: substituir `ProgressBar` por `StepRail`; `SingleChoiceStep` ganha `autoAdvance` (seleciona → `setTimeout` ~400ms → `next()`); `MultiChoiceStep` avança ao atingir `max` e mostra CTA flutuante com 1 seleção; `OptionCard` perde o indicador radio/checkbox e vira faixa com estado selecionado; `StickyCTA` só aparece onde ainda é necessário.
- `ResultMap` é reescrito: hero full-bleed com `clinic.images[answers.style]`, blocos revelados por `IntersectionObserver`, CTA flutuante e captura de lead em folha deslizante.
- `src/styles.css`: novos tokens/utilities para as transições de cena, textura de fundo e escala tipográfica; keyframes respeitando `prefers-reduced-motion`.
- Sem mudança em `src/config/quiz.ts` (lógica/copys), em analytics ou no painel admin. O rastreio `funnelStep`, `completed`, `whatsappClicked` e lead continua idêntico.

## Checklist

- Zero scroll horizontal em 360/390/430px.
- Escolha única avança sozinha; Tela 2 avança na 2ª seleção e oferece seguir com 1.
- Voltar funciona em todas as cenas e desfaz o avanço automático.
- Tela 5 com CTA sempre alcançável e captura de lead opcional preservada.
- Nenhum texto de "Passo X de 5" ou controle com cara de formulário.
