import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";

import heroSmile from "@/assets/hero-smile.jpg";
import styleNatural from "@/assets/style-natural.jpg";
import styleBright from "@/assets/style-bright.jpg";
import styleWide from "@/assets/style-wide.jpg";
import styleHollywood from "@/assets/style-hollywood.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NOA Smile — Mapa do Sorriso" },
      {
        name: "description",
        content:
          "Uma experiência visual para explorar estilo, harmonia e naturalidade do seu sorriso antes de conversar com um especialista.",
      },
      { property: "og:title", content: "NOA Smile — Mapa do Sorriso" },
      {
        property: "og:description",
        content:
          "Descubra seu estilo de sorriso, organize suas dúvidas e leve um mapa personalizado para a avaliação.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SmileLab,
});

/* ----------------------------- Data ----------------------------- */

type CardItem = {
  id: string;
  title: string;
  caption?: string;
  image?: string;
};

const STYLES: CardItem[] = [
  {
    id: "natural",
    title: "Natural & Harmônico",
    caption: "Linhas suaves e tom elegante que preserva a anatomia do dente.",
    image: styleNatural,
  },
  {
    id: "bright",
    title: "Rejuvenescido & Claro",
    caption: "Destaque de cor e jovialidade mantendo a proporção.",
    image: styleBright,
  },
  {
    id: "wide",
    title: "Amplo & Simétrico",
    caption: "Correção de espaços, diastemas e preenchimento dos lábios.",
    image: styleWide,
  },
  {
    id: "hollywood",
    title: "Ultra Radiante / Hollywood",
    caption: "Máximo contraste, alinhamento perfeito e destaque estético.",
    image: styleHollywood,
  },
];

const CONCERNS: CardItem[] = [
  { id: "color", title: "Cor amarelada ou manchas difíceis de clarear" },
  { id: "shape", title: "Formato, tamanho irregular ou dentes desgastados" },
  { id: "spaces", title: "Espaços entre os dentes (diastemas) ou desalinhamento" },
  { id: "gum", title: "Excesso de gengiva ao sorrir ou contorno desalinhado" },
  { id: "restorations", title: "Restaurações antigas com alteração de cor" },
];

const OBJECTIONS: CardItem[] = [
  { id: "wear", title: "Precisa desgastar muito o dente natural?" },
  { id: "durability", title: "Qual a durabilidade e como é a manutenção?" },
  { id: "investment", title: "Como funciona a estimativa de investimento e pagamento?" },
  { id: "artificial", title: 'Tenho medo do resultado parecer artificial ("dente de chiclete")' },
  { id: "pain", title: "O procedimento causa dor ou sensibilidade?" },
];

const DECISION: CardItem[] = [
  {
    id: "agendar",
    title: "Pronto para Agendar",
    caption: "Quero realizar uma avaliação e iniciar meu planejamento.",
  },
  {
    id: "investimento",
    title: "Planejando Investimento",
    caption: "Quero entender valores e formas de pagamento antes de agendar.",
  },
  {
    id: "comparando",
    title: "Comparando Opções",
    caption: "Estou pesquisando clínicas e conhecendo técnicas.",
  },
  {
    id: "pesquisando",
    title: "Apenas Pesquisando",
    caption: "Tenho dúvidas/receio e quero apenas informações iniciais.",
  },
];

const QUALITY_POINTS = [
  {
    title: "Design Digital",
    text: "Teste o sorriso no seu rosto antes de encostar no dente.",
  },
  {
    title: "Laminados Ultra-finos",
    text: "Mínimo desgaste, preservando a estrutura biológica.",
  },
  {
    title: "Porcelana Pura",
    text: "Estabilidade de cor definitiva (não amarela com o tempo).",
  },
];

