"use client";

import React, { useState, useMemo } from "react";
import {
  Menu, X, ChevronRight, ChevronLeft, MapPin, Clock, Phone, DollarSign,
  AlertTriangle, CheckCircle2, Heart, Brain, Users, BookOpen, Compass,
  ShieldCheck, ArrowRight, Info, Search, MessageCircle
} from "lucide-react";

/* ---------------------------------------------------------------------
   DESIGN TOKENS
   Paleta propia (no plantilla): fondo neblina-salvia, verde bosque como
   color de confianza, miel como acento cálido, azul-noche para apoyo.
   Los niveles de resultado usan la misma familia tonal, nunca rojo/verde
   semáforo puros, para no generar alarma innecesaria.
--------------------------------------------------------------------- */
const C = {
  bg: "#F6F8F6",
  bgAlt: "#EFF3EF",
  card: "#FFFFFF",
  border: "#E3E8E2",
  text: "#26302B",
  textSoft: "#5B6660",
  primary: "#2F5D50",
  primaryDark: "#1F4238",
  primarySoft: "#E7F0E6",
  honey: "#C89646",
  honeySoft: "#FBF1DD",
  night: "#4A5D8A",
  nightSoft: "#E9ECF5",
  amber: "#C89646",
  amberSoft: "#FBF1DD",
  orange: "#B5723C",
  orangeSoft: "#F6E7D8",
  brick: "#A6494B",
  brickSoft: "#F5DEDF",
};

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,450;9..144,560;9..144,650&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
.mente-root { font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif; background:${C.bg}; color:${C.text}; }
.mente-display { font-family: 'Fraunces', ui-serif, Georgia, serif; }
@keyframes mente-breathe {
  0%, 100% { transform: scale(1); opacity: 0.55; }
  50% { transform: scale(1.12); opacity: 0.85; }
}
.mente-breathe { animation: mente-breathe 6s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .mente-breathe { animation: none; }
}
.mente-focus:focus-visible {
  outline: 2px solid ${C.primary};
  outline-offset: 2px;
}
`;

/* ---------------------------------------------------------------------
   CONTENIDO / DATOS MOCK
--------------------------------------------------------------------- */
const NAV_ITEMS = [
  { key: "home", label: "Inicio" },
  { key: "screening", label: "Evaluación" },
  { key: "findhelp", label: "Buscar ayuda" },
  { key: "education", label: "Educación" },
  { key: "about", label: "Sobre MENTE" },
];

const CONCERN_OPTIONS = [
  "Tristeza o falta de ánimo",
  "Ansiedad o preocupación",
  "Estrés",
  "Problemas de sueño",
  "Falta de energía",
  "Dificultades para estudiar o trabajar",
  "Problemas para relacionarme con otras personas",
  "No sé exactamente qué me pasa",
  "Otro",
];

const SYMPTOM_QUESTIONS = [
  "¿Con qué frecuencia has sentido poco interés o placer en actividades que antes disfrutabas?",
  "¿Con qué frecuencia te has sentido decaído/a, triste o sin ánimo?",
  "¿Con qué frecuencia has tenido dificultades para dormir, o has dormido demasiado?",
  "¿Con qué frecuencia te has sentido cansado/a o con poca energía?",
  "¿Con qué frecuencia has notado cambios en tu apetito, comiendo mucho más o mucho menos de lo habitual?",
  "¿Con qué frecuencia te has sentido nervioso/a, ansioso/a o con los nervios de punta?",
  "¿Con qué frecuencia no has podido dejar de preocuparte por distintas cosas?",
  "¿Con qué frecuencia te ha costado concentrarte en tus estudios, trabajo o actividades diarias?",
  "¿Con qué frecuencia has sentido que te alejas de tus amigos, familia u otras personas?",
];

const LIKERT_OPTIONS = [
  { label: "Nunca", value: 0 },
  { label: "Algunos días", value: 1 },
  { label: "Más de la mitad de los días", value: 2 },
  { label: "Casi todos los días", value: 3 },
];

const SAFETY_QUESTION =
  "En los últimos días, ¿has pensado que preferirías no estar vivo/a, hacerte daño o que la vida no vale la pena?";
const SAFETY_OPTIONS = ["No", "Sí", "Prefiero no responder"];

const RESULT_CATEGORIES = [
  {
    key: "verde",
    emoji: "🟢",
    title: "Bienestar general",
    min: 0,
    max: 4,
    color: C.primary,
    bg: C.primarySoft,
    desc: "Tus respuestas no muestran señales que requieran atención inmediata. Sigue prestando atención a tu bienestar emocional.",
  },
  {
    key: "amarillo",
    emoji: "🟡",
    title: "Sería recomendable buscar orientación",
    min: 5,
    max: 9,
    color: C.honey,
    bg: C.honeySoft,
    desc: "Tus respuestas muestran algunas señales que podrían beneficiarse de conversar con un profesional o con alguien de confianza.",
  },
  {
    key: "naranja",
    emoji: "🟠",
    title: "Sería recomendable una evaluación profesional",
    min: 10,
    max: 17,
    color: C.orange,
    bg: C.orangeSoft,
    desc: "Tus respuestas muestran síntomas que pueden justificar una evaluación profesional.",
  },
  {
    key: "rojo",
    emoji: "🔴",
    title: "Necesitas atención urgente",
    min: 18,
    max: 27,
    color: C.brick,
    bg: C.brickSoft,
    desc: "Tus respuestas muestran un nivel de malestar importante. Te recomendamos buscar apoyo profesional lo antes posible.",
  },
];

const NEXT_STEPS = [
  "Hablar con un profesional de salud mental.",
  "Hablar con alguien de confianza.",
  "Consultar los recursos disponibles.",
  "Si los síntomas empeoran o aparecen pensamientos de hacerte daño, buscar atención urgente.",
];

const CENTERS = [
  { id: 1, name: "Centro de Salud Comunitario Norte", department: "Santa Cruz", city: "Santa Cruz de la Sierra", zone: "Zona Norte", hours: "Lun–Vie, 7:00–15:00", services: ["Centro de salud", "Psicología"], cost: "Gratuito", phone: "+591 3 000-0001" },
  { id: 2, name: "Consultorio Psicológico Nuevo Horizonte", department: "Santa Cruz", city: "Santa Cruz de la Sierra", zone: "Equipetrol", hours: "Lun–Sáb, 9:00–19:00", services: ["Psicología"], cost: "Bajo costo", phone: "+591 3 000-0002" },
  { id: 3, name: "Hospital Regional del Este", department: "Santa Cruz", city: "Santa Cruz de la Sierra", zone: "Zona Este", hours: "Abierto 24 horas", services: ["Hospital", "Atención de emergencia", "Psiquiatría"], cost: "Gratuito", phone: "+591 3 000-0003" },
  { id: 4, name: "Clínica de Salud Mental Renacer", department: "Santa Cruz", city: "Santa Cruz de la Sierra", zone: "Zona Sur", hours: "Lun–Vie, 8:00–18:00", services: ["Psiquiatría", "Psicología"], cost: "Privado", phone: "+591 3 000-0004" },
  { id: 5, name: "Centro de Escucha Joven", department: "Santa Cruz", city: "Santa Cruz de la Sierra", zone: "Plan Tres Mil", hours: "Lun–Vie, 14:00–20:00", services: ["Psicología"], cost: "Gratuito", phone: "+591 3 000-0005" },
  { id: 6, name: "Posta de Salud Villa 1º de Mayo", department: "Santa Cruz", city: "Santa Cruz de la Sierra", zone: "Villa 1º de Mayo", hours: "Lun–Vie, 7:00–13:00", services: ["Centro de salud"], cost: "Gratuito", phone: "+591 3 000-0006" },
  { id: 7, name: "Instituto de Psiquiatría La Paz", department: "La Paz", city: "La Paz", zone: "Miraflores", hours: "Lun–Vie, 8:00–16:00", services: ["Psiquiatría", "Hospital"], cost: "Bajo costo", phone: "+591 2 000-0007" },
  { id: 8, name: "Centro Universitario de Bienestar Emocional", department: "Cochabamba", city: "Cochabamba", zone: "Cala Cala", hours: "Lun–Vie, 9:00–17:00", services: ["Psicología"], cost: "Gratuito", phone: "+591 4 000-0008" },
  { id: 9, name: "Centro de Atención Inmediata Municipal", department: "Santa Cruz", city: "Santa Cruz de la Sierra", zone: "Centro", hours: "Abierto 24 horas", services: ["Atención de emergencia"], cost: "Gratuito", phone: "+591 800-00-0009" },
];

function centerTags(center) {
  const tags = [...center.services];
  if (center.cost === "Gratuito") tags.push("Atención gratuita");
  if (center.cost === "Bajo costo") tags.push("Atención de bajo costo");
  return tags;
}

const ATTENTION_TYPES = [
  "Psicología", "Psiquiatría", "Centro de salud", "Hospital",
  "Atención de emergencia", "Atención gratuita", "Atención de bajo costo",
];

const DONT_KNOW_OPTIONS = [
  { id: "never", label: "Nunca he recibido atención psicológica.", guidance: "Está bien empezar. Conversar con un/a psicólogo/a general es un buen primer paso, sin que eso signifique que algo está \"mal\" contigo.", ctaLabel: "Buscar psicólogos cerca de ti", route: "findhelp", filterType: "Psicología" },
  { id: "psych", label: "Creo que necesito un psicólogo.", guidance: "Los psicólogos ayudan a través de la conversación y de herramientas prácticas para manejar emociones, pensamientos y comportamientos.", ctaLabel: "Buscar atención psicológica", route: "findhelp", filterType: "Psicología" },
  { id: "psychiatrist", label: "Creo que necesito un psiquiatra.", guidance: "Los psiquiatras son médicos que pueden evaluar si un tratamiento adicional podría ayudarte, además de ofrecer seguimiento clínico.", ctaLabel: "Buscar atención psiquiátrica", route: "findhelp", filterType: "Psiquiatría" },
  { id: "crisis", label: "Estoy teniendo una crisis.", guidance: "Tu seguridad es lo más importante ahora mismo. Vamos a la pantalla de apoyo inmediato.", ctaLabel: "Ir a apoyo inmediato", route: "safety" },
  { id: "cost", label: "Necesito ayuda pero no puedo pagar una consulta.", guidance: "Existen centros que ofrecen atención gratuita o de bajo costo. Puedes filtrar por ese tipo de atención.", ctaLabel: "Ver atención gratuita", route: "findhelp", filterType: "Atención gratuita" },
  { id: "helping", label: "Estoy ayudando a otra persona.", guidance: "Acompañar a alguien también puede ser difícil. Escuchar sin juzgar y ayudarle a encontrar apoyo profesional ya es de mucha ayuda.", ctaLabel: "Ver cómo ayudar a un amigo", route: "education" },
  { id: "unsure", label: "No estoy seguro/a.", guidance: "No pasa nada por no tener claridad todavía. Una autoevaluación orientativa puede ayudarte a entender mejor lo que sientes.", ctaLabel: "Iniciar evaluación", route: "screening" },
];

const EDUCATION_ARTICLES = [
  { id: "ansiedad", title: "¿Qué es la ansiedad?", Icon: Brain, teaser: "Una respuesta natural del cuerpo ante la incertidumbre.", body: "La ansiedad es una reacción natural del cuerpo frente a situaciones que percibimos como inciertas o amenazantes. En dosis moderadas incluso puede ayudarte a estar alerta. El punto de atención llega cuando aparece con mucha frecuencia, es difícil de controlar o interfiere con tu día a día; ahí vale la pena conversarlo con alguien." },
  { id: "depresion", title: "¿Qué es la depresión?", Icon: Heart, teaser: "Más que \"estar triste\": afecta energía, sueño y ánimo.", body: "La depresión no es simplemente \"estar triste un día\". Es un conjunto de cambios sostenidos en el ánimo, la energía, el sueño o el interés por las cosas, que dura semanas y afecta la vida cotidiana. No es falta de voluntad ni algo que se \"supera solo pensando positivo\"; es una condición que mejora con apoyo adecuado." },
  { id: "cuando-ayuda", title: "¿Cuándo debería pedir ayuda?", Icon: Compass, teaser: "Señales que indican que ya es momento de hablarlo.", body: "Puedes considerar buscar apoyo cuando lo que sientes dura varias semanas, te cuesta hacer tus actividades habituales, notas cambios en el sueño o el apetito, o simplemente sientes que ya no puedes con esto solo/a. Pedir ayuda temprano no es un signo de debilidad: es una forma de cuidarte." },
  { id: "psicologo", title: "¿Qué hace un psicólogo?", Icon: Users, teaser: "Acompaña a través de la conversación y herramientas prácticas.", body: "Un psicólogo te ayuda a entender lo que sientes y piensas, y te ofrece herramientas prácticas para manejar emociones, hábitos y relaciones. Las sesiones son un espacio confidencial de conversación, sin juicios, enfocado en tu bienestar." },
  { id: "psiquiatra", title: "¿Qué hace un psiquiatra?", Icon: ShieldCheck, teaser: "Médico especializado en salud mental.", body: "Un psiquiatra es un médico especializado en salud mental. Puede evaluar tu situación desde una mirada clínica y, si corresponde, acompañar un tratamiento junto a otros profesionales. Muchas veces psicólogos y psiquiatras trabajan en conjunto." },
  { id: "urgencias", title: "¿Cuándo acudir a urgencias?", Icon: AlertTriangle, teaser: "Si hay riesgo para tu vida o la de alguien más, no esperes.", body: "Si tú u otra persona corre un riesgo inmediato —por ejemplo, pensamientos de hacerse daño con un plan concreto— no esperes: busca atención de emergencia de inmediato o acude con alguien de confianza a un centro de salud. La rapidez de la atención puede marcar la diferencia." },
  { id: "mitos", title: "Mitos sobre salud mental", Icon: Info, teaser: "\"Es solo falta de voluntad\" y otras ideas equivocadas.", body: "Algunos mitos comunes: \"es solo falta de voluntad\", \"pedir ayuda es de débiles\" o \"si sonrío está todo bien\". Ninguno es cierto. La salud mental es parte de la salud general, se ve afectada por muchos factores y buscar apoyo profesional es una decisión responsable, no una señal de debilidad." },
  { id: "amigo", title: "Cómo ayudar a un amigo", Icon: MessageCircle, teaser: "Escuchar sin juzgar ya hace una diferencia.", body: "Escucha sin juzgar ni minimizar lo que siente. Evita frases como \"eso no es para tanto\". Pregúntale directamente cómo está y si necesita ayuda para buscar apoyo profesional. Si notas señales de riesgo, acompáñalo a buscar ayuda y, si es urgente, no lo dejes solo/a." },
];

/* ---------------------------------------------------------------------
   COMPONENTES DE UI
--------------------------------------------------------------------- */
function Disclaimer({ compact }) {
  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border ${compact ? "p-3" : "p-4"}`}
      style={{ background: C.bgAlt, borderColor: C.border }}
    >
      <Info size={compact ? 16 : 18} style={{ color: C.textSoft, marginTop: 2, flexShrink: 0 }} />
      <p className={compact ? "text-xs" : "text-sm"} style={{ color: C.textSoft }}>
        Esta plataforma no realiza diagnósticos médicos. Su objetivo es brindar orientación y
        facilitar el acceso a profesionales de salud mental.
      </p>
    </div>
  );
}

