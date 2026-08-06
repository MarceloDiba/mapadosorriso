import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { isAdmin } from "@/lib/clinics.functions";

export function AdminGate({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [state, setState] = useState<"loading" | "ok" | "denied">("loading");

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        navigate({ to: "/admin/login", replace: true });
        return;
      }
      try {
        const r = await isAdmin();
        if (!active) return;
        setState(r.admin ? "ok" : "denied");
      } catch {
        if (active) setState("denied");
      }
    })();
    return () => {
      active = false;
    };
  }, [navigate]);

  if (state === "loading") {
    return (
      <div className="grid min-h-[100dvh] place-items-center text-[13px] text-muted-foreground">
        Carregando painel…
      </div>
    );
  }

  if (state === "denied") {
    return (
      <div className="grid min-h-[100dvh] place-items-center px-6 text-center">
        <div>
          <p className="font-serif text-[22px] text-foreground">Acesso restrito</p>
          <p className="mt-2 text-[13px] text-muted-foreground">
            Sua conta não tem permissão de administrador.
          </p>
          <button
            type="button"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/admin/login", replace: true });
            }}
            className="mt-4 rounded-xl border border-border px-4 py-2 text-[13px]"
          >
            Sair
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function AdminShell({
  title,
  back,
  children,
}: {
  title: string;
  back?: { to: string; label: string };
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  return (
    <div className="min-h-[100dvh] bg-muted/40">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 py-4">
          <div className="min-w-0">
            {back && (
              <Link to={back.to} className="text-[11px] text-muted-foreground hover:text-foreground">
                ← {back.label}
              </Link>
            )}
            <h1 className="truncate font-serif text-[22px] text-foreground">{title}</h1>
          </div>
          <button
            type="button"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/admin/login", replace: true });
            }}
            className="shrink-0 rounded-xl border border-border px-3 py-2 text-[12px] text-muted-foreground hover:text-foreground"
          >
            Sair
          </button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-5 py-6">{children}</main>
    </div>
  );
}
