import React, { useState, useEffect, useRef } from "react";
import {
  Menu, X, ArrowLeft, ArrowRight, ChevronRight, Check, Plus, Trash2, Pencil,
  Save, AlertTriangle, ShieldAlert, Phone, LifeBuoy, Brain, BookOpen,
  Wrench, MapPin, DollarSign, Lock, FileText, Wind, Sparkles, Moon,
  MessageCircle, Activity, ClipboardList, Settings, Search, Stethoscope,
  HandHeart, Home as HomeIcon, Info, Loader2, Users, GraduationCap, Building2,
} from "lucide-react";

/* =========================================================================
   SINAPSIS — plataforma de orientación y educación en salud mental
   Prototipo funcional. Ver notas "ADMIN:" para saber dónde cargar datos
   reales (profesionales, servicios, números de emergencia) antes de
   publicar. Todo el contenido educativo debe ser revisado por un
   profesional de salud mental colegiado antes de producción.
   ========================================================================= */

const C = {
  bg: "#F5F7F3",
  card: "#FFFFFF",
  ink: "#20302B",
  inkSoft: "#57655F",
  inkFaint: "#8A968F",
  primary: "#1F4D48",
  primaryDark: "#123230",
  primarySoft: "#DCE9E5",
  border: "#DFE6E1",
  accent: "#8B5A72",
  accentSoft: "#F1E4EA",
  urgent: "#B23A32",
  urgentSoft: "#FBEAE8",
  sage: "#5E8C6A",
  sageSoft: "#E7F0E7",
  gold: "#A9791F",
  goldSoft: "#F5ECD7",
  severe: "#9A4B34",
  severeSoft: "#F3E3DB",
};

