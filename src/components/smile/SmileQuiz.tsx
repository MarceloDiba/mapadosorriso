import { useEffect, useMemo, useRef, useState } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

import {
  CONCERNS,
  DECISIONS,
  DECISION_SHORT,
  DEFAULT_IMAGES,
  PROCESS_STEPS,
  SMILE_AXES,
  STYLES,
  buildSmileMap,
  buildSmileScores,
  copyOf,
  type Answers,
  type Option,
  type SmileScores,
} from "@/config/quiz";
import { themeStyle } from "@/config/theme";
import type { PublicClinic } from "@/lib/clinics.functions";
import { whatsappLink } from "@/lib/phone";

type Track = (
  patch: Partial<Answers> & {
    completed?: boolean;
    whatsappClicked?: boolean;
    funnelStep?: string;
    leadName?: string;
    leadPhone?: string;
  },
) => void;

const STEPS = [
  { key: "hero", label: "Início" },
  { key: "style", label: "Seu desejo" },
  { key: "concerns", label: "O que incomoda" },
  { key: "decision", label: "Seu momento" },
  { key: "building", label: "Montando" },
  { key: "result", label: "Mapa do Sorriso" },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

const SCENE_KEYS: StepKey[] = ["style", "concerns", "decision"];
const ADVANCE_DELAY = 420;

export function SmileQuiz({ clinic, track }: { clinic: PublicClinic; track?: Track }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({ concerns: [] });
  const [resultProgress, setResultProgress] = useState(0);

  const step: StepKey = STEPS[stepIndex].key;
  const mainRef = useRef<HTMLElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const img = (k: string) => clinic.images[k] || DEFAULT_IMAGES[k];
  const text = (k: string) => copyOf(clinic.copy, k);

  const next = () => setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  const back = () => setStepIndex((i) => Math.max(i - 1, 0));

  const later = (fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
  };

  // Qualquer mudança de cena cancela avanços automáticos pendentes (inclusive no "voltar").
  useEffect(() => {
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [stepIndex]);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    setResultProgress(0);
  }, [stepIndex]);

  const onMainScroll = () => {
    if (step !== "result") return;
    const el = mainRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    setResultProgress(max > 0 ? Math.min(1, Math.max(0, el.scrollTop / max)) : 0);
  };

  useEffect(() => {
    if (step === "hero" || step === "building") return;
    track?.(step === "result" ? { completed: true, funnelStep: "result" } : { funnelStep: step });
  }, [step]);

  const sceneIdx = SCENE_KEYS.indexOf(step);
  const showRail = sceneIdx >= 0;

  const set = (patch: Partial<Answers>) => {
    setAnswers((a) => ({ ...a, ...patch }));
    track?.(patch);
  };

  const chooseAndAdvance = (patch: Partial<Answers>) => {
    set(patch);
    later(next, ADVANCE_DELAY);
  };

  const map = useMemo(() => buildSmileMap(answers, clinic.name), [answers, clinic.name]);
  const scores = useMemo(() => buildSmileScores(answers), [answers]);

  return (
    <div
      style={themeStyle(clinic.palette, clinic.font_pair)}
      className="h-[100dvh] w-full overflow-hidden bg-muted/40 text-foreground"
    >
      <div className="relative mx-auto flex h-[100dvh] w-full min-w-0 max-w-[430px] flex-col overflow-hidden bg-background surface-texture shadow-[0_0_60px_-20px_rgba(0,0,0,0.25)]">
        <Header clinic={clinic} onBack={stepIndex > 0 && step !== "building" ? back : undefined} />

        {showRail && <StepRail current={sceneIdx} total={SCENE_KEYS.length} />}

        {step === "result" && (
          <div aria-hidden className="absolute inset-x-0 top-0 z-20 h-0.5 bg-border/60">
            <div
              className="h-full bg-gold transition-[width] duration-150 ease-out"
              style={{ width: `${resultProgress * 100}%` }}
            />
          </div>
        )}

        <main
          ref={mainRef}
          onScroll={onMainScroll}
          className={`min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden ${showRail ? "pl-9 pr-4" : "px-4"} pb-6 pt-1`}
        >

          <div key={step} className="animate-scene-in">
            {step === "hero" && (
              <Hero
                image={img("hero")}
                title={text("heroTitle")}
                subtitle={text("heroSubtitle")}
                cta={text("heroCta")}
                onStart={next}
              />
            )}

            {step === "style" && (
              <StyleStep
                title={text("step1Title")}
                images={clinic.images}
                value={answers.style}
                onChange={(v) => chooseAndAdvance({ style: v })}
                onGuidance={() => chooseAndAdvance({ style: "orientacao" })}
              />
            )}

            {step === "concerns" && (
              <MultiChoiceStep
                eyebrow="O que incomoda"
                title={text("step2Title")}
                text="Toque em até duas. A segunda já leva você adiante."
                items={CONCERNS}
                value={answers.concerns}
                max={2}
                onChange={(v, full) => {
                  set({ concerns: v });
                  if (full) later(next, ADVANCE_DELAY);
                }}
              />
            )}

            {step === "decision" && (
              <SingleChoiceStep
                eyebrow="Seu momento"
                title={text("step4Title")}
                text="Escolha o que reflete o seu interesse agora."
                items={DECISIONS}
                value={answers.decision}
                onChange={(v) => chooseAndAdvance({ decision: v })}
              />
            )}

            {step === "building" && <BuildingMap answers={answers} onDone={next} />}

            {step === "result" && (
              <ResultMap
                title={text("resultTitle")}
                map={map}
                scores={scores}
                styleImage={img(answers.style && answers.style !== "orientacao" ? answers.style : "hero")}
                clinicName={clinic.name}
                onRestart={() => {
                  setAnswers({ concerns: [] });
                  setStepIndex(0);
                }}
              />
            )}
          </div>
        </main>

        {/* Elementos flutuantes ficam fora da cena animada (transform criaria um novo contexto). */}
        {step === "concerns" && answers.concerns.length === 1 && (
          <FloatingBar>
            <button
              type="button"
              onClick={next}
              className="flex w-full items-center justify-between gap-3 rounded-2xl bg-primary px-5 py-3.5 text-primary-foreground shadow-soft transition-all active:scale-[0.99]"
            >
              <span className="font-serif text-[16px]">Seguir com esta</span>
              <span aria-hidden className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold text-primary">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </span>
            </button>
          </FloatingBar>
        )}

        {step === "result" && (
          <FloatingBar>
            <a
              href={whatsappLink(clinic.whatsapp, map.whatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track?.({ whatsappClicked: true })}
              className="group flex w-full items-center justify-between gap-3 rounded-2xl bg-[#25D366] px-5 py-5 text-left text-white shadow-[0_14px_34px_-12px_rgba(37,211,102,0.65)] ring-2 ring-[#25D366]/35 ring-offset-2 ring-offset-background transition-all active:scale-[0.99]"
            >
              <span className="flex min-w-0 flex-col">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/85">Próximo passo</span>
                <span className="mt-1 truncate font-sans text-[18px] font-semibold leading-tight text-black">Agendar Avaliação</span>
              </span>
              <span aria-hidden className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-[#25D366] transition-transform group-hover:translate-x-1">
                <svg viewBox="0 0 448 512" className="h-5 w-5" fill="currentColor">
                  <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
                </svg>
              </span>
            </a>
          </FloatingBar>
        )}
      </div>
    </div>
  );
}

function FloatingBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-background via-background/95 to-transparent px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-8">
      <div className="pointer-events-auto animate-fade-up">{children}</div>
    </div>
  );
}


