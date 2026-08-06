import { createFileRoute, Link } from "@tanstack/react-router";

import heroSmile from "@/assets/hero-smile.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NOA Lead Flow Smile — Laboratório do Sorriso Ideal" },
      {
        name: "description",
        content:
          "Experiência premium de qualificação de pacientes para clínicas de estética do sorriso: cada clínica com seu link, identidade visual e WhatsApp.",
      },
      { property: "og:title", content: "NOA Lead Flow Smile — Laboratório do Sorriso Ideal" },
      {
        property: "og:description",
        content:
          "Transforme anúncios em pacientes qualificados com o Mapa do Sorriso personalizado da sua clínica.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const PILLARS = [
  {
    title: "Link exclusivo por clínica",
    text: "Cada parceiro recebe /c/sua-clinica para usar direto nos anúncios.",
  },
  {
    title: "Identidade white-label",
    text: "Cores, fontes, logo, fotos e textos configuráveis para testes A/B.",
  },
  {
    title: "Lead qualificado no WhatsApp",
    text: "A mensagem chega pronta, com desejo, queixa, objeção e momento de decisão.",
  },
  {
    title: "Métricas de funil",
    text: "Visualizações, taxa de conclusão, cliques e histórico de respostas.",
  },
];

function Landing() {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-5">
        <p className="font-serif text-[18px]">NOA Lead Flow Smile</p>
        <Link
          to="/admin/login"
          className="rounded-xl border border-border px-3.5 py-2 text-[12.5px] text-muted-foreground hover:text-foreground"
        >
          Painel
        </Link>
      </header>

      <main className="mx-auto w-full max-w-5xl px-5 pb-16">
        <section className="grid items-center gap-6 md:grid-cols-2">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-gold">
              Laboratório do Sorriso Ideal
            </p>
            <h1 className="mt-2 text-balance font-serif text-[38px] leading-[1.05] md:text-[50px]">
              Anúncios que viram pacientes prontos para agendar.
            </h1>
            <p className="mt-4 max-w-[46ch] text-[15px] leading-relaxed text-muted-foreground">
              Uma experiência visual premium em 5 telas que educa o paciente, organiza o que ele
              deseja e entrega um Mapa do Sorriso personalizado direto no WhatsApp da sua clínica.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="/c/clinica-modelo"
                className="rounded-2xl bg-primary px-5 py-3.5 font-serif text-[16px] text-primary-foreground"
              >
                Ver demonstração
              </a>
              <Link
                to="/admin/login"
                className="rounded-2xl border border-border px-5 py-3.5 text-[14px] text-muted-foreground hover:text-foreground"
              >
                Acessar painel
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-border shadow-card">
            <img src={heroSmile} alt="Sorriso planejado em clínica de estética dental" className="h-full w-full object-cover" />
          </div>
        </section>

        <section className="mt-14 grid gap-3 sm:grid-cols-2">
          {PILLARS.map((p) => (
            <article key={p.title} className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-serif text-[19px]">{p.title}</h2>
              <p className="mt-1.5 text-[13.5px] leading-snug text-muted-foreground">{p.text}</p>
            </article>
          ))}
        </section>

        <p className="mt-10 text-[12px] leading-relaxed text-muted-foreground">
          Conteúdo educativo. Não realiza diagnóstico nem promessa de resultado — a indicação final
          é sempre do dentista responsável.
        </p>
      </main>
    </div>
  );
}
