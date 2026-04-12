import { useState, useMemo, useRef, useEffect } from "react";

const C = {
  primary: "#A31A61",
  primaryHover: "#8C1452",

  secondary: "#160F41",

  accent: "#D2006E",
  highlight: "#9FDCEE",

  // Alias para mantener compatibilidad con el código existente
  quat: "#D2006E",
  tertiary: "#9FDCEE",

  bg: "#FFFFFF",
  bgSoft: "#F7F6FB",

  border: "#E6E4F0",

  text: "#160F41",
  textMid: "#5B567A",
  textSoft: "#8E8AA8",
  textLight: "#B0A8CC",

  success: "#0B6B40",
  successBg: "#E7F6EF",

  error: "#B91C1C",
  errorBg: "#FEE2E2",

  warnBg: "#FEF3C7",
  warnText: "#78350F",

  accentSoft: "#F8D9E9",
  secondarySoft: "#ECE9F7",
};

const FORM_URL = "https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=lRAYeKHvBkiWJspr4YjR0J_A5d6tezdFl33C8D_QdKBUMDlURUFEMVU0Sk5XOE1TVFdZSklDMEpXSi4u&origin=QRCode";
const STORAGE_KEY = "bg_finanzas_taller_state_v4";
const LESSON_PAGE_XP = 5;
const LESSON_COMPLETE_XP = 10;
const QUIZ_CORRECT_XP = 10;
const QUIZ_COMPLETION_BONUS_XP = 20;
const QUIZ_TIME_LIMIT = 45;
const GAME_TIME_LIMIT = 45;

const LESSON_ACTION_TIPS = {
  1: {
    title: "Hazlo hoy",
    text: "Anota tu ingreso neto mensual y separa un monto fijo para ahorro antes de gastar."
  },
  2: {
    title: "Hazlo hoy",
    text: "Aplica la regla de las 48 horas a cualquier compra no planificada durante esta semana."
  },
  3: {
    title: "Hazlo hoy",
    text: "Define una meta financiera y decide si corresponde a ahorro o inversión según el plazo."
  },
  4: {
    title: "Hazlo hoy",
    text: "Activa alertas, revisa tus contraseñas y evita hacer operaciones bancarias en redes públicas."
  },
};

const TOPIC_RECOMMENDATIONS = {
  "Presupuesto": {
    lessonId: 1,
    title: "Presupuesto Personal",
    reason: "Te conviene reforzar organización de ingresos, gastos y regla 50/30/20."
  },
  "Control de Impulsos": {
    lessonId: 2,
    title: "Control de Impulsos",
    reason: "Te ayudará a decidir mejor frente a compras por emoción, cuotas y promociones."
  },
  "Ahorro e Inversión": {
    lessonId: 3,
    title: "Ahorro vs. Inversión",
    reason: "Conviene repasar horizonte de metas, fondo de emergencia y diferencia entre ahorrar e invertir."
  },
  "Ciberseguridad": {
    lessonId: 4,
    title: "Ciberseguridad y Fraudes",
    reason: "Vale la pena reforzar señales de fraude y buenas prácticas para proteger tu dinero."
  },
  "Planificación": {
    lessonId: 1,
    title: "Presupuesto Personal",
    reason: "Revisar planificación y administración te ayudará a tomar decisiones con más orden."
  },
};

// Validación en desarrollo: detecta tópicos del banco sin mapeo en TOPIC_RECOMMENDATIONS
if (process.env.NODE_ENV === "development") {
  const unmapped = [...new Set(
    [...(typeof QUESTION_BANK !== "undefined" ? QUESTION_BANK : [])].map(q => q.topic)
  )].filter(t => !TOPIC_RECOMMENDATIONS[t]);
  if (unmapped.length > 0) {
    console.warn("[TOPIC_RECOMMENDATIONS] Tópicos sin mapeo:", unmapped);
  }
}

function getLessonUnlockState(completedSet, index) {
  if (completedSet.has(LESSONS[index].id)) return true;
  if (index === 0) return true;
  return completedSet.has(LESSONS[index - 1].id);
}

function getRecommendedTopics(wrongTopics = {}) {
  return Object.entries(wrongTopics)
    .sort((a, b) => b[1] - a[1])
    .map(([topic, count]) => ({
      topic,
      count,
      ...(TOPIC_RECOMMENDATIONS[topic] || {
        lessonId: null,
        title: topic,
        reason: "Repasar este tema puede ayudarte a consolidar lo aprendido.",
      }),
    }))
    .slice(0, 3);
}

// ─── LESSONS (sin quiz) ───────────────────────────────────────
const LESSONS = [
  {
    id: 1, icon: "📋",
    title: "Presupuesto Personal",
    color: C.primary, accent: C.quat,
    summary: "Planifica, registra y controla tus ingresos y gastos mes a mes.",
    content: [
      { type: "concept", title: "¿Por qué planificar?", bullets: [
        "Sin un plan, el dinero desaparece: siempre hay algo urgente que consume lo importante.",
        "Planificar es decidir con anticipación adónde va tu dinero antes de que llegue — para que tú lo controles a él, y no al revés.",
        "Administrar es poner ese plan en práctica día a día, con orden y seguimiento constante.",
      ]},
      { type: "steps", title: "6 Pasos para tu presupuesto", items: [
        { num: "1", label: "Calcula tu ingreso neto mensual", desc: "Anota todo lo que realmente entra a tu bolsillo: sueldo neto, pensiones, rentas. Si cobras semanal o quincenal, multiplica para obtener el total mensual real." },
        { num: "2", label: "Lista tus gastos fijos", desc: "Son los que no cambian mes a mes: alquiler, préstamos, internet, seguros, colegiaturas, suscripciones. Saber este número te da tu piso mínimo de gasto." },
        { num: "3", label: "Estima tus gastos variables", desc: "Alimentación, gasolina, ocio, ropa, farmacia. Como fluctúan, lleva registro durante 30 días para conocer tu promedio real, no el que imaginas." },
        { num: "4", label: "Aplica la regla 50/30/20", desc: "Divide tu ingreso neto: 50% para necesidades básicas, 30% para deseos y ocio, 20% para ahorro y pago de deudas. Es una guía simple pero muy efectiva." },
        { num: "5", label: "Págate primero", desc: "Transfiere automáticamente tu ahorro el mismo día que cobras, antes de gastar en cualquier otra cosa. Así el ahorro deja de ser lo que sobra y se convierte en un compromiso." },
        { num: "6", label: "Prioriza tu fondo de emergencia", desc: "Antes de invertir, construye un colchón de seguridad. Meta inicial: $500–$1,000 o el equivalente a 1 mes de gastos básicos. Luego apunta a cubrir entre 3 y 6 meses de gastos básicos." },
      ]},
      { type: "rule5020", title: "Regla 50 / 30 / 20", items: [
        { pct: "50%", label: "Necesidades", desc: "Lo esencial para vivir: vivienda, servicios básicos, alimentación, transporte y seguros. Si superas este porcentaje, es señal de que tus gastos fijos son demasiado altos.", color: C.primary },
        { pct: "30%", label: "Deseos", desc: "Ocio, salidas, suscripciones y compras no esenciales. Disfrutar también es parte del plan, pero con un límite claro para que no invada el ahorro.", color: C.accent },
        { pct: "20%", label: "Ahorro & Deudas", desc: "Fondo de emergencia, inversiones y pago de créditos. Este 20% es el que construye tu futuro financiero y reduce tu vulnerabilidad ante imprevistos.", color: C.secondary },
      ]},
      { type: "tip", bullets: [
        "Empieza ahorrando el 5% de tu ingreso y sube gradualmente hasta llegar al 10–20%.",
        "No destines más del 30–40% de tu ingreso neto al pago de deudas — si lo superas, tu presupuesto queda muy frágil.",
        "Si tienes tarjeta de crédito, mantén el uso por debajo del 30% de tu límite para proteger tu historial crediticio.",
      ]},
    ],
  },
  {
    id: 2, icon: "🧠",
    title: "Control de Impulsos",
    color: C.secondary, accent: C.primary,
    summary: "Reconoce las trampas del gasto innecesario y actúa con inteligencia financiera.",
    content: [
      { type: "concept", title: "¿Por qué gastamos de más?", bullets: [
        "Estatus social: ver que otros tienen algo activa el impulso de \"yo también lo quiero\", aunque no lo necesites.",
        "Pagos diferidos: cuando el cobro llega semanas después, el cerebro no lo registra como gasto real en el momento.",
        "Dinero plástico: pagar con tarjeta hace invisible el dinero — duele menos que entregar billetes.",
        "Promociones: \"está baratísimo y puedo pagarlo en cuotas\" justifica compras que jamás habrías planeado.",
      ]},
      { type: "warning", title: "El engaño de las cuotas", text: "Una refrigeradora de $238.05 al contado puede convertirse en 18 cuotas de $28.91 que suman $520.38. Parece pagable, pero pagas más del doble.", highlight: "$238 al contado → $520 en cuotas" },
      { type: "steps", title: "Solución: Automatización Inteligente", items: [
        { num: "✓", label: "Transferencias automáticas al ahorro", desc: "Programa una transferencia a tu cuenta de ahorro o inversión el mismo día que recibes tu pago. Lo que no ves, no lo gastas." },
        { num: "✓", label: "Débito automático para facturas fijas", desc: "Configura el pago automático de tus cuentas recurrentes. Así evitas moras por olvido y liberas energía mental para otras decisiones." },
        { num: "✓", label: "Notificaciones de gasto", desc: "Activa alertas cuando tu saldo baja de un límite que tú defines. Te da conciencia del gasto en tiempo real, sin necesidad de revisar a cada rato." },
        { num: "✓", label: "Regla de las 48 horas", desc: "Ante cualquier compra no planificada, espera 2 días antes de decidir. La mayoría de los impulsos desaparecen solos con un poco de tiempo." },
      ]},
      { type: "tip", bullets: [
        "Controlar tus gastos no es una restricción: es lo que elimina la angustia de fin de mes.",
        "Cuando sabes exactamente cuánto entra y cuánto sale, puedes tomar decisiones con calma en vez de reaccionar al pánico.",
        "Prevenir un problema financiero siempre es más fácil y menos costoso que resolverlo una vez que ya ocurrió.",
      ]},
    ],
  },
  {
    id: 3, icon: "🏦",
    title: "Ahorro vs. Inversión",
    color: C.secondary, accent: C.highlight,
    summary: "Conoce la diferencia y elige la estrategia correcta según tu horizonte y metas.",
    content: [
      { type: "concept", title: "No son lo mismo", bullets: [
        "Mucha gente los usa como sinónimos, pero tienen funciones completamente distintas.",
        "Ahorrar cuando deberías invertir significa que tu dinero pierde valor con la inflación año a año.",
        "Invertir cuando deberías ahorrar significa que ante una emergencia, tendrás que vender en el peor momento posible.",
        "Saber cuándo usar cada herramienta marca la diferencia entre crecer financieramente o solo sobrevivir.",
      ]},
      { type: "compare", title: "Ahorro vs. Inversión",
        left: { label: "🐷 Ahorro", color: C.secondary, items: ["Cuentas de ahorro y depósitos: puedes retirar cuando lo necesites", "Bajo riesgo: tu dinero no crece mucho, pero tampoco lo pierdes", "Ideal para emergencias y metas de menos de 2 años", "Lo más importante: está disponible cuando lo necesitas"] },
        right: { label: "📈 Inversión", color: C.secondary, items: ["Acciones, bonos, fondos indexados, bienes raíces", "Mayor riesgo: puede bajar antes de subir, requiere paciencia", "Para hacer crecer tu patrimonio a 2+ años plazo", "Requiere que puedas tolerar que el valor fluctúe sin entrar en pánico"] },
      },
      { type: "steps", title: "Horizontes de metas financieras", items: [
        { num: "⚡", label: "Corto plazo (0–6 meses)", desc: "Tu prioridad inmediata: construir un fondo de emergencia inicial de $500–$1,000 o el equivalente a 1 mes de gastos básicos. Sin este colchón, cualquier imprevisto te desestabiliza." },
        { num: "🎯", label: "Medio plazo (6–24 meses)", desc: "Una vez que tienes tu fondo de emergencia, puedes ahorrar para metas concretas: vacaciones, un curso, renovar un equipo o vehículo. Aquí ya puedes usar depósitos a plazo o instrumentos de bajo riesgo." },
        { num: "🏗️", label: "Largo plazo (más de 2 años)", desc: "La entrada de una vivienda, la jubilación o la creación de un patrimonio. Estas metas requieren tiempo e instrumentos de inversión más sofisticados como fondos o acciones." },
      ]},
      { type: "tip", bullets: [
        "El orden importa: primero construye tu fondo de emergencia (3–6 meses de gastos básicos) y solo después empieza a invertir.",
        "Invertir sin ese colchón es un error común: ante cualquier imprevisto tendrás que retirar el dinero invertido, posiblemente con pérdidas.",
        "La seguridad financiera va antes que la rentabilidad — sin base sólida, cualquier inversión es frágil.",
      ]},
    ],
  },
  {
    id: 4, icon: "🛡️",
    title: "Ciberseguridad y Fraudes",
    color: C.quat, accent: C.primary,
    summary: "Protege tu dinero y datos personales de estafas digitales cada vez más sofisticadas.",
    content: [
      { type: "concept", title: "El fraude digital en Ecuador", bullets: [
        "Las estafas digitales crecen cada año y se vuelven más difíciles de detectar.",
        "Los delincuentes ya usan Inteligencia Artificial para clonar voces y crear mensajes falsos muy convincentes.",
        "Cualquier persona puede ser víctima — no hace falta ser descuidada, basta con un momento de presión o urgencia.",
      ]},
      { type: "steps", title: "Los 3 tipos de ataque más comunes", items: [
        { num: "📧", label: "Phishing", desc: "Correo falso que aparenta ser legítimo para robar tu información o contraseñas." },
        { num: "📱", label: "Smishing", desc: "Mensaje de texto o app falsa que solicita tus datos personales o bancarios." },
        { num: "📞", label: "Vishing", desc: "Llamada telefónica donde el delincuente se presenta como representante de un banco o empresa real." },
      ]},
      { type: "checklist", title: "Buenas prácticas (aplícalas HOY)",
        goods: ["Activa doble factor de autenticación (2FA)", "Usa contraseñas únicas por sitio (gestor de contraseñas)", "Activa notificaciones bancarias por SMS/email", "Mantén sistemas y apps siempre actualizados", "Prefiere plataformas confiables para pagos"],
        bads: ["Usar contraseñas simples como '123456'", "Repetir la misma contraseña en varias cuentas", "Abrir enlaces sin verificar el remitente", "Usar Wi-Fi público para operaciones bancarias", "Compartir códigos 2FA o PIN por teléfono"],
      },
      { type: "tip", bullets: [
        "Si detectas un cargo no reconocido, bloquea la tarjeta o cuenta de inmediato desde tu app bancaria.",
        "Toma capturas de pantalla de cualquier mensaje o transacción sospechosa como evidencia.",
        "Solicita la reversión del cargo (chargeback) al banco — tienen plazos limitados para aceptar el reclamo, actúa rápido.",
      ]},
    ],
  },
];

// ─── BANCO DE 50 PREGUNTAS ────────────────────────────────────
const QUESTION_BANK = [
  // PRESUPUESTO
  { topic: "Presupuesto", q: "¿Cuánto debe destinarse a necesidades según la regla 50/30/20?", opts: ["30%","50%","20%","40%"], a: 1, exp: "El 50% del ingreso neto se destina a necesidades básicas." },
  { topic: "Presupuesto", q: "¿Cuál es el porcentaje recomendado para ahorro y pago de deudas en la regla 50/30/20?", opts: ["10%","30%","20%","25%"], a: 2, exp: "El 20% se destina a ahorro y pago de deudas." },
  { topic: "Presupuesto", q: "Cobras $1,000/mes. ¿Cuánto destinarías a deseos según la regla 50/30/20?", opts: ["$200","$500","$300","$150"], a: 2, exp: "El 30% de $1,000 = $300 para deseos y gastos discrecionales." },
  { topic: "Presupuesto", q: "¿Cuál es el primer paso recomendado al hacer un presupuesto?", opts: ["Calcular tu ingreso neto mensual","Registrar todos los gastos durante 30 días","Pedir un crédito","Cancelar suscripciones"], a: 0, exp: "El primer paso es identificar cuánto dinero realmente entra a tu bolsillo cada mes. Luego, con ese punto de partida, ya puedes ordenar y presupuestar tus gastos." },
  { topic: "Presupuesto", q: "¿Qué incluye la categoría de 'necesidades' en el presupuesto?", opts: ["Ocio y entretenimiento","Vivienda, servicios, alimentación básica y transporte","Vacaciones y viajes","Ropa de moda"], a: 1, exp: "Las necesidades son gastos esenciales: vivienda, alimentación básica, transporte y servicios." },
  { topic: "Presupuesto", q: "¿Qué significa 'págate primero' en finanzas personales?", opts: ["Gastar en lo que quieras antes de pagar deudas","Transferir tu ahorro automáticamente el día que cobras","Pagar primero las facturas más caras","Comprar lo que necesitas antes de ahorrar"], a: 1, exp: "Transferir el ahorro el día de cobro garantiza que sí se realice, sin depender de 'lo que sobre'." },
  { topic: "Presupuesto", q: "¿Cuál de estos es un gasto fijo mensual?", opts: ["Gasolina","Comidas fuera","Renta o hipoteca","Entretenimiento"], a: 2, exp: "La renta o hipoteca es un gasto fijo porque no varía mes a mes." },
  { topic: "Presupuesto", q: "¿Con cuánto se recomienda empezar el fondo de emergencia si nunca has ahorrado?", opts: ["$5,000","$500–$1,000","$10,000","$100"], a: 1, exp: "Un objetivo inicial realista es $500–$1,000 o equivalente a 1 mes de gastos básicos." },
  { topic: "Presupuesto", q: "Si tus gastos variables son difíciles de calcular, ¿qué se recomienda?", opts: ["Ignorarlos","Estimarlos con un +10–20% de margen de seguridad","Reducirlos a cero","Financiarlos con tarjeta de crédito"], a: 1, exp: "Agregar un margen del 10–20% protege contra gastos inesperados en categorías variables." },
  { topic: "Presupuesto", q: "¿Cuánto del ingreso neto se recomienda destinar a deudas como máximo?", opts: ["10–15%","50–60%","30–40%","5%"], a: 2, exp: "El pago de deudas no debería superar el 30–40% del ingreso neto total." },
  { topic: "Presupuesto", q: "¿Cuál es el objetivo del presupuesto personal?", opts: ["Gastar más","Planificar y controlar ingresos y gastos","Endeudarse menos","Invertir en bolsa"], a: 1, exp: "El presupuesto es un plan que permite controlar cuánto entra y cuánto sale cada mes." },
  { topic: "Presupuesto", q: "¿Qué tipo de gasto es la suscripción mensual a streaming?", opts: ["Gasto fijo de necesidad","Gasto fijo de deseo","Gasto variable de necesidad","Inversión"], a: 1, exp: "Las suscripciones son gastos fijos pero no esenciales, se categorizan como deseos." },
  { topic: "Presupuesto", q: "Cobras $2,000/mes. Según 50/30/20, ¿cuánto ahorras?", opts: ["$200","$600","$400","$1,000"], a: 2, exp: "El 20% de $2,000 = $400 para ahorro e inversiones." },
  // CONTROL DE IMPULSOS
  { topic: "Control de Impulsos", q: "Una TV cuesta $400 al contado o 12 cuotas de $45. ¿Cuánto pagas en cuotas?", opts: ["$400","$540","$480","$360"], a: 1, exp: "12 × $45 = $540, es decir $140 más que al contado." },
  { topic: "Control de Impulsos", q: "¿Cuál de estos NO es una trampa del gasto innecesario?", opts: ["Estatus social","Ahorro automático","Pagos diferidos","Promociones"], a: 1, exp: "El ahorro automático es una herramienta para prevenir el gasto innecesario, no una trampa." },
  { topic: "Control de Impulsos", q: "¿Qué es la regla de las 48 horas?", opts: ["Pagar deudas en 48 horas","Esperar 2 días antes de comprar algo no planificado","Ahorrar 48 horas de salario al mes","Revisar tu presupuesto cada 2 días"], a: 1, exp: "Esperar 48 horas antes de una compra no planificada ayuda a evitar compras impulsivas." },
  { topic: "Control de Impulsos", q: "¿Qué se entiende por 'dinero plástico' como trampa financiera?", opts: ["Dinero falso","El uso de tarjetas de crédito con facilidades de pago que hacen perder de vista el gasto real","Billetes dañados","Monedas de plástico"], a: 1, exp: "Las tarjetas de crédito hacen que el gasto sea menos 'visible', facilitando el exceso." },
  { topic: "Control de Impulsos", q: "Una refrigeradora cuesta $238 al contado o 18 cuotas de $28.91. ¿Cuánto pagas en cuotas?", opts: ["$238","$289","$520","$400"], a: 2, exp: "18 × $28.91 = $520.38, más del doble del precio al contado." },
  { topic: "Control de Impulsos", q: "¿Cuál es la ventaja del débito automático para facturas fijas?", opts: ["Te permite gastar más","Evita moras y descuidos en pagos recurrentes","Genera intereses a tu favor","Te obliga a ahorrar más"], a: 1, exp: "El débito automático garantiza el pago puntual de facturas fijas sin riesgo de olvido o mora." },
  { topic: "Control de Impulsos", q: "¿Qué es el 'status social' como causa de gasto innecesario?", opts: ["Ahorro por presión social","Comprar para aparentar o igualar el nivel de otros","Invertir en educación","Donaciones a terceros"], a: 1, exp: "El 'status social' lleva a comprar para aparentar o no quedarse atrás frente a los demás." },
  { topic: "Control de Impulsos", q: "¿Cuál es la solución más efectiva para evitar gastar el ahorro?", opts: ["Guardar efectivo en casa","Automatizar la transferencia de ahorro el día de cobro","Usar la tarjeta de crédito para todo","No tener cuenta de ahorros"], a: 1, exp: "Automatizar el ahorro el día de cobro impide que ese dinero esté disponible para gastarlo." },
  { topic: "Control de Impulsos", q: "¿Qué permite el ahorro automático al usuario?", opts: ["Gastar más libremente","Ahorrar sin depender de la fuerza de voluntad","Aumentar su límite de crédito","Evitar pagar impuestos"], a: 1, exp: "El ahorro automático elimina la decisión diaria de ahorrar, haciendo el hábito sostenible." },
  { topic: "Control de Impulsos", q: "¿Por qué los pagos diferidos hacen difícil controlar el gasto?", opts: ["Porque los diferidos tienen tasa 0","Porque no vemos el impacto real inmediato en nuestro bolsillo","Porque siempre son más baratos","Porque los aprueba el banco automáticamente"], a: 1, exp: "Al diferir pagos, el impacto financiero se distribuye en el tiempo y es menos perceptible." },
  { topic: "Control de Impulsos", q: "Tienes $500 de ahorro. Ves un celular de $450 en cuotas de $50/mes por 12 meses. ¿Cuál es la decisión más inteligente?", opts: ["Comprarlo en cuotas de inmediato","Comprarlo al contado aunque agote mis ahorros","Esperar, mi celular funciona bien","Pedir prestado para comprarlo"], a: 2, exp: "Si el celular actual funciona, esperar preserva el fondo de emergencia y evita deuda innecesaria." },
  // AHORRO E INVERSIÓN
  { topic: "Ahorro e Inversión", q: "¿Cuál es la diferencia principal entre ahorro e inversión?", opts: ["El ahorro genera más rentabilidad","El ahorro prioriza liquidez y seguridad; la inversión prioriza crecimiento a largo plazo","Son exactamente lo mismo","La inversión es más segura"], a: 1, exp: "El ahorro es para emergencias y metas cortas; la inversión busca rentabilidad con más riesgo a largo plazo." },
  { topic: "Ahorro e Inversión", q: "¿Para qué tipo de meta es más adecuada una cuenta de ahorro?", opts: ["Jubilación en 30 años","Comprar acciones","Cubrir gastos de emergencia en los próximos meses","Invertir en bienes raíces"], a: 2, exp: "La cuenta de ahorro es líquida y segura, ideal para emergencias o metas de corto plazo." },
  { topic: "Ahorro e Inversión", q: "¿Cuántos meses de gastos básicos se recomienda tener en el fondo de emergencia con ingresos estables?", opts: ["1 mes","3 meses","12 meses","6 meses"], a: 1, exp: "Con trabajo e ingresos estables, 3 meses de gastos básicos es el objetivo recomendado." },
  { topic: "Ahorro e Inversión", q: "¿Cuántos meses de fondo de emergencia se recomiendan si tienes ingresos inestables?", opts: ["1 mes","2 meses","6 meses","3 meses"], a: 2, exp: "Con ingresos inestables o trabajo independiente, se recomienda tener 6 meses de gastos cubiertos." },
  { topic: "Ahorro e Inversión", q: "¿Qué tipo de horizonte tiene una meta de jubilación?", opts: ["Corto plazo (0–6 meses)","Medio plazo (6–24 meses)","Largo plazo (24+ meses)","No tiene horizonte"], a: 2, exp: "La jubilación es una meta de largo plazo que requiere inversión sostenida durante décadas." },
  { topic: "Ahorro e Inversión", q: "¿Qué sucede si inviertes sin tener un fondo de emergencia?", opts: ["Ganas más rentabilidad","Podrías verse obligado a vender en mal momento ante una emergencia","No hay ningún problema","El banco te protege"], a: 1, exp: "Sin fondo de emergencia, cualquier imprevisto te fuerza a liquidar inversiones quizás en pérdida." },
  { topic: "Ahorro e Inversión", q: "¿Cuál de estos es un instrumento de inversión?", opts: ["Cuenta de ahorros","Depósito a plazo fijo","Fondo indexado de acciones","Efectivo en casa"], a: 2, exp: "Los fondos indexados son vehículos de inversión que siguen el desempeño de un índice bursátil." },
  { topic: "Ahorro e Inversión", q: "¿Cuál es una meta de corto plazo?", opts: ["Jubilarse en 25 años","Comprar casa propia","Ahorrar $300 para emergencias en 5 meses","Invertir en acciones por 10 años"], a: 2, exp: "Las metas de corto plazo (0–6 meses) como el fondo inicial de emergencia son prioritarias al comenzar." },
  { topic: "Ahorro e Inversión", q: "¿Cuál es una característica de los instrumentos de ahorro?", opts: ["Alta rentabilidad y alto riesgo","Baja liquidez","Liquidez inmediata y bajo riesgo","Dependen del mercado de acciones"], a: 2, exp: "Los instrumentos de ahorro (cuentas, depósitos) se caracterizan por ser líquidos y de bajo riesgo." },
  { topic: "Ahorro e Inversión", q: "¿Cuál de estas es una meta de medio plazo?", opts: ["Fondo de emergencia esta semana","Comprar un auto en 18 meses","Jubilación en 30 años","Pagar la factura del mes"], a: 1, exp: "Las metas de medio plazo (6–24 meses) incluyen vacaciones, cursos, equipos o vehículos pequeños." },
  { topic: "Ahorro e Inversión", q: "¿Por qué el dinero guardado en efectivo pierde valor con el tiempo?", opts: ["Por los impuestos","Por la inflación","Por el tipo de cambio","Por los gastos bancarios"], a: 1, exp: "La inflación reduce el poder adquisitivo del efectivo guardado sin generar ningún rendimiento." },
  { topic: "Ahorro e Inversión", q: "¿Qué es un depósito a plazo fijo?", opts: ["Una inversión de alto riesgo en bolsa","Un instrumento de ahorro con plazo y tasa pactados previamente","Una tarjeta de crédito especial","Un tipo de seguro de vida"], a: 1, exp: "El depósito a plazo fijo es un instrumento seguro y predecible, ideal para metas de corto plazo." },
  // CIBERSEGURIDAD Y FRAUDES
  { topic: "Ciberseguridad", q: "¿Qué es el phishing?", opts: ["Una técnica de pesca deportiva","Un correo falso que simula ser legítimo para robar datos","Un tipo de inversión en línea","Un virus informático"], a: 1, exp: "El phishing usa correos falsos que imitan a empresas reales para obtener datos personales o bancarios." },
  { topic: "Ciberseguridad", q: "¿Qué es el smishing?", opts: ["Un ataque por correo electrónico","Un fraude a través de mensajes de texto o apps falsas","Un tipo de phishing por llamada","Un malware en computadoras"], a: 1, exp: "El smishing usa SMS o mensajes de apps para engañar y obtener datos personales." },
  { topic: "Ciberseguridad", q: "¿Qué es el vishing?", opts: ["Un virus en redes sociales","Un fraude por llamada telefónica donde el delincuente finge ser un representante legítimo","Un correo falso","Un ataque a cajeros automáticos"], a: 1, exp: "El vishing usa llamadas telefónicas para engañar a las víctimas haciéndose pasar por bancos o empresas." },
  { topic: "Ciberseguridad", q: "Recibes un SMS de tu banco pidiendo confirmar tu clave en un enlace. ¿Qué haces?", opts: ["Hago clic y confirmo mis datos","Llamo al número oficial del banco sin hacer clic","Reenvío el SMS a un amigo","Respondo el SMS con mi clave"], a: 1, exp: "Nunca hagas clic en enlaces de SMS bancarios. Siempre llama al número oficial para verificar." },
  { topic: "Ciberseguridad", q: "¿Cuál es la señal más clara de que un correo bancario es falso?", opts: ["Que mencione tu nombre","Que tenga el logo del banco","Que el dominio del remitente sea diferente al oficial","Que llegue en fin de semana"], a: 2, exp: "El dominio del remitente (ej: banco@soporte-urgente.com) delata el phishing. Verifica siempre el dominio." },
  { topic: "Presupuesto", q: "¿Qué porcentaje máximo de tu límite de crédito deberías usar?", opts: ["70%","100%","30%","50%"], a: 2, exp: "Mantener el uso de tu tarjeta por debajo del 30% de su límite ayuda a cuidar tu historial crediticio." },
  { topic: "Ciberseguridad", q: "¿Cuál es una buena práctica de ciberseguridad financiera?", opts: ["Usar la misma contraseña en todas las cuentas","Compartir tu PIN con un amigo de confianza","Activar el doble factor de autenticación (2FA)","Conectarse a Wi-Fi público para operaciones bancarias"], a: 2, exp: "El 2FA añade una capa adicional de seguridad que protege tu cuenta aunque alguien obtenga tu contraseña." },
  { topic: "Ciberseguridad", q: "¿Qué debes hacer primero si detectas un cargo no reconocido en tu tarjeta?", opts: ["Esperar a que el banco lo detecte solo","Bloquear la tarjeta e informar al banco inmediatamente","Publicarlo en redes sociales","Cancelar todas tus tarjetas"], a: 1, exp: "Actuar rápido es clave: bloquear la tarjeta y reportar al banco activa el proceso de investigación." },
  { topic: "Ciberseguridad", q: "¿Qué tecnología usa hoy el fraude digital que lo hace más peligroso?", opts: ["Fax y telegramas","Inteligencia Artificial y clonación de voz","Solo correos de texto plano","Llamadas analógicas"], a: 1, exp: "El fraude actual usa IA para clonar voces y crear contenidos falsos muy difíciles de detectar." },
  { topic: "Ciberseguridad", q: "¿Qué es el 'fraude del CEO falso'?", opts: ["Un fraude donde alguien se hace pasar por tu jefe para pedir transferencias urgentes","Un tipo de inversión fraudulenta","Una estafa por correo postal","Un virus que ataca solo a empresas"], a: 0, exp: "El fraude del CEO falso consiste en suplantar a un jefe o directivo para solicitar transferencias urgentes." },
  { topic: "Ciberseguridad", q: "¿Por qué no se debe usar Wi-Fi público para operaciones bancarias?", opts: ["Porque es muy lento","Porque terceros pueden interceptar tus datos","Porque el banco lo prohíbe por contrato","Porque consume mucha batería"], a: 1, exp: "Las redes Wi-Fi públicas pueden ser interceptadas por atacantes que capturan tus datos bancarios." },
  { topic: "Ciberseguridad", q: "¿Qué es un gestor de contraseñas?", opts: ["Una agenda física de claves","Una app que genera y almacena contraseñas únicas y seguras","Un servicio del banco para recuperar contraseñas","Un sistema de bloqueo de cuentas"], a: 1, exp: "Un gestor de contraseñas crea y guarda contraseñas únicas por sitio, eliminando el riesgo de repetición." },
  { topic: "Ciberseguridad", q: "¿Qué es el 'chargeback'?", opts: ["Un tipo de tarjeta de crédito","La reversión de un cargo fraudulento solicitada al banco","Un cobro adicional por uso de tarjeta","Una multa por pago tardío"], a: 1, exp: "El chargeback es el proceso para disputar y revertir cargos no autorizados. Los bancos tienen plazos para reclamarlo." },
  // PLANIFICACIÓN Y ADMINISTRACIÓN
  { topic: "Planificación", q: "¿Cuál es la diferencia entre planificar y administrar?", opts: ["Son lo mismo","Planificar establece objetivos y estrategias; administrar implementa esos planes","Administrar es más importante que planificar","Planificar solo aplica a empresas"], a: 1, exp: "Planificar es anticiparse y definir el camino; administrar es ejecutar y controlar ese plan." },
  { topic: "Planificación", q: "¿Por qué el orden en los registros financieros es importante?", opts: ["Solo para declarar impuestos","Permite tomar medidas correctivas y soluciones a problemas a tiempo","Es obligatorio por ley","Solo lo hacen los contadores"], a: 1, exp: "Llevar registros ordenados permite detectar problemas financieros antes de que se vuelvan críticos." },
  { topic: "Planificación", q: "¿Qué aumenta cuando no tienes información financiera clara?", opts: ["Tu ahorro","El riesgo de tomar malas decisiones financieras","Tu capacidad de inversión","Tu crédito bancario"], a: 1, exp: "Sin información financiera clara, aumenta el riesgo de gastar de más, endeudarse o tomar malas decisiones." },
  { topic: "Planificación", q: "¿Cómo se mide el éxito financiero en el tiempo?", opts: ["Por la cantidad de tarjetas de crédito que tienes","Por los resultados personales y financieros alcanzados","Por el número de cuentas bancarias","Por la marca del auto que manejas"], a: 1, exp: "El éxito financiero se mide en resultados concretos: metas alcanzadas, deudas pagadas, patrimonio construido." },
];