/* ------------------------------ Chrome ------------------------------ */

function Header({ clinic, onBack }: { clinic: PublicClinic; onBack?: () => void }) {
  return (
    <header className="shrink-0 bg-transparent">
      <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          {clinic.logo_url ? (
            <img
              src={clinic.logo_url}
              alt={clinic.name}
              className="h-7 w-7 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 10c2-3 5-4 8-4s6 1 8 4c-1 6-5 9-8 9s-7-3-8-9z" />
              </svg>
            </span>
          )}
          <p className="truncate text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {clinic.name}
          </p>
        </div>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Voltar"
            className="-mr-1.5 grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors active:bg-muted"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
        )}
      </div>
    </header>
  );
}

/** Trilho vertical na borda esquerda — progresso sem linguagem de questionário. */
function StepRail({ current, total }: { current: number; total: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-4 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center gap-3"
    >
      {Array.from({ length: total }).map((_, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <span key={i} className="flex flex-col items-center gap-3">
            <span
              className={`block rounded-full transition-all duration-500 ${
                active
                  ? "h-2.5 w-2.5 bg-gold animate-pulse-ring"
                  : done
                    ? "h-1.5 w-1.5 bg-gold/70"
                    : "h-1.5 w-1.5 bg-border"
              }`}
            />
            {i < total - 1 && (
              <span
                className={`block h-6 w-px transition-colors duration-500 ${done ? "bg-gold/50" : "bg-border"}`}
              />
            )}
          </span>
        );
      })}
    </div>
  );
}