const FONT_IMPORT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Figtree:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap');
:root{ --ring-color: ${C.primary}; }
.font-display{ font-family:'Fraunces', serif; }
.font-body{ font-family:'Figtree', sans-serif; }
.font-mono{ font-family:'IBM Plex Mono', monospace; }
.mente-focus:focus-visible{ outline:3px solid ${C.primary}; outline-offset:2px; }
@keyframes breathe-in { from{ transform:scale(0.72);} to{ transform:scale(1);} }
@keyframes breathe-out { from{ transform:scale(1);} to{ transform:scale(0.72);} }
@keyframes pulse-slow { 0%,100%{ opacity:0.55;} 50%{ opacity:0.9;} }
.pulse-slow{ animation: pulse-slow 4.5s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce){
  .pulse-slow{ animation:none; }
  .breathe-anim{ transition:none !important; }
}
`;

function cx(...a) { return a.filter(Boolean).join(" "); }

/* --------------------------- Navegación --------------------------- */
const NAV_ITEMS = [
  { id: "home", label: "Inicio" },
  { id: "eval", label: "Evaluación" },
  { id: "library", label: "Salud mental" },
  { id: "tools", label: "Herramientas" },
  { id: "directory", label: "Buscar ayuda" },
];

/* --------------------------- Seguridad --------------------------- */
const SAFETY_QUESTIONS = [
  {
    id: "s1",
    text: "En las últimas dos semanas, ¿has tenido pensamientos de que no vale la pena vivir o de que estarías mejor muerto/a?",
  },
  {
    id: "s2",
    text: "¿Has tenido pensamientos de hacerte daño a ti mismo/a de alguna manera?",
  },
  {
    id: "s3",
    text: "¿Has pensado en quitarte la vida o tienes en este momento un plan para hacerlo?",
  },
  {
    id: "s4",
    text: "¿Sientes que ahora mismo estás en peligro, o que podrías hacerle daño a otra persona?",
  },
];

/* --------------------------- PHQ-9 / GAD-7 --------------------------- */
const FREQ_OPTIONS = [
  { value: 0, label: "Nunca" },
  { value: 1, label: "Varios días" },
  { value: 2, label: "Más de la mitad de los días" },
  { value: 3, label: "Casi todos los días" },
];

const IMPACT_OPTIONS = [
  { value: 0, label: "Nada difícil" },
  { value: 1, label: "Algo difícil" },
  { value: 2, label: "Muy difícil" },
  { value: 3, label: "Extremadamente difícil" },
];

const PHQ9_ITEMS = [
  "Poco interés o placer en hacer las cosas",
  "Sentirte decaído/a, deprimido/a o sin esperanza",
  "Dificultad para dormirte, mantenerte dormido/a, o dormir demasiado",
  "Sentirte cansado/a o con poca energía",
  "Poco apetito, o comer en exceso",
  "Sentirte mal contigo mismo/a, o sentir que has fallado o que quedaste mal contigo mismo/a o tu familia",
  "Dificultad para concentrarte, por ejemplo al leer o ver televisión",
  "Moverte o hablar tan despacio que otros lo notarían, o lo contrario: estar tan inquieto/a que te mueves mucho más de lo habitual",
  "Pensamientos de que estarías mejor muerto/a, o de hacerte daño de alguna manera",
];

const GAD7_ITEMS = [
  "Sentirte nervioso/a, ansioso/a o con los nervios de punta",
  "No poder dejar de preocuparte o controlar la preocupación",
  "Preocuparte demasiado por diferentes cosas",
  "Dificultad para relajarte",
  "Estar tan inquieto/a que te resulta difícil quedarte quieto/a",
  "Irritarte o enojarte con facilidad",
  "Sentir miedo, como si algo terrible pudiera pasar",
];

function classifyPHQ9(score) {
  if (score <= 4) return { label: "Mínimo", tone: "sage" };
  if (score <= 9) return { label: "Leve", tone: "sage" };
  if (score <= 14) return { label: "Moderado", tone: "gold" };
  if (score <= 19) return { label: "Moderadamente severo", tone: "severe" };
  return { label: "Severo", tone: "severe" };
}
function classifyGAD7(score) {
  if (score <= 4) return { label: "Mínimo", tone: "sage" };
  if (score <= 9) return { label: "Leve", tone: "sage" };
  if (score <= 14) return { label: "Moderado", tone: "gold" };
  return { label: "Severo", tone: "severe" };
}

function recommendationFor({ phq, gad, impact, risk }) {
  if (risk) {
    return {
      tone: "urgent",
      title: "Busca ayuda urgente",
      text: "Tus respuestas indican señales que ameritan apoyo humano inmediato. Ve a la sección de ayuda urgente antes de continuar.",
    };
  }
  const worst = [phq.tone, gad.tone].includes("severe")
    ? "severe"
    : [phq.tone, gad.tone].includes("gold")
    ? "gold"
    : "sage";
  if (worst === "severe") {
    return {
      tone: "severe",
      title: "Te recomendamos buscar una evaluación profesional",
      text: "El nivel de síntomas identificado es elevado. Un profesional de salud mental puede evaluar tu situación con más profundidad y orientarte sobre los siguientes pasos.",
    };
  }
  if (worst === "gold" || impact >= 2) {
    return {
      tone: "gold",
      title: "Podría ser recomendable hablar con un profesional",
      text: "Especialmente si estos síntomas están interfiriendo con tu vida cotidiana, trabajo, estudios o relaciones. No necesitas esperar a que empeoren para pedir una consulta.",
    };
  }
  return {
    tone: "sage",
    title: "Puedes comenzar por aprender y cuidarte",
    text: "Por ahora, los síntomas identificados son bajos. Puede ayudarte aprender más sobre lo que sientes y usar algunas herramientas de autocuidado. Si algo cambia, esta evaluación siempre está disponible de nuevo.",
  };
}

/* --------------------------- Biblioteca de artículos --------------------------- */
const ARTICLES = [
  {
    slug: "ansiedad",
    title: "Ansiedad",
    icon: "wind",
    short: "Esa sensación de alerta, nervios o preocupación constante.",
    sections: {
      queEs: ["La ansiedad es una respuesta natural del cuerpo ante una amenaza percibida, real o imaginada.", "Prepara al cuerpo para reaccionar: por eso aumenta el ritmo cardíaco y la atención."],
      comoSentirse: ["Nervios, tensión, sensación de alerta constante.", "Preocupación que cuesta controlar.", "A veces una sensación física de opresión en el pecho o el estómago."],
      sintomasEmocionales: ["Inquietud o sensación de \"borde\".", "Miedo difícil de explicar.", "Irritabilidad."],
      sintomasCognitivos: ["Preocupación excesiva y difícil de detener.", "Anticipar lo peor.", "Dificultad para concentrarte."],
      sintomasFisicos: ["Tensión muscular, dolor de cabeza.", "Palpitaciones, sudoración.", "Molestias digestivas."],
      cambiosConductuales: ["Evitar situaciones que generan ansiedad.", "Pedir tranquilidad a otros de forma repetida.", "Dificultad para relajarte incluso en descanso."],
      reaccionNormal: ["Sentir ansiedad antes de un examen, una entrevista o un evento importante es una reacción normal y esperable.", "Suele bajar cuando la situación termina."],
      cuandoProblema: ["Cuando aparece sin una causa clara o es desproporcionada a la situación.", "Cuando es difícil de controlar y se mantiene la mayoría de los días.", "Cuando empieza a limitar tu vida diaria."],
      cuandoConsultar: ["Si la ansiedad interfiere con tu trabajo, estudios o relaciones.", "Si sientes que no puedes controlarla por tu cuenta.", "Si se acompaña de ataques de pánico frecuentes."],
      tratamientos: ["Terapia cognitivo-conductual (TCC), con buena evidencia para ansiedad.", "En algunos casos, tratamiento psiquiátrico combinado con psicoterapia.", "Técnicas de exposición gradual, guiadas por un profesional."],
      herramientas: ["respiracion", "grounding", "mindfulness", "manejo-estres"],
      evitar: ["Evitar por completo todas las situaciones que generan ansiedad (mantiene el problema).", "Usar alcohol u otras sustancias para calmarla.", "Exponerte de forma intensa y sin guía a lo que temes."],
      urgente: ["Si la ansiedad se acompaña de pensamientos de hacerte daño.", "Si tienes síntomas físicos intensos que no puedes explicar (revisa también atención médica)."],
      fuentes: ["Organismos de salud pública y guías clínicas de acceso general sobre trastornos de ansiedad.", "Contenido pendiente de revisión por un profesional de salud mental colegiado antes de publicación."],
    },
  },
  {
    slug: "depresion",
    title: "Depresión",
    icon: "cloud",
    short: "Cuando la tristeza, el vacío o la falta de energía se instalan por semanas.",
    sections: {
      queEs: ["La depresión es un estado que va más allá de la tristeza puntual: afecta el ánimo, la energía, el pensamiento y el cuerpo de forma sostenida.", "La tristeza es una emoción pasajera; la depresión suele mantenerse la mayor parte del día, casi todos los días, por dos semanas o más."],
      comoSentirse: ["Vacío, desánimo, falta de motivación.", "Cansancio incluso sin esfuerzo físico.", "Dificultad para disfrutar cosas que antes gustaban."],
      sintomasEmocionales: ["Tristeza persistente o sensación de vacío.", "Desesperanza.", "Irritabilidad (más frecuente en algunos casos)."],
      sintomasCognitivos: ["Dificultad para concentrarte o decidir.", "Autocrítica intensa, sentirte un \"fracaso\".", "Pensamientos negativos recurrentes."],
      sintomasFisicos: ["Cambios en el sueño (dormir de más o de menos).", "Cambios en el apetito o el peso.", "Fatiga o lentitud física."],
      cambiosConductuales: ["Aislarte de otras personas.", "Dejar de hacer actividades que antes disfrutabas.", "Descuido del autocuidado diario."],
      reaccionNormal: ["Sentir tristeza tras una pérdida, una decepción o un mal momento es normal y esperable.", "Suele aliviarse con el tiempo y el apoyo de otros."],
      cuandoProblema: ["Cuando el malestar se mantiene casi todos los días durante dos semanas o más.", "Cuando afecta tu funcionamiento diario: trabajo, estudios, relaciones, autocuidado.", "Cuando aparece sin una causa aparente o es desproporcionado."],
      cuandoConsultar: ["Si los síntomas persisten por varias semanas.", "Si te cuesta cumplir tus responsabilidades diarias.", "Si notas pensamientos de muerte o de hacerte daño (busca ayuda urgente)."],
      tratamientos: ["Terapia cognitivo-conductual (TCC).", "Psicoterapia interpersonal.", "En algunos casos, tratamiento psiquiátrico combinado con psicoterapia.", "Resolución de problemas y activación conductual guiadas por un profesional."],
      herramientas: ["activacion-conductual", "diario-emocional", "rutina-sueno", "resolucion-problemas"],
      evitar: ["Aislarte por completo de tus vínculos.", "Exigirte \"solo tener más fuerza de voluntad\".", "Usar alcohol u otras sustancias para manejar el ánimo."],
      urgente: ["Pensamientos de que estarías mejor muerto/a o de hacerte daño.", "Sensación de que ya no puedes seguir así: busca ayuda urgente ahora."],
      fuentes: ["Organismos de salud pública y guías clínicas de acceso general sobre depresión.", "Contenido pendiente de revisión por un profesional de salud mental colegiado antes de publicación."],
    },
  },
  {
    slug: "panico",
    title: "Ataques de pánico",
    icon: "activity",
    short: "Episodios intensos y repentinos de miedo, con síntomas físicos fuertes.",
    sections: {
      queEs: ["Un ataque de pánico es un episodio breve e intenso de miedo, con síntomas físicos que pueden sentirse como una emergencia médica.", "Suele alcanzar su punto máximo en pocos minutos."],
      comoSentirse: ["Miedo intenso y repentino.", "Sensación de estar perdiendo el control o de que algo grave está pasando.", "Deseo urgente de escapar de la situación."],
      sintomasEmocionales: ["Terror súbito.", "Sensación de irrealidad o de estar fuera de tu cuerpo (despersonalización)."],
      sintomasCognitivos: ["Miedo a morir, a perder el control o a \"volverte loco/a\".", "Dificultad para pensar con claridad durante el episodio."],
      sintomasFisicos: ["Palpitaciones, dolor u opresión en el pecho.", "Falta de aire, mareo, temblor, sudoración.", "Náuseas u hormigueo."],
      cambiosConductuales: ["Evitar lugares donde ha ocurrido un episodio antes.", "Buscar salidas o rutas de escape de forma constante.", "Depender de otra persona para sentirte seguro/a en ciertos lugares."],
      reaccionNormal: ["Un episodio aislado de mucho miedo ante una situación real de peligro puede ser una reacción normal del cuerpo."],
      cuandoProblema: ["Cuando los ataques se repiten sin un peligro real presente.", "Cuando el miedo a tener otro ataque empieza a limitar tu vida (evitar salir, trabajar, socializar)."],
      cuandoConsultar: ["Si tienes ataques de pánico recurrentes.", "Si evitas cada vez más lugares o situaciones por miedo a un ataque.", "Es importante descartar causas médicas junto a un profesional de salud."],
      tratamientos: ["Terapia cognitivo-conductual, incluyendo exposición gradual guiada por un profesional.", "En algunos casos, tratamiento psiquiátrico combinado con psicoterapia."],
      herramientas: ["respiracion", "grounding"],
      evitar: ["Evitar cada vez más lugares (mantiene el miedo).", "Exponerte de forma intensa y sin guía profesional."],
      urgente: ["Dolor de pecho intenso: en caso de duda, busca atención médica de emergencia para descartar causas cardíacas.", "Si aparecen pensamientos de hacerte daño."],
      fuentes: ["Organismos de salud pública y guías clínicas de acceso general sobre trastorno de pánico.", "Contenido pendiente de revisión por un profesional de salud mental colegiado antes de publicación."],
    },
  },
  {
    slug: "estres",
    title: "Estrés",
    icon: "activity",
    short: "La respuesta del cuerpo y la mente ante exigencias que sientes difíciles de manejar.",
    sections: {
      queEs: ["El estrés es la respuesta del cuerpo ante una exigencia o presión, real o percibida.", "En dosis moderadas puede ayudarte a rendir mejor; en exceso o de forma sostenida, desgasta."],
      comoSentirse: ["Sobrecarga, presión, sensación de no dar abasto.", "Tensión física y mental."],
      sintomasEmocionales: ["Irritabilidad, impaciencia.", "Sensación de estar al límite."],
      sintomasCognitivos: ["Dificultad para concentrarte.", "Pensamientos acelerados sobre pendientes."],
      sintomasFisicos: ["Tensión muscular, dolores de cabeza.", "Problemas de sueño o digestivos."],
      cambiosConductuales: ["Postergar tareas o, al contrario, sobrecargarte de trabajo.", "Descuidar el descanso y el autocuidado."],
      reaccionNormal: ["Sentir estrés ante una fecha límite, un examen o un cambio importante es normal.", "Suele bajar cuando la exigencia termina o se resuelve."],
      cuandoProblema: ["Cuando se vuelve constante, sin pausas de recuperación.", "Cuando empieza a afectar tu salud física, tu ánimo o tus relaciones."],
      cuandoConsultar: ["Si el estrés es prácticamente permanente.", "Si notas agotamiento físico y emocional sostenido."],
      tratamientos: ["Terapia para desarrollar estrategias de afrontamiento.", "Técnicas de manejo del tiempo y resolución de problemas."],
      herramientas: ["manejo-estres", "respiracion", "mindfulness", "resolucion-problemas"],
      evitar: ["Acumular exigencias sin pausas de descanso.", "Usar sustancias para \"aguantar\" el ritmo."],
      urgente: ["Si el estrés se acompaña de pensamientos de hacerte daño o de una crisis emocional intensa."],
      fuentes: ["Organismos de salud pública sobre manejo del estrés.", "Contenido pendiente de revisión por un profesional de salud mental colegiado antes de publicación."],
    },
  },
  {
    slug: "sueno",
    title: "Problemas de sueño",
    icon: "moon",
    short: "Dificultad para dormir bien, quedarte dormido/a o descansar de verdad.",
    sections: {
      queEs: ["Los problemas de sueño incluyen dificultad para conciliar el sueño, despertares frecuentes, dormir demasiado, o un sueño que no descansa."],
      comoSentirse: ["Cansancio incluso después de dormir.", "Frustración al no poder dormir cuando lo necesitas."],
      sintomasEmocionales: ["Irritabilidad por falta de descanso.", "Ansiedad al llegar la hora de dormir."],
      sintomasCognitivos: ["Dificultad para concentrarte durante el día.", "Pensamientos que no paran al intentar dormir."],
      sintomasFisicos: ["Fatiga, dolores de cabeza.", "Cambios en el apetito."],
      cambiosConductuales: ["Uso de pantallas hasta tarde.", "Horarios de sueño muy irregulares."],
      reaccionNormal: ["Dormir mal una noche por estrés puntual o un cambio de rutina es normal."],
      cuandoProblema: ["Cuando ocurre varias veces por semana durante semanas.", "Cuando afecta tu funcionamiento durante el día."],
      cuandoConsultar: ["Si el insomnio es persistente y no mejora con hábitos de sueño.", "Si sospechas un trastorno del sueño (por ejemplo, ronquidos con pausas respiratorias)."],
      tratamientos: ["Terapia cognitivo-conductual para el insomnio (TCC-I).", "Evaluación médica cuando se sospechan causas físicas."],
      herramientas: ["rutina-sueno", "mindfulness", "respiracion"],
      evitar: ["Cafeína o pantallas justo antes de dormir.", "Siestas largas durante el día si tienes insomnio nocturno."],
      urgente: ["Si la falta de sueño se acompaña de una crisis emocional o pensamientos de hacerte daño."],
      fuentes: ["Organismos de salud pública sobre higiene del sueño.", "Contenido pendiente de revisión por un profesional de salud mental colegiado antes de publicación."],
    },
  },
  {
    slug: "duelo",
    title: "Duelo",
    icon: "heart",
    short: "El proceso de adaptarte a una pérdida importante.",
    sections: {
      queEs: ["El duelo es la respuesta emocional natural ante una pérdida significativa: una persona, una relación, una etapa de vida."],
      comoSentirse: ["Tristeza profunda, añoranza.", "A veces alivio, culpa o enojo, todo puede coexistir."],
      sintomasEmocionales: ["Tristeza, vacío, nostalgia.", "Oleadas de emoción intensa (\"punzadas de duelo\")."],
      sintomasCognitivos: ["Dificultad para aceptar la pérdida al inicio.", "Pensar mucho en la persona o situación perdida."],
      sintomasFisicos: ["Cansancio, alteraciones del sueño o apetito."],
      cambiosConductuales: ["Necesidad de hablar de la pérdida, o al contrario, evitar el tema.", "Cambios temporales en la rutina."],
      reaccionNormal: ["El duelo, incluso intenso, es una respuesta normal y esperable tras una pérdida importante.", "No tiene un tiempo fijo: cada persona lo vive distinto."],
      cuandoProblema: ["Cuando el duelo se mantiene muy intenso por mucho tiempo e impide retomar la vida diaria.", "Cuando aparece un aislamiento severo o desesperanza sostenida."],
      cuandoConsultar: ["Si sientes que no puedes funcionar semanas después de la pérdida.", "Si el duelo se acompaña de pensamientos de hacerte daño."],
      tratamientos: ["Terapia de duelo con un profesional.", "Grupos de apoyo para personas en duelo."],
      herramientas: ["diario-emocional", "mindfulness"],
      evitar: ["Compararte con cómo \"deberías\" estar viviendo el duelo.", "Aislarte por completo del apoyo de otros."],
      urgente: ["Pensamientos de hacerte daño o de no querer seguir viviendo."],
      fuentes: ["Organismos de salud pública sobre procesos de duelo.", "Contenido pendiente de revisión por un profesional de salud mental colegiado antes de publicación."],
    },
  },
  {
    slug: "ansiedad-social",
    title: "Ansiedad social",
    icon: "users",
    short: "Miedo intenso a ser juzgado/a o evaluado/a por otras personas.",
    sections: {
      queEs: ["La ansiedad social es un miedo intenso y persistente a situaciones sociales donde podrías ser observado/a o juzgado/a por otros."],
      comoSentirse: ["Miedo a hablar en público, comer frente a otros, o iniciar conversaciones.", "Preocupación intensa antes y después de eventos sociales."],
      sintomasEmocionales: ["Vergüenza anticipada.", "Miedo a hacer el ridículo."],
      sintomasCognitivos: ["Pensar que todos notarán tu nerviosismo.", "Repasar mentalmente lo dicho una y otra vez tras el evento."],
      sintomasFisicos: ["Sonrojo, sudoración, temblor.", "Voz entrecortada, tensión muscular."],
      cambiosConductuales: ["Evitar situaciones sociales o hablar en grupo.", "Usar \"conductas de seguridad\" como evitar el contacto visual."],
      reaccionNormal: ["Sentir algo de nervios antes de hablar en público es normal y común."],
      cuandoProblema: ["Cuando el miedo lleva a evitar de forma sistemática oportunidades sociales, académicas o laborales."],
      cuandoConsultar: ["Si la ansiedad social limita tu vida académica, laboral o social de forma importante."],
      tratamientos: ["Terapia cognitivo-conductual, incluyendo exposición gradual guiada.", "Entrenamiento en habilidades sociales."],
      herramientas: ["respiracion", "grounding", "registro-pensamientos"],
      evitar: ["Evitar por completo toda situación social (mantiene el problema).", "Usar alcohol para \"soltarte\" en eventos sociales."],
      urgente: ["Si se acompaña de pensamientos de hacerte daño o aislamiento severo."],
      fuentes: ["Organismos de salud pública sobre ansiedad social.", "Contenido pendiente de revisión por un profesional de salud mental colegiado antes de publicación."],
    },
  },
  {
    slug: "autoestima",
    title: "Autoestima",
    icon: "sparkles",
    short: "Cómo te valoras a ti mismo/a y la relación que tienes contigo.",
    sections: {
      queEs: ["La autoestima es la valoración general que tienes de ti mismo/a: tu sentido de valor y capacidad."],
      comoSentirse: ["Autocrítica frecuente, sensación de no ser suficiente.", "Dificultad para reconocer tus propios logros."],
      sintomasEmocionales: ["Inseguridad, vergüenza, culpa frecuente."],
      sintomasCognitivos: ["Pensamientos del tipo \"no valgo\", \"no soy capaz\".", "Comparación constante con otros."],
      sintomasFisicos: ["Tensión asociada a la ansiedad social o al estrés."],
      cambiosConductuales: ["Dificultad para poner límites.", "Buscar aprobación constante de otros."],
      reaccionNormal: ["Tener dudas sobre ti mismo/a en algunos momentos de la vida es normal."],
      cuandoProblema: ["Cuando la autocrítica es constante y afecta decisiones importantes (relaciones, trabajo, estudios)."],
      cuandoConsultar: ["Si la baja autoestima se acompaña de tristeza persistente, ansiedad o aislamiento."],
      tratamientos: ["Terapia cognitivo-conductual centrada en el diálogo interno.", "Terapias centradas en autocompasión."],
      herramientas: ["registro-pensamientos", "diario-emocional"],
      evitar: ["Compararte constantemente con otras personas, especialmente en redes sociales."],
      urgente: ["Si aparecen pensamientos de no merecer vivir o de hacerte daño."],
      fuentes: ["Organismos de salud pública y bibliografía general sobre autoestima.", "Contenido pendiente de revisión por un profesional de salud mental colegiado antes de publicación."],
    },
  },
  {
    slug: "pensamientos-intrusivos",
    title: "Pensamientos intrusivos",
    icon: "brain",
    short: "Pensamientos no deseados, repetitivos, que generan malestar.",
    sections: {
      queEs: ["Los pensamientos intrusivos son ideas o imágenes no deseadas que aparecen de forma repetida y generan malestar, aunque no reflejan lo que la persona realmente quiere hacer."],
      comoSentirse: ["Malestar, culpa o vergüenza por tener esos pensamientos.", "Miedo a que el pensamiento signifique algo sobre ti."],
      sintomasEmocionales: ["Ansiedad, culpa, asco hacia el propio pensamiento."],
      sintomasCognitivos: ["Rumiación: repasar el pensamiento una y otra vez.", "Intentos de \"neutralizar\" el pensamiento con rituales mentales."],
      sintomasFisicos: ["Tensión asociada a la ansiedad."],
      cambiosConductuales: ["Evitar situaciones, objetos o personas relacionadas con el pensamiento.", "Rituales de comprobación o limpieza (en algunos casos)."],
      reaccionNormal: ["Casi todas las personas tienen pensamientos extraños o desagradables ocasionalmente; por sí solos no son un problema."],
      cuandoProblema: ["Cuando se repiten con mucha frecuencia y generan malestar significativo.", "Cuando llevan a rituales o evitación que ocupan tiempo importante del día."],
      cuandoConsultar: ["Si los pensamientos intrusivos ocupan gran parte de tu día o generan mucho sufrimiento."],
      tratamientos: ["Terapia cognitivo-conductual, incluyendo exposición con prevención de respuesta.", "Evaluación profesional para descartar o confirmar un trastorno obsesivo-compulsivo."],
      herramientas: ["registro-pensamientos", "mindfulness"],
      evitar: ["Intentar \"suprimir\" el pensamiento a la fuerza (suele empeorarlo).", "Realizar rituales para neutralizarlo sin guía profesional."],
      urgente: ["Si el contenido del pensamiento incluye hacerte daño a ti o a otra persona y sientes riesgo real."],
      fuentes: ["Organismos de salud pública sobre pensamientos intrusivos y TOC.", "Contenido pendiente de revisión por un profesional de salud mental colegiado antes de publicación."],
    },
  },
  {
    slug: "trauma",
    title: "Trauma",
    icon: "shield",
    short: "El impacto emocional que puede dejar vivir un evento muy difícil o peligroso.",
    sections: {
      queEs: ["El trauma es la huella emocional que puede dejar un evento vivido como muy amenazante, ya sea único o repetido."],
      comoSentirse: ["Revivir el evento en recuerdos, pesadillas o sensaciones físicas.", "Sensación de alerta constante."],
      sintomasEmocionales: ["Miedo, culpa, vergüenza, embotamiento emocional."],
      sintomasCognitivos: ["Recuerdos intrusivos del evento.", "Dificultad para confiar en los demás."],
      sintomasFisicos: ["Sobresaltos frecuentes, tensión, problemas de sueño."],
      cambiosConductuales: ["Evitar lugares, personas o temas relacionados con el evento.", "Aislamiento."],
      reaccionNormal: ["Sentir malestar intenso en los días o semanas posteriores a un evento traumático es una reacción esperable."],
      cuandoProblema: ["Cuando los síntomas persisten más de un mes y afectan tu vida diaria.", "Cuando la evitación se vuelve muy amplia."],
      cuandoConsultar: ["Siempre es razonable consultar tras un evento traumático, incluso si los síntomas parecen manejables."],
      tratamientos: ["Terapias especializadas en trauma (por ejemplo, TCC centrada en trauma, EMDR), realizadas por profesionales entrenados."],
      herramientas: ["grounding", "respiracion"],
      evitar: ["Exponerte por tu cuenta y sin guía a recuerdos muy intensos del evento.", "Aislarte por completo del apoyo social."],
      urgente: ["Si aparecen pensamientos de hacerte daño o sensación de peligro inmediato."],
      fuentes: ["Organismos de salud pública sobre trauma y estrés postraumático.", "Contenido pendiente de revisión por un profesional de salud mental colegiado antes de publicación."],
    },
  },
  {
    slug: "burnout",
    title: "Burnout",
    icon: "activity",
    short: "Agotamiento físico y emocional por estrés sostenido, especialmente laboral o académico.",
    sections: {
      queEs: ["El burnout es un estado de agotamiento físico, emocional y mental provocado por estrés crónico, frecuentemente relacionado con el trabajo o los estudios."],
      comoSentirse: ["Agotamiento que no mejora con el descanso habitual.", "Sensación de estar \"quemado/a\" o sin recursos."],
      sintomasEmocionales: ["Cinismo o distanciamiento hacia el trabajo o estudio.", "Frustración, desmotivación."],
      sintomasCognitivos: ["Dificultad para concentrarte.", "Sensación de ineficacia, de que nada de lo que haces alcanza."],
      sintomasFisicos: ["Fatiga persistente, dolores de cabeza, problemas de sueño."],
      cambiosConductuales: ["Distanciarte de tareas o personas.", "Bajar tu rendimiento habitual."],
      reaccionNormal: ["Sentir cansancio tras un periodo intenso de exigencia es normal si se recupera con el descanso."],
      cuandoProblema: ["Cuando el agotamiento es constante, no mejora al descansar, y se acompaña de cinismo o baja realización."],
      cuandoConsultar: ["Si el agotamiento afecta tu salud física o tu ánimo de forma sostenida."],
      tratamientos: ["Terapia para manejo del estrés y reorganización de límites.", "En algunos casos, evaluación de síntomas depresivos o ansiosos asociados."],
      herramientas: ["manejo-estres", "rutina-sueno", "resolucion-problemas"],
      evitar: ["Seguir exigiéndote al mismo ritmo sin pausas.", "Minimizar el agotamiento como \"solo cansancio\"."],
      urgente: ["Si el burnout se acompaña de síntomas depresivos severos o pensamientos de hacerte daño."],
      fuentes: ["Organismos de salud pública sobre burnout laboral.", "Contenido pendiente de revisión por un profesional de salud mental colegiado antes de publicación."],
    },
  },
  {
    slug: "sustancias",
    title: "Consumo problemático de sustancias",
    icon: "alert",
    short: "Cuando el uso de alcohol u otras sustancias empieza a generar problemas en tu vida.",
    sections: {
      queEs: ["El consumo problemático ocurre cuando el uso de alcohol u otras sustancias comienza a afectar tu salud, tus relaciones, tu trabajo o estudios."],
      comoSentirse: ["Necesidad creciente de consumir para sentirte \"normal\" o para calmar el malestar.", "Culpa o preocupación por tu propio consumo."],
      sintomasEmocionales: ["Ansiedad cuando no puedes consumir.", "Irritabilidad, culpa."],
      sintomasCognitivos: ["Pensar mucho en cuándo será la próxima vez que consumas.", "Minimizar o justificar el consumo."],
      sintomasFisicos: ["Cambios en el sueño y el apetito.", "Malestar físico al reducir o dejar de consumir."],
      cambiosConductuales: ["Consumir en momentos o cantidades que antes no considerabas.", "Descuidar responsabilidades por el consumo."],
      reaccionNormal: ["El consumo social ocasional, sin consecuencias negativas, no siempre indica un problema."],
      cuandoProblema: ["Cuando el consumo afecta tu salud, tu trabajo, tus estudios o tus relaciones.", "Cuando sientes que te cuesta controlar cuánto o con qué frecuencia consumes."],
      cuandoConsultar: ["Si notas que el consumo te genera consecuencias negativas de forma repetida.", "Si otras personas cercanas te han expresado preocupación."],
      tratamientos: ["Programas especializados en consumo de sustancias.", "Terapia individual y, en algunos casos, grupos de apoyo."],
      herramientas: ["resolucion-problemas", "diario-emocional"],
      evitar: ["Intentar dejar un consumo intenso de forma abrupta y sin supervisión médica (puede ser riesgoso físicamente).", "Minimizar señales de alarma propias o de otros."],
      urgente: ["Si hay riesgo de sobredosis, síntomas físicos graves al reducir el consumo, o pensamientos de hacerte daño: busca atención médica urgente."],
      fuentes: ["Organismos de salud pública sobre consumo de sustancias.", "Contenido pendiente de revisión por un profesional de salud mental y adicciones antes de publicación."],
    },
  },
];

const SECTION_LABELS = [
  ["queEs", "¿Qué es?"],
  ["comoSentirse", "¿Cómo puede sentirse?"],
  ["sintomasEmocionales", "Síntomas emocionales"],
  ["sintomasCognitivos", "Síntomas cognitivos"],
  ["sintomasFisicos", "Síntomas físicos"],
  ["cambiosConductuales", "Cambios conductuales"],
  ["reaccionNormal", "¿Cuándo puede ser una reacción normal?"],
  ["cuandoProblema", "¿Cuándo puede convertirse en un problema?"],
  ["cuandoConsultar", "¿Cuándo debería consultar a un profesional?"],
  ["tratamientos", "¿Qué tratamientos profesionales existen?"],
  ["herramientas", "¿Qué herramientas pueden ayudar?"],
  ["evitar", "¿Qué cosas debería evitar?"],
  ["urgente", "¿Cuándo es urgente buscar ayuda?"],
  ["fuentes", "Fuentes y referencias"],
];

/* --------------------------- Herramientas --------------------------- */
const TOOLS = [
  {
    slug: "respiracion",
    title: "Respiración guiada",
    icon: "wind",
    quees: "Un ejercicio para reducir la activación física del cuerpo (corazón acelerado, tensión) usando respiración lenta y controlada.",
    paraQue: "Puede ayudar a calmar el cuerpo en momentos de ansiedad, estrés o antes de una situación difícil.",
    pasos: [
      "Busca un lugar donde puedas sentarte con calma.",
      "Inhala por la nariz contando 4 segundos.",
      "Sostén el aire 4 segundos.",
      "Exhala lento por la boca contando 6 segundos.",
      "Repite el ciclo de 5 a 10 veces.",
    ],
    cuandoNoBasta: "Si la ansiedad es muy intensa, se repite con frecuencia, o no baja con la respiración, puede ser momento de hablar con un profesional.",
    interactive: "breathing",
  },
  {
    slug: "grounding",
    title: "Grounding 5-4-3-2-1",
    icon: "hand",
    quees: "Una técnica de anclaje que usa los sentidos para traer tu atención al momento presente.",
    paraQue: "Puede ayudar durante momentos de ansiedad intensa, pánico o desconexión de la realidad (disociación leve).",
    pasos: [
      "Nombra 5 cosas que puedes ver a tu alrededor.",
      "Nombra 4 cosas que puedes tocar.",
      "Nombra 3 cosas que puedes escuchar.",
      "Nombra 2 cosas que puedes oler.",
      "Nombra 1 cosa que puedes saborear.",
    ],
    cuandoNoBasta: "Si el malestar no baja o se repite con mucha frecuencia, conviene hablar con un profesional.",
    interactive: "grounding",
  },
  {
    slug: "relajacion-muscular",
    title: "Relajación muscular progresiva",
    icon: "activity",
    quees: "Una técnica que consiste en tensar y luego soltar distintos grupos musculares de forma consciente.",
    paraQue: "Puede ayudar a reducir la tensión física acumulada por estrés o ansiedad.",
    pasos: [
      "Siéntate o recuéstate en un lugar cómodo.",
      "Tensa un grupo muscular (por ejemplo, los hombros) durante 5 segundos.",
      "Suelta la tensión de golpe y nota la diferencia durante 10 segundos.",
      "Repite subiendo por el cuerpo: manos, brazos, hombros, rostro, abdomen, piernas, pies.",
    ],
    cuandoNoBasta: "Si la tensión física es constante y no cede, puede valer la pena una evaluación médica y psicológica.",
  },
  {
    slug: "registro-pensamientos",
    title: "Registro de pensamientos",
    icon: "brain",
    quees: "Una herramienta para identificar y examinar pensamientos automáticos que generan malestar.",
    paraQue: "Ayuda a notar patrones de pensamiento y a ponerlos en perspectiva, en vez de creerlos automáticamente.",
    pasos: [
      "Anota la situación que disparó el malestar.",
      "Anota el pensamiento automático que tuviste.",
      "Anota la emoción que sentiste y su intensidad (0-10).",
      "Pregúntate: ¿qué evidencia apoya este pensamiento? ¿qué evidencia lo contradice?",
      "Escribe un pensamiento alternativo, más equilibrado.",
    ],
    cuandoNoBasta: "Si los pensamientos negativos son muy frecuentes o intensos, un profesional puede ayudarte a trabajarlos con más profundidad.",
  },
  {
    slug: "diario-emocional",
    title: "Diario emocional",
    icon: "book",
    quees: "Un espacio para registrar cómo te sientes día a día.",
    paraQue: "Ayuda a identificar patrones en tu estado de ánimo y qué situaciones los disparan.",
    pasos: [
      "Elige un momento fijo del día para escribir.",
      "Anota qué sentiste, qué lo generó, y qué intensidad tuvo.",
      "No busques \"escribir bien\": el objetivo es la honestidad, no la forma.",
    ],
    cuandoNoBasta: "Si notas un patrón sostenido de malestar, compártelo con un profesional; puede ser información valiosa para una consulta.",
  },
  {
    slug: "resolucion-problemas",
    title: "Resolución de problemas",
    icon: "list",
    quees: "Un método estructurado para abordar un problema concreto paso a paso.",
    paraQue: "Ayuda cuando el malestar viene de una situación específica que se siente abrumadora.",
    pasos: [
      "Define el problema de forma concreta y específica.",
      "Genera varias soluciones posibles, sin juzgarlas todavía.",
      "Evalúa ventajas y desventajas de cada una.",
      "Elige una y define un primer paso pequeño y concreto.",
      "Revisa cómo te fue y ajusta si es necesario.",
    ],
    cuandoNoBasta: "Si el problema es complejo, involucra a otras personas de forma difícil, o el malestar es muy intenso, un profesional puede ayudarte a abordarlo.",
  },
  {
    slug: "activacion-conductual",
    title: "Activación conductual",
    icon: "sun",
    quees: "Una estrategia que consiste en programar actividades, incluso cuando no tienes ganas, para romper el círculo de desánimo e inactividad.",
    paraQue: "Es especialmente útil frente a síntomas depresivos, cuando la falta de energía lleva a hacer cada vez menos.",
    pasos: [
      "Elige una actividad pequeña y concreta (por ejemplo, salir a caminar 10 minutos).",
      "Prográmala en un horario fijo, sin esperar a \"tener ganas\".",
      "Realízala aunque el ánimo esté bajo.",
      "Observa cómo te sientes después, sin exigirte que sea perfecto.",
    ],
    cuandoNoBasta: "Si te resulta muy difícil siquiera empezar, o el desánimo es muy intenso, un profesional puede acompañarte en el proceso.",
  },
  {
    slug: "rutina-sueno",
    title: "Rutina de sueño",
    icon: "moon",
    quees: "Un conjunto de hábitos que favorecen un sueño más regular y reparador.",
    paraQue: "Puede ayudar cuando tienes dificultad para dormir o un sueño de mala calidad.",
    pasos: [
      "Mantén horarios de sueño y despertar similares todos los días.",
      "Evita pantallas y cafeína en las horas previas a dormir.",
      "Crea un ambiente oscuro, silencioso y cómodo.",
      "Evita siestas largas si tienes insomnio nocturno.",
      "Si no puedes dormir después de un rato, levántate y vuelve a la cama cuando tengas sueño.",
    ],
    cuandoNoBasta: "Si el insomnio persiste varias semanas a pesar de estos hábitos, conviene una evaluación profesional.",
  },
  {
    slug: "mindfulness",
    title: "Ejercicios de mindfulness",
    icon: "sparkles",
    quees: "Prácticas para dirigir la atención al momento presente, sin juzgar la experiencia.",
    paraQue: "Puede ayudar a reducir la rumiación, la ansiedad y a manejar emociones difíciles.",
    pasos: [
      "Siéntate cómodamente y cierra los ojos si te resulta cómodo.",
      "Dirige tu atención a la respiración, sin cambiarla.",
      "Cuando notes que tu mente se distrae, regresa suavemente la atención a la respiración.",
      "Comienza con 3-5 minutos y aumenta gradualmente.",
    ],
    cuandoNoBasta: "Si el malestar emocional es intenso o persistente, el mindfulness es un complemento, no un sustituto de la atención profesional.",
  },
  {
    slug: "manejo-estres",
    title: "Técnicas de manejo del estrés",
    icon: "activity",
    quees: "Un conjunto de estrategias para identificar fuentes de estrés y responder a ellas de forma más sostenible.",
    paraQue: "Ayuda a prevenir el desgaste acumulado y a mantener un ritmo de vida más equilibrado.",
    pasos: [
      "Identifica tus principales fuentes de estrés actuales.",
      "Distingue lo que puedes controlar de lo que no.",
      "Prioriza tareas y permite pausas reales durante el día.",
      "Incluye actividades de descanso y desconexión en tu rutina, no solo cuando \"sobre tiempo\".",
    ],
    cuandoNoBasta: "Si el estrés es constante y afecta tu salud física o emocional, busca apoyo profesional.",
  },
];

/* --------------------------- Directorio y ayuda urgente --------------------------- */
const DEPARTMENTS = ["Santa Cruz", "La Paz", "Cochabamba", "Chuquisaca", "Oruro", "Potosí", "Tarija", "Beni", "Pando"];

// ADMIN: los siguientes perfiles fueron recopilados desde Google Maps
// (búsqueda pública "psicólogo santa cruz") a partir de capturas de pantalla
// proporcionadas por el equipo de Synapsis. Son negocios/profesionales reales,
// pero Synapsis aún NO ha verificado directamente sus credenciales, modalidad
// exacta ni costo — por eso no llevan el sello "✓ Verificado". Tampoco se
// encontraron números de teléfono confiables para incluir aquí: evitamos
// adivinarlos o mezclarlos con números hallados en otras fuentes no
// confirmadas, para no atribuir un contacto equivocado a la persona
// equivocada. El equipo de Synapsis debe confirmar datos de contacto reales,
// modalidad, costo y licencia antes de publicar. También conviene
// contactar al Colegio de Psicólogos de Santa Cruz para verificar matrícula.
const DEFAULT_PROFESSIONALS = [
  { id: "gm-1", sample: false, verified: false, source: "gmaps", name: "Oscar Urzagasti Psicólogo", profession: "Psicólogo/a", specialty: "Psicología general", modality: "Presencial", city: "Santa Cruz de la Sierra", address: "Manuel Ignacio Salvatierra 671", cost: "Particular", price: "Consultar", description: "Encontrado en Google Maps: 4.8★ (180 reseñas). Datos de contacto y modalidad exacta pendientes de confirmar.", contact: "Ver ubicación en Google Maps para más datos de contacto" },
  { id: "gm-2", sample: false, verified: false, source: "gmaps", name: "EUDAIMONIA", profession: "Psicólogo/a", specialty: "Centro psicológico", modality: "Presencial", city: "Santa Cruz de la Sierra", address: "Plus code 8R4J+3FC", cost: "Particular", price: "Consultar", description: "Encontrado en Google Maps: sin reseñas todavía. Indica atención las 24 horas; confirmar directamente.", contact: "Ver ubicación en Google Maps para más datos de contacto" },
  { id: "gm-3", sample: false, verified: false, source: "gmaps", name: "Oscar Cabrera, psicólogo en Santa Cruz", profession: "Psicólogo/a", specialty: "Psicología general", modality: "Presencial", city: "Santa Cruz de la Sierra", address: "Av. Busch 141", cost: "Particular", price: "Consultar", description: "Encontrado en Google Maps: 5.0★ (66 reseñas).", contact: "Ver ubicación en Google Maps para más datos de contacto" },
  { id: "gm-4", sample: false, verified: false, source: "gmaps", name: "Erika Cortez - Psicóloga", profession: "Psicólogo/a", specialty: "Psicología general", modality: "Presencial", city: "Santa Cruz de la Sierra", address: "Edificio Mirador de las Américas 1, Elvira de Mendoza", cost: "Particular", price: "Consultar", description: "Encontrado en Google Maps: 5.0★ (6 reseñas). Indica atención las 24 horas.", contact: "Ver ubicación en Google Maps para más datos de contacto" },
  { id: "gm-5", sample: false, verified: false, source: "gmaps", name: "Psicóloga Cecilia Velarde", profession: "Psicólogo/a", specialty: "Psicología general", modality: "Presencial", city: "Santa Cruz de la Sierra", address: "Condominio Areté", cost: "Particular", price: "Consultar", description: "Encontrado en Google Maps: 5.0★ (18 reseñas).", contact: "Ver ubicación en Google Maps para más datos de contacto" },
  { id: "gm-6", sample: false, verified: false, source: "gmaps", name: "Psicologízate", profession: "Psicólogo/a", specialty: "Centro psicológico", modality: "Presencial", city: "Santa Cruz de la Sierra", address: "Barrio Oriental, C. 1", cost: "Particular", price: "Consultar", description: "Encontrado en Google Maps: 4.7★ (9 reseñas).", contact: "Ver ubicación en Google Maps para más datos de contacto" },
  { id: "gm-7", sample: false, verified: false, source: "gmaps", name: "Psicóloga Ximena López", profession: "Psicólogo/a", specialty: "Psicología clínica, terapia cognitivo-conductual, especialista en duelo", modality: "Presencial", city: "Santa Cruz de la Sierra", address: "Av. Ibérica 40", cost: "Particular", price: "Consultar", description: "Encontrado en Google Maps: 4.9★ (14 reseñas).", contact: "Ver ubicación en Google Maps para más datos de contacto" },
  { id: "gm-8", sample: false, verified: false, source: "gmaps", name: "ASCIENDE centro psicológico", profession: "Psicólogo/a", specialty: "Centro psicológico", modality: "Presencial", city: "Santa Cruz de la Sierra", address: "Coordenadas aprox. 17°44'16.76\" S, 63°06'12\" O", cost: "Particular", price: "Consultar", description: "Encontrado en Google Maps: 5.0★ (2 reseñas).", contact: "Ver ubicación en Google Maps para más datos de contacto" },
  { id: "gm-9", sample: false, verified: false, source: "gmaps", name: "Psicóloga Patricia Maldonado", profession: "Psicólogo/a", specialty: "Psicología general", modality: "Presencial", city: "Santa Cruz de la Sierra", address: "Edificio Candelaria, Aroma 20", cost: "Particular", price: "Consultar", description: "Encontrado en Google Maps: 4.8★ (37 reseñas).", contact: "Ver ubicación en Google Maps para más datos de contacto" },
  { id: "gm-10", sample: false, verified: false, source: "gmaps", name: "Luna", profession: "Psicólogo/a", specialty: "Psicología general", modality: "Presencial", city: "Santa Cruz de la Sierra", address: "Sin dirección específica registrada en Maps", cost: "Particular", price: "Consultar", description: "Encontrado en Google Maps: sin reseñas todavía.", contact: "Ver ubicación en Google Maps para más datos de contacto" },
  { id: "gm-11", sample: false, verified: false, source: "gmaps", name: "Centro PsiConecta - Bienestar Integral", profession: "Psicólogo/a", specialty: "Bienestar integral", modality: "Presencial", city: "Santa Cruz de la Sierra", address: "Av. Prefecto Rivas 279", cost: "Particular", price: "Consultar", description: "Encontrado en Google Maps: 5.0★ (9 reseñas).", contact: "Ver ubicación en Google Maps para más datos de contacto" },
  { id: "gm-12", sample: false, verified: false, source: "gmaps", name: "Mónica Pereyra Psicóloga", profession: "Psicólogo/a", specialty: "Psicología general", modality: "Presencial", city: "Santa Cruz de la Sierra", address: "Plus code 7RJR+98H, zona Octavo Anillo (aprox.)", cost: "Particular", price: "Consultar", description: "Encontrado en Google Maps: sin reseñas todavía.", contact: "Ver ubicación en Google Maps para más datos de contacto" },
  { id: "gm-13", sample: false, verified: false, source: "gmaps", name: "Ayuda Psicológica Efectiva", profession: "Psicólogo/a", specialty: "Psicología general", modality: "Presencial", city: "Santa Cruz de la Sierra", address: "Las Begonias", cost: "Particular", price: "Consultar", description: "Encontrado en Google Maps: sin reseñas todavía.", contact: "Ver ubicación en Google Maps para más datos de contacto" },
  { id: "gm-14", sample: false, verified: false, source: "gmaps", name: "Psicóloga Raitza Arroyo", profession: "Psicólogo/a", specialty: "Psicología general", modality: "Presencial", city: "Santa Cruz de la Sierra", address: "Av. San Aurelio casi Segundo Anillo, esquina", cost: "Particular", price: "Consultar", description: "Encontrado en Google Maps: 5.0★ (2 reseñas).", contact: "Ver ubicación en Google Maps para más datos de contacto" },
  { id: "gm-15", sample: false, verified: false, source: "gmaps", name: "Isamara Ribera Psicóloga", profession: "Psicólogo/a", specialty: "Psicología general", modality: "Presencial", city: "Santa Cruz de la Sierra", address: "Plus code 6THC+74", cost: "Particular", price: "Consultar", description: "Encontrado en Google Maps: 4.9★ (10 reseñas).", contact: "Ver ubicación en Google Maps para más datos de contacto" },
  { id: "gm-16", sample: false, verified: false, source: "gmaps", name: "Psicólogo Jorge Alberto Dájer Paz", profession: "Psicólogo/a", specialty: "Psicología general", modality: "Presencial", city: "Santa Cruz de la Sierra", address: "Los Ambaibos 9210", cost: "Particular", price: "Consultar", description: "Encontrado en Google Maps: 5.0★ (7 reseñas).", contact: "Ver ubicación en Google Maps para más datos de contacto" },
  { id: "gm-17", sample: false, verified: false, source: "gmaps", name: "Natalia Cespedes - Psicóloga", profession: "Psicólogo/a", specialty: "Psicología general", modality: "Presencial", city: "Santa Cruz de la Sierra", address: "Calle Los Lirios esquina", cost: "Particular", price: "Consultar", description: "Encontrado en Google Maps: 5.0★ (1 reseña).", contact: "Ver ubicación en Google Maps para más datos de contacto" },
  { id: "gm-18", sample: false, verified: false, source: "gmaps", name: "Mi Psicólogo", profession: "Psicólogo/a", specialty: "Psicología general", modality: "Presencial", city: "Santa Cruz de la Sierra", address: "C. Seboí 44", cost: "Particular", price: "Consultar", description: "Encontrado en Google Maps: sin reseñas todavía.", contact: "Ver ubicación en Google Maps para más datos de contacto" },
  { id: "gm-19", sample: false, verified: false, source: "gmaps", name: "AVI - Aprendiendo a Vivir", profession: "Psicólogo/a", specialty: "Centro psicológico", modality: "Presencial", city: "Santa Cruz de la Sierra", address: "Joaquín Sierra 07", cost: "Particular", price: "Consultar", description: "Encontrado en Google Maps: 5.0★ (1 reseña).", contact: "Ver ubicación en Google Maps para más datos de contacto" },
  { id: "gm-20", sample: false, verified: false, source: "gmaps", name: "Psicóloga Clínica Susana López Castellanos", profession: "Psicólogo/a", specialty: "Psicoterapia", modality: "Presencial", city: "Santa Cruz de la Sierra", address: "Zona Sirari", cost: "Particular", price: "Consultar", description: "Encontrado en Google Maps: 5.0★ (8 reseñas). Categoría: psicoterapeuta.", contact: "Ver ubicación en Google Maps para más datos de contacto" },
  { id: "gm-21", sample: false, verified: false, source: "gmaps", name: "SENDA Centro Integral Infanto Juvenil", profession: "Psicólogo/a", specialty: "Psicología infantil", modality: "Presencial", city: "Santa Cruz de la Sierra", address: "Casa 2205, Av. Beni", cost: "Particular", price: "Consultar", description: "Encontrado en Google Maps: 5.0★ (4 reseñas).", contact: "Ver ubicación en Google Maps para más datos de contacto" },
  { id: "gm-22", sample: false, verified: false, source: "gmaps", name: "Psicólogo Forense", profession: "Psicólogo/a", specialty: "Psicología forense (evaluaciones legales, no es terapia clínica general)", modality: "Presencial", city: "Santa Cruz de la Sierra", address: "Manuel Ignacio Salvatierra 71", cost: "Particular", price: "Consultar", description: "Encontrado en Google Maps: 5.0★ (1 reseña).", contact: "Ver ubicación en Google Maps para más datos de contacto" },
  { id: "gm-23", sample: false, verified: false, source: "gmaps", name: "Consultorio Ortíz Velasco", profession: "Psicólogo/a", specialty: "Psicología general", modality: "Presencial", city: "Santa Cruz de la Sierra", address: "Residencias del Norte, C. 1 #15", cost: "Particular", price: "Consultar", description: "Encontrado en Google Maps: 5.0★ (2 reseñas). Indica atención las 24 horas.", contact: "Ver ubicación en Google Maps para más datos de contacto" },
  { id: "gm-24", sample: false, verified: false, source: "gmaps", name: "Centro de Terapia Familiar Especializada", profession: "Terapia familiar", specialty: "Terapia familiar", modality: "Presencial", city: "Santa Cruz de la Sierra", address: "3er Anillo Externo, Av. Marcelo Terceros Banzer", cost: "Particular", price: "Consultar", description: "Encontrado en Google Maps: 5.0★ (6 reseñas).", contact: "Ver ubicación en Google Maps para más datos de contacto" },
  { id: "gm-25", sample: false, verified: false, source: "gmaps", name: "Piel Humana - Centro de Atención Psicológica", profession: "Psicólogo/a", specialty: "Servicio de salud mental", modality: "Presencial", city: "Santa Cruz de la Sierra", address: "C. Pitajaya", cost: "Particular", price: "Consultar", description: "Encontrado en Google Maps: 5.0★ (4 reseñas).", contact: "Ver ubicación en Google Maps para más datos de contacto" },
  { id: "gm-26", sample: false, verified: false, source: "gmaps", name: "Thiago Mora Psi (consultorio psicológico)", profession: "Psicólogo/a", specialty: "Psicología general", modality: "Presencial", city: "Santa Cruz de la Sierra", address: "Guembe 2080", cost: "Particular", price: "Consultar", description: "Encontrado en Google Maps: 4.0★ (3 reseñas).", contact: "Ver ubicación en Google Maps para más datos de contacto" },
  { id: "gm-27", sample: false, verified: false, source: "gmaps", name: "Clínica Integral de la Familia Bolivia \"CLIFABOL\"", profession: "Terapia familiar", specialty: "Psicoterapia y atención integral familiar", modality: "Presencial", city: "Santa Cruz de la Sierra", address: "Av. Alemana", cost: "Particular", price: "Consultar", description: "Encontrado en Google Maps: 5.0★ (1 reseña). Categoría: psicoterapeuta.", contact: "Ver ubicación en Google Maps para más datos de contacto" },
  { id: "gm-28", sample: false, verified: false, source: "gmaps", name: "Psicólogo Clínico Diego Valenzuela", profession: "Psicólogo/a", specialty: "Psicología clínica", modality: "Presencial", city: "Santa Cruz de la Sierra", address: "Zona Sirari", cost: "Particular", price: "Consultar", description: "Encontrado en Google Maps: 5.0★ (6 reseñas).", contact: "Ver ubicación en Google Maps para más datos de contacto" },
  { id: "gm-29", sample: false, verified: false, source: "gmaps", name: "Valeria Monterosso Psicóloga", profession: "Psicólogo/a", specialty: "Psicología general", modality: "Presencial", city: "Santa Cruz de la Sierra", address: "Torres Saint Isuto, Torre Norte, Av. La Salle 20", cost: "Particular", price: "Consultar", description: "Encontrado en Google Maps: sin reseñas todavía.", contact: "Ver ubicación en Google Maps para más datos de contacto" },
  { id: "gm-30", sample: false, verified: false, source: "gmaps", name: "Fundación Renacer", profession: "Psicólogo/a", specialty: "Psicología general", modality: "Presencial", city: "Santa Cruz de la Sierra", address: "Av. 18 de Mayo 4785-4741", cost: "Particular", price: "Consultar", description: "Encontrado en Google Maps: sin reseñas todavía. No se encontró información adicional confiable sobre esta fundación en la web; confirmar directamente antes de publicar.", contact: "Ver ubicación en Google Maps para más datos de contacto" },
  { id: "gm-31", sample: false, verified: false, source: "web", name: "Psicóloga Junisse Montaño", profession: "Psicólogo/a", specialty: "Psicología general", modality: "Presencial", city: "Santa Cruz de la Sierra", address: "Edificio Don Alcides, zona Pari", cost: "Particular", price: "Bs 190 por sesión (declarado en su propio sitio web; confirmar vigencia)", description: "Encontrada en Google Maps (5.0★, ~20 reseñas) y en su propio sitio web, que declara el registro profesional R.P. JMP-1004-25 del Colegio de Psicólogos de Santa Cruz. Synapsis no ha confirmado este número directamente con el Colegio.", contact: "WhatsApp +591 77998340 (publicado en su propio sitio web; no verificado por Synapsis)" },
  // Psiquiatras (Santa Cruz) — encontrados vía búsqueda web (páginas profesionales / directorios médicos como doctorpolis.com.bo). Sin número verificado por Synapsis en la mayoría de los casos.
  { id: "gm-32", sample: false, verified: false, source: "web", name: "Dra. Leyla Arnez", profession: "Psiquiatra", specialty: "Médico especialista en Salud Mental", modality: "Presencial", city: "Santa Cruz de la Sierra", address: "Consultorio particular (confirmar dirección exacta)", cost: "Particular", price: "Consultar", description: "Encontrada mediante página profesional pública. Sin teléfono verificado por Synapsis.", contact: "Buscar página profesional \"Leyla Arnez psiquiatra\" para más datos" },
  { id: "gm-33", sample: false, verified: false, source: "web", name: "Dr. Carlos Alberto Molina Jaro", profession: "Psiquiatra", specialty: "Psiquiatría y psicoterapia, atención integral en salud mental", modality: "Presencial", city: "Santa Cruz de la Sierra", address: "Ballivián 1245", cost: "Particular", price: "Consultar", description: "Perfil corroborado en varias fuentes públicas (página profesional, directorio médico, bio institucional). Sin teléfono confirmado por Synapsis.", contact: "Buscar página profesional \"Dr. Molina Jaro psiquiatra Santa Cruz\" para más datos" },
  { id: "gm-34", sample: false, verified: false, source: "web", name: "Dr. Miguel De La Oliva", profession: "Psiquiatra", specialty: "Neuropsiquiatría", modality: "Presencial", city: "Santa Cruz de la Sierra", address: "Clínica Neuropsiquiátrica Monte Sinaí, Av. Mario R. Gutiérrez 3145, 3er Anillo Externo", cost: "Particular", price: "Consultar", description: "Encontrado en página profesional pública, con clínica y correo publicados. Confirmar teléfono directamente antes de publicar.", contact: "Clínica Neuropsiquiátrica Monte Sinaí — confirmar teléfono directamente" },
  { id: "gm-35", sample: false, verified: false, source: "web", name: "Dr. Juan Carlo Ramírez Valdivia", profession: "Psiquiatra", specialty: "Tratamiento de trastornos mentales y del comportamiento", modality: "Presencial", city: "Santa Cruz de la Sierra", address: "Consultorio particular (confirmar dirección exacta)", cost: "Particular", price: "Consultar", description: "Encontrado mediante página profesional pública. Sin teléfono verificado por Synapsis.", contact: "Buscar página profesional \"Dr. Ramírez Valdivia psiquiatra\" para más datos" },
  { id: "gm-36", sample: false, verified: false, source: "web", name: "Dra. Patricia Tapia", profession: "Psiquiatra", specialty: "Psiquiatría general", modality: "Presencial", city: "Santa Cruz de la Sierra", address: "Av. Tahuichi 5200, Jardín Latino", cost: "Particular", price: "Consultar", description: "Encontrada en directorio médico boliviano. Sin teléfono confirmado por Synapsis.", contact: "Ver ubicación en Google Maps para más datos de contacto" },
  { id: "gm-37", sample: false, verified: false, source: "web", name: "Dra. María Alcira Schlusselberg", profession: "Psiquiatra", specialty: "Neurofisiología, psiquiatría infantil y del adolescente, terapia complementaria", modality: "Presencial", city: "Santa Cruz de la Sierra", address: "Clínica Neuropsiquiátrica Monte Sinaí, Av. Mario Gutiérrez 3145", cost: "Particular", price: "Consultar", description: "Encontrada en directorio médico boliviano, misma clínica que el Dr. De La Oliva (dato cruzado entre dos fuentes).", contact: "Ver ubicación en Google Maps para más datos de contacto" },
  { id: "gm-38", sample: false, verified: false, source: "web", name: "Dr. Nelson Eduardo Villalon Coro", profession: "Psiquiatra", specialty: "Psiquiatría general (23 años de experiencia declarados)", modality: "Presencial", city: "Santa Cruz de la Sierra", address: "Calle Teniente Hormando Balcázar 171, Barrio Lindo", cost: "Particular", price: "Consultar", description: "Encontrado en directorio médico boliviano. Sin teléfono confirmado por Synapsis.", contact: "Ver ubicación en Google Maps para más datos de contacto" },
  { id: "gm-39", sample: false, verified: false, source: "web", name: "Dra. Thais Morales Díaz", profession: "Psiquiatra", specialty: "Psiquiatría general", modality: "Presencial", city: "Santa Cruz de la Sierra", address: "3er Anillo Externo, entre Radial 19 y Av. Piraí", cost: "Particular", price: "Consultar", description: "Encontrada en directorio médico boliviano. Sin teléfono confirmado por Synapsis.", contact: "Ver ubicación en Google Maps para más datos de contacto" },
  { id: "gm-40", sample: false, verified: false, source: "web", name: "Dra. Cinthya Melgar González", profession: "Psiquiatra", specialty: "Psiquiatría general", modality: "Presencial", city: "Santa Cruz de la Sierra", address: "Centro Médico Niño Jesús, Av. Cañoto esq. Rafael Peña, Piso 5, Consultorio 507", cost: "Particular", price: "Consultar", description: "Encontrada en directorio médico boliviano. Sin teléfono confirmado por Synapsis.", contact: "Ver ubicación en Google Maps para más datos de contacto" },
  { id: "gm-41", sample: false, verified: false, source: "web", name: "Dra. Alexandra Terrazas", profession: "Psiquiatra", specialty: "Psiquiatría general", modality: "Presencial", city: "Santa Cruz de la Sierra", address: "Av. Japón, 3er Anillo Externo esq. Coronel Aymerich", cost: "Particular", price: "Consultar", description: "Encontrada en directorio médico boliviano. Sin teléfono confirmado por Synapsis.", contact: "Ver ubicación en Google Maps para más datos de contacto" },
  // Más psicólogos y terapeutas familiares — encontrados en un directorio profesional de psicología (psicologiaymente.com). El estado "Verificado/No verificado" es el de ese sitio, no una verificación propia de Synapsis.
  { id: "gm-42", sample: false, verified: false, source: "web", name: "Valentín Torres Torres", profession: "Terapia familiar", specialty: "Psicoterapia familiar y de pareja; ansiedad, depresión, ámbito forense y organizacional", modality: "Virtual", city: "Santa Cruz de la Sierra", address: "Sin dirección exacta publicada", cost: "Particular", price: "Consultar", description: "Perfil con reseñas (4.9/5) en directorio profesional de psicología. Atiende también presencial.", contact: "Ver perfil en directorio profesional de psicología" },
  { id: "gm-43", sample: false, verified: false, source: "web", name: "Ingrid Saavedra Ferrufino", profession: "Psicólogo/a", specialty: "Psicología clínica sistémica, trauma y apego (EMDR)", modality: "Presencial", city: "Santa Cruz de la Sierra", address: "Av. Las Américas 195", cost: "Particular", price: "Consultar", description: "Perfil con reseñas (5/5) en directorio profesional de psicología. Atiende también online.", contact: "Ver perfil en directorio profesional de psicología" },
  { id: "gm-44", sample: false, verified: false, source: "web", name: "Willy Soria Luzio", profession: "Psicólogo/a", specialty: "Codependencia, habilidades de afrontamiento, depresión", modality: "Presencial", city: "Santa Cruz de la Sierra", address: "Sin dirección exacta publicada", cost: "Particular", price: "Consultar", description: "Encontrado en directorio profesional de psicología.", contact: "Ver perfil en directorio profesional de psicología" },
  { id: "gm-45", sample: false, verified: false, source: "web", name: "Daniela Ibieta Vildozo", profession: "Psicólogo/a", specialty: "Ansiedad, problemas de comportamiento, niños y adolescentes", modality: "Presencial", city: "Santa Cruz de la Sierra", address: "Sin dirección exacta publicada", cost: "Particular", price: "Consultar", description: "Encontrada en directorio profesional de psicología.", contact: "Ver perfil en directorio profesional de psicología" },
  { id: "gm-46", sample: false, verified: false, source: "web", name: "Marco Saavedra Saavedra", profession: "Psicólogo/a", specialty: "Hipnoterapia (enfoque no convencional; confirmar formación clínica antes de derivar)", modality: "Virtual", city: "Santa Cruz de la Sierra", address: "Zona Totaices", cost: "Particular", price: "Consultar", description: "Encontrado en directorio profesional de psicología, atención online.", contact: "Ver perfil en directorio profesional de psicología" },
  { id: "gm-47", sample: false, verified: false, source: "web", name: "Maria Renee Urioste Landivar", profession: "Terapia familiar", specialty: "Psicología sistémica familiar", modality: "Presencial", city: "Santa Cruz de la Sierra", address: "Zona Libertad esquina", cost: "Particular", price: "Consultar", description: "Encontrada en directorio profesional de psicología.", contact: "Ver perfil en directorio profesional de psicología" },
  { id: "gm-48", sample: false, verified: false, source: "web", name: "Silvina Raña Rivero", profession: "Psicólogo/a", specialty: "Psicología general", modality: "Presencial", city: "Santa Cruz de la Sierra", address: "Zona Choferes del Chaco", cost: "Particular", price: "Consultar", description: "Encontrada en directorio profesional de psicología, atiende también online.", contact: "Ver perfil en directorio profesional de psicología" },
  { id: "gm-49", sample: false, verified: false, source: "web", name: "Emma Hernandez", profession: "Psicólogo/a", specialty: "Psicología clínica y trabajo social", modality: "Presencial", city: "Santa Cruz de la Sierra", address: "Sin dirección exacta publicada", cost: "Particular", price: "Consultar", description: "Encontrada en directorio profesional de psicología.", contact: "Ver perfil en directorio profesional de psicología" },
  { id: "gm-50", sample: false, verified: false, source: "web", name: "Isabella Aldunate Zamora", profession: "Psicólogo/a", specialty: "Psicología general", modality: "Presencial", city: "Santa Cruz de la Sierra", address: "Av. Piraí", cost: "Particular", price: "Consultar", description: "Encontrada en directorio profesional de psicología.", contact: "Ver perfil en directorio profesional de psicología" },
  { id: "gm-51", sample: false, verified: false, source: "web", name: "Ysabel León Arana", profession: "Psicólogo/a", specialty: "Terapia transpersonal y life coaching (enfoque no convencional; confirmar formación clínica antes de derivar)", modality: "Virtual", city: "Santa Cruz de la Sierra", address: "Sin dirección exacta publicada", cost: "Particular", price: "Consultar", description: "Encontrada en directorio profesional de psicología, atención online.", contact: "Ver perfil en directorio profesional de psicología" },
  { id: "gm-52", sample: false, verified: false, source: "web", name: "Julio Villalobos", profession: "Psicólogo/a", specialty: "Psicología clínica (13 años de experiencia declarados)", modality: "Presencial", city: "Santa Cruz de la Sierra", address: "Tacna 77", cost: "Particular", price: "Consultar", description: "Encontrado en directorio profesional de psicología.", contact: "Ver perfil en directorio profesional de psicología" },
  { id: "gm-53", sample: false, verified: false, source: "web", name: "Carla Giannina Miranda López", profession: "Psicólogo/a", specialty: "Psicología general", modality: "Presencial", city: "Santa Cruz de la Sierra", address: "Av. Alemana", cost: "Particular", price: "Consultar", description: "Encontrada en directorio profesional de psicología.", contact: "Ver perfil en directorio profesional de psicología" },
  { id: "gm-54", sample: false, verified: false, source: "web", name: "Juan Jesús Justiniano Velasco", profession: "Psicólogo/a", specialty: "Psicología clínica, jurídico-forense y educativa", modality: "Presencial", city: "Santa Cruz de la Sierra", address: "Charcas 1235", cost: "Particular", price: "Consultar", description: "Encontrado en directorio profesional de psicología.", contact: "Ver perfil en directorio profesional de psicología" },
  { id: "gm-55", sample: false, verified: false, source: "web", name: "Monica Lohse Roca", profession: "Psicólogo/a", specialty: "Psicología general", modality: "Presencial", city: "Santa Cruz de la Sierra", address: "Av. Roca y Coronado", cost: "Particular", price: "Consultar", description: "Encontrada en directorio profesional de psicología.", contact: "Ver perfil en directorio profesional de psicología" },
  { id: "gm-56", sample: false, verified: false, source: "web", name: "Jose Perales", profession: "Psicólogo/a", specialty: "Trastorno obsesivo-compulsivo (TOC)", modality: "Virtual", city: "Santa Cruz de la Sierra", address: "Sin dirección exacta publicada", cost: "Particular", price: "Consultar", description: "Encontrado en directorio profesional de psicología y en sus propias redes sociales, con el mismo número de WhatsApp en ambas fuentes.", contact: "WhatsApp +591 79847551 (publicado por él mismo; no verificado por Synapsis)" },
  { id: "gm-57", sample: false, verified: false, source: "web", name: "Joshie Soria Gareca", profession: "Psicólogo/a", specialty: "Psicología laboral", modality: "Presencial", city: "Santa Cruz de la Sierra", address: "Av. Brasil", cost: "Particular", price: "Consultar", description: "Encontrada en directorio profesional de psicología.", contact: "Ver perfil en directorio profesional de psicología" },
  { id: "gm-58", sample: false, verified: false, source: "web", name: "PSIUS - Especialista en Fobias y Ansiedades", profession: "Psicólogo/a", specialty: "Fobias y ansiedad, terapia con realidad virtual", modality: "Presencial", city: "Santa Cruz de la Sierra", address: "Av. San Martín", cost: "Particular", price: "Consultar", description: "Encontrado en dos directorios distintos de forma independiente (dato cruzado).", contact: "Ver perfil en directorio profesional de psicología" },
  { id: "gm-59", sample: false, verified: false, source: "web", name: "Jannet Carmona Zambrana", profession: "Psicólogo/a", specialty: "Psicología general", modality: "Presencial", city: "Santa Cruz de la Sierra", address: "Av. Roca y Coronado", cost: "Particular", price: "Consultar", description: "Encontrada en directorio profesional de psicología.", contact: "Ver perfil en directorio profesional de psicología" },
];

const DEFAULT_FREE_SERVICES = [
  {
    id: "svc-sample-1", sample: true,
    name: "Centro de salud pública (dato de muestra)",
    category: "Gratuito", type: "Centro de salud público",
    department: "Santa Cruz", city: "Santa Cruz de la Sierra",
    description: "Ejemplo de servicio de salud mental dentro de la red pública. Completar con datos reales verificados.",
    contact: "Dato de ejemplo — completar con contacto verificado",
  },
  {
    id: "svc-sample-2", sample: true,
    name: "Servicio psicológico universitario (dato de muestra)",
    category: "Gratuito", type: "Universidad",
    department: "Santa Cruz", city: "Santa Cruz de la Sierra",
    description: "Ejemplo de servicio de práctica psicológica supervisada en una universidad. Completar con datos reales verificados.",
    contact: "Dato de ejemplo — completar con contacto verificado",
  },
  {
    id: "svc-sample-3", sample: true,
    name: "Organización comunitaria de apoyo (dato de muestra)",
    category: "Bajo costo", type: "Organización / ONG",
    department: "La Paz", city: "La Paz",
    description: "Ejemplo de organización con servicios de apoyo emocional a bajo costo. Completar con datos reales verificados.",
    contact: "Dato de ejemplo — completar con contacto verificado",
  },
];

// ADMIN: números de emergencia — NO se han incluido números reales.
// Deben cargarse y verificarse aquí (o desde el panel de administración)
// antes de publicar la plataforma.
const DEFAULT_EMERGENCY = [
  { id: "em-1", category: "Emergencias", name: "Número Único de Emergencias en Salud (Ministerio de Salud de Bolivia) — ambulancia", department: "Bolivia (nacional)", city: "—", phone: "168", verified: false },
  { id: "em-2", category: "Línea de crisis", name: "Familia Segura (UNICEF Bolivia) — apoyo psico-emocional gratuito y confidencial, todos los días de 06:00 a 00:00; atiende ideas o intentos de suicidio; también WhatsApp 777 97 667 (solo texto)", department: "Bolivia (nacional)", city: "—", phone: "800113040", verified: false },
  { id: "em-5", category: "Emergencias", name: "Policía Boliviana", department: "Bolivia (nacional)", city: "—", phone: "110", verified: false },
  { id: "em-3", category: "Hospital", name: "Hospital San Juan de Dios (hospital público general, urgencias)", department: "Santa Cruz", city: "Santa Cruz de la Sierra", phone: "3332222", verified: false },
  { id: "em-6", category: "Hospital", name: "Hospital de Niños Dr. Mario Ortiz Suárez (urgencias pediátricas)", department: "Santa Cruz", city: "Santa Cruz de la Sierra", phone: "79071429", verified: false },
  { id: "em-4", category: "Centro de salud", name: "Centro de Salud Mental de Reposo y Recuperación (Barrio Braniff, 3er Anillo Interno) — atención en salud mental", department: "Santa Cruz", city: "Santa Cruz de la Sierra", phone: "3524141", verified: false },
  { id: "em-7", category: "Centro de salud", name: "CIES Santa Cruz — red de policlínicos de bajo costo (varias sucursales)", department: "Santa Cruz", city: "Santa Cruz de la Sierra", phone: "800112437", verified: false },
];

const PROFESSIONAL_FIELDS = [
  { key: "name", label: "Nombre", type: "text" },
  { key: "profession", label: "Profesión", type: "select", options: ["Psicólogo/a", "Psiquiatra", "Médico/a general", "Terapia familiar"] },
  { key: "specialty", label: "Especialidad", type: "text" },
  { key: "modality", label: "Modalidad", type: "select", options: ["Presencial", "Virtual"] },
  { key: "city", label: "Ciudad", type: "text" },
  { key: "address", label: "Dirección / referencia", type: "text" },
  { key: "cost", label: "Costo", type: "select", options: ["Gratuito", "Bajo costo", "Particular"] },
  { key: "price", label: "Precio aproximado", type: "text" },
  { key: "description", label: "Descripción", type: "textarea" },
  { key: "contact", label: "Contacto (referencial)", type: "text" },
  { key: "verified", label: "Marcar como verificado", type: "checkbox" },
];

const FREE_SERVICE_FIELDS = [
  { key: "name", label: "Nombre del servicio", type: "text" },
  { key: "category", label: "Categoría", type: "select", options: ["Gratuito", "Bajo costo"] },
  { key: "type", label: "Tipo", type: "select", options: ["Centro de salud público", "Universidad", "Organización / ONG", "Centro comunitario"] },
  { key: "department", label: "Departamento", type: "select", options: DEPARTMENTS },
  { key: "city", label: "Ciudad", type: "text" },
  { key: "description", label: "Descripción", type: "textarea" },
  { key: "contact", label: "Contacto (referencial)", type: "text" },
];

const EMERGENCY_FIELDS = [
  { key: "category", label: "Categoría", type: "select", options: ["Emergencias", "Línea de crisis", "Hospital", "Centro de salud", "Contacto de confianza"] },
  { key: "name", label: "Nombre del recurso", type: "text" },
  { key: "department", label: "Departamento", type: "select", options: DEPARTMENTS.concat(["Bolivia (nacional)"]) },
  { key: "city", label: "Ciudad", type: "text" },
  { key: "phone", label: "Teléfono verificado", type: "text" },
  { key: "verified", label: "Verificado por administrador", type: "checkbox" },
];

/* --------------------------- Hook de almacenamiento persistente --------------------------- */
function useStoredList(key, defaults) {
  const [items, setItems] = useState(defaults);
  const [status, setStatus] = useState("loading"); // loading | ready | error

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = window.storage?.get
          ? (await window.storage.get(key, true))?.value
          : window.localStorage.getItem(key);
        if (!cancelled && raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setItems(parsed);
        }
        if (!cancelled) setStatus("ready");
      } catch (e) {
        if (!cancelled) setStatus("ready"); // no hay datos guardados aún: se usan los valores por defecto
      }
    })();
    return () => { cancelled = true; };
  }, [key]);

  const persist = async (nextItems) => {
    setItems(nextItems);
    try {
      const serialized = JSON.stringify(nextItems);
      if (window.storage?.set) await window.storage.set(key, serialized, true);
      else window.localStorage.setItem(key, serialized);
      setStatus("ready");
    } catch (e) {
      setStatus("error");
    }
  };

  return [items, persist, status];
}

/* --------------------------- Componentes pequeños --------------------------- */
function ToneStyles(tone) {
  const map = {
    sage: { bg: C.sageSoft, fg: C.sage, border: C.sage },
    gold: { bg: C.goldSoft, fg: C.gold, border: C.gold },
    severe: { bg: C.severeSoft, fg: C.severe, border: C.severe },
    urgent: { bg: C.urgentSoft, fg: C.urgent, border: C.urgent },
    primary: { bg: C.primarySoft, fg: C.primary, border: C.primary },
    accent: { bg: C.accentSoft, fg: C.accent, border: C.accent },
  };
  return map[tone] || map.primary;
}

function Badge({ tone = "primary", children }) {
  const t = ToneStyles(tone);
  return (
    <span
      className="font-body inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold"
      style={{ backgroundColor: t.bg, color: t.fg }}
    >
      {children}
    </span>
  );
}

function Card({ children, className, style, onClick }) {
  return (
    <div
      onClick={onClick}
      className={cx("rounded-2xl p-5 sm:p-6", className, onClick && "cursor-pointer mente-focus")}
      style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, ...style }}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? "button" : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } } : undefined}
    >
      {children}
    </div>
  );
}

function SectionEyebrow({ children }) {
  return (
    <p className="font-mono text-xs tracking-widest uppercase mb-2" style={{ color: C.accent }}>
      {children}
    </p>
  );
}

function PageHeader({ eyebrow, title, subtitle }) {
  return (
    <div className="mb-8">
      {eyebrow && <SectionEyebrow>{eyebrow}</SectionEyebrow>}
      <h1 className="font-display text-3xl sm:text-4xl font-semibold" style={{ color: C.ink }}>{title}</h1>
      {subtitle && <p className="font-body mt-3 text-base sm:text-lg" style={{ color: C.inkSoft }}>{subtitle}</p>}
    </div>
  );
}

function DisclaimerBox({ children, tone = "primary", icon }) {
  const t = ToneStyles(tone);
  return (
    <div
      className="font-body rounded-xl p-4 flex gap-3 items-start text-sm"
      style={{ backgroundColor: t.bg, border: `1px solid ${t.border}55`, color: C.ink }}
    >
      <div className="mt-0.5 shrink-0">{icon || <Info size={18} color={t.fg} />}</div>
      <div>{children}</div>
    </div>
  );
}

function IconCircle({ children, tone = "primary", size = 44 }) {
  const t = ToneStyles(tone);
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0"
      style={{ width: size, height: size, backgroundColor: t.bg, color: t.fg }}
    >
      {children}
    </div>
  );
}

/* --------------------------- Ilustraciones de referencia por tema --------------------------- */
const ARTICLE_ART_TONE = {
  ansiedad: "primary", depresion: "accent", panico: "gold", estres: "primary",
  sueno: "accent", duelo: "sage", "ansiedad-social": "primary", autoestima: "gold",
  "pensamientos-intrusivos": "accent", trauma: "sage", burnout: "gold", sustancias: "primary",
};

function ArticleArtSvg({ slug, stroke }) {
  const common = { fill: "none", stroke, strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (slug) {
    case "ansiedad":
      return (<g {...common}><circle cx="20" cy="20" r="2.4" fill={stroke} stroke="none" /><circle cx="20" cy="20" r="9" opacity="0.55" /><circle cx="20" cy="20" r="15" opacity="0.3" /></g>);
    case "depresion":
      return (<g {...common}><path d="M12 19a6 6 0 0 1 1-11.8A7 7 0 0 1 26.5 9.6 5 5 0 0 1 26 19H12z" /><line x1="15" y1="24" x2="13" y2="29" /><line x1="20" y1="24" x2="19" y2="30" /><line x1="25" y1="24" x2="23" y2="29" /></g>);
    case "panico":
      return (<g {...common}>{[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => { const r1 = 5, r2 = 15; const rad = (deg * Math.PI) / 180; const x1 = 20 + r1 * Math.cos(rad), y1 = 20 + r1 * Math.sin(rad); const x2 = 20 + r2 * Math.cos(rad), y2 = 20 + r2 * Math.sin(rad); return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} />; })}</g>);
    case "estres":
      return (<g {...common}><path d="M7 14 Q13.5 6 20 14 T33 14" /><path d="M7 20 Q13.5 28 20 20 T33 20" /><path d="M7 26 Q13.5 18 20 26 T33 26" /></g>);
    case "sueno":
      return (<g {...common}><path d="M27 11a10 10 0 1 0 0 18 8 8 0 0 1 0-18Z" /><circle cx="10" cy="13" r="1.1" fill={stroke} stroke="none" /><circle cx="14" cy="9" r="0.8" fill={stroke} stroke="none" /></g>);
    case "duelo":
      return (<g {...common}><path d="M20 31V17" /><path d="M20 17q-7-4-3-11 7 2 3 11Z" /><path d="M20 24q-4 3-7 0" /></g>);
    case "ansiedad-social":
      return (<g {...common}><circle cx="13" cy="15" r="4.5" /><path d="M6 29q0-8 7-8t7 8" /><circle cx="28" cy="15" r="4.5" /><path d="M21 29q0-8 7-8t7 8" /><path d="M17 11h6" strokeDasharray="1.5 2.5" /></g>);
    case "autoestima":
      return (<g {...common}><path d="M7 27h26" /><path d="M12 27a8 8 0 0 1 16 0Z" /><line x1="20" y1="9" x2="20" y2="13" /><line x1="10.5" y1="14.5" x2="13" y2="17" /><line x1="29.5" y1="14.5" x2="27" y2="17" /></g>);
    case "pensamientos-intrusivos":
      return (<g {...common}><path d="M10 20c0-8 8-8 10-2 2 6 10 6 10-2 0-8-8-8-10-2-2 6-10 6-10-2" /></g>);
    case "trauma":
      return (<g {...common}><path d="M20 30C10 22 6 15 10 10c3-4 8-3 10 1 2-4 7-5 10-1 4 5 0 12-10 20Z" /><path d="M20 11l-3 6 4 2-3 7" /></g>);
    case "burnout":
      return (<g {...common}><line x1="20" y1="14" x2="20" y2="26" strokeWidth="3" /><path d="M20 14q-2.2-3.2 0-6.5q2.2 3.3 0 6.5Z" fill={stroke} /><path d="M20 26q-2.2 3.2 0 6.5q2.2-3.3 0-6.5Z" fill={stroke} /></g>);
    case "sustancias":
      return (<g {...common}><path d="M17 6h6v5l3 4.5V32a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2V15.5l3-4.5Z" /><line x1="14.5" y1="20" x2="25.5" y2="20" /><text x="20" y="28" fontSize="7.5" textAnchor="middle" fill={stroke} stroke="none" fontFamily="sans-serif">?</text></g>);
    default:
      return (<g {...common}><circle cx="20" cy="20" r="10" /></g>);
  }
}

function ArticleArt({ slug, size = 72 }) {
  const tone = ARTICLE_ART_TONE[slug] || "primary";
  const t = ToneStyles(tone);
  return (
    <div className="rounded-2xl flex items-center justify-center shrink-0" style={{ width: size, height: size, backgroundColor: t.bg }} aria-hidden="true">
      <svg viewBox="0 0 40 40" width={size * 0.62} height={size * 0.62}>
        <ArticleArtSvg slug={slug} stroke={t.fg} />
      </svg>
    </div>
  );
}

function ProgressBar({ step, total }) {
  return (
    <div className="mb-6">
      <div className="flex justify-between mb-2">
        <span className="font-mono text-xs" style={{ color: C.inkFaint }}>Paso {step} de {total}</span>
      </div>
      <div className="w-full h-2 rounded-full" style={{ backgroundColor: C.border }}>
        <div
          className="h-2 rounded-full transition-all duration-300"
          style={{ width: `${(step / total) * 100}%`, backgroundColor: C.primary }}
        />
      </div>
    </div>
  );
}

function PrimaryButton({ children, onClick, tone = "primary", full, disabled, type = "button" }) {
  const t = ToneStyles(tone);
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cx(
        "font-body mente-focus inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm sm:text-base font-semibold transition-transform active:scale-[0.98]",
        full && "w-full",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      style={{ backgroundColor: t.fg, color: "#FFFFFF" }}
    >
      {children}
    </button>
  );
}

function GhostButton({ children, onClick, full }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "font-body mente-focus inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm sm:text-base font-semibold border transition-colors",
        full && "w-full"
      )}
      style={{ borderColor: C.border, color: C.ink, backgroundColor: "transparent" }}
    >
      {children}
    </button>
  );
}

function FormField({ label, children }) {
  return (
    <label className="font-body block mb-4">
      <span className="block text-sm font-semibold mb-1.5" style={{ color: C.ink }}>{label}</span>
      {children}
    </label>
  );
}

const inputStyle = {
  width: "100%", borderRadius: "0.75rem", border: `1px solid ${C.border}`,
  padding: "0.65rem 0.9rem", fontSize: "0.95rem", color: C.ink, backgroundColor: "#FFFFFF",
};

/* --------------------------- Navegación --------------------------- */
function NavBar({ page, navigate }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40" style={{ backgroundColor: `${C.bg}F2`, backdropFilter: "blur(6px)", borderBottom: `1px solid ${C.border}` }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <button className="font-display text-xl font-semibold mente-focus rounded-lg" style={{ color: C.primary }} onClick={() => navigate("home")}>
          SINAPSIS
        </button>
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className="font-body mente-focus rounded-full px-4 py-2 text-sm font-medium transition-colors"
              style={{
                color: page === item.id ? C.primary : C.inkSoft,
                backgroundColor: page === item.id ? C.primarySoft : "transparent",
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("urgent")}
            className="font-body mente-focus hidden sm:inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white"
            style={{ backgroundColor: C.urgent }}
          >
            <LifeBuoy size={16} /> Ayuda urgente
          </button>
          <button className="md:hidden mente-focus rounded-lg p-2" style={{ color: C.ink }} onClick={() => setOpen((o) => !o)} aria-label={open ? "Cerrar menú" : "Abrir menú"} aria-expanded={open}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden px-4 pb-4 flex flex-col gap-1" style={{ borderTop: `1px solid ${C.border}` }}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => { navigate(item.id); setOpen(false); }}
              className="font-body mente-focus text-left rounded-lg px-3 py-2.5 text-sm font-medium"
              style={{ color: page === item.id ? C.primary : C.inkSoft, backgroundColor: page === item.id ? C.primarySoft : "transparent" }}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => { navigate("urgent"); setOpen(false); }}
            className="font-body mente-focus mt-2 text-left rounded-lg px-3 py-2.5 text-sm font-semibold text-white flex items-center gap-2"
            style={{ backgroundColor: C.urgent }}
          >
            <LifeBuoy size={16} /> Ayuda urgente
          </button>
        </div>
      )}
    </header>
  );
}

function UrgentFloatingButton({ navigate, page }) {
  if (page === "urgent") return null;
  return (
    <button
      onClick={() => navigate("urgent")}
      className="sm:hidden fixed bottom-5 right-5 z-50 mente-focus rounded-full shadow-lg px-4 py-3 text-white text-sm font-semibold flex items-center gap-2"
      style={{ backgroundColor: C.urgent, boxShadow: "0 8px 24px rgba(178,58,50,0.35)" }}
    >
      <LifeBuoy size={18} /> Ayuda urgente
    </button>
  );
}

function Footer({ navigate }) {
  return (
    <footer className="mt-20" style={{ borderTop: `1px solid ${C.border}` }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid sm:grid-cols-3 gap-8">
        <div>
          <p className="font-display text-lg font-semibold" style={{ color: C.primary }}>SINAPSIS</p>
          <p className="font-body text-sm mt-2" style={{ color: C.inkSoft }}>
            Entender lo que sientes es el primer paso para pedir ayuda.
          </p>
        </div>
        <div className="font-body text-sm flex flex-col gap-2" style={{ color: C.inkSoft }}>
          <button className="text-left mente-focus rounded" onClick={() => navigate("privacy")}>Privacidad</button>
          <button className="text-left mente-focus rounded" onClick={() => navigate("sources")}>Fuentes y evidencia</button>
          <button className="text-left mente-focus rounded" onClick={() => navigate("admin")}>Panel de administración</button>
        </div>
        <div className="font-body text-sm" style={{ color: C.inkFaint }}>
          SINAPSIS no realiza diagnósticos médicos. Las evaluaciones son herramientas orientativas y no sustituyen la valoración de un profesional de salud.
        </div>
      </div>
    </footer>
  );
}

/* --------------------------- Página de inicio --------------------------- */
function BreathingGlyph() {
  return (
    <div className="relative w-56 h-56 sm:w-72 sm:h-72 mx-auto" aria-hidden="true">
      <div className="absolute inset-0 rounded-full pulse-slow" style={{ backgroundColor: C.primarySoft }} />
      <div className="absolute inset-8 rounded-full pulse-slow" style={{ backgroundColor: C.sageSoft, animationDelay: "0.6s" }} />
      <div className="absolute inset-16 rounded-full pulse-slow" style={{ backgroundColor: C.accentSoft, animationDelay: "1.2s" }} />
      <div className="absolute inset-0 flex items-center justify-center">
        <Brain size={58} strokeWidth={2.2} color={C.primary} />
      </div>
    </div>
  );
}

function HomePage({ navigate }) {
  const entryCards = [
    { key: "eval-info", label: "Quiero entender lo que siento", desc: "Explora información clara sobre síntomas y emociones comunes.", icon: <BookOpen size={20} />, tone: "primary", action: () => navigate("library") },
    { key: "eval", label: "Quiero evaluar mis síntomas", desc: "Responde un cuestionario breve y orientativo (PHQ-9 y GAD-7).", icon: <ClipboardList size={20} />, tone: "accent", action: () => navigate("eval") },
    { key: "urgent", label: "Necesito ayuda ahora", desc: "Accede directamente a recursos de ayuda urgente.", icon: <LifeBuoy size={20} />, tone: "urgent", action: () => navigate("urgent") },
  ];
  const featureCards = [
    { title: "Evaluaciones", desc: "Cuestionarios validados, explicados en lenguaje simple.", icon: <ClipboardList size={20} />, action: () => navigate("eval") },
    { title: "Información sobre salud mental", desc: "Artículos claros sobre ansiedad, depresión y más.", icon: <BookOpen size={20} />, action: () => navigate("library") },
    { title: "Herramientas de autocuidado", desc: "Ejercicios prácticos para momentos difíciles.", icon: <Wrench size={20} />, action: () => navigate("tools") },
    { title: "Profesionales y servicios de ayuda", desc: "Encuentra a quién acudir, según tu presupuesto y ciudad.", icon: <Stethoscope size={20} />, action: () => navigate("directory") },
  ];
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <div>
          <p className="font-display text-4xl sm:text-5xl font-semibold leading-tight" style={{ color: C.primary }}>SINAPSIS</p>
          <p className="font-display text-xl sm:text-2xl mt-4" style={{ color: C.ink }}>
            "Entender lo que sientes es el primer paso para pedir ayuda."
          </p>
          <p className="font-body mt-4 text-base sm:text-lg" style={{ color: C.inkSoft }}>
            Una plataforma para comprender tus síntomas, aprender sobre salud mental y encontrar el tipo de ayuda que necesitas.
          </p>
        </div>
        <BreathingGlyph />
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mt-10">
        {entryCards.map((c) => (
          <Card key={c.key} onClick={c.action} className="flex flex-col gap-3 hover:shadow-md transition-shadow">
            <IconCircle tone={c.tone}>{c.icon}</IconCircle>
            <p className="font-body font-semibold text-base" style={{ color: C.ink }}>{c.label}</p>
            <p className="font-body text-sm" style={{ color: C.inkSoft }}>{c.desc}</p>
            <span className="font-body text-sm font-semibold inline-flex items-center gap-1 mt-auto" style={{ color: ToneStyles(c.tone).fg }}>
              Continuar <ChevronRight size={16} />
            </span>
          </Card>
        ))}
      </div>

      <div className="mt-6">
        <DisclaimerBox tone="primary">
          SINAPSIS no realiza diagnósticos médicos. Las evaluaciones disponibles son herramientas de orientación y no sustituyen la valoración de un profesional.
        </DisclaimerBox>
      </div>

      <div className="mt-16">
        <PageHeader eyebrow="Explora" title="¿Qué puedes encontrar aquí?" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featureCards.map((f) => (
            <Card key={f.title} onClick={f.action} className="flex flex-col gap-3 hover:shadow-md transition-shadow">
              <IconCircle tone="primary">{f.icon}</IconCircle>
              <p className="font-body font-semibold text-sm" style={{ color: C.ink }}>{f.title}</p>
              <p className="font-body text-sm" style={{ color: C.inkSoft }}>{f.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

/* --------------------------- Pantalla de crisis --------------------------- */
function CrisisScreen({ navigate }) {
  const actions = [
    { label: "Llamar a emergencias", icon: <Phone size={18} />, action: () => navigate("urgent") },
    { label: "Buscar atención urgente", icon: <Stethoscope size={18} />, action: () => navigate("urgent") },
    { label: "Contactar una línea de crisis", icon: <LifeBuoy size={18} />, action: () => navigate("urgent") },
    { label: "Hablar con una persona de confianza", icon: <HandHeart size={18} />, action: () => navigate("urgent") },
    { label: "Buscar un profesional", icon: <Users size={18} />, action: () => navigate("directory") },
  ];
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14">
      <Card style={{ borderColor: C.urgent, borderWidth: 2 }} className="text-center">
        <IconCircle tone="urgent" size={64}><ShieldAlert size={30} /></IconCircle>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold mt-4" style={{ color: C.ink }}>
          🚨 Necesitas apoyo inmediato
        </h1>
        <p className="font-body mt-3 text-base" style={{ color: C.inkSoft }}>
          Tus respuestas indican que sería importante recibir ayuda humana. Esta plataforma no puede determinar por sí sola tu nivel de seguridad.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          {actions.map((a) => (
            <PrimaryButton key={a.label} tone="urgent" full onClick={a.action}>{a.icon} {a.label}</PrimaryButton>
          ))}
        </div>
        <button onClick={() => navigate("home")} className="font-body mente-focus text-sm mt-6 underline" style={{ color: C.inkFaint }}>
          Volver al inicio
        </button>
      </Card>
    </div>
  );
}

/* --------------------------- Flujo de evaluación --------------------------- */
function EvaluationFlow({ navigate, triggerCrisis }) {
  const [step, setStep] = useState("intro");
  const [initialData, setInitialData] = useState({ age: "", location: "", studies: "", works: "", hasProfessional: "", priorDiagnosis: "" });
  const [safetyAnswers, setSafetyAnswers] = useState({});
  const [phqAnswers, setPhqAnswers] = useState(Array(PHQ9_ITEMS.length).fill(null));
  const [gadAnswers, setGadAnswers] = useState(Array(GAD7_ITEMS.length).fill(null));
  const [impact, setImpact] = useState(null);

  const stepOrder = ["intro", "datos", "seguridad", "phq9", "gad7", "impacto", "resultados"];
  const stepIndex = stepOrder.indexOf(step);

  function goNext() {
    const idx = stepOrder.indexOf(step);
    if (step === "seguridad") {
      const risky = SAFETY_QUESTIONS.some((q) => safetyAnswers[q.id] === true);
      if (risky) { triggerCrisis(); return; }
    }
    if (idx < stepOrder.length - 1) setStep(stepOrder[idx + 1]);
  }
  function goBack() {
    const idx = stepOrder.indexOf(step);
    if (idx > 0) setStep(stepOrder[idx - 1]);
    else navigate("home");
  }

  if (step === "intro") {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <PageHeader eyebrow="Evaluación" title="Vamos a explorar cómo te has sentido" />
        <Card>
          <p className="font-body text-base" style={{ color: C.ink }}>
            Estas preguntas pueden ayudarte a identificar síntomas que podrían justificar una conversación con un profesional. No pueden determinar por sí solas si tienes una enfermedad mental.
          </p>
          <ul className="font-body text-sm mt-4 space-y-1.5" style={{ color: C.inkSoft }}>
            <li>• Toma entre 5 y 8 minutos.</li>
            <li>• Puedes abandonar la evaluación en cualquier momento.</li>
            <li>• Tus respuestas a preguntas sensibles no se almacenan.</li>
          </ul>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <PrimaryButton onClick={goNext} full>Comenzar <ArrowRight size={16} /></PrimaryButton>
            <GhostButton full onClick={() => navigate("home")}>Ahora no</GhostButton>
          </div>
        </Card>
      </div>
    );
  }

  if (step === "datos") {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <ProgressBar step={1} total={5} />
        <PageHeader title="Cuéntanos un poco de contexto" subtitle="Solo pedimos lo necesario." />
        <Card>
          <FormField label="Edad">
            <input style={inputStyle} type="number" min="10" max="110" value={initialData.age} onChange={(e) => setInitialData({ ...initialData, age: e.target.value })} />
          </FormField>
          <FormField label="Ciudad / ubicación general">
            <input style={inputStyle} type="text" placeholder="Ej. Santa Cruz de la Sierra" value={initialData.location} onChange={(e) => setInitialData({ ...initialData, location: e.target.value })} />
          </FormField>
          <div className="grid sm:grid-cols-2 gap-x-4">
            <FormField label="¿Estudias? (opcional)">
              <select style={inputStyle} value={initialData.studies} onChange={(e) => setInitialData({ ...initialData, studies: e.target.value })}>
                <option value="">Prefiero no decir</option><option value="si">Sí</option><option value="no">No</option>
              </select>
            </FormField>
            <FormField label="¿Trabajas? (opcional)">
              <select style={inputStyle} value={initialData.works} onChange={(e) => setInitialData({ ...initialData, works: e.target.value })}>
                <option value="">Prefiero no decir</option><option value="si">Sí</option><option value="no">No</option>
              </select>
            </FormField>
            <FormField label="¿Tienes actualmente un profesional de salud mental? (opcional)">
              <select style={inputStyle} value={initialData.hasProfessional} onChange={(e) => setInitialData({ ...initialData, hasProfessional: e.target.value })}>
                <option value="">Prefiero no decir</option><option value="si">Sí</option><option value="no">No</option>
              </select>
            </FormField>
            <FormField label="¿Has recibido antes algún diagnóstico? (opcional)">
              <select style={inputStyle} value={initialData.priorDiagnosis} onChange={(e) => setInitialData({ ...initialData, priorDiagnosis: e.target.value })}>
                <option value="">Prefiero no decir</option><option value="si">Sí</option><option value="no">No</option>
              </select>
            </FormField>
          </div>
          <div className="mt-4 flex gap-3">
            <GhostButton onClick={goBack}><ArrowLeft size={16} /> Atrás</GhostButton>
            <PrimaryButton full onClick={goNext} disabled={!initialData.age}>Continuar <ArrowRight size={16} /></PrimaryButton>
          </div>
        </Card>
      </div>
    );
  }

  if (step === "seguridad") {
    const answeredAll = SAFETY_QUESTIONS.every((q) => safetyAnswers[q.id] !== undefined);
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <ProgressBar step={2} total={5} />
        <PageHeader title="Antes de continuar" subtitle="Estas preguntas nos ayudan a cuidar tu seguridad. Responde con honestidad." />
        <Card className="flex flex-col gap-5">
          {SAFETY_QUESTIONS.map((q) => (
            <div key={q.id}>
              <p className="font-body text-sm font-medium mb-2" style={{ color: C.ink }}>{q.text}</p>
              <div className="flex gap-3">
                {[{ v: true, l: "Sí" }, { v: false, l: "No" }].map((opt) => (
                  <button
                    key={String(opt.v)}
                    onClick={() => setSafetyAnswers({ ...safetyAnswers, [q.id]: opt.v })}
                    className="font-body mente-focus rounded-full px-5 py-2 text-sm font-semibold border"
                    style={{
                      borderColor: safetyAnswers[q.id] === opt.v ? C.primary : C.border,
                      backgroundColor: safetyAnswers[q.id] === opt.v ? C.primarySoft : "transparent",
                      color: safetyAnswers[q.id] === opt.v ? C.primary : C.inkSoft,
                    }}
                  >
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div className="mt-2 flex gap-3">
            <GhostButton onClick={goBack}><ArrowLeft size={16} /> Atrás</GhostButton>
            <PrimaryButton full onClick={goNext} disabled={!answeredAll}>Continuar <ArrowRight size={16} /></PrimaryButton>
          </div>
        </Card>
      </div>
    );
  }

  if (step === "phq9" || step === "gad7") {
    const isPhq = step === "phq9";
    const items = isPhq ? PHQ9_ITEMS : GAD7_ITEMS;
    const answers = isPhq ? phqAnswers : gadAnswers;
    const setAnswers = isPhq ? setPhqAnswers : setGadAnswers;
    const answeredAll = answers.every((a) => a !== null);
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <ProgressBar step={isPhq ? 3 : 4} total={5} />
        <PageHeader
          title={isPhq ? "Síntomas depresivos" : "Síntomas de ansiedad"}
          subtitle="En las últimas dos semanas, ¿con qué frecuencia te ha molestado lo siguiente?"
        />
        <div className="flex flex-col gap-4">
          {items.map((text, i) => (
            <Card key={i}>
              <p className="font-body text-sm font-medium mb-3" style={{ color: C.ink }}>{i + 1}. {text}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {FREQ_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { const next = [...answers]; next[i] = opt.value; setAnswers(next); }}
                    className="font-body mente-focus rounded-lg px-2 py-2 text-xs font-medium border text-center"
                    style={{
                      borderColor: answers[i] === opt.value ? C.primary : C.border,
                      backgroundColor: answers[i] === opt.value ? C.primarySoft : "transparent",
                      color: answers[i] === opt.value ? C.primary : C.inkSoft,
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-6 flex gap-3">
          <GhostButton onClick={goBack}><ArrowLeft size={16} /> Atrás</GhostButton>
          <PrimaryButton full onClick={goNext} disabled={!answeredAll}>Continuar <ArrowRight size={16} /></PrimaryButton>
        </div>
      </div>
    );
  }

  if (step === "impacto") {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <ProgressBar step={5} total={5} />
        <PageHeader title="Una última pregunta" subtitle="¿Qué tan difícil te han resultado estos problemas para tu trabajo, tus tareas o tus relaciones?" />
        <Card className="flex flex-col gap-2">
          {IMPACT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setImpact(opt.value)}
              className="font-body mente-focus text-left rounded-lg px-4 py-3 text-sm font-medium border"
              style={{
                borderColor: impact === opt.value ? C.primary : C.border,
                backgroundColor: impact === opt.value ? C.primarySoft : "transparent",
                color: impact === opt.value ? C.primary : C.inkSoft,
              }}
            >
              {opt.label}
            </button>
          ))}
          <div className="mt-4 flex gap-3">
            <GhostButton onClick={goBack}><ArrowLeft size={16} /> Atrás</GhostButton>
            <PrimaryButton full onClick={goNext} disabled={impact === null}>Ver resultados <ArrowRight size={16} /></PrimaryButton>
          </div>
        </Card>
      </div>
    );
  }

  if (step === "resultados") {
    const phqScore = phqAnswers.reduce((a, b) => a + (b || 0), 0);
    const gadScore = gadAnswers.reduce((a, b) => a + (b || 0), 0);
    const phqClass = classifyPHQ9(phqScore);
    const gadClass = classifyGAD7(gadScore);
    const item9Risk = (phqAnswers[8] || 0) > 0;
    const rec = recommendationFor({ phq: phqClass, gad: gadClass, impact, risk: item9Risk });

    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <PageHeader eyebrow="Resultado" title="Resultado de tu evaluación" />

        {item9Risk && (
          <div className="mb-6">
            <DisclaimerBox tone="urgent" icon={<ShieldAlert size={18} color={C.urgent} />}>
              <p className="font-semibold mb-1">Señales de emergencia detectadas</p>
              Marcaste haber tenido pensamientos de muerte o de hacerte daño. Te recomendamos ir directamente a la sección de ayuda urgente.
            </DisclaimerBox>
            <div className="mt-3"><PrimaryButton tone="urgent" full onClick={() => navigate("urgent")}><LifeBuoy size={16} /> Ir a ayuda urgente</PrimaryButton></div>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <Card>
            <p className="font-mono text-xs uppercase tracking-wide" style={{ color: C.inkFaint }}>Síntomas depresivos</p>
            <p className="font-display text-2xl font-semibold mt-1" style={{ color: C.ink }}>{phqScore} / 27</p>
            <div className="mt-2"><Badge tone={phqClass.tone}>{phqClass.label}</Badge></div>
          </Card>
          <Card>
            <p className="font-mono text-xs uppercase tracking-wide" style={{ color: C.inkFaint }}>Síntomas de ansiedad</p>
            <p className="font-display text-2xl font-semibold mt-1" style={{ color: C.ink }}>{gadScore} / 21</p>
            <div className="mt-2"><Badge tone={gadClass.tone}>{gadClass.label}</Badge></div>
          </Card>
          <Card>
            <p className="font-mono text-xs uppercase tracking-wide" style={{ color: C.inkFaint }}>Impacto funcional</p>
            <p className="font-body text-sm mt-2" style={{ color: C.ink }}>{IMPACT_OPTIONS.find((o) => o.value === impact)?.label}</p>
          </Card>
          <Card>
            <p className="font-mono text-xs uppercase tracking-wide" style={{ color: C.inkFaint }}>Señales de emergencia</p>
            <p className="font-body text-sm mt-2" style={{ color: C.ink }}>{item9Risk ? "Detectadas" : "No detectadas"}</p>
          </Card>
        </div>

        <Card className="mb-4">
          <p className="font-body text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: C.inkFaint }}>¿Qué significa esto?</p>
          <p className="font-body text-sm" style={{ color: C.ink }}>
            Este cuestionario mide la frecuencia de ciertos síntomas en las últimas dos semanas y ofrece un nivel de síntomas identificado mediante el cuestionario — no un diagnóstico. Un profesional puede evaluar tu historia personal, la duración e intensidad de tus síntomas, el contexto y otras posibles causas antes de establecer un diagnóstico.
          </p>
        </Card>

        <Card style={{ borderColor: ToneStyles(rec.tone).border, borderWidth: 2 }} className="mb-4">
          <div className="flex items-start gap-3">
            <IconCircle tone={rec.tone}><Sparkles size={20} /></IconCircle>
            <div>
              <p className="font-display text-lg font-semibold" style={{ color: C.ink }}>{rec.title}</p>
              <p className="font-body text-sm mt-1" style={{ color: C.inkSoft }}>{rec.text}</p>
            </div>
          </div>
        </Card>

        <DisclaimerBox tone="primary">Este resultado no constituye un diagnóstico.</DisclaimerBox>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <PrimaryButton full onClick={() => navigate("library")}><BookOpen size={16} /> Aprender más</PrimaryButton>
          <PrimaryButton full tone="accent" onClick={() => navigate("directory")}><Stethoscope size={16} /> Buscar un profesional</PrimaryButton>
          <GhostButton full onClick={() => navigate("tools")}><Wrench size={16} /> Ver herramientas</GhostButton>
        </div>
      </div>
    );
  }

  return null;
}

/* --------------------------- Biblioteca --------------------------- */
function LibraryPage({ navigate, openArticle }) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <PageHeader eyebrow="Biblioteca" title="Explora tu salud mental" subtitle="Información clara, pensada para alguien sin conocimientos médicos." />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ARTICLES.map((a) => (
          <Card key={a.slug} onClick={() => openArticle(a.slug)} className="flex flex-col gap-3 hover:shadow-md transition-shadow">
            <ArticleArt slug={a.slug} />
            <p className="font-body font-semibold text-base" style={{ color: C.ink }}>{a.title}</p>
            <p className="font-body text-sm" style={{ color: C.inkSoft }}>{a.short}</p>
            <span className="font-body text-sm font-semibold inline-flex items-center gap-1 mt-auto" style={{ color: C.primary }}>
              Leer más <ChevronRight size={16} />
            </span>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ArticlePage({ slug, navigate, openTool }) {
  const article = ARTICLES.find((a) => a.slug === slug);
  if (!article) return <div className="max-w-3xl mx-auto px-4 py-12">Artículo no encontrado.</div>;
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <button onClick={() => navigate("library")} className="font-body mente-focus text-sm inline-flex items-center gap-1 mb-6" style={{ color: C.inkSoft }}>
        <ArrowLeft size={16} /> Volver a la biblioteca
      </button>
      <div className="flex items-center gap-4 mb-8">
        <ArticleArt slug={article.slug} size={84} />
        <div>
          <SectionEyebrow>Salud mental</SectionEyebrow>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold" style={{ color: C.ink }}>{article.title}</h1>
          <p className="font-body mt-1 text-base" style={{ color: C.inkSoft }}>{article.short}</p>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {SECTION_LABELS.map(([key, label]) => (
          <Card key={key}>
            <p className="font-display text-lg font-semibold mb-2" style={{ color: C.primary }}>{label}</p>
            {key === "herramientas" ? (
              <div className="flex flex-wrap gap-2">
                {article.sections.herramientas.map((toolSlug) => {
                  const tool = TOOLS.find((t) => t.slug === toolSlug);
                  if (!tool) return null;
                  return (
                    <button key={toolSlug} onClick={() => openTool(toolSlug)} className="font-body mente-focus rounded-full px-4 py-2 text-sm font-medium border" style={{ borderColor: C.border, color: C.primary }}>
                      {tool.title}
                    </button>
                  );
                })}
              </div>
            ) : (
              <ul className="font-body text-sm space-y-1.5" style={{ color: C.inkSoft }}>
                {article.sections[key].map((line, i) => <li key={i}>• {line}</li>)}
              </ul>
            )}
          </Card>
        ))}
      </div>
      <div className="mt-6">
        <DisclaimerBox tone="primary">
          Este artículo tiene fines educativos y no constituye un diagnóstico. Si algo de lo que leíste resuena mucho contigo, considera hablar con un profesional.
        </DisclaimerBox>
      </div>
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <PrimaryButton full onClick={() => navigate("eval")}><ClipboardList size={16} /> Evaluar mis síntomas</PrimaryButton>
        <GhostButton full onClick={() => navigate("directory")}><Stethoscope size={16} /> Buscar un profesional</GhostButton>
      </div>
    </div>
  );
}

/* --------------------------- Herramientas: páginas --------------------------- */
function ToolsPage({ navigate, openTool }) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <PageHeader eyebrow="Herramientas" title="Herramientas para afrontar momentos difíciles" subtitle="Ejercicios prácticos. Ninguno sustituye la atención profesional." />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TOOLS.map((t) => (
          <Card key={t.slug} onClick={() => openTool(t.slug)} className="flex flex-col gap-3 hover:shadow-md transition-shadow">
            <IconCircle tone="accent"><Wrench size={20} /></IconCircle>
            <p className="font-body font-semibold text-base" style={{ color: C.ink }}>{t.title}</p>
            <p className="font-body text-sm" style={{ color: C.inkSoft }}>{t.quees}</p>
            <span className="font-body text-sm font-semibold inline-flex items-center gap-1 mt-auto" style={{ color: C.accent }}>
              Abrir <ChevronRight size={16} />
            </span>
          </Card>
        ))}
      </div>
    </div>
  );
}

function BreathingExercise() {
  const phases = [
    { label: "Inhala", seconds: 4 },
    { label: "Sostén", seconds: 4 },
    { label: "Exhala", seconds: 6 },
    { label: "Sostén", seconds: 2 },
  ];
  const [running, setRunning] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [countdown, setCountdown] = useState(phases[0].seconds);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    try {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReducedMotion(mq.matches);
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          setPhaseIdx((p) => (p + 1) % phases.length);
          return phases[(phaseIdx + 1) % phases.length].seconds;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, phaseIdx]);

  const scale = phases[phaseIdx].label === "Inhala" ? 1 : phases[phaseIdx].label === "Exhala" ? 0.72 : phaseIdx === 1 ? 1 : 0.72;

  function toggle() {
    if (!running) { setPhaseIdx(0); setCountdown(phases[0].seconds); }
    setRunning((r) => !r);
  }

  return (
    <Card className="flex flex-col items-center text-center py-10">
      <div className="relative w-48 h-48 flex items-center justify-center">
        <div
          className="breathe-anim rounded-full absolute"
          style={{
            width: "100%", height: "100%", backgroundColor: C.primarySoft,
            transform: reducedMotion ? "scale(1)" : `scale(${scale})`,
            transition: reducedMotion ? "none" : `transform ${phases[phaseIdx].seconds}s ease-in-out`,
          }}
        />
        <div className="relative z-10">
          <p className="font-display text-2xl font-semibold" style={{ color: C.primary }}>{running ? phases[phaseIdx].label : "Lista"}</p>
          <p className="font-mono text-3xl mt-1" style={{ color: C.ink }}>{running ? countdown : "—"}</p>
        </div>
      </div>
      <div className="mt-6">
        <PrimaryButton onClick={toggle}>{running ? "Detener" : "Comenzar"}</PrimaryButton>
      </div>
      <p className="font-body text-xs mt-4 max-w-xs" style={{ color: C.inkFaint }}>
        Patrón de 4 segundos inhalando, 4 sosteniendo, 6 exhalando y 2 sosteniendo. Ajusta el ritmo si te resulta incómodo.
      </p>
    </Card>
  );
}

function GroundingExercise() {
  const steps = [
    { count: 5, sense: "cosas que puedes VER" },
    { count: 4, sense: "cosas que puedes TOCAR" },
    { count: 3, sense: "cosas que puedes ESCUCHAR" },
    { count: 2, sense: "cosas que puedes OLER" },
    { count: 1, sense: "cosa que puedes SABOREAR" },
  ];
  const [idx, setIdx] = useState(0);
  const [note, setNote] = useState("");
  const done = idx >= steps.length;

  return (
    <Card className="text-center py-8">
      {!done ? (
        <>
          <p className="font-mono text-xs uppercase tracking-widest" style={{ color: C.accent }}>Paso {idx + 1} de 5</p>
          <p className="font-display text-3xl font-semibold mt-2" style={{ color: C.ink }}>{steps[idx].count}</p>
          <p className="font-body text-base mt-1" style={{ color: C.ink }}>{steps[idx].sense}</p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Puedes escribirlas aquí (opcional)"
            className="font-body mt-4 w-full rounded-xl p-3 text-sm"
            style={{ ...inputStyle, minHeight: 70 }}
          />
          <div className="mt-4">
            <PrimaryButton onClick={() => { setIdx(idx + 1); setNote(""); }}>Listo, siguiente <ArrowRight size={16} /></PrimaryButton>
          </div>
        </>
      ) : (
        <>
          <IconCircle tone="sage" size={56}><Check size={26} /></IconCircle>
          <p className="font-display text-xl font-semibold mt-3" style={{ color: C.ink }}>Bien hecho</p>
          <p className="font-body text-sm mt-1" style={{ color: C.inkSoft }}>Tómate un momento antes de seguir con tu día.</p>
          <div className="mt-4"><GhostButton onClick={() => setIdx(0)}>Repetir</GhostButton></div>
        </>
      )}
    </Card>
  );
}

function ToolDetail({ slug, navigate }) {
  const tool = TOOLS.find((t) => t.slug === slug);
  if (!tool) return <div className="max-w-2xl mx-auto px-4 py-12">Herramienta no encontrada.</div>;
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <button onClick={() => navigate("tools")} className="font-body mente-focus text-sm inline-flex items-center gap-1 mb-6" style={{ color: C.inkSoft }}>
        <ArrowLeft size={16} /> Volver a herramientas
      </button>
      <PageHeader eyebrow="Herramienta" title={tool.title} />

      {tool.interactive === "breathing" && <div className="mb-6"><BreathingExercise /></div>}
      {tool.interactive === "grounding" && <div className="mb-6"><GroundingExercise /></div>}

      <div className="flex flex-col gap-4">
        <Card>
          <p className="font-display text-base font-semibold mb-1" style={{ color: C.primary }}>¿Qué es?</p>
          <p className="font-body text-sm" style={{ color: C.inkSoft }}>{tool.quees}</p>
        </Card>
        <Card>
          <p className="font-display text-base font-semibold mb-1" style={{ color: C.primary }}>¿Para qué puede servir?</p>
          <p className="font-body text-sm" style={{ color: C.inkSoft }}>{tool.paraQue}</p>
        </Card>
        <Card>
          <p className="font-display text-base font-semibold mb-2" style={{ color: C.primary }}>¿Cómo realizarla?</p>
          <ol className="font-body text-sm space-y-1.5 list-decimal list-inside" style={{ color: C.inkSoft }}>
            {tool.pasos.map((p, i) => <li key={i}>{p}</li>)}
          </ol>
        </Card>
        <Card>
          <p className="font-display text-base font-semibold mb-1" style={{ color: C.primary }}>¿Cuándo NO es suficiente?</p>
          <p className="font-body text-sm" style={{ color: C.inkSoft }}>{tool.cuandoNoBasta}</p>
        </Card>
      </div>
      <div className="mt-6">
        <DisclaimerBox tone="primary">Esta herramienta no sustituye la atención profesional.</DisclaimerBox>
      </div>
    </div>
  );
}

/* --------------------------- Directorio de profesionales --------------------------- */
function DirectoryPage({ navigate }) {
  const [professionals] = useStoredList("mente-professionals", DEFAULT_PROFESSIONALS);
  const [filters, setFilters] = useState({ profession: "", modality: "", cost: "" });

  const filtered = professionals.filter((p) =>
    (!filters.profession || p.profession === filters.profession) &&
    (!filters.modality || p.modality === filters.modality) &&
    (!filters.cost || p.cost === filters.cost)
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <PageHeader eyebrow="Directorio" title="Encuentra ayuda profesional" subtitle="Filtra según tus necesidades. Todos los profesionales listados están en Santa Cruz de la Sierra." />
      <Card className="mb-6">
        <div className="grid sm:grid-cols-3 gap-3">
          <FormField label="Tipo de profesional">
            <select style={inputStyle} value={filters.profession} onChange={(e) => setFilters({ ...filters, profession: e.target.value })}>
              <option value="">Todos</option>
              {["Psicólogo/a", "Psiquiatra", "Médico/a general", "Terapia familiar"].map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </FormField>
          <FormField label="Modalidad">
            <select style={inputStyle} value={filters.modality} onChange={(e) => setFilters({ ...filters, modality: e.target.value })}>
              <option value="">Todas</option>
              {["Presencial", "Virtual"].map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </FormField>
          <FormField label="Costo">
            <select style={inputStyle} value={filters.cost} onChange={(e) => setFilters({ ...filters, cost: e.target.value })}>
              <option value="">Todos</option>
              {["Gratuito", "Bajo costo", "Particular"].map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </FormField>
        </div>
      </Card>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <Card key={p.id} className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <p className="font-body font-semibold text-base" style={{ color: C.ink }}>{p.name}</p>
              {p.sample ? <Badge tone="gold">EJEMPLO</Badge> : p.verified ? <Badge tone="sage">✓ Verificado</Badge> : p.source === "gmaps" ? <Badge tone="primary">Google Maps</Badge> : null}
            </div>
            <p className="font-body text-sm font-medium" style={{ color: C.primary }}>{p.profession} · {p.specialty}</p>
            <p className="font-body text-xs flex items-center gap-1" style={{ color: C.inkFaint }}><MapPin size={13} /> {p.address ? `${p.address}, ` : ""}{p.city}</p>
            <p className="font-body text-xs flex items-center gap-1" style={{ color: C.inkFaint }}><DollarSign size={13} /> {p.cost} · {p.price}</p>
              <p className="font-body text-sm" style={{ color: C.inkSoft }}>{p.description?.replaceAll("Synapsis", "SINAPSIS")}</p>
            <div className="mt-2 flex gap-2 flex-wrap">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((p.name + " " + (p.address || "") + " " + p.city + " Bolivia").trim())}`}
                target="_blank" rel="noopener noreferrer"
                className="font-body mente-focus inline-flex items-center justify-center gap-1.5 rounded-full px-6 py-3 text-sm font-semibold border"
                style={{ borderColor: C.border, color: C.ink }}
              >
                <MapPin size={15} /> Ver ubicación
              </a>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="font-body text-sm" style={{ color: C.inkFaint }}>No hay profesionales que coincidan con estos filtros todavía.</p>
        )}
      </div>

      <div className="mt-8">
        <DisclaimerBox tone="primary">
          Los perfiles marcados "Google Maps" fueron encontrados en una búsqueda pública en Google Maps. Son negocios reales, pero SINAPSIS todavía no ha confirmado directamente sus datos de contacto, modalidad, costo ni licencia — por eso no tienen el sello "✓ Verificado". Los marcados "EJEMPLO" son datos de muestra ficticios. Para confirmar la matrícula de un psicólogo en Bolivia, el Colegio de Psicólogos de Santa Cruz es un buen punto de partida.
        </DisclaimerBox>
      </div>
      <div className="mt-4">
        <GhostButton onClick={() => navigate("free")}>¿No puedes pagar una consulta? Ver servicios gratuitos <ArrowRight size={16} /></GhostButton>
      </div>
    </div>
  );
}