function PrimaryButton({ children, onClick, icon: IconEl, tone = "primary", full, type = "button" }) {
  const tones = {
    primary: { bg: C.primary, fg: "#FFFFFF" },
    honey: { bg: C.honey, fg: "#FFFFFF" },
    brick: { bg: C.brick, fg: "#FFFFFF" },
    outline: { bg: "transparent", fg: C.primary },
  };
  const t = tones[tone] || tones.primary;
  return (
    <button
      type={type}
      onClick={onClick}
      className={`mente-focus inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-transform active:scale-[0.98] hover:opacity-90 ${full ? "w-full" : ""}`}
      style={{
        background: t.bg,
        color: t.fg,
        border: tone === "outline" ? `1.5px solid ${C.primary}` : "none",
      }}
    >
      {children}
      {IconEl ? <IconEl size={16} /> : null}
    </button>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: C.primary, letterSpacing: "0.14em" }}>
      {children}
    </p>
  );
}

function Navbar({ page, goTo, menuOpen, setMenuOpen }) {
  return (
    <header className="sticky top-0 z-30 border-b backdrop-blur" style={{ background: "rgba(246,248,246,0.92)", borderColor: C.border }}>
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
        <button
          className="mente-focus flex items-center gap-2 rounded-full"
          onClick={() => goTo("home")}
          aria-label="Ir al inicio de MENTE"
        >
          <span className="relative flex h-8 w-8 items-center justify-center">
            <span className="absolute h-8 w-8 rounded-full mente-breathe" style={{ background: C.primarySoft }} />
            <span className="relative h-3.5 w-3.5 rounded-full" style={{ background: C.primary }} />
          </span>
          <span className="mente-display text-xl font-semibold" style={{ color: C.primaryDark }}>MENTE</span>
        </button>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => goTo(item.key)}
              className="mente-focus rounded-full px-4 py-2 text-sm font-medium transition-colors"
              style={{
                color: page === item.key ? C.primaryDark : C.textSoft,
                background: page === item.key ? C.primarySoft : "transparent",
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button
          className="mente-focus md:hidden rounded-full p-2"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={22} color={C.primaryDark} /> : <Menu size={22} color={C.primaryDark} />}
        </button>
      </div>

      {menuOpen && (
        <nav className="md:hidden border-t px-5 pb-4 pt-2 flex flex-col gap-1" style={{ borderColor: C.border }}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => goTo(item.key)}
              className="mente-focus rounded-xl px-4 py-3 text-left text-sm font-medium"
              style={{
                color: page === item.key ? C.primaryDark : C.textSoft,
                background: page === item.key ? C.primarySoft : "transparent",
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t px-5 py-8 text-center" style={{ borderColor: C.border }}>
      <p className="text-sm font-medium" style={{ color: C.textSoft }}>
        MENTE — Proyecto universitario de Medicina y Atención Primaria de Salud
      </p>
      <p className="mx-auto mt-2 max-w-md text-xs" style={{ color: C.textSoft }}>
        MENTE no reemplaza la evaluación, el diagnóstico ni el tratamiento realizado por
        profesionales de salud. Prototipo académico — datos de contacto y centros son DEMO.
      </p>
    </footer>
  );
}

function ProgressBar({ current, total }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center justify-between text-xs font-semibold" style={{ color: C.textSoft }}>
        <span>Pregunta {current} de {total}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: C.bgAlt }}>
        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, background: C.primary }} />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   PÁGINAS
