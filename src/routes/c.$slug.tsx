import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef } from "react";

import { SmileQuiz } from "@/components/smile/SmileQuiz";
import type { Answers } from "@/config/quiz";
import { getClinicBySlug, startSession, updateSession } from "@/lib/clinics.functions";

export const Route = createFileRoute("/c/$slug")({
  loader: ({ params }) => getClinicBySlug({ data: { slug: params.slug } }),
  head: ({ loaderData }) => {
    const name = loaderData?.name ?? "Mapa do Sorriso";
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
  errorComponent: Unavailable,
  notFoundComponent: Unavailable,
});

function Unavailable() {
  return (
    <div className="grid min-h-[100dvh] place-items-center bg-muted/40 px-6 text-center">
      <div>
        <p className="font-serif text-[22px] leading-snug text-foreground">
          Esta página está temporariamente indisponível
        </p>
        <p className="mt-2 text-[13px] text-muted-foreground">
          Se você recebeu este link por um anúncio, tente novamente mais tarde.
        </p>
      </div>
    </div>
  );
}

function ClinicQuizPage() {
  const clinic = Route.useLoaderData();
  const sessionId = useRef<string | null>(null);
  const answers = useRef<Answers>({ concerns: [] });

  useEffect(() => {
    if (!clinic) return;
    let cancelled = false;
    startSession({ data: { clinicId: clinic.id } })
      .then((r) => {
        if (!cancelled) sessionId.current = r.id;
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [clinic?.id]);

  const track = useCallback(
    (patch: Partial<Answers> & { completed?: boolean; whatsappClicked?: boolean }) => {
      answers.current = { ...answers.current, ...patch } as Answers;
      const id = sessionId.current;
      if (!id) return;
      void updateSession({
        data: {
          sessionId: id,
          style: answers.current.style ?? null,
          concerns: answers.current.concerns ?? [],
          objection: answers.current.objection ?? null,
          decision: answers.current.decision ?? null,
          ...(patch.completed !== undefined ? { completed: patch.completed } : {}),
          ...(patch.whatsappClicked !== undefined ? { whatsappClicked: patch.whatsappClicked } : {}),
        },
      }).catch(() => undefined);
    },
    [],
  );

  if (!clinic) return <Unavailable />;

  return <SmileQuiz clinic={clinic} track={track} />;
}