function Hero({
  image,
  title,
  subtitle,
  cta,
  onStart,
}: {
  image: string;
  title: string;
  subtitle: string;
  cta: string;
  onStart: () => void;
}) {
  return (
    <section className="flex min-h-full flex-col pb-4 pt-1">
      <div className="relative flex-1 overflow-hidden rounded-3xl bg-card">
        <img src={image} alt="Sorriso" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/35 to-transparent" />
        <div className="relative flex h-full min-h-[62vh] flex-col justify-end p-5">
          <p className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-gold/60 bg-background/15 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-background backdrop-blur">
            <span className="h-1 w-1 rounded-full bg-gold" /> Smile Design
          </p>
          <h1 className="font-serif text-[34px] leading-[1.02] text-background">{title}</h1>
          <p className="mt-3 max-w-[31ch] text-[13px] leading-relaxed text-background/85">{subtitle}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onStart}
        className="group relative z-10 mt-4 flex w-full items-center justify-between gap-3 rounded-2xl bg-primary px-5 py-4 text-left text-primary-foreground shadow-soft transition-all duration-300 active:scale-[0.99]"
      >
        <span className="font-serif text-lg">{cta}</span>
        <span
          aria-hidden
          className="grid h-10 w-10 place-items-center rounded-full bg-gold text-primary transition-transform group-hover:translate-x-1"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </span>
      </button>

      <p className="mt-2 text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        Educativo · sem diagnóstico · sem promessa de resultado
      </p>
    </section>
  );
}