--------------------------------------------------------------------- */
function HomePage({ goTo, startScreening, goToSafety }) {
  return (
    <div>
      <section className="relative overflow-hidden px-5 pt-14 pb-12 text-center">
        <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center">
          <span className="mente-breathe h-40 w-40 rounded-full blur-2xl" style={{ background: C.primarySoft }} />
        </div>
        <div className="relative mx-auto max-w-xl">
          <span className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center">
            <span className="mente-breathe absolute h-16 w-16 rounded-full" style={{ background: C.primarySoft }} />
            <span className="relative h-6 w-6 rounded-full" style={{ background: C.primary }} />
          </span>
          <h1 className="mente-display text-4xl font-semibold leading-tight sm:text-5xl" style={{ color: C.primaryDark }}>
            MENTE
          </h1>
          <p className="mente-display mt-3 text-xl sm:text-2xl" style={{ color: C.text }}>
            Entender cómo te sientes es un primer paso.
          </p>
          <p className="mx-auto mt-4 max-w-md text-base" style={{ color: C.textSoft }}>
            Obtén orientación inicial sobre tu bienestar emocional y descubre cuándo y dónde
            puedes buscar ayuda profesional.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <PrimaryButton onClick={startScreening} icon={ArrowRight}>Quiero saber cómo estoy</PrimaryButton>
            <PrimaryButton onClick={() => goTo("findhelp")} tone="outline" icon={MapPin}>Necesito encontrar ayuda</PrimaryButton>
          </div>
          <div className="mt-3">
            <button
              onClick={goToSafety}
              className="mente-focus inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
              style={{ color: C.brick }}
            >
              <AlertTriangle size={16} /> Estoy en una crisis
            </button>
          </div>

          <div className="mt-9 text-left">
            <Disclaimer />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 pb-16">
        <SectionLabel>Cómo funciona</SectionLabel>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { n: "01", title: "Orientarte", desc: "Un cuestionario breve y sencillo sobre cómo te has sentido últimamente.", Icon: Compass },
            { n: "02", title: "Entender tu resultado", desc: "Una lectura orientativa, nunca un diagnóstico, explicada en lenguaje simple.", Icon: Brain },
            { n: "03", title: "Conectar con ayuda", desc: "Te acercamos a servicios reales de salud mental cerca de ti.", Icon: Users },
          ].map((s) => (
            <div key={s.n} className="rounded-2xl border p-5" style={{ background: C.card, borderColor: C.border }}>
              <div className="mb-3 flex items-center justify-between">
                <span className="mente-display text-2xl" style={{ color: C.primarySoft }}>{s.n}</span>
                <s.Icon size={20} style={{ color: C.primary }} />
              </div>
              <p className="font-semibold" style={{ color: C.text }}>{s.title}</p>
              <p className="mt-1 text-sm" style={{ color: C.textSoft }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ConcernStep({ concerns, toggleConcern, onContinue }) {
  return (
    <div className="mx-auto max-w-xl px-5 py-12">
      <SectionLabel>Antes de empezar</SectionLabel>
      <h2 className="mente-display text-2xl font-semibold" style={{ color: C.primaryDark }}>
        ¿Qué te preocupa principalmente?
      </h2>
      <p className="mt-2 text-sm" style={{ color: C.textSoft }}>Puedes elegir más de una opción.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {CONCERN_OPTIONS.map((opt) => {
          const active = concerns.includes(opt);
          return (
            <button
              key={opt}
              onClick={() => toggleConcern(opt)}
              className="mente-focus rounded-full border px-4 py-2 text-sm font-medium transition-colors"
              style={{
                borderColor: active ? C.primary : C.border,
                background: active ? C.primarySoft : C.card,
                color: active ? C.primaryDark : C.text,
              }}
              aria-pressed={active}
            >
              {opt}
            </button>
          );
        })}
      </div>

      <div className="mt-8">
        <PrimaryButton onClick={onContinue} icon={ChevronRight} full>Continuar</PrimaryButton>
      </div>
    </div>
  );
}

function SymptomStep({ index, value, onAnswer, onBack }) {
  const stepNumber = index + 1;
  return (
    <div className="mx-auto max-w-xl px-5 py-12">
      <ProgressBar current={stepNumber} total={10} />
      <p className="mb-3 text-xs font-semibold" style={{ color: C.textSoft }}>
        Herramienta de orientación — no es un diagnóstico
      </p>
      <h2 className="mente-display text-2xl font-semibold leading-snug" style={{ color: C.primaryDark }}>
        {SYMPTOM_QUESTIONS[index]}
      </h2>

      <div className="mt-6 flex flex-col gap-3">
        {LIKERT_OPTIONS.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.label}
              onClick={() => onAnswer(opt.value)}
              className="mente-focus flex items-center justify-between rounded-2xl border px-5 py-4 text-left text-sm font-medium transition-colors"
              style={{
                borderColor: active ? C.primary : C.border,
                background: active ? C.primarySoft : C.card,
                color: C.text,
              }}
            >
              {opt.label}
              {active ? <CheckCircle2 size={18} style={{ color: C.primary }} /> : null}
            </button>
          );
        })}
      </div>

      <button onClick={onBack} className="mente-focus mt-6 inline-flex items-center gap-1 text-sm font-semibold" style={{ color: C.textSoft }}>
        <ChevronLeft size={16} /> Atrás
      </button>
    </div>
  );
}

