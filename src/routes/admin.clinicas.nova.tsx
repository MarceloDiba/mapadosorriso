import { createFileRoute } from "@tanstack/react-router";

import { AdminGate, AdminShell } from "@/components/admin/AdminGate";
import { ClinicForm, EMPTY_CLINIC } from "@/components/admin/ClinicForm";

export const Route = createFileRoute("/admin/clinicas/nova")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Nova clínica — Painel NOA Lead Flow Smile" },
      { name: "description", content: "Cadastro de uma nova clínica parceira e seu link exclusivo." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Nova clínica — Painel NOA Lead Flow Smile" },
      { property: "og:description", content: "Cadastro de uma nova clínica parceira." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <AdminGate>
      <AdminShell title="Nova clínica" back={{ to: "/admin", label: "Clínicas" }}>
        <ClinicForm initial={EMPTY_CLINIC} />
      </AdminShell>
    </AdminGate>
  ),
});