function loadPersistedState() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      xp: Number(parsed?.xp) || 0,
      completed: Array.isArray(parsed?.completed) ? parsed.completed.filter((v) => Number.isFinite(v)) : [],
      completedModules: {
        quiz: !!parsed?.completedModules?.quiz,
        game: !!parsed?.completedModules?.game,
      },
      viewedLessonPages: parsed?.viewedLessonPages && typeof parsed.viewedLessonPages === "object" ? parsed.viewedLessonPages : {},
      lastLearning: parsed?.lastLearning && typeof parsed.lastLearning === "object" ? parsed.lastLearning : null,
      quizInsights: parsed?.quizInsights && typeof parsed.quizInsights === "object" ? parsed.quizInsights : { wrongTopics: {}, recommendations: [], score: null },
      toolsState: parsed?.toolsState && typeof parsed.toolsState === "object" ? parsed.toolsState : {
        budgetIncome: "",
        savingsGoal: "",
        savingsMonthly: "",
        debtBalance: "",
        debtMonthlyPayment: "",
        debtExtraPayment: "",
      },
      soundOn: parsed?.soundOn !== false,
    };
  } catch {
    return null;
  }
}

// Shuffle helper
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── BANCO DE 100 ESCENARIOS DE JUEGO ────────────────────────
const GAME_SCENARIO_BANK = [

  // ══ PRESUPUESTO (25) ═════════════════════════════════════════
  { situation: "Cobras tu sueldo. Tienes ganas de salir a comer y comprar ropa. Aún no has aportado a tu ahorro este mes.", options: [
    { text: "Primero salgo, el ahorro lo hago después si sobra", points: -10, feedback: "El ahorro 'si sobra' casi nunca ocurre: siempre aparece algo en qué gastar. El gasto se expande para llenar el espacio disponible — es el error más común en finanzas personales." },
    { text: "Transfiero mi ahorro primero, luego gasto el resto", points: 10, feedback: "Este hábito se llama 'págate primero'. Al transferir antes de cualquier gasto, el ahorro deja de depender de la fuerza de voluntad y se convierte en un compromiso automático." },
    { text: "No ahorro este mes porque tuve gastos imprevistos", points: -5, feedback: "Para eso existe el fondo de emergencia: absorber imprevistos sin romper el hábito de ahorro. Si aún no lo tienes, este mes es más urgente que nunca empezar a construirlo." },
  ]},
  { situation: "Tu ingreso mensual es de $1,200. Tus gastos fijos suman $850. ¿Cuál es tu siguiente paso?", options: [
    { text: "Gastar los $350 restantes en lo que quiera", points: -10, feedback: "Gastar todo el excedente sin planificar es la receta para no ahorrar nunca. Ese margen es donde vive tu ahorro, tu fondo de emergencia y tu libertad financiera futura." },
    { text: "Asignar los $350 entre ahorro, deudas y gastos variables con un presupuesto", points: 10, feedback: "¡Exacto! Conocer tu margen disponible y asignarlo intencionalmente es la base de todo presupuesto. Sin esa asignación, el dinero desaparece sin que sepas adónde fue." },
    { text: "Buscar cómo aumentar mis ingresos antes de presupuestar", points: -5, feedback: "Sin presupuesto el dinero extra también desaparece. Primero aprende a administrar lo que tienes — la disciplina no depende del monto." },
  ]},
  { situation: "Llevas semanas sin registrar tus gastos y no sabes en qué se va el dinero a fin de mes. ¿Qué haces?", options: [
    { text: "Asumo que estoy gastando bien y sigo igual", points: -10, feedback: "Lo que no se mide no se puede mejorar. Sin saber adónde va tu dinero, no puedes tomar ninguna decisión financiera sólida." },
    { text: "Registro todos mis gastos durante 30 días para conocer mi promedio real", points: 10, feedback: "¡Exactamente! 30 días de registro es el punto de partida de cualquier presupuesto honesto. Te sorprenderá la diferencia entre lo que imaginas gastar y lo que gastas realmente." },
    { text: "Dejo de usar tarjeta de crédito para controlar mejor", points: 0, feedback: "Es una medida parcial: eliminar la tarjeta reduce un canal, pero sin registro sigues sin conocer el total. El problema no es el instrumento de pago, sino la falta de seguimiento." },
  ]},
  { situation: "Tus gastos fijos superan el 60% de tu ingreso neto. Según la regla 50/30/20, ¿qué harías?", options: [
    { text: "Nada, es solo una guía genérica", points: -5, feedback: "Cuando los gastos fijos consumen más del 60%, el margen para ahorrar o cubrir imprevistos es muy estrecho. Vale la pena revisar qué gastos fijos se pueden reducir o renegociar." },
    { text: "Revisar qué gastos fijos puedo reducir o renegociar", points: 10, feedback: "¡Correcto! Renegociar alquileres, cancelar suscripciones no usadas o refinanciar deudas con mejor tasa son las palancas disponibles cuando los fijos se comen demasiado del ingreso." },
    { text: "Buscar ingresos extra para cubrir la diferencia", points: 0, feedback: "Es válido, pero sin reducir los gastos fijos el problema estructural persiste. Los ingresos extra ayudan, pero la base debe sanearse para no depender siempre de ellos." },
  ]},
  { situation: "Contratas un gimnasio con descuento del trabajo y luego casi nunca vas. ¿Qué aprendiste?", options: [
    { text: "Que los descuentos del trabajo siempre valen la pena", points: -10, feedback: "Un descuento sobre algo que no usas sigue siendo un gasto. El costo real no es el precio pagado, sino el valor recibido. Pagar $10 por algo que vale $0 para ti es una pérdida." },
    { text: "Que debo evaluar si realmente usaré algo antes de contratarlo, aunque sea barato", points: 10, feedback: "¡Exacto! Contratar servicios por el precio sin evaluar el uso real es uno de los errores más comunes. Un gasto pequeño recurrente que no aporta valor es puro desperdicio." },
    { text: "Que debería ir más para justificar el costo", points: -5, feedback: "Esto se llama la 'falacia del costo hundido'. Lo más inteligente es cancelar y redirigir ese dinero a algo que sí uses, no forzar el uso para 'recuperar' lo ya pagado." },
  ]},
  { situation: "Cada fin de mes te quedas sin dinero aunque tu sueldo es razonable. ¿Cuál es el primer paso?", options: [
    { text: "Pedir un aumento de sueldo", points: -5, feedback: "Sin saber adónde va el dinero actual, un aumento simplemente eleva el nivel de gasto. El problema es de hábitos, no de monto." },
    { text: "Registrar todos mis gastos para identificar las fugas", points: 10, feedback: "El diagnóstico antes del tratamiento. Registrar los gastos revela las categorías donde el dinero 'se evapora' y permite tomar decisiones concretas y medibles." },
    { text: "Usar únicamente efectivo para que se acabe más lento", points: 0, feedback: "El efectivo puede hacer más visible el gasto, pero sin un presupuesto sigue sin haber control real. Es un parche, no una solución estructural." },
  ]},
  { situation: "Tienes deuda de tarjeta al 24% anual y ahorros en una cuenta al 3%. ¿Qué priorizas?", options: [
    { text: "Ahorro primero, la deuda la pago poco a poco", points: -10, feedback: "Matemáticamente estás perdiendo: ganas 3% pero pagas 24%. Es como llenar un balde con un agujero grande — no tiene sentido llenarlo sin tapar el agujero." },
    { text: "Pago la deuda de tarjeta primero, luego retomo el ahorro", points: 10, feedback: "¡Correcto! Eliminar una deuda al 24% equivale a obtener un rendimiento garantizado del 24% — algo imposible de igualar con cualquier ahorro convencional." },
    { text: "Los mantengo en paralelo para no perder el hábito de ahorro", points: 0, feedback: "Mantener el fondo de emergencia tiene sentido. Pero conservar ahorros al 3% mientras pagas deuda al 24% es un error numérico que cuesta dinero real cada mes." },
  ]},
  { situation: "Recibes un aumento de sueldo. Un amigo dice que 'presupuestar es para gente que no gana suficiente'. ¿Qué haces?", options: [
    { text: "Dejo de presupuestar, ahora gano más", points: -10, feedback: "Más ingresos sin control solo significa gastos más grandes, no más riqueza. Las personas con altos ingresos también pueden quedar en números rojos sin presupuesto." },
    { text: "Ajusto mi presupuesto al nuevo ingreso, aumentando el porcentaje de ahorro", points: 10, feedback: "¡Exacto! Un aumento es la oportunidad perfecta para acelerar el ahorro, no para inflar el estilo de vida. Esto se llama 'ahorro invisible'." },
    { text: "Gasto el extra este mes como celebración y vuelvo al presupuesto después", points: -5, feedback: "Una celebración puntual es comprensible, pero 'solo este mes' suele repetirse. El riesgo es normalizar el gasto elevado y nunca volver al presupuesto anterior." },
  ]},
  { situation: "Tus gastos variables son muy irregulares (salud, ropa, reparaciones). ¿Cómo los manejas?", options: [
    { text: "Los ignoro porque no puedo predecirlos", points: -10, feedback: "Los gastos irregulares son previsibles estadísticamente aunque no sean exactos. Sin incluirlos, tu presupuesto siempre se romperá ante ellos." },
    { text: "Creo una categoría con un monto mensual promedio basado en el historial", points: 10, feedback: "¡Muy bien! Promediar los gastos irregulares y reservar ese monto mensualmente los convierte en gastos planificados, no en sorpresas que rompen el presupuesto." },
    { text: "Los cubro con tarjeta de crédito cuando aparecen", points: -5, feedback: "Si no tienes el dinero reservado, la tarjeta se convierte en deuda y los gastos irregulares se vuelven más caros por los intereses." },
  ]},
  { situation: "Recibes $500 inesperados (bonificación). ¿Qué haces?", options: [
    { text: "Lo gasto en algo que quería — es dinero extra", points: -5, feedback: "El dinero extra tiene la misma lógica que el regular: sin plan, desaparece. Un ingreso inesperado es la oportunidad de avanzar objetivos sin afectar el presupuesto habitual." },
    { text: "Lo divido: parte al fondo de emergencia, parte a una meta y algo para disfrutar", points: 10, feedback: "¡Excelente! Dividir entre objetivos financieros y disfrute es el enfoque más equilibrado. Avanzas en tus metas y te premias — sin culpa ni desperdicio." },
    { text: "Lo guardo en cuenta corriente por si acaso", points: 0, feedback: "Guardarlo es mejor que gastarlo sin plan, pero sin asignarlo a un objetivo concreto es fácil que desaparezca en gastos cotidianos sin propósito." },
  ]},
  { situation: "Quieres comprar una laptop de $800. No tienes ese dinero ahora. ¿Cuál es la mejor estrategia?", options: [
    { text: "La compro en 24 cuotas de $40, es manejable", points: -10, feedback: "Con intereses puedes terminar pagando $960 o más por un bien que puede quedar obsoleto antes de terminar de pagarlo. Además, comprometes $40 de tu presupuesto por dos años." },
    { text: "Ahorro $200 por mes durante 4 meses y la compro al contado", points: 10, feedback: "¡Decisión inteligente! Ahorrar para comprar al contado elimina intereses, te da poder de negociación y refuerza el hábito de postergar la gratificación." },
    { text: "La compro con tarjeta y pago el mínimo mensual", points: -10, feedback: "Pagar el mínimo en tarjeta es uno de los errores más costosos. Los intereses pueden hacer que una laptop de $800 te cueste más del doble, y la deuda puede durar años." },
  ]},
  { situation: "Descubres 5 suscripciones activas que ya no usas, que suman $45 al mes. ¿Qué haces?", options: [
    { text: "Las cancelo todas de inmediato", points: 10, feedback: "$45 mensuales son $540 al año. Las suscripciones olvidadas son una de las fugas más comunes en presupuestos modernos. Cancelarlas es dinero que puedes redirigir al ahorro." },
    { text: "Las mantengo por si acaso las necesito después", points: -10, feedback: "Pagar por algo que no usas 'por si acaso' es una pérdida segura. Si en el futuro lo necesitas, puedes volver a contratar. El costo de oportunidad de esos $45 mensuales es real." },
    { text: "Cancelo solo las que claramente no uso nunca", points: 0, feedback: "Es un paso en la dirección correcta. Lo ideal es revisar periódicamente todas las suscripciones y ser estricto sobre qué aporta valor real." },
  ]},
  { situation: "Gastaste $300 en delivery este mes. Tu presupuesto para alimentación es $200. ¿Qué haces?", options: [
    { text: "Aumento mi presupuesto de alimentación a $300", points: -5, feedback: "Ajustar el presupuesto a los malos hábitos va en la dirección equivocada. El presupuesto debe reflejar tus objetivos, no tus excesos." },
    { text: "Analizo qué situaciones me llevaron a pedir delivery y establezco límites concretos", points: 10, feedback: "¡Excelente! Entender el 'por qué' del gasto excesivo permite diseñar soluciones reales. La restricción absoluta raramente funciona — los límites razonables, sí." },
    { text: "Me propongo no pedir delivery nunca más", points: -5, feedback: "Las restricciones absolutas son difíciles de mantener y generan rebote. Es más sostenible establecer un límite razonable (por ejemplo, máximo 2 veces por semana) que prohibirse algo completamente." },
  ]},
  { situation: "Tu hermano te pide prestados $500. No tienes deudas y tienes fondo de emergencia. ¿Qué haces?", options: [
    { text: "Le presto sin pensar dos veces, es familia", points: -5, feedback: "Los préstamos informales entre familiares son fuente frecuente de conflictos. Si lo prestas sin acuerdo claro sobre el plazo, es probable que se convierta en un regalo involuntario." },
    { text: "Le presto solo si acordamos el plazo y la forma de pago de forma clara", points: 10, feedback: "¡Correcto! Un acuerdo claro protege la relación y define expectativas desde el inicio. No es desconfianza — es responsabilidad mutua." },
    { text: "No le presto nunca dinero a familia — regla de oro", points: 0, feedback: "Es una postura comprensible dados los riesgos. Si decides no hacerlo, sé honesto y directo al decirlo. La honestidad protege más la relación que una excusa." },
  ]},
  { situation: "Quieres unas vacaciones en 6 meses que costarán $600. ¿Cómo lo planificas?", options: [
    { text: "Ahorro lo que me sobre cada mes y veo si llego", points: -10, feedback: "Sin un monto fijo mensual, las probabilidades de llegar a la meta son bajas. El ahorro 'con lo que sobre' siempre compite contra todos los demás gastos y casi siempre pierde." },
    { text: "Divido $600 entre 6 meses = $100 por mes en una cuenta separada", points: 10, feedback: "¡Perfecto! Este método se llama ahorro por objetivo. Separar el dinero en una cuenta específica lo protege del gasto cotidiano y te da claridad sobre tu avance." },
    { text: "Cargo las vacaciones a tarjeta y la pago después", points: -5, feedback: "Si pagas la tarjeta completa al regresar puede funcionar. Pero si las pagas en cuotas, terminarás pagando por un recuerdo pasado mucho tiempo después, con intereses incluidos." },
  ]},
  { situation: "Calculaste ahorrar $150 al mes. A fin de mes solo quedaron $30. ¿Qué revisas primero?", options: [
    { text: "Mis gastos variables — probablemente ahí está la fuga", points: 10, feedback: "¡Correcto! Los gastos variables son la categoría más difícil de controlar y donde más frecuentemente se pierde el margen planificado. Ese es siempre el primer lugar a revisar." },
    { text: "Mis gastos fijos — quizás hay algo que puedo cancelar", points: 0, feedback: "Es una revisión válida, pero los fijos cambian poco mes a mes. Si el presupuesto fue calculado con los fijos correctos, la fuga casi siempre está en los variables." },
    { text: "Nada, fue un mes atípico y el siguiente será mejor", points: -10, feedback: "Sin analizar qué ocurrió, el 'mes atípico' se convierte en la norma. Cada vez que se supera el presupuesto sin revisarlo, se normaliza el exceso." },
  ]},
  { situation: "El 40% de tu ingreso se va en cuotas de créditos. ¿Cómo lo ves?", options: [
    { text: "Está bien, mientras pueda pagar las cuotas", points: -10, feedback: "El 40% en deudas deja muy poco margen para ahorro e imprevistos. Cualquier cambio en tus ingresos puede hacerte incapaz de cumplir esos compromisos." },
    { text: "Es una señal de alerta — debo consolidar o reducir deudas", points: 10, feedback: "¡Exacto! El límite recomendado es 30–40% máximo. Consolidar deudas en un solo crédito con menor tasa puede reducir significativamente la carga mensual." },
    { text: "Es normal, casi todo el mundo tiene esa proporción de deudas", points: -5, feedback: "Que sea común no lo hace saludable. El endeudamiento excesivo tiene efectos reales: menos capacidad de ahorro, más estrés y mayor vulnerabilidad ante imprevistos." },
  ]},
  { situation: "Tu empresa ofrece descuento automático del sueldo para un plan de ahorro. ¿Lo usas?", options: [
    { text: "No, prefiero manejar mi dinero yo mismo", points: -5, feedback: "Manejar el dinero directamente requiere más disciplina. El descuento automático aplica exactamente el principio de 'págate primero' sin necesidad de fuerza de voluntad mensual." },
    { text: "Sí, es la mejor forma de ahorrar sin depender de mi disciplina", points: 10, feedback: "¡Exacto! El ahorro automático pre-pago es el método más efectivo. No ves el dinero, no lo gastas. La disciplina se incorpora al sistema, no a la voluntad." },
    { text: "Solo si el porcentaje que descuentan es alto", points: -5, feedback: "Empezar con un porcentaje pequeño es mejor que no empezar. El hábito y el sistema importan más que el monto inicial." },
  ]},
  { situation: "Tienes $1,000 en cuenta corriente, sin deudas y sin fondo de emergencia. Es el Black Friday. ¿Qué haces?", options: [
    { text: "Compro lo que necesitaba hace tiempo — están muy baratos", points: -10, feedback: "Sin fondo de emergencia, ese $1,000 es tu red de seguridad. Una emergencia médica o imprevisto laboral puede dejarte sin ningún respaldo si gastas ese dinero." },
    { text: "Primero construyo mi fondo de emergencia, luego pienso en compras", points: 10, feedback: "¡Correcto! El fondo de emergencia va antes que cualquier 'oportunidad'. Las ofertas del Black Friday vuelven cada año — una emergencia sin fondos puede costarte mucho más que cualquier descuento." },
    { text: "Compro solo si el descuento es mayor al 50%", points: -5, feedback: "El porcentaje de descuento no cambia tu situación financiera. La pregunta correcta no es '¿cuánto descuento?' sino '¿puedo permitirme esto ahora?'" },
  ]},
  { situation: "Encuentras un cobro mensual de $8 de una app que no recuerdas haber contratado. ¿Lo ignoras?", options: [
    { text: "Sí, son solo $8, no vale la pena el trámite", points: -10, feedback: "$8 al mes son $96 al año pagando por algo que no usas ni recuerdas. Además, puede ser una suscripción no autorizada. Siempre vale la pena revisar y cancelar cobros desconocidos." },
    { text: "Investigo de qué se trata y lo cancelo si no lo uso", points: 10, feedback: "¡Correcto! Revisar periódicamente los estados de cuenta es una práctica financiera básica. Los cobros pequeños y recurrentes son los que más fácilmente pasan desapercibidos." },
    { text: "Llamo al banco para bloquear la tarjeta completa", points: -5, feedback: "Bloquear la tarjeta completa por un cobro pequeño desconocido es desproporcionado. Lo primero es identificar el origen y cancelar o disputar según corresponda." },
  ]},
  { situation: "Tu presupuesto está equilibrado pero nunca alcanza para imprevistos pequeños. ¿Qué falta?", options: [
    { text: "Falta aumentar los ingresos", points: -5, feedback: "El problema no es el nivel de ingresos sino la ausencia de una categoría para imprevistos. Sin esa reserva, cualquier gasto inesperado rompe el presupuesto." },
    { text: "Falta una categoría de 'fondo de imprevistos' dentro del presupuesto mensual", points: 10, feedback: "¡Exacto! Incluir $30–$50 mensuales para esa categoría convierte los imprevistos en gastos planificados, no en emergencias que rompen el presupuesto cada vez." },
    { text: "Falta ser más disciplinado con los gastos", points: 0, feedback: "La disciplina ayuda, pero no elimina los imprevistos. Sin una categoría diseñada para ellos, el mejor presupuesto fallará ante la realidad." },
  ]},
  { situation: "Acabas de recibir un incremento salarial del 10%. ¿Qué haces con el dinero extra?", options: [
    { text: "Lo uso para mejorar mi estilo de vida — me lo merezco", points: -5, feedback: "Mejorar el estilo de vida con cada aumento se llama 'inflación de estilo de vida'. El ingreso sube pero el ahorro neto no mejora — es uno de los principales obstáculos para acumular riqueza." },
    { text: "Destino al menos el 50% del aumento al ahorro y el resto a mejorar mi vida", points: 10, feedback: "¡Excelente equilibrio! Aprovechar los aumentos para escalar el ahorro es uno de los hábitos más poderosos. Disfrutas una mejora real y avanzas hacia la libertad financiera." },
    { text: "Ahorro el 100% del aumento, no necesito gastar más", points: 0, feedback: "Ahorrar todo el aumento es financieramente ideal, pero puede ser insostenible si el nivel de vida nunca mejora. La clave es un equilibrio que puedas mantener en el tiempo." },
  ]},
  { situation: "Ves que puedes pagar una laptop con trabajo extra durante 2 meses, o con tarjeta en 12 cuotas. ¿Cuál eliges?", options: [
    { text: "Tarjeta en cuotas — es más cómodo y no tengo que esperar", points: -10, feedback: "Las cuotas agregan intereses y comprometen tu flujo mensual por un año. El trabajo extra puede ser intenso pero te deja la laptop completamente pagada y sin deuda posterior." },
    { text: "Trabajo extra durante 2 meses y la compro al contado", points: 10, feedback: "¡Decisión inteligente! Esforzarte durante 2 meses para comprar sin deuda elimina los intereses y desarrolla la disciplina de la gratificación diferida — una de las habilidades financieras más valiosas." },
    { text: "Espero a que baje el precio antes de decidir", points: 0, feedback: "Esperar por un mejor precio es válido si no la necesitas urgentemente. Pero si la necesitas, el ahorro potencial en precio debe compararse con el costo de oportunidad de esperar." },
  ]},
  { situation: "Dos trabajos: uno paga $200 más al mes pero está mucho más lejos. ¿Cómo decides?", options: [
    { text: "Solo el salario — más sueldo siempre es mejor", points: -5, feedback: "El salario bruto no es el ingreso real. Debes restar transporte adicional, tiempo perdido y alimentación fuera. A veces el trabajo 'mejor pagado' tiene un ingreso neto real menor." },
    { text: "Calculo el costo de transporte, tiempo y alimentación adicional para ver el ingreso neto real", points: 10, feedback: "¡Exacto! El análisis correcto es sobre el ingreso neto ajustado a costos. Si el trabajo más lejos te cuesta $150 extra en transporte, la ventaja real es de solo $50 — quizás no vale la pena." },
    { text: "El trabajo más cercano siempre es mejor financieramente", points: 0, feedback: "No necesariamente — depende de los costos reales de desplazamiento. Pero sí es verdad que la proximidad tiene un valor económico real que muchas personas subestiman." },
  ]},
  { situation: "Tu pareja propone compartir las finanzas completamente. Tú prefieres algo de autonomía. ¿Qué modelo usarían?", options: [
    { text: "Cuentas 100% separadas — cada quien paga lo suyo", points: 0, feedback: "Puede funcionar, pero requiere coordinación y acuerdos claros sobre gastos compartidos. Sin ese acuerdo, pueden surgir desbalances o resentimientos." },
    { text: "Cuenta conjunta para gastos del hogar + cuentas personales para gastos individuales", points: 10, feedback: "Este modelo 'híbrido' es el que menos conflictos genera: los gastos comunes se cubren de forma justa y cada uno mantiene autonomía sobre su dinero personal." },
    { text: "Finanzas 100% unidas sin distinción", points: 0, feedback: "Puede funcionar muy bien con mucha comunicación. El riesgo es que diferencias en hábitos de gasto generen conflictos. Depende de los valores compartidos y la transparencia entre ambos." },
  ]},
  { situation: "Tu presupuesto funciona bien en papel pero siempre te falta al final del mes. ¿Qué puede estar fallando?", options: [
    { text: "El presupuesto está mal calculado — debo hacer uno nuevo", points: -5, feedback: "El problema raramente es el diseño del presupuesto. Lo más probable es que haya gastos que no estás registrando correctamente o categorías subestimadas. Antes de rehacerlo, analiza las desviaciones." },
    { text: "Hay gastos reales que no están siendo registrados o categorías subestimadas", points: 10, feedback: "¡Correcto! La brecha entre el presupuesto en papel y la realidad generalmente se explica por gastos no registrados (antojos, aplicaciones, pequeñas salidas) o por promedios mensuales mal calculados." },
    { text: "El presupuesto es correcto — simplemente me falta disciplina", points: -5, feedback: "Atribuir todo a 'falta de disciplina' evita identificar el problema real. Con frecuencia el presupuesto tiene errores de diseño (categorías faltantes, montos subestimados) que hacen imposible cumplirlo aunque haya buena voluntad." },
  ]},

  // ══ CONTROL DE IMPULSOS (25) ══════════════════════════════════
  { situation: "En el supermercado ves una oferta: '3x2 en galletas'. No estaban en tu lista. ¿Qué haces?", options: [
    { text: "Las compro — es una oferta muy buena", points: -5, feedback: "Las ofertas de volumen generan compras no planeadas. Tres cajas por el precio de dos sigue siendo un gasto innecesario si no las necesitabas — además puedes terminar comiéndolas más rápido por tenerlas disponibles." },
    { text: "Las dejo — si no estaban en mi lista, no las necesito", points: 10, feedback: "¡Correcto! La lista de compras es tu escudo contra las compras impulsivas. Las ofertas activan el miedo a perder una oportunidad. Si no lo necesitas, no hay oportunidad que perder." },
    { text: "Compro solo una caja aunque la oferta sea 3x2", points: 0, feedback: "Mejor que comprar tres, pero sigue siendo una compra fuera de lista. La pregunta clave es: ¿lo necesitaba antes de ver la oferta?" },
  ]},
  { situation: "Ves unos zapatos que te encantan en vitrina. No los necesitas pero los quieres. ¿Qué haces?", options: [
    { text: "Los compro — trabajé duro y me lo merezco", points: -10, feedback: "'Me lo merezco' es una de las justificaciones más comunes para el gasto impulsivo. Merecerte algo no significa comprarlo en ese instante sin reflexión ni planificación." },
    { text: "Los fotografío, los dejo y vuelvo en 48 horas si aún los quiero", points: 10, feedback: "¡Perfecto! La regla de las 48 horas es una de las herramientas más eficaces contra el impulso. La mayoría de los deseos impulsivos se desvanecen con tiempo y distancia del estímulo." },
    { text: "Los compro si están en oferta o descuento", points: -5, feedback: "El descuento reduce el precio, no elimina el hecho de que no los necesitabas. Un gasto impulsivo con descuento sigue siendo impulsivo." },
  ]},
  { situation: "Un amigo te invita a un restaurante caro. No está en tu presupuesto del mes. ¿Qué haces?", options: [
    { text: "Voy sin pensar — las experiencias valen el dinero", points: -5, feedback: "Las experiencias tienen valor, pero ignorar el presupuesto constantemente hace que deje de ser un límite real. La clave es tener una categoría de ocio que cubra este tipo de gastos." },
    { text: "Evalúo si puedo ajustar otra categoría del presupuesto para cubrirlo sin endeudarme", points: 10, feedback: "¡Excelente! Mover fondos entre categorías del presupuesto es válido cuando es una decisión consciente — no es una violación del presupuesto, es gestionarlo con flexibilidad." },
    { text: "Lo cargo a la tarjeta y lo olvido", points: -10, feedback: "Poner en tarjeta un gasto no presupuestado y 'olvidarlo' es exactamente cómo se acumula deuda de consumo. La tarjeta no es dinero extra — es un préstamo con intereses." },
  ]},
  { situation: "Una tienda ofrece 'compra hoy y paga en enero sin intereses'. ¿Qué consideras antes de aceptar?", options: [
    { text: "Lo acepto — total no pago intereses", points: -5, feedback: "En enero tendrás una deuda que quizás no puedas pagar completa. Si no lo pagas a tiempo puede generar intereses retroactivos muy altos. Además, te compromete psicológicamente con un gasto futuro." },
    { text: "Solo lo acepto si el dinero estará disponible en enero y ya tenía planificado ese gasto", points: 10, feedback: "¡Correcto! Las promociones diferidas son útiles solo si el dinero estará disponible al vencimiento. Usarlas para comprar lo que no podías pagar es diferir un problema, no eliminarlo." },
    { text: "Lo rechazo siempre — las letras pequeñas siempre tienen trampa", points: 0, feedback: "La precaución es saludable, pero rechazar cualquier herramienta sin analizarla tampoco es óptimo. Las promociones sin intereses reales pueden ser útiles si se usan conscientemente." },
  ]},
  { situation: "Ves en Instagram un producto que un influencer recomienda. Lo quieres inmediatamente. ¿Qué haces?", options: [
    { text: "Lo compro desde el link del influencer de inmediato", points: -10, feedback: "Los influencers son pagados para generar urgencia y deseo. El link directo elimina el tiempo de reflexión. Comprar desde un estímulo emocional inmediato casi siempre significa pagar de más." },
    { text: "Lo agrego a una lista de deseos y lo evalúo en una semana", points: 10, feedback: "¡Perfecto! Una lista de deseos es una herramienta anti-impulso muy efectiva. Cuando vuelves a revisarla una semana después, muchos ítems ya no se sienten urgentes." },
    { text: "Lo busco en otras tiendas para comparar precios y luego decido", points: 0, feedback: "Comparar precios es mejor que comprar impulsivamente. Pero si no lo necesitabas antes de verlo, sigue siendo una compra no planificada." },
  ]},
  { situation: "Tu tarjeta de crédito tiene $2,000 de límite disponible. Sientes que 'tienes $2,000'. ¿Es correcto?", options: [
    { text: "Sí, es dinero disponible que puedo usar", points: -10, feedback: "El límite de la tarjeta no es tu dinero — es un préstamo disponible. Cada peso que usas es deuda con intereses. Confundir límite disponible con dinero propio es una de las raíces del sobreendeudamiento." },
    { text: "No, es deuda potencial — solo lo uso para gastos ya presupuestados", points: 10, feedback: "¡Correcto! La tarjeta bien usada es una herramienta de conveniencia, no de financiamiento. Si usas solo lo presupuestado y lo pagas completo, funciona a tu favor." },
    { text: "Depende — si lo pago a fin de mes no hay problema", points: 0, feedback: "Correcto en teoría, pero requiere disciplina estricta. El problema surge cuando 'lo pago a fin de mes' se convierte en 'pago el mínimo' — y ahí empieza la deuda cara." },
  ]},
  { situation: "Tu celular funciona bien pero salió el modelo nuevo. El tuyo tiene 2 años. ¿Qué haces?", options: [
    { text: "Lo cambio — la tecnología avanza rápido y debo estar al día", points: -10, feedback: "El ciclo de actualización de los fabricantes está diseñado para generar ese sentimiento de obsolescencia. Un teléfono que funciona no necesita ser reemplazado — cada año que lo extiendes es dinero en tu bolsillo." },
    { text: "Lo cambio solo si el mío falla o hay una función que genuinamente necesito", points: 10, feedback: "¡Decisión inteligente! El criterio correcto para cambiar un dispositivo es su funcionalidad, no su antigüedad. La diferencia de un modelo a otro raramente justifica el costo de reemplazo." },
    { text: "Lo cambio si encuentro una buena oferta de intercambio", points: -5, feedback: "Las ofertas de intercambio están diseñadas para hacer sentir que 'recuperas' algo. Si tu dispositivo funciona, cualquier intercambio sigue siendo un gasto neto." },
  ]},
  { situation: "Un vendedor dice: 'Esta oferta es solo hoy'. ¿Cómo reaccionas?", options: [
    { text: "Compro de inmediato para no perder la oferta", points: -10, feedback: "La urgencia artificial es una técnica de ventas clásica. Las 'ofertas de hoy' casi siempre vuelven. Si no lo tenías planificado, perder esa 'oportunidad' es la mejor decisión." },
    { text: "Agradezco y me retiro — si no lo planeé, no lo compro", points: 10, feedback: "¡Correcto! Cuando sientes urgencia artificial, es la señal para alejarte y pensar con calma. Una compra bien hecha no requiere presión de tiempo." },
    { text: "Pregunto si hay algún descuento adicional antes de decidir", points: -5, feedback: "Si no necesitabas el producto, conseguir más descuento solo reduce parcialmente el costo de una decisión impulsiva. La pregunta que importa es si realmente lo necesitas." },
  ]},
  { situation: "Tienes $300 para ocio este mes. Ya gastaste $250. Tu grupo te invita a un concierto de $80. ¿Qué haces?", options: [
    { text: "Voy — las experiencias con amigos son únicas", points: -5, feedback: "El valor de la experiencia es real, pero superar el presupuesto de ocio regularmente hace que deje de ser un límite significativo. La solución es mover conscientemente fondos de otra categoría." },
    { text: "Evalúo si puedo ajustar otra categoría para cubrir los $30 extra", points: 10, feedback: "¡Excelente! Este es el manejo consciente del presupuesto. Mover $30 de otra categoría es una decisión financiera activa — no una violación del presupuesto." },
    { text: "Lo cargo a la tarjeta — ya lo pagaré", points: -10, feedback: "Usar la tarjeta para cubrir excesos en ocio es el inicio de la deuda de consumo. Los $30 extra se convierten en deuda con intereses si no los pagas completos a fin de mes." },
  ]},
  { situation: "Puedes pagar el gimnasio anual por $300 o mensual a $35. ¿Cuál eliges?", options: [
    { text: "El anual — es más barato por mes", points: -5, feedback: "Matemáticamente el anual es mejor si vas todo el año. Pero si no tienes certeza de ir regularmente, estarás pagando por meses no usados. La mensualidad puede ser la opción correcta si preserva tu flexibilidad." },
    { text: "El mensual por 2–3 meses para validar el hábito, luego evalúo el anual", points: 10, feedback: "¡Decisión inteligente! Pagar más por mes para validar el hábito antes de comprometerte a un año es una inversión en autoconocimiento. Si realmente vas, el anual te ahorrará dinero." },
    { text: "El anual — si lo pago me obligaré a ir", points: -5, feedback: "La lógica de 'lo pago para obligarme' raramente funciona. El dolor del pago se desvanece rápido y si el hábito no está construido, el pago no lo construye." },
  ]},
  { situation: "Tu banco te ofrece aumentar tu límite de tarjeta de $2,000 a $5,000 sin costo. ¿Lo aceptas?", options: [
    { text: "Sí, es mejor tener más límite para emergencias", points: -5, feedback: "La tarjeta no debe ser el fondo de emergencia — para eso existe el ahorro. Un límite alto puede generar la tentación de gastarlo, y las emergencias resueltas con tarjeta se convierten en deudas caras." },
    { text: "Solo si tengo la disciplina de no usarlo salvo para lo planificado", points: 10, feedback: "¡Correcto! Un límite alto puede ser útil con disciplina. La pregunta clave es ser honesto sobre tus hábitos de gasto. Si tener más límite te tienta a gastar más, es mejor no aceptarlo." },
    { text: "No, un límite alto me tentará a gastar más", points: 5, feedback: "Es una decisión válida si conoces tus hábitos y prefieres ponerte un límite preventivo. No siempre será necesario rechazarlo, pero sí puede ser una buena medida de autocontrol." },
  ]},
  { situation: "Acabas de recibir una herencia de $5,000. La primera reacción es irte de viaje. ¿Qué haces?", options: [
    { text: "El viaje de mis sueños — estos momentos no vuelven", points: -10, feedback: "Si no tienes fondo de emergencia ni inversiones, usar una herencia completa en un viaje es una oportunidad perdida para cambiar tu situación financiera." },
    { text: "Espero 30 días antes de decidir qué hacer con el dinero", points: 10, feedback: "¡Excelente! La regla de los 30 días para ingresos inesperados grandes permite que la emoción inicial se asiente y tomes decisiones racionales. Muchas malas decisiones ocurren en los días inmediatos a recibir dinero." },
    { text: "Lo invierto todo de inmediato sin pensarlo", points: 0, feedback: "Invertir es positivo, pero sin un plan claro puede llevarte a instrumentos inadecuados. Tomarte el tiempo para definir objetivos genera mejores resultados que invertir por urgencia." },
  ]},
  { situation: "Tus colegas salen a restaurantes caros cada día. Tú comes en la oficina. ¿Qué piensas?", options: [
    { text: "Empiezo a salir con ellos — no quiero quedarme fuera socialmente", points: -5, feedback: "La presión social es uno de los principales motores del gasto impulsivo. Si salir con colegas no está en tu presupuesto, puedes unirte ocasionalmente. Una buena relación laboral no requiere gastar igual." },
    { text: "Mantengo mi hábito y ocasionalmente salgo cuando mi presupuesto lo permite", points: 10, feedback: "¡Excelente equilibrio! Mantener el hábito mientras participas socialmente de forma selectiva es una demostración de control financiero consciente. No necesitas hacer lo mismo que otros para pertenecer." },
    { text: "Les digo que no puedo permitirme eso y dejo de relacionarme con ellos", points: -5, feedback: "El aislamiento social tampoco es ideal. Se puede mantener la relación social sin igualar los gastos: proponer opciones más económicas, unirse al café de después o ser honesto sobre las prioridades del momento." },
  ]},
  { situation: "Ves una promoción: 'Lleva 2 camisas y la tercera es gratis'. Solo necesitas una. ¿Qué haces?", options: [
    { text: "Compro las 3 — es básicamente una gratis", points: -10, feedback: "Comprar tres cuando solo necesitabas una significa pagar por dos que no necesitabas. El precio de 'lo gratis' es haber comprado el doble de lo planeado." },
    { text: "Compro solo la que necesito", points: 10, feedback: "¡Correcto! La camisa 'gratis' tiene un precio: comprar dos extra. Si no las necesitabas, el gasto real es el de dos camisas innecesarias." },
    { text: "Compro las 3 si son de buena calidad y las usaré", points: 0, feedback: "Si genuinamente las usarás, puede ser una buena decisión. El problema es que la 'certeza' de usar algo suele sobreestimarse en el momento de la compra. Evalúalo honestamente." },
  ]},
  { situation: "Saliste de compras con una lista y ya compraste todo. Ves algo no planeado que 'podría servirte'. ¿Qué haces?", options: [
    { text: "Lo compro — nunca se sabe cuándo lo necesitaré", points: -10, feedback: "'Por si acaso' es la justificación más costosa en las compras. Comprar cosas que 'podrían servir' sin necesidad inmediata llena casas de objetos no usados y vacía presupuestos." },
    { text: "Lo dejo, anoto que existe y evalúo si realmente lo necesito en casa", points: 10, feedback: "¡Correcto! Separar el descubrimiento de la compra es la regla de las 48 horas aplicada al retail. Si al llegar a casa sigues pensando en ello, puedes volver por él." },
    { text: "Lo compro si el precio es razonable", points: -5, feedback: "Un precio razonable sobre algo innecesario sigue siendo un gasto innecesario. El criterio de compra no debe ser el precio, sino la necesidad real." },
  ]},
  { situation: "Ves publicidad de un coche nuevo y sientes que el tuyo 'ya se ve viejo'. El tuyo funciona perfectamente. ¿Qué haces?", options: [
    { text: "Empiezo a ver opciones de financiamiento para el nuevo", points: -10, feedback: "La publicidad de autos está diseñada para crear insatisfacción con lo que tienes. Un coche que funciona perfectamente no necesita ser reemplazado por estética. El financiamiento de un auto nuevo puede ser el mayor obstáculo para tus metas." },
    { text: "Reconozco que la publicidad me generó ese sentimiento y lo ignoro conscientemente", points: 10, feedback: "¡Excelente! Reconocer la influencia de la publicidad en tus emociones y separar ese sentimiento de una necesidad real es una habilidad financiera de alto nivel." },
    { text: "Busco información del nuevo coche solo para ver cuánto cuesta", points: -5, feedback: "Buscar información sin necesidad de compra rara vez termina en 'solo información'. La investigación activa alimenta el deseo y hace que la compra parezca más justificada." },
  ]},
  { situation: "La deuda de tu tarjeta es de $1,200 y solo puedes pagar el mínimo ($60). ¿Qué haces?", options: [
    { text: "Pago el mínimo y sigo usando la tarjeta con normalidad", points: -10, feedback: "Pagar solo el mínimo mientras sigues usando la tarjeta es como vaciar una bañera con un vaso mientras el grifo sigue abierto. Los intereses sobre $1,200 pueden superar $300 anuales." },
    { text: "Pago el mínimo pero dejo de usar la tarjeta y enfoco cualquier excedente en reducir la deuda", points: 10, feedback: "¡Correcto! Pagar el mínimo evita penalidades, pero lo importante es no aumentar la deuda y dirigir todo excedente a reducirla agresivamente." },
    { text: "Llamo al banco para que me den un período de gracia sin pago", points: -5, feedback: "Los períodos de gracia pueden parecer alivio, pero los intereses siguen corriendo. Es una solución a corto plazo que generalmente aumenta el costo total de la deuda." },
  ]},
  { situation: "Un colega te cuenta que con criptomonedas duplicó su dinero en un mes. Tienes $2,000 ahorrados. ¿Qué haces?", options: [
    { text: "Invierto mis $2,000 — esa rentabilidad es increíble", points: -10, feedback: "Las historias de éxito raramente mencionan las pérdidas paralelas. Por cada persona que duplicó, hay otras que perdieron todo. Invertir todos tus ahorros en activos de muy alto riesgo basándote en una historia puede destruir tu estabilidad." },
    { text: "Me informo bien antes de decidir y no arriesgo más del 5–10% de mis ahorros en activos de alto riesgo", points: 10, feedback: "¡Excelente criterio! Los activos de alto riesgo deben ocupar solo una pequeña porción del portafolio. Informarte antes de invertir y limitar la exposición es exactamente lo correcto." },
    { text: "No invierto en criptomonedas nunca — es pura especulación", points: 0, feedback: "La prudencia es válida. Las criptomonedas tienen alta volatilidad. Como cualquier activo, con una asignación pequeña y consciente puede tener un rol en un portafolio diversificado — pero sin exagerar la exposición." },
  ]},
  { situation: "Tu pareja quiere unas vacaciones caras que están fuera de tu presupuesto. ¿Cómo manejas la situación?", options: [
    { text: "Cedo y voy, aunque signifique endeudarme", points: -10, feedback: "Ceder a presión emocional para gastar más de lo que tienes es uno de los caminos más comunes al endeudamiento. Las vacaciones financiadas con deuda tienen un costo que se arrastra por meses." },
    { text: "Tenemos una conversación honesta sobre el presupuesto y exploramos alternativas dentro de él", points: 10, feedback: "¡Correcto! La comunicación financiera en pareja es fundamental. Compartir el presupuesto real y buscar una alternativa que tenga valor para los dos es el enfoque adulto y sostenible." },
    { text: "Le digo que no hay dinero y punto", points: -5, feedback: "Decir que 'no hay dinero' sin explicar el contexto puede generar malentendidos. La conversación financiera honesta en pareja incluye compartir las metas y buscar juntos una solución." },
  ]},
  { situation: "En un centro comercial entras 'solo a ver'. Dos horas después tienes bolsas de compras no planeadas. ¿Qué aprendiste?", options: [
    { text: "Que ir al centro comercial 'solo a ver' es una trampa para el gasto impulsivo", points: 10, feedback: "¡Exacto! Los centros comerciales están diseñados para convertir paseos en compras. El estímulo visual, los aromas y las ofertas crean un ambiente de compra. 'Solo a ver' sin lista ni presupuesto es alta exposición al impulso." },
    { text: "Que necesito más fuerza de voluntad", points: -5, feedback: "La fuerza de voluntad tiene límites. La solución más eficaz no es querer más, sino eliminar la exposición: ir con lista específica, presupuesto definido y tiempo limitado." },
    { text: "Nada — fue un día especial que no se repetirá", points: -10, feedback: "Sin reconocer el patrón, se repetirá. 'Solo a ver' como hábito recurrente puede representar cientos de dólares anuales en compras no planificadas." },
  ]},
  { situation: "Quieres comprarte algo costoso y lo justificas diciendo: 'Es una inversión en mí mismo'. ¿Cómo evalúas si realmente lo es?", options: [
    { text: "Todo lo que me hace sentir bien es una inversión en mí mismo", points: -10, feedback: "'Inversión en mí mismo' es una de las racionalizaciones más frecuentes para el gasto impulsivo. Una inversión real genera un retorno medible: habilidades, salud, capacidad de generar más ingresos." },
    { text: "Evalúo si ese gasto mejora concretamente mi salud, habilidades o capacidad de generar ingresos", points: 10, feedback: "¡Exacto! La prueba de una inversión personal real es que produce retorno: un curso que permite ganar más, equipo de ejercicio que usas regularmente. Sin retorno medible, es consumo, no inversión." },
    { text: "Si me lo merezco y puedo pagarlo, no necesito justificarlo más", points: -5, feedback: "Merecerse algo y poder pagarlo son condiciones necesarias pero no suficientes. Llamar consumo 'inversión' puede distorsionar las decisiones financieras a largo plazo." },
  ]},
  { situation: "Tu operadora te ofrece un plan que cuesta $15 más al mes con 'muchos más beneficios'. ¿Qué haces?", options: [
    { text: "Acepto — por $15 más vale la pena tener más", points: -5, feedback: "$15 al mes son $180 al año. La pregunta correcta es: ¿usarás realmente esos beneficios adicionales? Las operadoras venden servicios que la mayoría de los usuarios nunca activan." },
    { text: "Analizo cuáles beneficios realmente usaré y calculo si valen los $15", points: 10, feedback: "¡Exacto! La evaluación correcta de cualquier upgrade es: ¿el valor que recibiré supera el costo? Si los beneficios no cambian tu vida práctica, son $180 anuales mal gastados." },
    { text: "Rechazo automáticamente — las operadoras siempre intentan cobrarte más", points: 0, feedback: "La desconfianza es saludable, pero rechazar sin analizar puede hacerte perder un plan que sí tiene valor. Lo importante es hacer el análisis, no el rechazo automático." },
  ]},
  { situation: "Pasas frente a una heladería y se te antoja un helado de $5. No está en tu presupuesto. ¿Lo compras?", options: [
    { text: "Sí, son solo $5, no vale preocuparse", points: 0, feedback: "Un helado de $5 ocasional no destruye finanzas. El problema surge cuando este razonamiento se aplica múltiples veces al día. Individualmente son pequeños; acumulados, son significativos." },
    { text: "Solo si tengo margen en mi categoría de ocio o antojos", points: 10, feedback: "¡Correcto! Tener una categoría para pequeños placeres en el presupuesto es exactamente para esto. Gastar dentro de ese límite no es un problema — es el plan funcionando como debe." },
    { text: "Nunca compro nada que no esté en el presupuesto", points: -5, feedback: "Un presupuesto que no permite ningún placer espontáneo es insostenible. La clave es que los placeres pequeños tengan su propia categoría, para que sean planificados y sin culpa." },
  ]},

  // ══ AHORRO E INVERSIÓN (25) ═══════════════════════════════════
  { situation: "Tienes $2,000 ahorrados. Escuchas que el dólar podría devaluarse. ¿Qué haces?", options: [
    { text: "Los gasto rápido en cosas físicas antes de que pierdan valor", points: -10, feedback: "Gastar por miedo a la devaluación suele resultar en compras no planificadas de bajo valor real. La diversificación en instrumentos que protejan contra la inflación es la respuesta correcta, no el consumo acelerado." },
    { text: "Me informo sobre instrumentos de ahorro que protejan contra la inflación", points: 10, feedback: "¡Correcto! Ante la amenaza de devaluación, la respuesta inteligente es buscar instrumentos que preserven el poder adquisitivo: fondos indexados, depósitos ajustados a inflación o activos reales." },
    { text: "Los dejo en efectivo — es lo más seguro", points: -5, feedback: "El efectivo es el activo que más pierde ante la inflación. 'Lo más seguro' en términos nominales puede significar perder significativamente en poder adquisitivo real." },
  ]},
  { situation: "Tienes $3,000 y un conocido te ofrece 'duplicar tu dinero en 3 meses'. ¿Qué haces?", options: [
    { text: "Le entrego el dinero — lo conozco y confío", points: -10, feedback: "Conocer personalmente al ofertante no reduce el riesgo financiero. Duplicar dinero en 3 meses implica un rendimiento anualizado del 400% — ningún instrumento legítimo ofrece eso consistentemente. Es casi con certeza una estafa." },
    { text: "Me niego — ningún instrumento legítimo garantiza esos rendimientos en ese plazo", points: 10, feedback: "¡Correcto! Regla de oro: si parece demasiado bueno para ser verdad, lo es. Los rendimientos extraordinarios prometidos son la señal más clara de fraude o esquemas de alto riesgo sin respaldo real." },
    { text: "Invierto solo $500 para probar y ver si funciona", points: -5, feedback: "Probar con una cantidad menor puede hacerte perder $500. Si parece funcionar (técnica común en estafas Ponzi: al inicio pagan), te incentiva a meter más. No hay cantidad 'segura' en una propuesta fraudulenta." },
  ]},
  { situation: "Tienes 25 años y tu empresa ofrece plan de jubilación con aportación del empleador del 50%. ¿Te unes?", options: [
    { text: "No, la jubilación está muy lejos — prefiero tener el dinero ahora", points: -10, feedback: "A los 25 el tiempo es el activo más valioso por el interés compuesto. Rechazar una aportación del empleador del 50% equivale a rechazar un aumento de sueldo inmediato — es uno de los errores de largo plazo más costosos." },
    { text: "Sí, aunque aporte lo mínimo — la aportación del empleador es dinero gratis", points: 10, feedback: "¡Exacto! La aportación del empleador es un retorno del 50% inmediato sobre tu aporte — algo imposible de igualar. Con el interés compuesto de décadas, puede transformar tu jubilación." },
    { text: "Solo si puedo permitirme la aportación sin afectar mucho mi presupuesto", points: 0, feedback: "La lógica es válida, pero si la aportación es pequeña, priorizar el aporte para capturar el match del empleador casi siempre vale el ajuste al presupuesto. Es difícil encontrar un retorno mejor." },
  ]},
  { situation: "Tu fondo de emergencia ya tiene 3 meses de gastos. ¿Cuándo paras de aportarle y empiezas a invertir?", options: [
    { text: "Nunca paro — entre más seguridad, mejor", points: -5, feedback: "Un fondo de más de 6 meses puede ser excesivo para ingresos estables. El dinero por encima de ese umbral pierde el costo de oportunidad que generaría en inversiones. La seguridad tiene un límite óptimo." },
    { text: "Cuando llegue a 3–6 meses según mi situación laboral, empiezo a invertir el excedente", points: 10, feedback: "¡Correcto! Con 3–6 meses construido, el excedente de ahorro debe migrar a instrumentos que generen rendimiento real por encima de la inflación." },
    { text: "Primero llego a 12 meses de fondo, luego invierto", points: -5, feedback: "12 meses es excesivo para la mayoría de situaciones con ingreso estable. Mantener ese dinero en una cuenta de bajo rendimiento durante años tiene un costo de oportunidad significativo." },
  ]},
  { situation: "Tienes ahorros en un banco al 2% anual. La inflación es del 5%. ¿Es un buen negocio?", options: [
    { text: "Sí, al menos algo me genera", points: -10, feedback: "Un rendimiento del 2% con inflación del 5% significa que tu dinero pierde el 3% de poder adquisitivo cada año. En 10 años, $10,000 tendrán el poder de compra real de $7,374 de hoy." },
    { text: "No, mi dinero está perdiendo poder adquisitivo. Debo buscar instrumentos que superen la inflación", points: 10, feedback: "¡Exacto! El rendimiento real es el nominal menos la inflación. Con 2% nominal y 5% de inflación, el rendimiento real es -3%. Necesitas instrumentos que al menos empaten la inflación." },
    { text: "Depende — es mejor que guardar bajo el colchón", points: 0, feedback: "Sí, es mejor que el colchón, pero el estándar de comparación no debe ser 'peor alternativa'. La pregunta es si existe un instrumento de riesgo similar con mejor rendimiento real — en la mayoría de casos, sí existe." },
  ]},
  { situation: "Quieres invertir pero temes perder dinero. ¿Cuál es la mejor aproximación para comenzar?", options: [
    { text: "No invierto hasta tener absoluta certeza de no perder", points: -10, feedback: "La certeza absoluta no existe en ninguna inversión. Esperar esa certeza significa no invertir nunca. El riesgo cero implica rendimiento cero o negativo en términos reales." },
    { text: "Empiezo con instrumentos de bajo riesgo y largo plazo mientras aprendo", points: 10, feedback: "¡Correcto! Los fondos indexados, depósitos a plazo y bonos son puntos de entrada ideales. Mientras aprendes, puedes diversificar hacia instrumentos con mayor potencial de rendimiento." },
    { text: "Invierto en lo que me recomiende un amigo que ya invierte", points: -5, feedback: "Los consejos de amigos no se aplican necesariamente a tu situación, horizonte y tolerancia al riesgo. Es mejor educarte en los principios básicos para tomar decisiones propias." },
  ]},
  { situation: "Tienes $500 mensuales para ahorro/inversión. ¿Los pones todos en un solo instrumento?", options: [
    { text: "Sí, encuentro el mejor y concentro todo ahí", points: -5, feedback: "Concentrar todo en un instrumento aumenta el riesgo. Si ese instrumento tiene problemas, pierdes toda la posición. La diversificación reduce el riesgo sin necesariamente reducir el rendimiento esperado." },
    { text: "Los divido: parte en liquidez, parte en renta fija y algo en renta variable si tengo horizonte largo", points: 10, feedback: "¡Excelente! La diversificación por tipo de instrumento, riesgo y horizonte temporal es el principio más sólido de la inversión personal. Optimiza el balance riesgo/rendimiento según tus objetivos." },
    { text: "Los dejo en cuenta de ahorro hasta tener más — entonces sí invierto", points: -5, feedback: "Esperar a 'tener más' tiene un costo de oportunidad real. $500 en fondos indexados durante 20 años pueden convertirse en $3,000–$4,000 con rendimiento promedio histórico." },
  ]},
  { situation: "Una inversión que hiciste bajó un 20% en valor. ¿Qué haces?", options: [
    { text: "La vendo inmediatamente para no perder más", points: -10, feedback: "Vender en el fondo de una caída convierte una pérdida temporal en una pérdida permanente. Los inversores que venden en pánico son los que más pierden históricamente." },
    { text: "Evalúo si el fundamento del instrumento cambió o si es volatilidad normal del mercado", points: 10, feedback: "¡Correcto! La pregunta clave ante una caída es: ¿cambió algo fundamental, o es solo volatilidad? Si el fundamento es sólido y tu horizonte es largo, las caídas son oportunidades, no señales de venta." },
    { text: "Compro más aprovechando el precio bajo", points: 0, feedback: "Promediar costos puede ser una buena estrategia SI el instrumento es sólido y entiendes por qué cayó. Sin ese análisis, puede ser simplemente aumentar la exposición a un mal activo." },
  ]},
  { situation: "Tienes 35 años y recién empiezas a ahorrar para la jubilación. ¿Es demasiado tarde?", options: [
    { text: "Sí, ya no tiene sentido — el daño está hecho", points: -10, feedback: "Nunca es demasiado tarde, pero sí hay urgencia. A los 35 tienes 25–30 años de horizonte. La clave es compensar el tiempo perdido con un porcentaje de ahorro mayor. Empezar hoy es infinitamente mejor que no empezar." },
    { text: "No, pero necesito ahorrar un porcentaje mayor que si hubiera empezado antes", points: 10, feedback: "¡Correcto! El tiempo perdido se compensa con mayor tasa de ahorro. Si a los 25 el 10% era suficiente, a los 35 probablemente necesites el 15–20%. El plan cambia, pero la posibilidad no desaparece." },
    { text: "No, puedo empezar con el mismo porcentaje que si tuviera 25 años", points: -5, feedback: "El tiempo tiene un valor enorme en el interés compuesto. Empezar a los 35 con el mismo porcentaje que a los 25 resultará en un fondo de jubilación significativamente menor." },
  ]},
  { situation: "El mercado de acciones 'está muy alto'. ¿Esperarías a que baje para invertir?", options: [
    { text: "Sí, espero que caiga para comprar más barato", points: -5, feedback: "Intentar predecir los movimientos del mercado ha fracasado consistentemente incluso para inversores profesionales. Mientras esperas, pierdes dividendos y rendimientos reales." },
    { text: "No, invierto de forma regular independientemente del nivel del mercado", points: 10, feedback: "¡Correcto! Invertir montos regulares independientemente del precio (Dollar Cost Averaging) elimina el riesgo del market timing. A largo plazo, altos y bajos se promedian y el retorno histórico de mercados diversificados es positivo." },
    { text: "Solo invierto si un experto me dice que el momento es correcto", points: -5, feedback: "Ningún experto predice consistentemente los mercados. Un fondo indexado de bajo costo con aportes regulares suele superar las recomendaciones de timing a largo plazo." },
  ]},
  { situation: "Te ofrecen un instrumento que 'nunca ha tenido pérdidas'. ¿Qué piensas?", options: [
    { text: "Es exactamente lo que busco — bajo riesgo y buenos rendimientos", points: -10, feedback: "'Nunca ha tenido pérdidas' puede significar que lleva poco tiempo o que los datos son manipulados. La promesa de cero riesgo con buen rendimiento es siempre una señal de alerta." },
    { text: "Me genera desconfianza — todo instrumento tiene riesgo; si no lo menciona, algo oculta", points: 10, feedback: "¡Correcto! El riesgo cero no existe en finanzas. Los instrumentos de muy bajo riesgo tienen rendimientos bajos. Rendimiento atractivo sin riesgo declarado oculta información importante." },
    { text: "Lo investigo antes de decidir", points: 0, feedback: "Investigar es correcto. Pero la señal de alerta debe hacerte muy escéptico. Pregunta específicamente: ¿cuánto tiempo lleva? ¿Está regulado? ¿Cómo genera los rendimientos?" },
  ]},
  { situation: "Tienes $10,000 y decides invertir todo en acciones de una sola empresa porque 'la conoces bien'. ¿Es buena idea?", options: [
    { text: "Sí, conocer bien la empresa reduce el riesgo", points: -10, feedback: "Conocer bien una empresa reduce la incertidumbre informacional, pero no el riesgo sistémico. Una sola empresa puede quebrar, ser investigada o enfrentar disrupciones imprevistas que concentran las pérdidas." },
    { text: "No, debo diversificar — ninguna empresa elimina el riesgo de concentración", points: 10, feedback: "¡Correcto! La diversificación es el único 'almuerzo gratis' de las finanzas: reduce el riesgo sin necesariamente reducir el rendimiento esperado. Un fondo indexado te da exposición a cientos de empresas." },
    { text: "Puede funcionar si la empresa es una multinacional grande y estable", points: -5, feedback: "Las grandes multinacionales también quiebran o pierden valor significativamente. El tamaño y la estabilidad pasada no eliminan el riesgo de concentración." },
  ]},
  { situation: "Tu plan era ahorrar $200 al mes, pero este mes solo pudiste ahorrar $50. ¿Qué haces?", options: [
    { text: "Me rindo — si no puedo cumplir la meta, para qué seguir", points: -10, feedback: "Un mes difícil no destruye un plan de ahorro — abandonarlo sí. $50 es mejor que $0. La consistencia imperfecta a largo plazo supera a la perfección a corto plazo seguida de abandono." },
    { text: "Acepto el mes difícil, analizo qué pasó y retomo los $200 el mes siguiente", points: 10, feedback: "¡Exacto! La resiliencia financiera incluye reconocer los meses difíciles sin abandonar el plan. Analizar qué lo causó permite ajustar el presupuesto para que no se repita." },
    { text: "Intento compensar el siguiente mes ahorrando $350", points: 0, feedback: "Compensar puede funcionar si el mes siguiente lo permite. El riesgo es sobreexigirse y generar frustración. Lo más importante es volver a la meta regular." },
  ]},
  { situation: "Un asesor financiero te cobra el 2% anual sobre tus inversiones. ¿Es razonable?", options: [
    { text: "Sí, si me genera buenos rendimientos el 2% es poco", points: -5, feedback: "El 2% anual parece pequeño, pero sobre 20 años puede representar el 30–40% de tu riqueza acumulada. La mayoría de los gestores activos no superan al mercado consistentemente en ese porcentaje." },
    { text: "Evalúo si su rendimiento consistentemente supera al mercado en más del 2% — si no, prefiero fondos indexados de bajo costo", points: 10, feedback: "¡Correcto! Los estudios muestran que la mayoría de gestores activos no superan al mercado a largo plazo. Un fondo indexado con comisión del 0.1–0.5% suele generar mejor resultado neto." },
    { text: "Rechazo cualquier asesor con comisión — debo hacer todo yo mismo", points: 0, feedback: "No es necesariamente la mejor respuesta. Algunos asesores agregan valor real para situaciones complejas. El 2% es alto, pero no todo asesor es inadecuado — el análisis costo/beneficio es lo correcto." },
  ]},
  { situation: "Ves que la acción que compraste subió 40%. ¿La vendes?", options: [
    { text: "Sí, aseguro la ganancia antes de que baje", points: -5, feedback: "Vender automáticamente cuando sube es tan poco estratégico como comprar automáticamente cuando baja. La decisión de vender debe basarse en tu objetivo original y el fundamento del activo, no solo en el precio." },
    { text: "Evalúo si el activo aún es sólido y si la suba fue justificada, luego decido", points: 10, feedback: "¡Correcto! La suba del 40% puede ser el inicio de más crecimiento o el fin de él. El análisis del fundamento y tu objetivo original deben guiar la decisión, no la emoción." },
    { text: "No vendo nunca — las inversiones son para siempre", points: -5, feedback: "Mantener una inversión 'para siempre' sin revisarla tampoco es sólido. Los objetivos cambian, los activos cambian. Una revisión periódica no reactiva a los precios es parte de una inversión bien gestionada." },
  ]},
  { situation: "Quieres empezar a invertir pero no sabes por dónde. ¿Cuál es el primer paso más sensato?", options: [
    { text: "Abro una cuenta en la plataforma que más publicidad tiene", points: -10, feedback: "La publicidad no es indicador de calidad ni de idoneidad para tu situación. El primer paso es definir tus objetivos, horizonte temporal y tolerancia al riesgo antes de elegir cualquier plataforma." },
    { text: "Defino mis objetivos, horizonte de tiempo y tolerancia al riesgo antes de elegir el instrumento", points: 10, feedback: "¡Exacto! El instrumento debe servir al objetivo, no al revés. Con esos tres elementos claros, la elección del instrumento se vuelve mucho más fundamentada." },
    { text: "Invierto en lo mismo que invierte la persona más rica que conozco", points: -5, feedback: "La estrategia de otra persona depende de su situación, objetivos y horizonte — que pueden ser completamente distintos a los tuyos. Copiar estrategias sin contexto puede ser contraproducente." },
  ]},
  { situation: "Tienes una meta de ahorro para una casa en 10 años. ¿Dónde guardas ese dinero?", options: [
    { text: "En cuenta de ahorro bancaria — es seguro", points: -5, feedback: "Una cuenta al 2–3% durante 10 años con inflación del 4–5% resulta en pérdida de poder adquisitivo real. Para un horizonte de 10 años, instrumentos de inversión moderados pueden triplicar el resultado final." },
    { text: "En instrumentos diversificados de riesgo moderado — con 10 años puedo absorber algo de volatilidad", points: 10, feedback: "¡Exacto! Con 10 años de horizonte tienes tiempo suficiente para absorber la volatilidad y aprovechar el interés compuesto. La combinación de fondos indexados y renta fija optimiza el balance riesgo/rendimiento." },
    { text: "En inversiones de alto riesgo — quiero maximizar el rendimiento en 10 años", points: -5, feedback: "El alto riesgo es más adecuado para horizontes de 20+ años. En 10 años, una caída cerca del final puede destruir una parte significativa del capital justo cuando lo necesitas." },
  ]},
  { situation: "Tienes $10,000 y decides no invertirlos 'hasta que las cosas se estabilicen'. ¿Qué riesgo corres?", options: [
    { text: "Ninguno — es mejor esperar a la certeza", points: -10, feedback: "La certeza perfecta nunca llega. Mientras esperas, tu dinero pierde poder adquisitivo por la inflación. Los estudios muestran que el tiempo fuera del mercado cuesta más que la volatilidad dentro de él." },
    { text: "Que el dinero pierda poder adquisitivo mientras espero y me pierda el rendimiento acumulado", points: 10, feedback: "¡Correcto! La inacción tiene un costo real. Un año de espera con inflación al 5% significa que tus $10,000 valen realmente $9,500 en poder de compra. El riesgo de no invertir es tan real como el riesgo de invertir." },
    { text: "Solo si la espera dura más de un año", points: -5, feedback: "Incluso meses de espera tienen costo de oportunidad. No existe un umbral de tiempo a partir del cual la inacción sea costosa — el costo empieza el primer día." },
  ]},
  { situation: "Tienes 28 años, sin deudas y con $500 libres al mes. ¿Cuál es la distribución más inteligente?", options: [
    { text: "Todo al ahorro en cuenta bancaria hasta tener $10,000, luego invierto", points: -5, feedback: "Esperar a $10,000 para invertir tiene un costo de oportunidad significativo. El fondo de emergencia tiene un tamaño óptimo — el excedente debe ir a inversión." },
    { text: "Parte al fondo de emergencia hasta 3–6 meses, parte a inversión a largo plazo en paralelo", points: 10, feedback: "¡Exacto! Con 28 años y sin deudas, tienes el perfil ideal. Construir seguridad y rentabilidad en paralelo es la distribución óptima para tu momento financiero." },
    { text: "Todo a inversión — soy joven y puedo asumir riesgo", points: -5, feedback: "Invertir todo sin fondo de emergencia es riesgoso: cualquier imprevisto te obliga a liquidar inversiones, posiblemente en pérdida. La base de seguridad es prerequisito de la inversión." },
  ]},
  { situation: "Un conocido perdió el 60% de sus ahorros invirtiendo en algo que 'todos recomendaban'. ¿Qué aprendes?", options: [
    { text: "Que no debo invertir nunca — es muy peligroso", points: -10, feedback: "El error del conocido fue la falta de diversificación y el seguir recomendaciones sin análisis propio. No invertir nunca tiene su propio riesgo: perder poder adquisitivo por la inflación año tras año." },
    { text: "Que nunca debo concentrar los ahorros en un solo activo ni seguir recomendaciones sin entender lo que hago", points: 10, feedback: "¡Exacto! Diversificar y entender en qué inviertes son las dos protecciones más importantes. La pérdida del 60% casi siempre implica concentración excesiva en un activo de alto riesgo." },
    { text: "Que los demás siempre se equivocan con las inversiones", points: -5, feedback: "No es una regla universal — el problema es seguir recomendaciones sin comprender el instrumento ni el riesgo. La educación financiera propia es la única protección real." },
  ]},

  // ══ CIBERSEGURIDAD (25) ═══════════════════════════════════════
  { situation: "Tu cuenta de Netflix muestra un mensaje de suspensión y te pide actualizar tus datos de pago haciendo clic en un botón.", options: [
    { text: "Hago clic y actualizo mis datos", points: -10, feedback: "Esto es Phishing. Las plataformas legítimas nunca piden datos de pago por mensajes de alerta. Al ingresar tus datos en un enlace falso, los estafadores los capturan al instante." },
    { text: "Ignoro el mensaje y entro directo a netflix.com escribiendo la URL", points: 10, feedback: "¡Decisión correcta! Siempre accede a tus plataformas escribiendo la URL oficial, nunca desde un enlace recibido. El mensaje era falso y el sitio al que llevaba también." },
    { text: "Llamo al número que aparece en el mensaje", points: -5, feedback: "El número dentro de un mensaje fraudulento también puede ser del estafador. Usa siempre el número oficial publicado en el sitio web legítimo." },
  ]},
  { situation: "Recibes una llamada de alguien que dice ser tu jefe pidiendo una transferencia urgente a una cuenta desconocida.", options: [
    { text: "Hago la transferencia, es urgente", points: -10, feedback: "Este es el 'fraude del CEO falso'. Los estafadores usan la urgencia y la autoridad para anular tu juicio crítico. Una transferencia así raramente se puede recuperar." },
    { text: "Cuelgo y llamo a mi jefe a su número personal conocido", points: 10, feedback: "¡Perfecto! Verificar siempre por un canal distinto al que llegó la solicitud es la regla de oro. Dos segundos de verificación pueden salvarte de una pérdida enorme." },
    { text: "Le pido que me envíe un correo con los detalles", points: 0, feedback: "Mejor que transferir de inmediato, pero el correo también puede estar comprometido. La verificación más segura es siempre una llamada a un número que tú ya conozcas." },
  ]},
  { situation: "Recibes un SMS de tu banco: 'Su cuenta ha sido bloqueada. Ingrese aquí para desbloquearla'. ¿Qué haces?", options: [
    { text: "Hago clic en el enlace para desbloquear mi cuenta", points: -10, feedback: "Este es un ataque de smishing clásico. Los bancos reales nunca bloquean cuentas por SMS ni piden que ingreses a través de un enlace recibido. El enlace lleva a una página falsa que roba tus credenciales." },
    { text: "Ignoro el SMS y llamo al número oficial del banco en su página web", points: 10, feedback: "¡Correcto! Ante cualquier comunicación urgente que parezca de tu banco, verifica por el canal oficial que tú inicias: el número de la tarjeta o accediendo directamente a la app bancaria." },
    { text: "Reenvío el SMS a un amigo para que me diga si es real", points: -5, feedback: "Un amigo no puede verificar la legitimidad de un SMS bancario mejor que tú. La única verificación válida es contactar directamente al banco por canales que tú ya conoces y confías." },
  ]},
  { situation: "Hay Wi-Fi gratis en un café sin contraseña. Necesitas revisar tu cuenta bancaria. ¿Qué haces?", options: [
    { text: "Me conecto y reviso — es solo un momento", points: -10, feedback: "Las redes Wi-Fi públicas sin contraseña son el entorno perfecto para ataques de intermediario. Un atacante en la misma red puede interceptar tu tráfico y capturar credenciales bancarias en segundos." },
    { text: "Uso mis datos móviles para el acceso bancario y dejo el Wi-Fi para actividades no sensibles", points: 10, feedback: "¡Correcto! Los datos móviles son considerablemente más seguros que el Wi-Fi público para operaciones financieras. Esta distinción es una práctica de higiene digital básica." },
    { text: "Me conecto al Wi-Fi pero no entro a la app del banco — solo reviso el correo", points: -5, feedback: "El correo también puede contener información sensible. En Wi-Fi público sin contraseña, cualquier comunicación puede ser interceptada." },
  ]},
  { situation: "Un pop-up en tu computadora dice: 'Su computadora tiene un virus. Llame al 1-800-XXX para asistencia técnica gratuita'.", options: [
    { text: "Llamo al número — pueden ayudarme a solucionar el virus", points: -10, feedback: "Este es el 'scam de soporte técnico falso'. Al llamar, el operador te pedirá acceso remoto a tu computadora y datos de pago. El pop-up es la amenaza — no hay ningún virus real antes de que actúes." },
    { text: "Cierro el pop-up y escaneo mi computadora con mi antivirus habitual", points: 10, feedback: "¡Correcto! Los pop-ups de alerta de virus son casi siempre falsos. Tu propio antivirus instalado es la herramienta correcta para verificar si hay una amenaza real." },
    { text: "Apago la computadora para prevenir daños", points: 0, feedback: "Apagar no causa daño, pero tampoco resuelve nada. Lo correcto es cerrar el navegador, no abrir el enlace ni llamar al número, y revisar con tu antivirus propio." },
  ]},
  { situation: "Recibes un correo de tu 'banco' con el logo correcto y tu nombre diciendo que tu cuenta se cerrará en 24 horas si no verificas.", options: [
    { text: "Hago clic en el enlace del correo y verifico mis datos", points: -10, feedback: "El logo y el nombre pueden copiarse fácilmente. La urgencia artificial ('24 horas') es la señal de alerta. Los bancos legítimos no cierran cuentas por no responder a un correo." },
    { text: "Verifico el dominio del remitente y si no es el oficial del banco, lo marco como phishing", points: 10, feedback: "¡Exacto! El dominio del remitente es el detector más confiable de phishing. Un segundo de inspección puede ahorrarte mucho dinero y problemas." },
    { text: "Llamo al banco al número que encuentro en ese mismo correo", points: -5, feedback: "El número en el correo fraudulento puede llevar de vuelta al estafador. El número correcto está en el reverso de tu tarjeta o en la página web oficial que tú escribas directamente." },
  ]},
  { situation: "Tu contraseña del banco es '123456' porque 'la recuerdas fácil'. ¿Cuál es el riesgo?", options: [
    { text: "Ninguno, los bancos tienen sus propios sistemas de seguridad", points: -10, feedback: "'123456' es consistentemente la contraseña más hackeada del mundo. Una contraseña débil facilita ataques de fuerza bruta. Si alguien la adivina, accede a tu cuenta independientemente de los sistemas del banco." },
    { text: "Alto — debo usar una contraseña larga, única y difícil de adivinar para cada cuenta", points: 10, feedback: "¡Correcto! Una contraseña fuerte es la primera línea de defensa. Debe tener 12+ caracteres, combinar letras, números y símbolos, y ser única por servicio. Un gestor de contraseñas la recuerda por ti." },
    { text: "Bajo — si alguien intenta entrar, el banco me bloquea la cuenta", points: -5, feedback: "El bloqueo por intentos fallidos ayuda, pero una contraseña débil puede ser adivinada en el primer o segundo intento. La contraseña fuerte es la prevención, no el bloqueo el rescate." },
  ]},
  { situation: "Un 'funcionario de impuestos' te llama diciendo que debes $800 y que debes pagar con tarjeta de regalo HOY para evitar el arresto.", options: [
    { text: "Compro las tarjetas de regalo y le doy los códigos", points: -10, feedback: "Ninguna entidad gubernamental legítima acepta pagos en tarjetas de regalo ni amenaza con arresto inmediato por teléfono. Las tarjetas de regalo son el método favorito de los estafadores porque son anónimas e irrastreables." },
    { text: "Cuelgo inmediatamente — los organismos fiscales no cobran así", points: 10, feedback: "¡Correcto! Los organismos fiscales reales envían notificaciones escritas y tienen procesos formales. La amenaza de arresto inmediato por teléfono es una bandera roja de estafa en el 100% de los casos." },
    { text: "Le pido tiempo para verificar y llamo al número que él me da", points: -5, feedback: "El número que te da el estafador lo lleva de vuelta a él. Para verificar, busca el número oficial del organismo tributario en su sitio web oficial — no en la llamada recibida." },
  ]},
  { situation: "Recibes un WhatsApp de un número desconocido que dice ser tu familiar en problemas y necesita dinero urgente.", options: [
    { text: "Transfiero el dinero rápido, es una emergencia familiar", points: -10, feedback: "El 'fraude del familiar en emergencia' activa la respuesta emocional antes del análisis racional. Siempre llama directamente al familiar por su número conocido antes de transferir cualquier dinero." },
    { text: "Llamo directamente al familiar por su número habitual para verificar la emergencia", points: 10, feedback: "¡Exacto! Este es el único paso de verificación que importa: contactar directamente al supuesto familiar por un canal que tú ya tienes. Si es real, te atenderán; si es fraude, quedó expuesto." },
    { text: "Le pregunto al número desconocido más detalles para estar seguro", points: -5, feedback: "Los estafadores tienen respuestas preparadas para todas las preguntas. Ningún detalle en el chat puede verificar quién está realmente detrás del número. Solo el contacto directo con tu familiar puede hacerlo." },
  ]},
  { situation: "Ves una oferta increíble en un sitio web que no conoces: iPhone nuevo al 70% de descuento. ¿Qué haces?", options: [
    { text: "Compro de inmediato — no puedo perder esa oferta", points: -10, feedback: "Las 'ofertas increíbles' en sitios desconocidos son una estafa de e-commerce muy común. Después de pagar, el producto nunca llega. Un descuento del 70% en un sitio desconocido no es una oferta — es una trampa." },
    { text: "Verifico el sitio: dominio, reseñas externas, datos de contacto y métodos de pago seguros", points: 10, feedback: "¡Correcto! Antes de comprar en un sitio desconocido: busca el nombre + 'estafa' en Google, verifica HTTPS y dominio confiable, y asegúrate de que acepte métodos con protección al comprador." },
    { text: "Hago un pago pequeño de prueba para ver si funciona", points: -5, feedback: "Un pago pequeño puede 'funcionar' para ganarse tu confianza antes de aceptar un pedido grande. Además, al ingresar tu tarjeta, los datos pueden ser robados independientemente del monto." },
  ]},
  { situation: "Tu contraseña del correo es la misma que la del banco, redes sociales y trabajo. ¿Cuál es el riesgo?", options: [
    { text: "Bajo — es difícil que roben todas mis cuentas al mismo tiempo", points: -10, feedback: "Si una plataforma sufre una brecha de seguridad, los atacantes prueban esa contraseña en todas tus otras cuentas automáticamente. Una contraseña compartida convierte todas tus cuentas en dominó." },
    { text: "Alto — si roban una contraseña tienen acceso a todo. Debo usar contraseñas únicas por cuenta", points: 10, feedback: "¡Exacto! El credential stuffing (usar credenciales robadas en múltiples servicios) es uno de los ataques más comunes. Contraseñas únicas limitan el daño de cualquier brecha a una sola cuenta." },
    { text: "Medio — cambio la contraseña cada año para estar seguro", points: -5, feedback: "Cambiar una contraseña débil reutilizada anualmente no resuelve el problema. Si se roba en enero y la cambias en diciembre, el daño ya ocurrió. La solución son contraseñas únicas desde el inicio." },
  ]},
  { situation: "Alguien te llama diciendo ser de tu banco y para 'verificar tu identidad' te pide los últimos 4 dígitos de tu tarjeta.", options: [
    { text: "Se los doy — es para verificar mi identidad, no el número completo", points: -10, feedback: "Los últimos 4 dígitos son el primer paso para obtener más información sensible. Los bancos reales verifican tu identidad con datos que tú ya tienes registrados, no solicitando datos de tarjeta por teléfono." },
    { text: "Cuelgo y llamo al número oficial del banco para verificar si hay algún problema", points: 10, feedback: "¡Correcto! Un banco legítimo no perderá contacto contigo si realmente hay un problema. Devolver la llamada al número oficial te protege de cualquier impersonación." },
    { text: "Le pregunto su nombre y número de empleado antes de dar cualquier información", points: -5, feedback: "Los estafadores tienen respuestas para estas preguntas — pueden inventar cualquier nombre. Lo que importa no es quién dice ser, sino que si ellos llaman, cuelgues y verifiques tú." },
  ]},
  { situation: "Recibes un correo: 'Has ganado $50,000 en un sorteo. Envía $200 para cubrir costos de transferencia y recibe tu premio'.", options: [
    { text: "Envío los $200 — $50,000 a cambio de $200 es obvio que vale", points: -10, feedback: "Este es el 'fraude de comisión por adelantado'. Nunca hay premio — cada vez que pagas una 'comisión', aparece otra. Ningún sorteo legítimo requiere pago previo para entregar un premio." },
    { text: "Lo elimino inmediatamente — no participé en ningún sorteo y nadie regala $50,000 así", points: 10, feedback: "¡Correcto! Si no participaste, no ganaste. Y si no puedes recibir un premio sin pagar primero, no es un premio — es una estafa. Ninguna lotería legítima cobra por entregar un premio." },
    { text: "Pregunto más detalles antes de enviar nada", points: -5, feedback: "Los estafadores tienen respuestas profesionales para cada pregunta. Entrar en comunicación los da esperanza de convencerte. La respuesta correcta es eliminar y no responder." },
  ]},
  { situation: "Descargas una app gratuita de linterna. Pide acceso a tus contactos, SMS, cámara y micrófono. ¿Qué haces?", options: [
    { text: "Acepto todos los permisos — es gratis y necesito la linterna", points: -10, feedback: "Una linterna no necesita acceso a contactos, SMS ni micrófono para funcionar. Cuando una app pide permisos sin relación con su función, su propósito real es recopilar datos personales." },
    { text: "Rechazo los permisos no necesarios o busco una app que solo pida acceso a la cámara", points: 10, feedback: "¡Correcto! El principio de mínimo privilegio aplica a las apps: solo deben acceder a lo que necesitan para su función específica. Una linterna solo necesita el flash." },
    { text: "La instalo y luego veo en los ajustes qué permisos puedo desactivar", points: 0, feedback: "Gestionar permisos después de instalar es posible, pero algunos datos ya pueden ser recopilados durante la instalación. Es preferible revisar antes de instalar." },
  ]},
  { situation: "Un conocido te pide tu usuario y contraseña del banco 'solo para hacerte una transferencia mientras estás ocupado'.", options: [
    { text: "Se los doy — es alguien de confianza y solo es una vez", points: -10, feedback: "Compartir credenciales bancarias viola los términos del banco y te hace responsable de cualquier transacción realizada. Si hay un fraude posterior, el banco puede negarte protección." },
    { text: "Le explico que no puedo compartir mis credenciales bancarias con nadie", points: 10, feedback: "¡Correcto! Las credenciales bancarias son personales e intransferibles. Un verdadero amigo entenderá. Si necesitas que alguien haga una transferencia, puedes hacerla tú mismo." },
    { text: "Le doy las credenciales pero cambio la contraseña inmediatamente después", points: -5, feedback: "En el tiempo entre que das las credenciales y las cambias, puede ocurrir cualquier transacción. Aunque cambies la contraseña, si guardó otros datos sigue teniendo acceso parcial." },
  ]},
  { situation: "Ves que tu tarjeta de débito tiene un cargo de $1 de un comercio que no reconoces. ¿Lo ignoras?", options: [
    { text: "Sí, es solo $1 — no vale la pena el trámite", points: -10, feedback: "Los cargos de $1 desconocidos frecuentemente son 'pruebas de tarjeta': los estafadores verifican que la tarjeta esté activa antes de hacer cargos mucho mayores. Reportar ese $1 puede prevenir una pérdida de cientos." },
    { text: "Lo reporto al banco de inmediato como cargo no reconocido", points: 10, feedback: "¡Correcto! Un cargo pequeño no reconocido es una alerta temprana. Reportarlo activa el proceso de investigación y puede llevar al bloqueo preventivo antes de que ocurran cargos mayores." },
    { text: "Llamo al comercio para preguntarles qué es ese cargo", points: 0, feedback: "Puede ser útil si el nombre del comercio es reconocible. Si no lo reconoces en absoluto, la ruta correcta es el banco — tiene más herramientas para investigar y protegerte." },
  ]},
  { situation: "Tu banco te llama y para 'confirmarte que no fue fraude' te pide el código de verificación que llegó por SMS.", options: [
    { text: "Le doy el código — están tratando de protegerme", points: -10, feedback: "Este es el ataque de ingeniería social más común en banca. El banco real NUNCA te pedirá el código de verificación que llegó a tu teléfono — ese código está diseñado para ser secreto incluso para el banco." },
    { text: "Cuelgo inmediatamente y llamo al banco por el número oficial de mi tarjeta", points: 10, feedback: "¡Correcto! Los códigos OTP son secretos absolutos que ningún empleado bancario legítimo solicitará. Si alguien los pide, está intentando completar una transacción fraudulenta que ya inició." },
    { text: "Le pido que me llame de vuelta en 10 minutos", points: -5, feedback: "El código tiene vigencia corta y el estafador aprovechará esos 10 minutos. La solución no es posponer, sino colgar definitivamente y verificar directamente con el banco." },
  ]},
  { situation: "Encuentras una memoria USB en el estacionamiento de tu trabajo. Tienes curiosidad por saber qué contiene. ¿Qué haces?", options: [
    { text: "La conecto a mi computadora para ver qué tiene", points: -10, feedback: "Las memorias USB abandonadas son un vector de ataque conocido. Al conectarla puede ejecutarse automáticamente un malware que instala keyloggers o ransomware. La curiosidad tiene un costo real en ciberseguridad." },
    { text: "La entrego al área de TI o seguridad sin conectarla a ningún equipo", points: 10, feedback: "¡Correcto! El área de TI tiene herramientas para analizarla de forma segura. Esta técnica (baiting) está entre las tácticas de ataque más efectivas en entornos corporativos." },
    { text: "La conecto en una computadora vieja que no uso para trabajo importante", points: -5, feedback: "Si esa computadora está en la misma red que las demás, el malware puede propagarse. No hay una 'computadora segura' para conectar una USB desconocida sin análisis previo de seguridad." },
  ]},
  { situation: "Recibes un correo de LinkedIn diciendo que alguien tiene una oferta de trabajo increíble. Te pide que hagas clic para ver los detalles.", options: [
    { text: "Hago clic inmediatamente — puede ser una gran oportunidad", points: -10, feedback: "Los correos de phishing de redes profesionales son muy efectivos porque son plausibles. El enlace puede llevar a una página falsa de login o descargar malware." },
    { text: "Entro directamente a LinkedIn desde mi navegador para verificar si hay notificaciones reales", points: 10, feedback: "¡Correcto! Si la notificación es real, estará en tu cuenta cuando entres directamente. Si no está ahí, el correo era falso. Esta verificación por canal propio aplica a cualquier red social o servicio." },
    { text: "Respondo al correo preguntando más detalles sobre la oferta", points: -5, feedback: "Responder confirma que tu dirección está activa y puede aumentar el phishing que recibes. La verificación correcta siempre es por el canal oficial, no respondiendo al mensaje." },
  ]},
  { situation: "Tu app bancaria pide actualizarse a una 'nueva versión más segura' enviando un enlace por correo electrónico.", options: [
    { text: "Descargo la app desde el enlace del correo", points: -10, feedback: "Las apps bancarias legítimas se actualizan SOLO a través de las tiendas oficiales (App Store o Google Play). Un enlace de descarga por correo puede llevar a una app falsificada que roba tus credenciales." },
    { text: "Ignoro el enlace y actualizo la app directamente desde la tienda oficial de mi dispositivo", points: 10, feedback: "¡Correcto! App Store y Google Play son los únicos canales legítimos para actualizar apps bancarias. Cualquier otro método de distribución debe ser tratado como sospechoso." },
    { text: "Llamo al banco para preguntar si realmente enviaron ese correo", points: 0, feedback: "Llamar al banco es una buena práctica de verificación. Sin embargo, la regla de no descargar apps fuera de las tiendas oficiales es tan absoluta que no requiere verificación previa." },
  ]},
  { situation: "Publicas en redes sociales que te vas de vacaciones por 2 semanas. ¿Qué riesgos implica?", options: [
    { text: "Ninguno — todos mis amigos saben que viajo, no hay problema", points: -10, feedback: "Publicar ausencias avisa tanto a amigos como a desconocidos que tu hogar estará vacío. También alerta a ciberdelincuentes sobre el mejor momento para intentar accesos a cuentas sabiendo que no responderás alertas de inmediato." },
    { text: "Indica que mi casa puede estar desprotegida y que puedo no detectar alertas financieras oportunamente", points: 10, feedback: "¡Correcto! Las ausencias publicadas tienen dos vectores de riesgo: físico (robo al hogar) y digital (operaciones fraudulentas más lentas de detectar). Publicar al regreso minimiza estos riesgos." },
    { text: "Solo el riesgo físico — digitalmente no afecta nada", points: -5, feedback: "El riesgo digital es real: los ciberdelincuentes saben que durante un viaje puedes no revisar estados de cuenta ni responder alertas bancarias con la rapidez habitual." },
  ]},
  { situation: "Usas la misma dirección de correo para todo: trabajo, banco, redes sociales y compras. ¿Qué riesgo implica?", options: [
    { text: "Ninguno — el correo no compromete la seguridad directamente", points: -10, feedback: "El correo electrónico es la llave maestra de tu vida digital: desde él se puede iniciar el proceso de recuperación de contraseñas de prácticamente todos tus servicios. Comprometer ese correo equivale a perder acceso a todo." },
    { text: "Alto — si ese correo es comprometido, el atacante puede resetear contraseñas de todas mis cuentas. Debo usar correos separados para servicios críticos", points: 10, feedback: "¡Exacto! Un correo dedicado para servicios financieros reduce enormemente el daño de una brecha. Si roban el correo de entretenimiento, tu banco está protegido." },
    { text: "Bajo si tengo 2FA activado en el correo", points: 0, feedback: "El 2FA mejora significativamente la seguridad. Sin embargo, el riesgo de un punto único de falla sigue existiendo. La combinación de 2FA + correo dedicado para servicios críticos es la solución más robusta." },
  ]},
  { situation: "Tu empresa te pide instalar una app en tu celular personal para 'mejorar la productividad'. Pide acceso a contactos, cámara, micrófono y ubicación.", options: [
    { text: "La instalo — es mi empresa, confío en ellos", points: -5, feedback: "Incluso con empresas confiables, apps con permisos amplios en tu celular personal mezclan datos corporativos con personales. Pregunta qué permisos son estrictamente necesarios antes de aceptar." },
    { text: "Pregunto a TI por qué necesita esos permisos y si existe una alternativa con menos acceso", points: 10, feedback: "¡Correcto! El principio de mínimo privilegio aplica a apps también. Si una app de productividad necesita acceso a tu micrófono y cámara, hay una razón específica que TI debe poder explicar." },
    { text: "La instalo pero deshabilito todos los permisos después", points: 0, feedback: "Deshabilitar permisos puede ser una solución parcial, pero la conversación con TI antes de instalarla es lo correcto para entender si es necesaria y qué datos realmente accede." },
  ]},
];

