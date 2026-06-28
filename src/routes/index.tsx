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
  { id: "natural", title: "Natural e elegante", caption: "Quero melhorar sem parecer artificial.", image: desireNatural },
  { id: "bright", title: "Mais branco e iluminado", caption: "Quero um sorriso com mais presença.", image: desireBright },
  { id: "proportion", title: "Mais proporcional", caption: "Quero melhorar formato, tamanho ou alinhamento visual.", image: desireProportion },
  { id: "confident", title: "Mais confiante nas fotos", caption: "Quero sorrir sem ficar me preocupando.", image: desireConfident },
  { id: "bold", title: "Uma mudança mais marcante", caption: "Quero transformar meu sorriso com segurança.", image: desireBold },
];

const REFERENCES: CardItem[] = [
  { id: "arc", title: "Arco do sorriso", caption: "Quando acompanha a curva do lábio, o sorriso tende a parecer mais harmônico.", image: refArc },
  { id: "proportion", title: "Proporção dos dentes", caption: "A relação de largura e altura entre os dentes influencia o equilíbrio visual.", image: refProportion },
  { id: "shade", title: "Cor e luminosidade", caption: "Tons muito brancos podem parecer artificiais; tons quentes trazem naturalidade.", image: refShade },
  { id: "texture", title: "Textura e brilho", caption: "Pequenas variações de superfície fazem o sorriso parecer real, não fabricado.", image: refTexture },
  { id: "alignment", title: "Alinhamento e simetria", caption: "Linhas que conversam com o rosto criam sorrisos com estilos diferentes.", image: refAlignment },
  { id: "exposure", title: "Exposição do sorriso", caption: "O quanto o sorriso aparece ao falar ou sorrir influencia presença e confiança.", image: refExposure },
];

const PERCEPTION: CardItem[] = [
  { id: "shade", title: "Cor ou luminosidade" },
  { id: "shape", title: "Formato dos dentes" },
  { id: "size", title: "Tamanho ou proporção" },
  { id: "spaces", title: "Espaços ou alinhamento visual" },
  { id: "low", title: "Sorriso pouco aparente" },
  { id: "artificial", title: "Medo de parecer artificial" },
  { id: "unsure", title: "Ainda não sei, quero entender melhor" },
];

const SAFETY: CardItem[] = [
  { id: "natural", title: "Quero entender se fica natural" },
  { id: "wear", title: "Tenho receio de desgaste" },
  { id: "fit", title: "Quero saber se combina comigo" },
  { id: "price", title: "Quero entender investimento" },
  { id: "pain", title: "Tenho medo de dor ou desconforto" },
  { id: "alternatives", title: "Quero conhecer alternativas além de facetas" },
];

const MOMENT: CardItem[] = [
  { id: "soon", title: "Quero conversar com uma equipe em breve" },
  { id: "compare", title: "Estou comparando possibilidades" },
  { id: "safety", title: "Tenho vontade, mas preciso de segurança" },
  { id: "learn", title: "Quero apenas aprender por enquanto" },
];

const INTENT: CardItem[] = [
  { id: "evaluate", title: "Quero avaliar meu caso" },
  { id: "price", title: "Quero entender valores primeiro" },
  { id: "doubts", title: "Quero tirar dúvidas" },
  { id: "guidance", title: "Quero receber uma orientação inicial" },
  { id: "research", title: "Ainda estou pesquisando" },
];

const STEPS = [
  { key: "hero", label: "Início" },
  { key: "desire", label: "Desejo" },
  { key: "references", label: "Referências" },
  { key: "perception", label: "Percepção" },
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
  safety?: string;
  moment?: string;
  intent?: string;
  lead: { name: string; whatsapp: string; city: string; time: string };
};

