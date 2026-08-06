import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Acesso ao painel — NOA Lead Flow Smile" },
      { name: "description", content: "Área restrita para gestão das clínicas parceiras." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Acesso ao painel — NOA Lead Flow Smile" },
      { property: "og:description", content: "Área restrita para gestão das clínicas parceiras." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) {
      setError("E-mail ou senha inválidos.");
      return;
    }
    navigate({ to: "/admin", replace: true });
  };

  return (
    <div className="grid min-h-[100dvh] place-items-center bg-muted/40 px-5">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-card"
      >
        <p className="text-[10px] uppercase tracking-[0.18em] text-gold">NOA Lead Flow Smile</p>
        <h1 className="mt-1 font-serif text-[24px] text-foreground">Painel administrativo</h1>

        <label className="mt-5 block text-[12px] text-muted-foreground">
          E-mail
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-[14px] text-foreground outline-none focus:border-gold"
          />
        </label>

        <label className="mt-3 block text-[12px] text-muted-foreground">
          Senha
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-[14px] text-foreground outline-none focus:border-gold"
          />
        </label>

        {error && <p className="mt-3 text-[12.5px] text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full rounded-xl bg-primary px-4 py-3 font-serif text-[16px] text-primary-foreground disabled:opacity-60"
        >
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
