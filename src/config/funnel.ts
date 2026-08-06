/** Etapas do funil rastreadas em clinic_sessions.funnel_step (inteiro). */
export const FUNNEL_STEPS = [
  { key: "style", value: 1, label: "Tela 1 — Estilo" },
  { key: "concerns", value: 2, label: "Tela 2 — O que incomoda" },
  { key: "objection", value: 3, label: "Tela 3 — Segurança" },
  { key: "decision", value: 4, label: "Tela 4 — Momento" },
  { key: "result", value: 5, label: "Tela 5 — Mapa" },
] as const;

export function funnelValue(key: string): number | null {
  return FUNNEL_STEPS.find((s) => s.key === key)?.value ?? null;
}

export function funnelLabel(key: string): string {
  return FUNNEL_STEPS.find((s) => s.key === key)?.label ?? key;
}
