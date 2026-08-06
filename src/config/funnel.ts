/** Etapas do funil rastreadas em clinic_sessions.funnel_step (inteiro). */
export const FUNNEL_STEPS = [
  { key: "style", value: 1, label: "Cena 1 — Estilo" },
  { key: "concerns", value: 2, label: "Cena 2 — O que incomoda" },
  { key: "decision", value: 3, label: "Cena 3 — Momento" },
  { key: "result", value: 4, label: "Cena 4 — Mapa" },
  { key: "objection", value: 5, label: "Objeção respondida no Mapa" },
] as const;

export function funnelValue(key: string): number | null {
  return FUNNEL_STEPS.find((s) => s.key === key)?.value ?? null;
}

export function funnelLabel(key: string): string {
  return FUNNEL_STEPS.find((s) => s.key === key)?.label ?? key;
}
