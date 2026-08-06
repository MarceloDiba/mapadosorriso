/**
 * Paletas e combinações de fontes disponíveis para cada clínica.
 * Editar aqui adiciona novas opções ao painel administrativo.
 */

export type PaletteKey = "marfim" | "noir" | "esmeralda" | "rose";
export type FontKey = "cormorant" | "playfair" | "outfit";

export type PaletteDef = {
  key: PaletteKey;
  label: string;
  swatch: string[];
  vars: Record<string, string>;
};

export const PALETTES: PaletteDef[] = [
  {
    key: "marfim",
    label: "Marfim & Dourado",
    swatch: ["#f6f1e6", "#1f3d3d", "#c9a24a"],
    vars: {
      "--background": "oklch(0.975 0.012 80)",
      "--foreground": "oklch(0.28 0.04 190)",
      "--primary": "oklch(0.28 0.04 190)",
      "--primary-foreground": "oklch(0.98 0.01 80)",
      "--card": "oklch(1 0 0)",
      "--card-foreground": "oklch(0.28 0.04 190)",
      "--muted": "oklch(0.94 0.012 80)",
      "--muted-foreground": "oklch(0.5 0.02 190)",
      "--gold": "oklch(0.74 0.11 78)",
      "--gold-soft": "oklch(0.88 0.06 82)",
      "--border": "oklch(0.9 0.012 80)",
      "--ring": "oklch(0.74 0.11 78)",
    },
  },
  {
    key: "noir",
    label: "Noir & Gold",
    swatch: ["#f4f2ef", "#161616", "#d4af37"],
    vars: {
      "--background": "oklch(0.97 0.004 85)",
      "--foreground": "oklch(0.2 0.005 60)",
      "--primary": "oklch(0.2 0.005 60)",
      "--primary-foreground": "oklch(0.97 0.004 85)",
      "--card": "oklch(1 0 0)",
      "--card-foreground": "oklch(0.2 0.005 60)",
      "--muted": "oklch(0.93 0.004 85)",
      "--muted-foreground": "oklch(0.48 0.006 70)",
      "--gold": "oklch(0.78 0.13 86)",
      "--gold-soft": "oklch(0.9 0.07 88)",
      "--border": "oklch(0.89 0.004 85)",
      "--ring": "oklch(0.78 0.13 86)",
    },
  },
  {
    key: "esmeralda",
    label: "Esmeralda Prestígio",
    swatch: ["#f2f6f3", "#123a2c", "#b8935a"],
    vars: {
      "--background": "oklch(0.972 0.012 150)",
      "--foreground": "oklch(0.29 0.05 158)",
      "--primary": "oklch(0.29 0.05 158)",
      "--primary-foreground": "oklch(0.97 0.012 150)",
      "--card": "oklch(1 0 0)",
      "--card-foreground": "oklch(0.29 0.05 158)",
      "--muted": "oklch(0.935 0.014 150)",
      "--muted-foreground": "oklch(0.5 0.025 158)",
      "--gold": "oklch(0.72 0.08 75)",
      "--gold-soft": "oklch(0.88 0.05 80)",
      "--border": "oklch(0.9 0.014 150)",
      "--ring": "oklch(0.72 0.08 75)",
    },
  },
  {
    key: "rose",
    label: "Rosé & Areia",
    swatch: ["#faf3ef", "#4a2f2c", "#c98f7a"],
    vars: {
      "--background": "oklch(0.975 0.014 45)",
      "--foreground": "oklch(0.32 0.04 30)",
      "--primary": "oklch(0.32 0.04 30)",
      "--primary-foreground": "oklch(0.975 0.014 45)",
      "--card": "oklch(1 0 0)",
      "--card-foreground": "oklch(0.32 0.04 30)",
      "--muted": "oklch(0.94 0.016 45)",
      "--muted-foreground": "oklch(0.52 0.02 30)",
      "--gold": "oklch(0.74 0.08 40)",
      "--gold-soft": "oklch(0.89 0.05 45)",
      "--border": "oklch(0.91 0.016 45)",
      "--ring": "oklch(0.74 0.08 40)",
    },
  },
];

export type FontDef = {
  key: FontKey;
  label: string;
  vars: Record<string, string>;
};

export const FONT_PAIRS: FontDef[] = [
  {
    key: "cormorant",
    label: "Cormorant + Karla",
    vars: {
      "--font-serif": '"Cormorant Garamond", Georgia, serif',
      "--font-sans": '"Karla", system-ui, sans-serif',
    },
  },
  {
    key: "playfair",
    label: "Playfair + Inter",
    vars: {
      "--font-serif": '"Playfair Display", Georgia, serif',
      "--font-sans": '"Inter", system-ui, sans-serif',
    },
  },
  {
    key: "outfit",
    label: "Outfit + DM Sans",
    vars: {
      "--font-serif": '"Outfit", system-ui, sans-serif',
      "--font-sans": '"DM Sans", system-ui, sans-serif',
    },
  },
];

export function themeStyle(palette?: string | null, fontPair?: string | null) {
  const p = PALETTES.find((x) => x.key === palette) ?? PALETTES[0];
  const f = FONT_PAIRS.find((x) => x.key === fontPair) ?? FONT_PAIRS[0];
  return { ...p.vars, ...f.vars } as React.CSSProperties;
}
