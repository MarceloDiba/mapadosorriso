## Diagnóstico

O vazamento horizontal vem do trilho do carrossel em duas etapas (`Carousel` na Etapa 1 e `ReferencesGallery` na Etapa 3), em `src/routes/index.tsx`:

1. **`-mr-5` no trilho** (linhas 558 e 479): puxa o track 20px além do `padding-right` do `<main>`. Mesmo com `overflow-x-hidden` no `<main>`, combinado com `pr-10` interno e cards `w-[86%]`, o cálculo deixa de respeitar o shell de 430px.
2. **Cards medidos em `%` da largura do pai expandido**: `w-[86%]` referencia a largura real do track (incluindo o `-mr-5`), não a viewport útil.
3. **Faltam barreiras explícitas**: o shell tem `overflow-hidden` mas não há um wrapper de clipping local em cada carrossel.

## Plano de correção (apenas overflow/carrossel)

### `src/routes/index.tsx`

1. **Shell e main — reforçar contenção**: adicionar `min-w-0` no shell e no `<main>` para impedir que filhos flex forcem expansão.

2. **`Carousel` (linhas 546–618)**
   - Remover `-mr-5` do track.
   - Envolver o track em `<div className="relative w-full min-w-0 overflow-hidden">` (barreira de clipping local).
   - Track interno: `flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth scrollbar-hide pb-4 pt-2` com `paddingLeft: 4, paddingRight: 40` via style.
   - Cards: trocar `w-[86%] max-w-[320px]` por `basis-[calc(100%-3rem)] max-w-[320px] shrink-0 grow-0 snap-start`.
   - Manter dots de progresso.

3. **`ReferencesGallery` (linhas 461–517)**: mesma refatoração (wrapper de clipping + cards com `basis-[calc(100%-3rem)]`).

## Riscos

- Cards ficam ~312px em telas de 360px e capados em 320px acima disso — peek consistente em todas as larguras.
- Wrapper local com `overflow-hidden` esconde sombras laterais no eixo X — aceitável.

## Checklist de teste (Playwright headless)

- Desktop 1440×900: `scrollWidth === innerWidth`; nenhum card fora do shell de 430px.
- iPhone 390×844: sem scroll horizontal de página; carrossel rola só internamente.
- Android 360×800: cards não excedem viewport.
- Etapa 3: mesmo comportamento; CTA não sobrepõe.
- Avançar todas as etapas confirmando que o shell nunca expande.
