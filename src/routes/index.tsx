import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";

import heroSmile from "@/assets/hero-smile.jpg";
import desireNatural from "@/assets/desire-natural.jpg";
import desireBright from "@/assets/desire-bright.jpg";
import desireProportion from "@/assets/desire-proportion.jpg";
import desireConfident from "@/assets/desire-confident.jpg";
import desireBold from "@/assets/desire-bold.jpg";
import refArc from "@/assets/ref-arc.jpg";
import refProportion from "@/assets/ref-proportion.jpg";
import refShade from "@/assets/ref-shade.jpg";
import refTexture from "@/assets/ref-texture.jpg";
import refAlignment from "@/assets/ref-alignment.jpg";
import refExposure from "@/assets/ref-exposure.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Laboratório do Sorriso Ideal — NOA Lead Flow Smile" },
      {
        name: "description",
        content:
          "Uma experiência visual para explorar estilo, harmonia e naturalidade do seu sorriso antes de conversar com um especialista.",
      },
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

const DESIRE: CardItem[] = [
  {
    id: "natural",
    title: "Quero um resultado natural",
    image: desireNatural,
  },
  {
    id: "bright",
    title: "Busco dentes mais brancos",
    image: desireBright,
  },
  {
    id: "harmonic",
    title: "Dentes em harmonia com minha boca",
    image: desireProportion,
  },
  {
    id: "bold",
    title: "Quero uma mudança radical",
    image: desireBold,
  },
  {
    id: "confident",
    title: "Ainda não sei explicar",
    image: desireConfident,
  },
];

const PERCEPTION: CardItem[] = [
  { id: "color", title: "Cor amarelada ou escura" },
  { id: "shape", title: "Formato irregular dos dentes" },
  { id: "size", title: "Dentes pequenos, curtos ou desproporcionais" },
  { id: "spaces", title: "Espaços entre os dentes" },
  { id: "align", title: "Dentes tortos ou desalinhados" },
  { id: "small", title: "Sorriso pequeno ou pouco aparente" },
  { id: "gum", title: "Gengiva muito aparente" },
  { id: "edges", title: "Bordas desgastadas ou irregulares" },
  { id: "stains", title: "Manchas, restaurações ou marcas antigas" },
  { id: "unsure", title: "Não sei exatamente, só quero melhorar" },
];

const REFERENCES: CardItem[] = [
  {
    id: "arc",
    title: "Arco do sorriso",
    caption: "Quando acompanha a curva do lábio, o sorriso tende a parecer mais harmônico.",
    image: refArc,
  },
  {
    id: "proportion",
    title: "Proporção dos dentes",
    caption: "Tamanho e largura influenciam equilíbrio e naturalidade.",
    image: refProportion,
  },
  {
    id: "shade",
    title: "Cor e luminosidade",
    caption: "O branco ideal precisa combinar com pele, rosto e estilo.",
    image: refShade,
  },
  {
    id: "symmetry",
    title: "Simetria visual",
    caption: "Pequenas assimetrias podem mudar a percepção do sorriso.",
    image: refAlignment,
  },
  {
    id: "shape",
    title: "Formato dos dentes",
    caption: "Formas mais arredondadas, retas ou alongadas comunicam estilos diferentes.",
    image: refTexture,
  },
  {
    id: "exposure",
    title: "Exposição do sorriso",
    caption: "O quanto o sorriso aparece ao falar ou sorrir influencia a presença visual.",
    image: refExposure,
  },
];

const SAFETY: CardItem[] = [
  { id: "natural", title: "Se o resultado pode ficar natural" },
  { id: "wear", title: "Se precisa desgastar meus dentes" },
  { id: "fit", title: "Se combina com meu rosto e minha expressão" },
  { id: "price", title: "Por que os valores variam tanto" },
  { id: "pain", title: "Se dói, incomoda ou exige recuperação" },
  { id: "durability", title: "Quanto tempo dura e quais cuidados exige" },
  { id: "alternatives", title: "Se existem alternativas antes de facetas" },
  { id: "indication", title: "Se meu caso realmente precisa de facetas" },
];

const MOMENT: CardItem[] = [
  { id: "now", title: "Estou pronto(a) para uma avaliação" },
  { id: "schedule", title: "Quero entender possibilidades antes de decidir" },
  { id: "price", title: "Quero entender investimento com mais contexto" },
  { id: "compare", title: "Estou comparando clínicas ou tratamentos" },
  { id: "fear", title: "Tenho vontade, mas ainda tenho medo de errar" },
  { id: "learn", title: "Estou só começando a pesquisar" },
];