const STEPS = [
  { key: "hero", label: "Início" },
  { key: "style", label: "Seu objetivo" },
  { key: "concerns", label: "Diagnóstico de Queixas" },
  { key: "objection", label: "Esclarecimentos" },
  { key: "decision", label: "Momento Atual" },
  { key: "loading", label: "Mapa do Sorriso" },
  { key: "result", label: "Mapa do Sorriso" },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

/* ----------------------------- State ----------------------------- */

type Answers = {
  style?: string;
  concerns: string[];
  objection?: string;
  decision?: string;
};

const initialAnswers: Answers = {
  concerns: [],
};

const CLINIC_WHATSAPP = "351911056526";

const CTA_CONFIG: Record<string, { buttonText: string; message: string }> = {
  agendar: {
    buttonText: "Ver Agenda & Solicitar Avaliação no WhatsApp",
    message:
      "Olá! Concluí meu Mapa do Sorriso e gostaria de agendar uma avaliação presencial.",
  },
  investimento: {
    buttonText: "Enviar Mapa & Receber Guia de Investimento",
    message:
      "Olá! Concluí meu Mapa do Sorriso e gostaria de entender os valores e condições.",
  },
  comparando: {
    buttonText: "Enviar Meu Mapa & Comparar Possibilidades",
    message:
      "Olá! Concluí meu Mapa do Sorriso e gostaria de entender as técnicas e diferenciais da clínica.",
  },
  pesquisando: {
    buttonText: "Receber Meu Mapa + Tirar Dúvidas",
    message: "Olá! Fiz o Mapa do Sorriso e gostaria de tirar uma dúvida sobre facetas.",
  },
};

const DEFAULT_CTA = {
  buttonText: "Enviar Meu Mapa do Sorriso no WhatsApp",
  message: "Olá! Concluí meu Mapa do Sorriso e gostaria de conversar com a clínica.",
};

/* ----------------------------- Component ----------------------------- */

function SmileLab() {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const step: StepKey = STEPS[stepIndex].key;

  useEffect(() => {
    if (step === "loading") {
      const t = setTimeout(() => setStepIndex((i) => i + 1), 2200);
      return () => clearTimeout(t);
    }
  }, [step]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [stepIndex]);

  const progressSteps = STEPS.slice(1, 6); // 5 telas: objetivo .. mapa
  const currentProgressIdx = Math.min(Math.max(stepIndex - 1, 0), progressSteps.length - 1);

  const next = () => setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  const back = () => setStepIndex((i) => Math.max(i - 1, 0));

  const canAdvance = useMemo(() => {
    switch (step) {
      case "style":
        return !!answers.style;
      case "concerns":
        return answers.concerns.length > 0;
      case "objection":
        return !!answers.objection;
      case "decision":
        return !!answers.decision;
      default:
        return true;
    }
  }, [step, answers]);

  const showCTA = step !== "hero" && step !== "loading" && step !== "result";
  const showProgress = showCTA;

  const mainRef = useRef<HTMLElement>(null);
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [stepIndex]);

  return (
    <div className="min-h-[100dvh] w-full overflow-x-hidden bg-muted/40 text-foreground">
      <div className="relative mx-auto flex min-h-[100dvh] w-full min-w-0 max-w-[430px] flex-col overflow-hidden bg-background shadow-[0_0_60px_-20px_rgba(0,0,0,0.25)]">
        <AppHeader />
        {showProgress && (
          <ProgressBar
            label={progressSteps[currentProgressIdx].label}
            current={currentProgressIdx}
            total={progressSteps.length}
          />
        )}

        <main
          ref={mainRef}
          className={`min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-4 pt-2 ${showCTA ? "pb-24" : "pb-5"}`}
        >
          <div key={step} className="animate-fade-up">
            {step === "hero" && <Hero onStart={next} />}

            {step === "style" && (
              <StyleStep
                value={answers.style}
                onChange={(v) => setAnswers((a) => ({ ...a, style: v }))}
                onGuidance={() => {
                  setAnswers((a) => ({ ...a, style: "orientacao" }));
                  next();
                }}
              />
            )}

            {step === "concerns" && (
              <MultiChoiceStep
                eyebrow="Diagnóstico de queixas"
                title="O que mais te incomoda no seu sorriso hoje?"
                text="Selecione até 2 opções principais."
                items={CONCERNS}
                value={answers.concerns}
                max={2}
                onChange={(v) => setAnswers((a) => ({ ...a, concerns: v }))}
              />
            )}

            {step === "objection" && (
              <SingleChoiceStep
                eyebrow="Esclarecimentos"
                title="Qual é a sua principal dúvida sobre facetas?"
                text="Usamos essa informação para personalizar suas explicações."
                items={OBJECTIONS}
                value={answers.objection}
                onChange={(v) => setAnswers((a) => ({ ...a, objection: v }))}
              />
            )}

            {step === "decision" && (
              <SingleChoiceStep
                eyebrow="Momento atual"
                title="Em qual momento de decisão você está agora?"
                text="Selecione a opção que reflete seu interesse atual."
                items={DECISION}
                value={answers.decision}
                onChange={(v) => setAnswers((a) => ({ ...a, decision: v }))}
              />
            )}

            {step === "loading" && <LoadingMap />}

            {step === "result" && (
              <ResultMap
                answers={answers}
                onRestart={() => {
                  setAnswers(initialAnswers);
                  setStepIndex(0);
                }}
              />
            )}
          </div>
        </main>

        {showCTA && (
          <StickyCTA
            label={
              !canAdvance
                ? step === "concerns"
                  ? "Selecione até 2 opções"
                  : "Escolha uma opção para continuar"
                : step === "decision"
                  ? "Ver meu Mapa do Sorriso"
                  : "Avançar"
            }
            disabled={!canAdvance}
            onClick={next}
            onBack={stepIndex > 1 ? back : undefined}
          />
        )}
      </div>
    </div>
  );
}