const initialAnswers: Answers = {
  references: [],
  perception: [],
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
  const currentProgressIdx = Math.min(
    Math.max(stepIndex - 1, 0),
    progressSteps.length - 1,
  );

  const next = () => setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  const back = () => setStepIndex((i) => Math.max(i - 1, 0));

  const canAdvance = useMemo(() => {
    switch (step) {
      case "desire": return !!answers.desire;
      case "references": return answers.references.length > 0;
      case "perception": return answers.perception.length > 0;
      case "safety": return !!answers.safety;
      case "moment": return !!answers.moment;
      case "intent": return !!answers.intent;
      case "lead":
        return answers.lead.name.trim().length > 1 && answers.lead.whatsapp.replace(/\D/g, "").length >= 10;
      default: return true;
    }
  }, [step, answers]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />

      {step !== "hero" && step !== "loading" && step !== "result" && (
        <ProgressBar steps={progressSteps.map((s) => s.label)} current={currentProgressIdx} />
      )}

      <main className="mx-auto w-full max-w-2xl px-5 pb-40 pt-4 sm:pt-8">
        <div key={step} className="animate-fade-up">
          {step === "hero" && <Hero onStart={next} />}

          {step === "desire" && (
            <SingleChoiceStep
              eyebrow="Etapa 01 — Desejo"
              title="Qual dessas ideias mais se aproxima do sorriso que você gostaria de ter?"
              text="Toque na referência que mais combina com o resultado que você imagina."
              items={DESIRE}
              value={answers.desire}
              onChange={(v) => setAnswers((a) => ({ ...a, desire: v }))}
              layout="carousel"
              withImages
            />
          )}

          {step === "references" && (
            <MultiChoiceStep
              eyebrow="Etapa 02 — Referências"
              title="Observe o que muda a percepção de um sorriso."
              text="Pequenos detalhes influenciam se um sorriso parece mais natural, marcante, delicado ou artificial. Toque em um ou mais cards que chamarem sua atenção."
              items={REFERENCES}
              value={answers.references}
              onChange={(v) => setAnswers((a) => ({ ...a, references: v }))}
              layout="carousel"
              withImages
            />
          )}

          {step === "perception" && (
            <MultiChoiceStep
              eyebrow="Etapa 03 — Percepção"
              title="Depois de observar as referências, o que você percebe no seu sorriso hoje?"
              text="Você pode marcar mais de um ponto."
              items={PERCEPTION}
              value={answers.perception}
              onChange={(v) => setAnswers((a) => ({ ...a, perception: v }))}
            />
          )}

          {step === "safety" && (
            <SingleChoiceStep
              eyebrow="Etapa 04 — Segurança"
              title="O que precisa ficar claro antes de você avançar?"
              text="Uma boa decisão estética depende de desejo, informação e segurança."
              items={SAFETY}
              value={answers.safety}
              onChange={(v) => setAnswers((a) => ({ ...a, safety: v }))}
            />
          )}

          {step === "moment" && (
            <SingleChoiceStep
              eyebrow="Etapa 05 — Momento"
              title="Qual é seu momento agora?"
              text="Isso ajuda a entender se você está buscando informação, comparação ou uma avaliação."
              items={MOMENT}
              value={answers.moment}
              onChange={(v) => setAnswers((a) => ({ ...a, moment: v }))}
            />
          )}

          {step === "intent" && (
            <SingleChoiceStep
              eyebrow="Etapa 06 — Intenção"
              title="Se uma equipe pudesse te orientar, o que faria mais sentido agora?"
              text="Escolha o próximo passo mais confortável para você."
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

          {step === "result" && <ResultMap answers={answers} onRestart={() => { setAnswers(initialAnswers); setStepIndex(0); }} />}
        </div>
      </main>

      {step !== "hero" && step !== "loading" && step !== "result" && (
        <StickyCTA
          label={step === "lead" ? "Ver meu Mapa do Sorriso" : "Continuar"}
          disabled={!canAdvance}
          onClick={next}
          onBack={stepIndex > 1 ? back : undefined}
        />
      )}
    </div>
  );
}

/* ----------------------------- Header ----------------------------- */

function AppHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 10c2-3 5-4 8-4s6 1 8 4c-1 6-5 9-8 9s-7-3-8-9z" />
              <path d="M8 10c1-1 2.5-1.5 4-1.5s3 .5 4 1.5" />
            </svg>
          </span>
          <div className="leading-tight">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">NOA Lead Flow Smile</p>
            <p className="font-serif text-base text-foreground">Laboratório do Sorriso</p>
          </div>
        </div>
        <span className="hidden text-[11px] uppercase tracking-[0.16em] text-muted-foreground sm:block">
          Experiência educativa
        </span>
      </div>
    </header>
  );
}