const INTENT: CardItem[] = [
  { id: "evaluate", title: "Saber quais possibilidades combinam com meu caso" },
  { id: "price", title: "Entender o que influencia o valor" },
  { id: "doubts", title: "Saber como evitar um resultado artificial" },
  { id: "guidance", title: "Entender limites, cuidados e próximos passos" },
  { id: "research", title: "Comparar alternativas antes de escolher" },
];

const STEPS = [
  { key: "hero", label: "Início" },
  { key: "desire", label: "Desejo" },
  { key: "perception", label: "Percepção" },
  { key: "references", label: "Referências" },
  { key: "safety", label: "Segurança" },
  { key: "moment", label: "Momento" },
  { key: "intent", label: "Intenção" },
  { key: "lead", label: "Mapa" },
  { key: "loading", label: "Mapa" },
  { key: "result", label: "Mapa" },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

/* ----------------------------- State ----------------------------- */

type Answers = {
  desire?: string;
  references: string[];
  perception: string[];
  safety: string[];
  moment?: string;
  intent?: string;
  lead: { name: string; whatsapp: string; city: string; time: string };
};

const initialAnswers: Answers = {
  references: [],
  perception: [],
  safety: [],
  lead: { name: "", whatsapp: "", city: "", time: "" },
};

/* ----------------------------- Component ----------------------------- */

function SmileLab() {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const step: StepKey = STEPS[stepIndex].key;

  // Loading -> result auto-advance
  useEffect(() => {
    if (step === "loading") {
      const t = setTimeout(() => setStepIndex((i) => i + 1), 2200);
      return () => clearTimeout(t);
    }
  }, [step]);

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [stepIndex]);

  const progressSteps = STEPS.slice(1, 8); // Desejo .. Mapa
  const currentProgressIdx = Math.min(Math.max(stepIndex - 1, 0), progressSteps.length - 1);

  const next = () => setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  const back = () => setStepIndex((i) => Math.max(i - 1, 0));

  const canAdvance = useMemo(() => {
    switch (step) {
      case "desire":
        return !!answers.desire;
      case "references":
        return true; // educational pause
      case "perception":
        return answers.perception.length > 0;
      case "safety":
        return answers.safety.length > 0;
      case "moment":
        return !!answers.moment;
      case "intent":
        return !!answers.intent;
      case "lead":
        return (
          answers.lead.name.trim().length > 1 &&
          answers.lead.whatsapp.replace(/\D/g, "").length >= 10
        );
      default:
        return true;
    }
  }, [step, answers]);

  const showCTA = step !== "hero" && step !== "loading" && step !== "result";
  const showProgress = showCTA;

  // Reset internal scroll on step change
  const mainRef = useRef<HTMLElement>(null);
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [stepIndex]);

  return (
    <div className="min-h-[100dvh] w-full overflow-x-hidden bg-muted/40 text-foreground">
      <div className="relative mx-auto flex min-h-[100dvh] w-full min-w-0 max-w-[430px] flex-col overflow-hidden bg-background shadow-[0_0_60px_-20px_rgba(0,0,0,0.25)] sm:min-h-[100dvh]">
        <AppHeader />
        {showProgress && (
          <ProgressBar steps={progressSteps.map((s) => s.label)} current={currentProgressIdx} />
        )}

        <main
          ref={mainRef}
          className={`flex-1 min-w-0 overflow-y-auto overflow-x-hidden px-4 pt-2 ${showCTA ? "pb-28" : "pb-5"}`}
        >
          <div key={step} className="animate-fade-up">
            {step === "hero" && <Hero onStart={next} />}

            {step === "desire" && (
              <SingleChoiceStep
                eyebrow="Etapa 01 — Desejo"
                title="O que você gostaria de mudar no seu sorriso?"
                items={DESIRE}
                value={answers.desire}
                onChange={(v) => setAnswers((a) => ({ ...a, desire: v }))}
                withImages
              />
            )}

            {step === "references" && (
              <ReferencesGallery
                items={REFERENCES}
                value={answers.references}
                onChange={(references) => setAnswers((a) => ({ ...a, references }))}
              />
            )}

            {step === "perception" && (
              <MultiChoiceStep
                eyebrow="Etapa 03 — Percepção"
                title="O que mais lhe incomoda no seu sorriso atualmente?"
                items={PERCEPTION}
                value={answers.perception}
                onChange={(v) => setAnswers((a) => ({ ...a, perception: v }))}
              />
            )}

            {step === "safety" && (
              <MultiChoiceStep
                eyebrow="Etapa 04 — Segurança"
                title="Quais são suas principais dúvidas quando o assunto é faceta?"
                items={SAFETY}
                value={answers.safety}
                onChange={(v) => setAnswers((a) => ({ ...a, safety: v }))}
              />
            )}

            {step === "moment" && (
              <SingleChoiceStep
                eyebrow="Etapa 05 — Momento"
                title="Em que fase você está hoje?"
                items={MOMENT}
                value={answers.moment}
                onChange={(v) => setAnswers((a) => ({ ...a, moment: v }))}
              />
            )}

            {step === "intent" && (
              <SingleChoiceStep
                eyebrow="Etapa 06 — Intenção"
                title="O que você quer levar da conversa com a clínica?"
                items={INTENT}
                value={answers.intent}
                onChange={(v) => setAnswers((a) => ({ ...a, intent: v }))}
              />
            )}

            {step === "lead" && (
              <LeadForm
                value={answers.lead}
                onChange={(lead) => setAnswers((a) => ({ ...a, lead }))}
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
              step === "lead"
                ? "Ver meu Mapa do Sorriso"
                : step === "references"
                  ? "Entendi, continuar"
                  : !canAdvance
                    ? "Escolha uma opção para continuar"
                    : "Continuar"
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
              NOA Lead Flow Smile
            </p>
            <p className="truncate font-serif text-[14px] text-foreground">
              Laboratório do Sorriso
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ----------------------------- Progress ----------------------------- */

function ProgressBar({ steps, current }: { steps: string[]; current: number }) {
  const pct = ((current + 1) / steps.length) * 100;
  return (
    <div className="shrink-0 border-b border-border/60 bg-background/90 backdrop-blur-md">
      <div className="w-full px-4 pb-2 pt-2">
        <div className="mb-1.5 flex items-center justify-between gap-3">
          <p className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
            Etapa {String(current + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
          </p>
          <p className="truncate font-serif text-[12px] text-foreground">{steps[current]}</p>
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
            Antes de comparar preço,
            <br />
            entenda seu sorriso.
          </h1>
          <p className="mt-3 max-w-[31ch] text-[13px] leading-relaxed text-background/85">
            Organize sua percepção antes de conversar com a clínica.
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

function StepHeader({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <header className="mb-2 mt-1">
      <p className="mb-1.5 text-[10px] uppercase tracking-[0.18em] text-gold">{eyebrow}</p>
      <h2 className="text-balance font-serif text-[24px] leading-[1.08] text-foreground sm:text-[26px]">
        {title}
      </h2>
      {text && <p className="mt-1.5 text-[12.5px] leading-snug text-muted-foreground">{text}</p>}
    </header>
  );
}

function CompactNote({ children }: { children: React.ReactNode }) {
  return <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted-foreground">{children}</p>;
}

function SingleChoiceStep({
  eyebrow,
  title,
  text,
  items,
  value,
  onChange,
  withImages = false,
}: {
  eyebrow: string;
  title: string;
  text?: string;
  items: CardItem[];
  value?: string;
  onChange: (v: string) => void;
  withImages?: boolean;
}) {
  return (
    <section>
      <StepHeader eyebrow={eyebrow} title={title} text={text} />
      <div className="grid gap-2">
        {items.map((it, idx) => (
          <OptionCard
            key={it.id}
            item={it}
            selected={value === it.id}
            onClick={() => onChange(it.id)}
            withImage={withImages}
            index={idx}
          />
        ))}
      </div>
      <CompactNote>
        Essa escolha não define tratamento. Ela só ajuda a clínica a entender o que você imagina.
      </CompactNote>
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
  withImages = false,
}: {
  eyebrow: string;
  title: string;
  text?: string;
  items: CardItem[];
  value: string[];
  onChange: (v: string[]) => void;
  withImages?: boolean;
}) {
  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  };
  return (
    <section>
      <StepHeader eyebrow={eyebrow} title={title} text={text} />
      <div className="grid gap-2.5">
        {items.map((it, idx) => (
          <OptionCard
            key={it.id}
            item={it}
            selected={value.includes(it.id)}
            onClick={() => toggle(it.id)}
            multi
            withImage={withImages}
            index={idx}
          />
        ))}
      </div>
      {value.length > 0 && (
        <p className="mt-3 text-center text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          {value.length} {value.length === 1 ? "selecionado" : "selecionados"}
        </p>
      )}
    </section>
  );
}

/* ----------------------------- References (educational) ----------------------------- */

function ReferencesGallery({
  items,
  value,
  onChange,
}: {
  items: CardItem[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  };

  return (
    <section>
      <header className="mb-2 mt-1">
        <p className="mb-1.5 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-gold">
          <span className="h-1 w-1 rounded-full bg-gold" />
          Etapa 02 — Referências
        </p>
        <h2 className="text-balance font-serif text-[23px] leading-[1.08] text-foreground">
          Compare com calma.
        </h2>
        <p className="mt-1.5 text-[12.5px] leading-snug text-muted-foreground">
          Naturalidade, proporção, cor e presença contam mais do que pressa.
        </p>
      </header>

      <div
        className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div className="shrink-0 w-4" aria-hidden="true" />
        {items.map((it, idx) => {
          const selected = value.includes(it.id);
          return (
            <button
              type="button"
              key={it.id}
              onClick={() => toggle(it.id)}
              aria-pressed={selected}
              style={{ animationDelay: `${idx * 60}ms` }}
              className={`animate-scale-pop relative flex min-w-[82%] snap-start flex-col overflow-hidden rounded-2xl border bg-card text-left shadow-card sm:min-w-[72%] ${selected ? "border-gold shadow-gold" : "border-border"}`}
            >
              {it.image && (
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <img
                    src={it.image}
                    alt={it.title}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/55 via-transparent to-transparent" />
                  <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-[9px] uppercase tracking-[0.16em] text-foreground backdrop-blur">
                    {String(idx + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
                  </span>
                  {selected && (
                    <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-gold text-primary shadow-gold animate-scale-pop">
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
              )}
              <div className="p-3.5">
                <p className="font-serif text-[17px] leading-tight text-foreground">{it.title}</p>
                {it.caption && (
                  <p className="mt-1 text-[12.5px] leading-snug text-muted-foreground">
                    {it.caption}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-center text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        {value.length > 0
          ? `${value.length} ${value.length === 1 ? "referência marcada" : "referências marcadas"}`
          : "Marcar referências é opcional"}
      </p>
    </section>
  );
}

/* ----------------------------- Option Card ----------------------------- */

function OptionCard({
  item,
  selected,
  onClick,
  multi = false,
  withImage = false,
  index = 0,
}: {
  item: CardItem;
  selected: boolean;
  onClick: () => void;
  multi?: boolean;
  withImage?: boolean;
  index?: number;
}) {
  if (withImage && item.image) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={selected}
        style={{ animationDelay: `${index * 50}ms` }}
        className={`animate-scale-pop group relative flex w-full max-w-full flex-col overflow-hidden rounded-2xl text-left card-premium box-border ${selected ? "card-selected" : ""}`}
      >
        <div className="relative aspect-[21/9] w-full overflow-hidden">
          <img
            src={item.image}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/55 via-transparent to-transparent" />
          {selected && (
            <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-gold text-primary shadow-gold animate-scale-pop">
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
        <div className="p-3.5">
          <p className="font-serif text-[17px] leading-tight text-foreground">{item.title}</p>
          {item.caption && (
            <p className="mt-1 text-[12.5px] leading-snug text-muted-foreground">{item.caption}</p>
          )}
        </div>
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`group relative flex w-full max-w-full items-start gap-3 rounded-2xl p-4 text-left card-premium box-border ${selected ? "card-selected" : ""}`}
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

/* ----------------------------- Lead form ----------------------------- */

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function LeadForm({
  value,
  onChange,
}: {
  value: Answers["lead"];
  onChange: (v: Answers["lead"]) => void;
}) {
  const upd = (k: keyof Answers["lead"], v: string) => onChange({ ...value, [k]: v });
  return (
    <section>
      <StepHeader
        eyebrow="Etapa 07 — Mapa"
        title="Seu Mapa do Sorriso está pronto para ser organizado."
        text="Informe seus dados para receber um resumo educativo do que você observou e, se fizer sentido, continuar a conversa com mais clareza."
      />
      <div className="space-y-3 rounded-3xl border border-border bg-card p-5 shadow-card">
        <Field label="Nome" required>
          <input
            type="text"
            value={value.name}
            onChange={(e) => upd("name", e.target.value.slice(0, 80))}
            placeholder="Como podemos te chamar"
            className="w-full bg-transparent text-[16px] text-foreground outline-none placeholder:text-muted-foreground/60"
          />
        </Field>
        <Field label="WhatsApp" required>
          <input
            type="tel"
            inputMode="numeric"
            value={value.whatsapp}
            onChange={(e) => upd("whatsapp", maskPhone(e.target.value))}
            placeholder="(11) 99999-9999"
            className="w-full bg-transparent text-[16px] text-foreground outline-none placeholder:text-muted-foreground/60"
          />
        </Field>
        <Field label="Cidade">
          <input
            type="text"
            value={value.city}
            onChange={(e) => upd("city", e.target.value.slice(0, 60))}
            placeholder="Opcional"
            className="w-full bg-transparent text-[16px] text-foreground outline-none placeholder:text-muted-foreground/60"
          />
        </Field>
        <Field label="Melhor horário para contato">
          <input
            type="text"
            value={value.time}
            onChange={(e) => upd("time", e.target.value.slice(0, 60))}
            placeholder="Ex.: manhã, depois das 18h"
            className="w-full bg-transparent text-[16px] text-foreground outline-none placeholder:text-muted-foreground/60"
          />
        </Field>
      </div>
      <p className="mt-4 text-center text-[12px] leading-relaxed text-muted-foreground">
        Você não está autorizando diagnóstico pelo WhatsApp. O mapa apenas organiza seus interesses
        para uma conversa mais clara.
      </p>
    </section>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block rounded-2xl border border-border bg-background px-4 py-3 transition-colors focus-within:border-gold">
      <span className="block text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        {label} {required && <span className="text-gold">*</span>}
      </span>
      <div className="mt-1">{children}</div>
    </label>
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
        Reunindo desejos, percepções e dúvidas para transformar respostas em clareza antes da
        decisão.
      </p>
    </section>
  );
}

/* ----------------------------- Result ----------------------------- */

const STYLE_LABEL: Record<string, string> = {
  natural: "Resultado natural",
  bright: "Dentes mais claros",
  harmonic: "Mais harmonia",
  confident: "Desejo ainda em descoberta",
  bold: "Transformação maior com segurança",
};

const PERCEPTION_LABEL = Object.fromEntries(PERCEPTION.map((p) => [p.id, p.title]));
const REF_LABEL = Object.fromEntries(REFERENCES.map((p) => [p.id, p.title]));
const SAFETY_LABEL = Object.fromEntries(SAFETY.map((p) => [p.id, p.title]));

function desireNarrative(id?: string): string {
  switch (id) {
    case "natural":
      return "Você busca uma melhora discreta, com aparência leve e integrada ao rosto. Na conversa com a clínica, vale observar principalmente naturalidade, acabamento e harmonia com sua expressão.";
    case "bright":
      return "Seu interesse aponta para mais luminosidade e presença no sorriso. O ponto importante é entender qual nível de clareamento, cor ou contraste combina com seu rosto sem criar um aspecto artificial.";
    case "harmonic":
      return "Sua escolha indica foco em equilíbrio visual. A avaliação pode explorar proporção, formato, alinhamento aparente e como esses elementos influenciam a harmonia do sorriso.";
    case "confident":
      return "Seu mapa mostra que você ainda está organizando a percepção sobre o sorriso. Isso é comum: muitas pessoas sentem que algo poderia melhorar antes de saber se o ponto está na cor, no formato, na proporção ou na harmonia geral.";
    case "bold":
      return "Você parece aberto(a) a uma mudança mais perceptível, mas com segurança. O cuidado aqui é alinhar expectativa, limite clínico e previsibilidade antes de falar em qualquer caminho estético.";
    default:
      return "Seu mapa organiza os pontos que você quer observar antes de conversar com um dentista sobre possibilidades estéticas.";
  }
}

function perceptionNarrative(ids: string[]): string {
  if (ids.includes("unsure") && ids.length === 1) {
    return "Você ainda não nomeou exatamente o que incomoda, e isso é comum. A consulta pode ajudar a traduzir essa percepção geral em pontos observáveis, sem forçar uma decisão agora.";
  }

  const has = (id: string) => ids.includes(id);
  const groups: string[] = [];

  if (has("color") || has("stains")) groups.push("cor, manchas ou restaurações aparentes");
  if (has("shape") || has("size") || has("edges"))
    groups.push("formato, tamanho, proporção ou acabamento dos dentes");
  if (has("spaces") || has("align")) groups.push("alinhamento visual e espaços");
  if (has("small") || has("gum")) groups.push("exposição do sorriso, gengiva e presença ao sorrir");

  if (groups.length === 0) {
    return "Os pontos marcados ajudam a clínica a entender onde sua percepção estética está concentrada e quais temas merecem ser avaliados com mais calma.";
  }

  return `Os pontos que você marcou se concentram em ${formatList(groups)}. Isso não define tratamento, mas ajuda a conversa a começar pelo que você realmente percebe no espelho.`;
}

function perceptionInsight(title: string): string {
  switch (title) {
    case "Cor amarelada ou escura":
    case "Cor dos dentes":
      return "Cor e luminosidade: entender como a tonalidade interfere na aparência do sorriso.";
    case "Formato irregular dos dentes":
    case "Formato dos dentes":
      return "Formato dos dentes: observar como contornos e desenho dental influenciam a personalidade do sorriso.";
    case "Dentes pequenos, curtos ou desproporcionais":
    case "Tamanho dos dentes":
      return "Proporção: avaliar como tamanho e exposição dos dentes afetam a harmonia visual.";
    case "Espaços entre os dentes":
      return "Espaços: conversar sobre continuidade, simetria e equilíbrio do sorriso.";
    case "Dentes tortos ou desalinhados":
    case "Dentes desalinhados":
      return "Alinhamento visual: observar sensação de continuidade, simetria e equilíbrio.";
    case "Sorriso pequeno ou pouco aparente":
      return "Exposição do sorriso: entender como os dentes aparecem ao falar ou sorrir.";
    case "Gengiva muito aparente":
      return "Gengiva: analisar com cuidado a relação entre dentes, gengiva e exposição ao sorrir.";
    case "Bordas desgastadas ou irregulares":
      return "Bordas e acabamento: observar contornos que podem influenciar a percepção estética.";
    case "Manchas, restaurações ou marcas antigas":
      return "Marcas e restaurações: avaliar como textura, manchas e histórico dental influenciam a indicação estética.";
    case "Não sei exatamente, só quero melhorar":
      return "Dúvida geral: transformar percepções soltas em perguntas claras para a avaliação profissional.";
    default:
      return title;
  }
}

function safetyNarrative(ids: string[]): string {
  if (ids.length === 0) {
    return "Você busca mais clareza antes de decidir. Esse mapa ajuda a organizar a conversa inicial, mas a análise clínica vem depois.";
  }

  const parts: string[] = [];
  if (ids.includes("natural")) parts.push("evitar resultado artificial");
  if (ids.includes("wear")) parts.push("entender preservação e possível desgaste dos dentes");
  if (ids.includes("fit")) parts.push("avaliar se a mudança combina com rosto e expressão");
  if (ids.includes("price"))
    parts.push(
      "entender por que investimento varia conforme complexidade, materiais, planejamento e quantidade de dentes",
    );
  if (ids.includes("pain")) parts.push("esclarecer conforto, etapas e recuperação");
  if (ids.includes("durability")) parts.push("conversar sobre durabilidade, manutenção e cuidados");
  if (ids.includes("alternatives")) parts.push("comparar alternativas antes de pensar em facetas");
  if (ids.includes("indication"))
    parts.push("confirmar se facetas fazem sentido para o caso, sem indicação automática");

  return `Suas principais dúvidas giram em torno de ${formatList(parts)}. Elas são boas perguntas para levar à avaliação, porque evitam decidir só pelo preço ou por promessa estética.`;
}

function momentNarrative(moment?: string, intent?: string): string {
  if (moment === "now") {
    return "Como seu momento é de ação, o melhor próximo passo é conversar com a equipe e levar esse mapa como resumo inicial do que você procura.";
  }
  if (moment === "schedule" || intent === "evaluate") {
    return "Como você já considera uma avaliação, use este mapa para chegar com mais clareza sobre desejo, incômodos e dúvidas.";
  }
  if (moment === "price" || intent === "price") {
    return "Se valores ainda são decisivos, a conversa pode começar pelos fatores que influenciam investimento e pela necessidade de avaliação antes de qualquer estimativa séria.";
  }
  if (moment === "compare") {
    return "Como você está comparando possibilidades, este mapa ajuda a diferenciar desejo estético, dúvidas clínicas e critérios para escolher com segurança.";
  }
  if (moment === "fear" || intent === "doubts") {
    return "Como ainda existem receios, a prioridade é esclarecer dúvidas antes de decidir. Uma conversa inicial pode reduzir insegurança sem pressionar por tratamento.";
  }
  if (moment === "learn" || intent === "research") {
    return "Como você ainda está aprendendo, salve este mapa como ponto de partida e avance apenas quando fizer sentido conversar com um profissional.";
  }
  if (intent === "guidance") {
    return "Uma orientação inicial pode ajudar a organizar possibilidades e entender que tipo de avaliação faria sentido para você.";
  }
  return "O próximo passo mais seguro é conversar com a equipe para entender possibilidades, dúvidas e critérios de avaliação.";
}

function formatList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} e ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} e ${items[items.length - 1]}`;
}

function buildClinicBrief(
  answers: Answers,
  styleLabel: string,
  references: string[],
  perceived: string[],
  safetyTitles: string[],
): string {
  const parts = [
    `Desejo principal: ${styleLabel}.`,
    references.length
      ? `Referências que chamaram atenção: ${formatList(references.slice(0, 4))}.`
      : "Referências marcadas: nenhuma; pessoa apenas observou a etapa educativa.",
    perceived.length
      ? `Pontos percebidos: ${formatList(perceived.slice(0, 5))}.`
      : "Pontos percebidos: não especificados.",
    safetyTitles.length
      ? `Dúvidas centrais: ${formatList(safetyTitles.slice(0, 5))}.`
      : "Dúvidas centrais: não especificadas.",
  ];

  if (answers.moment) {
    const momentLabel = MOMENT.find((m) => m.id === answers.moment)?.title;
    if (momentLabel) parts.push(`Momento: ${momentLabel}.`);
  }

  if (answers.intent) {
    const intentLabel = INTENT.find((m) => m.id === answers.intent)?.title;
    if (intentLabel) parts.push(`Intenção: ${intentLabel}.`);
  }

  return parts.join(" ");
}

function ResultMap({ answers, onRestart }: { answers: Answers; onRestart: () => void }) {
  const styleLabel = answers.desire ? STYLE_LABEL[answers.desire] : "Equilibrado";
  const refs = answers.references.map((id) => REF_LABEL[id]).filter(Boolean);
  const perceived = answers.perception.map((id) => PERCEPTION_LABEL[id]).filter(Boolean);
  const attention = [...refs, ...perceived].slice(0, 4);
  const safetyTitles = answers.safety.map((id) => SAFETY_LABEL[id]).filter(Boolean);
  const safetyTitle = safetyTitles.length
    ? formatList(safetyTitles.slice(0, 3))
    : "Mais informação";

  const clinicBrief = buildClinicBrief(answers, styleLabel, refs, perceived, safetyTitles);
  const wppMessage = encodeURIComponent(
    `Olá! Acabei de preencher meu Mapa do Sorriso. ${clinicBrief} Gostaria de entender, com orientação da clínica, quais possibilidades podem fazer sentido antes de comparar apenas valores.`,
  );
  const clinicWhatsappNumber = "351911056526";
  const wppHref = `https://wa.me/${clinicWhatsappNumber}?text=${wppMessage}`;

  return (
    <section className="pb-12">
      <header className="mb-6 mt-2 text-center">
        <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-gold">
          Resultado personalizado
        </p>
        <h2 className="font-serif text-[34px] leading-[1.05] text-foreground sm:text-4xl">
          Seu Mapa do Sorriso
        </h2>
        {answers.lead.name && (
          <p className="mt-2 text-[14px] text-muted-foreground">
            para {answers.lead.name.split(" ")[0]}
          </p>
        )}
      </header>

      <div className="space-y-4">
        <ResultBlock eyebrow="Estilo predominante" title={styleLabel} accent />

        <ResultBlock eyebrow="Pontos que chamaram sua atenção">
          {attention.length > 0 ? (
            <ul className="mt-2 space-y-2">
              {attention.map((t) => (
                <li
                  key={t}
                  className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-foreground/90"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  <span>{perceptionInsight(t)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[14px] text-muted-foreground">
              Você preferiu observar sem destacar pontos específicos — também é uma escolha válida.
            </p>
          )}
        </ResultBlock>

        <ResultBlock eyebrow="Cuidado principal" title={safetyTitle} />

        <ResultBlock eyebrow="Leitura do seu perfil">
          <div className="mt-3 space-y-3 text-[14px] leading-relaxed text-foreground/90">
            <p>{desireNarrative(answers.desire)}</p>
            <p>{perceptionNarrative(answers.perception)}</p>
            <p>{safetyNarrative(answers.safety)}</p>
          </div>
        </ResultBlock>

        <ResultBlock eyebrow="Como usar este mapa na avaliação">
          <p className="mt-3 text-[14px] leading-relaxed text-foreground/90">
            {momentNarrative(answers.moment, answers.intent)}
          </p>
          <div className="mt-4 rounded-2xl bg-muted/60 p-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Resumo para a equipe
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-foreground/90">{clinicBrief}</p>
          </div>
        </ResultBlock>

        <ResultBlock eyebrow="Antes de comparar preço, observe estes critérios">
          <ul className="mt-3 space-y-2 text-[13.5px] leading-relaxed text-foreground/90">
            <li>
              <span className="font-medium text-foreground">Naturalidade:</span> o sorriso precisa
              conversar com rosto, expressão e personalidade.
            </li>
            <li>
              <span className="font-medium text-foreground">Planejamento:</span> cor, formato,
              proporção e exposição devem ser pensados juntos.
            </li>
            <li>
              <span className="font-medium text-foreground">Segurança:</span> qualquer possibilidade
              depende de avaliação clínica.
            </li>
            <li>
              <span className="font-medium text-foreground">Valor:</span> investimento muda conforme
              complexidade, materiais e previsibilidade desejada.
            </li>
          </ul>
          <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
            Seu próximo passo não precisa ser decidir agora. Pode ser entender, com um dentista, o
            que faz sentido para o seu caso antes de comparar apenas valores.
          </p>
        </ResultBlock>

        <ResultBlock eyebrow="Perguntas para levar à avaliação">
          <ul className="mt-3 space-y-2 text-[13.5px] leading-relaxed text-foreground/90">
            <li>O que mais influencia essa percepção no meu sorriso?</li>
            <li>Existem caminhos mais conservadores para o meu caso?</li>
            <li>O que dá para melhorar sem perder naturalidade?</li>
            <li>Quais limites preciso entender antes de decidir?</li>
          </ul>
        </ResultBlock>

        <div className="rounded-3xl border border-dashed border-border bg-muted/50 p-5">
          <div className="space-y-2 text-[12.5px] leading-relaxed text-muted-foreground">
            <p>Este mapa é educativo e não substitui uma avaliação odontológica.</p>
            <p>O plano ideal depende de análise clínica feita por um dentista.</p>
            <p>Não há indicação de tratamento sem avaliação profissional.</p>
          </div>
        </div>
      </div>

      <p className="mt-5 text-center text-[12.5px] leading-relaxed text-muted-foreground">
        Envie seu mapa para que a equipe entenda seu desejo, seus receios e o que você quer
        esclarecer antes da avaliação.
      </p>

      <a
        href={wppHref}
        target="_blank"
        rel="noopener noreferrer"
        className="group mt-6 flex w-full items-center justify-between gap-3 rounded-2xl bg-primary px-5 py-4 text-left text-primary-foreground shadow-soft transition-all duration-300 hover:translate-y-[-2px] hover:shadow-gold active:scale-[0.99]"
      >
        <span className="flex flex-col">
          <span className="text-[11px] uppercase tracking-[0.2em] text-gold-soft">
            Próximo passo
          </span>
          <span className="mt-1 font-serif text-[17px] leading-tight">
            Enviar meu Mapa do Sorriso para a clínica
          </span>
        </span>
        <span className="grid h-11 w-11 place-items-center rounded-full bg-gold text-primary transition-transform group-hover:translate-x-1">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
            <path d="M20 3.5A11.5 11.5 0 003 19l-1 4 4.2-1.1A11.5 11.5 0 1020 3.5zm-8.5 18a9.5 9.5 0 01-4.9-1.4l-.3-.2-2.5.7.7-2.4-.2-.4A9.5 9.5 0 1111.5 21.5zm5.4-7.1c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.2s-.8.9-1 1.1c-.2.2-.4.2-.7.1a7.7 7.7 0 01-2.3-1.4 8.6 8.6 0 01-1.6-2c-.2-.3 0-.5.1-.6l.5-.6c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.1c-.2-.5-.5-.4-.7-.4h-.6a1.2 1.2 0 00-.9.4 3.6 3.6 0 00-1.1 2.7c0 1.6 1.1 3.1 1.3 3.3.2.2 2.3 3.5 5.5 4.7a18 18 0 001.8.6 4.4 4.4 0 002 .1 3.3 3.3 0 002.2-1.5 2.7 2.7 0 00.2-1.5c-.1-.1-.3-.2-.6-.3z" />
          </svg>
        </span>
      </a>

      <button
        onClick={onRestart}
        className="mt-3 w-full rounded-2xl border border-border bg-card px-5 py-3.5 text-[14px] text-muted-foreground transition-colors hover:text-foreground"
      >
        Refazer minha experiência
      </button>
    </section>
  );
}

function ResultBlock({
  eyebrow,
  title,
  children,
  accent = false,
}: {
  eyebrow: string;
  title?: string;
  children?: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <article
      className={`rounded-3xl border bg-card p-4 ${accent ? "border-gold shadow-gold" : "border-border shadow-card"}`}
    >
      <p
        className={`text-[11px] uppercase tracking-[0.2em] ${accent ? "text-gold" : "text-muted-foreground"}`}
      >
        {eyebrow}
      </p>
      {title && (
        <p className="mt-2 font-serif text-[22px] leading-tight text-foreground">{title}</p>
      )}
      {children}
    </article>
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
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-background via-background/95 to-background/0 pt-4">
      <div className="w-full px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div className="pointer-events-auto rounded-2xl border border-border bg-card/95 p-1.5 shadow-card backdrop-blur">
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                aria-label="Voltar"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-border bg-background text-foreground/70 transition-colors active:bg-muted"
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
              className={`group relative flex h-11 flex-1 items-center justify-between gap-3 overflow-hidden rounded-xl px-4 text-left transition-all duration-300 ${
                disabled
                  ? "cursor-not-allowed bg-muted text-muted-foreground opacity-70"
                  : "bg-primary text-primary-foreground active:scale-[0.99]"
              }`}
            >
              <span className="font-serif text-[16px]">{label}</span>
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
          <a
            href="https://www.noadigital.com.br/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1.5 block text-center text-[9px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-gold"
          >
            NOA Lead Flow Smile
          </a>
        </div>
      </div>
    </div>
  );
}
