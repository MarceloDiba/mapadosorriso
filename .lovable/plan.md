# Um painel de configuração: imagens, textos, cores e fontes

Tudo o que uma clínica pode querer personalizar fica numa pasta `src/config/`, com quatro arquivos simples e comentados em português. Nenhuma lógica do fluxo muda.

## Parte 1 — Imagens

Hoje as 5 imagens usadas (capa + 4 estilos de sorriso) estão importadas direto no arquivo do fluxo, misturadas com a lógica. Isso obriga a mexer no código do app sempre que uma clínica quiser trocar uma foto.

## O que vou fazer

Criar um arquivo único de configuração de imagens: `src/config/images.ts`.

Ele terá uma entrada por imagem, com comentário explicando onde cada uma aparece:

```text
hero      -> capa da tela inicial
natural   -> card "Natural & Harmônico"
bright    -> card "Rejuvenescido & Claro"
wide      -> card "Amplo & Simétrico"
hollywood -> card "Ultra Radiante / Hollywood"
```

Cada entrada aceita duas formas de troca, a que for mais conveniente:

1. **Colar um link** (jeito mais econômico e rápido): substitua o valor por qualquer URL `https://...` da foto da clínica. Zero build, zero upload.
2. **Subir o arquivo** para `src/assets/` com o mesmo nome e manter o import.

A tela do fluxo passa a ler tudo desse arquivo, sem imports espalhados.

## Parte 2 — Textos (para testes A/B)

Novo `src/config/copy.ts` com todo o texto do app em um só lugar: título e subtítulo da capa, título/subtítulo de cada uma das 5 telas, rótulo e descrição de cada card de opção, textos dos botões e os blocos do Mapa do Sorriso.

Para testar variações, o arquivo terá duas versões nomeadas (`A` e `B`) e uma chave no topo que escolhe qual está ativa:

```text
export const VARIANTE_ATIVA = "A";  // troque para "B" para testar
```

Assim dá para reescrever headlines e CTAs sem tocar em nenhum componente.

## Parte 3 — Cores por paleta

Novo `src/config/theme.ts` com paletas prontas para a clínica escolher, cada uma com 4 tons (fundo, superfície, texto, destaque). Sugestões iniciais:

- **Marfim & Dourado** (atual) — off-white, verde petróleo, dourado suave
- **Noir & Gold** — preto com dourado, luxo editorial
- **Esmeralda Prestígio** — verde profundo com dourado
- **Rosé & Areia** — nude quente, feminino e acolhedor

Trocar uma linha (`export const PALETA_ATIVA = "noir"`) reaplica as cores em todo o app, porque os tokens semânticos de `src/styles.css` passam a ser alimentados pela paleta escolhida.

## Parte 4 — Três opções de fonte

No mesmo `theme.ts`, três combinações título+texto para escolher com uma linha:

1. **Cormorant Garamond + Karla** (atual, luxo editorial)
2. **Playfair Display + Inter** (clássico e legível)
3. **Outfit + DM Sans** (moderno e limpo)

As três são carregadas via `<link>` no topo do app e aplicadas pelos tokens de fonte.

## Detalhes técnicos

- `src/config/images.ts` — `SMILE_IMAGES` tipado (`{ src: string; alt: string }`).
- `src/config/copy.ts` — objeto de textos com variantes A/B e uma constante de seleção.
- `src/config/theme.ts` — paletas (valores OKLCH) e trios de fonte; um efeito no root aplica as variáveis CSS correspondentes.
- `src/styles.css` — tokens passam a ser sobrescritos pela paleta ativa; três famílias de fonte registradas em `@theme`.
- `src/routes/__root.tsx` — `<link>` das fontes.
- `src/routes/index.tsx` — remove imports de assets e strings inline, lê de `images.ts` e `copy.ts`.
- Ordem das etapas, lógica de qualificação e estrutura do Mapa do Sorriso permanecem iguais.

## Fora de escopo

Painel de administração visual no navegador (exigiria backend e custa bem mais) e persistência de resultados de A/B — a troca é manual pelos arquivos de config.