function StepHeader({ eyebrow, title, text }: { eyebrow?: string; title: string; text?: string }) {
  return (
    <header className="mb-5 mt-2">
      {eyebrow && <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-gold">{eyebrow}</p>}
      <h2 className="text-balance font-serif text-[30px] leading-[1.02] text-foreground">{title}</h2>
      {text && <p className="mt-2 text-[12.5px] leading-snug text-muted-foreground">{text}</p>}
    </header>
  );
}

function StyleStep({
  title,
  images,
  value,
  onChange,
  onGuidance,
}: {
  title: string;
  images: Record<string, string>;
  value?: string;
  onChange: (v: string) => void;
  onGuidance: () => void;
}) {
  const [picked, setPicked] = useState<string | undefined>(value);

  return (
    <section>
      <StepHeader
        eyebrow="Seu desejo"
        title={title}
        text="Toque no estilo que mais se aproxima do seu ideal."
      />
      <div className="grid grid-cols-2 gap-2.5">
        {STYLES.map((it, idx) => {
          const selected = picked === it.id;
          const dimmed = !!picked && !selected;
          return (
            <button
              key={it.id}
              type="button"
              onClick={() => {
                setPicked(it.id);
                onChange(it.id);
              }}
              aria-pressed={selected}
              style={{ animationDelay: `${idx * 60}ms` }}
              className={`animate-scale-pop group relative box-border flex w-full max-w-full flex-col overflow-hidden rounded-2xl text-left transition-all duration-500 ${
                selected ? "scale-[1.03] shadow-gold" : ""
              } ${dimmed ? "scale-[0.97] opacity-35" : ""}`}
            >
              <div className="relative aspect-square w-full overflow-hidden">
                <img
                  src={images[it.id] || DEFAULT_IMAGES[it.id]}
                  alt={it.title}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <p className="font-serif text-[16px] leading-tight text-background">{it.title}</p>
                  <p className="mt-0.5 text-[11px] leading-snug text-background/80">{it.caption}</p>
                </div>
                {selected && (
                  <span className="absolute inset-0 ring-2 ring-inset ring-gold" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onGuidance}
        className="mt-5 w-full text-center text-[12.5px] leading-snug text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
      >
        Não tenho certeza, quero orientação
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
  items: Option[];
  value?: string;
  onChange: (v: string) => void;
}) {
  const [picked, setPicked] = useState<string | undefined>(value);

  return (
    <section>
      <StepHeader eyebrow={eyebrow} title={title} text={text} />
      <div className="grid gap-2.5">
        {items.map((it, idx) => (
          <Band
            key={it.id}
            item={it}
            index={idx}
            selected={picked === it.id}
            dimmed={!!picked && picked !== it.id}
            onClick={() => {
              setPicked(it.id);
              onChange(it.id);
            }}
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
  items: Option[];
  value: string[];
  onChange: (v: string[], reachedMax: boolean) => void;
  max: number;
}) {
  const toggle = (id: string) => {
    if (value.includes(id)) return onChange(value.filter((v) => v !== id), false);
    if (value.length >= max) return;
    const nextValue = [...value, id];
    onChange(nextValue, nextValue.length >= max);
  };

  const reachedMax = value.length >= max;

  return (
    <section className="pb-24">
      <StepHeader eyebrow={eyebrow} title={title} text={text} />
      <div className="grid gap-2.5">
        {items.map((it, idx) => (
          <Band
            key={it.id}
            item={it}
            index={idx}
            selected={value.includes(it.id)}
            dimmed={reachedMax && !value.includes(it.id)}
            onClick={() => toggle(it.id)}
          />
        ))}
      </div>
    </section>
  );
}

/** Faixa editorial de escolha — sem radio, sem checkbox. */
function Band({
  item,
  index,
  selected,
  dimmed,
  onClick,
}: {
  item: Option;
  index: number;
  selected: boolean;
  dimmed?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      style={{ animationDelay: `${index * 55}ms` }}
      className={`animate-fade-up band ${selected ? "band-selected" : ""} ${dimmed ? "opacity-40" : ""}`}
    >
      <span
        aria-hidden
        className={`absolute inset-y-0 left-0 w-1 transition-colors duration-300 ${selected ? "bg-gold" : "bg-transparent"}`}
      />
      <span className="block px-5 py-4 pl-6">
        <span className="block font-serif text-[19px] leading-tight text-foreground">{item.title}</span>
        {item.caption && (
          <span className="mt-1 block text-[12.5px] leading-snug text-muted-foreground">
            {item.caption}
          </span>
        )}
      </span>
    </button>
  );
}

/* --------------------------- Construção --------------------------- */

const labelOf = (list: Option[], id?: string) => list.find((o) => o.id === id)?.title ?? "";

/** A espera vira recompensa: as respostas da pessoa se encaixam na composição. */
function BuildingMap({ answers, onDone }: { answers: Answers; onDone: () => void }) {
  const lines = useMemo(() => {
    const style =
      answers.style === "orientacao" ? "Quero orientação" : labelOf(STYLES, answers.style);
    const concerns = answers.concerns.map((c) => labelOf(CONCERNS, c)).filter(Boolean);
    return [
      { k: "Seu desejo", v: style || "Estilo em aberto" },
      { k: "O que incomoda", v: concerns.join(" · ") || "A definir na avaliação" },
      { k: "Seu momento", v: (answers.decision && DECISION_SHORT[answers.decision]) || "Explorando" },
    ];
  }, [answers]);

  const [visible, setVisible] = useState(0);

  useEffect(() => {
    const timers = lines.map((_, i) => setTimeout(() => setVisible(i + 1), 450 + i * 520));
    const end = setTimeout(onDone, 450 + lines.length * 520 + 700);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(end);
    };
  }, []);

  return (
    <section className="flex min-h-[78vh] flex-col justify-center">
      <p className="text-[10px] uppercase tracking-[0.24em] text-gold">Montando seu mapa</p>
      <h2 className="mt-2 font-serif text-[30px] leading-[1.03] text-foreground">
        Encaixando o que você nos contou
      </h2>

      <div className="mt-8 space-y-4">
        {lines.map((l, i) => (
          <div
            key={l.k}
            className={`border-b border-border pb-4 transition-all duration-500 ${
              i < visible ? "animate-reveal-up opacity-100" : "opacity-0"
            }`}
          >
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{l.k}</p>
            <p className="mt-1 font-serif text-[20px] leading-tight text-foreground">{l.v}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 h-0.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gold transition-[width] duration-700 ease-out"
          style={{ width: `${(visible / lines.length) * 100}%` }}
        />
      </div>
    </section>
  );
}

/* ----------------------------- Resultado ----------------------------- */

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`${className} ${shown ? "animate-reveal-up" : "opacity-0"}`}>
      {children}
    </div>
  );
}

function ResultMap({
  title,
  map,
  scores,
  styleImage,
  clinicName,
  onRestart,
}: {
  title: string;
  map: ReturnType<typeof buildSmileMap>;
  scores: SmileScores;
  styleImage: string;
  clinicName: string;
  onRestart: () => void;
}) {
  return (
    <section className="-mx-4 pb-32">
      {/* Abertura em cena cheia */}
      <div className="relative overflow-hidden">
        <img src={styleImage} alt="" className="h-[62vh] w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-primary/25" />
        <div className="absolute inset-x-0 bottom-0 px-5 pb-6">
          <p className="text-[10px] uppercase tracking-[0.24em] text-gold">{title}</p>
          <h2 className="mt-2 font-serif text-[34px] leading-[1.0] text-foreground">{map.profile}</h2>
          <p className="mt-3 text-[14px] leading-relaxed text-foreground/80">{map.journey}</p>
        </div>
      </div>

      <div className="px-5">
        <Reveal className="mt-10">
          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Seu mapa visual</p>
          <p className="mt-2 font-serif text-[19px] leading-snug text-foreground">
            Os pontos de atenção que mais apareceram no que você contou.
          </p>
          <SmileRadarChart scores={scores} />
        </Reveal>

        <Reveal className="mt-10 border-t border-border pt-8">
          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Como sua transformação acontece
          </p>
          <p className="mt-2 text-[13px] leading-snug text-muted-foreground">
            O passo a passo real, conduzido pela {clinicName} do início ao fim.
          </p>
          <ol className="mt-5 space-y-0">
            {PROCESS_STEPS.map((step, i) => (
              <li key={step.title} className="relative flex gap-4 pb-6 last:pb-0">
                {i < PROCESS_STEPS.length - 1 && (
                  <span aria-hidden className="absolute left-[15px] top-8 h-full w-px bg-border" />
                )}
                <span
                  aria-hidden
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-gold/50 bg-gold-soft/30 font-serif text-[13px] text-primary"
                >
                  {i + 1}
                </span>
                <span className="min-w-0 pt-0.5">
                  <span className="block font-serif text-[17px] leading-tight text-foreground">
                    {step.title}
                  </span>
                  <span className="mt-1 block text-[13.5px] leading-relaxed text-muted-foreground">
                    {step.text}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </Reveal>

        <Reveal className="mt-10 border-t border-border pt-8">
          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Por que este passo transforma
          </p>
          <p className="mt-3 font-sans text-[13.5px] font-semibold italic leading-relaxed text-muted-foreground">{map.impact}</p>
        </Reveal>

        <Reveal className="mt-10 border-t border-border pt-8">
          <p className="text-[12.5px] leading-relaxed text-muted-foreground">{map.authority}</p>
        </Reveal>

        <button
          type="button"
          onClick={onRestart}
          className="mt-8 w-full py-3 text-center text-[13px] text-muted-foreground underline decoration-border underline-offset-4"
        >
          Refazer minha experiência
        </button>
      </div>
    </section>

  );
}

function SmileRadarChart({ scores }: { scores: SmileScores }) {
  const [mounted, setMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const data = SMILE_AXES.map((axis) => ({
    axis: axis.shortLabel,
    value: scores[axis.key],
  }));

  // Ranking em texto, sem expor números brutos (evita ler como nota clínica).
  const ranked = [...SMILE_AXES]
    .sort((a, b) => scores[b.key] - scores[a.key])
    .map((axis) => axis.label);
  const summary = `Os pontos que mais apareceram nas suas respostas, do mais ao menos presente: ${ranked.join(", ")}.`;

  return (
    <div className="mt-5 rounded-3xl border border-border bg-card/60 px-1 py-4">
      <div
        role="img"
        aria-label={summary}
        className="h-[260px] w-full"
      >
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%" aria-hidden>
            <RadarChart data={data} outerRadius="58%">
              <PolarGrid stroke="var(--color-border)" />
              <PolarAngleAxis
                dataKey="axis"
                tick={{ fill: "var(--color-foreground)", fontSize: 11, fontFamily: "var(--font-sans)" }}
              />
              <Radar
                dataKey="value"
                stroke="var(--color-gold)"
                fill="var(--color-gold)"
                fillOpacity={0.32}
                strokeWidth={2}
                isAnimationActive={!reducedMotion}
                animationDuration={700}
              />
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <div aria-hidden className="flex h-full items-center justify-center">
            <div className="h-40 w-40 animate-pulse rounded-full border border-dashed border-border" />
          </div>
        )}
      </div>
      <p className="sr-only">{summary}</p>
      <p className="px-3 pb-2 text-center text-[11px] leading-relaxed text-muted-foreground">
        Isto reflete o que você respondeu, não é uma avaliação clínica. O diagnóstico completo é
        feito pelo cirurgião-dentista na avaliação presencial.
      </p>
    </div>
  );
}

