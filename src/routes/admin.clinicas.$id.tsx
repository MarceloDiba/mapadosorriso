import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AdminGate, AdminShell } from "@/components/admin/AdminGate";
import { ClinicForm, EMPTY_CLINIC } from "@/components/admin/ClinicForm";
import { FUNNEL_STEPS, funnelLabel } from "@/config/funnel";
import { DECISION_SHORT, DECISIONS, OBJECTIONS, STYLES } from "@/config/quiz";
import { getClinic, getClinicAnalytics, type ClinicInput } from "@/lib/clinics.functions";

export const Route = createFileRoute("/admin/clinicas/$id")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    tab: search["tab"] === "analytics" ? ("analytics" as const) : ("config" as const),
  }),
  head: () => ({
    meta: [
      { title: "Gerenciar clínica — Painel NOA Lead Flow Smile" },
      { name: "description", content: "Edite identidade visual, contrato e acompanhe métricas da clínica." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Gerenciar clínica — Painel NOA Lead Flow Smile" },
      { property: "og:description", content: "Identidade visual, contrato e métricas da clínica." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <AdminGate>
      <ClinicDetail />
    </AdminGate>
  ),
});

const labelOf = (list: { id: string; title: string }[], id?: string | null) =>
  list.find((o) => o.id === id)?.title ?? "—";

function ClinicDetail() {
  const { id } = Route.useParams();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const tab = search.tab;
  const [clinic, setClinic] = useState<ClinicInput | null>(null);
  const [name, setName] = useState("Clínica");

  useEffect(() => {
    getClinic({ data: { id } })
      .then((row) => {
        if (!row) return;
        setName(row.name);
        setClinic({
          id: row.id,
          slug: row.slug,
          name: row.name,
          city: row.city ?? "",
          whatsapp: row.whatsapp,
          logo_url: row.logo_url ?? "",
          contract_start: row.contract_start,
          contract_end: row.contract_end,
          contract_value: row.contract_value,
          sale_date: row.sale_date,
          is_active: row.is_active,
          palette: row.palette,
          font_pair: row.font_pair,
          images: (row.images ?? {}) as Record<string, string>,
          copy: (row.copy ?? {}) as Record<string, string>,
        });
      })
      .catch(() => setClinic({ ...EMPTY_CLINIC }));
  }, [id]);

  return (
    <AdminShell title={name} back={{ to: "/admin", label: "Clínicas" }}>
      <div className="mb-5 flex gap-2">
        {(["analytics", "config"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => navigate({ search: { tab: t }, replace: true })}
            className={`rounded-xl border px-4 py-2 text-[13px] ${tab === t ? "border-gold text-foreground" : "border-border text-muted-foreground"}`}
          >
            {t === "config" ? "Configurações" : "Analytics"}
          </button>
        ))}
      </div>

      {tab === "config" ? (
        clinic ? (
          <ClinicForm initial={clinic} />
        ) : (
          <p className="text-[13px] text-muted-foreground">Carregando…</p>
        )
      ) : (
        <Analytics id={id} clinicName={name} />
      )}
    </AdminShell>
  );
}

function Analytics({ id, clinicName }: { id: string; clinicName: string }) {
  const [days, setDays] = useState<7 | 30 | 90>(30);
  const [data, setData] = useState<Awaited<ReturnType<typeof getClinicAnalytics>> | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setData(null);
    getClinicAnalytics({ data: { id, days } })
      .then(setData)
      .catch(() => setData(null));
  }, [id, days]);

  if (!data) return <p className="text-[13px] text-muted-foreground">Carregando métricas…</p>;

  const groups = ["Pronto para agendar", "Planejando custos", "Comparando clínicas", "Apenas pesquisando"];
  const counts = groups.map(
    (g) => data.leads.filter((l) => DECISION_SHORT[l.decision ?? ""] === g).length,
  );
  const totalDecisions = counts.reduce((a, b) => a + b, 0) || 1;
  const maxDrop = Math.max(1, ...FUNNEL_STEPS.map((s) => data.dropoff[s.key] ?? 0));

  const exportPdf = async () => {
    setExporting(true);
    try {
      const [{ default: jsPDF }, autoTable] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable").then((m) => m.default),
      ]);
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text(`Relatório — ${clinicName}`, 14, 18);
      doc.setFontSize(10);
      doc.text(
        `Período: últimos ${days} dias · Gerado em ${new Date().toLocaleString("pt-BR")}`,
        14,
        25,
      );
      autoTable(doc, {
        startY: 32,
        head: [["Métrica", "Valor"]],
        body: [
          ["Visualizações", String(data.views)],
          ["Mapas concluídos", String(data.completed)],
          ["Taxa de conclusão", `${data.completionRate}%`],
          ["Cliques no WhatsApp", String(data.clicks)],
          ["Maior gargalo", funnelLabel(data.bottleneck)],
        ],
      });
      autoTable(doc, {
        head: [["Data", "Estilo", "Queixas", "Dúvida", "Momento", "Lead", "WhatsApp"]],
        body: data.leads.map((l) => [
          new Date(l.created_at).toLocaleDateString("pt-BR"),
          labelOf(STYLES, l.style),
          (l.concerns ?? []).join(", ") || "—",
          labelOf(OBJECTIONS, l.objection),
          labelOf(DECISIONS, l.decision),
          [l.lead_name, l.lead_phone].filter(Boolean).join(" · ") || "—",
          l.whatsapp_clicked ? "Sim" : "Não",
        ]),
        styles: { fontSize: 8 },
      });
      doc.save(`relatorio-${clinicName.toLowerCase().replace(/\s+/g, "-")}-${days}d.pdf`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-2">
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
        <button
          type="button"
          onClick={exportPdf}
          disabled={exporting}
          className="ml-auto rounded-lg bg-primary px-4 py-2 text-[12px] text-primary-foreground disabled:opacity-60"
        >
          {exporting ? "Gerando…" : "Exportar relatório (PDF)"}
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <Metric label="Visualizações" value={String(data.views)} />
        <Metric label="Taxa de conclusão" value={`${data.completionRate}%`} />
        <Metric label="Cliques no WhatsApp" value={String(data.clicks)} />
        <Metric label="Maior gargalo" value={funnelLabel(data.bottleneck)} small />
      </div>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-serif text-[18px] text-foreground">Onde as pessoas param</h2>
        <p className="mt-1 text-[12px] text-muted-foreground">
          Última etapa vista por quem não clicou no WhatsApp.
        </p>
        <div className="mt-4 grid gap-3">
          {FUNNEL_STEPS.map((s) => {
            const v = data.dropoff[s.key] ?? 0;
            return (
              <div key={s.key}>
                <div className="mb-1 flex justify-between text-[12px] text-muted-foreground">
                  <span>{s.label}</span>
                  <span>{v}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gold"
                    style={{ width: `${Math.round((v / maxDrop) * 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-serif text-[18px] text-foreground">Momento de decisão</h2>
        <div className="mt-4 grid gap-3">
          {groups.map((g, i) => {
            const pct = Math.round((counts[i] / totalDecisions) * 100);
            return (
              <div key={g}>
                <div className="mb-1 flex justify-between text-[12px] text-muted-foreground">
                  <span>{g}</span>
                  <span>
                    {counts[i]} · {pct}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-gold" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-serif text-[18px] text-foreground">Origem do tráfego</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(data.sources).map(([k, v]) => (
            <span key={k} className="rounded-full border border-border px-3 py-1 text-[12px] text-muted-foreground">
              {k}: {v}
            </span>
          ))}
          {Object.keys(data.sources).length === 0 && (
            <p className="text-[13px] text-muted-foreground">Sem dados no período.</p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-serif text-[18px] text-foreground">Histórico de leads</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-[12.5px]">
            <thead className="text-muted-foreground">
              <tr className="border-b border-border">
                <th className="py-2 pr-3 font-normal">Data</th>
                <th className="py-2 pr-3 font-normal">Contato</th>
                <th className="py-2 pr-3 font-normal">Estilo</th>
                <th className="py-2 pr-3 font-normal">Queixas</th>
                <th className="py-2 pr-3 font-normal">Dúvida</th>
                <th className="py-2 pr-3 font-normal">Momento</th>
                <th className="py-2 font-normal">WhatsApp</th>
              </tr>
            </thead>
            <tbody className="text-foreground">
              {data.leads.map((l) => (
                <tr key={l.id} className="border-b border-border/60">
                  <td className="py-2 pr-3 text-muted-foreground">
                    {new Date(l.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="py-2 pr-3">
                    {[l.lead_name, l.lead_phone].filter(Boolean).join(" · ") || "—"}
                  </td>
                  <td className="py-2 pr-3">{labelOf(STYLES, l.style)}</td>
                  <td className="py-2 pr-3">{(l.concerns ?? []).join(", ") || "—"}</td>
                  <td className="py-2 pr-3">{labelOf(OBJECTIONS, l.objection)}</td>
                  <td className="py-2 pr-3">{labelOf(DECISIONS, l.decision)}</td>
                  <td className="py-2">{l.whatsapp_clicked ? "Sim" : "Não"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.leads.length === 0 && (
            <p className="py-6 text-center text-[13px] text-muted-foreground">
              Nenhum Mapa do Sorriso concluído neste período.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className={`mt-1 font-serif text-foreground ${small ? "text-[18px] leading-tight" : "text-[30px]"}`}>
        {value}
      </p>
    </div>
  );
}
