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

const PROFILE_BY_STYLE: Record<string, string> = {
  natural: "Harmonização Discreta & Anatomicamente Preservada",
  rejuvenescido: "Luminosidade Jovem & Realce de Cor",
  amplo: "Simetria Facial & Preenchimento de Corredor Bucal",
  hollywood: "Design Ultra-Radiante & Alta Expressão Estética",
  orientacao: "Mapeamento Personalizado em Consulta",
};

const PILLAR_BY_CONCERN: Record<string, { title: string; text: string }> = {
  cor: {
    title: "Tecnologia de Cor Estável",
    text: "Laminados cerâmicos de alta opalescência, que bloqueiam o fundo escuro e não amarelam com o tempo.",
  },
  formato: {
    title: "Planejamento Aditivo",
    text: "Foco em recuperar volume e proporção sem desgaste desnecessário de estrutura sadia.",
  },
  espacos: {
    title: "Fechamento Proporcional",
    text: "Redesenho da largura dos dentes para fechar espaços mantendo a proporção do sorriso.",
  },
  alinhamento: {
    title: "Fechamento Proporcional",
    text: "Redesenho da largura dos dentes para corrigir assimetrias visuais mantendo a proporção.",
  },
  tamanho: {
    title: "Arquitetura Gengival Integrada",
    text: "Avaliação do contorno gengival para valorizar o tamanho e a proporção das facetas.",
  },
};

const BASE_PILLAR = {
  title: "Protocolo Digital com Mock-up Prévio",
  text: "Teste do sorriso no seu rosto antes de qualquer procedimento definitivo.",
};

const SAFETY_BY_OBJECTION: Record<string, string> = {
  desgaste: "Seu perfil é elegível para lentes ultrafinas, de mínimo desgaste biológico.",
  artificialidade:
    "Seu planejamento prevê Mock-up (teste do sorriso no rosto) antes de qualquer procedimento definitivo.",
  dor: "Protocolo de execução rápida e minimamente invasiva, sem desconforto durante as sessões.",
  investimento:
    "Simulação de condições facilitadas e parcelamento são apresentadas diretamente na avaliação.",
  tempo: "Cronograma reduzido, com etapas concentradas em poucas sessões.",
};

const CTA_BY_DECISION: Record<string, { button: string; message: string }> = {
  agendar_agora: {
    button: "Falar agora e reservar meu horário",
    message: "Olá! Concluí meu Mapa do Sorriso e quero ser atendido(a) agora.",
  },
  agendar_avaliacao: {
    button: "Enviar meu Mapa e agendar avaliação",
    message: "Olá! Concluí meu Mapa do Sorriso e gostaria de agendar uma avaliação.",
  },
  valores: {
    button: "Enviar meu Mapa e receber as condições",
    message:
      "Olá! Concluí meu Mapa do Sorriso e gostaria de entender valores e condições antes de agendar.",
  },
  comparando: {
    button: "Enviar meu Mapa e comparar possibilidades",
    message:
      "Olá! Concluí meu Mapa do Sorriso e gostaria de entender as técnicas e diferenciais da clínica.",
  },
  pesquisando: {
    button: "Receber meu Mapa e tirar dúvidas",
    message: "Olá! Fiz o Mapa do Sorriso e gostaria de tirar algumas dúvidas.",
  },
};

const DEFAULT_CTA = {
  button: "Enviar meu Mapa do Sorriso no WhatsApp",
  message: "Olá! Concluí meu Mapa do Sorriso e gostaria de conversar com a clínica.",
};

export type Answers = {
  style?: string;
  concerns: string[];
  objection?: string;
  decision?: string;
};

export type SmileMap = {
  profile: string;
  summary: string;
  pillars: { title: string; text: string }[];
  safetyNote: string;
  ctaButton: string;
  whatsappMessage: string;
};

const labelOf = (list: Option[], id?: string) => list.find((o) => o.id === id)?.title ?? "";

export function buildSmileMap(answers: Answers): SmileMap {
  const style = answers.style ?? "orientacao";
  const profile = PROFILE_BY_STYLE[style] ?? PROFILE_BY_STYLE["orientacao"];

  const pillars: { title: string; text: string }[] = [];
  for (const c of answers.concerns) {
    const p = PILLAR_BY_CONCERN[c];
    if (p && !pillars.some((x) => x.title === p.title)) pillars.push(p);
  }
  while (pillars.length < 3) {
    if (!pillars.some((x) => x.title === BASE_PILLAR.title)) {
      pillars.push(BASE_PILLAR);
    } else if (!pillars.some((x) => x.title === PILLAR_BY_CONCERN["cor"].title)) {
      pillars.push(PILLAR_BY_CONCERN["cor"]);
    } else {
      pillars.push(PILLAR_BY_CONCERN["formato"]);
    }
  }

  const safetyNote = answers.objection
    ? (SAFETY_BY_OBJECTION[answers.objection] ??
      "Seu planejamento é conduzido de forma gradual, com validação a cada etapa.")
    : "Seu planejamento é conduzido de forma gradual, com validação a cada etapa.";

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

  const whatsappMessage = `${cta.message}\n\nMeu perfil: ${profile}.\n${summary}.`;

  return {
    profile,
    summary,
    pillars: pillars.slice(0, 3),
    safetyNote,
    ctaButton: cta.button,
    whatsappMessage,
  };
}
