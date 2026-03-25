import { useState, useMemo } from "react";



const C = {
  primary: "#A31A61",
  secondary: "#160F41",
  tertiary: "#9FDCEE",
  quat: "#D2006E",
  bg: "#FFFFFF",
  bgSoft: "#F8F5FB",
  border: "#E6DDF0",
  text: "#160F41",
  textMid: "#3D2F6B",
  textSoft: "#7A6E9A",
  textLight: "#B0A8CC",
  success: "#0B6B40",
  successBg: "#E6F5EE",
  error: "#B91C1C",
  errorBg: "#FEE2E2",
  warnBg: "#FEF3C7",
  warnText: "#78350F",
};



// ─── LESSONS (sin quiz) ───────────────────────────────────────

Const LESSONS = [

  {

    Id: 1, icon: “📋”,

    Title: “Presupuesto Personal”,

    Color: C.primary, accent: C.quat,

    Summary: “Planifica, registra y controla tus ingresos y gastos mes a mes.”,

    Content: [

      { type: “concept”, title: “¿Por qué planificar?”, text: “La planificación permite establecer objetivos, determinar estrategias y acciones para alcanzarlos. Es una actividad anticipatoria que establece un camino a seguir. Administrar es implementar esos planes con orden y control.” },

      { type: “steps”, title: “6 Pasos para tu presupuesto”, items: [

        { num: “1”, label: “Calcula tu ingreso neto mensual”, desc: “Incluye sueldo neto, pensiones, rentas. Si cobras semanal o quincenal, convierte a mensual.” },

        { num: “2”, label: “Lista tus gastos fijos”, desc: “Alquiler, préstamos, internet, seguros, colegiaturas, suscripciones.” },

        { num: “3”, label: “Estima gastos variables”, desc: “Alimentación, gasolina, ocio, ropa, farmacia. Registra 30 días para saber el promedio real.” },

        { num: “4”, label: “Aplica la regla 50/30/20”, desc: “50% necesidades · 30% deseos · 20% ahorro y deudas.” },

        { num: “5”, label: “Págate primero”, desc: “Transfiere automáticamente a ahorro el día que cobras. Trátalo como una factura más.” },

        { num: “6”, label: “Prioriza fondo de emergencia”, desc: “Meta inicial: $500–$1,000. Luego 3 meses de gastos básicos.” },

      ]},

      { type: “rule5020”, title: “Regla 50 / 30 / 20”, items: [

        { pct: “50%”, label: “Necesidades”, desc: “Vivienda, servicios, alimentación, transporte, seguros”, color: C.primary },

        { pct: “30%”, label: “Deseos”, desc: “Ocio, salidas, suscripciones, compras no esenciales”, color: “#7ª4F9A” },

        { pct: “20%”, label: “Ahorro & Deudas”, desc: “Fondo de emergencia, inversiones, pago de créditos”, color: “#1ª7A8A” },

      ]},

      { type: “tip”, text: “💡 Ahorro mínimo inicial: 5% (meta 10–20%). Pago de deudas: máximo 30–40% del ingreso neto. Utilización de crédito: mantén <30% del límite disponible.” },

    ],

  },

  {

    Id: 2, icon: “🧠”,

    Title: “Control de Impulsos”,

    Color: C.secondary, accent: “#3D2E8A”,

    Summary: “Reconoce las trampas del gasto innecesario y actúa con inteligencia financiera.”,

    Content: [

      { type: “concept”, title: “¿Por qué gastamos de más?”, text: “Cuatro grandes facilitadores nos empujan a gastar lo innecesario: el status social (‘quiero yo también’), los pagos diferidos (‘no veo lo que gasto’), el dinero plástico (facilidades de pago y plazos) y las promociones (‘barato y pagable’).” },

      { type: “warning”, title: “El engaño de las cuotas”, text: “Una refrigeradora de $238.05 al contado puede convertirse en 18 cuotas de $28.91 que suman $520.38. Parece pagable, pero pagas más del doble.”, highlight: “$238 al contado → $520 en cuotas” },

      { type: “steps”, title: “Solución: Automatización Inteligente”, items: [

        { num: “✓”, label: “Transferencias automáticas”, desc: “A cuentas de ahorro/inversión el día que cobras.” },

        { num: “✓”, label: “Débito automático”, desc: “Para facturas fijas, evitas moras y descuidos.” },

        { num: “✓”, label: “Notificaciones de gasto”, desc: “Alerta cuando la cuenta cae por debajo de cierto monto.” },

        { num: “✓”, label: “Regla de las 48 horas”, desc: “Espera 2 días antes de comprar algo no planificado.” },

      ]},

      { type: “tip”, text: “💡 Control → Tranquilidad. Entender cuánto entra y sale reduce el estrés y permite decisiones planificadas. Prevención > reacción.” },

    ],

  },

  {

    Id: 3, icon: “🏦”,

    Title: “Ahorro vs. Inversión”,

    Color: “#1ª7A8A”, accent: “#0E5A68”,

    Summary: “Conoce la diferencia y elige la estrategia correcta según tu horizonte y metas.”,

    Content: [

      { type: “concept”, title: “No son lo mismo”, text: “Ahorro y inversión son herramientas distintas con propósitos distintos. Confundirlas puede hacerte perder dinero por inflación o bloquearte capital que necesitas con urgencia.” },

      { type: “compare”, title: “Ahorro vs. Inversión”,

        Left: { label: “🐷 Ahorro”, color: “#1ª7A8A”, items: [“Instrumentos líquidos (cuentas de ahorro, depósitos)”, “Bajo riesgo, retornos modestos”, “Para emergencias y metas de corto plazo”, “Prioriza disponibilidad inmediata”] },

        Right: { label: “📈 Inversión”, color: C.secondary, items: [“Activos: acciones, bonos, fondos, bienes raíces”, “Mayor riesgo, mayor rentabilidad potencial”, “Para crecimiento de capital a largo plazo”, “Requiere tolerancia al riesgo”] },

      },

      { type: “steps”, title: “Horizontes de metas”, items: [

        { num: “⚡”, label: “Corto plazo (0–6 meses)”, desc: “Fondo de emergencia pequeño: $100–$300 o 1 mes de gastos.” },

        { num: “🎯”, label: “Medio plazo (6–24 meses)”, desc: “Vacaciones, cursos, cambiar un equipo.” },

        { num: “🏗️”, label: “Largo plazo (24+ meses)”, desc: “Entrada de vivienda, jubilación, inversiones de capital.” },

      ]},

      { type: “tip”, text: “💡 Primero crea tu fondo de emergencia (3–6 meses de gastos). Solo entonces empieza a invertir. Si inviertes sin colchón, una emergencia te obliga a vender en mal momento.” },

    ],

  },

  {

    Id: 4, icon: “🛡️”,

    Title: “Ciberseguridad y Fraudes”,

    Color: C.quat, accent: C.primary,

    Summary: “Protege tu dinero y datos personales de estafas digitales cada vez más sofisticadas.”,

    Content: [

      { type: “concept”, title: “El fraude digital en Ecuador”, text: “Las estafas digitales están creciendo y evolucionando. Usuarios reportan robo de datos, accesos a cuentas y pérdidas económicas. Hoy el fraude incorpora Inteligencia Artificial, clonación de voz y contenidos falsos.” },

      { type: “steps”, title: “Los 3 tipos de ataque más comunes”, items: [

        { num: “📧”, label: “Phishing”, desc: “Correo falso que aparenta ser legítimo para robar tu información o contraseñas.” },

        { num: “📱”, label: “Smishing”, desc: “Mensaje de texto o app falsa que solicita tus datos personales o bancarios.” },

        { num: “📞”, label: “Vishing”, desc: “Llamada telefónica donde el delincuente se presenta como representante de un banco o empresa real.” },

      ]},

      { type: “checklist”, title: “Buenas prácticas (aplícalas HOY)”,

        Goods: [“Activa doble factor de autenticación (2FA)”, “Usa contraseñas únicas por sitio (gestor de contraseñas)”, “Activa notificaciones bancarias por SMS/email”, “Mantén sistemas y apps siempre actualizados”, “Prefiere plataformas confiables para pagos”],

        Bads: [“Usar contraseñas simples como ‘123456’”, “Repetir la misma contraseña en varias cuentas”, “Abrir enlaces sin verificar el remitente”, “Usar Wi-Fi público para operaciones bancarias”, “Compartir códigos 2FA o PIN por teléfono”],

      },

      { type: “tip”, text: “🚨 Si detectas un fraude: 1) Bloquea la tarjeta/cuenta inmediatamente. 2) Toma capturas de pantalla. 3) Solicita reversión del cargo (chargeback). ¡Los bancos tienen plazos para reclamar!” },

    ],

  },

];



