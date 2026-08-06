import { useEffect, useMemo, useRef, useState } from "react";

import {
  CONCERNS,
  DECISIONS,
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

type Track = (patch: Partial<Answers> & { completed?: boolean; whatsappClicked?: boolean }) => void;

const STEPS = [
  { key: "hero", label: "Início" },
  { key: "style", label: "Seu desejo" },
  { key: "concerns", label: "O que incomoda" },
  { key: "objection", label: "Segurança" },
  { key: "decision", label: "Seu momento" },
  { key: "loading", label: "Mapa do Sorriso" },
  { key: "result", label: "Mapa do Sorriso" },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

export function SmileQuiz({ clinic, track }: { clinic: PublicClinic; track?: Track }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({ concerns: [] });
  const step: StepKey = STEPS[stepIndex].key;
  const mainRef = useRef<HTMLElement>(null);

  const img = (k: string) => clinic.images[k] || DEFAULT_IMAGES[k];
  const text = (k: string) => copyOf(clinic.copy, k);

  useEffect(() => {
    if (step === "loading") {
      const t = setTimeout(() => setStepIndex((i) => i + 1), 2000);
      return () => clearTimeout(t);
    }
    return;
  }, [step]);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [stepIndex]);

  useEffect(() => {
    if (step === "result") track?.({ completed: true });
  }, [step]);

  const progressSteps = STEPS.slice(1, 6);
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

  const set = (patch: Partial<Answers>) => {
    setAnswers((a) => ({ ...a, ...patch }));
    track?.(patch);
  };

  const map = buildSmileMap(answers);

  return (
    <div
      style={themeStyle(clinic.palette, clinic.font_pair)}
      className="min-h-[100dvh] w-full overflow-x-hidden bg-muted/40 text-foreground"
    >
      <div className="relative mx-auto flex min-h-[100dvh] w-full min-w-0 max-w-[430px] flex-col overflow-hidden bg-background shadow-[0_0_60px_-20px_rgba(0,0,0,0.25)]">
        <Header clinic={clinic} />
        {showCTA && (
          <ProgressBar
            label={progressSteps[currentProgressIdx].label}
            current={currentProgressIdx}
            total={progressSteps.length}
          />
        )}

        <main
          ref={mainRef}
          className={`min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-4 pt-2 ${showCTA ? "pb-28" : "pb-5"}`}
        >
          <div key={step} className="animate-fade-up">
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
                onChange={(v) => set({ style: v })}
                onGuidance={() => {
                  set({ style: "orientacao" });
                  next();
                }}
              />
            )}

            {step === "concerns" && (
              <MultiChoiceStep
                eyebrow="O que incomoda"
                title={text("step2Title")}
                text="Selecione até 2 opções principais."
                items={CONCERNS}
                value={answers.concerns}
                max={2}
                onChange={(v) => set({ concerns: v })}
              />
            )}

            {step === "objection" && (
              <SingleChoiceStep
                eyebrow="Segurança"
                title={text("step3Title")}
                text="Sua resposta orienta o que explicamos no seu mapa."
                items={OBJECTIONS}
                value={answers.objection}
                onChange={(v) => set({ objection: v })}
              />
            )}

            {step === "decision" && (
              <SingleChoiceStep
                eyebrow="Seu momento"
                title={text("step4Title")}
                text="Escolha a opção que reflete seu interesse agora."
                items={DECISIONS}
                value={answers.decision}
                onChange={(v) => set({ decision: v })}
              />
            )}

            {step === "loading" && <LoadingMap />}

            {step === "result" && (
              <ResultMap
                title={text("resultTitle")}
                map={map}
                whatsapp={clinic.whatsapp}
                onWhatsapp={() => track?.({ whatsappClicked: true })}
                onRestart={() => {
                  setAnswers({ concerns: [] });
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

/* ------------------------------ Chrome ------------------------------ */

function Header({ clinic }: { clinic: PublicClinic }) {
  return (
    <header className="shrink-0 border-b border-border/60 bg-background/90 backdrop-blur-md">
      <div className="flex w-full items-center gap-2.5 px-4 py-2.5">
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
        <div className="min-w-0 leading-tight">
          <p className="truncate text-[8px] uppercase tracking-[0.16em] text-muted-foreground">
            {clinic.name}
          </p>
          <p className="truncate font-serif text-[14px] text-foreground">Mapa do Sorriso</p>
        </div>
      </div>
    </header>
  );
}

function ProgressBar({ label, current, total }: { label: string; current: number; total: number }) {
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
      <div className="relative flex-1 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <img src={image} alt="Sorriso" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/35 to-transparent" />
        <div className="relative flex h-full min-h-[58vh] flex-col justify-end p-5">
          <p className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-gold/60 bg-background/15 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-background backdrop-blur">
            <span className="h-1 w-1 rounded-full bg-gold" /> Smile Design
          </p>
          <h1 className="font-serif text-[30px] leading-[1.05] text-background">{title}</h1>
          <p className="mt-3 max-w-[31ch] text-[13px] leading-relaxed text-background/85">
            {subtitle}
          </p>
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
    <header className="mb-3 mt-1">
      {eyebrow && <p className="mb-1.5 text-[10px] uppercase tracking-[0.18em] text-gold">{eyebrow}</p>}
      <h2 className="text-balance font-serif text-[24px] leading-[1.08] text-foreground">{title}</h2>
      {text && <p className="mt-1.5 text-[12.5px] leading-snug text-muted-foreground">{text}</p>}
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
  return (
    <section>
      <StepHeader eyebrow="Seu desejo" title={title} text="Escolha o estilo que mais se aproxima do seu ideal." />
      <div className="grid grid-cols-2 gap-2.5">
        {STYLES.map((it, idx) => {
          const selected = value === it.id;
          return (
            <button
              key={it.id}
              type="button"
              onClick={() => onChange(it.id)}
              aria-pressed={selected}
              style={{ animationDelay: `${idx * 50}ms` }}
              className={`animate-scale-pop group relative box-border flex w-full max-w-full flex-col overflow-hidden rounded-2xl text-left card-premium ${selected ? "card-selected" : ""}`}
            >
              <div className="relative aspect-square w-full overflow-hidden">
                <img
                  src={images[it.id] || DEFAULT_IMAGES[it.id]}
                  alt={it.title}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/50 via-transparent to-transparent" />
                {selected && (
                  <span className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full bg-gold text-primary shadow-gold animate-scale-pop">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="font-serif text-[15px] leading-tight text-foreground">{it.title}</p>
                <p className="mt-1 text-[11.5px] leading-snug text-muted-foreground">{it.caption}</p>
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
  return (
    <section>
      <StepHeader eyebrow={eyebrow} title={title} text={text} />
      <div className="grid gap-2.5">
        {items.map((it) => (
          <OptionCard key={it.id} item={it} selected={value === it.id} onClick={() => onChange(it.id)} />
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
  onChange: (v: string[]) => void;
  max?: number;
}) {
  const toggle = (id: string) => {
    if (value.includes(id)) return onChange(value.filter((v) => v !== id));
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
    </section>
  );
}

function OptionCard({
  item,
  selected,
  onClick,
  multi = false,
  disabled = false,
}: {
  item: Option;
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
      className={`group relative box-border flex w-full max-w-full items-start gap-3 rounded-2xl p-4 text-left card-premium ${selected ? "card-selected" : ""} ${disabled ? "opacity-45" : ""}`}
    >
      <span
        className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center ${multi ? "rounded-md" : "rounded-full"} border-2 transition-colors ${selected ? "border-gold bg-gold text-primary" : "border-border bg-background text-transparent"}`}
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M5 12l5 5L20 7" />
        </svg>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-serif text-[17px] leading-tight text-foreground">{item.title}</span>
        {item.caption && (
          <span className="mt-1 block text-[13px] leading-snug text-muted-foreground">{item.caption}</span>
        )}
      </span>
    </button>
  );
}

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
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M4 10c2-3 5-4 8-4s6 1 8 4c-1 6-5 9-8 9s-7-3-8-9z" />
          </svg>
        </span>
      </div>
      <p className="mt-8 font-serif text-2xl text-foreground">Organizando seu Mapa do Sorriso…</p>
      <p className="mt-3 max-w-xs text-[14px] text-muted-foreground">
        Reunindo desejo, queixas e dúvidas para transformar respostas em clareza.
      </p>
    </section>
  );
}

function ResultMap({
  title,
  map,
  whatsapp,
  onWhatsapp,
  onRestart,
}: {
  title: string;
  map: ReturnType<typeof buildSmileMap>;
  whatsapp: string;
  onWhatsapp: () => void;
  onRestart: () => void;
}) {
  const href = `https://wa.me/${whatsapp}?text=${encodeURIComponent(map.whatsappMessage)}`;
  return (
    <section className="pb-10">
      <header className="mb-5 mt-2 text-center">
        <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-gold/60 bg-gold-soft/30 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-foreground">
          <span className="h-1 w-1 rounded-full bg-gold" /> Análise concluída
        </p>
        <h2 className="font-serif text-[30px] leading-[1.05] text-foreground">{title}</h2>
      </header>

      <article className="rounded-3xl border border-gold bg-card p-4 shadow-gold">
        <p className="text-[11px] uppercase tracking-[0.2em] text-gold">Perfil</p>
        <p className="mt-1.5 font-serif text-[22px] leading-tight text-foreground">{map.profile}</p>
        <p className="mt-3 border-t border-border pt-3 text-[12.5px] leading-snug text-muted-foreground">
          {map.summary}
        </p>
      </article>

      <article className="mt-3 rounded-3xl border border-border bg-card p-4 shadow-card">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Pilares recomendados
        </p>
        <ul className="mt-3.5 space-y-3">
          {map.pillars.map((p) => (
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

      <article className="mt-3 rounded-3xl border border-gold/50 bg-gold-soft/20 p-4">
        <p className="text-[11px] uppercase tracking-[0.2em] text-gold">Sobre sua principal dúvida</p>
        <p className="mt-1.5 text-[14px] leading-snug text-foreground">{map.safetyNote}</p>
      </article>

      <div className="mt-3 rounded-3xl border border-dashed border-border bg-muted/50 p-4 text-[12.5px] leading-relaxed text-muted-foreground">
        Este mapa é educativo, não representa diagnóstico nem promessa de resultado. A indicação
        final é sempre do dentista, após avaliação clínica.
      </div>

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onWhatsapp}
        className="group mt-5 flex w-full items-center justify-between gap-3 rounded-2xl bg-primary px-5 py-4 text-left text-primary-foreground shadow-soft transition-all duration-300 active:scale-[0.99]"
      >
        <span className="flex min-w-0 flex-col">
          <span className="text-[11px] uppercase tracking-[0.2em] text-gold-soft">Próximo passo</span>
          <span className="mt-1 font-serif text-[16px] leading-tight">{map.ctaButton}</span>
        </span>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold text-primary transition-transform group-hover:translate-x-1">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
            <path d="M20 3.5A11.5 11.5 0 003 19l-1 4 4.2-1.1A11.5 11.5 0 1020 3.5zm-8.5 18a9.5 9.5 0 01-4.9-1.4l-.3-.2-2.5.7.7-2.4-.2-.4A9.5 9.5 0 1111.5 21.5z" />
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
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
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
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2">
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
