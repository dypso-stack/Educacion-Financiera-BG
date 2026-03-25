import { useState, useMemo } from "react";

const C = {
  primary:   "#A31A61",
  secondary: "#160F41",
  tertiary:  "#9FDCEE",
  quat:      "#D2006E",
  bg:        "#FFFFFF",
  bgSoft:    "#F8F5FB",
  border:    "#E6DDF0",
  text:      "#160F41",
  textMid:   "#3D2F6B",
  textSoft:  "#7A6E9A",
  textLight: "#B0A8CC",
  success:   "#0B6B40",
  successBg: "#E6F5EE",
  error:     "#B91C1C",
  errorBg:   "#FEE2E2",
  warnBg:    "#FEF3C7",
  warnText:  "#78350F",
};

// ─── LESSONS (sin quiz) ───────────────────────────────────────
const LESSONS = [
  {
    id: 1, icon: "📋",
    title: "Presupuesto Personal",
    color: C.primary, accent: C.quat,
    summary: "Planifica, registra y controla tus ingresos y gastos mes a mes.",
    content: [
      { type: "concept", title: "¿Por qué planificar?", text: "La planificación permite establecer objetivos, determinar estrategias y acciones para alcanzarlos. Es una actividad anticipatoria que establece un camino a seguir. Administrar es implementar esos planes con orden y control." },
      { type: "steps", title: "6 Pasos para tu presupuesto", items: [
        { num: "1", label: "Calcula tu ingreso neto mensual", desc: "Incluye sueldo neto, pensiones, rentas. Si cobras semanal o quincenal, convierte a mensual." },
        { num: "2", label: "Lista tus gastos fijos", desc: "Alquiler, préstamos, internet, seguros, colegiaturas, suscripciones." },
        { num: "3", label: "Estima gastos variables", desc: "Alimentación, gasolina, ocio, ropa, farmacia. Registra 30 días para saber el promedio real." },
        { num: "4", label: "Aplica la regla 50/30/20", desc: "50% necesidades · 30% deseos · 20% ahorro y deudas." },
        { num: "5", label: "Págate primero", desc: "Transfiere automáticamente a ahorro el día que cobras. Trátalo como una factura más." },
        { num: "6", label: "Prioriza fondo de emergencia", desc: "Meta inicial: $500–$1,000. Luego 3 meses de gastos básicos." },
      ]},
      { type: "rule5020", title: "Regla 50 / 30 / 20", items: [
        { pct: "50%", label: "Necesidades", desc: "Vivienda, servicios, alimentación, transporte, seguros", color: C.primary },
        { pct: "30%", label: "Deseos", desc: "Ocio, salidas, suscripciones, compras no esenciales", color: "#7A4F9A" },
        { pct: "20%", label: "Ahorro & Deudas", desc: "Fondo de emergencia, inversiones, pago de créditos", color: "#1A7A8A" },
      ]},
      { type: "tip", text: "💡 Ahorro mínimo inicial: 5% (meta 10–20%). Pago de deudas: máximo 30–40% del ingreso neto. Utilización de crédito: mantén <30% del límite disponible." },
    ],
  },
  {
    id: 2, icon: "🧠",
    title: "Control de Impulsos",
    color: C.secondary, accent: "#3D2E8A",
    summary: "Reconoce las trampas del gasto innecesario y actúa con inteligencia financiera.",
    content: [
      { type: "concept", title: "¿Por qué gastamos de más?", text: "Cuatro grandes facilitadores nos empujan a gastar lo innecesario: el status social ('quiero yo también'), los pagos diferidos ('no veo lo que gasto'), el dinero plástico (facilidades de pago y plazos) y las promociones ('barato y pagable')." },
      { type: "warning", title: "El engaño de las cuotas", text: "Una refrigeradora de $238.05 al contado puede convertirse en 18 cuotas de $28.91 que suman $520.38. Parece pagable, pero pagas más del doble.", highlight: "$238 al contado → $520 en cuotas" },
      { type: "steps", title: "Solución: Automatización Inteligente", items: [
        { num: "✓", label: "Transferencias automáticas", desc: "A cuentas de ahorro/inversión el día que cobras." },
        { num: "✓", label: "Débito automático", desc: "Para facturas fijas, evitas moras y descuidos." },
        { num: "✓", label: "Notificaciones de gasto", desc: "Alerta cuando la cuenta cae por debajo de cierto monto." },
        { num: "✓", label: "Regla de las 48 horas", desc: "Espera 2 días antes de comprar algo no planificado." },
      ]},
      { type: "tip", text: "💡 Control → Tranquilidad. Entender cuánto entra y sale reduce el estrés y permite decisiones planificadas. Prevención > reacción." },
    ],
  },
  {
    id: 3, icon: "🏦",
    title: "Ahorro vs. Inversión",
    color: "#1A7A8A", accent: "#0E5A68",
    summary: "Conoce la diferencia y elige la estrategia correcta según tu horizonte y metas.",
    content: [
      { type: "concept", title: "No son lo mismo", text: "Ahorro y inversión son herramientas distintas con propósitos distintos. Confundirlas puede hacerte perder dinero por inflación o bloquearte capital que necesitas con urgencia." },
      { type: "compare", title: "Ahorro vs. Inversión",
        left: { label: "🐷 Ahorro", color: "#1A7A8A", items: ["Instrumentos líquidos (cuentas de ahorro, depósitos)", "Bajo riesgo, retornos modestos", "Para emergencias y metas de corto plazo", "Prioriza disponibilidad inmediata"] },
        right: { label: "📈 Inversión", color: C.secondary, items: ["Activos: acciones, bonos, fondos, bienes raíces", "Mayor riesgo, mayor rentabilidad potencial", "Para crecimiento de capital a largo plazo", "Requiere tolerancia al riesgo"] },
      },
      { type: "steps", title: "Horizontes de metas", items: [
        { num: "⚡", label: "Corto plazo (0–6 meses)", desc: "Fondo de emergencia pequeño: $100–$300 o 1 mes de gastos." },
        { num: "🎯", label: "Medio plazo (6–24 meses)", desc: "Vacaciones, cursos, cambiar un equipo." },
        { num: "🏗️", label: "Largo plazo (24+ meses)", desc: "Entrada de vivienda, jubilación, inversiones de capital." },
      ]},
      { type: "tip", text: "💡 Primero crea tu fondo de emergencia (3–6 meses de gastos). Solo entonces empieza a invertir. Si inviertes sin colchón, una emergencia te obliga a vender en mal momento." },
    ],
  },
  {
    id: 4, icon: "🛡️",
    title: "Ciberseguridad y Fraudes",
    color: C.quat, accent: C.primary,
    summary: "Protege tu dinero y datos personales de estafas digitales cada vez más sofisticadas.",
    content: [
      { type: "concept", title: "El fraude digital en Ecuador", text: "Las estafas digitales están creciendo y evolucionando. Usuarios reportan robo de datos, accesos a cuentas y pérdidas económicas. Hoy el fraude incorpora Inteligencia Artificial, clonación de voz y contenidos falsos." },
      { type: "steps", title: "Los 3 tipos de ataque más comunes", items: [
        { num: "📧", label: "Phishing", desc: "Correo falso que aparenta ser legítimo para robar tu información o contraseñas." },
        { num: "📱", label: "Smishing", desc: "Mensaje de texto o app falsa que solicita tus datos personales o bancarios." },
        { num: "📞", label: "Vishing", desc: "Llamada telefónica donde el delincuente se presenta como representante de un banco o empresa real." },
      ]},
      { type: "checklist", title: "Buenas prácticas (aplícalas HOY)",
        goods: ["Activa doble factor de autenticación (2FA)", "Usa contraseñas únicas por sitio (gestor de contraseñas)", "Activa notificaciones bancarias por SMS/email", "Mantén sistemas y apps siempre actualizados", "Prefiere plataformas confiables para pagos"],
        bads: ["Usar contraseñas simples como '123456'", "Repetir la misma contraseña en varias cuentas", "Abrir enlaces sin verificar el remitente", "Usar Wi-Fi público para operaciones bancarias", "Compartir códigos 2FA o PIN por teléfono"],
      },
      { type: "tip", text: "🚨 Si detectas un fraude: 1) Bloquea la tarjeta/cuenta inmediatamente. 2) Toma capturas de pantalla. 3) Solicita reversión del cargo (chargeback). ¡Los bancos tienen plazos para reclamar!" },
    ],
  },
];

