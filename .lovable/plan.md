# Um único lugar para trocar as imagens

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

## Extras baratos incluídos

- Cada imagem terá também um campo de `alt` (texto descritivo) editável ali mesmo — bom para acessibilidade e SEO.
- Comentário no topo do arquivo com instruções em português explicando exatamente como trocar.
- Se um link quebrar ou ficar vazio, a imagem cai num fundo neutro do tema em vez de mostrar ícone quebrado.

## Detalhes técnicos

- Novo `src/config/images.ts` exportando `SMILE_IMAGES` tipado (`{ src: string; alt: string }`).
- `src/routes/index.tsx`: remover os 5 imports de assets e ler de `SMILE_IMAGES`.
- Nenhuma mudança de copy, ordem de etapas, lógica de qualificação ou identidade visual.
- Assets antigos não usados (`desire-*`, `ref-*`) permanecem no repo; posso removê-los depois se quiser reduzir peso.

## Fora de escopo

Painel de administração para upload pelo navegador — exigiria backend (Lovable Cloud) e custa bem mais. O arquivo de config resolve o mesmo problema com custo mínimo.
