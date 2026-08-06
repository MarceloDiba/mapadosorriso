import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef } from "react";

import { SmileQuiz } from "@/components/smile/SmileQuiz";
import type { Answers } from "@/config/quiz";
import {
  getClinicBySlug,
  startSession,
  updateSession,
  type ClinicStatusReason,
} from "@/lib/clinics.functions";

export const Route = createFileRoute("/c/$slug")({
  loader: ({ params }) => getClinicBySlug({ data: { slug: params.slug } }),
  head: ({ loaderData }) => {
    const name = loaderData?.clinic?.name ?? "Mapa do Sorriso";
    const title = `${name} — Mapa do Sorriso`;
    const description =
      "Descubra seu perfil de sorriso em 5 telas e leve um mapa personalizado para a sua avaliação.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ClinicQuizPage,
  errorComponent: () => <Unavailable reason="not_found" />,
  notFoundComponent: () => <Unavailable reason="not_found" />,
});

const MESSAGES: Record<ClinicStatusReason, { title: string; text: string }> = {
  ok: { title: "", text: "" },
  not_found: {
    title: "Não encontramos esta página",
    text: "Confira o link recebido ou fale diretamente com a clínica.",
  },
  inactive: {
    title: "Esta experiência está pausada",
    text: "A clínica desativou temporariamente este link. Tente novamente mais tarde.",
  },
  scheduled: {
    title: "Esta experiência ainda não começou",
    text: "O link será liberado na data de início do contrato da clínica.",
  },
  expired: {
    title: "Este link expirou",
    text: "O período de publicação desta clínica foi encerrado.",
  },
};

function Unavailable({ reason, startsAt }: { reason: ClinicStatusReason; startsAt?: string | null }) {
  const m = MESSAGES[reason] ?? MESSAGES.not_found;
  return (
    <div className="grid min-h-[100dvh] place-items-center bg-muted/40 px-6 text-center">
      <div className="max-w-sm">
        <p className="font-serif text-[22px] leading-snug text-foreground">{m.title}</p>
        <p className="mt-2 text-[13px] text-muted-foreground">{m.text}</p>
        {reason === "scheduled" && startsAt && (
          <p className="mt-3 text-[12px] text-muted-foreground">
            Início previsto: {new Date(`${startsAt}T00:00:00`).toLocaleDateString("pt-BR")}
          </p>
        )}
      </div>
    </div>
  );
}

function ClinicQuizPage() {
  const resolution = Route.useLoaderData();
  const clinic = resolution?.clinic ?? null;
  const sessionId = useRef<string | null>(null);
  const starting = useRef(false);
  const answers = useRef<Answers>({ concerns: [] });
  const pending = useRef<Record<string, unknown> | null>(null);

  const flush = useCallback(() => {
    const id = sessionId.current;
    if (!id || !pending.current) return;
    const patch = pending.current;
    pending.current = null;
    void updateSession({ data: { sessionId: id, ...patch } as never }).catch(() => undefined);
  }, []);

  // A sessão só nasce na primeira interação real — evita contar bots e visitas próprias.
  const ensureSession = useCallback(() => {
    if (!clinic || sessionId.current || starting.current) return;
    starting.current = true;
    const params = new URLSearchParams(window.location.search);
    void startSession({
      data: {
        clinicId: clinic.id,
        utmSource: params.get("utm_source"),
        utmMedium: params.get("utm_medium"),
        utmCampaign: params.get("utm_campaign"),
      },
    })
      .then((r) => {
        sessionId.current = r.id;
        flush();
      })
      .catch(() => undefined);
  }, [clinic?.id, flush]);

  useEffect(() => {
    return () => {
      pending.current = null;
    };
  }, []);

  const track = useCallback<
    (patch: Parameters<NonNullable<Parameters<typeof SmileQuiz>[0]["track"]>>[0]) => void
  >(
    (patch) => {
      answers.current = { ...answers.current, ...patch } as Answers;
      ensureSession();
      pending.current = {
        ...(pending.current ?? {}),
        style: answers.current.style ?? null,
        concerns: answers.current.concerns ?? [],
        objection: answers.current.objection ?? null,
        decision: answers.current.decision ?? null,
        ...(patch.completed !== undefined ? { completed: patch.completed } : {}),
        ...(patch.whatsappClicked !== undefined ? { whatsappClicked: patch.whatsappClicked } : {}),
        ...(patch.funnelStep ? { funnelStep: patch.funnelStep } : {}),
        ...(patch.leadName ? { leadName: patch.leadName } : {}),
        ...(patch.leadPhone ? { leadPhone: patch.leadPhone } : {}),
      };
      flush();
    },
    [ensureSession, flush],
  );

  if (!clinic) {
    return <Unavailable reason={resolution?.reason ?? "not_found"} startsAt={resolution?.startsAt} />;
  }

  return <SmileQuiz clinic={clinic} track={track} />;
}
