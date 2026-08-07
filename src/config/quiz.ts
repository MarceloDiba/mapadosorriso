import heroSmile from "@/assets/hero-smile.jpg";
import styleBright from "@/assets/style-bright.jpg";
import styleHollywood from "@/assets/style-hollywood.jpg";
import styleNatural from "@/assets/style-natural.jpg";
import styleWide from "@/assets/style-wide.jpg";

/* --------------------------- Imagens padrão --------------------------- */

export const IMAGE_SLOTS = [
  { key: "hero", label: "Capa (tela inicial)" },
  { key: "natural", label: "Estilo Natural" },
  { key: "rejuvenescido", label: "Estilo Rejuvenescido" },
  { key: "amplo", label: "Estilo Amplo" },
  { key: "hollywood", label: "Estilo Hollywood" },
] as const;

export const DEFAULT_IMAGES: Record<string, string> = {
  hero: heroSmile,
  natural: styleNatural,
  rejuvenescido: styleBright,
  amplo: styleWide,
  hollywood: styleHollywood,
};

/* ----------------------------- Textos ----------------------------- */

export const COPY_FIELDS = [
  { key: "heroTitle", label: "Título da capa" },
  { key: "heroSubtitle", label: "Subtítulo da capa" },
  { key: "heroCta", label: "Botão da capa" },
  { key: "step1Title", label: "Tela 1 — pergunta" },
  { key: "step2Title", label: "Tela 2 — pergunta" },
  { key: "step3Title", label: "Tela 3 — pergunta" },
  { key: "step4Title", label: "Tela 4 — pergunta" },
  { key: "resultTitle", label: "Tela 5 — título do resultado" },
] as const;

export const DEFAULT_COPY: Record<string, string> = {
  heroTitle: "Antes de decidir, entenda seu sorriso.",
  heroSubtitle: "Uma jornada visual para organizar o que você quer mudar — em 2 minutos.",
  heroCta: "Começar meu mapa",
  step1Title: "Qual sorriso mais te inspira hoje?",
  step2Title: "O que mais te incomoda no seu sorriso hoje?",
  step3Title: "O que mais te faz hesitar em dar esse passo?",
  step4Title: "Qual é o seu momento hoje?",
  resultTitle: "Seu Mapa do Sorriso está pronto!",
};

/** Blocos do painel: imagem + textos da mesma etapa, juntos. */
export const STEP_BLOCKS: {
  key: string;
  title: string;
  hint?: string;
  images: string[];
  fields: string[];
}[] = [
  {
    key: "hero",
    title: "Capa",
    hint: "Primeira tela que o paciente vê ao abrir o link.",
    images: ["hero"],
    fields: ["heroTitle", "heroSubtitle", "heroCta"],
  },
  {
    key: "style",
    title: "Tela 1 — Estilos de sorriso",
    hint: "As quatro imagens de referência do grid.",
    images: ["natural", "rejuvenescido", "amplo", "hollywood"],
    fields: ["step1Title"],
  },
  { key: "concerns", title: "Tela 2 — O que incomoda", images: [], fields: ["step2Title"] },
  { key: "objection", title: "Tela 3 — Segurança", images: [], fields: ["step3Title"] },
  { key: "decision", title: "Tela 4 — Momento", images: [], fields: ["step4Title"] },
  {
    key: "result",
    title: "Tela 5 — Mapa de Transformação",
    hint: "Resultado personalizado e chamada para o WhatsApp.",
    images: [],
    fields: ["resultTitle"],
  },
];

export const IMAGE_LABELS: Record<string, string> = Object.fromEntries(
  IMAGE_SLOTS.map((s) => [s.key, s.label]),
);

export const COPY_LABELS: Record<string, string> = Object.fromEntries(
  COPY_FIELDS.map((f) => [f.key, f.label]),
);

export function copyOf(clinicCopy: Record<string, unknown> | null | undefined, key: string) {
  const v = clinicCopy?.[key];
  return typeof v === "string" && v.trim() ? v : DEFAULT_COPY[key];
}

/* ----------------------------- Opções ----------------------------- */

export type Option = { id: string; title: string; caption?: string };

export const STYLES: Option[] = [
  { id: "natural", title: "Natural", caption: "Discreto, anatômico e elegante." },
  { id: "rejuvenescido", title: "Rejuvenescido", caption: "Luminosidade e realce de cor." },
  { id: "amplo", title: "Amplo", caption: "Simetria e sorriso mais largo." },
  { id: "hollywood", title: "Hollywood", caption: "Máximo brilho e expressão." },
];