// ─── BANCO DE 50 PREGUNTAS ────────────────────────────────────
const QUESTION_BANK = [
  // PRESUPUESTO
  { topic: "Presupuesto", q: "¿Cuánto debe destinarse a necesidades según la regla 50/30/20?", opts: ["30%","50%","20%","40%"], a: 1, exp: "El 50% del ingreso neto se destina a necesidades básicas." },
  { topic: "Presupuesto", q: "¿Cuál es el porcentaje recomendado para ahorro y pago de deudas en la regla 50/30/20?", opts: ["10%","30%","20%","25%"], a: 2, exp: "El 20% se destina a ahorro y pago de deudas." },
  { topic: "Presupuesto", q: "Cobras $1,000/mes. ¿Cuánto destinarías a deseos según la regla 50/30/20?", opts: ["$200","$500","$300","$150"], a: 2, exp: "El 30% de $1,000 = $300 para deseos y gastos discrecionales." },
  { topic: "Presupuesto", q: "¿Cuál es el primer paso recomendado al hacer un presupuesto?", opts: ["Abrir una cuenta de inversión","Registrar todos los gastos durante 30 días","Pedir un crédito","Cancelar suscripciones"], a: 1, exp: "Registrar 30 días de gastos te da el promedio real para construir un presupuesto preciso." },
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
  { topic: "Control de Impulsos", q: "¿Cuál de estos NO es una trampa del gasto innecesario?", opts: ["Status social","Ahorro automático","Pagos diferidos","Promociones"], a: 1, exp: "El ahorro automático es la solución al gasto innecesario, no una trampa." },
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
  { topic: "Ciberseguridad", q: "¿Qué porcentaje máximo de tu límite de crédito deberías usar?", opts: ["70%","100%","30%","50%"], a: 2, exp: "Mantener la utilización del crédito por debajo del 30% protege tu score crediticio." },
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

// Shuffle helper
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── GAME SCENARIOS ───────────────────────────────────────────
const GAME_SCENARIOS = [
  { situation: "Tu cuenta de Netflix muestra un mensaje de suspensión y te pide actualizar tus datos de pago con urgencia haciendo clic en un botón.", options: [
    { text: "Hago clic y actualizo mis datos", points: -10, feedback: "⚠️ Esto es Phishing. Netflix nunca pide datos así. Perderías tu información bancaria." },
    { text: "Ignoro el mensaje y entro directo a netflix.com", points: 10, feedback: "✅ ¡Excelente! Siempre accede directamente al sitio oficial. El mensaje era falso." },
    { text: "Llamo al número del correo", points: -5, feedback: "⚠️ El número también puede ser falso. Usa siempre el número oficial del sitio web." },
  ]},
  { situation: "Tienes $400 de ahorro y ves una oferta de un celular nuevo: $350 al contado o 12 cuotas de $38. Tu celular actual funciona bien.", options: [
    { text: "Lo compro en cuotas, son solo $38", points: -5, feedback: "⚠️ Pagarías $456 total, $106 más que al contado, y comprometes tu flujo mensual." },
    { text: "Lo compro al contado, agoto mis ahorros", points: 0, feedback: "😐 No es fraude, pero quedas sin fondo de emergencia. Riesgo si algo sale mal." },
    { text: "Espero, mi celular funciona. Ahorro 3 meses más", points: 10, feedback: "✅ ¡Decisión financiera inteligente! Mantienes tu fondo y evitas deuda innecesaria." },
  ]},
  { situation: "Cobras tu sueldo. Tienes ganas de salir a comer y comprar ropa. Aún no has aportado a tu ahorro este mes.", options: [
    { text: "Primero salgo, el ahorro lo hago después si sobra", points: -10, feedback: "⚠️ El ahorro 'si sobra' nunca ocurre. Este es el error más común en finanzas personales." },
    { text: "Transfiero mi ahorro primero, luego gasto el resto", points: 10, feedback: "✅ 'Págate primero': automatiza tu ahorro antes de gastar. Es el hábito más poderoso." },
    { text: "No ahorro este mes porque tuve gastos imprevistos", points: -5, feedback: "⚠️ Justo para eso sirve el fondo de emergencia. Si no lo tienes, es más urgente aún ahorrar." },
  ]},
  { situation: "Recibes una llamada de alguien que dice ser tu jefe pidiéndote hacer una transferencia urgente a una cuenta desconocida.", options: [
    { text: "Hago la transferencia, es urgente", points: -10, feedback: "🚨 Este es el fraude del 'CEO falso'. Nunca transfieras sin verificar en persona o por otro canal." },
    { text: "Cuelgo y llamo a mi jefe a su celular conocido", points: 10, feedback: "✅ ¡Perfecto! Siempre verifica por un canal distinto antes de hacer movimientos de dinero." },
    { text: "Pido que me envíe un correo con los detalles", points: 0, feedback: "😐 Mejor que transferir, pero el correo también puede ser falso. Llama directamente." },
  ]},
];

// ─── NAV ─────────────────────────────────────────────────────
function Nav({ xp }) {
  return (
    <div style={{ padding: "16px 18px 13px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${C.border}`, background: C.bg, position: "sticky", top: 0, zIndex: 10 }}>
      <div style={{ fontSize: 15, fontWeight: 900, color: C.primary, letterSpacing: "-0.4px" }}>Educación Financiera BG</div>
      <div style={{ fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: `${C.primary}12`, border: `1px solid ${C.primary}35`, color: C.primary }}>⚡ {xp} XP</div>
    </div>
  );
}

// ─── QUIZ MODE (10 aleatorias del banco de 50) ───────────────
function QuizMode({ xp, setXp, onBack }) {
  const questions = useMemo(() => shuffle(QUESTION_BANK).slice(0, 10), []);
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const q = questions[idx];

  const handleAnswer = (oi) => {
    if (answer !== null) return;
    setAnswer(oi);
    if (oi === q.a) { setScore(s => s + 1); setXp(x => x + 50); }
  };
  const next = () => { if (idx + 1 >= questions.length) { setDone(true); return; } setIdx(i => i + 1); setAnswer(null); };
  const restart = () => { setIdx(0); setAnswer(null); setScore(0); setDone(false); };

  const appSt = { fontFamily: "'Plus Jakarta Sans',sans-serif", background: C.bgSoft, minHeight: "100vh", color: C.text, maxWidth: 500, margin: "0 auto" };
  const backBt = { background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: "7px 14px", color: C.textMid, fontSize: 13, cursor: "pointer", fontFamily: "inherit", marginBottom: 20 };

  if (done) return (
    <div style={appSt}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      <Nav xp={xp} />
      <div style={{ padding: "50px 18px", textAlign: "center" }}>
        <div style={{ fontSize: 52, marginBottom: 14 }}>{score >= 8 ? "🏆" : score >= 5 ? "📈" : "💡"}</div>
        <div style={{ fontSize: 24, fontWeight: 900, color: C.secondary, marginBottom: 8 }}>{score >= 8 ? "¡Experto Financiero!" : score >= 5 ? "¡Buen resultado!" : "Sigue practicando"}</div>
        <div style={{ fontSize: 40, fontWeight: 900, color: C.primary, marginBottom: 4 }}>{score}/10</div>
        <div style={{ fontSize: 13, color: C.textSoft, marginBottom: 30 }}>respuestas correctas · +{score * 50} XP ganados</div>
        <button onClick={onBack} style={{ display: "block", width: "100%", padding: 15, borderRadius: 14, background: `linear-gradient(135deg, ${C.primary}, ${C.quat})`, border: "none", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", marginBottom: 10 }}>← Volver al inicio</button>
        <button onClick={restart} style={{ display: "block", width: "100%", padding: 15, borderRadius: 14, background: C.bg, border: `1.5px solid ${C.primary}`, color: C.primary, fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>Intentar de nuevo 🔄</button>
      </div>
    </div>
  );

  return (
    <div style={appSt}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      <Nav xp={xp} />
      <div style={{ padding: "20px 18px 80px" }}>
        <button onClick={onBack} style={backBt}>← Volver</button>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div style={{ fontSize: 12, color: C.textSoft }}>Pregunta {idx + 1} de 10</div>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.success }}>✓ {score} correctas</div>
        </div>
        <div style={{ background: C.border, borderRadius: 8, height: 6, marginBottom: 18, overflow: "hidden" }}>
          <div style={{ height: "100%", background: `linear-gradient(90deg, ${C.primary}, ${C.quat})`, borderRadius: 8, width: `${(idx / 10) * 100}%`, transition: "width 0.4s" }} />
        </div>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, color: C.primary, textTransform: "uppercase", marginBottom: 8 }}>{q.topic}</div>
        <div style={{ fontSize: 16, fontWeight: 800, lineHeight: 1.5, color: C.secondary, marginBottom: 18 }}>{q.q}</div>
        {q.opts.map((opt, oi) => {
          let bg = C.bg, border = `1px solid ${C.border}`, color = C.textMid;
          if (answer !== null) {
            if (oi === q.a) { bg = C.successBg; border = `1.5px solid ${C.success}`; color = C.success; }
            else if (oi === answer) { bg = C.errorBg; border = `1.5px solid ${C.error}`; color = C.error; }
            else { color = C.textLight; }
          }
          return <button key={oi} onClick={() => handleAnswer(oi)} style={{ display: "block", width: "100%", textAlign: "left", padding: "12px 15px", borderRadius: 12, background: bg, border, color, fontSize: 13, marginBottom: 9, cursor: answer === null ? "pointer" : "default", fontFamily: "inherit", lineHeight: 1.4, transition: "all 0.2s", boxShadow: answer === null ? "0 1px 3px rgba(0,0,0,0.05)" : "none" }}><span style={{ fontWeight: 700 }}>{["A","B","C","D"][oi]}.</span> {opt}</button>;
        })}
        {answer !== null && (
          <>
            <div style={{ padding: "12px 14px", borderRadius: 12, background: `${C.tertiary}28`, border: `1.5px solid ${C.tertiary}`, fontSize: 13, color: C.secondary, lineHeight: 1.5, marginBottom: 14 }}>
              {answer === q.a ? "✅ ¡Correcto! " : "❌ Incorrecto. "}{q.exp}{answer === q.a && <span style={{ color: C.primary, fontWeight: 800 }}> +50 XP</span>}
            </div>
            <button onClick={next} style={{ width: "100%", padding: 14, borderRadius: 12, background: `linear-gradient(135deg, ${C.primary}, ${C.quat})`, border: "none", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
              {idx + 1 >= 10 ? "Ver resultados 🏁" : "Siguiente pregunta →"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────
export default function FinanzasTaller() {
  const [screen, setScreen] = useState("home");
  const [activeLesson, setActiveLesson] = useState(null);
  const [completed, setCompleted] = useState(new Set());
  const [xp, setXp] = useState(0);
  const [gameScreen, setGameScreen] = useState("intro");
  const [gameIndex, setGameIndex] = useState(0);
  const [gameScore, setGameScore] = useState(0);
  const [gameChoice, setGameChoice] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);

  const openLesson = (l) => { setActiveLesson(l); setScreen("lesson"); };
  const startGame = () => { setGameIndex(0); setGameScore(0); setGameChoice(null); setGameHistory([]); setGameScreen("play"); };
  const handleGameChoice = (oi) => {
    if (gameChoice !== null) return;
    const opt = GAME_SCENARIOS[gameIndex].options[oi];
    setGameChoice(oi); setGameScore(s => s + opt.points); setGameHistory(h => [...h, { scenario: gameIndex, choice: oi, points: opt.points }]);
  };
  const nextScenario = () => {
    if (gameIndex + 1 >= GAME_SCENARIOS.length) { if (gameScore >= 30) setXp(x => x + 80); setGameScreen("result"); }
    else { setGameIndex(i => i + 1); setGameChoice(null); }
  };

  const totalXp = 10 * 50 + 80;
  const progress = Math.min(Math.round((xp / totalXp) * 100), 100);

  const appSt = { fontFamily: "'Plus Jakarta Sans',sans-serif", background: C.bgSoft, minHeight: "100vh", color: C.text, maxWidth: 500, margin: "0 auto" };
  const cardSt = { background: C.bg, border: `1px solid ${C.border}`, borderRadius: 18, padding: 18, marginBottom: 12, cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 1px 4px rgba(22,15,65,0.07)" };
  const backBt = { background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: "7px 14px", color: C.textMid, fontSize: 13, cursor: "pointer", fontFamily: "inherit", marginBottom: 20 };
  const blkWrap = { margin: "0 18px 14px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, boxShadow: "0 1px 4px rgba(22,15,65,0.05)" };

  const hover = (e, color, enter) => {
    e.currentTarget.style.transform = enter ? "translateY(-2px)" : "translateY(0)";
    e.currentTarget.style.boxShadow = enter ? `0 6px 20px ${color}25` : "0 1px 4px rgba(22,15,65,0.07)";
  };

  const renderBlock = (lesson, item, i) => {
    if (item.type === "concept") return <div key={i} style={blkWrap}><div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10, color: C.secondary }}>{item.title}</div><div style={{ fontSize: 13, color: C.textMid, lineHeight: 1.65 }}>{item.text}</div></div>;
    if (item.type === "tip") return <div key={i} style={{ margin: "0 18px 14px", background: `${C.tertiary}28`, border: `1.5px solid ${C.tertiary}`, borderRadius: 16, padding: 16, fontSize: 13, color: C.secondary, lineHeight: 1.6 }}>{item.text}</div>;
    if (item.type === "warning") return <div key={i} style={{ margin: "0 18px 14px", background: C.warnBg, border: "1px solid #D97706", borderRadius: 16, padding: 16 }}><div style={{ fontSize: 13, fontWeight: 800, color: "#92400E", marginBottom: 6 }}>{item.title}</div><div style={{ fontSize: 13, color: C.warnText, lineHeight: 1.6 }}>{item.text}</div>{item.highlight && <div style={{ marginTop: 10, background: "#FDE68A", borderRadius: 8, padding: "8px 12px", fontSize: 14, fontWeight: 800, color: "#78350F", textAlign: "center" }}>{item.highlight}</div>}</div>;
    if (item.type === "steps") return <div key={i} style={blkWrap}><div style={{ fontSize: 14, fontWeight: 800, marginBottom: 12, color: C.secondary }}>{item.title}</div>{item.items.map((s, j) => <div key={j} style={{ display: "flex", gap: 12, marginBottom: 11, alignItems: "flex-start" }}><div style={{ width: 28, height: 28, borderRadius: 8, background: `${lesson.color}15`, color: lesson.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0, marginTop: 1 }}>{s.num}</div><div><div style={{ fontSize: 13, fontWeight: 700, color: lesson.color, marginBottom: 2 }}>{s.label}</div><div style={{ fontSize: 12, color: C.textSoft, lineHeight: 1.5 }}>{s.desc}</div></div></div>)}</div>;
    if (item.type === "rule5020") return <div key={i} style={blkWrap}><div style={{ fontSize: 14, fontWeight: 800, marginBottom: 12, color: C.secondary }}>{item.title}</div>{item.items.map((r, j) => <div key={j} style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "center" }}><div style={{ width: 50, height: 50, borderRadius: 12, background: `${r.color}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ fontSize: 14, fontWeight: 900, color: r.color }}>{r.pct}</span></div><div><div style={{ fontSize: 13, fontWeight: 800, color: r.color, marginBottom: 2 }}>{r.label}</div><div style={{ fontSize: 12, color: C.textSoft }}>{r.desc}</div></div></div>)}</div>;
    if (item.type === "compare") return <div key={i} style={{ margin: "0 18px 14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>{[item.left, item.right].map((side, j) => <div key={j} style={{ background: `${side.color}08`, border: `1.5px solid ${side.color}30`, borderRadius: 14, padding: 14 }}><div style={{ fontSize: 13, fontWeight: 800, color: side.color, marginBottom: 10 }}>{side.label}</div>{side.items.map((it, k) => <div key={k} style={{ fontSize: 11, color: C.textMid, marginBottom: 7, lineHeight: 1.4, paddingLeft: 8, borderLeft: `2px solid ${side.color}50` }}>{it}</div>)}</div>)}</div>;
    if (item.type === "checklist") return <div key={i} style={blkWrap}><div style={{ fontSize: 14, fontWeight: 800, marginBottom: 12, color: C.secondary }}>{item.title}</div><div style={{ fontSize: 11, fontWeight: 700, color: C.success, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>✅ Buenas prácticas</div>{item.goods.map((g, j) => <div key={j} style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 12, color: C.success, lineHeight: 1.4 }}><span style={{ flexShrink: 0 }}>✓</span>{g}</div>)}<div style={{ fontSize: 11, fontWeight: 700, color: C.error, letterSpacing: 1, textTransform: "uppercase", margin: "14px 0 8px" }}>❌ Malas prácticas</div>{item.bads.map((b, j) => <div key={j} style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 12, color: C.error, lineHeight: 1.4 }}><span style={{ flexShrink: 0 }}>✗</span>{b}</div>)}</div>;
    return null;
  };

  // ══ HOME ═══════════════════════════════════
  if (screen === "home") return (
    <div style={appSt}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      <Nav xp={xp} />
      <div style={{ background: C.bg, padding: "22px 18px 16px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 24, fontWeight: 900, lineHeight: 1.2, letterSpacing: "-0.7px", marginBottom: 5, color: C.secondary }}>Tu dinero, <span style={{ color: C.primary }}>tus decisiones.</span></div>
        <div style={{ fontSize: 13, color: C.textSoft, marginBottom: 14 }}>{progress}% completado</div>
        <div style={{ background: C.border, borderRadius: 8, height: 7, overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 8, background: `linear-gradient(90deg, ${C.primary}, ${C.quat})`, width: `${progress}%`, transition: "width 0.7s ease" }} />
        </div>
      </div>
      <div style={{ padding: "18px 18px 80px" }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2.5, color: C.textLight, textTransform: "uppercase", marginBottom: 16 }}>¿Qué quieres hacer?</div>

        <div style={{ ...cardSt, flexDirection: "column", alignItems: "flex-start", gap: 10, borderLeft: `4px solid ${C.primary}` }} onClick={() => setScreen("learn")} onMouseEnter={e => hover(e, C.primary, true)} onMouseLeave={e => hover(e, C.primary, false)}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, width: "100%" }}>
            <div style={{ width: 50, height: 50, borderRadius: 14, background: `${C.primary}12`, fontSize: 26, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>📚</div>
            <div style={{ flex: 1 }}><div style={{ fontSize: 16, fontWeight: 900, color: C.primary }}>Aprender</div><div style={{ fontSize: 12, color: C.textSoft, marginTop: 2 }}>4 lecciones · Presupuesto, ahorro, fraudes y más</div></div>
            <span style={{ color: C.primary, fontSize: 18 }}>→</span>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {LESSONS.map(l => <span key={l.id} style={{ fontSize: 11, padding: "3px 9px", borderRadius: 20, background: completed.has(l.id) ? `${l.color}12` : C.bgSoft, border: `1px solid ${completed.has(l.id) ? l.color + "40" : C.border}`, color: completed.has(l.id) ? l.color : C.textLight, fontWeight: 600 }}>{completed.has(l.id) ? "✓ " : ""}{l.title}</span>)}
          </div>
        </div>

        <div style={{ ...cardSt, flexDirection: "column", alignItems: "flex-start", gap: 10, borderLeft: `4px solid ${C.secondary}` }} onClick={() => setScreen("quizmode")} onMouseEnter={e => hover(e, C.secondary, true)} onMouseLeave={e => hover(e, C.secondary, false)}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, width: "100%" }}>
            <div style={{ width: 50, height: 50, borderRadius: 14, background: `${C.secondary}10`, fontSize: 26, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>🧠</div>
            <div style={{ flex: 1 }}><div style={{ fontSize: 16, fontWeight: 900, color: C.secondary }}>Poner a prueba mis conocimientos</div><div style={{ fontSize: 12, color: C.textSoft, marginTop: 2 }}>10 preguntas aleatorias · Banco de 50 · Gana XP</div></div>
            <span style={{ color: C.secondary, fontSize: 18 }}>→</span>
          </div>
          <div style={{ fontSize: 12, color: C.textSoft, padding: "7px 11px", background: `${C.tertiary}22`, border: `1px solid ${C.tertiary}`, borderRadius: 10 }}>Cada vez que juegas las preguntas son diferentes. ¡Pon a prueba todo lo que sabes!</div>
        </div>

        <div style={{ ...cardSt, flexDirection: "column", alignItems: "flex-start", gap: 10, borderLeft: `4px solid ${C.quat}` }} onClick={() => { setGameScreen("intro"); setScreen("game"); }} onMouseEnter={e => hover(e, C.quat, true)} onMouseLeave={e => hover(e, C.quat, false)}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, width: "100%" }}>
            <div style={{ width: 50, height: 50, borderRadius: 14, background: `${C.quat}10`, fontSize: 26, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>🎮</div>
            <div style={{ flex: 1 }}><div style={{ fontSize: 16, fontWeight: 900, color: C.quat }}>Juego interactivo</div><div style={{ fontSize: 12, color: C.textSoft, marginTop: 2 }}>4 escenarios reales · Gana hasta 80 XP</div></div>
            <span style={{ color: C.quat, fontSize: 18 }}>→</span>
          </div>
          <div style={{ fontSize: 12, color: C.textSoft, padding: "7px 11px", background: `${C.quat}08`, border: `1px solid ${C.quat}30`, borderRadius: 10 }}>¿Qué harías si...? Toma decisiones financieras en situaciones reales.</div>
        </div>
      </div>
    </div>
  );

  // ══ LEARN ══════════════════════════════════
  if (screen === "learn") return (
    <div style={appSt}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      <Nav xp={xp} />
      <div style={{ padding: "20px 18px 80px" }}>
        <button onClick={() => setScreen("home")} style={backBt}>← Volver</button>
        <div style={{ fontSize: 22, fontWeight: 900, color: C.primary, marginBottom: 4 }}>📚 Aprender</div>
        <div style={{ fontSize: 13, color: C.textSoft, marginBottom: 20 }}>Selecciona una lección para comenzar</div>
        {LESSONS.map(l => (
          <div key={l.id} style={{ ...cardSt, borderLeft: `4px solid ${l.color}` }} onClick={() => openLesson(l)} onMouseEnter={e => hover(e, l.color, true)} onMouseLeave={e => hover(e, l.color, false)}>
            <div style={{ width: 50, height: 50, borderRadius: 14, background: `${l.color}12`, fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{l.icon}</div>
            <div style={{ flex: 1 }}><div style={{ fontSize: 15, fontWeight: 800, color: l.color, marginBottom: 3 }}>{l.title}</div><div style={{ fontSize: 12, color: C.textSoft, lineHeight: 1.4 }}>{l.summary}</div></div>
            <div style={{ fontSize: 18 }}>{completed.has(l.id) ? "✅" : <span style={{ color: l.color }}>→</span>}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // ══ QUIZ MODE ══════════════════════════════
  if (screen === "quizmode") return <QuizMode xp={xp} setXp={setXp} onBack={() => setScreen("home")} />;

  // ══ LESSON ═════════════════════════════════
  if (screen === "lesson" && activeLesson) {
    const l = activeLesson;
    return (
      <div style={appSt}>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
        <div style={{ height: 5, background: `linear-gradient(90deg, ${l.color}, ${l.accent})` }} />
        <div style={{ padding: "14px 18px 13px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${C.border}`, background: C.bg }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setScreen("learn")} style={{ background: C.bgSoft, border: `1px solid ${C.border}`, borderRadius: 10, width: 36, height: 36, color: C.textMid, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>←</button>
            <div><div style={{ fontSize: 10, color: C.textSoft }}>Lección {l.id} de {LESSONS.length}</div><div style={{ fontSize: 17, fontWeight: 900, color: l.color }}>{l.icon} {l.title}</div></div>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: `${C.primary}12`, border: `1px solid ${C.primary}35`, color: C.primary }}>⚡ {xp} XP</div>
        </div>
        <div style={{ paddingBottom: 60 }}>
          {l.content.map((item, i) => renderBlock(l, item, i))}
          <div style={{ margin: "0 18px" }}>
            <button onClick={() => { setCompleted(c => new Set([...c, l.id])); setScreen("learn"); }} style={{ width: "100%", padding: 15, borderRadius: 14, background: `linear-gradient(135deg, ${l.color}, ${l.accent})`, border: "none", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
              ✓ Completar lección
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ══ GAME ═══════════════════════════════════
  if (screen === "game") {
    const sc = GAME_SCENARIOS[gameIndex];
    return (
      <div style={appSt}>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
        <div style={{ height: 5, background: `linear-gradient(90deg, ${C.quat}, ${C.primary})` }} />
        <Nav xp={xp} />

        {gameScreen === "intro" && (
          <div style={{ padding: "32px 18px" }}>
            <button onClick={() => setScreen("home")} style={backBt}>← Volver</button>
            <div style={{ fontSize: 44, marginBottom: 12 }}>🎮</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: C.quat, marginBottom: 10 }}>Juego: ¿Qué harías si...?</div>
            <div style={{ fontSize: 14, color: C.textMid, lineHeight: 1.65, marginBottom: 24 }}>Escenarios reales. Elige la decisión más inteligente y acumula puntos.</div>
            <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, marginBottom: 22 }}>
              {GAME_SCENARIOS.map((s, i) => <div key={i} style={{ fontSize: 13, color: C.textMid, marginBottom: 6, display: "flex", gap: 10 }}><span style={{ color: C.quat }}>•</span>Escenario {i + 1}</div>)}
            </div>
            <button onClick={startGame} style={{ width: "100%", padding: 16, borderRadius: 14, background: `linear-gradient(135deg, ${C.quat}, ${C.primary})`, border: "none", color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>Comenzar ⚡</button>
          </div>
        )}

        {gameScreen === "play" && (
          <div style={{ padding: "20px 18px 80px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: C.textSoft }}>Escenario {gameIndex + 1} de {GAME_SCENARIOS.length}</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: gameScore >= 0 ? C.success : C.error }}>{gameScore >= 0 ? "+" : ""}{gameScore} pts</div>
            </div>
            <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, marginBottom: 16, fontSize: 14, color: C.textMid, lineHeight: 1.65, boxShadow: "0 1px 4px rgba(22,15,65,0.06)" }}>{sc.situation}</div>
            {sc.options.map((opt, oi) => {
              let bg = C.bgSoft, border = `1px solid ${C.border}`, color = C.textMid;
              if (gameChoice !== null) {
                if (oi === gameChoice) { bg = opt.points > 0 ? C.successBg : C.errorBg; border = opt.points > 0 ? `1.5px solid ${C.success}` : `1.5px solid ${C.error}`; color = opt.points > 0 ? C.success : C.error; }
                else { bg = C.bg; color = C.textLight; }
              }
              return <button key={oi} onClick={() => handleGameChoice(oi)} style={{ display: "block", width: "100%", textAlign: "left", padding: "13px 16px", borderRadius: 12, background: bg, border, color, fontSize: 13, marginBottom: 10, cursor: gameChoice === null ? "pointer" : "default", fontFamily: "inherit", lineHeight: 1.4, transition: "all 0.2s" }}>{opt.text}</button>;
            })}
            {gameChoice !== null && (
              <>
                <div style={{ padding: "13px 15px", borderRadius: 12, background: `${C.tertiary}28`, border: `1.5px solid ${C.tertiary}`, fontSize: 13, color: C.secondary, lineHeight: 1.5, marginBottom: 14 }}>{sc.options[gameChoice].feedback}</div>
                <button onClick={nextScenario} style={{ width: "100%", padding: 14, borderRadius: 12, background: `linear-gradient(135deg, ${C.quat}, ${C.primary})`, border: "none", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                  {gameIndex + 1 >= GAME_SCENARIOS.length ? "Ver resultados 🏁" : "Siguiente escenario →"}
                </button>
              </>
            )}
          </div>
        )}

        {gameScreen === "result" && (
          <div style={{ padding: "38px 18px" }}>
            <div style={{ textAlign: "center", marginBottom: 26 }}>
              <div style={{ fontSize: 50, marginBottom: 12 }}>{gameScore >= 30 ? "🏆" : gameScore >= 10 ? "📈" : "💡"}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: C.secondary, marginBottom: 6 }}>{gameScore >= 30 ? "¡Experto Financiero!" : gameScore >= 10 ? "Buen Progreso" : "Área de Mejora"}</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: gameScore >= 0 ? C.success : C.error, marginBottom: 4 }}>{gameScore >= 0 ? "+" : ""}{gameScore} pts</div>
              {gameScore >= 30 && <div style={{ fontSize: 13, color: C.primary, fontWeight: 700 }}>+80 XP ganados 🎉</div>}
            </div>
            <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, marginBottom: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: C.textLight, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>Resumen</div>
              {gameHistory.map((h, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 9, fontSize: 13 }}><span style={{ color: C.textMid }}>Escenario {h.scenario + 1}</span><span style={{ fontWeight: 800, color: h.points > 0 ? C.success : h.points === 0 ? "#92400E" : C.error }}>{h.points > 0 ? "+" : ""}{h.points} pts</span></div>)}
            </div>
            <button onClick={() => setScreen("home")} style={{ width: "100%", padding: 15, borderRadius: 14, background: `linear-gradient(135deg, ${C.quat}, ${C.primary})`, border: "none", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", marginBottom: 10 }}>← Volver al inicio</button>
            <button onClick={startGame} style={{ width: "100%", padding: 15, borderRadius: 14, background: C.bg, border: `1.5px solid ${C.quat}`, color: C.quat, fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>Jugar de nuevo 🔄</button>
          </div>
        )}
      </div>
    );
  }

  return null;
}