/* ----------------------------- Progress ----------------------------- */

function ProgressBar({ steps, current }: { steps: string[]; current: number }) {
  const pct = ((current + 1) / steps.length) * 100;
  return (
    <div className="sticky top-[57px] z-20 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto w-full max-w-2xl px-5 pb-3 pt-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Etapa {String(current + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
          </p>
          <p className="font-serif text-sm text-foreground">{steps[current]}</p>
        </div>
        <div className="h-[3px] w-full overflow-hidden rounded-full bg-muted">
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
    <section className="pb-8 pt-2">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-card">
        <img
          src={heroSmile}
          alt="Sorriso natural editorial"
          width={1280}
          height={1600}
          className="aspect-[4/5] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/60 bg-background/15 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-background backdrop-blur">
            <span className="h-1 w-1 rounded-full bg-gold" /> Smile Design
          </p>
          <h1 className="font-serif text-[34px] leading-[1.05] text-background sm:text-5xl">
            Descubra o mapa<br />do seu sorriso.
          </h1>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <p className="text-balance font-serif text-xl leading-snug text-foreground">
          Uma experiência visual para entender estilo, harmonia e naturalidade antes de conversar com um especialista.
        </p>
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          Explore referências, perceba detalhes e descubra quais pontos merecem atenção em uma avaliação estética do sorriso.
        </p>
      </div>

      <button
        onClick={onStart}
        className="group mt-8 flex w-full items-center justify-between gap-3 rounded-2xl bg-primary px-6 py-5 text-left text-primary-foreground shadow-soft transition-all duration-300 hover:translate-y-[-2px] hover:shadow-gold active:scale-[0.99]"
      >
        <span className="flex flex-col">
          <span className="text-[11px] uppercase tracking-[0.2em] text-gold-soft">7 etapas · ~3 min</span>
          <span className="mt-1 font-serif text-xl">Começar agora</span>
        </span>
        <span className="grid h-11 w-11 place-items-center rounded-full bg-gold text-primary transition-transform group-hover:translate-x-1">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </span>
      </button>

      <p className="mt-6 text-center text-[12px] leading-relaxed text-muted-foreground">
        Esta experiência é educativa e não substitui<br className="sm:hidden" /> uma avaliação odontológica presencial.
      </p>
    </section>
  );
}

/* ----------------------------- Step shells ----------------------------- */

function StepHeader({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <header className="mb-6 mt-2">
      <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-gold">{eyebrow}</p>
      <h2 className="text-balance font-serif text-[28px] leading-[1.15] text-foreground sm:text-3xl">{title}</h2>
      <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{text}</p>
    </header>
  );
}