export const CONCERNS: Option[] = [
  { id: "cor", title: "Cor amarelada ou manchas" },
  { id: "formato", title: "Formato irregular ou dentes desgastados" },
  { id: "espacos", title: "Espaços entre os dentes (diastemas)" },
  { id: "tamanho", title: "Dentes pequenos ou muita gengiva ao sorrir" },
  { id: "alinhamento", title: "Alinhamento e simetria" },
];

export const OBJECTIONS: Option[] = [
  { id: "artificialidade", title: "Medo do resultado parecer artificial" },
  { id: "desgaste", title: "Receio de desgastar o dente natural" },
  { id: "dor", title: "Medo de dor ou sensibilidade" },
  { id: "investimento", title: "Dúvida sobre o investimento" },
  { id: "tempo", title: "Tempo e número de sessões" },
];

export const DECISIONS: Option[] = [
  {
    id: "agendar_agora",
    title: "Quero agendar agora",
    caption: "Já decidi e quero falar com a clínica hoje.",
  },
  {
    id: "agendar_avaliacao",
    title: "Quero agendar uma avaliação",
    caption: "Quero entender meu caso com um especialista.",
  },
  {
    id: "valores",
    title: "Quero entender valores antes",
    caption: "Preciso de clareza sobre investimento e condições.",
  },
  {
    id: "comparando",
    title: "Estou comparando possibilidades",
    caption: "Pesquisando clínicas, técnicas e diferenciais.",
  },
  {
    id: "pesquisando",
    title: "Tenho dúvidas e estou apenas pesquisando",
    caption: "Quero aprender antes de qualquer decisão.",
  },
];

export const DECISION_SHORT: Record<string, string> = {
  agendar_agora: "Pronto para agendar",
  agendar_avaliacao: "Pronto para agendar",
  valores: "Planejando custos",
  comparando: "Comparando clínicas",
  pesquisando: "Apenas pesquisando",
};

/* --------------------------- Matriz lógica --------------------------- */

/** Títulos aspiracionais (nada de jargão técnico). */
const PROFILE_BY_STYLE: Record<string, string> = {
  natural: "Harmonia Invisível & Elegância Discreta",
  rejuvenescido: "Luminosidade Jovem & Vitalidade Facial",
  amplo: "Presença Marcante & Equilíbrio Facial",
  hollywood: "Presença Marcante & Alta Expressão Estética",
  orientacao: "Descoberta Personalizada do Seu Estilo",
};

/** Desejo em linguagem emocional, para compor a jornada. */
const DESIRE_BY_STYLE: Record<string, string> = {
  natural: "um sorriso que parece seu de nascença — leve, natural e elegante",
  rejuvenescido: "um sorriso mais jovem, luminoso e cheio de vitalidade",
  amplo: "um sorriso mais amplo e equilibrado, em harmonia com o seu rosto",
  hollywood: "um sorriso marcante, radiante e cheio de presença",
  orientacao: "clareza sobre o estilo de sorriso que mais combina com você",
};

const CONCERN_PHRASE: Record<string, string> = {
  cor: "com uma cor mais uniforme e luminosa",
  formato: "com formato harmônico e proporções bem desenhadas",
  espacos: "sem os espaços que hoje chamam sua atenção",
  tamanho: "com dentes e gengiva em proporção equilibrada",
  alinhamento: "com alinhamento e simetria bem resolvidos",
};

/** Receio da Tela 3 traduzido em tranquilidade — sem termo clínico frio. */
const REASSURANCE_BY_OBJECTION: Record<string, string> = {
  artificialidade:
    "Naturalidade não é sorte: é planejamento. Você visualiza e aprova o seu novo sorriso no próprio rosto antes de qualquer etapa definitiva — nada acontece sem o seu sim.",
  desgaste:
    "Hoje a odontologia trabalha com técnicas modernas e minimamente invasivas, pensadas para preservar ao máximo a sua estrutura natural sob a condução do especialista.",
  dor:
    "O cuidado com o seu conforto guia todo o protocolo: etapas curtas, tecnologia atual e acompanhamento próximo do cirurgião-dentista do início ao fim.",
  investimento:
    "Transparência faz parte do processo. Na avaliação você recebe o plano completo e as condições possíveis, com calma, para decidir com segurança.",
  tempo:
    "O planejamento digital concentra as etapas e organiza o cronograma, para que a sua transformação aconteça de forma previsível e sem atropelos.",
};