// Al iniciar cada partida, se seleccionan 10 escenarios al azar del banco de 50+
function getGameScenarios() {
  return shuffle(GAME_SCENARIO_BANK).slice(0, 4);
}


// ─── SISTEMA DE NIVELES XP ────────────────────────────────────
const XP_LEVELS = [
  { level: 1, label: "Aprendiz",     min: 0,   max: 49,  icon: "🌱" },
  { level: 2, label: "Ahorrador",    min: 50,  max: 119, icon: "💰" },
  { level: 3, label: "Planificador", min: 120, max: 219, icon: "📋" },
  { level: 4, label: "Estratega",    min: 220, max: 349, icon: "🧠" },
  { level: 5, label: "Experto",      min: 350, max: Infinity, icon: "🏆" },
];

function getXpLevel(xp) {
  return XP_LEVELS.find(l => xp >= l.min && xp <= l.max) || XP_LEVELS[XP_LEVELS.length - 1];
}

// ─── NAV ─────────────────────────────────────────────────────
function Nav({ xp }) {
  return (
    <div
      style={{
        padding: "14px 18px 12px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: `1px solid ${C.border}`,
        background: "rgba(255,255,255,.88)",
        backdropFilter: "blur(14px)",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, color: C.textLight, letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 3 }}>
          Banco Guayaquil
        </div>
        <div style={{ fontSize: 16, fontWeight: 900, color: C.primary, letterSpacing: "-0.5px" }}>
          Educación Financiera BG
        </div>
      </div>
      {(() => {
        const lvl = getXpLevel(xp);
        const nextLvl = XP_LEVELS.find(l => l.level === lvl.level + 1);
        const progressPct = nextLvl
          ? Math.min(100, Math.round(((xp - lvl.min) / (nextLvl.min - lvl.min)) * 100))
          : 100;
        return (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "5px 10px", borderRadius: 999,
              background: `linear-gradient(135deg, ${C.primary}14, ${C.quat}10)`,
              border: `1px solid ${C.primary}24`,
              boxShadow: "0 4px 12px rgba(163,26,97,.08)",
            }}>
              <span style={{ fontSize: 13 }}>{lvl.icon}</span>
              <div>
                <div style={{ fontSize: 9, fontWeight: 800, color: C.textLight, lineHeight: 1, letterSpacing: 0.8 }}>
                  {lvl.label.toUpperCase()} · Nv.{lvl.level}
                </div>
                <div style={{ fontSize: 12, fontWeight: 900, color: C.primary, lineHeight: 1.1 }}>
                  {xp} XP
                </div>
              </div>
            </div>
            {nextLvl && (
              <div style={{ display: "flex", alignItems: "center", gap: 5, width: "100%" }}>
                <div style={{ flex: 1, height: 3, borderRadius: 999, background: `${C.primary}18`, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${progressPct}%`, borderRadius: 999, background: `linear-gradient(90deg, ${C.primary}, ${C.quat})`, transition: "width 0.6s ease" }} />
                </div>
                <span style={{ fontSize: 9, color: C.textLight, fontWeight: 700, whiteSpace: "nowrap" }}>
                  {nextLvl.min - xp} para Nv.{nextLvl.level}
                </span>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}

// ─── QUIZ MODE (10 aleatorias del banco de 50) ───────────────
function QuizMode({ xp, setXp, onBack, onGoGame, onGoLearn, onGoHome, onComplete, rewardEnabled = true }) {
  const [attempt, setAttempt] = useState(0);
  const questions = useMemo(() => shuffle(QUESTION_BANK).slice(0, 10), [attempt]);
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUIZ_TIME_LIMIT);
  const [wrongTopics, setWrongTopics] = useState({});
  const q = questions[idx];

  useEffect(() => {
    if (done || answer !== null) return;
    if (timeLeft <= 0) {
      setAnswer(-1);
      return;
    }
    const timer = window.setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [timeLeft, done, answer]);

  useEffect(() => {
    setTimeLeft(QUIZ_TIME_LIMIT);
  }, [idx, attempt]);

  const finalizeQuiz = (finalScore, finalWrongTopics) => {
    let award = 0;
    if (rewardEnabled) {
      award = finalScore * QUIZ_CORRECT_XP + QUIZ_COMPLETION_BONUS_XP;
      setXp((x) => x + award);
      setEarnedXp(award);
    } else {
      setEarnedXp(0);
    }
    const recommendations = getRecommendedTopics(finalWrongTopics);
    setDone(true);
    onComplete?.({
      score: finalScore,
      wrongTopics: finalWrongTopics,
      recommendations,
    });
  };

  const handleAnswer = (oi) => {
    if (answer !== null) return;
    setAnswer(oi);
    if (oi === q.a) setScore((s) => s + 1);
  };

  const next = () => {
    const currentWrongTopics = answer === q.a
      ? wrongTopics
      : { ...wrongTopics, [q.topic]: (wrongTopics[q.topic] || 0) + 1 };

    if (currentWrongTopics !== wrongTopics) {
      setWrongTopics(currentWrongTopics);
    }

    const nextScore = score;
    if (idx + 1 >= questions.length) {
      finalizeQuiz(nextScore, currentWrongTopics);
      return;
    }
    setIdx((i) => i + 1);
    setAnswer(null);
  };

  const restart = () => {
    setAttempt((a) => a + 1);
    setIdx(0);
    setAnswer(null);
    setScore(0);
    setDone(false);
    setEarnedXp(0);
    setWrongTopics({});
    setTimeLeft(QUIZ_TIME_LIMIT);
  };

  const progressPct = Math.round((((answer !== null ? idx + 1 : idx) / questions.length) * 100));
  const recommendedTopics = getRecommendedTopics(wrongTopics);

  const appSt = { fontFamily: "'Plus Jakarta Sans',sans-serif", background: C.bgSoft, minHeight: "100vh", color: C.text, maxWidth: 500, margin: "0 auto" };
  const backBt = { background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: "8px 14px", color: C.textMid, fontSize: 13, cursor: "pointer", fontFamily: "inherit", marginBottom: 18, boxShadow: "0 4px 12px rgba(22,15,65,.04)" };

  if (done) return (
    <div style={appSt}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      <Nav xp={xp} />
      <div style={{ padding: "30px 18px 40px" }}>
        <div style={{ background: `linear-gradient(160deg, ${C.secondary} 0%, ${C.secondary} 58%, ${C.primary} 100%)`, borderRadius: 26, padding: "28px 20px", textAlign: "center", color: "#fff", boxShadow: "0 18px 40px rgba(22,15,65,.18)", marginBottom: 18 }}>
          <div style={{ fontSize: 56, marginBottom: 10 }}>{score >= 8 ? "🏆" : score >= 5 ? "📈" : "💡"}</div>
          <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>{score >= 8 ? "¡Experto Financiero!" : score >= 5 ? "¡Buen resultado!" : "Sigue practicando"}</div>
          <div style={{ fontSize: 14, opacity: .88, marginBottom: 14 }}>Completaste el reto de conocimientos</div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 14, flexWrap: "wrap" }}>
            <div style={{ minWidth: 110, padding: "10px 14px", borderRadius: 16, background: "rgba(255,255,255,.13)", border: "1px solid rgba(255,255,255,.16)" }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase", opacity: .8 }}>Resultado</div>
              <div style={{ fontSize: 28, fontWeight: 900 }}>{score}/10</div>
            </div>
            <div style={{ minWidth: 110, padding: "10px 14px", borderRadius: 16, background: "rgba(255,255,255,.13)", border: "1px solid rgba(255,255,255,.16)" }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase", opacity: .8 }}>Experiencia</div>
              <div style={{ fontSize: 28, fontWeight: 900 }}>+{earnedXp}</div>
            </div>
          </div>
          <div style={{ fontSize: 13, opacity: .9 }}>
            {score >= 8 ? "Dominas muy bien los conceptos clave." : score >= 5 ? "Vas por buen camino; te falta afinar algunos detalles." : "Repite el módulo y vuelve a intentarlo con calma."}
          </div>
        </div>
        {!rewardEnabled && (
          <div style={{ fontSize: 12, color: C.textLight, marginBottom: 18, textAlign: "center" }}>
            Este módulo ya te otorgó XP antes. Puedes repetirlo para practicar, pero ya no vuelve a sumar experiencia.
          </div>
        )}
        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 20, padding: 18, textAlign: "left", marginBottom: 18, boxShadow: "0 8px 24px rgba(22,15,65,.06)" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.textLight, letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 8 }}>Siguiente paso sugerido</div>
          <div style={{ fontSize: 14, color: C.textMid, lineHeight: 1.6 }}>
            Ahora pasa al juego interactivo para aplicar lo aprendido en situaciones reales y reforzar tus decisiones financieras.
          </div>
        </div>
        {recommendedTopics.length > 0 && (
          <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 20, padding: 18, marginBottom: 18, boxShadow: "0 8px 24px rgba(22,15,65,.06)" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: C.textLight, letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 10 }}>
              Te recomendamos repasar
            </div>
            {recommendedTopics.map((item) => (
              <div key={item.topic} style={{ padding: "12px 0", borderTop: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: C.secondary, marginBottom: 4 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: C.textSoft, lineHeight: 1.55 }}>{item.reason}</div>
              </div>
            ))}
          </div>
        )}
        <button onClick={onGoGame} style={{ display: "block", width: "100%", padding: 16, borderRadius: 16, background: `linear-gradient(135deg, ${C.primary}, ${C.quat})`, border: "none", color: "#fff", fontSize: 15, fontWeight: 900, cursor: "pointer", fontFamily: "inherit", marginBottom: 10, boxShadow: `0 12px 24px ${C.primary}33` }}>Continuar al juego 🎮</button>
        <button onClick={onGoLearn} style={{ display: "block", width: "100%", padding: 15, borderRadius: 16, background: C.bg, border: `1.5px solid ${C.primary}`, color: C.primary, fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", marginBottom: 10 }}>Volver a aprender 📚</button>
        <button onClick={onGoHome || onBack} style={{ display: "block", width: "100%", padding: 15, borderRadius: 16, background: C.bgSoft, border: `1px solid ${C.border}`, color: C.textMid, fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", marginBottom: 10 }}>Ir al inicio 🏠</button>
        <button onClick={restart} style={{ display: "block", width: "100%", padding: 15, borderRadius: 16, background: C.bgSoft, border: `1px solid ${C.border}`, color: C.textMid, fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>Intentar de nuevo 🔄</button>
      </div>
    </div>
  );

  return (
    <div style={appSt}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      <Nav xp={xp} />
      <div style={{ padding: "18px 18px 80px" }}>
        <button onClick={onBack} style={backBt}>← Ir al inicio</button>
        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 22, padding: 18, marginBottom: 18, boxShadow: "0 10px 26px rgba(22,15,65,.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.4, color: C.textLight, textTransform: "uppercase", marginBottom: 5 }}>Reto de conocimientos</div>
              <div style={{ fontSize: 21, fontWeight: 900, color: C.secondary, lineHeight: 1.2 }}>Pregunta {idx + 1} de 10</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
              <div style={{ padding: "8px 10px", borderRadius: 14, background: `${C.success}12`, border: `1px solid ${C.success}24`, fontSize: 12, fontWeight: 800, color: C.success, whiteSpace: "nowrap" }}>
                ✓ {score} correctas{!rewardEnabled ? " · práctica" : ""}
              </div>
              <div style={{ padding: "7px 10px", borderRadius: 14, background: timeLeft <= 10 ? `${C.error}12` : `${C.primary}10`, border: `1px solid ${timeLeft <= 10 ? C.error : C.primary}24`, fontSize: 12, fontWeight: 900, color: timeLeft <= 10 ? C.error : C.primary, whiteSpace: "nowrap" }}>
                ⏱ {timeLeft}s
              </div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: C.textSoft, marginBottom: 8 }}>Avance del quiz</div>
          <div style={{ background: C.border, borderRadius: 999, height: 9, marginBottom: 10, overflow: "hidden" }}>
            <div style={{ height: "100%", background: `linear-gradient(90deg, ${C.primary}, ${C.quat})`, borderRadius: 999, width: `${progressPct}%`, transition: "width 0.4s" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.textSoft }}>
            <span>{progressPct}% completado</span>
            <span>{rewardEnabled ? `Hasta +${10 * QUIZ_CORRECT_XP + QUIZ_COMPLETION_BONUS_XP} XP` : "Modo práctica"}</span>
          </div>
        </div>
        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 24, padding: 20, boxShadow: "0 12px 28px rgba(22,15,65,.08)" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 999, background: `${C.primary}10`, border: `1px solid ${C.primary}18`, fontSize: 11, fontWeight: 800, letterSpacing: 1.1, color: C.primary, textTransform: "uppercase", marginBottom: 12 }}>
            <span>🧠</span>{q.topic}
          </div>
          <div style={{ fontSize: 19, fontWeight: 800, lineHeight: 1.45, color: C.secondary, marginBottom: 18 }}>{q.q}</div>
          {q.opts.map((opt, oi) => {
            let bg = C.bg, border = `1px solid ${C.border}`, color = C.textMid, shadow = "0 4px 12px rgba(22,15,65,.04)";
            if (answer !== null) {
              if (oi === q.a) { bg = C.successBg; border = `1.5px solid ${C.success}`; color = C.success; shadow = "none"; }
              else if (oi === answer) { bg = C.errorBg; border = `1.5px solid ${C.error}`; color = C.error; shadow = "none"; }
              else { color = C.textLight; shadow = "none"; }
            }
            return <button key={oi} onClick={() => handleAnswer(oi)} style={{ display: "block", width: "100%", textAlign: "left", padding: "14px 15px", borderRadius: 16, background: bg, border, color, fontSize: 13, marginBottom: 10, cursor: answer === null ? "pointer" : "default", fontFamily: "inherit", lineHeight: 1.5, transition: "all 0.2s", boxShadow: shadow }}><span style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width: 24, height: 24, borderRadius: 999, background: answer === null ? C.bgSoft : "transparent", marginRight: 10, fontWeight: 800 }}>{["A","B","C","D"][oi]}</span>{opt}</button>;
          })}
          {answer !== null && (
            <>
              <div style={{ padding: "13px 14px", borderRadius: 16, background: `${C.tertiary}28`, border: `1.5px solid ${C.tertiary}`, fontSize: 13, color: C.secondary, lineHeight: 1.6, marginBottom: 14 }}>
                {answer === -1 ? "⏱ Tiempo agotado. " : answer === q.a ? "✅ ¡Correcto! " : "❌ Incorrecto. "}{q.exp}
              </div>
              <button onClick={next} style={{ width: "100%", padding: 15, borderRadius: 16, background: `linear-gradient(135deg, ${C.primary}, ${C.quat})`, border: "none", color: "#fff", fontSize: 14, fontWeight: 900, cursor: "pointer", fontFamily: "inherit", boxShadow: `0 12px 24px ${C.primary}30` }}>
                {idx + 1 >= 10 ? "Ver resultados 🏁" : "Siguiente pregunta →"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────
export default function FinanzasTaller() {
  const persistedRef = useRef(loadPersistedState());
  const persisted = persistedRef.current;
  const [screen, setScreen] = useState("home");
  const [activeLesson, setActiveLesson] = useState(null);
  const [lessonPageIndex, setLessonPageIndex] = useState(0);
  const [completed, setCompleted] = useState(() => new Set(persisted?.completed || []));
  const [xp, setXp] = useState(() => persisted?.xp || 0);
  const [gameScreen, setGameScreen] = useState("intro");
  const [gameIndex, setGameIndex] = useState(0);
  const [gameScore, setGameScore] = useState(0);
  const [gameChoice, setGameChoice] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);
  const [activeScenarios, setActiveScenarios] = useState([]);
  const [accessStep, setAccessStep] = useState("app");
  const [lessonJustCompleted, setLessonJustCompleted] = useState(null);
  const [completedModules, setCompletedModules] = useState(() => persisted?.completedModules || { quiz: false, game: false });
  const [viewedLessonPages, setViewedLessonPages] = useState(() => persisted?.viewedLessonPages || {});
  const [lastLearning, setLastLearning] = useState(() => persisted?.lastLearning || null);
  const [quizInsights, setQuizInsights] = useState(() => persisted?.quizInsights || { wrongTopics: {}, recommendations: [], score: null });
  const [toolsState, setToolsState] = useState(() => persisted?.toolsState || {
    budgetIncome: "",
    savingsGoal: "",
    savingsMonthly: "",
    debtBalance: "",
    debtMonthlyPayment: "",
    debtExtraPayment: "",
  });
  const [soundOn, setSoundOn] = useState(() => persisted?.soundOn !== false);
  const [lastGameAward, setLastGameAward] = useState(0);
  const [gameTimeLeft, setGameTimeLeft] = useState(GAME_TIME_LIMIT);
  const [showResetModal, setShowResetModal] = useState(false);
  const audioCtxRef = useRef(null);

  const playSound = (preset) => {
    if (!soundOn || typeof window === "undefined") return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume().catch(() => {});

    const patterns = {
      start: [
        { f: 392, d: 0.08, t: 0 },
        { f: 494, d: 0.08, t: 0.09 },
        { f: 587, d: 0.12, t: 0.18 },
      ],
      good: [
        { f: 523.25, d: 0.07, t: 0 },
        { f: 659.25, d: 0.08, t: 0.08 },
        { f: 783.99, d: 0.12, t: 0.17 },
      ],
      neutral: [
        { f: 392, d: 0.08, t: 0 },
        { f: 440, d: 0.08, t: 0.09 },
      ],
      bad: [
        { f: 329.63, d: 0.09, t: 0 },
        { f: 261.63, d: 0.14, t: 0.1 },
      ],
      next: [
        { f: 587.33, d: 0.06, t: 0 },
        { f: 659.25, d: 0.08, t: 0.07 },
      ],
      win: [
        { f: 523.25, d: 0.07, t: 0 },
        { f: 659.25, d: 0.07, t: 0.08 },
        { f: 783.99, d: 0.09, t: 0.16 },
        { f: 1046.5, d: 0.18, t: 0.26 },
      ],
    };

    const notes = patterns[preset] || patterns.neutral;
    const now = ctx.currentTime;

    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = preset === "bad" ? "triangle" : "sine";
      osc.frequency.setValueAtTime(note.f, now + note.t);
      gain.gain.setValueAtTime(0.0001, now + note.t);
      gain.gain.exponentialRampToValueAtTime(0.05, now + note.t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + note.t + note.d);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + note.t);
      osc.stop(now + note.t + note.d + 0.02);
    });
  };

  useEffect(() => {
    return () => {
      if (audioCtxRef.current && typeof audioCtxRef.current.close === "function") {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          xp,
          completed: Array.from(completed),
          completedModules,
          viewedLessonPages,
          lastLearning,
          quizInsights,
          toolsState,
          soundOn,
        })
      );
    } catch {}
  }, [xp, completed, completedModules, viewedLessonPages, lastLearning, quizInsights, toolsState, soundOn]);

  const resetGame = () => {
    setGameIndex(0);
    setGameScore(0);
    setGameChoice(null);
    setGameHistory([]);
    setActiveScenarios([]);
    setGameScreen("intro");
    setLastGameAward(0);
    setGameTimeLeft(GAME_TIME_LIMIT);
  };


  const confirmResetProgress = () => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {}
    }

    setCompleted(new Set());
    setXp(0);
    setCompletedModules({ quiz: false, game: false });
    setActiveLesson(null);
    setLessonJustCompleted(null);
    setViewedLessonPages({});
    setLastLearning(null);
    setQuizInsights({ wrongTopics: {}, recommendations: [], score: null });
    setToolsState({
      budgetIncome: "",
      savingsGoal: "",
      savingsMonthly: "",
      debtBalance: "",
      debtMonthlyPayment: "",
      debtExtraPayment: "",
    });
    setLessonPageIndex(0);
    setAccessStep("app");
    setShowResetModal(false);
    setScreen("home");
    resetGame();
  };

  const allLessonsCompleted = completed.size === LESSONS.length;
  const unlockedLessonIds = new Set(
    LESSONS.filter((lesson, index) => getLessonUnlockState(completed, index)).map((lesson) => lesson.id)
  );
  const nextLessonToContinue = LESSONS.find((lesson) => unlockedLessonIds.has(lesson.id) && !completed.has(lesson.id)) || LESSONS[LESSONS.length - 1];

  const openLesson = (l, page = 0) => {
    setActiveLesson(l);
    setLessonPageIndex(page);
    setLastLearning({ lessonId: l.id, pageIndex: page });
    setScreen("lesson");
  };

  const resumeLearning = () => {
    if (lastLearning?.lessonId) {
      const lesson = LESSONS.find((item) => item.id === lastLearning.lessonId);
      if (lesson) {
        const page = Math.max(0, Math.min(lastLearning.pageIndex || 0, lesson.content.length - 1));
        openLesson(lesson, page);
        return;
      }
    }
    openLesson(nextLessonToContinue, 0);
  };

  const completeLesson = (lesson) => {
    let wasNew = false;
    setCompleted((c) => {
      if (c.has(lesson.id)) return c;
      wasNew = true;
      return new Set([...c, lesson.id]);
    });
    setLastLearning({ lessonId: lesson.id, pageIndex: lesson.content.length - 1 });
    if (wasNew) setXp((x) => x + LESSON_COMPLETE_XP);
  };

  useEffect(() => {
    if (screen !== "lesson" || !activeLesson) return;
    setLastLearning({ lessonId: activeLesson.id, pageIndex: lessonPageIndex });
    const viewed = viewedLessonPages?.[activeLesson.id] || [];
    if (viewed.includes(lessonPageIndex)) return;
    setViewedLessonPages((prev) => ({
      ...prev,
      [activeLesson.id]: [...(prev?.[activeLesson.id] || []), lessonPageIndex],
    }));
    setXp((x) => x + LESSON_PAGE_XP);
  }, [screen, activeLesson, lessonPageIndex, viewedLessonPages]);

  const startGame = () => {
    if (!allLessonsCompleted) {
      setScreen("learn");
      return;
    }
    const sc = getGameScenarios();
    setActiveScenarios(sc);
    setGameIndex(0);
    setGameScore(0);
    setGameChoice(null);
    setGameHistory([]);
    setGameScreen("play");
    setScreen("game");
    setLastGameAward(0);
    setGameTimeLeft(GAME_TIME_LIMIT);
    playSound("start");
  };

  const handleGameChoice = (oi) => {
    if (gameChoice !== null) return;
    const scenario = activeScenarios[gameIndex];
    if (!scenario || !scenario.options?.[oi]) return;
    const opt = scenario.options[oi];
    setGameChoice(oi);
    setGameScore((s) => s + opt.points);
    setGameHistory((h) => [...h, { scenario: gameIndex, choice: oi, points: opt.points, timedOut: false }]);
    playSound(opt.points > 0 ? "good" : opt.points < 0 ? "bad" : "neutral");
  };

  const handleGameTimeout = () => {
    if (gameChoice !== null) return;
    setGameChoice(-1);
    setGameHistory((h) => [...h, { scenario: gameIndex, choice: -1, points: 0, timedOut: true }]);
    playSound("neutral");
  };

  useEffect(() => {
    if (screen !== "game" || gameScreen !== "play" || gameChoice !== null) return;
    if (gameTimeLeft <= 0) {
      handleGameTimeout();
      return;
    }
    const timer = window.setTimeout(() => setGameTimeLeft((v) => v - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [screen, gameScreen, gameChoice, gameTimeLeft, gameIndex]);

  const nextScenario = () => {
    if (!activeScenarios.length) {
      resetGame();
      return;
    }

    if (gameIndex + 1 >= activeScenarios.length) {
      const finalScore = gameScore;
      let award = 0;
      if (!completedModules.game) {
        award = finalScore >= 30 ? 120 : finalScore >= 10 ? 80 : 40;
        setXp((x) => x + award);
        setCompletedModules((m) => ({ ...m, game: true }));
      }
      setLastGameAward(award);
      setGameScreen("result");
      playSound(finalScore >= 30 ? "win" : "next");
    } else {
      setGameIndex((i) => i + 1);
      setGameChoice(null);
      setGameTimeLeft(GAME_TIME_LIMIT);
      playSound("next");
    }
  };

  const totalActivities = LESSONS.length + 2;
  const completedActivities = completed.size + (completedModules.quiz ? 1 : 0) + (completedModules.game ? 1 : 0);
  const progress = Math.min(Math.round((completedActivities / totalActivities) * 100), 100);

  const handleToolChange = (field, value) => {
    setToolsState((prev) => ({ ...prev, [field]: value }));
  };

  const budgetIncome = Number(toolsState.budgetIncome) || 0;
  const savingsGoal = Number(toolsState.savingsGoal) || 0;
  const savingsMonthly = Number(toolsState.savingsMonthly) || 0;
  const debtBalance = Number(toolsState.debtBalance) || 0;
  const debtMonthlyPayment = Number(toolsState.debtMonthlyPayment) || 0;
  const debtExtraPayment = Number(toolsState.debtExtraPayment) || 0;

  const savingsMonths = savingsGoal > 0 && savingsMonthly > 0 ? Math.ceil(savingsGoal / savingsMonthly) : 0;
  const debtMonthsBase = debtBalance > 0 && debtMonthlyPayment > 0 ? Math.ceil(debtBalance / debtMonthlyPayment) : 0;
  const improvedDebtPayment = debtMonthlyPayment + debtExtraPayment;
  const debtMonthsImproved = debtBalance > 0 && improvedDebtPayment > 0 ? Math.ceil(debtBalance / improvedDebtPayment) : 0;
  const debtMonthsSaved = debtMonthsBase > 0 && debtMonthsImproved > 0 ? Math.max(debtMonthsBase - debtMonthsImproved, 0) : 0;

  const appSt = { fontFamily: "'Plus Jakarta Sans',sans-serif", background: C.bgSoft, minHeight: "100vh", color: C.text, maxWidth: 500, margin: "0 auto" };
  const cardSt = { background: C.bg, border: `1px solid ${C.border}`, borderRadius: 20, padding: 18, marginBottom: 14, cursor: "pointer", transition: "all 0.22s ease", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 8px 22px rgba(22,15,65,0.05)" };
  const backBt = { background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: "8px 14px", color: C.textMid, fontSize: 13, cursor: "pointer", fontFamily: "inherit", marginBottom: 18, boxShadow: "0 4px 12px rgba(22,15,65,.04)" };
  const blkWrap = { margin: "0 18px 14px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, boxShadow: "0 1px 4px rgba(22,15,65,0.05)" };

  const hover = (e, color, enter) => {
    e.currentTarget.style.transform = enter ? "translateY(-2px)" : "translateY(0)";
    e.currentTarget.style.boxShadow = enter ? `0 6px 20px ${color}25` : "0 1px 4px rgba(22,15,65,0.07)";
  };

  const renderBlock = (lesson, item, i) => {

    // ── CONCEPT ──────────────────────────────────────────────────
    if (item.type === "concept") return (
      <div key={i} style={{ ...blkWrap, borderLeft: `4px solid ${lesson.color}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: `${lesson.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>💬</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: lesson.color }}>{item.title}</div>
        </div>
        {item.bullets
          ? item.bullets.map((b, bi) => (
              <div key={bi} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                <div style={{ minWidth: 8, height: 8, borderRadius: "50%", background: lesson.color, marginTop: 5, flexShrink: 0, opacity: 0.7 }} />
                <span style={{ fontSize: 13, color: C.textMid, lineHeight: 1.65 }}>{b}</span>
              </div>
            ))
          : <div style={{ fontSize: 13, color: C.textMid, lineHeight: 1.7 }}>{item.text}</div>
        }
      </div>
    );

    // ── TIP ──────────────────────────────────────────────────────
    if (item.type === "tip") return (
      <div key={i} style={{ margin: "0 18px 14px", background: `${C.tertiary}22`, border: `1.5px solid ${C.tertiary}`, borderRadius: 16, padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
          <span style={{ fontSize: 16 }}>💡</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: C.secondary, textTransform: "uppercase", letterSpacing: 1 }}>Consejo clave</span>
        </div>
        {item.bullets
          ? item.bullets.map((b, bi) => (
              <div key={bi} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                <div style={{ minWidth: 8, height: 8, borderRadius: "50%", background: C.secondary, marginTop: 5, flexShrink: 0, opacity: 0.5 }} />
                <span style={{ fontSize: 13, color: C.secondary, lineHeight: 1.65 }}>{b}</span>
              </div>
            ))
          : <div style={{ fontSize: 13, color: C.secondary, lineHeight: 1.65 }}>{item.text}</div>
        }
      </div>
    );

    // ── WARNING ──────────────────────────────────────────────────
    if (item.type === "warning") return (
      <div key={i} style={{ margin: "0 18px 14px", background: C.warnBg, border: `1.5px solid ${C.warnText}`, borderRadius: 16, padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 18 }}>⚠️</span>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.warnText }}>{item.title}</div>
        </div>
        <div style={{ fontSize: 13, color: C.warnText, lineHeight: 1.65 }}>{item.text}</div>
        {item.highlight && (
          <div style={{ marginTop: 12, background: C.warnBg, borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <span style={{ fontSize: 13 }}>💰</span>
            <span style={{ fontSize: 14, fontWeight: 900, color: C.warnText }}>{item.highlight}</span>
          </div>
        )}
      </div>
    );

    // ── STEPS ────────────────────────────────────────────────────
    if (item.type === "steps") return (
      <div key={i} style={blkWrap}>
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 14, color: C.secondary }}>{item.title}</div>
        {item.items.map((s, j) => (
          <div key={j} style={{ display: "flex", gap: 12, marginBottom: 10, alignItems: "flex-start", background: `${lesson.color}07`, border: `1px solid ${lesson.color}18`, borderRadius: 12, padding: "10px 12px" }}>
            <div style={{ minWidth: 32, height: 32, borderRadius: 9, background: `${lesson.color}18`, color: lesson.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, flexShrink: 0 }}>{s.num}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: lesson.color, marginBottom: 3 }}>{s.label}</div>
              <div style={{ fontSize: 12, color: C.textMid, lineHeight: 1.55 }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
    );

    // ── RULE 50/30/20 ─────────────────────────────────────────────
    if (item.type === "rule5020") return (
      <div key={i} style={blkWrap}>
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 14, color: C.secondary }}>{item.title}</div>
        {item.items.map((r, j) => (
          <div key={j} style={{ display: "flex", gap: 12, marginBottom: 10, alignItems: "center", background: `${r.color}09`, border: `1px solid ${r.color}25`, borderRadius: 12, padding: "10px 14px" }}>
            <div style={{ minWidth: 52, height: 52, borderRadius: 12, background: `${r.color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 16, fontWeight: 900, color: r.color }}>{r.pct}</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: r.color, marginBottom: 3 }}>{r.label}</div>
              <div style={{ fontSize: 12, color: C.textMid, lineHeight: 1.5 }}>{r.desc}</div>
            </div>
          </div>
        ))}
      </div>
    );

    // ── COMPARE ──────────────────────────────────────────────────
    if (item.type === "compare") return (
      <div key={i} style={{ margin: "0 18px 14px" }}>
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10, color: C.secondary }}>{item.title}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[item.left, item.right].map((side, j) => (
            <div key={j} style={{ background: `${side.color}08`, border: `1.5px solid ${side.color}30`, borderRadius: 14, padding: "14px 12px" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: side.color, marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${side.color}25` }}>{side.label}</div>
              {side.items.map((it, k) => (
                <div key={k} style={{ display: "flex", alignItems: "flex-start", gap: 7, marginBottom: 8 }}>
                  <div style={{ minWidth: 16, height: 16, borderRadius: "50%", background: `${side.color}20`, border: `1.5px solid ${side.color}70`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: side.color }} />
                  </div>
                  <span style={{ fontSize: 11, color: C.textMid, lineHeight: 1.55 }}>{it}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );

    // ── CHECKLIST ────────────────────────────────────────────────
    if (item.type === "checklist") return (
      <div key={i} style={blkWrap}>
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 14, color: C.secondary }}>{item.title}</div>
        <div style={{ background: `${C.success}09`, border: `1px solid ${C.success}30`, borderRadius: 12, padding: "12px 14px", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <span style={{ fontSize: 14 }}>✅</span>
            <span style={{ fontSize: 11, fontWeight: 800, color: C.success, letterSpacing: 1, textTransform: "uppercase" }}>Buenas prácticas</span>
          </div>
          {item.goods.map((g, j) => (
            <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 9, marginBottom: 8 }}>
              <div style={{ minWidth: 20, height: 20, borderRadius: 6, background: C.successBg, border: `1.5px solid ${C.success}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                <span style={{ fontSize: 11, color: C.success, fontWeight: 900, lineHeight: 1 }}>✓</span>
              </div>
              <span style={{ fontSize: 12, color: C.textMid, lineHeight: 1.55 }}>{g}</span>
            </div>
          ))}
        </div>
        <div style={{ background: `${C.error}07`, border: `1px solid ${C.error}25`, borderRadius: 12, padding: "12px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <span style={{ fontSize: 14 }}>❌</span>
            <span style={{ fontSize: 11, fontWeight: 800, color: C.error, letterSpacing: 1, textTransform: "uppercase" }}>Malas prácticas</span>
          </div>
          {item.bads.map((b, j) => (
            <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 9, marginBottom: 8 }}>
              <div style={{ minWidth: 20, height: 20, borderRadius: 6, background: C.errorBg, border: `1.5px solid ${C.error}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                <span style={{ fontSize: 11, color: C.error, fontWeight: 900, lineHeight: 1 }}>✗</span>
              </div>
              <span style={{ fontSize: 12, color: C.textMid, lineHeight: 1.55 }}>{b}</span>
            </div>
          ))}
        </div>
      </div>
    );

    return null;
  };


  if (accessStep === "gate") return (
    <div style={appSt}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 18px" }}>
        <div style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 22, padding: 24, boxShadow: "0 6px 24px rgba(22,15,65,0.08)" }}>
          <div style={{ fontSize: 40, marginBottom: 12, textAlign: "center" }}>💰</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: C.secondary, textAlign: "center", marginBottom: 10 }}>
            Educación Financiera BG
          </div>
          <div style={{ fontSize: 14, color: C.textMid, lineHeight: 1.65, textAlign: "center", marginBottom: 18 }}>
            Antes de comenzar la experiencia, registra tus datos en el formulario. Luego regresa y continúa a la aplicación.
          </div>
          <div style={{ background: `${C.tertiary}22`, border: `1px solid ${C.tertiary}`, borderRadius: 14, padding: 14, fontSize: 12, color: C.textMid, lineHeight: 1.55, marginBottom: 18 }}>
            Esta experiencia tiene tres espacios: <strong>Aprender</strong>, <strong>Pon a prueba tus conocimientos</strong> y una <strong>simulación gamificada</strong>.
          </div>
          <button
            onClick={() => window.open(FORM_URL, "_blank", "noopener,noreferrer")}
            style={{
              width: "100%",
              padding: 16,
              marginBottom: 12,
              borderRadius: 14,
              border: "none",
              background: `linear-gradient(135deg, ${C.primary}, ${C.quat})`,
              color: "#fff",
              fontWeight: 800,
              fontSize: 15,
              cursor: "pointer",
              fontFamily: "inherit"
            }}
          >
            Ir al registro
          </button>
          <button
            onClick={() => setAccessStep("app")}
            style={{
              width: "100%",
              padding: 16,
              borderRadius: 14,
              border: `1.5px solid ${C.primary}`,
              background: C.bg,
              color: C.primary,
              fontWeight: 800,
              fontSize: 15,
              cursor: "pointer",
              fontFamily: "inherit"
            }}
          >
            Ya me registré, continuar
          </button>
        </div>
      </div>
    </div>
  );

  // ══ HOME ═══════════════════════════════════
  if (screen === "home") return (
    <div style={appSt}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      <Nav xp={xp} />
      <div style={{ padding: "18px 18px 88px" }}>
        <div style={{ background: `linear-gradient(160deg, ${C.secondary} 0%, ${C.secondary} 58%, ${C.primary} 100%)`, borderRadius: 28, padding: "22px 20px", color: "#fff", boxShadow: "0 18px 40px rgba(22,15,65,.18)", marginBottom: 18, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,.08)", right: -40, top: -70 }} />
          <div style={{ position: "absolute", width: 110, height: 110, borderRadius: "50%", background: "rgba(255,255,255,.06)", right: 70, bottom: -45 }} />
          <div style={{ position: "relative" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 999, background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.14)", fontSize: 11, fontWeight: 800, letterSpacing: 1.1, textTransform: "uppercase", marginBottom: 14 }}>
              <span>💡</span>Ruta interactiva
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1.08, letterSpacing: "-0.9px", marginBottom: 10 }}>
              Tu dinero,
              <br />
              tus decisiones.
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.6, opacity: 0.92, maxWidth: 320, marginBottom: 16 }}>
              Aprende conceptos clave, ponlos a prueba y toma decisiones en escenarios reales.
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 999, background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.14)", fontSize: 12, fontWeight: 800 }}>
                <span>✨</span>
                Aprende, responde y avanza hasta el tesoro final
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.9 }}>{progress}% completado</div>
              <div style={{ fontSize: 12, opacity: 0.85 }}>
                {Math.max(totalActivities - completedActivities, 0)} módulo{Math.max(totalActivities - completedActivities, 0) === 1 ? "" : "s"} por completar
              </div>
            </div>
            <div style={{ background: "rgba(255,255,255,.18)", borderRadius: 999, height: 10, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 999, background: `linear-gradient(90deg, ${C.bg}, ${C.accentSoft})`, width: `${progress}%`, transition: "width 0.7s ease" }} />
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12, marginBottom: 16 }}>
          <button
            onClick={resumeLearning}
            style={{
              width: "100%",
              textAlign: "left",
              padding: 18,
              borderRadius: 20,
              background: C.bg,
              border: `1px solid ${C.border}`,
              boxShadow: "0 10px 24px rgba(22,15,65,.05)",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.3, color: C.textLight, textTransform: "uppercase", marginBottom: 6 }}>
              Continuar aprendizaje
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color: C.secondary, marginBottom: 5 }}>
              {lastLearning?.lessonId
                ? `${LESSONS.find((item) => item.id === lastLearning.lessonId)?.title || "Tu ruta"}`
                : `${nextLessonToContinue.icon} ${nextLessonToContinue.title}`}
            </div>
            <div style={{ fontSize: 13, color: C.textSoft, lineHeight: 1.55 }}>
              {lastLearning?.lessonId
                ? `Retoma en la página ${(lastLearning.pageIndex || 0) + 1}.`
                : "Sigue con el siguiente tema disponible a tu ritmo."}
            </div>
          </button>

          {quizInsights?.recommendations?.length > 0 && (
            <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 20, padding: 18, boxShadow: "0 10px 24px rgba(22,15,65,.05)" }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.3, color: C.textLight, textTransform: "uppercase", marginBottom: 8 }}>
                Recomendado para ti
              </div>
              <div style={{ fontSize: 16, fontWeight: 900, color: C.primary, marginBottom: 8 }}>
                Refuerza estos temas
              </div>
              {quizInsights.recommendations.map((item) => (
                <div key={item.topic} style={{ paddingTop: 10, marginTop: 10, borderTop: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: C.secondary }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: C.textSoft, lineHeight: 1.55 }}>{item.reason}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.4, color: C.textLight, textTransform: "uppercase", marginBottom: 4 }}>Aprendizaje</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: C.secondary }}>Continúa tu formación</div>
          </div>
          <div style={{ padding: "7px 10px", borderRadius: 14, background: C.bg, border: `1px solid ${C.border}`, fontSize: 12, fontWeight: 700, color: C.textSoft }}>
            {completedActivities}/{totalActivities}
          </div>
        </div>

        <div style={{ ...cardSt, flexDirection: "column", alignItems: "flex-start", gap: 12, border: `1px solid ${C.primary}22`, boxShadow: "0 12px 28px rgba(22,15,65,.06)" }} onClick={() => setScreen("learn")} onMouseEnter={e => hover(e, C.primary, true)} onMouseLeave={e => hover(e, C.primary, false)}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14, width: "100%" }}>
            <div style={{ width: 54, height: 54, borderRadius: 18, background: `linear-gradient(135deg, ${C.primary}18, ${C.quat}12)`, fontSize: 28, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>📚</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: C.primary, marginBottom: 4 }}>Ruta de aprendizaje</div>
              <div style={{ fontSize: 13, color: C.textSoft, lineHeight: 1.55 }}>Explora paso a paso presupuesto, hábitos, ahorro, inversión y prevención de fraudes.</div>
            </div>
            <div style={{ fontSize: 18, color: C.primary, marginTop: 3 }}>→</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, width: "100%" }}>
            {LESSONS.map(l => <span key={l.id} style={{ fontSize: 11, padding: "7px 10px", borderRadius: 14, background: completed.has(l.id) ? `${l.color}12` : C.bgSoft, border: `1px solid ${completed.has(l.id) ? l.color + "33" : C.border}`, color: completed.has(l.id) ? l.color : C.textSoft, fontWeight: 700 }}>{completed.has(l.id) ? "✓ " : ""}{l.title}</span>)}
          </div>
        </div>

        <div style={{ ...cardSt, flexDirection: "column", alignItems: "flex-start", gap: 12, border: `1px solid ${C.secondary}20`, boxShadow: "0 12px 28px rgba(22,15,65,.06)" }} onClick={() => { if (allLessonsCompleted) setScreen("quizmode"); else setScreen("learn"); }} onMouseEnter={e => hover(e, C.secondary, true)} onMouseLeave={e => hover(e, C.secondary, false)}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, width: "100%" }}>
            <div style={{ width: 54, height: 54, borderRadius: 18, background: `${C.secondary}10`, fontSize: 28, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>🧠</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: C.secondary, marginBottom: 4 }}>Pon a prueba tus conocimientos {completedModules.quiz ? "✅" : allLessonsCompleted ? "" : "🔒"}</div>
              <div style={{ fontSize: 13, color: C.textSoft, lineHeight: 1.55 }}>10 preguntas aleatorias para reforzar lo aprendido y ganar experiencia. {!allLessonsCompleted ? "Completa primero toda la sección de aprendizaje." : ""}</div>
            </div>
            <div style={{ fontSize: 18, color: C.secondary }}>{completedModules.quiz ? "✓" : allLessonsCompleted ? "→" : "🔒"}</div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, padding: "6px 10px", borderRadius: 999, background: `${C.secondary}0D`, color: C.secondary, border: `1px solid ${C.secondary}20`, fontWeight: 800 }}>Banco de 50 preguntas</span>
            <span style={{ fontSize: 11, padding: "6px 10px", borderRadius: 999, background: `${C.tertiary}24`, color: C.secondary, border: `1px solid ${C.tertiary}`, fontWeight: 800 }}>Hasta +120 XP</span>
          </div>
        </div>

        <div style={{ ...cardSt, flexDirection: "column", alignItems: "flex-start", gap: 12, border: `1px solid ${C.quat}20`, boxShadow: "0 12px 28px rgba(22,15,65,.06)" }} onClick={() => { if (allLessonsCompleted) { resetGame(); setScreen("game"); } else { setScreen("learn"); } }} onMouseEnter={e => hover(e, C.quat, true)} onMouseLeave={e => hover(e, C.quat, false)}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, width: "100%" }}>
            <div style={{ width: 54, height: 54, borderRadius: 18, background: `${C.quat}10`, fontSize: 28, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>🎮</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: C.quat, marginBottom: 4 }}>Juego interactivo {completedModules.game ? "✅" : allLessonsCompleted ? "" : "🔒"}</div>
              <div style={{ fontSize: 13, color: C.textSoft, lineHeight: 1.55 }}>Toma decisiones en escenarios financieros reales y descubre el impacto de cada elección. {!allLessonsCompleted ? "Se desbloquea al terminar aprendizaje." : ""}</div>
            </div>
            <div style={{ fontSize: 18, color: C.quat }}>{completedModules.game ? "✓" : allLessonsCompleted ? "→" : "🔒"}</div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, padding: "6px 10px", borderRadius: 999, background: `${C.quat}0D`, color: C.quat, border: `1px solid ${C.quat}20`, fontWeight: 800 }}>4 escenarios por partida</span>
            <span style={{ fontSize: 11, padding: "6px 10px", borderRadius: 999, background: `${C.quat}10`, color: C.quat, border: `1px solid ${C.quat}26`, fontWeight: 800 }}>Hasta +120 XP</span>
          </div>
        </div>

        <div style={{ marginTop: 20, marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.4, color: C.textLight, textTransform: "uppercase", marginBottom: 4 }}>Herramientas</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: C.secondary, marginBottom: 6 }}>Utilidades prácticas</div>
          <div style={{ fontSize: 13, color: C.textSoft, lineHeight: 1.55 }}>Estas calculadoras no forman parte de los temas de aprendizaje. Son apoyos para aplicar lo aprendido a tu realidad.</div>
        </div>

        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 24, padding: 18, boxShadow: "0 10px 24px rgba(22,15,65,.05)", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
            <div style={{ width: 54, height: 54, borderRadius: 18, background: `${C.secondary}10`, fontSize: 28, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>🧮</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: C.secondary, marginBottom: 4 }}>Herramientas financieras</div>
              <div style={{ fontSize: 13, color: C.textSoft, lineHeight: 1.55 }}>Calculadoras simples para presupuesto, metas de ahorro y pago de deuda.</div>
            </div>
          </div>
          <button
            onClick={() => setScreen("tools")}
            style={{
              width: "100%",
              padding: 15,
              borderRadius: 14,
              background: `linear-gradient(135deg, ${C.secondary}, ${C.primary})`,
              border: "none",
              color: "#fff",
              fontSize: 14,
              fontWeight: 900,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Ir a herramientas
          </button>
        </div>

        <div style={{
          display: "flex", alignItems: "flex-start", gap: 10,
          background: C.warnBg, border: `1px solid ${C.warnText}30`,
          borderRadius: 14, padding: "12px 14px", marginTop: 14, marginBottom: 4,
        }}>
          <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>💾</span>
          <div style={{ fontSize: 12, color: C.warnText, lineHeight: 1.6 }}>
            <strong>Tu progreso se guarda en este dispositivo y navegador.</strong> Si borras el caché del navegador o usas otra ventana, el progreso puede perderse. Usa siempre el mismo navegador para continuar donde lo dejaste.
          </div>
        </div>

        <button
          onClick={() => setShowResetModal(true)}
          style={{
            width: "100%",
            marginTop: 6,
            padding: "14px 16px",
            borderRadius: 16,
            background: C.bg,
            border: `1.5px solid ${C.error}22`,
            color: C.error,
            fontSize: 14,
            fontWeight: 800,
            cursor: "pointer",
            fontFamily: "inherit",
            boxShadow: "0 8px 18px rgba(22,15,65,.04)",
          }}
        >
          Reiniciar progreso
        </button>

        {showResetModal && (
          <div
            onClick={() => setShowResetModal(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(22,15,65,.48)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 18,
              zIndex: 100,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: 380,
                background: C.bg,
                borderRadius: 24,
                border: `1px solid ${C.border}`,
                boxShadow: "0 24px 50px rgba(22,15,65,.22)",
                overflow: "hidden",
              }}
            >
              <div style={{ padding: "22px 20px 16px", background: `linear-gradient(160deg, ${C.secondary} 0%, ${C.primary} 100%)`, color: "#fff" }}>
                <div style={{ width: 48, height: 48, borderRadius: 16, background: "rgba(255,255,255,.16)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 12 }}>↺</div>
                <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 6 }}>¿Estás seguro?</div>
                <div style={{ fontSize: 13, lineHeight: 1.6, opacity: 0.9 }}>Se borrarán tu experiencia, módulos completados y avances del juego y quiz.</div>
              </div>
              <div style={{ padding: 20 }}>
                <div style={{ background: C.bgSoft, border: `1px solid ${C.border}`, borderRadius: 16, padding: "12px 14px", fontSize: 13, color: C.textSoft, lineHeight: 1.6, marginBottom: 16 }}>
                  Esta acción no se puede deshacer. Podrás volver a empezar la ruta desde cero.
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <button
                    onClick={() => setShowResetModal(false)}
                    style={{
                      padding: "13px 14px",
                      borderRadius: 14,
                      background: C.bg,
                      border: `1px solid ${C.border}`,
                      color: C.textMid,
                      fontSize: 14,
                      fontWeight: 800,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmResetProgress}
                    style={{
                      padding: "13px 14px",
                      borderRadius: 14,
                      background: `linear-gradient(135deg, ${C.error}, ${C.error})`,
                      border: "none",
                      color: "#fff",
                      fontSize: 14,
                      fontWeight: 900,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      boxShadow: "0 10px 22px rgba(185,28,28,.28)",
                    }}
                  >
                    Sí, reiniciar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ══ LEARN ══════════════════════════════════
  if (screen === "learn") return (
    <div style={appSt}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      <Nav xp={xp} />
      <div style={{ padding: "18px 18px 80px" }}>
        <button onClick={() => setScreen("home")} style={backBt}>← Ir al inicio</button>

        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 24, padding: "20px 18px", boxShadow: "0 12px 28px rgba(22,15,65,.06)", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.3, color: C.textLight, textTransform: "uppercase", marginBottom: 6 }}>Ruta de aprendizaje</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: C.primary, marginBottom: 6 }}>📚 Aprender</div>
              <div style={{ fontSize: 13, color: C.textSoft, lineHeight: 1.6, maxWidth: 320 }}>
                Selecciona una lección y avanza a tu ritmo. Cada módulo resume conceptos clave y consejos prácticos.
              </div>
            </div>
            <div style={{ minWidth: 74, textAlign: "center", padding: "10px 8px", borderRadius: 18, background: `${C.primary}10`, border: `1px solid ${C.primary}18` }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.2, color: C.primary, textTransform: "uppercase" }}>Progreso</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: C.primary, lineHeight: 1.1 }}>{completed.size}</div>
              <div style={{ fontSize: 11, color: C.textSoft }}>de {LESSONS.length}</div>
            </div>
          </div>
        </div>

        {LESSONS.map((l, index) => {
          const isUnlocked = unlockedLessonIds.has(l.id);
          const viewedCount = viewedLessonPages?.[l.id]?.length || 0;
          const lastPageSeen = viewedCount > 0 ? Math.max(...(viewedLessonPages?.[l.id] || [0])) + 1 : 0;
          return (
            <div
              key={l.id}
              style={{
                ...cardSt,
                border: `1px solid ${l.color}18`,
                borderRadius: 22,
                padding: 18,
                boxShadow: "0 10px 24px rgba(22,15,65,.05)",
                cursor: isUnlocked ? "pointer" : "not-allowed",
                opacity: isUnlocked ? 1 : 0.6,
              }}
              onClick={() => isUnlocked && openLesson(l, Math.min(lastPageSeen, l.content.length - 1))}
              onMouseEnter={e => isUnlocked && hover(e, l.color, true)}
              onMouseLeave={e => isUnlocked && hover(e, l.color, false)}
            >
              <div style={{ width: 56, height: 56, borderRadius: 18, background: `linear-gradient(135deg, ${l.color}18, ${l.accent || l.color}10)`, fontSize: 28, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{l.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                  <div style={{ fontSize: 17, fontWeight: 900, color: l.color }}>{l.title}</div>
                  <span style={{ fontSize: 10, padding: "4px 8px", borderRadius: 999, background: completed.has(l.id) ? `${l.color}12` : isUnlocked ? C.bgSoft : `${C.textLight}12`, border: `1px solid ${completed.has(l.id) ? l.color + "30" : isUnlocked ? C.border : C.textLight + "35"}`, color: completed.has(l.id) ? l.color : isUnlocked ? C.textSoft : C.textLight, fontWeight: 800 }}>
                    {completed.has(l.id) ? "Completada" : isUnlocked ? `Lección ${index + 1}` : "Bloqueada"}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: C.textSoft, lineHeight: 1.55, marginBottom: 10 }}>{l.summary}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, padding: "5px 8px", borderRadius: 999, background: `${l.color}0F`, color: l.color, border: `1px solid ${l.color}20`, fontWeight: 700 }}>{l.content.length} páginas</span>
                  {isUnlocked && viewedCount > 0 && (
                    <span style={{ fontSize: 11, padding: "5px 8px", borderRadius: 999, background: C.bgSoft, color: C.textMid, border: `1px solid ${C.border}`, fontWeight: 700 }}>
                      Visto {viewedCount}/{l.content.length}
                    </span>
                  )}
                </div>
                {!isUnlocked ? (
                  <div style={{ fontSize: 12, color: C.textLight }}>Completa el tema anterior para desbloquearlo.</div>
                ) : viewedCount > 0 && !completed.has(l.id) ? (
                  <div style={{ fontSize: 12, color: C.textSoft }}>Continúa desde la página {Math.min(lastPageSeen, l.content.length)}.</div>
                ) : null}
              </div>
              <div style={{ fontSize: 18, color: l.color }}>{completed.has(l.id) ? "✅" : isUnlocked ? "→" : "🔒"}</div>
            </div>
          );
        })}
      </div>
    </div>
  );


  // ══ TOOLS ═══════════════════════════════════
  if (screen === "tools") return (
    <div style={appSt}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      <Nav xp={xp} />
      <div style={{ padding: "18px 18px 80px" }}>
        <button onClick={() => setScreen("home")} style={backBt}>← Ir al inicio</button>

        <div style={{ background: `linear-gradient(160deg, ${C.secondary} 0%, ${C.primary} 100%)`, borderRadius: 24, padding: "22px 18px", color: "#fff", marginBottom: 18, boxShadow: "0 16px 36px rgba(22,15,65,.16)" }}>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase", opacity: 0.88, marginBottom: 6 }}>Herramientas</div>
          <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>🧮 Herramientas financieras</div>
          <div style={{ fontSize: 13, lineHeight: 1.6, opacity: 0.92 }}>
            Esta sección es independiente del aprendizaje. Aquí encontrarás utilidades rápidas para aplicar lo aprendido en tu vida diaria.
          </div>
        </div>

        <div style={{ marginBottom: 12, fontSize: 11, fontWeight: 800, letterSpacing: 1.4, color: C.textLight, textTransform: "uppercase" }}>Calculadoras</div>

        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 22, padding: 18, marginBottom: 14, boxShadow: "0 10px 24px rgba(22,15,65,.05)" }}>
          <div style={{ fontSize: 17, fontWeight: 900, color: C.secondary, marginBottom: 6 }}>Regla 50/30/20</div>
          <div style={{ fontSize: 13, color: C.textSoft, lineHeight: 1.55, marginBottom: 14 }}>Ingresa tu ingreso mensual y verás una distribución base para organizarte.</div>
          <input value={toolsState.budgetIncome} onChange={(e) => handleToolChange("budgetIncome", e.target.value)} inputMode="decimal" placeholder="Ingreso mensual" style={{ width: "100%", padding: 14, borderRadius: 14, border: `1px solid ${C.border}`, fontFamily: "inherit", fontSize: 14, marginBottom: 14 }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {[{label:"Necesidades", value: budgetIncome * 0.5}, {label:"Deseos", value: budgetIncome * 0.3}, {label:"Ahorro", value: budgetIncome * 0.2}].map((item) => (
              <div key={item.label} style={{ background: C.bgSoft, border: `1px solid ${C.border}`, borderRadius: 16, padding: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: C.textLight, textTransform: "uppercase", marginBottom: 6 }}>{item.label}</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: C.primary }}>${budgetIncome ? item.value.toFixed(2) : "0.00"}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 22, padding: 18, marginBottom: 14, boxShadow: "0 10px 24px rgba(22,15,65,.05)" }}>
          <div style={{ fontSize: 17, fontWeight: 900, color: C.secondary, marginBottom: 6 }}>Meta de ahorro</div>
          <div style={{ fontSize: 13, color: C.textSoft, lineHeight: 1.55, marginBottom: 14 }}>Descubre cuánto tiempo te tomaría alcanzar una meta si ahorras de forma constante.</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            <input value={toolsState.savingsGoal} onChange={(e) => handleToolChange("savingsGoal", e.target.value)} inputMode="decimal" placeholder="Meta total" style={{ width: "100%", padding: 14, borderRadius: 14, border: `1px solid ${C.border}`, fontFamily: "inherit", fontSize: 14 }} />
            <input value={toolsState.savingsMonthly} onChange={(e) => handleToolChange("savingsMonthly", e.target.value)} inputMode="decimal" placeholder="Ahorro mensual" style={{ width: "100%", padding: 14, borderRadius: 14, border: `1px solid ${C.border}`, fontFamily: "inherit", fontSize: 14 }} />
          </div>
          <div style={{ background: `${C.primary}10`, border: `1px solid ${C.primary}18`, borderRadius: 16, padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.primary, marginBottom: 4 }}>Resultado</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: C.secondary, marginBottom: 6 }}>
              {savingsMonths > 0 ? `${savingsMonths} mes${savingsMonths === 1 ? "" : "es"}` : "—"}
            </div>
            <div style={{ fontSize: 12, color: C.textSoft, lineHeight: 1.55 }}>
              {savingsMonths > 0 ? "Si mantienes ese ritmo, alcanzarás tu meta en ese tiempo." : "Ingresa una meta y un ahorro mensual para calcularlo."}
            </div>
          </div>
        </div>

        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 22, padding: 18, marginBottom: 14, boxShadow: "0 10px 24px rgba(22,15,65,.05)" }}>
          <div style={{ fontSize: 17, fontWeight: 900, color: C.secondary, marginBottom: 6 }}>Pago de deuda</div>
          <div style={{ fontSize: 13, color: C.textSoft, lineHeight: 1.55, marginBottom: 14 }}>Compara cuánto podrías acortar una deuda si agregas un pago extra mensual.</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <input value={toolsState.debtBalance} onChange={(e) => handleToolChange("debtBalance", e.target.value)} inputMode="decimal" placeholder="Saldo de deuda" style={{ width: "100%", padding: 14, borderRadius: 14, border: `1px solid ${C.border}`, fontFamily: "inherit", fontSize: 14 }} />
            <input value={toolsState.debtMonthlyPayment} onChange={(e) => handleToolChange("debtMonthlyPayment", e.target.value)} inputMode="decimal" placeholder="Pago mensual" style={{ width: "100%", padding: 14, borderRadius: 14, border: `1px solid ${C.border}`, fontFamily: "inherit", fontSize: 14 }} />
          </div>
          <input value={toolsState.debtExtraPayment} onChange={(e) => handleToolChange("debtExtraPayment", e.target.value)} inputMode="decimal" placeholder="Pago extra mensual" style={{ width: "100%", padding: 14, borderRadius: 14, border: `1px solid ${C.border}`, fontFamily: "inherit", fontSize: 14, marginBottom: 14 }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ background: C.bgSoft, border: `1px solid ${C.border}`, borderRadius: 16, padding: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: C.textLight, textTransform: "uppercase", marginBottom: 6 }}>Sin extra</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: C.secondary }}>{debtMonthsBase > 0 ? `${debtMonthsBase} meses` : "—"}</div>
            </div>
            <div style={{ background: `${C.success}10`, border: `1px solid ${C.success}18`, borderRadius: 16, padding: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: C.success, textTransform: "uppercase", marginBottom: 6 }}>Con extra</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: C.success }}>{debtMonthsImproved > 0 ? `${debtMonthsImproved} meses` : "—"}</div>
            </div>
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: C.textSoft, lineHeight: 1.55 }}>
            {debtMonthsSaved > 0 ? `Agregar ese pago extra podría ayudarte a terminar aproximadamente ${debtMonthsSaved} mes${debtMonthsSaved === 1 ? "" : "es"} antes.` : "Completa los datos para comparar ambos escenarios."}
          </div>
        </div>
      </div>
    </div>
  );

  // ══ QUIZ MODE ══════════════════════════════
  if (screen === "quizmode") {
    if (!allLessonsCompleted) {
      setScreen("learn");
      return null;
    }
    return <QuizMode
      xp={xp}
      setXp={setXp}
      rewardEnabled={!completedModules.quiz}
      onBack={() => setScreen("home")}
      onGoGame={startGame}
      onGoLearn={() => setScreen("learn")}
      onGoHome={() => setScreen("home")}
      onComplete={(report) => {
        setCompletedModules((m) => ({ ...m, quiz: true }));
        if (report) {
          setQuizInsights({
            ...report,
            recommendations: report.recommendations || [],
            timestamp: Date.now(),
          });
        }
      }}
    />;
  }

  // ══ LESSON ═════════════════════════════════
  if (screen === "lesson" && activeLesson) {
    const l = activeLesson;
    const lessonIdx = LESSONS.findIndex((item) => item.id === l.id);
    const totalPages = l.content.length;
    const isFirstPage = lessonPageIndex === 0;
    const isLastPage = lessonPageIndex === totalPages - 1;
    const isLastLesson = lessonIdx === LESSONS.length - 1;
    const currentPage = l.content[lessonPageIndex];
    const lessonProgress = Math.round(((lessonPageIndex + 1) / totalPages) * 100);

    const goPrevPage = () => {
      if (!isFirstPage) setLessonPageIndex((p) => p - 1);
    };

    const goNextPage = () => {
      if (!isLastPage) setLessonPageIndex((p) => p + 1);
    };

    const finishCurrentLesson = () => {
      completeLesson(l);
      if (!isLastLesson) {
        const nextLesson = LESSONS[lessonIdx + 1];
        setActiveLesson(nextLesson);
        setLessonPageIndex(0);
        setLastLearning({ lessonId: nextLesson.id, pageIndex: 0 });
      } else {
        setLastLearning({ lessonId: l.id, pageIndex: totalPages - 1 });
      }
    };

    const finalLessonCompleted = completed.has(l.id);
    const actionTip = LESSON_ACTION_TIPS[l.id];

    return (
      <div style={appSt}>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
        <div style={{ height: 5, background: `linear-gradient(90deg, ${l.color}, ${l.accent})` }} />
        <div style={{ padding: "14px 18px 13px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${C.border}`, background: C.bg }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setScreen("learn")} style={{ background: C.bgSoft, border: `1px solid ${C.border}`, borderRadius: 10, width: 36, height: 36, color: C.textMid, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>←</button>
            <div>
              <div style={{ fontSize: 10, color: C.textSoft }}>Tema {lessonIdx + 1} de {LESSONS.length} · Página {lessonPageIndex + 1} de {totalPages}</div>
              <div style={{ fontSize: 17, fontWeight: 900, color: l.color }}>{l.icon} {l.title}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={() => setScreen("home")} style={{ background: C.bgSoft, border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px 10px", color: C.textMid, fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 800 }}>Inicio</button>
            <div style={{ fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: `${C.primary}12`, border: `1px solid ${C.primary}35`, color: C.primary }}>⚡ {xp} XP</div>
          </div>
        </div>
        <div style={{ padding: "18px 18px 60px" }}>
          <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 18, padding: 16, marginBottom: 14, boxShadow: "0 8px 24px rgba(22,15,65,.05)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: l.color, letterSpacing: 1.2, textTransform: "uppercase" }}>Progreso del tema</div>
              <div style={{ fontSize: 12, fontWeight: 900, color: l.color }}>{lessonProgress}%</div>
            </div>
            <div style={{ background: C.border, borderRadius: 999, height: 8, overflow: "hidden" }}>
              <div style={{ width: `${lessonProgress}%`, height: "100%", borderRadius: 999, background: `linear-gradient(90deg, ${l.color}, ${l.accent})`, transition: "width .3s ease" }} />
            </div>
          </div>

          {renderBlock(l, currentPage, lessonPageIndex)}

          {actionTip && (
            <div style={{ background: `${C.highlight}20`, border: `1px solid ${C.highlight}`, borderRadius: 18, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.3, color: C.secondary, textTransform: "uppercase", marginBottom: 6 }}>
                {actionTip.title}
              </div>
              <div style={{ fontSize: 13, color: C.textMid, lineHeight: 1.6 }}>{actionTip.text}</div>
            </div>
          )}

          {!isLastLesson || !isLastPage || !finalLessonCompleted ? (
            <div style={{ display: "grid", gridTemplateColumns: isFirstPage ? "1fr 1fr" : "1fr 1fr 1fr", gap: 10, marginTop: 16 }}>
              {!isFirstPage && (
                <button onClick={goPrevPage} style={{ padding: 14, borderRadius: 14, background: C.bg, border: `1px solid ${C.border}`, color: C.textMid, fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                  ← Página anterior
                </button>
              )}
              {!isLastPage ? (
                <button onClick={goNextPage} style={{ padding: 14, borderRadius: 14, background: `linear-gradient(135deg, ${l.color}, ${l.accent})`, border: "none", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", gridColumn: isFirstPage ? "span 1" : "span 1" }}>
                  Siguiente página →
                </button>
              ) : (
                <button onClick={finishCurrentLesson} style={{ padding: 14, borderRadius: 14, background: `linear-gradient(135deg, ${l.color}, ${l.accent})`, border: "none", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                  {isLastLesson ? "Finalizar aprendizaje ✓" : "Siguiente tema →"}
                </button>
              )}
              <button onClick={() => setScreen("learn")} style={{ padding: 14, borderRadius: 14, background: C.bgSoft, border: `1px solid ${C.border}`, color: C.textMid, fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                Volver a la ruta
              </button>
            </div>
          ) : (
            <div style={{ marginTop: 18 }}>
              <div style={{ background: `linear-gradient(160deg, ${C.secondary} 0%, ${C.primary} 100%)`, borderRadius: 22, padding: "22px 18px", color: "#fff", marginBottom: 12, boxShadow: "0 14px 30px rgba(22,15,65,.16)" }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>🎉</div>
                <div style={{ fontSize: 21, fontWeight: 900, marginBottom: 8 }}>¡Terminaste la sección de aprendizaje!</div>
                <div style={{ fontSize: 13, lineHeight: 1.6, opacity: .92 }}>
                  Excelente. Ya puedes continuar con el quiz o pasar al juego para reforzar lo aprendido.
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
                <button onClick={() => setScreen("quizmode")} style={{ padding: 15, borderRadius: 14, background: `linear-gradient(135deg, ${C.primary}, ${C.quat})`, border: "none", color: "#fff", fontSize: 14, fontWeight: 900, cursor: "pointer", fontFamily: "inherit" }}>
                  Ir al quiz 🧠
                </button>
                <button onClick={startGame} style={{ padding: 15, borderRadius: 14, background: C.bg, border: `1.5px solid ${C.quat}`, color: C.quat, fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                  Ir al juego 🎮
                </button>
                <button onClick={() => setScreen("learn")} style={{ padding: 14, borderRadius: 14, background: C.bgSoft, border: `1px solid ${C.border}`, color: C.textMid, fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                  Volver a la ruta
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ══ GAME ═══════════════════════════════════
  if (screen === "game") {
    const sc = activeScenarios[gameIndex];
    const total = activeScenarios.length || 4;

    // Waypoints: positions on the path (percentage left, percentage top)
    const waypoints = [
      { left: "12%", top: "82%" },
      { left: "38%", top: "60%" },
      { left: "62%", top: "38%" },
      { left: "88%", top: "18%" },
    ];
    const treasurePos = { left: "90%", top: "10%" };
    const startPos = { left: "8%", top: "86%" };
    const charAnchors = [startPos, ...waypoints, treasurePos];

    // Character advances from the start through each parada and finally reaches the treasure.
    const charStep = gameScreen === "result" ? total + 1 : gameIndex;
    const charPos = charAnchors[Math.min(charStep, charAnchors.length - 1)];
    const pathProgress = Math.max(0, Math.min(((gameScreen === "result" ? total : gameIndex) / total) * 100, 100));
    const mapStops = [
      { icon: "📋", label: "Plan" },
      { icon: "🧠", label: "Control" },
      { icon: "🏦", label: "Ahorro" },
      { icon: "🛡️", label: "Protección" },
    ];

    // Result tier — máximo posible: 4 escenarios × 10 pts = 40 pts
    const tier = gameScore >= 30 ? "gold" : gameScore >= 10 ? "silver" : "bronze";
    const tierData = {
      gold:   { label: "¡Experto Financiero!", color: C.primary, bg: `linear-gradient(135deg, ${C.highlight}, ${C.primary})`, icon: "🏆", xpLabel: "+40 XP" },
      silver: { label: "Buen Progreso", color: C.secondary, bg: `linear-gradient(135deg, ${C.bg}, ${C.border})`, icon: "🥈", xpLabel: "" },
      bronze: { label: "Sigue Practicando", color: C.warnText, bg: `linear-gradient(135deg, ${C.warnBg}, ${C.bgSoft})`, icon: "📚", xpLabel: "" },
    }[tier];

    const keyframes = `
      @keyframes float    { 0%,100%{transform:translateY(0)}  50%{transform:translateY(-6px)} }
      @keyframes bounce   { 0%,100%{transform:translateY(0)}  40%{transform:translateY(-10px)} 70%{transform:translateY(-4px)} }
      @keyframes pulse    { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.7;transform:scale(1.15)} }
      @keyframes sparkle  { 0%,100%{opacity:0;transform:scale(0) rotate(0deg)} 50%{opacity:1;transform:scale(1) rotate(180deg)} }
      @keyframes slidein  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      @keyframes glow     { 0%,100%{box-shadow:0 0 12px rgba(210,0,110,.35)} 50%{box-shadow:0 0 28px rgba(210,0,110,.65)} }
      @keyframes treasureOpen { 0%{transform:scale(1) rotate(0deg)} 30%{transform:scale(1.3) rotate(-8deg)} 60%{transform:scale(1.2) rotate(6deg)} 100%{transform:scale(1) rotate(0deg)} }
      @keyframes coinSpin { from{transform:rotateY(0deg)} to{transform:rotateY(360deg)} }
      @keyframes pathDash { from{stroke-dashoffset:600} to{stroke-dashoffset:0} }
      @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      @keyframes riseFade { 0%{opacity:0;transform:translateY(8px) scale(.95)} 20%{opacity:1} 100%{opacity:0;transform:translateY(-26px) scale(1.02)} }
      @keyframes mapPulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.08);opacity:.85} }
      @keyframes coinBurst { 0%{opacity:0;transform:translateY(10px) scale(.6)} 25%{opacity:1} 100%{opacity:0;transform:translateY(-28px) scale(1.2)} }
    `;

    return (
      <div style={appSt}>
        <style>{keyframes}</style>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
        <div style={{ height: 5, background: `linear-gradient(90deg, ${C.quat}, ${C.primary})` }} />
        <Nav xp={xp} />

        {/* ── INTRO ───────────────────────────── */}
        {gameScreen === "intro" && (
          <div style={{ padding: "0 0 32px" }}>
            <div style={{ background: `linear-gradient(160deg, ${C.secondary} 0%, ${C.secondary} 55%, ${C.primary} 100%)`, padding: "28px 20px 32px", position: "relative", overflow: "hidden" }}>
              {["18%","45%","72%","85%","30%","60%"].map((l,i) => (
                <div key={i} style={{ position:"absolute", left:l, top:`${10+i*10}%`, fontSize:10, opacity:.5, animation:`pulse ${1.5+i*.4}s ease-in-out infinite`, animationDelay:`${i*.3}s`, color:"#fff" }}>✦</div>
              ))}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:10, marginBottom:18 }}>
                <button onClick={() => setScreen("home")} style={{ background:"rgba(255,255,255,.12)", border:"1px solid rgba(255,255,255,.2)", borderRadius:999, padding:"8px 12px", color:"#fff", fontSize:12, cursor:"pointer", fontFamily:"inherit", fontWeight:800 }}>← Volver</button>
                <button onClick={() => setSoundOn(v => !v)} style={{ background:"rgba(255,255,255,.12)", border:"1px solid rgba(255,255,255,.2)", borderRadius:999, padding:"8px 12px", color:"#fff", fontSize:12, cursor:"pointer", fontFamily:"inherit", fontWeight:800 }}>
                  {soundOn ? "🔊 Sonido activado" : "🔈 Sonido desactivado"}
                </button>
              </div>

              <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"6px 12px", borderRadius:999, background:"rgba(255,255,255,.12)", border:"1px solid rgba(255,255,255,.18)", color:"#fff", fontSize:12, fontWeight:800, marginBottom:14 }}>
                <span>🎮</span><span>Modo reto estilo aventura</span>
              </div>
              <div style={{ fontSize:52, marginBottom:10, animation:"float 3s ease-in-out infinite" }}>🧭</div>
              <div style={{ fontSize:24, fontWeight:900, color:"#fff", marginBottom:8 }}>Aventura Financiera</div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,.78)", lineHeight:1.65, marginBottom:16 }}>
                Avanza por un mapa de 4 paradas, toma decisiones financieras en cada estación y llega al tesoro final si eliges bien tu ruta.
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"repeat(3, minmax(0,1fr))", gap:10 }}>
                {[
                  { label:"Paradas", value:"4" },
                  { label:"XP máximo", value:"120" },
                  { label:"Duración", value:"2-3 min" },
                ].map((stat, i) => (
                  <div key={i} style={{ background:"rgba(255,255,255,.1)", border:"1px solid rgba(255,255,255,.12)", borderRadius:16, padding:"12px 10px", backdropFilter:"blur(8px)" }}>
                    <div style={{ fontSize:18, fontWeight:900, color:"#fff", marginBottom:2 }}>{stat.value}</div>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,.72)", fontWeight:700 }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ margin:"20px 18px 0", background: C.bg, border:`1px solid ${C.border}`, borderRadius:24, padding:"22px 18px", boxShadow:"0 10px 28px rgba(22,15,65,0.08)" }}>
              <div style={{ fontSize:12, fontWeight:800, color:C.textLight, letterSpacing:1.5, textTransform:"uppercase", marginBottom:16 }}>Así se juega</div>

              <div style={{ position:"relative", height:102, marginBottom:18, borderRadius:20, background:`linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.02))`, border:"1px solid rgba(255,255,255,.12)", overflow:"hidden" }}>
                <div style={{ position:"absolute", inset:0, background:"radial-gradient(circle at 15% 80%, rgba(159,220,238,.18), transparent 28%), radial-gradient(circle at 85% 20%, rgba(210,0,110,.18), transparent 30%)" }} />
                <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%" }} viewBox="0 0 300 90" preserveAspectRatio="none">
                  <path d="M18,76 C58,78 70,70 92,54 C114,38 130,24 152,30 C176,36 186,56 214,58 C240,60 255,40 282,18" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="10" strokeLinecap="round"/>
                  <path d="M18,76 C58,78 70,70 92,54 C114,38 130,24 152,30 C176,36 186,56 214,58 C240,60 255,40 282,18" fill="none" stroke="rgba(255,255,255,.48)" strokeWidth="3" strokeDasharray="7 6" strokeLinecap="round"/>
                </svg>
                {[0,1,2,3].map(i => {
                  const xs = ["8%","31%","53%","74%"];
                  const ys = ["76%","51%","33%","47%"];
                  return (
                    <div key={i} style={{ position:"absolute", left:xs[i], top:ys[i], transform:"translate(-50%,-50%)" }}>
                      <div style={{ width:34, height:34, borderRadius:"50%", background:`linear-gradient(135deg,${C.primary},${C.quat})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:900, color:"#fff", boxShadow:"0 6px 16px rgba(163,26,97,.35)", border:"2px solid #fff" }}>{i+1}</div>
                    </div>
                  );
                })}
                <div style={{ position:"absolute", right:"4%", top:"6%", fontSize:28, animation:"float 2.5s ease-in-out infinite" }}>🪙</div>
                <div style={{ position:"absolute", left:"4%", bottom:"6%", fontSize:24, animation:"bounce 2s ease-in-out infinite" }}>🧑‍💼</div>
              </div>

              <div style={{ display:"grid", gap:8, marginBottom:16 }}>
                {[
                  { icon:"⚡", title:"Feedback inmediato", desc:"Cada decisión te explica por qué suma o resta." },
                  { icon:"🎯", title:"Meta clara", desc:"Con 30 puntos o más desbloqueas +40 XP." },
                  { icon:"🔊", title:"Efectos de sonido", desc:"Refuerzan aciertos, errores y victoria final." },
                ].map((item, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 12px", borderRadius:14, background:C.bgSoft, border:`1px solid ${C.border}` }}>
                    <div style={{ width:34, height:34, borderRadius:12, background:`linear-gradient(135deg, ${C.tertiary}, #fff)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>{item.icon}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:800, color:C.secondary }}>{item.title}</div>
                      <div style={{ fontSize:12, color:C.textSoft }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {[
                  { icon:"🏦", label:"Presupuesto" },
                  { icon:"🧠", label:"Impulsos" },
                  { icon:"🛡️", label:"Fraudes" },
                  { icon:"📈", label:"Inversión" },
                ].map((t,i) => (
                  <div key={i} style={{ padding:"8px 12px", borderRadius:999, background:`${C.primary}10`, color:C.primary, fontSize:12, fontWeight:800, border:`1px solid ${C.primary}20` }}>
                    {t.icon} {t.label}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding:"18px 18px 0" }}>
              <button onClick={startGame} style={{ width:"100%", padding:18, borderRadius:18, background:`linear-gradient(135deg, ${C.quat}, ${C.primary}, ${C.secondary})`, backgroundSize:"200% 100%", animation:"glow 2s ease-in-out infinite, shimmer 4s linear infinite", border:"none", color:"#fff", fontSize:16, fontWeight:900, cursor:"pointer", fontFamily:"inherit", letterSpacing:".3px", boxShadow:`0 12px 28px ${C.quat}44` }}>
                ¡Comenzar aventura! 🗺️
              </button>
            </div>
          </div>
        )}

                {/* ── PLAY ────────────────────────────── */}
        {gameScreen === "play" && sc && (
          <div style={{ paddingBottom:32 }}>

            <div style={{ background:`linear-gradient(160deg, ${C.secondary} 0%, ${C.primary} 100%)`, padding:"18px 18px 0", position:"relative", overflow:"hidden" }}>
              {/* Starfield */}
              {["15%","40%","65%","82%","25%","55%"].map((l,i) => (
                <div key={i} style={{ position:"absolute", left:l, top:`${5+i*14}%`, fontSize:8, opacity:.4, animation:`pulse ${1.2+i*.3}s ease-in-out infinite`, color:"#fff" }}>✦</div>
              ))}

              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:10, marginBottom:14, position:"relative", zIndex:2 }}>
                <button onClick={() => { resetGame(); setScreen("home"); }} style={{ background:"rgba(255,255,255,.12)", border:"1px solid rgba(255,255,255,.2)", borderRadius:999, padding:"8px 12px", color:"#fff", fontSize:12, cursor:"pointer", fontFamily:"inherit", fontWeight:800 }}>← Ir al inicio</button>
                <button onClick={() => setSoundOn(v => !v)} style={{ background:"rgba(255,255,255,.12)", border:"1px solid rgba(255,255,255,.2)", borderRadius:999, padding:"8px 12px", color:"#fff", fontSize:12, cursor:"pointer", fontFamily:"inherit", fontWeight:800 }}>
                  {soundOn ? "🔊" : "🔈"} Sonido
                </button>
              </div>

              {/* Score pill */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                <div style={{ fontSize:12, color:"rgba(255,255,255,.7)", fontWeight:700 }}>Parada {gameIndex+1} de {total}</div>
                <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap", justifyContent:"flex-end" }}>
                  <div style={{ padding:"4px 10px", borderRadius:20, background:"rgba(255,255,255,.1)", border:"1px solid rgba(255,255,255,.16)", fontSize:12, fontWeight:800, color:"#fff" }}>
                    🎯 Meta: 30
                  </div>
                  <div style={{ padding:"4px 12px", borderRadius:20, background: gameTimeLeft <= 10 ? "rgba(185,28,28,.5)" : "rgba(255,255,255,.1)", border:`1px solid ${gameTimeLeft <= 10 ? C.error : "rgba(255,255,255,.18)"}`, fontSize:12, fontWeight:900, color:"#fff" }}>
                    ⏱ {gameTimeLeft}s
                  </div>
                  <div style={{ padding:"4px 12px", borderRadius:20, background: gameScore >= 0 ? "rgba(11,107,64,.6)" : "rgba(185,28,28,.5)", border:`1px solid ${gameScore>=0?C.success:C.error}`, fontSize:12, fontWeight:800, color:"#fff" }}>
                    {gameScore >= 0 ? "+" : ""}{gameScore} pts
                  </div>
                </div>
              </div>

              {/* Path visual tipo mapa */}
              <div style={{ position:"relative", height:132, borderRadius:22, background:"linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.03))", border:"1px solid rgba(255,255,255,.12)", overflow:"hidden", marginBottom:14 }}>
                <div style={{ position:"absolute", inset:0, background:"radial-gradient(circle at 18% 82%, rgba(159,220,238,.16), transparent 24%), radial-gradient(circle at 82% 14%, rgba(210,0,110,.18), transparent 28%)" }} />
                <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%" }} viewBox="0 0 340 132" preserveAspectRatio="none">
                  <path d="M26,108 C78,108 88,86 112,72 C138,56 150,26 184,34 C212,42 220,76 248,78 C278,80 292,50 310,24" fill="none" stroke="rgba(255,255,255,.14)" strokeWidth="12" strokeLinecap="round"/>
                  <path d="M26,108 C78,108 88,86 112,72 C138,56 150,26 184,34 C212,42 220,76 248,78 C278,80 292,50 310,24" fill="none" stroke="rgba(255,255,255,.46)" strokeWidth="3" strokeDasharray="9 7" strokeLinecap="round"/>
                </svg>
                <div style={{ position:"absolute", left:"7%", bottom:"12%", fontSize:11, color:"rgba(255,255,255,.7)", fontWeight:800 }}>Inicio</div>
                <div style={{ position:"absolute", right:"4%", top:"8%", fontSize:11, color:"rgba(255,255,255,.7)", fontWeight:800 }}>Tesoro</div>

                {waypoints.map((wp, i) => {
                  const done = i < gameIndex;
                  const current = i === gameIndex;
                  return (
                    <div key={i} style={{ position:"absolute", left:wp.left, top:wp.top, transform:"translate(-50%,-50%)" }}>
                      <div style={{
                        width: current ? 38 : 30,
                        height: current ? 38 : 30,
                        borderRadius:"50%",
                        background: done ? `linear-gradient(135deg,${C.success},${C.success})` : current ? `linear-gradient(135deg,${C.quat},${C.primary})` : "rgba(255,255,255,.16)",
                        border: current ? "3px solid #fff" : done ? `2px solid ${C.success}` : "2px solid rgba(255,255,255,.28)",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize: current ? 15 : 12,
                        fontWeight:900, color:"#fff",
                        boxShadow: current ? "0 0 0 4px rgba(210,0,110,.35)" : "none",
                        animation: current ? "glow 1.5s ease-in-out infinite" : "none",
                        transition:"all .4s ease",
                      }}>
                        {done ? "✓" : i+1}
                      </div>
                      <div style={{ position:"absolute", top:"115%", left:"50%", transform:"translateX(-50%)", fontSize:10, fontWeight:800, color:"rgba(255,255,255,.8)", whiteSpace:"nowrap" }}>{mapStops[i].icon} {mapStops[i].label}</div>
                    </div>
                  );
                })}

                <div style={{ position:"absolute", left:treasurePos.left, top:treasurePos.top, transform:"translate(-50%,-50%)", width:54, height:54, borderRadius:"50%", background:"rgba(255,255,255,.1)", border:"1px solid rgba(255,255,255,.22)", display:"flex", alignItems:"center", justifyContent:"center", animation:"mapPulse 1.8s ease-in-out infinite" }}>
                  <div style={{ fontSize:26, filter: gameScreen==="result" ? "none" : "saturate(.4) brightness(.9)" }}>💰</div>
                </div>

                <div style={{
                  position:"absolute",
                  left: `${pathProgress}%`,
                  bottom: 10,
                  transform:"translateX(-50%)",
                  fontSize:11,
                  color:"rgba(255,255,255,.78)",
                  fontWeight:800,
                  transition:"left .7s cubic-bezier(.34,1.56,.64,1)",
                }}>Ruta {pathProgress}%</div>

                <div style={{
                  position:"absolute",
                  left: charPos.left,
                  top: charPos.top,
                  transform:"translate(-50%,-120%)",
                  fontSize:24,
                  animation:"bounce 1.8s ease-in-out infinite",
                  transition:"left .7s cubic-bezier(.34,1.56,.64,1), top .7s cubic-bezier(.34,1.56,.64,1)",
                  filter:"drop-shadow(0 2px 4px rgba(0,0,0,.4))",
                }}>🧑‍💼</div>
              </div>
            </div>

            {/* Scenario card */}
            <div style={{ padding:"16px 18px 0", animation:"slidein .35s ease" }} key={gameIndex}>
              {/* Situation bubble */}
              <div style={{ background:C.bg, border:`1.5px solid ${C.border}`, borderRadius:18, padding:"16px 18px", marginBottom:14, boxShadow:"0 2px 10px rgba(22,15,65,.07)", position:"relative" }}>
                <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg,${C.primary},${C.quat})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>🤔</div>
                  <div>
                    <div style={{ fontSize:10, fontWeight:800, color:C.primary, letterSpacing:1.2, textTransform:"uppercase", marginBottom:4 }}>Situación</div>
                    <div style={{ fontSize:13.5, color:C.text, lineHeight:1.7, fontWeight:500 }}>{sc.situation}</div>
                  </div>
                </div>
              </div>

              {/* Options */}
              <div style={{ fontSize:11, fontWeight:800, color:C.textLight, letterSpacing:1.4, textTransform:"uppercase", marginBottom:10 }}>¿Qué harías?</div>
              {sc.options.map((opt, oi) => {
                let bg = C.bgSoft, border = `1.5px solid ${C.border}`, color = C.textMid, icon = null, transform = "none";
                if (gameChoice !== null) {
                  if (oi === gameChoice) {
                    if (opt.points > 0)        { bg = C.successBg; border = `2px solid ${C.success}`; color = C.success; icon = "✅"; }
                    else if (opt.points === 0)  { bg = C.warnBg;    border = `2px solid ${C.warnText}`;      color = C.warnText; icon = "😐"; }
                    else                        { bg = C.errorBg;   border = `2px solid ${C.error}`;   color = C.error;   icon = "❌"; }
                    transform = "scale(1.01)";
                  } else {
                    bg = C.bg; color = C.textLight; border = `1px solid ${C.border}`;
                  }
                }
                return (
                  <button key={oi} onClick={() => handleGameChoice(oi)} style={{
                    display:"flex", alignItems:"center", gap:10,
                    width:"100%", textAlign:"left",
                    padding:"13px 16px", borderRadius:14,
                    background: bg, border, color,
                    fontSize:13, marginBottom:9,
                    cursor: gameChoice === null ? "pointer" : "default",
                    fontFamily:"inherit", lineHeight:1.45,
                    transition:"all .25s ease",
                    transform,
                    boxShadow: gameChoice === null ? "0 8px 18px rgba(22,15,65,.06)" : "none",
                  }}>
                    <div style={{ width:24, height:24, borderRadius:6, background: gameChoice === null ? `${C.primary}18` : "transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:12, fontWeight:800, color: gameChoice === null ? C.primary : color }}>
                      {gameChoice !== null && oi === gameChoice ? icon : String.fromCharCode(65+oi)}
                    </div>
                    <span style={{ flex:1 }}>{opt.text}</span>
                  </button>
                );
              })}

              {/* Feedback */}
              {gameChoice !== null && (() => {
                if (gameChoice === -1) {
                  return (
                    <div style={{ borderRadius:16, overflow:"hidden", marginBottom:14, animation:"slidein .3s ease", boxShadow:"0 2px 10px rgba(22,15,65,.08)" }}>
                      <div style={{ background:`linear-gradient(135deg,${C.warnText}22,${C.warnText}11)`, padding:"10px 14px", display:"flex", alignItems:"center", gap:8, borderBottom:`1px solid ${C.warnText}30` }}>
                        <span style={{ fontSize:16 }}>⏱</span>
                        <span style={{ fontSize:12, fontWeight:800, color:C.warnText }}>0 pts · Tiempo agotado</span>
                      </div>
                      <div style={{ background:C.warnBg, padding:"12px 14px", fontSize:13, color:C.textMid, lineHeight:1.65, borderLeft:`3px solid ${C.warnText}` }}>
                        Esta parada se cerró sin respuesta. Continúa con la siguiente y procura decidir antes de que termine el temporizador.
                      </div>
                    </div>
                  );
                }
                const chosen = sc.options[gameChoice];
                const isGood = chosen.points > 0;
                const isNeutral = chosen.points === 0;
                const fbBg = isGood ? C.successBg : isNeutral ? C.warnBg : C.errorBg;
                const fbBorder = isGood ? C.success : isNeutral ? C.warnText : C.error;
                const fbColor = isGood ? C.success : isNeutral ? C.warnText : C.error;
                const fbIcon = isGood ? "💡" : isNeutral ? "⚠️" : "🔍";
                const fbTitle = isGood ? `+${chosen.points} pts ¡Decisión acertada!` : isNeutral ? `${chosen.points} pts Decisión neutral` : `${chosen.points} pts Hay una mejor opción`;
                return (
                  <div style={{ borderRadius:16, overflow:"hidden", marginBottom:14, animation:"slidein .3s ease", boxShadow:"0 2px 10px rgba(22,15,65,.08)" }}>
                    <div style={{ background:`linear-gradient(135deg,${fbBorder}22,${fbBorder}11)`, padding:"10px 14px", display:"flex", alignItems:"center", gap:8, borderBottom:`1px solid ${fbBorder}30` }}>
                      <span style={{ fontSize:16 }}>{fbIcon}</span>
                      <span style={{ fontSize:12, fontWeight:800, color:fbColor }}>{fbTitle}</span>
                    </div>
                    <div style={{ background:fbBg, padding:"12px 14px", fontSize:13, color:C.textMid, lineHeight:1.65, borderLeft:`3px solid ${fbBorder}` }}>
                      {chosen.feedback}
                    </div>
                  </div>
                );
              })()}

              {gameChoice !== null && (
                <button onClick={nextScenario} style={{
                  width:"100%", padding:16, borderRadius:14,
                  background:`linear-gradient(135deg, ${C.quat}, ${C.primary})`,
                  border:"none", color:"#fff", fontSize:14, fontWeight:900,
                  cursor:"pointer", fontFamily:"inherit",
                  boxShadow:`0 4px 16px ${C.quat}55`,
                  animation:"slidein .35s ease",
                }}>
                  {gameIndex + 1 >= total ? "🏁 Ver mi tesoro" : "Continuar →"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── RESULT ──────────────────────────── */}
        {gameScreen === "result" && (() => {
          const finalScore = gameScore;
          const resTier = finalScore >= 30 ? "gold" : finalScore >= 10 ? "silver" : "bronze";
          const resTierIcon = resTier === "gold" ? "🏆" : resTier === "silver" ? "🥈" : "📚";
          const resTierLabel = resTier === "gold" ? "¡Experto Financiero!" : resTier === "silver" ? "Buen Progreso" : "Sigue Practicando";
          return (
            <div style={{ paddingBottom:32 }}>
              <div style={{ background:`linear-gradient(160deg, ${C.secondary} 0%, ${C.secondary} 60%, ${C.primary} 100%)`, padding:"28px 20px 36px", textAlign:"center", position:"relative", overflow:"hidden" }}>
                {["12%","30%","50%","70%","88%","20%","60%"].map((pos,idx) => (
                  <div key={idx} style={{ position:"absolute", left:pos, top:`${5+idx*13}%`, fontSize: resTier==="gold"?14:10, animation:`sparkle ${1+idx*.25}s ease-in-out infinite`, animationDelay:`${idx*.2}s`, color: resTier==="gold"?C.warnBg:"rgba(255,255,255,.4)" }}>
                    {resTier==="gold" ? "✦" : "·"}
                  </div>
                ))}
                <div style={{ position:"relative", height:112, marginBottom:16, borderRadius:22, background:"linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.02))", border:"1px solid rgba(255,255,255,.14)", overflow:"hidden" }}>
                  <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%" }} viewBox="0 0 340 112">
                    <path d="M26,92 C78,92 88,74 112,60 C138,44 150,18 184,26 C212,34 220,64 248,66 C278,68 292,42 310,18" fill="none" stroke="rgba(255,255,255,.22)" strokeWidth="4" strokeLinecap="round"/>
                  </svg>
                  {waypoints.map((wp, wi) => (
                    <div key={wi} style={{ position:"absolute", left:wp.left, top:wp.top, transform:"translate(-50%,-50%)" }}>
                      <div style={{ width:28, height:28, borderRadius:"50%", background:`linear-gradient(135deg,${C.success},${C.success})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:"#fff", fontWeight:900, border:"2px solid rgba(255,255,255,.5)" }}>✓</div>
                    </div>
                  ))}
                  <div style={{ position:"absolute", left:treasurePos.left, top:treasurePos.top, transform:"translate(-50%,-50%)", width:64, height:64, borderRadius:"50%", background:"rgba(255,255,255,.14)", border:"1px solid rgba(255,255,255,.22)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <div style={{ fontSize:32, animation:"treasureOpen 1s ease .3s both" }}>💰</div>
                  </div>
                  <div style={{ position:"absolute", left:treasurePos.left, top:treasurePos.top, transform:"translate(-140%,-70%)", fontSize:28, animation:"bounce 1.5s ease-in-out infinite" }}>🧑‍💼</div>
                  {["-22px","0px","22px"].map((x, idx) => (
                    <div key={idx} style={{ position:"absolute", left:`calc(${treasurePos.left} + ${x})`, top:`calc(${treasurePos.top} - 8px)`, fontSize:18, animation:`coinBurst ${1.1 + idx*0.15}s ease-out ${0.3 + idx*0.1}s infinite`, opacity:0 }}>🪙</div>
                  ))}
                </div>
                <div style={{ fontSize:52, marginBottom:8, display:"inline-block", animation:"treasureOpen 1s ease .5s both" }}>{resTierIcon}</div>
                <div style={{ fontSize:22, fontWeight:900, color:"#fff", marginBottom:6 }}>{resTierLabel}</div>
                <div style={{ fontSize:40, fontWeight:900, color: resTier==="gold"?C.warnBg:"#fff", marginBottom:4 }}>
                  {finalScore >= 0 ? "+" : ""}{finalScore} pts
                </div>
                {resTier === "gold" && (
                  <div style={{ display:"inline-block", padding:"4px 14px", borderRadius:20, background:"rgba(255,255,255,.2)", fontSize:13, fontWeight:800, color:"#fff" }}>
                    {lastGameAward > 0 ? `+${lastGameAward} XP desbloqueados · tesoro abierto ✨` : "Tesoro abierto · XP ya acreditado antes ✨"}
                  </div>
                )}
              </div>
              <div style={{ padding:"20px 18px 0" }}>
                <div style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:18, padding:"18px 16px", marginBottom:16, boxShadow:"0 2px 8px rgba(22,15,65,.06)" }}>
                  <div style={{ fontSize:11, fontWeight:800, color:C.textLight, letterSpacing:1.5, textTransform:"uppercase", marginBottom:14 }}>Tu recorrido</div>
                  {gameHistory.map((h, hi) => {
                    const isGood = h.points > 0, isNeutral = h.points === 0;
                    const rowBg = isGood ? C.successBg : isNeutral ? C.warnBg : C.errorBg;
                    const rowBorder = isGood ? `${C.success}40` : isNeutral ? `${C.warnText}40` : `${C.error}40`;
                    const rowColor = isGood ? C.success : isNeutral ? C.warnText : C.error;
                    const rowIcon = isGood ? "✅" : isNeutral ? "😐" : "❌";
                    const scText = (activeScenarios[hi] && activeScenarios[hi].situation) ? activeScenarios[hi].situation.slice(0,48) + "…" : "Parada " + (hi+1);
                    return (
                      <div key={hi} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 12px", borderRadius:12, background:rowBg, border:`1px solid ${rowBorder}`, marginBottom:8 }}>
                        <div style={{ fontSize:16 }}>{rowIcon}</div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:12, color:C.textSoft }}>Parada {hi+1}</div>
                          <div style={{ fontSize:12, color:C.textMid, fontWeight:600, marginTop:1 }}>{scText}</div>
                        </div>
                        <div style={{ fontSize:14, fontWeight:900, color:rowColor }}>{h.points>0?"+":""}{h.points}</div>
                      </div>
                    );
                  })}
                </div>
                <button onClick={() => setScreen("learn")} style={{ width:"100%", padding:16, borderRadius:14, background:`linear-gradient(135deg, ${C.quat}, ${C.primary})`, border:"none", color:"#fff", fontSize:14, fontWeight:900, cursor:"pointer", fontFamily:"inherit", marginBottom:10, boxShadow:`0 4px 16px ${C.quat}44` }}>
                  Continuar aprendiendo 📚
                </button>
                <button onClick={() => { if (allLessonsCompleted) setScreen("quizmode"); else setScreen("learn"); }} style={{ width:"100%", padding:15, borderRadius:14, background:C.bg, border:`2px solid ${C.quat}`, color:C.quat, fontSize:14, fontWeight:800, cursor:"pointer", fontFamily:"inherit", marginBottom:10 }}>
                  Ir al quiz 🧠
                </button>
                <button onClick={() => { resetGame(); setScreen("home"); }} style={{ width:"100%", padding:15, borderRadius:14, background:C.bg, border:`1px solid ${C.border}`, color:C.textMid, fontSize:14, fontWeight:800, cursor:"pointer", fontFamily:"inherit", marginBottom:10 }}>
                  Ir al inicio 🏠
                </button>
                <button onClick={resetGame} style={{ width:"100%", padding:15, borderRadius:14, background:C.bgSoft, border:`1px solid ${C.border}`, color:C.textMid, fontSize:14, fontWeight:800, cursor:"pointer", fontFamily:"inherit" }}>
                  Nueva aventura 🔄
                </button>
              </div>
            </div>
          );
        })()}
      </div>
    );
  }
  return (
    <div style={appSt}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      <div style={{ padding: "32px 18px" }}>
        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 18, padding: 20, textAlign: "center", boxShadow: "0 2px 8px rgba(22,15,65,.06)" }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🧭</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: C.secondary, marginBottom: 8 }}>Volvamos al inicio</div>
          <div style={{ fontSize: 13, color: C.textSoft, lineHeight: 1.6, marginBottom: 16 }}>
            La pantalla actual no se pudo cargar correctamente. Reiniciaremos la navegación para que puedas continuar sin que la app quede en blanco.
          </div>
          <button onClick={() => { setScreen("home"); resetGame(); }} style={{ width: "100%", padding: 14, borderRadius: 14, background: `linear-gradient(135deg, ${C.primary}, ${C.quat})`, border: "none", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
            Ir al inicio
          </button>
        </div>
      </div>
    </div>
  );
}