/* ----------------------------- Header ----------------------------- */

function AppHeader() {
  return (
    <header className="shrink-0 border-b border-border/60 bg-background/90 backdrop-blur-md">
      <div className="flex w-full items-center justify-between px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M4 10c2-3 5-4 8-4s6 1 8 4c-1 6-5 9-8 9s-7-3-8-9z" />
              <path d="M8 10c1-1 2.5-1.5 4-1.5s3 .5 4 1.5" />
            </svg>
          </span>
          <div className="min-w-0 leading-tight">
            <p className="text-[8px] uppercase tracking-[0.16em] text-muted-foreground">
              NOA Smile
            </p>
            <p className="truncate font-serif text-[14px] text-foreground">Mapa do Sorriso</p>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ----------------------------- Progress ----------------------------- */

function ProgressBar({
  label,
  current,
  total,
}: {
  label: string;
  current: number;
  total: number;
}) {
  const pct = ((current + 1) / total) * 100;
  return (
    <div className="shrink-0 border-b border-border/60 bg-background/90 backdrop-blur-md">
      <div className="w-full px-4 pb-2 pt-2">
        <div className="mb-1.5 flex items-center justify-between gap-3">
          <p className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
            Passo {current + 1} de {total}
          </p>
          <p className="truncate font-serif text-[12px] text-foreground">{label}</p>
        </div>
        <div className="h-0.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gold transition-[width] duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Hero ----------------------------- */

function Hero({ onStart }: { onStart: () => void }) {
  return (
    <section className="flex min-h-full flex-col pb-4 pt-1">
      <div className="relative flex-1 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <img
          src={heroSmile}
          alt="Sorriso natural editorial"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/35 to-transparent" />
        <div className="relative flex h-full min-h-[60vh] flex-col justify-end p-5">
          <p className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-gold/60 bg-background/15 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-background backdrop-blur">
            <span className="h-1 w-1 rounded-full bg-gold" /> Smile Design
          </p>
          <h1 className="font-serif text-[30px] leading-[1.05] text-background">
            Antes de decidir,
            <br />
            entenda seu sorriso.
          </h1>
          <p className="mt-3 max-w-[31ch] text-[13px] leading-relaxed text-background/85">
            Entenda o que mudar e o que você quer em suas facetas.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onStart}
        className="group relative z-10 mt-4 flex w-full items-center justify-between gap-3 rounded-2xl bg-primary px-5 py-4 text-left text-primary-foreground shadow-soft transition-all duration-300 active:scale-[0.99]"
      >
        <span className="font-serif text-lg">Começar meu mapa</span>
        <span
          aria-hidden
          className="grid h-10 w-10 place-items-center rounded-full bg-gold text-primary transition-transform group-hover:translate-x-1"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </span>
      </button>

      <p className="mt-2 text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        Educativo · sem diagnóstico · sem indicação de tratamento
      </p>
    </section>
  );
}

/* ----------------------------- Step shells ----------------------------- */

function StepHeader({ eyebrow, title, text }: { eyebrow?: string; title: string; text?: string }) {
  return (
    <header className="mb-3 mt-1">
      {eyebrow && (
        <p className="mb-1.5 text-[10px] uppercase tracking-[0.18em] text-gold">{eyebrow}</p>
      )}
      <h2 className="text-balance font-serif text-[24px] leading-[1.08] text-foreground">
        {title}
      </h2>
      {text && <p className="mt-1.5 text-[12.5px] leading-snug text-muted-foreground">{text}</p>}
    </header>
  );
}

function StyleStep({
  value,
  onChange,
  onGuidance,
}: {
  value?: string;
  onChange: (v: string) => void;
  onGuidance: () => void;
}) {
  return (
    <section>
      <StepHeader
        eyebrow="Seu objetivo"
        title="Qual estilo de sorriso você deseja conquistar?"
        text="Selecione o estilo visual que mais se aproxima do seu ideal."
      />

      <div className="grid grid-cols-1 gap-2.5 min-[380px]:grid-cols-2">
        {STYLES.map((it, idx) => {
          const selected = value === it.id;
          return (
            <button
              key={it.id}
              type="button"
              onClick={() => onChange(it.id)}
              aria-pressed={selected}
              style={{ animationDelay: `${idx * 50}ms` }}
              className={`animate-scale-pop group relative flex w-full max-w-full flex-col overflow-hidden rounded-2xl text-left card-premium box-border ${selected ? "card-selected" : ""}`}
            >
              <div className="relative aspect-square w-full overflow-hidden">
                <img
                  src={it.image}
                  alt={it.title}
                  width={800}
                  height={800}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/50 via-transparent to-transparent" />
                {selected && (
                  <span className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full bg-gold text-primary shadow-gold animate-scale-pop">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="font-serif text-[15px] leading-tight text-foreground">{it.title}</p>
                <p className="mt-1 text-[11.5px] leading-snug text-muted-foreground">
                  {it.caption}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onGuidance}
        className="mt-4 w-full text-center text-[12.5px] leading-snug text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
      >
        Ainda não sei meu estilo, quero orientação em consulta
      </button>
    </section>
  );
}

function SingleChoiceStep({
  eyebrow,
  title,
  text,
  items,
  value,
  onChange,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  items: CardItem[];
  value?: string;
  onChange: (v: string) => void;
}) {
  return (
    <section>
      <StepHeader eyebrow={eyebrow} title={title} text={text} />
      <div className="grid gap-2.5">
        {items.map((it) => (
          <OptionCard
            key={it.id}
            item={it}
            selected={value === it.id}
            onClick={() => onChange(it.id)}
          />
        ))}
      </div>
    </section>
  );
}

function MultiChoiceStep({
  eyebrow,
  title,
  text,
  items,
  value,
  onChange,
  max,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  items: CardItem[];
  value: string[];
  onChange: (v: string[]) => void;
  max?: number;
}) {
  const toggle = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
      return;
    }
    if (max && value.length >= max) return;
    onChange([...value, id]);
  };

  const reachedMax = !!max && value.length >= max;

  return (
    <section>
      <StepHeader eyebrow={eyebrow} title={title} text={text} />
      <div className="grid gap-2.5">
        {items.map((it) => {
          const selected = value.includes(it.id);
          return (
            <OptionCard
              key={it.id}
              item={it}
              selected={selected}
              onClick={() => toggle(it.id)}
              multi
              disabled={reachedMax && !selected}
            />
          );
        })}
      </div>
      {reachedMax && (
        <p className="mt-3 text-center text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          Selecione até {max} opções principais
        </p>
      )}
    </section>
  );
}

/* ----------------------------- Option Card ----------------------------- */

function OptionCard({
  item,
  selected,
  onClick,
  multi = false,
  disabled = false,
}: {
  item: CardItem;
  selected: boolean;
  onClick: () => void;
  multi?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={`group relative flex w-full max-w-full items-start gap-3 rounded-2xl p-4 text-left card-premium box-border ${selected ? "card-selected" : ""} ${disabled ? "opacity-45" : ""}`}
    >
      <span
        className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center ${multi ? "rounded-md" : "rounded-full"} border-2 transition-colors ${selected ? "border-gold bg-gold text-primary" : "border-border bg-background text-transparent"}`}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        >
          <path d="M5 12l5 5L20 7" />
        </svg>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-serif text-[17px] leading-tight text-foreground">
          {item.title}
        </span>
        {item.caption && (
          <span className="mt-1 block text-[13px] leading-snug text-muted-foreground">
            {item.caption}
          </span>
        )}
      </span>
    </button>
  );
}

/* ----------------------------- Loading ----------------------------- */

function LoadingMap() {
  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <div className="relative grid h-28 w-28 place-items-center">
        <span className="absolute inset-0 rounded-full border border-gold/50 animate-pulse-ring" />
        <span
          className="absolute inset-2 rounded-full border border-gold/30 animate-pulse-ring"
          style={{ animationDelay: "0.4s" }}
        />
        <span className="grid h-12 w-12 place-items-center rounded-full bg-primary text-gold">
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <path d="M4 10c2-3 5-4 8-4s6 1 8 4c-1 6-5 9-8 9s-7-3-8-9z" />
          </svg>
        </span>
      </div>
      <p className="mt-8 font-serif text-2xl text-foreground">Organizando seu Mapa do Sorriso…</p>
      <p className="mt-3 max-w-xs text-[14px] text-muted-foreground">
        Reunindo objetivo, queixas e dúvidas para transformar respostas em clareza antes da decisão.
      </p>
    </section>
  );
}

/* ----------------------------- Result ----------------------------- */

const PROFILE_LABEL: Record<string, string> = {
  natural: "Harmonização Discreta",
  bright: "Rejuvenescimento Cromático",
  wide: "Amplitude & Simetria",
  hollywood: "Alta Performance Estética",
  orientacao: "Descoberta Guiada",
};

const GOAL_LABEL: Record<string, string> = {
  natural: "Sorriso Natural & Harmônico",
  bright: "Sorriso Rejuvenescido & Claro",
  wide: "Sorriso Amplo & Simétrico",
  hollywood: "Sorriso Ultra Radiante / Hollywood",
  orientacao: "Orientação de estilo em consulta",
};

const CONCERN_SHORT: Record<string, string> = {
  color: "Cor",
  shape: "Formato",
  spaces: "Espaços e alinhamento",
  gum: "Gengiva",
  restorations: "Restaurações antigas",
};

const PRIORITY_BY_OBJECTION: Record<string, string> = {
  wear: "Preservação do dente natural",
  durability: "Durabilidade e manutenção",
  investment: "Transparência de investimento",
  artificial: "Naturalidade e proporção",
  pain: "Conforto durante o processo",
};

const CONCERN_LABEL = Object.fromEntries(CONCERNS.map((c) => [c.id, c.title]));
const OBJECTION_LABEL = Object.fromEntries(OBJECTIONS.map((c) => [c.id, c.title]));
const DECISION_LABEL = Object.fromEntries(DECISION.map((c) => [c.id, c.title]));

function formatList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} e ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} e ${items[items.length - 1]}`;
}

function ResultMap({ answers, onRestart }: { answers: Answers; onRestart: () => void }) {
  const profile = (answers.style && PROFILE_LABEL[answers.style]) || "Descoberta Guiada";
  const goal = (answers.style && GOAL_LABEL[answers.style]) || "Ainda em definição";
  const concernShort = answers.concerns.map((id) => CONCERN_SHORT[id]).filter(Boolean);
  const concernFull = answers.concerns.map((id) => CONCERN_LABEL[id]).filter(Boolean);
  const priority = answers.objection
    ? PRIORITY_BY_OBJECTION[answers.objection]
    : "Clareza antes da decisão";

  const cta = (answers.decision && CTA_CONFIG[answers.decision]) || DEFAULT_CTA;

  const brief = [
    `Objetivo: ${goal}.`,
    concernFull.length ? `Principais queixas: ${formatList(concernFull)}.` : "",
    answers.objection ? `Principal dúvida: ${OBJECTION_LABEL[answers.objection]}` : "",
    answers.decision ? `Momento: ${DECISION_LABEL[answers.decision]}.` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const wppHref = `https://wa.me/${CLINIC_WHATSAPP}?text=${encodeURIComponent(`${cta.message} ${brief}`)}`;

  return (
    <section className="pb-10">
      <header className="mb-5 mt-2 text-center">
        <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-gold/60 bg-gold-soft/30 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-foreground">
          <span className="h-1 w-1 rounded-full bg-gold" /> Análise concluída
        </p>
        <h2 className="font-serif text-[32px] leading-[1.05] text-foreground">
          Seu Mapa do Sorriso está pronto!
        </h2>
      </header>

      <article className="rounded-3xl border border-gold bg-card p-4 shadow-gold">
        <p className="text-[11px] uppercase tracking-[0.2em] text-gold">Perfil</p>
        <p className="mt-1.5 font-serif text-[24px] leading-tight text-foreground">{profile}</p>

        <dl className="mt-4 space-y-2.5 border-t border-border pt-3.5">
          <SummaryRow label="Objetivo" value={goal} />
          <SummaryRow
            label="Principal queixa"
            value={concernShort.length ? formatList(concernShort) : "Não especificada"}
          />
          <SummaryRow label="Prioridade técnica" value={priority} />
        </dl>
      </article>

      <article className="mt-3 rounded-3xl border border-border bg-card p-4 shadow-card">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Padrão de qualidade
        </p>
        <p className="mt-1.5 font-serif text-[20px] leading-tight text-foreground">
          O Padrão de Qualidade do Seu Planejamento
        </p>
        <ul className="mt-3.5 space-y-3">
          {QUALITY_POINTS.map((p) => (
            <li key={p.title} className="flex items-start gap-2.5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
              <span className="min-w-0">
                <span className="block font-serif text-[16px] leading-tight text-foreground">
                  {p.title}
                </span>
                <span className="mt-0.5 block text-[13px] leading-snug text-muted-foreground">
                  {p.text}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </article>

      <div className="mt-3 rounded-3xl border border-dashed border-border bg-muted/50 p-4 text-[12.5px] leading-relaxed text-muted-foreground">
        Este mapa é educativo, não representa diagnóstico nem promessa de resultado. A indicação
        final é sempre do dentista, após avaliação clínica.
      </div>

      <a
        href={wppHref}
        target="_blank"
        rel="noopener noreferrer"
        className="group mt-5 flex w-full items-center justify-between gap-3 rounded-2xl bg-primary px-5 py-4 text-left text-primary-foreground shadow-soft transition-all duration-300 hover:translate-y-[-2px] hover:shadow-gold active:scale-[0.99]"
      >
        <span className="flex min-w-0 flex-col">
          <span className="text-[11px] uppercase tracking-[0.2em] text-gold-soft">
            Próximo passo
          </span>
          <span className="mt-1 font-serif text-[16px] leading-tight">{cta.buttonText}</span>
        </span>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold text-primary transition-transform group-hover:translate-x-1">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
            <path d="M20 3.5A11.5 11.5 0 003 19l-1 4 4.2-1.1A11.5 11.5 0 1020 3.5zm-8.5 18a9.5 9.5 0 01-4.9-1.4l-.3-.2-2.5.7.7-2.4-.2-.4A9.5 9.5 0 1111.5 21.5zm5.4-7.1c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.2s-.8.9-1 1.1c-.2.2-.4.2-.7.1a7.7 7.7 0 01-2.3-1.4 8.6 8.6 0 01-1.6-2c-.2-.3 0-.5.1-.6l.5-.6c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.1c-.2-.5-.5-.4-.7-.4h-.6a1.2 1.2 0 00-.9.4 3.6 3.6 0 00-1.1 2.7c0 1.6 1.1 3.1 1.3 3.3.2.2 2.3 3.5 5.5 4.7a18 18 0 001.8.6 4.4 4.4 0 002 .1 3.3 3.3 0 002.2-1.5 2.7 2.7 0 00.2-1.5c-.1-.1-.3-.2-.6-.3z" />
          </svg>
        </span>
      </a>

      <button
        type="button"
        onClick={onRestart}
        className="mt-3 w-full rounded-2xl border border-border bg-card px-5 py-3.5 text-[14px] text-muted-foreground transition-colors hover:text-foreground"
      >
        Refazer minha experiência
      </button>
    </section>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,7rem)_minmax(0,1fr)] items-start gap-3">
      <dt className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-[13.5px] leading-snug text-foreground">{value}</dd>
    </div>
  );
}

/* ----------------------------- Sticky CTA ----------------------------- */

function StickyCTA({
  label,
  disabled,
  onClick,
  onBack,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  onBack?: () => void;
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-background via-background/95 to-background/0 pt-2">
      <div className="w-full px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div className="pointer-events-auto rounded-2xl border border-border bg-card/95 p-1 shadow-card backdrop-blur">
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                aria-label="Voltar"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border bg-background text-foreground/70 transition-colors active:bg-muted"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
              </button>
            )}
            <button
              type="button"
              onClick={onClick}
              disabled={disabled}
              className={`group relative flex h-10 flex-1 items-center justify-between gap-3 overflow-hidden rounded-xl px-4 text-left transition-all duration-300 ${
                disabled
                  ? "cursor-not-allowed bg-muted text-muted-foreground opacity-70"
                  : "bg-primary text-primary-foreground active:scale-[0.99]"
              }`}
            >
              <span className="truncate font-serif text-[15px]">{label}</span>
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg transition-transform group-hover:translate-x-0.5 ${disabled ? "bg-background/40" : "bg-gold text-primary"}`}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
