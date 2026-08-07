import { useEffect, useMemo, useRef, useState } from "react";

import {
  CONCERNS,
  DECISIONS,
  DECISION_SHORT,
  DEFAULT_IMAGES,
  OBJECTIONS,
  STYLES,
  buildSmileMap,
  copyOf,
  type Answers,
  type Option,
} from "@/config/quiz";
import { themeStyle } from "@/config/theme";
import type { PublicClinic } from "@/lib/clinics.functions";
import { formatLocalPhone, whatsappLink } from "@/lib/phone";

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
  const [sheet, setSheet] = useState(false);
  const [lead, setLead] = useState({ name: "", phone: "" });
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
                text="Toque em até duas — a segunda já leva você adiante."
                items={CONCERNS}
                value={answers.concerns}
                max={2}
                onChange={(v, full) => {
                  set({ concerns: v });
                  if (full) later(next, ADVANCE_DELAY);
                }}
                onContinue={next}
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
                styleImage={img(answers.style && answers.style !== "orientacao" ? answers.style : "hero")}
                clinicName={clinic.name}
                objection={answers.objection}
                onObjection={(id) => {
                  setAnswers((a) => ({ ...a, objection: id }));
                  track?.({ objection: id, funnelStep: "objection" });
                }}
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
            <button
              type="button"
              onClick={() => setSheet(true)}
              className="group flex w-full items-center justify-between gap-3 rounded-2xl bg-primary px-5 py-4 text-left text-primary-foreground shadow-soft transition-all active:scale-[0.99]"
            >
              <span className="flex min-w-0 flex-col">
                <span className="text-[10px] uppercase tracking-[0.2em] text-gold-soft">Próximo passo</span>
                <span className="mt-1 truncate font-serif text-[16px] leading-tight">{map.ctaButton}</span>
              </span>
              <span aria-hidden className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold text-primary transition-transform group-hover:translate-x-1">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                  <path d="M20 3.5A11.5 11.5 0 003 19l-1 4 4.2-1.1A11.5 11.5 0 1020 3.5zm-8.5 18a9.5 9.5 0 01-4.9-1.4l-.3-.2-2.5.7.7-2.4-.2-.4A9.5 9.5 0 1111.5 21.5z" />
                </svg>
              </span>
            </button>
          </FloatingBar>
        )}

        {sheet && (
          <LeadSheet
            href={whatsappLink(
              clinic.whatsapp,
              lead.name ? `${map.whatsappMessage}\n\nMeu nome: ${lead.name}.` : map.whatsappMessage,
            )}
            name={lead.name}
            phone={lead.phone}
            setName={(v) => setLead((l) => ({ ...l, name: v }))}
            setPhone={(v) => setLead((l) => ({ ...l, phone: v }))}
            onClose={() => setSheet(false)}
            onGo={() => {
              if (lead.name.trim() || lead.phone.trim())
                track?.({ leadName: lead.name.trim(), leadPhone: lead.phone });
              track?.({ whatsappClicked: true });
            }}
          />
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
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors active:bg-muted"
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
        Não tenho certeza — quero orientação
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
  onContinue,
  max,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  items: Option[];
  value: string[];
  onChange: (v: string[], reachedMax: boolean) => void;
  onContinue: () => void;
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

      {value.length === 1 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-background via-background/95 to-transparent px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-6">
          <button
            type="button"
            onClick={onContinue}
            className="pointer-events-auto flex w-full animate-fade-up items-center justify-between gap-3 rounded-2xl bg-primary px-5 py-3.5 text-primary-foreground shadow-soft transition-all active:scale-[0.99]"
          >
            <span className="font-serif text-[16px]">Seguir com esta</span>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold text-primary">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </span>
          </button>
        </div>
      )}
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
  styleImage,
  clinicName,
  objection,
  onObjection,
  onRestart,
}: {
  title: string;
  map: ReturnType<typeof buildSmileMap>;
  styleImage: string;
  clinicName: string;
  objection?: string;
  onObjection: (id: string) => void;
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
          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Por que este passo transforma
          </p>
          <p className="mt-3 font-serif text-[19px] leading-snug text-foreground">{map.impact}</p>
        </Reveal>

        <Reveal className="mt-10 border-t border-border pt-8">
          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            O protocolo da {clinicName}
          </p>
          <ol className="mt-5 space-y-6">
            {map.protocol.map((p, i) => (
              <li key={p.title}>
                <p className="font-serif text-[13px] text-gold">0{i + 1}</p>
                <p className="mt-1 font-serif text-[20px] leading-tight text-foreground">{p.title}</p>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">{p.text}</p>
              </li>
            ))}
          </ol>
        </Reveal>

        {/* Objeção respondida dentro do Mapa */}
        <Reveal className="mt-10 border-t border-border pt-8">
          <p className="text-[10px] uppercase tracking-[0.22em] text-gold">O que ainda te segura?</p>
          <p className="mt-2 text-[13px] leading-snug text-muted-foreground">
            Opcional — toque e veja o que a clínica faz sobre isso.
          </p>
          <div className="mt-4 grid gap-2">
            {OBJECTIONS.map((o, idx) => (
              <Band
                key={o.id}
                item={o}
                index={idx}
                selected={objection === o.id}
                onClick={() => onObjection(o.id)}
              />
            ))}
          </div>
          {objection && (
            <div className="mt-4 animate-reveal-up rounded-2xl border border-gold/50 bg-gold-soft/25 p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gold">Fique tranquilo(a)</p>
              <p className="mt-1.5 text-[14px] leading-relaxed text-foreground">{map.reassurance}</p>
            </div>
          )}
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

function LeadSheet({
  href,
  name,
  phone,
  setName,
  setPhone,
  onClose,
  onGo,
}: {
  href: string;
  name: string;
  phone: string;
  setName: (v: string) => void;
  setPhone: (v: string) => void;
  onClose: () => void;
  onGo: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 mx-auto flex w-full max-w-[430px] flex-col justify-end">
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 bg-primary/40 backdrop-blur-[2px]"
      />
      <div className="relative animate-sheet-up rounded-t-3xl bg-background p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-card">
        <span className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border" />
        <p className="font-serif text-[22px] leading-tight text-foreground">
          Quer que a clínica retome o contato?
        </p>
        <p className="mt-1 text-[12.5px] text-muted-foreground">
          Opcional — você pode seguir direto para o WhatsApp.
        </p>

        <div className="mt-4 grid gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 60))}
            placeholder="Seu nome"
            className="w-full rounded-xl border border-border bg-card px-3 py-3 text-[14px] text-foreground outline-none focus:border-gold"
          />
          <input
            value={phone}
            inputMode="numeric"
            onChange={(e) => setPhone(formatLocalPhone(e.target.value))}
            placeholder="(11) 99999-9999"
            className="w-full rounded-xl border border-border bg-card px-3 py-3 text-[14px] text-foreground outline-none focus:border-gold"
          />
        </div>

        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onGo}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-4 font-serif text-[17px] text-primary-foreground transition-all active:scale-[0.99]"
        >
          Continuar no WhatsApp
          <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 text-gold" fill="currentColor">
            <path d="M20 3.5A11.5 11.5 0 003 19l-1 4 4.2-1.1A11.5 11.5 0 1020 3.5zm-8.5 18a9.5 9.5 0 01-4.9-1.4l-.3-.2-2.5.7.7-2.4-.2-.4A9.5 9.5 0 1111.5 21.5z" />
          </svg>
        </a>
      </div>
    </div>
  );
}