function SafetyStep({ onAnswer, onBack }) {
  return (
    <div className="mx-auto max-w-xl px-5 py-12">
      <ProgressBar current={10} total={10} />
      <p className="mb-3 text-xs font-semibold" style={{ color: C.textSoft }}>
        Herramienta de orientación — no es un diagnóstico
      </p>
      <h2 className="mente-display text-2xl font-semibold leading-snug" style={{ color: C.primaryDark }}>
        {SAFETY_QUESTION}
      </h2>

      <div className="mt-6 flex flex-col gap-3">
        {SAFETY_OPTIONS.map((opt) => (
          <button
            key={opt}
            onClick={() => onAnswer(opt)}
            className="mente-focus rounded-2xl border px-5 py-4 text-left text-sm font-medium"
            style={{ borderColor: C.border, background: C.card, color: C.text }}
          >
            {opt}
          </button>
        ))}
      </div>

      <button onClick={onBack} className="mente-focus mt-6 inline-flex items-center gap-1 text-sm font-semibold" style={{ color: C.textSoft }}>
        <ChevronLeft size={16} /> Atrás
      </button>
    </div>
  );
}

function ScreeningPage({ state, actions }) {
  const { step, concerns } = state;
  if (step === 0) {
    return <ConcernStep concerns={concerns} toggleConcern={actions.toggleConcern} onContinue={actions.continueFromConcerns} />;
  }
  if (step >= 1 && step <= 9) {
    const idx = step - 1;
    return (
      <SymptomStep
        index={idx}
        value={state.answers[idx]}
        onAnswer={(v) => actions.answerSymptom(idx, v)}
        onBack={actions.back}
      />
    );
  }
  return <SafetyStep onAnswer={actions.answerSafety} onBack={actions.back} />;
}