const REASSURANCE_DEFAULT =
  "Cada etapa é conduzida com cuidado e validada com você, sempre sob a orientação do cirurgião-dentista.";

/** Bloco fixo de impacto na autoestima. */
export const IMPACT_TEXT =
  "Pesquisas sobre estética do sorriso mostram que boa parte das pessoas evita sorrir abertamente por insatisfação com os próprios dentes. Um sorriso equilibrado tende a transmitir mais segurança e jovialidade — e muda a forma como você se apresenta na vida pessoal e profissional.";

export const AUTHORITY_TEXT =
  "A odontologia de alto padrão une ciência e arte. O plano definitivo — e a indicação do que é possível no seu caso — nasce da avaliação presencial com o especialista, olhando para o seu rosto, o seu sorriso e o seu objetivo.";

function protocolPillars(concerns: string[], objection?: string) {
  const artistic =
    concerns.includes("espacos") || concerns.includes("alinhamento") || concerns.includes("tamanho")
      ? "Cada dente é desenhado respeitando as proporções únicas do seu rosto, para que largura, simetria e contorno conversem entre si."
      : "Cada dente é desenhado respeitando os traços únicos do seu rosto, buscando o equilíbrio entre proporção, cor e expressão.";

  const minimal =
    objection === "desgaste"
      ? "Técnicas modernas de mínima intervenção, criadas justamente para preservar ao máximo a sua estrutura natural."
      : "Tecnologia guiada e materiais de alta performance, aplicados com o mínimo de intervenção necessária.";

  return [
    { title: "Visão artística e proporção áurea", text: artistic },
    { title: "Tecnologia guiada de mínima intervenção", text: minimal },
    {
      title: "Previsibilidade total: teste antes de fazer",
      text: "Você visualiza e aprova o resultado no seu próprio rosto antes de iniciar qualquer etapa definitiva.",
    },
  ];
}

const CTA_BY_DECISION: Record<string, { button: string; message: string }> = {
  agendar_agora: {
    button: "Agendar Minha Avaliação no WhatsApp",
    message: "Olá! Concluí meu Mapa de Transformação do Sorriso e quero ser atendido(a) hoje.",
  },
  agendar_avaliacao: {
    button: "Agendar Minha Avaliação no WhatsApp",
    message: "Olá! Concluí meu Mapa de Transformação do Sorriso e gostaria de agendar minha avaliação.",
  },
  valores: {
    button: "Falar no WhatsApp e conhecer as condições",
    message:
      "Olá! Concluí meu Mapa de Transformação do Sorriso e gostaria de entender as condições antes de agendar.",
  },
  comparando: {
    button: "Falar no WhatsApp sobre o protocolo da clínica",
    message:
      "Olá! Concluí meu Mapa de Transformação do Sorriso e gostaria de conhecer o protocolo e os diferenciais da clínica.",
  },
  pesquisando: {
    button: "Falar no WhatsApp e tirar minhas dúvidas",
    message: "Olá! Fiz o Mapa de Transformação do Sorriso e gostaria de tirar algumas dúvidas.",
  },
};

const DEFAULT_CTA = {
  button: "Agendar Minha Avaliação no WhatsApp",
  message: "Olá! Concluí meu Mapa de Transformação do Sorriso e gostaria de conversar com a clínica.",
};

export type Answers = {
  style?: string;
  concerns: string[];
  objection?: string;
  decision?: string;
};

/* ------------------------- Mapa visual (radar) ------------------------- */

/**
 * Seis eixos de leitura estética do sorriso (vocabulário de Smile Design),
 * usados só para dar forma visual às respostas do paciente — não é um
 * diagnóstico clínico, é um reflexo do que ele mesmo apontou como foco.
 */
export const SMILE_AXES = [
  { key: "arco", label: "Arco do sorriso" },
  { key: "proporcao", label: "Proporção dos dentes" },
  { key: "cor", label: "Cor" },
  { key: "simetria", label: "Simetria" },
  { key: "formato", label: "Formato" },
  { key: "gengival", label: "Exposição gengival" },
] as const;

