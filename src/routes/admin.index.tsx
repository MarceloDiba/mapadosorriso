import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AdminGate, AdminShell } from "@/components/admin/AdminGate";
import { listClinics, setClinicActive } from "@/lib/clinics.functions";

export const Route = createFileRoute("/admin/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Clínicas ativas — Painel NOA Lead Flow Smile" },
      { name: "description", content: "Gestão de clínicas, links e contratos." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Clínicas ativas — Painel NOA Lead Flow Smile" },
      { property: "og:description", content: "Gestão de clínicas, links e contratos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <AdminGate>
      <AdminList />
    </AdminGate>
  ),
});

type Row = Awaited<ReturnType<typeof listClinics>>[number];

function statusOf(row: Row) {
  const today = new Date().toISOString().slice(0, 10);
  if (!row.is_active) return { label: "Desativada", tone: "bg-muted text-muted-foreground" };
  if (row.contract_end && row.contract_end < today)
    return { label: "Contrato vencido", tone: "bg-red-100 text-red-700" };
  return { label: "Ativa", tone: "bg-emerald-100 text-emerald-800" };
}

function AdminList() {
  const [rows, setRows] = useState<Row[] | null>(null);

  const load = () => listClinics().then(setRows).catch(() => setRows([]));
  useEffect(() => {
    void load();
  }, []);

  return (
    <AdminShell title="Clínicas">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-[13px] text-muted-foreground">
          {rows ? `${rows.length} clínica(s) cadastrada(s)` : "Carregando…"}
        </p>
        <Link
          to="/admin/clinicas/nova"
          className="rounded-xl bg-primary px-4 py-2.5 text-[13px] text-primary-foreground"
        >
          + Nova clínica
        </Link>
      </div>

      <div className="grid gap-3">
        {rows?.map((row) => {
          const s = statusOf(row);
          return (
            <div
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate font-serif text-[18px] text-foreground">{row.name}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] ${s.tone}`}>{s.label}</span>
                </div>
                <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
                  /c/{row.slug} · {row.city || "—"} · contrato:{" "}
                  {row.contract_start || "—"} → {row.contract_end || "—"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <a
                  href={`/c/${row.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-border px-3 py-2 text-[12px] text-muted-foreground hover:text-foreground"
                >
                  Abrir link
                </a>
                <button
                  type="button"
                  onClick={async () => {
                    await setClinicActive({ data: { id: row.id, active: !row.is_active } });
                    void load();
                  }}
                  className="rounded-xl border border-border px-3 py-2 text-[12px] text-muted-foreground hover:text-foreground"
                >
                  {row.is_active ? "Desativar" : "Ativar"}
                </button>
                <Link
                  to="/admin/clinicas/$id"
                  params={{ id: row.id }}
                  className="rounded-xl bg-primary px-3 py-2 text-[12px] text-primary-foreground"
                >
                  Gerenciar
                </Link>
              </div>
            </div>
          );
        })}
        {rows && rows.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-[13px] text-muted-foreground">
            Nenhuma clínica cadastrada ainda.
          </p>
        )}
      </div>
    </AdminShell>
  );
}