/* --------------------------- Servicios gratuitos --------------------------- */
function FreeServicesPage({ navigate }) {
  const [services] = useStoredList("mente-free-services", DEFAULT_FREE_SERVICES);
  const groups = [
    { label: "GRATUITO", value: "Gratuito" },
    { label: "BAJO COSTO", value: "Bajo costo" },
  ];
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <PageHeader eyebrow="Acceso" title="¿No puedes pagar una consulta?" subtitle="Servicios públicos, universitarios y comunitarios disponibles." />
      {groups.map((g) => {
        const list = services.filter((s) => s.category === g.value);
        if (list.length === 0) return null;
        return (
          <div key={g.value} className="mb-8">
            <p className="font-mono text-xs tracking-widest uppercase mb-3" style={{ color: C.accent }}>{g.label}</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {list.map((s) => (
                <Card key={s.id} className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-body font-semibold text-base" style={{ color: C.ink }}>{s.name}</p>
                    {s.sample && <Badge tone="gold">EJEMPLO</Badge>}
                  </div>
                  <p className="font-body text-xs" style={{ color: C.inkFaint }}>{s.type} · {s.city}, {s.department}</p>
                  <p className="font-body text-sm" style={{ color: C.inkSoft }}>{s.description}</p>
                  <p className="font-body text-xs mt-1" style={{ color: C.inkFaint }}>{s.contact}</p>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
      <DisclaimerBox tone="primary">
        Los servicios marcados "EJEMPLO" son datos de muestra. Deben verificarse y actualizarse antes de publicar la plataforma.
      </DisclaimerBox>
    </div>
  );
}

/* --------------------------- Ayuda urgente --------------------------- */
function UrgentHelpPage({ navigate }) {
  const [contacts] = useStoredList("mente-emergency-contacts", DEFAULT_EMERGENCY);
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-6">
        <IconCircle tone="urgent" size={60}><LifeBuoy size={28} /></IconCircle>
        <h1 className="font-display text-3xl font-semibold mt-4" style={{ color: C.ink }}>🆘 Ayuda urgente</h1>
        <p className="font-body mt-3 text-base max-w-xl mx-auto" style={{ color: C.inkSoft }}>
          Si estás en peligro inmediato, si crees que puedes hacerte daño o hacer daño a otra persona, busca atención de emergencia ahora.
        </p>
      </div>

      <div className="flex flex-col gap-3 mb-8">
        {contacts.map((c) => (
          <Card key={c.id} className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="font-body font-semibold text-sm" style={{ color: C.ink }}>{c.category} — {c.name}</p>
              <p className="font-body text-xs" style={{ color: C.inkFaint }}>{c.city !== "—" ? `${c.city}, ` : ""}{c.department}</p>
            </div>
            {c.phone && c.verified ? (
              <a href={`tel:${c.phone}`} className="font-body mente-focus inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: C.urgent }}>
                <Phone size={16} /> {c.phone}
              </a>
            ) : (
              <span className="font-body text-xs font-semibold rounded-full px-3 py-1.5" style={{ backgroundColor: C.goldSoft, color: C.gold }}>
                {c.phone ? "Número pendiente de verificación" : "Contacto pendiente de verificación"}
              </span>
            )}
          </Card>
        ))}
        <Card className="flex items-center gap-3">
          <IconCircle tone="accent"><HandHeart size={18} /></IconCircle>
          <p className="font-body text-sm" style={{ color: C.ink }}>Si tienes un contacto de confianza, esta también es una buena señal de que puedes hablar con esa persona ahora mismo.</p>
        </Card>
      </div>

      <DisclaimerBox tone="gold">
        El 168 (emergencias en salud) y el 110 (Policía) son números oficiales publicados por el Ministerio de Salud de Bolivia. La línea "Familia Segura" es un programa de UNICEF Bolivia, respaldado por comunicados oficiales, que atiende específicamente ideas o intentos de suicidio. Los hospitales y centros de salud fueron encontrados en directorios y sitios públicos sobre Santa Cruz. Ninguno de estos números ha sido llamado ni confirmado directamente por el equipo de SINAPSIS — confírmenlos antes de publicar la plataforma.
      </DisclaimerBox>

      <div className="mt-6 grid sm:grid-cols-2 gap-3">
        <GhostButton full onClick={() => navigate("directory")}><Stethoscope size={16} /> Buscar un profesional</GhostButton>
        <GhostButton full onClick={() => navigate("home")}><HomeIcon size={16} /> Volver al inicio</GhostButton>
      </div>
    </div>
  );
}

/* --------------------------- Privacidad --------------------------- */
function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <PageHeader eyebrow="Privacidad" title="Tu privacidad en SINAPSIS" />
      <div className="flex flex-col gap-4">
        <Card>
          <p className="font-body text-sm" style={{ color: C.inkSoft }}>SINAPSIS solicita únicamente los datos necesarios para orientarte: edad, ubicación general y, opcionalmente, algunas preguntas de contexto.</p>
        </Card>
        <Card>
          <p className="font-body text-sm" style={{ color: C.inkSoft }}>Las respuestas a las preguntas de seguridad y a los cuestionarios (PHQ-9, GAD-7) no se almacenan de forma persistente en este prototipo: existen solo mientras usas la evaluación.</p>
        </Card>
        <Card>
          <p className="font-body text-sm" style={{ color: C.inkSoft }}>Si en el futuro se almacenan resultados, deberá implementarse consentimiento informado, una política de privacidad completa, controles de acceso y opción de eliminar los datos.</p>
        </Card>
      </div>
    </div>
  );
}

/* --------------------------- Fuentes --------------------------- */
function SourcesPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <PageHeader eyebrow="Evidencia" title="Fuentes y evidencia" />
      <Card className="flex flex-col gap-3">
        <p className="font-body text-sm" style={{ color: C.inkSoft }}>El contenido de SINAPSIS busca priorizar fuentes como:</p>
        <ul className="font-body text-sm space-y-1.5" style={{ color: C.inkSoft }}>
          <li>• Organización Mundial de la Salud (OMS)</li>
          <li>• Organismos sanitarios oficiales</li>
          <li>• Universidades y guías clínicas públicas</li>
          <li>• Instrumentos psicológicos validados (como el PHQ-9 y el GAD-7)</li>
        </ul>
        <DisclaimerBox tone="gold">
          Este contenido educativo aún no ha sido revisado por un profesional de salud mental colegiado. Es un paso obligatorio antes de publicar la plataforma.
        </DisclaimerBox>
      </Card>
    </div>
  );
}

/* --------------------------- Panel de administración (prototipo) --------------------------- */
function emptyRecord(fields) {
  const r = {};
  fields.forEach((f) => { r[f.key] = f.type === "checkbox" ? false : (f.type === "select" ? f.options[0] : ""); });
  return r;
}

function AdminSection({ title, storageKey, defaults, fields }) {
  const [items, persist, status] = useStoredList(storageKey, defaults);
  const [form, setForm] = useState(emptyRecord(fields));
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  function startAdd() { setForm(emptyRecord(fields)); setEditingId(null); setShowForm(true); }
  function startEdit(item) { setForm(item); setEditingId(item.id); setShowForm(true); }

  function save() {
    if (editingId) {
      persist(items.map((it) => (it.id === editingId ? { ...form, id: editingId } : it)));
    } else {
      const id = "admin-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
      persist([...items, { ...form, id, sample: false }]);
    }
    setShowForm(false);
  }
  function remove(id) {
    persist(items.filter((it) => it.id !== id));
  }

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-3">
        <p className="font-display text-lg font-semibold" style={{ color: C.primary }}>{title}</p>
        <PrimaryButton onClick={startAdd}><Plus size={16} /> Añadir</PrimaryButton>
      </div>

      {status === "loading" && <p className="font-body text-sm flex items-center gap-2" style={{ color: C.inkFaint }}><Loader2 className="animate-spin" size={14} /> Cargando…</p>}

      {showForm && (
        <Card className="mb-4">
          <div className="grid sm:grid-cols-2 gap-x-4">
            {fields.map((f) => (
              <FormField key={f.key} label={f.label}>
                {f.type === "text" && <input style={inputStyle} value={form[f.key] || ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />}
                {f.type === "textarea" && <textarea style={{ ...inputStyle, minHeight: 70 }} value={form[f.key] || ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />}
                {f.type === "select" && (
                  <select style={inputStyle} value={form[f.key] || f.options[0]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}>
                    {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                )}
                {f.type === "checkbox" && (
                  <input type="checkbox" checked={!!form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.checked })} />
                )}
              </FormField>
            ))}
          </div>
          <div className="flex gap-3 mt-2">
            <PrimaryButton onClick={save}><Save size={16} /> Guardar</PrimaryButton>
            <GhostButton onClick={() => setShowForm(false)}>Cancelar</GhostButton>
          </div>
        </Card>
      )}

      <div className="flex flex-col gap-2">
        {items.map((it) => (
          <Card key={it.id} className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="font-body font-semibold text-sm" style={{ color: C.ink }}>
                {it.name} {it.sample && <Badge tone="gold">EJEMPLO</Badge>}
              </p>
              <p className="font-body text-xs" style={{ color: C.inkFaint }}>
                {[it.profession, it.specialty, it.department, it.city, it.category, it.phone].filter(Boolean).join(" · ")}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(it)} className="mente-focus rounded-full p-2" style={{ color: C.primary }} aria-label="Editar"><Pencil size={16} /></button>
              <button onClick={() => remove(it.id)} className="mente-focus rounded-full p-2" style={{ color: C.urgent }} aria-label="Eliminar"><Trash2 size={16} /></button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AdminPage() {
  const [adminMode, setAdminMode] = useState(false);
  const [tab, setTab] = useState("professionals");

  if (!adminMode) {
    return (
      <div className="max-w-md mx-auto px-4 sm:px-6 py-16 text-center">
        <IconCircle tone="primary" size={56}><Settings size={26} /></IconCircle>
        <h1 className="font-display text-2xl font-semibold mt-4" style={{ color: C.ink }}>Panel de administración</h1>
        <p className="font-body text-sm mt-2" style={{ color: C.inkSoft }}>
          Prototipo sin autenticación real. En producción, este panel debe protegerse con inicio de sesión y roles de administrador.
        </p>
        <div className="mt-5"><PrimaryButton onClick={() => setAdminMode(true)}>Entrar en modo administrador (demo)</PrimaryButton></div>
      </div>
    );
  }

  const tabs = [
    { id: "professionals", label: "Profesionales" },
    { id: "free", label: "Servicios gratuitos" },
    { id: "emergency", label: "Números de emergencia" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <PageHeader eyebrow="Administración" title="Panel de administración" subtitle="Prototipo funcional: los cambios se guardan en este navegador mediante almacenamiento local." />
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className="font-body mente-focus rounded-full px-4 py-2 text-sm font-medium"
            style={{ backgroundColor: tab === t.id ? C.primarySoft : "transparent", color: tab === t.id ? C.primary : C.inkSoft, border: `1px solid ${C.border}` }}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === "professionals" && <AdminSection title="Profesionales" storageKey="mente-professionals" defaults={DEFAULT_PROFESSIONALS} fields={PROFESSIONAL_FIELDS} />}
      {tab === "free" && <AdminSection title="Servicios gratuitos y de bajo costo" storageKey="mente-free-services" defaults={DEFAULT_FREE_SERVICES} fields={FREE_SERVICE_FIELDS} />}
      {tab === "emergency" && <AdminSection title="Números de emergencia" storageKey="mente-emergency-contacts" defaults={DEFAULT_EMERGENCY} fields={EMERGENCY_FIELDS} />}
    </div>
  );
}

/* --------------------------- Aplicación principal --------------------------- */
export default function App() {
  const [page, setPage] = useState("home");
  const [articleSlug, setArticleSlug] = useState(null);
  const [toolSlug, setToolSlug] = useState(null);
  const [crisis, setCrisis] = useState(false);

  function navigate(next) {
    setCrisis(false);
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function openArticle(slug) { setArticleSlug(slug); setPage("article"); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function openTool(slug) { setToolSlug(slug); setPage("tool"); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function triggerCrisis() { setCrisis(true); window.scrollTo({ top: 0, behavior: "smooth" }); }

  let content;
  if (crisis) {
    content = <CrisisScreen navigate={navigate} />;
  } else {
    switch (page) {
      case "home": content = <HomePage navigate={navigate} />; break;
      case "eval": content = <EvaluationFlow navigate={navigate} triggerCrisis={triggerCrisis} />; break;
      case "library": content = <LibraryPage navigate={navigate} openArticle={openArticle} />; break;
      case "article": content = <ArticlePage slug={articleSlug} navigate={navigate} openTool={openTool} />; break;
      case "tools": content = <ToolsPage navigate={navigate} openTool={openTool} />; break;
      case "tool": content = <ToolDetail slug={toolSlug} navigate={navigate} />; break;
      case "directory": content = <DirectoryPage navigate={navigate} />; break;
      case "free": content = <FreeServicesPage navigate={navigate} />; break;
      case "urgent": content = <UrgentHelpPage navigate={navigate} />; break;
      case "privacy": content = <PrivacyPage />; break;
      case "sources": content = <SourcesPage />; break;
      case "admin": content = <AdminPage />; break;
      default: content = <HomePage navigate={navigate} />;
    }
  }

  return (
    <div className="min-h-screen font-body" style={{ backgroundColor: C.bg, color: C.ink }}>
      <style>{FONT_IMPORT_CSS}</style>
      <NavBar page={page} navigate={navigate} />
      <main>{content}</main>
      <Footer navigate={navigate} />
      <UrgentFloatingButton navigate={navigate} page={page} />
    </div>
  );
}