function ResultsPage({ score, safetyAnswer, goTo, restart }) {
  const category = useMemo(() => {
    return RESULT_CATEGORIES.find((c) => score >= c.min && score <= c.max) || RESULT_CATEGORIES[0];
  }, [score]);

  return (
    <div className="mx-auto max-w-xl px-5 py-12">
      <SectionLabel>Tu resultado orientativo</SectionLabel>
      <div className="rounded-3xl border p-6" style={{ borderColor: C.border, background: category.bg }}>
        <div className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden="true">{category.emoji}</span>
          <h2 className="mente-display text-xl font-semibold" style={{ color: category.color }}>{category.title}</h2>
        </div>
        <p className="mt-3 text-sm" style={{ color: C.text }}>{category.desc}</p>

        {safetyAnswer === "Prefiero no responder" && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border px-3 py-3" style={{ borderColor: C.border, background: "rgba(255,255,255,0.6)" }}>
            <Info size={16} style={{ color: C.textSoft, marginTop: 2, flexShrink: 0 }} />
            <p className="text-xs" style={{ color: C.textSoft }}>
              Preferiste no responder una de las preguntas. Está bien no tener que compartirlo aquí,
              pero te animamos a hablarlo con un profesional o con alguien de confianza.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 rounded-2xl border p-5" style={{ borderColor: C.border, background: C.card }}>
        <p className="font-semibold" style={{ color: C.text }}>¿Qué puedes hacer ahora?</p>
        <ol className="mt-3 flex flex-col gap-2">
          {NEXT_STEPS.map((s, i) => (
            <li key={i} className="flex items-start gap-2 text-sm" style={{ color: C.textSoft }}>
              <span className="mente-display mt-0.5 text-sm font-semibold" style={{ color: C.primary }}>{i + 1}.</span>
              {s}
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <PrimaryButton onClick={() => goTo("findhelp")} icon={MapPin} full>Buscar ayuda cerca de ti</PrimaryButton>
        <PrimaryButton onClick={() => goTo("education")} tone="outline" icon={BookOpen} full>Aprender más</PrimaryButton>
      </div>
      <button onClick={restart} className="mente-focus mt-4 text-sm font-semibold" style={{ color: C.textSoft }}>
        Repetir la evaluación
      </button>

      <div className="mt-8">
        <Disclaimer compact />
      </div>
    </div>
  );
}

function SafetyPage({ goToFindHelpUrgent, goTo }) {
  const [showTalk, setShowTalk] = useState(false);
  return (
    <div className="mx-auto max-w-xl px-5 py-12">
      <div className="rounded-3xl border p-6" style={{ borderColor: C.border, background: C.brickSoft }}>
        <div className="flex items-center gap-3">
          <ShieldCheck size={26} style={{ color: C.brick }} />
          <h2 className="mente-display text-2xl font-semibold" style={{ color: C.brick }}>Necesitas apoyo ahora</h2>
        </div>
        <p className="mt-3 text-sm" style={{ color: C.text }}>
          Lo que estás experimentando merece atención. Esta plataforma no puede evaluar una
          crisis por sí sola.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <PrimaryButton onClick={goToFindHelpUrgent} tone="brick" icon={Phone} full>Buscar atención urgente</PrimaryButton>
        <PrimaryButton onClick={() => goTo("education")} tone="outline" icon={BookOpen} full>Ver recursos de ayuda</PrimaryButton>
        <PrimaryButton onClick={() => setShowTalk((v) => !v)} tone="outline" icon={MessageCircle} full>Hablar con alguien de confianza</PrimaryButton>
      </div>

      {showTalk && (
        <div className="mt-4 rounded-2xl border p-4 text-sm" style={{ borderColor: C.border, background: C.card, color: C.textSoft }}>
          Si hay alguien cercano en quien confías —un familiar, amigo/a, profesor/a—, contarle lo
          que sientes puede aliviar el peso de pasar por esto en soledad. Si en este momento no
          tienes a alguien cerca, los recursos de ayuda también pueden orientarte sobre los
          próximos pasos.
        </div>
      )}

      <div className="mt-8 rounded-xl border border-dashed p-4" style={{ borderColor: C.border }}>
        <p className="text-xs italic" style={{ color: C.textSoft }}>
          Nota del prototipo: los números y centros mostrados están marcados como DEMO. Antes de
          cualquier uso real, deben reemplazarse por líneas de crisis y servicios de emergencia
          oficiales y verificados.
        </p>
      </div>
    </div>
  );
}

function CenterCard({ center, onSelect }) {
  return (
    <div className="rounded-2xl border p-5" style={{ borderColor: C.border, background: C.card }}>
      <p className="font-semibold" style={{ color: C.text }}>{center.name} — <span style={{ color: C.textSoft, fontWeight: 500 }}>DEMO</span></p>
      <div className="mt-3 flex flex-col gap-1.5 text-sm" style={{ color: C.textSoft }}>
        <span className="flex items-center gap-2"><MapPin size={15} /> {center.zone}, {center.city}</span>
        <span className="flex items-center gap-2"><Clock size={15} /> {center.hours}</span>
        <span className="flex items-center gap-2"><Brain size={15} /> {center.services.join(", ")}</span>
        <span className="flex items-center gap-2"><DollarSign size={15} /> {center.cost}</span>
        <span className="flex items-center gap-2"><Phone size={15} /> {center.phone} (DEMO)</span>
      </div>
      <button
        onClick={() => onSelect(center)}
        className="mente-focus mt-4 inline-flex items-center gap-1 text-sm font-semibold"
        style={{ color: C.primary }}
      >
        Ver información <ChevronRight size={15} />
      </button>
    </div>
  );
}

function Modal({ onClose, children }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/30 p-0 sm:items-center sm:p-5" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-3xl p-6 sm:rounded-3xl"
        style={{ background: C.card }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end">
          <button onClick={onClose} className="mente-focus rounded-full p-1" aria-label="Cerrar">
            <X size={20} style={{ color: C.textSoft }} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FindHelpPage({ presetType }) {
  const [department, setDepartment] = useState("Todos");
  const [zone, setZone] = useState("Todas");
  const [types, setTypes] = useState(presetType ? [presetType] : []);
  const [selected, setSelected] = useState(null);

  const departments = useMemo(() => ["Todos", ...Array.from(new Set(CENTERS.map((c) => c.department)))], []);
  const zones = useMemo(() => {
    const pool = department === "Todos" ? CENTERS : CENTERS.filter((c) => c.department === department);
    return ["Todas", ...Array.from(new Set(pool.map((c) => c.zone)))];
  }, [department]);

  const toggleType = (t) => setTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const results = useMemo(() => {
    return CENTERS.filter((c) => {
      if (department !== "Todos" && c.department !== department) return false;
      if (zone !== "Todas" && c.zone !== zone) return false;
      if (types.length > 0) {
        const tags = centerTags(c);
        if (!types.some((t) => tags.includes(t))) return false;
      }
      return true;
    });
  }, [department, zone, types]);

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <SectionLabel>Buscador DEMO</SectionLabel>
      <h2 className="mente-display text-2xl font-semibold" style={{ color: C.primaryDark }}>
        Encuentra ayuda cerca de ti
      </h2>

      <div className="mt-6 grid gap-4 rounded-2xl border p-5 sm:grid-cols-2" style={{ borderColor: C.border, background: C.card }}>
        <label className="text-sm font-medium" style={{ color: C.text }}>
          Departamento
          <select
            value={department}
            onChange={(e) => { setDepartment(e.target.value); setZone("Todas"); }}
            className="mente-focus mt-1 w-full rounded-xl border px-3 py-2 text-sm"
            style={{ borderColor: C.border, background: C.bg, color: C.text }}
          >
            {departments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>

        <label className="text-sm font-medium" style={{ color: C.text }}>
          Zona
          <select
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            className="mente-focus mt-1 w-full rounded-xl border px-3 py-2 text-sm"
            style={{ borderColor: C.border, background: C.bg, color: C.text }}
          >
            {zones.map((z) => <option key={z} value={z}>{z}</option>)}
          </select>
        </label>

        <div className="sm:col-span-2">
          <p className="text-sm font-medium" style={{ color: C.text }}>Tipo de atención</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {ATTENTION_TYPES.map((t) => {
              const active = types.includes(t);
              return (
                <button
                  key={t}
                  onClick={() => toggleType(t)}
                  className="mente-focus rounded-full border px-3 py-1.5 text-xs font-medium"
                  style={{
                    borderColor: active ? C.primary : C.border,
                    background: active ? C.primarySoft : "transparent",
                    color: active ? C.primaryDark : C.textSoft,
                  }}
                  aria-pressed={active}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 text-sm" style={{ color: C.textSoft }}>
        <Search size={15} /> {results.length} resultado{results.length === 1 ? "" : "s"} DEMO
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {results.map((c) => (
          <CenterCard key={c.id} center={c} onSelect={setSelected} />
        ))}
        {results.length === 0 && (
          <div className="sm:col-span-2 rounded-2xl border p-6 text-center text-sm" style={{ borderColor: C.border, color: C.textSoft }}>
            No hay centros DEMO que coincidan con estos filtros. Prueba ajustando la búsqueda.
          </div>
        )}
      </div>

      {selected && (
        <Modal onClose={() => setSelected(null)}>
          <p className="font-semibold" style={{ color: C.text }}>{selected.name} — DEMO</p>
          <div className="mt-3 flex flex-col gap-2 text-sm" style={{ color: C.textSoft }}>
            <span className="flex items-center gap-2"><MapPin size={15} /> {selected.zone}, {selected.city}, {selected.department}</span>
            <span className="flex items-center gap-2"><Clock size={15} /> {selected.hours}</span>
            <span className="flex items-center gap-2"><Brain size={15} /> {selected.services.join(", ")}</span>
            <span className="flex items-center gap-2"><DollarSign size={15} /> {selected.cost}</span>
            <span className="flex items-center gap-2"><Phone size={15} /> {selected.phone} (DEMO)</span>
          </div>
          <div className="mt-4 rounded-xl border border-dashed p-3 text-xs" style={{ borderColor: C.border, color: C.textSoft }}>
            Este centro es un dato de ejemplo (DEMO) para el prototipo académico. Debe reemplazarse
            por información oficial verificada antes de un uso real.
          </div>
        </Modal>
      )}
    </div>
  );
}

function DontKnowPage({ goTo, goToFindHelpWithType, goToSafety }) {
  const [selectedId, setSelectedId] = useState(null);
  const selected = DONT_KNOW_OPTIONS.find((o) => o.id === selectedId);

  const handleCta = () => {
    if (!selected) return;
    if (selected.route === "safety") goToSafety();
    else if (selected.route === "findhelp") goToFindHelpWithType(selected.filterType);
    else goTo(selected.route);
  };

  return (
    <div className="mx-auto max-w-xl px-5 py-12">
      <SectionLabel>Orientación</SectionLabel>
      <h2 className="mente-display text-2xl font-semibold" style={{ color: C.primaryDark }}>No sé dónde acudir</h2>
      <p className="mt-2 text-sm" style={{ color: C.textSoft }}>
        Cuéntanos qué necesitas y te ayudaremos a identificar qué tipo de atención podría ser
        adecuada.
      </p>

      <div className="mt-6 flex flex-col gap-2">
        {DONT_KNOW_OPTIONS.map((opt) => {
          const active = selectedId === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setSelectedId(opt.id)}
              className="mente-focus rounded-2xl border px-5 py-4 text-left text-sm font-medium"
              style={{
                borderColor: active ? C.primary : C.border,
                background: active ? C.primarySoft : C.card,
                color: C.text,
              }}
              aria-pressed={active}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="mt-6 rounded-2xl border p-5" style={{ borderColor: C.border, background: C.card }}>
          <p className="text-sm" style={{ color: C.text }}>{selected.guidance}</p>
          {selected.ctaLabel && (
            <div className="mt-4">
              <PrimaryButton onClick={handleCta} icon={ArrowRight}>{selected.ctaLabel}</PrimaryButton>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EducationPage() {
  const [selected, setSelected] = useState(null);
  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <SectionLabel>Educación</SectionLabel>
      <h2 className="mente-display text-2xl font-semibold" style={{ color: C.primaryDark }}>
        Aprende sobre tu salud mental
      </h2>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {EDUCATION_ARTICLES.map((a) => (
          <button
            key={a.id}
            onClick={() => setSelected(a)}
            className="mente-focus flex items-start gap-3 rounded-2xl border p-5 text-left"
            style={{ borderColor: C.border, background: C.card }}
          >
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full" style={{ background: C.primarySoft }}>
              <a.Icon size={18} style={{ color: C.primary }} />
            </span>
            <span>
              <span className="block font-semibold" style={{ color: C.text }}>{a.title}</span>
              <span className="mt-1 block text-sm" style={{ color: C.textSoft }}>{a.teaser}</span>
            </span>
          </button>
        ))}
      </div>

      {selected && (
        <Modal onClose={() => setSelected(null)}>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: C.primarySoft }}>
              <selected.Icon size={18} style={{ color: C.primary }} />
            </span>
            <p className="mente-display text-lg font-semibold" style={{ color: C.primaryDark }}>{selected.title}</p>
          </div>
          <p className="mt-4 text-sm leading-relaxed" style={{ color: C.text }}>{selected.body}</p>
        </Modal>
      )}
    </div>
  );
}

function AboutPage({ goTo }) {
  const objectives = [
    { title: "Orientar", desc: "Ayudar a las personas a comprender mejor lo que están experimentando.", Icon: Compass },
    { title: "Detectar señales de alerta", desc: "Identificar situaciones que podrían justificar una evaluación profesional.", Icon: AlertTriangle },
    { title: "Conectar", desc: "Facilitar la búsqueda de servicios de salud mental.", Icon: Users },
  ];
  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <SectionLabel>Sobre el proyecto</SectionLabel>
      <h2 className="mente-display text-2xl font-semibold" style={{ color: C.primaryDark }}>¿Qué es MENTE?</h2>
      <p className="mt-3 text-base" style={{ color: C.text }}>
        MENTE es un proyecto universitario orientado a facilitar el reconocimiento temprano de
        dificultades relacionadas con la salud mental y mejorar el acceso a información y
        servicios profesionales.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {objectives.map((o) => (
          <div key={o.title} className="rounded-2xl border p-5" style={{ borderColor: C.border, background: C.card }}>
            <span className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: C.primarySoft }}>
              <o.Icon size={18} style={{ color: C.primary }} />
            </span>
            <p className="mt-3 font-semibold" style={{ color: C.text }}>{o.title}</p>
            <p className="mt-1 text-sm" style={{ color: C.textSoft }}>{o.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <PrimaryButton onClick={() => goTo("screening")} icon={ArrowRight}>Comenzar una evaluación orientativa</PrimaryButton>
      </div>

      <div className="mt-8">
        <Disclaimer />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   APP
--------------------------------------------------------------------- */
export default function App() {
  const [page, setPage] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);

  const [concerns, setConcerns] = useState([]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [safetyAnswer, setSafetyAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [findHelpType, setFindHelpType] = useState(null);

  const goTo = (key) => {
    setPage(key);
    setMenuOpen(false);
    if (key === "screening") resetScreening();
    if (key !== "findhelp") setFindHelpType(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetScreening = () => {
    setConcerns([]);
    setStep(0);
    setAnswers({});
    setSafetyAnswer(null);
  };

  const startScreening = () => {
    resetScreening();
    setPage("screening");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToSafety = () => {
    setPage("safety");
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToFindHelpWithType = (type) => {
    setFindHelpType(type || null);
    setPage("findhelp");
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleConcern = (opt) => {
    setConcerns((prev) => (prev.includes(opt) ? prev.filter((c) => c !== opt) : [...prev, opt]));
  };

  const continueFromConcerns = () => setStep(1);

  const answerSymptom = (idx, value) => {
    const next = { ...answers, [idx]: value };
    setAnswers(next);
    if (idx < 8) {
      setStep(idx + 2);
    } else {
      setStep(10);
    }
  };

  const answerSafety = (value) => {
    setSafetyAnswer(value);
    if (value === "Sí") {
      goToSafety();
      return;
    }
    const total = Object.values(answers).reduce((a, b) => a + b, 0);
    setScore(total);
    setPage("results");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const back = () => setStep((s) => Math.max(0, s - 1));

  let content;
  if (page === "home") {
    content = <HomePage goTo={goTo} startScreening={startScreening} goToSafety={goToSafety} />;
  } else if (page === "screening") {
    content = (
      <ScreeningPage
        state={{ step, concerns, answers }}
        actions={{ toggleConcern, continueFromConcerns, answerSymptom, answerSafety, back }}
      />
    );
  } else if (page === "results") {
    content = <ResultsPage score={score} safetyAnswer={safetyAnswer} goTo={goTo} restart={startScreening} />;
  } else if (page === "safety") {
    content = <SafetyPage goToFindHelpUrgent={() => goToFindHelpWithType("Atención de emergencia")} goTo={goTo} />;
  } else if (page === "findhelp") {
    content = <FindHelpPage presetType={findHelpType} />;
  } else if (page === "dontknow") {
    content = <DontKnowPage goTo={goTo} goToFindHelpWithType={goToFindHelpWithType} goToSafety={goToSafety} />;
  } else if (page === "education") {
    content = <EducationPage />;
  } else if (page === "about") {
    content = <AboutPage goTo={goTo} />;
  }

  return (
    <div className="mente-root min-h-screen">
      <style>{FONTS}</style>
      <Navbar page={page} goTo={goTo} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main>{content}</main>
      {page === "home" && (
        <div className="mx-auto max-w-4xl px-5 pb-4 text-center">
          <button onClick={() => goTo("dontknow")} className="mente-focus text-sm font-semibold underline" style={{ color: C.primary }}>
            ¿No sabes por dónde empezar? Ve a "No sé dónde acudir"
          </button>
        </div>
      )}
      <Footer />
    </div>
  );
}
