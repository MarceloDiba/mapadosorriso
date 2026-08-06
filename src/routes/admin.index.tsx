import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import { AdminGate, AdminShell } from "@/components/admin/AdminGate";
import { funnelLabel } from "@/config/funnel";
import { formatPhone, whatsappLink } from "@/lib/phone";
import {
  duplicateClinic,
  getOverview,
  listClinics,
  setClinicActive,
} from "@/lib/clinics.functions";

export const Route = createFileRoute("/admin/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Painel NOA Lead Flow Smile — Clínicas e resultados" },
      {
        name: "description",
        content: "Acompanhe clínicas ativas, cliques no WhatsApp, gargalos do funil e vendas em um só lugar.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Painel NOA Lead Flow Smile" },
      { property: "og:description", content: "Clínicas ativas, cliques no WhatsApp, gargalos e vendas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <AdminGate>
      <Dashboard />
    </AdminGate>
  ),
});

type Clinic = Awaited<ReturnType<typeof listClinics>>[number];
type Overview = Awaited<ReturnType<typeof getOverview>>;

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

function statusOf(c: Clinic) {
  const today = new Date().toISOString().slice(0, 10);
  if (!c.is_active) return { label: "Desativada", tone: "bg-muted text-muted-foreground" };
  if (c.contract_start && c.contract_start > today)
    return { label: "Agendada", tone: "bg-amber-100 text-amber-800" };
  if (c.contract_end && c.contract_end < today)
    return { label: "Contrato vencido", tone: "bg-red-100 text-red-700" };
  return { label: "Ativa", tone: "bg-emerald-100 text-emerald-700" };
}

function Dashboard() {
  const [clinics, setClinics] = useState<Clinic[] | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [days, setDays] = useState<7 | 30 | 90>(30);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const reload = () => {
    listClinics().then(setClinics).catch(() => setClinics([]));
  };

  useEffect(reload, []);
  useEffect(() => {
    setOverview(null);
    getOverview({ data: { days } })
      .then(setOverview)
      .catch(() => setOverview(null));
  }, [days]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!clinics) return [];
    if (!term) return clinics;
    return clinics.filter((c) =>
      [c.name, c.slug, c.city ?? "", c.whatsapp].some((v) => v.toLowerCase().includes(term)),
    );
  }, [clinics, q]);

  const toggle = async (c: Clinic) => {
    setBusy(c.id);
    try {
      await setClinicActive({ data: { id: c.id, active: !c.is_active } });
      reload();
    } finally {
      setBusy(null);
    }
  };

  const duplicate = async (c: Clinic) => {
    setBusy(c.id);
    try {
      await duplicateClinic({ data: { id: c.id } });
      reload();
    } finally {
      setBusy(null);
    }
  };

  const alerts = [
    ...(overview?.expiringSoon ?? []).map((c) => ({ ...c, kind: "Vence em breve" })),
    ...(overview?.expired ?? []).map((c) => ({ ...c, kind: "Contrato vencido" })),
    ...(overview?.scheduled ?? []).map((c) => ({ ...c, kind: "Começa em" })),
  ];

  return (
    <AdminShell title="Visão geral">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {([7, 30, 90] as const).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDays(d)}
            className={`rounded-lg border px-3 py-1.5 text-[12px] ${days === d ? "border-gold text-foreground" : "border-border text-muted-foreground"}`}
          >
            {d} dias
          </button>
        ))}
        <Link
          to="/admin/clinicas/nova"
          className="ml-auto rounded-xl bg-primary px-4 py-2 text-[13px] text-primary-foreground"
        >
          Nova clínica
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          label="Clínicas ativas"
          value={overview ? `${overview.activeClinics}/${overview.totalClinics}` : "—"}
        />
        <Metric label="Cliques no WhatsApp" value={overview ? String(overview.clicks) : "—"} />
        <Metric
          label="Conclusão do mapa"
          value={overview ? `${overview.completionRate}%` : "—"}
          hint={overview ? `${overview.completed} de ${overview.views} acessos` : undefined}
        />
        <Metric
          label="Vendas no período"
          value={overview ? brl(overview.revenue) : "—"}
          hint={overview ? `${overview.salesCount} contrato(s)` : undefined}
        />
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Maior gargalo do funil
          </p>
          <p className="mt-1 font-serif text-[22px] text-foreground">
            {overview ? funnelLabel(overview.bottleneck) : "—"}
          </p>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Etapa onde mais pessoas param antes de falar com a clínica.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Alertas de contrato
          </p>
          {alerts.length === 0 ? (
            <p className="mt-2 text-[13px] text-muted-foreground">Nenhum alerta no momento.</p>
          ) : (
            <ul className="mt-2 grid gap-1.5">
              {alerts.slice(0, 5).map((a) => (
                <li key={`${a.kind}-${a.id}`} className="text-[13px] text-foreground">
                  <span className="text-muted-foreground">{a.kind}:</span> {a.name}
                  {a.date && ` · ${new Date(`${a.date}T00:00:00`).toLocaleDateString("pt-BR")}`}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nome, link, cidade ou WhatsApp"
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-[14px] outline-none focus:border-gold"
        />
      </div>

      <div className="mt-3 grid gap-3">
        {clinics === null && <p className="text-[13px] text-muted-foreground">Carregando…</p>}
        {clinics !== null && filtered.length === 0 && (
          <p className="rounded-2xl border border-border bg-card p-6 text-center text-[13px] text-muted-foreground">
            Nenhuma clínica encontrada.
          </p>
        )}
        {filtered.map((c) => {
          const st = statusOf(c);
          return (
            <article
              key={c.id}
              className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate font-serif text-[17px] text-foreground">{c.name}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] ${st.tone}`}>{st.label}</span>
                </div>
                <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
                  /c/{c.slug}
                  {c.city ? ` · ${c.city}` : ""} · {formatPhone(c.whatsapp)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={whatsappLink(c.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-emerald-600/40 px-3 py-1.5 text-[12px] text-emerald-700"
                >
                  WhatsApp
                </a>
                <a
                  href={`/c/${c.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-border px-3 py-1.5 text-[12px] text-muted-foreground"
                >
                  Abrir link
                </a>
                <button
                  type="button"
                  disabled={busy === c.id}
                  onClick={() => duplicate(c)}
                  className="rounded-lg border border-border px-3 py-1.5 text-[12px] text-muted-foreground disabled:opacity-50"
                >
                  Duplicar
                </button>
                <button
                  type="button"
                  disabled={busy === c.id}
                  onClick={() => toggle(c)}
                  className="rounded-lg border border-border px-3 py-1.5 text-[12px] text-muted-foreground disabled:opacity-50"
                >
                  {c.is_active ? "Desativar" : "Ativar"}
                </button>
                <Link
                  to="/admin/clinicas/$id"
                  params={{ id: c.id }}
                  search={{ tab: "analytics" as const }}
                  className="rounded-lg bg-primary px-3 py-1.5 text-[12px] text-primary-foreground"
                >
                  Gerenciar
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </AdminShell>
  );
}

function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-1 font-serif text-[28px] leading-tight text-foreground">{value}</p>
      {hint && <p className="mt-1 text-[12px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
