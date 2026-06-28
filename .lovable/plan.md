## Diagnóstico provável

A Etapa 1 (Desejo) usa um carrossel "full-bleed" dentro de `<main>` que já tem padding lateral. Três fatores combinam para criar a sensação de "vazamento horizontal e largura infinita":

1. **`-mx-5` no Carousel** (`src/routes/index.tsx`, linha 557): o trilho do carrossel é puxado para fora do padding do `<main>`, ficando ~40px mais largo que o conteúdo. Isso, somado a `snap-center`, faz o primeiro card aparecer "deslocado" e a próxima peça muito grande à direita.
2. **Cards muito altos e largos** (`w-[82%]` + `aspect-[3/4]`, linha 572-575): em 430px de largura, cada card fica ~352×470 px **antes** do texto, ocupando mais que a viewport visível e dando sensação de tela infinita.
3. **`html`/`body` sem `overflow-x: hidden`** globalmente (`src/styles.css`): a única barreira é o wrapper React; qualquer descendente que escape (animação, transform, shadow no preview desktop) gera scroll horizontal da página inteira.

Adicionalmente, o `StickyCTA` usa `position: absolute` ancorado no shell mobile, mas o `<main>` reserva apenas `pb-32` — em telas curtas ele pode esconder o último card do carrossel.

## Arquivos / componentes envolvidos

- `src/styles.css` — adicionar `overflow-x: hidden` em `html, body` e utilitário de track de carrossel.
- `src/routes/index.tsx`:
  - `SmileLab` (shell, linhas 180-283) — garantir contenção;
  - `Carousel` (linhas 548-622) — corrigir trilho e dimensões;
  - `ReferencesGallery` (linhas 461-519) — mesma correção do trilho;
  - `StickyCTA` (linhas 880-919) — confirmar comportamento dentro do shell.

## Plano de correção

### 1. Travar overflow horizontal globalmente
Em `src/styles.css`, adicionar em `@layer base`:
```css
html, body { overflow-x: hidden; max-width: 100%; }
```
No shell (`SmileLab`), manter `overflow-x-hidden` no wrapper externo e adicionar `overflow-x: hidden` explícito no `<main>` (já existe `overflow-x-hidden`, mantém). Garantir que NENHUM filho direto do shell use `-mx-*` que escape do shell.

### 2. Refazer o trilho do Carousel (sem full-bleed)
Em `src/routes/index.tsx → Carousel`:
- Remover `-mx-5` do wrapper.
- Trilho: `flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth` com `scroll-padding-left: 0` e padding lateral pequeno (`pr-10`) só para permitir o peek do último card.
- Cards: `basis-[86%] max-w-[320px] shrink-0 snap-start` (em vez de `w-[82%] snap-center`). Isso garante:
  - 1 card principal sempre alinhado à esquerda do container,
  - peek consistente (~14%) do próximo card,
  - largura máxima travada para o card nunca crescer além da viewport mobile.
- Imagem: trocar `aspect-[3/4]` por `aspect-[4/5]` para reduzir altura.
- Manter dots de progresso abaixo.

### 3. Aplicar mesmo padrão na `ReferencesGallery`
Mesma lógica: remover `-mx-5`, usar `basis-[86%] max-w-[320px] snap-start`, `aspect-[4/5]`.

### 4. Garantir respiro para o StickyCTA
- Aumentar `pb-32` → `pb-36` no `<main>` quando `showCTA` está ativo.
- Confirmar `StickyCTA` permanece `absolute inset-x-0 bottom-0` dentro do shell `relative` (já está) e que o gradiente cobre o último card sem cortá-lo.
- Estado `disabled` já existe (`bg-muted text-muted-foreground`); reforçar `cursor-not-allowed` e opacidade para clareza.

### 5. Container mobile
- Manter `max-w-[430px]` no shell, centralizado em desktop, `w-full` no mobile (já está).
- `min-h-[100dvh]` no wrapper externo E no shell (já está).
- Padding lateral consistente: `px-5` em `<main>`, `px-4` no CTA — manter.

## Riscos

- Mudar de `snap-center` para `snap-start` altera levemente a sensação de navegação (não centraliza); compensado pelo peek do próximo card que torna a affordance mais clara.
- `max-w-[320px]` nos cards pode parecer pequeno em iPhone Pro Max (430px); aceitável porque preserva o peek e evita overflow em telas menores (360px).
- Adicionar `overflow-x: hidden` no `body` impede usos futuros de `position: sticky` horizontal — não é o caso aqui.

## Checklist de teste

Após a correção, validar em três viewports via Playwright (headless Chromium):

- [ ] **iPhone 390×844**: home renderiza sem scroll horizontal; "Começar agora" avança; Etapa 1 mostra 1 card + peek do próximo; sem scroll lateral da página; CTA visível sem cobrir card.
- [ ] **Android 360×800**: cards não excedem viewport; carrossel rola apenas internamente; texto do card legível.
- [ ] **Desktop 1280×800**: shell centralizado em 430px; sem scroll horizontal global; mesmo comportamento de carrossel dentro do shell.
- [ ] Console sem warnings de layout/overflow.
- [ ] Repetir avanço por todas as etapas (Desejo → Mapa) confirmando que nenhuma etapa quebra o shell.