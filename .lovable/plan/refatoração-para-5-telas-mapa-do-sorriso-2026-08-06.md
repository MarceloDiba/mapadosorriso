# Refatoração para 5 telas — Mapa do Sorriso

Reestruturação do fluxo atual (8 etapas) para 5 telas limpas, mantendo o shell mobile de 430px centralizado, a identidade visual e os cards verticais estáveis (sem carrossel).

## Novo fluxo

**Tela 1 — Objetivo / Desejo** (Passo 1 de 5 · Seu objetivo)
- Título: "Qual estilo de sorriso você deseja conquistar?" / Subtítulo: "Selecione o estilo visual que mais se aproxima do seu ideal."
- 4 cards com foto: Natural & Harmônico, Rejuvenescido & Claro, Amplo & Simétrico, Ultra Radiante / Hollywood — cada um com a descrição indicada.
- Grid de 2 colunas em telas ≥ 380px dentro do shell, 1 coluna abaixo disso (o shell continua com 430px máx.; sem grid larga de desktop).
- Link discreto no rodapé do conteúdo: "Ainda não sei meu estilo, quero orientação em consulta" (seleciona um perfil "orientação" e avança).

**Tela 2 — Incômodo** (Passo 2 de 5 · Diagnóstico de Queixas)
- Seleção múltipla limitada a 2, com as 5 queixas indicadas. Ao tentar marcar a 3ª, a opção fica desabilitada com aviso "Selecione até 2 opções principais."
- CTA "Avançar" ativa com 1 ou 2 itens.

**Tela 3 — Objeção** (Passo 3 de 5 · Esclarecimentos)
- Lista de rádio única com as 5 dúvidas indicadas.

**Tela 4 — Estágio de decisão** (Passo 4 de 5 · Momento Atual)
- 4 cards de seleção única: Pronto para Agendar, Planejando Investimento, Comparando Opções, Apenas Pesquisando.

**Tela 5 — Mapa do Sorriso** (Análise Concluída)
- Bloco 1: selo de perfil derivado da Tela 1 + resumo (Objetivo, Principal Queixa, Prioridade Técnica).
- Bloco 2: "O Padrão de Qualidade do Seu Planejamento" com os 3 bullets (Design Digital, Laminados Ultra-finos, Porcelana Pura).
- Bloco 3: CTA dinâmico de WhatsApp com texto e mensagem variando conforme a Tela 4 (agendar / investimento / comparando / pesquisando).
- Mantém a tela de "gerando mapa" (loading) antes do resultado e o aviso clínico (sem diagnóstico, sem promessa de resultado, autoridade final é o dentista).

## Decisões confirmadas

- A etapa de captura Nome/WhatsApp é **removida**; o lead se identifica direto no WhatsApp.
- O shell permanece **mobile fixo de 430px** centralizado; nada de layout desktop alargado.
- As 4 fotos dos estilos serão **geradas novas** (retratos editoriais de sorriso, mesma direção estética atual).

## Detalhes técnicos (`src/routes/index.tsx`)

- `STEPS` passa a ser: hero → style → concerns → objection → decision → loading → result. Barra de progresso mostra "Passo X de 5".
- Constantes reescritas: `DESIRE` → `STYLES` (4 itens + flag de orientação), `PERCEPTION` → `CONCERNS`, `SAFETY` → `OBJECTIONS`, `MOMENT` → `DECISION`. `REFERENCES` e o componente `ReferencesGallery` são removidos (o conteúdo educativo vira o Bloco 2 do resultado).
- `Answers` vira `{ style?, concerns: string[], objection?, decision? }`; remove `lead`, `references`, `LeadForm`, `Field`, `maskPhone`.
- `MultiChoiceStep` ganha prop `max={2}`.
- Novo mapa `ctaConfig` (buttonText + message por decisão) usado pelo botão final do WhatsApp; funções de narrativa (`desireNarrative`, `perceptionNarrative`, etc.) e `buildClinicBrief` são ajustadas aos novos ids.
- 4 novas imagens em `src/assets/style-*.jpg`; as antigas `desire-*` / `ref-*` não usadas são removidas.

## Riscos

- Copy e ids mudam bastante — a lógica de narrativa do mapa precisa ser remapeada por completo (não é só renomear).
- Grid 2 colunas dentro de 430px deixa cards menores; imagens em proporção 1:1 para manter legibilidade.

## Checklist de teste

- Zero scroll horizontal em 360, 390 e 1440 px.
- Progresso mostra Passo 1..4 de 5 e conclui no Mapa.
- Tela 2 bloqueia a 3ª seleção; CTA ativa com 1–2.
- Link "Ainda não sei meu estilo" avança normalmente.
- Cada uma das 4 decisões gera o texto de botão e a mensagem de WhatsApp corretos.