export type SmileAxisKey = (typeof SMILE_AXES)[number]["key"];
export type SmileScores = Record<SmileAxisKey, number>;

const AXIS_BASE = 38;

const CONCERN_AXIS_WEIGHTS: Record<string, Partial<Record<SmileAxisKey, number>>> = {
  cor: { cor: 55 },
  formato: { formato: 50 },
  espacos: { simetria: 45, arco: 20 },
  tamanho: { proporcao: 50, gengival: 40 },
  alinhamento: { simetria: 50, arco: 15 },
};

const STYLE_AXIS_WEIGHTS: Record<string, Partial<Record<SmileAxisKey, number>>> = {
  natural: { formato: 10, proporcao: 10 },
  rejuvenescido: { cor: 20, arco: 10 },
  amplo: { arco: 25, simetria: 10 },
  hollywood: { cor: 25, arco: 20 },
  orientacao: {},
};

/**
 * Converte as respostas do quiz num placar de 0 a 100 por eixo — quanto
 * maior, mais aquele eixo apareceu no que a pessoa disse desejar ou notar.
 * É um espelho das respostas, não uma avaliação clínica do sorriso dela.
 */
export function buildSmileScores(answers: Answers): SmileScores {
  const scores = Object.fromEntries(
    SMILE_AXES.map((a) => [a.key, AXIS_BASE]),
  ) as SmileScores;

  const styleWeights = STYLE_AXIS_WEIGHTS[answers.style ?? "orientacao"] ?? {};
  for (const axis of SMILE_AXES) {
    scores[axis.key] += styleWeights[axis.key] ?? 0;
  }

  for (const concern of answers.concerns) {
    const weights = CONCERN_AXIS_WEIGHTS[concern];
    if (!weights) continue;
    for (const axis of SMILE_AXES) {
      scores[axis.key] += weights[axis.key] ?? 0;
    }
  }

  for (const axis of SMILE_AXES) {
    scores[axis.key] = Math.max(0, Math.min(100, Math.round(scores[axis.key])));
  }

  return scores;
}

export type SmileMap = {
  profile: string;
  journey: string;
  impact: string;
  protocol: { title: string; text: string }[];
  reassurance: string;
  authority: string;
  summary: string;
  ctaButton: string;
  whatsappMessage: string;
};

const labelOf = (list: Option[], id?: string) => list.find((o) => o.id === id)?.title ?? "";

export function buildSmileMap(answers: Answers, clinicName?: string): SmileMap {
  const style = answers.style ?? "orientacao";
  const profile = PROFILE_BY_STYLE[style] ?? PROFILE_BY_STYLE["orientacao"];

  const desire = DESIRE_BY_STYLE[style] ?? DESIRE_BY_STYLE["orientacao"];
  const concernPhrases = answers.concerns.map((c) => CONCERN_PHRASE[c]).filter(Boolean);
  const concernPart = concernPhrases.length
    ? `, ${concernPhrases.join(" e ")}`
    : "";
  const journey = `Você busca ${desire}${concernPart} — com segurança, naturalidade e respeito à sua saúde bucal.`;

  const reassurance = answers.objection
    ? (REASSURANCE_BY_OBJECTION[answers.objection] ?? REASSURANCE_DEFAULT)
    : REASSURANCE_DEFAULT;

  const cta = (answers.decision && CTA_BY_DECISION[answers.decision]) || DEFAULT_CTA;

  const styleLabel =
    style === "orientacao" ? "Quero orientação" : labelOf(STYLES, style) || "Não definido";
  const concernLabels = answers.concerns.map((c) => labelOf(CONCERNS, c)).filter(Boolean);
  const objectionLabel = labelOf(OBJECTIONS, answers.objection);

  const summary = [
    `Desejo: ${styleLabel}`,
    concernLabels.length ? `Queixa: ${concernLabels.join(" & ")}` : "",
    objectionLabel ? `Dúvida: ${objectionLabel}` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  const whatsappMessage = `${cta.message}\n\nMeu perfil: ${profile}.\n${summary}.${
    clinicName ? `\nClínica: ${clinicName}.` : ""
  }`;

  return {
    profile,
    journey,
    impact: IMPACT_TEXT,
    protocol: protocolPillars(answers.concerns, answers.objection),
    reassurance,
    authority: AUTHORITY_TEXT,
    summary,
    ctaButton: cta.button,
    whatsappMessage,
  };
}