function SingleChoiceStep({
  eyebrow, title, text, items, value, onChange, layout = "list", withImages = false,
}: {
  eyebrow: string; title: string; text: string;
  items: CardItem[]; value?: string;
  onChange: (v: string) => void;
  layout?: "list" | "carousel";
  withImages?: boolean;
}) {
  return (
    <section>
      <StepHeader eyebrow={eyebrow} title={title} text={text} />
      {layout === "carousel" ? (
        <Carousel items={items} selected={value ? [value] : []} onToggle={onChange} withImages={withImages} />
      ) : (
        <div className="grid gap-3">
          {items.map((it) => (
            <OptionCard
              key={it.id}
              item={it}
              selected={value === it.id}
              onClick={() => onChange(it.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function MultiChoiceStep({
  eyebrow, title, text, items, value, onChange, layout = "list", withImages = false,
}: {
  eyebrow: string; title: string; text: string;
  items: CardItem[]; value: string[];
  onChange: (v: string[]) => void;
  layout?: "list" | "carousel";
  withImages?: boolean;
}) {
  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  };
  return (
    <section>
      <StepHeader eyebrow={eyebrow} title={title} text={text} />
      {layout === "carousel" ? (
        <Carousel items={items} selected={value} onToggle={toggle} withImages={withImages} multi />
      ) : (
        <div className="grid gap-3">
          {items.map((it) => (
            <OptionCard
              key={it.id}
              item={it}
              selected={value.includes(it.id)}
              onClick={() => toggle(it.id)}
              multi
            />
          ))}
        </div>
      )}
      {value.length > 0 && (
        <p className="mt-4 text-center text-[12px] uppercase tracking-[0.18em] text-muted-foreground">
          {value.length} {value.length === 1 ? "selecionado" : "selecionados"}
        </p>
      )}
    </section>
  );
}

/* ----------------------------- Cards & Carousel ----------------------------- */

function OptionCard({
  item, selected, onClick, multi = false,
}: { item: CardItem; selected: boolean; onClick: () => void; multi?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`group relative flex w-full items-start gap-4 rounded-2xl p-5 text-left card-premium hover:translate-y-[-2px] ${selected ? "card-selected" : ""}`}
    >
      <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-${multi ? "md" : "full"} border-2 transition-colors ${selected ? "border-gold bg-gold text-primary" : "border-border bg-background text-transparent"}`}>
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M5 12l5 5L20 7" />
        </svg>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-serif text-lg leading-tight text-foreground">{item.title}</span>
        {item.caption && (
          <span className="mt-1 block text-[14px] leading-snug text-muted-foreground">{item.caption}</span>
        )}
      </span>
    </button>
  );
}

function Carousel({
  items, selected, onToggle, withImages = false, multi = false,
}: {
  items: CardItem[]; selected: string[];
  onToggle: (id: string) => void;
  withImages?: boolean; multi?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div className="-mx-5">
      <div
        ref={ref}
        className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 pt-2"
        style={{ scrollPaddingLeft: "1.25rem" }}
      >
        {items.map((it, idx) => {
          const isSel = selected.includes(it.id);
          return (
            <button
              key={it.id}
              type="button"
              onClick={() => onToggle(it.id)}
              aria-pressed={isSel}
              style={{ animationDelay: `${idx * 60}ms` }}
              className={`animate-scale-pop relative flex w-[78%] shrink-0 snap-start flex-col overflow-hidden rounded-3xl text-left card-premium sm:w-[58%] ${isSel ? "card-selected" : ""}`}
            >
              {withImages && it.image && (
                <div className="relative aspect-[4/5] w-full overflow-hidden">
                  <img
                    src={it.image}
                    alt={it.title}
                    width={800}
                    height={1000}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/55 via-transparent to-transparent" />
                  {isSel && (
                    <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-gold text-primary shadow-gold animate-scale-pop">
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M5 12l5 5L20 7" />
                      </svg>
                    </span>
                  )}
                </div>
              )}
              <div className="flex flex-1 flex-col p-5">
                {!withImages && (
                  <span className={`mb-3 grid h-6 w-6 place-items-center rounded-${multi ? "md" : "full"} border-2 transition-colors ${isSel ? "border-gold bg-gold text-primary" : "border-border bg-background text-transparent"}`}>
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  </span>
                )}
                <p className="font-serif text-xl leading-tight text-foreground">{it.title}</p>
                {it.caption && (
                  <p className="mt-2 text-[14px] leading-snug text-muted-foreground">{it.caption}</p>
                )}
              </div>
            </button>
          );
        })}
        <div className="w-2 shrink-0" />
      </div>
      <div className="mt-1 flex justify-center gap-1.5">
        {items.map((it) => (
          <span
            key={it.id}
            className={`h-1 rounded-full transition-all ${selected.includes(it.id) ? "w-6 bg-gold" : "w-1.5 bg-border"}`}
          />
        ))}
      </div>
    </div>
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
  value, onChange,
}: { value: Answers["lead"]; onChange: (v: Answers["lead"]) => void }) {
  const upd = (k: keyof Answers["lead"], v: string) => onChange({ ...value, [k]: v });
  return (
    <section>
      <StepHeader
        eyebrow="Etapa 07 — Mapa"
        title="Seu Mapa do Sorriso está quase pronto."
        text="Informe seus dados para liberar seu mapa personalizado e, se quiser, conversar com a equipe."
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
        Seus dados são usados apenas para gerar seu mapa e, se você quiser, para um contato gentil da equipe.
      </p>
    </section>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
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
        <span className="absolute inset-2 rounded-full border border-gold/30 animate-pulse-ring" style={{ animationDelay: "0.4s" }} />
        <span className="grid h-12 w-12 place-items-center rounded-full bg-primary text-gold">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M4 10c2-3 5-4 8-4s6 1 8 4c-1 6-5 9-8 9s-7-3-8-9z" />
          </svg>
        </span>
      </div>
      <p className="mt-8 font-serif text-2xl text-foreground">Montando seu Mapa do Sorriso…</p>
      <p className="mt-3 max-w-xs text-[14px] text-muted-foreground">
        Cruzando seu desejo, percepções e cuidados para revelar um mapa personalizado.
      </p>
    </section>
  );
}

/* ----------------------------- Result ----------------------------- */

const STYLE_LABEL: Record<string, string> = {
  natural: "Natural e elegante",
  bright: "Mais branco e iluminado",
  proportion: "Mais proporcional",
  confident: "Mais confiante nas fotos",
  bold: "Mudança marcante com segurança",
};

const PERCEPTION_LABEL = Object.fromEntries(PERCEPTION.map((p) => [p.id, p.title]));
const REF_LABEL = Object.fromEntries(REFERENCES.map((p) => [p.id, p.title]));
const SAFETY_LABEL = Object.fromEntries(SAFETY.map((p) => [p.id, p.title]));

function safetyNarrative(id?: string): string {
  switch (id) {
    case "natural":
      return "Seu mapa mostra que naturalidade é um ponto importante para você. Em estética do sorriso, evitar um resultado artificial depende de planejamento: cor, formato, proporção e linha do sorriso precisam conversar com o rosto e com a personalidade da pessoa.";
    case "wear":
      return "Seu mapa mostra que segurança é central para sua decisão. Antes de qualquer tratamento estético, o dentista precisa avaliar estrutura dental, saúde bucal e alternativas possíveis.";
    case "price":
      return "Seu mapa indica que você está avaliando o investimento com cuidado. O valor pode variar conforme planejamento, materiais, quantidade de dentes envolvidos e complexidade do caso.";
    case "pain":
      return "Seu mapa mostra que você quer entender melhor a experiência do procedimento. Cada caso precisa ser avaliado para explicar etapas, cuidados, previsibilidade e possíveis desconfortos.";
    case "fit":
      return "Seu mapa mostra que sua principal dúvida é se uma mudança estética combinaria com você. Um sorriso bonito precisa conversar com rosto, expressão, personalidade e expectativa de naturalidade.";
    case "alternatives":
      return "Seu mapa mostra que você ainda está em fase de descoberta. Antes de decidir por facetas, lentes ou qualquer tratamento estético, faz sentido entender possibilidades, limites e cuidados.";
    default:
      return "Seu mapa mostra que clareza e informação são partes importantes do seu processo. Uma avaliação ajuda a entender quais possibilidades fazem sentido para o seu sorriso.";
  }
}

function nextStepNarrative(intent?: string): string {
  switch (intent) {
    case "evaluate": return "Agendar uma avaliação é o próximo passo mais indicado.";
    case "price": return "Conversar com a equipe pode ajudar a entender faixas e possibilidades antes da avaliação.";
    case "doubts": return "Uma conversa inicial pode esclarecer receios antes de decidir.";
    case "guidance": return "Receber uma orientação inicial pode ajudar a organizar suas possibilidades.";
    case "research": return "Você pode salvar seu mapa e conversar quando se sentir mais seguro.";
    default: return "Uma conversa inicial pode ajudar a esclarecer próximos passos.";
  }
}

function ResultMap({ answers, onRestart }: { answers: Answers; onRestart: () => void }) {
  const styleLabel = answers.desire ? STYLE_LABEL[answers.desire] : "Equilibrado";
  const refs = answers.references.map((id) => REF_LABEL[id]).filter(Boolean);
  const perceived = answers.perception.map((id) => PERCEPTION_LABEL[id]).filter(Boolean);
  const attention = [...refs, ...perceived].slice(0, 4);
  const safetyTitle = answers.safety ? SAFETY_LABEL[answers.safety] : "Mais informação";

  const wppMessage = encodeURIComponent(
    `Olá! Fiz o Laboratório do Sorriso Ideal e meu mapa indicou ${styleLabel.toLowerCase()}. Gostaria de entender quais possibilidades podem fazer sentido para meu sorriso em uma avaliação.`
  );
  const wppNumber = answers.lead.whatsapp.replace(/\D/g, "");
  const wppHref = `https://wa.me/?text=${wppMessage}${wppNumber ? `` : ``}`;

  return (
    <section className="pb-12">
      <header className="mb-6 mt-2 text-center">
        <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-gold">Resultado personalizado</p>
        <h2 className="font-serif text-[34px] leading-[1.05] text-foreground sm:text-4xl">Seu Mapa do Sorriso</h2>
        {answers.lead.name && (
          <p className="mt-2 text-[14px] text-muted-foreground">para {answers.lead.name.split(" ")[0]}</p>
        )}
      </header>

      <div className="space-y-4">
        <ResultBlock eyebrow="Estilo predominante" title={styleLabel} accent />

        <ResultBlock eyebrow="Pontos que chamaram sua atenção">
          {attention.length > 0 ? (
            <ul className="mt-2 space-y-2">
              {attention.map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-[15px] text-foreground">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[14px] text-muted-foreground">Você preferiu observar sem destacar pontos específicos — também é uma escolha válida.</p>
          )}
        </ResultBlock>

        <ResultBlock eyebrow="Cuidado principal" title={safetyTitle} />

        <ResultBlock eyebrow="O que seu mapa revela">
          <p className="mt-2 text-[15px] leading-relaxed text-foreground/90">
            Pelo que você explorou, seu objetivo parece estar ligado a um sorriso <strong className="font-medium text-foreground">{styleLabel.toLowerCase()}</strong>
            {attention.length > 0 && (
              <>, com atenção especial a <strong className="font-medium text-foreground">{attention.slice(0, 2).join(" e ").toLowerCase()}</strong></>
            )}.
            O cuidado mais importante para você agora é <strong className="font-medium text-foreground">{safetyTitle.toLowerCase()}</strong>.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-foreground/90">{safetyNarrative(answers.safety)}</p>
          <p className="mt-3 text-[15px] leading-relaxed text-foreground/90">
            Em estética do sorriso, o melhor resultado não depende apenas de dentes mais brancos ou alinhados, mas de um planejamento que considere naturalidade, proporção, saúde dental e expectativa.
          </p>
        </ResultBlock>

        <ResultBlock eyebrow="Próximo passo recomendado">
          <p className="mt-2 text-[15px] leading-relaxed text-foreground/90">{nextStepNarrative(answers.intent)}</p>
          <p className="mt-3 text-[15px] leading-relaxed text-foreground/90">
            Pode fazer sentido conversar sobre possibilidades estéticas para o seu sorriso.
          </p>
        </ResultBlock>

        <div className="rounded-3xl border border-dashed border-border bg-muted/50 p-5">
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            <strong className="font-medium text-foreground">Este mapa é educativo</strong> e não substitui uma avaliação odontológica. O plano ideal depende de análise clínica feita por um dentista.
          </p>
        </div>
      </div>

      <a
        href={wppHref}
        target="_blank"
        rel="noopener noreferrer"
        className="group mt-8 flex w-full items-center justify-between gap-3 rounded-2xl bg-primary px-6 py-5 text-left text-primary-foreground shadow-soft transition-all duration-300 hover:translate-y-[-2px] hover:shadow-gold active:scale-[0.99]"
      >
        <span className="flex flex-col">
          <span className="text-[11px] uppercase tracking-[0.2em] text-gold-soft">Próximo passo</span>
          <span className="mt-1 font-serif text-xl">Conversar com a equipe</span>
        </span>
        <span className="grid h-11 w-11 place-items-center rounded-full bg-gold text-primary transition-transform group-hover:translate-x-1">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
            <path d="M20 3.5A11.5 11.5 0 003 19l-1 4 4.2-1.1A11.5 11.5 0 1020 3.5zm-8.5 18a9.5 9.5 0 01-4.9-1.4l-.3-.2-2.5.7.7-2.4-.2-.4A9.5 9.5 0 1111.5 21.5zm5.4-7.1c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.2s-.8.9-1 1.1c-.2.2-.4.2-.7.1a7.7 7.7 0 01-2.3-1.4 8.6 8.6 0 01-1.6-2c-.2-.3 0-.5.1-.6l.5-.6c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.1c-.2-.5-.5-.4-.7-.4h-.6a1.2 1.2 0 00-.9.4 3.6 3.6 0 00-1.1 2.7c0 1.6 1.1 3.1 1.3 3.3.2.2 2.3 3.5 5.5 4.7a18 18 0 001.8.6 4.4 4.4 0 002 .1 3.3 3.3 0 002.2-1.5 2.7 2.7 0 00.2-1.5c-.1-.1-.3-.2-.6-.3z" />
          </svg>
        </span>
      </a>

      <button
        onClick={onRestart}
        className="mt-3 w-full rounded-2xl border border-border bg-card px-5 py-4 text-[14px] text-muted-foreground transition-colors hover:text-foreground"
      >
        Refazer minha experiência
      </button>
    </section>
  );
}

function ResultBlock({
  eyebrow, title, children, accent = false,
}: { eyebrow: string; title?: string; children?: React.ReactNode; accent?: boolean }) {
  return (
    <article className={`rounded-3xl border bg-card p-5 ${accent ? "border-gold shadow-gold" : "border-border shadow-card"}`}>
      <p className={`text-[11px] uppercase tracking-[0.2em] ${accent ? "text-gold" : "text-muted-foreground"}`}>{eyebrow}</p>
      {title && <p className="mt-2 font-serif text-2xl leading-tight text-foreground">{title}</p>}
      {children}
    </article>
  );
}

/* ----------------------------- Sticky CTA ----------------------------- */

function StickyCTA({
  label, disabled, onClick, onBack,
}: { label: string; disabled?: boolean; onClick: () => void; onBack?: () => void }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30">
      <div className="mx-auto w-full max-w-2xl px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
        <div
          className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-border bg-card/95 p-2 shadow-card backdrop-blur"
        >
          {onBack && (
            <button
              onClick={onBack}
              aria-label="Voltar"
              className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-border bg-background text-foreground/70 transition-colors hover:text-foreground"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
            </button>
          )}
          <button
            onClick={onClick}
            disabled={disabled}
            className={`group relative flex h-12 flex-1 items-center justify-between gap-3 overflow-hidden rounded-xl px-4 text-left transition-all duration-300 ${
              disabled
                ? "bg-muted text-muted-foreground"
                : "bg-primary text-primary-foreground hover:shadow-gold active:scale-[0.99]"
            }`}
          >
            <span className="font-serif text-[17px]">{label}</span>
            <span className={`grid h-9 w-9 place-items-center rounded-lg transition-transform group-hover:translate-x-0.5 ${disabled ? "bg-background/40" : "bg-gold text-primary"}`}>
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