// ─── BANCO DE 50 PREGUNTAS ────────────────────────────────────

Const QUESTION_BANK = [

  // PRESUPUESTO

  { topic: “Presupuesto”, q: “¿Cuánto debe destinarse a necesidades según la regla 50/30/20?”, opts: [“30%”,”50%”,”20%”,”40%”], a: 1, exp: “El 50% del ingreso neto se destina a necesidades básicas.” },

  { topic: “Presupuesto”, q: “¿Cuál es el porcentaje recomendado para ahorro y pago de deudas en la regla 50/30/20?”, opts: [“10%”,”30%”,”20%”,”25%”], a: 2, exp: “El 20% se destina a ahorro y pago de deudas.” },

  { topic: “Presupuesto”, q: “Cobras $1,000/mes. ¿Cuánto destinarías a deseos según la regla 50/30/20?”, opts: [“$200”,”$500”,”$300”,”$150”], a: 2, exp: “El 30% de $1,000 = $300 para deseos y gastos discrecionales.” },

  { topic: “Presupuesto”, q: “¿Cuál es el primer paso recomendado al hacer un presupuesto?”, opts: [“Abrir una cuenta de inversión”,”Registrar todos los gastos durante 30 días”,”Pedir un crédito”,”Cancelar suscripciones”], a: 1, exp: “Registrar 30 días de gastos te da el promedio real para construir un presupuesto preciso.” },

  { topic: “Presupuesto”, q: “¿Qué incluye la categoría de ‘necesidades’ en el presupuesto?”, opts: [“Ocio y entretenimiento”,”Vivienda, servicios, alimentación básica y transporte”,”Vacaciones y viajes”,”Ropa de moda”], a: 1, exp: “Las necesidades son gastos esenciales: vivienda, alimentación básica, transporte y servicios.” },

  { topic: “Presupuesto”, q: “¿Qué significa ‘págate primero’ en finanzas personales?”, opts: [“Gastar en lo que quieras antes de pagar deudas”,”Transferir tu ahorro automáticamente el día que cobras”,”Pagar primero las facturas más caras”,”Comprar lo que necesitas antes de ahorrar”], a: 1, exp: “Transferir el ahorro el día de cobro garantiza que sí se realice, sin depender de ‘lo que sobre’.” },

  { topic: “Presupuesto”, q: “¿Cuál de estos es un gasto fijo mensual?”, opts: [“Gasolina”,”Comidas fuera”,”Renta o hipoteca”,”Entretenimiento”], a: 2, exp: “La renta o hipoteca es un gasto fijo porque no varía mes a mes.” },

  { topic: “Presupuesto”, q: “¿Con cuánto se recomienda empezar el fondo de emergencia si nunca has ahorrado?”, opts: [“$5,000”,”$500–$1,000”,”$10,000”,”$100”], a: 1, exp: “Un objetivo inicial realista es $500–$1,000 o equivalente a 1 mes de gastos básicos.” },

  { topic: “Presupuesto”, q: “Si tus gastos variables son difíciles de calcular, ¿qué se recomienda?”, opts: [“Ignorarlos”,”Estimarlos con un +10–20% de margen de seguridad”,”Reducirlos a cero”,”Financiarlos con tarjeta de crédito”], a: 1, exp: “Agregar un margen del 10–20% protege contra gastos inesperados en categorías variables.” },

  { topic: “Presupuesto”, q: “¿Cuánto del ingreso neto se recomienda destinar a deudas como máximo?”, opts: [“10–15%”,”50–60%”,”30–40%”,”5%”], a: 2, exp: “El pago de deudas no debería superar el 30–40% del ingreso neto total.” },

  { topic: “Presupuesto”, q: “¿Cuál es el objetivo del presupuesto personal?”, opts: [“Gastar más”,”Planificar y controlar ingresos y gastos”,”Endeudarse menos”,”Invertir en bolsa”], a: 1, exp: “El presupuesto es un plan que permite controlar cuánto entra y cuánto sale cada mes.” },

  { topic: “Presupuesto”, q: “¿Qué tipo de gasto es la suscripción mensual a streaming?”, opts: [“Gasto fijo de necesidad”,”Gasto fijo de deseo”,”Gasto variable de necesidad”,”Inversión”], a: 1, exp: “Las suscripciones son gastos fijos pero no esenciales, se categorizan como deseos.” },

  { topic: “Presupuesto”, q: “Cobras $2,000/mes. Según 50/30/20, ¿cuánto ahorras?”, opts: [“$200”,”$600”,”$400”,”$1,000”], a: 2, exp: “El 20% de $2,000 = $400 para ahorro e inversiones.” },

  // CONTROL DE IMPULSOS

  { topic: “Control de Impulsos”, q: “Una TV cuesta $400 al contado o 12 cuotas de $45. ¿Cuánto pagas en cuotas?”, opts: [“$400”,”$540”,”$480”,”$360”], a: 1, exp: “12 × $45 = $540, es decir $140 más que al contado.” },

  { topic: “Control de Impulsos”, q: “¿Cuál de estos NO es una trampa del gasto innecesario?”, opts: [“Status social”,”Ahorro automático”,”Pagos diferidos”,”Promociones”], a: 1, exp: “El ahorro automático es la solución al gasto innecesario, no una trampa.” },

  { topic: “Control de Impulsos”, q: “¿Qué es la regla de las 48 horas?”, opts: [“Pagar deudas en 48 horas”,”Esperar 2 días antes de comprar algo no planificado”,”Ahorrar 48 horas de salario al mes”,”Revisar tu presupuesto cada 2 días”], a: 1, exp: “Esperar 48 horas antes de una compra no planificada ayuda a evitar compras impulsivas.” },

  { topic: “Control de Impulsos”, q: “¿Qué se entiende por ‘dinero plástico’ como trampa financiera?”, opts: [“Dinero falso”,”El uso de tarjetas de crédito con facilidades de pago que hacen perder de vista el gasto real”,”Billetes dañados”,”Monedas de plástico”], a: 1, exp: “Las tarjetas de crédito hacen que el gasto sea menos ‘visible’, facilitando el exceso.” },

  { topic: “Control de Impulsos”, q: “Una refrigeradora cuesta $238 al contado o 18 cuotas de $28.91. ¿Cuánto pagas en cuotas?”, opts: [“$238”,”$289”,”$520”,”$400”], a: 2, exp: “18 × $28.91 = $520.38, más del doble del precio al contado.” },

  { topic: “Control de Impulsos”, q: “¿Cuál es la ventaja del débito automático para facturas fijas?”, opts: [“Te permite gastar más”,”Evita moras y descuidos en pagos recurrentes”,”Genera intereses a tu favor”,”Te obliga a ahorrar más”], a: 1, exp: “El débito automático garantiza el pago puntual de facturas fijas sin riesgo de olvido o mora.” },

  { topic: “Control de Impulsos”, q: “¿Qué es el ‘status social’ como causa de gasto innecesario?”, opts: [“Ahorro por presión social”,”Comprar para aparentar o igualar el nivel de otros”,”Invertir en educación”,”Donaciones a terceros”], a: 1, exp: “El ‘status social’ lleva a comprar para aparentar o no quedarse atrás frente a los demás.” },

  { topic: “Control de Impulsos”, q: “¿Cuál es la solución más efectiva para evitar gastar el ahorro?”, opts: [“Guardar efectivo en casa”,”Automatizar la transferencia de ahorro el día de cobro”,”Usar la tarjeta de crédito para todo”,”No tener cuenta de ahorros”], a: 1, exp: “Automatizar el ahorro el día de cobro impide que ese dinero esté disponible para gastarlo.” },

  { topic: “Control de Impulsos”, q: “¿Qué permite el ahorro automático al usuario?”, opts: [“Gastar más libremente”,”Ahorrar sin depender de la fuerza de voluntad”,”Aumentar su límite de crédito”,”Evitar pagar impuestos”], a: 1, exp: “El ahorro automático elimina la decisión diaria de ahorrar, haciendo el hábito sostenible.” },

  { topic: “Control de Impulsos”, q: “¿Por qué los pagos diferidos hacen difícil controlar el gasto?”, opts: [“Porque los diferidos tienen tasa 0”,”Porque no vemos el impacto real inmediato en nuestro bolsillo”,”Porque siempre son más baratos”,”Porque los aprueba el banco automáticamente”], a: 1, exp: “Al diferir pagos, el impacto financiero se distribuye en el tiempo y es menos perceptible.” },

  { topic: “Control de Impulsos”, q: “Tienes $500 de ahorro. Ves un celular de $450 en cuotas de $50/mes por 12 meses. ¿Cuál es la decisión más inteligente?”, opts: [“Comprarlo en cuotas de inmediato”,”Comprarlo al contado aunque agote mis ahorros”,”Esperar, mi celular funciona bien”,”Pedir prestado para comprarlo”], a: 2, exp: “Si el celular actual funciona, esperar preserva el fondo de emergencia y evita deuda innecesaria.” },

  // AHORRO E INVERSIÓN

  { topic: “Ahorro e Inversión”, q: “¿Cuál es la diferencia principal entre ahorro e inversión?”, opts: [“El ahorro genera más rentabilidad”,”El ahorro prioriza liquidez y seguridad; la inversión prioriza crecimiento a largo plazo”,”Son exactamente lo mismo”,”La inversión es más segura”], a: 1, exp: “El ahorro es para emergencias y metas cortas; la inversión busca rentabilidad con más riesgo a largo plazo.” },

  { topic: “Ahorro e Inversión”, q: “¿Para qué tipo de meta es más adecuada una cuenta de ahorro?”, opts: [“Jubilación en 30 años”,”Comprar acciones”,”Cubrir gastos de emergencia en los próximos meses”,”Invertir en bienes raíces”], a: 2, exp: “La cuenta de ahorro es líquida y segura, ideal para emergencias o metas de corto plazo.” },

  { topic: “Ahorro e Inversión”, q: “¿Cuántos meses de gastos básicos se recomienda tener en el fondo de emergencia con ingresos estables?”, opts: [“1 mes”,”3 meses”,”12 meses”,”6 meses”], a: 1, exp: “Con trabajo e ingresos estables, 3 meses de gastos básicos es el objetivo recomendado.” },

  { topic: “Ahorro e Inversión”, q: “¿Cuántos meses de fondo de emergencia se recomiendan si tienes ingresos inestables?”, opts: [“1 mes”,”2 meses”,”6 meses”,”3 meses”], a: 2, exp: “Con ingresos inestables o trabajo independiente, se recomienda tener 6 meses de gastos cubiertos.” },

  { topic: “Ahorro e Inversión”, q: “¿Qué tipo de horizonte tiene una meta de jubilación?”, opts: [“Corto plazo (0–6 meses)”,”Medio plazo (6–24 meses)”,”Largo plazo (24+ meses)”,”No tiene horizonte”], a: 2, exp: “La jubilación es una meta de largo plazo que requiere inversión sostenida durante décadas.” },

  { topic: “Ahorro e Inversión”, q: “¿Qué sucede si inviertes sin tener un fondo de emergencia?”, opts: [“Ganas más rentabilidad”,”Podrías verse obligado a vender en mal momento ante una emergencia”,”No hay ningún problema”,”El banco te protege”], a: 1, exp: “Sin fondo de emergencia, cualquier imprevisto te fuerza a liquidar inversiones quizás en pérdida.” },

  { topic: “Ahorro e Inversión”, q: “¿Cuál de estos es un instrumento de inversión?”, opts: [“Cuenta de ahorros”,”Depósito a plazo fijo”,”Fondo indexado de acciones”,”Efectivo en casa”], a: 2, exp: “Los fondos indexados son vehículos de inversión que siguen el desempeño de un índice bursátil.” },

  { topic: “Ahorro e Inversión”, q: “¿Cuál es una meta de corto plazo?”, opts: [“Jubilarse en 25 años”,”Comprar casa propia”,”Ahorrar $300 para emergencias en 5 meses”,”Invertir en acciones por 10 años”], a: 2, exp: “Las metas de corto plazo (0–6 meses) como el fondo inicial de emergencia son prioritarias al comenzar.” },

  { topic: “Ahorro e Inversión”, q: “¿Cuál es una característica de los instrumentos de ahorro?”, opts: [“Alta rentabilidad y alto riesgo”,”Baja liquidez”,”Liquidez inmediata y bajo riesgo”,”Dependen del mercado de acciones”], a: 2, exp: “Los instrumentos de ahorro (cuentas, depósitos) se caracterizan por ser líquidos y de bajo riesgo.” },

  { topic: “Ahorro e Inversión”, q: “¿Cuál de estas es una meta de medio plazo?”, opts: [“Fondo de emergencia esta semana”,”Comprar un auto en 18 meses”,”Jubilación en 30 años”,”Pagar la factura del mes”], a: 1, exp: “Las metas de medio plazo (6–24 meses) incluyen vacaciones, cursos, equipos o vehículos pequeños.” },

  { topic: “Ahorro e Inversión”, q: “¿Por qué el dinero guardado en efectivo pierde valor con el tiempo?”, opts: [“Por los impuestos”,”Por la inflación”,”Por el tipo de cambio”,”Por los gastos bancarios”], a: 1, exp: “La inflación reduce el poder adquisitivo del efectivo guardado sin generar ningún rendimiento.” },

  { topic: “Ahorro e Inversión”, q: “¿Qué es un depósito a plazo fijo?”, opts: [“Una inversión de alto riesgo en bolsa”,”Un instrumento de ahorro con plazo y tasa pactados previamente”,”Una tarjeta de crédito especial”,”Un tipo de seguro de vida”], a: 1, exp: “El depósito a plazo fijo es un instrumento seguro y predecible, ideal para metas de corto plazo.” },

  // CIBERSEGURIDAD Y FRAUDES

  { topic: “Ciberseguridad”, q: “¿Qué es el phishing?”, opts: [“Una técnica de pesca deportiva”,”Un correo falso que simula ser legítimo para robar datos”,”Un tipo de inversión en línea”,”Un virus informático”], a: 1, exp: “El phishing usa correos falsos que imitan a empresas reales para obtener datos personales o bancarios.” },

  { topic: “Ciberseguridad”, q: “¿Qué es el smishing?”, opts: [“Un ataque por correo electrónico”,”Un fraude a través de mensajes de texto o apps falsas”,”Un tipo de phishing por llamada”,”Un malware en computadoras”], a: 1, exp: “El smishing usa SMS o mensajes de apps para engañar y obtener datos personales.” },

  { topic: “Ciberseguridad”, q: “¿Qué es el vishing?”, opts: [“Un virus en redes sociales”,”Un fraude por llamada telefónica donde el delincuente finge ser un representante legítimo”,”Un correo falso”,”Un ataque a cajeros automáticos”], a: 1, exp: “El vishing usa llamadas telefónicas para engañar a las víct
