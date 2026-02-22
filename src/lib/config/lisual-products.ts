// ─── NOMOS Products & Pricing ────────────────────────────────────────────────
// Editar este archivo para actualizar productos, precios y descuentos.
// No requiere cambios en la UI.

export interface CameraOption {
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discountPct: number;
  label: string;
}

export interface LicenseOption {
  key: string;
  name: string;
  maxCams: number;
  price: number;
}

export interface PlanOption {
  key: string;
  name: string;
  monthlyPerCam: number;
}

export const CAMERAS: CameraOption[] = [
  { quantity: 1,  unitPrice: 1920, totalPrice: 1920,  discountPct: 0,  label: "1 Cámara" },
  { quantity: 2,  unitPrice: 1750, totalPrice: 3500,  discountPct: 9,  label: "2 Cámaras (9% off)" },
  { quantity: 3,  unitPrice: 1474, totalPrice: 4422,  discountPct: 23, label: "3 Cámaras (23% off)" },
  { quantity: 6,  unitPrice: 1215, totalPrice: 7290,  discountPct: 36, label: "6 Cámaras (36% off)" },
  { quantity: 9,  unitPrice: 990,  totalPrice: 8910,  discountPct: 48, label: "9 Cámaras (48% off)" },
  { quantity: 12, unitPrice: 960,  totalPrice: 11520, discountPct: 50, label: "12 Cámaras (50% off)" },
];

export const LICENSES: LicenseOption[] = [
  { key: "personal",   name: "Licencia Personal", maxCams: 3,  price: 2160 },
  { key: "pro",         name: "Licencia Pro",      maxCams: 6,  price: 4080 },
  { key: "gold",        name: "Licencia Gold",     maxCams: 9,  price: 5400 },
  { key: "enterprise",  name: "Licencia Enterprise", maxCams: 12, price: 6600 },
];

export const PLANS: PlanOption[] = [
  { key: "pyme",       name: "Plan PyME",       monthlyPerCam: 0 },
  { key: "enterprise", name: "Plan Enterprise",  monthlyPerCam: 49 },
  { key: "corporate",  name: "Plan Corporate",   monthlyPerCam: 84 },
];

export const QUOTE_DEFAULTS = {
  currency: "USD" as const,
  validityDays: 15,
  ivaPct: 0,
  brandName: "LISUAL",
  brandTagline: "SOFTWARE DE MARKETING PARA OBRAS DE CONSTRUCCIÓN",
  brandLogo: "/lisual-logo.png",
  footerLine1: "I.V.A. no incluido ni impuestos provinciales ni nacionales, ni retenciones a IVA o Ganancias.",
  footerLine2: "Conectamos a las personas con sus proyectos — Lisual, Todos los derechos reservados",
  contact: {
    name: "Cristian Alancay",
    role: "Managing Director",
    email: "Cristian.alancay@lisual.com",
    phone: "+54 9 11 3253-6065",
    website: "https://lisual.com",
    meetingUrl: "https://calendly.com/cristian-alancay",
  },
};

export const CAMERA_SPECS = {
  image: "/camera-product.png",
  features: [
    "Calidad 4K — 8 MPX",
    "Memoria micro SD de 32 GB incluida",
    "Slot Chip 4G (no incluido)",
    "Puede ser alimentada con energía solar",
    "Compatible con LisualPro",
    "Visión nocturna",
    "Parlante y micrófono integrado",
    "Grabación de fotos y videos en simultáneo",
    "Alerta sonora en rangos horarios específicos",
    "Compatible con 4G",
  ],
  datasheetUrl: "https://lisual.com/datasheet-camara",
  datasheetLabel: "Ver Data Sheet completo de la Cámara",
};

export interface BonusItem {
  detail: string;
  value: number;
}

export interface BonusCategory {
  title: string;
  emoji: string;
  items: BonusItem[];
}

export const BONUSES: BonusCategory[] = [
  {
    title: "Difusión y Publicidad",
    emoji: "📣",
    items: [
      { detail: "Anuncios colaborativos en Instagram destacando tu empresa y tecnología", value: 300 },
      { detail: "Mención mensual en nuestras redes y newsletter (+10,000 suscriptores) como caso de éxito", value: 200 },
      { detail: "Proyecto destacado en la sección Comunidad de LisualPro por 6 meses", value: 200 },
      { detail: "Acceso directo a proveedores y contratistas aliados", value: 200 },
    ],
  },
  {
    title: "Contenido Audiovisual",
    emoji: "🎬",
    items: [
      { detail: "Edición final del material capturado", value: 200 },
      { detail: "Página web exclusiva de tu obra para compartir avances", value: 200 },
      { detail: "Ediciones mensuales de timelapse", value: 100 },
    ],
  },
  {
    title: "Software, Soporte y Herramientas",
    emoji: "🛠",
    items: [
      { detail: "Acceso a cursos, masterclass y ebooks para escalar tu empresa", value: 200 },
      { detail: "Soporte en vivo por videollamada y reuniones semanales con el director de operaciones", value: 100 },
      { detail: "Acceso a contactos estratégicos para fortalecer tu equipo de ventas y marketing", value: 100 },
    ],
  },
  {
    title: "Garantía Instantánea",
    emoji: "🛡",
    items: [
      { detail: "Si no estás satisfecho con el servicio en los primeros 30 días, te devolvemos el 100% del pago realizado", value: 0 },
    ],
  },
];

export function calcBonusTotal(): number {
  return BONUSES.reduce(
    (sum, cat) => sum + cat.items.reduce((s, i) => s + i.value, 0),
    0,
  );
}

export const TERMS = {
  excludes: [
    "Precios sin I.V.A. — Expresados en Dólares Americanos.",
    "Impuestos provinciales, retención de IVA, ganancias, ni ningún otro régimen.",
    "Solo aceptamos cheque a la orden, y se cobra el 1.2% más por el impuesto al cheque.",
  ],
  conditions: [
    "Al terminar el ciclo contratado es OPTATIVO renovar la licencia.",
    "Si decides no renovar, el sistema sigue funcionando localmente para seguridad, pero deja de subir el contenido a nuestro software LisualPro.",
  ],
};

// ─── Closing Page (Página 3 — Cierre comercial) ─────────────────────────────

export const CLOSING_PAGE = {
  title: "¿Por qué elegir Lisual puede cambiar tus próximas obras?",
  subtitle: "Hoy no estás evaluando una cámara. Estás evaluando si tu empresa sigue operando de forma tradicional o si incorpora un sistema integrado que conecta operación, marketing y ventas en un solo ecosistema.",
  stats: [
    { value: "1.500+", label: "Obras activas" },
    { value: "18", label: "Países" },
    { value: "321", label: "Ventas generadas para clientes" },
    { value: "4.9/5", label: "Calificación" },
  ],
  sections: [
    {
      icon: "👁",
      title: "Con Lisual, dejás de depender del modelo tradicional",
      columns: {
        left: {
          heading: "Sin Lisual:",
          items: [
            "Dependés de visitas presenciales y traslados",
            "Dependés de terceros, llamados y reportes manuales",
            "No tenés evidencia cuando surge un conflicto",
            "No generás contenido mientras la obra avanza",
          ],
        },
        right: {
          heading: "Con Lisual:",
          items: [
            "Ves todas tus obras en tiempo real, desde cualquier lugar",
            "Documentás automáticamente cada avance sin esfuerzo",
            "Tenés evidencia profesional para clientes e inversores",
            "Generás stories, reels y timelapse sin contratar productora",
          ],
        },
      },
      closing: "No es comodidad. Es control real sobre tus obras.",
    },
    {
      icon: "💰",
      title: "Con solo 2 o 3 servicios ya superás el costo de Lisual",
      costComparison: {
        intro: "Escenario mínimo realista — lo que una PyME ya gasta hoy:",
        items: [
          { service: "Community Manager freelance", range: "500 – 800" },
          { service: "Editor de video part-time", range: "400 – 700" },
          { service: "Publicidad básica mensual", range: "500 – 1.000" },
          { service: "Traslados extra a obra", range: "300 – 500" },
        ],
        monthlyTotal: "2.000 – 3.000",
        yearlyTotal: "24.000 – 36.000",
        note: "Y eso sin sumar CRM, diseño web, agencia, serenos ni relevos aéreos.",
      },
      closing: "Lisual integra todo esto en un solo sistema. Menos proveedores, menos fricción, una sola inversión.",
    },
    {
      icon: "📈",
      title: "Lisual escala con tu empresa sin aumentar la estructura",
      columns: {
        left: {
          heading: "Crecimiento tradicional:",
          items: [
            "Más obras → más personal → más costo fijo",
            "Más control manual → más reuniones → más caos",
            "6 meses adaptando cada persona nueva",
          ],
        },
        right: {
          heading: "Crecimiento con Lisual:",
          items: [
            "Más obras → mismo equipo → más control",
            "+170% productividad comprobada",
            "+30 horas semanales ahorradas en traslados",
          ],
        },
      },
      closing: "Las personas aumentan el gasto fijo. Lisual aumenta tu capacidad sin aumentar el caos.",
    },
    {
      icon: "🤝",
      title: "1 de cada 3 clientes de Lisual genera nuevos proyectos por referidos",
      bullets: [
        "La transparencia genera confianza — cuando el cliente ve, deja de dudar",
        "Una obra visible reduce objeciones y acelera decisiones de compra",
        "Tu empresa se posiciona por encima de quien solo promete sin mostrar",
        "Los referidos llegan sin invertir en publicidad adicional",
      ],
      closing: "No necesitás contratar una agencia de marketing. Una obra visible vende sola.",
    },
    {
      icon: "🔒",
      title: "Tu inversión en Lisual es patrimonial, no un gasto que se evapora",
      bullets: [
        "La cámara es tuya para siempre — es hardware, no alquiler",
        "Activás la licencia solo cuando la usás, la movés de obra en obra",
        "Si dejás de pagar software, la cámara sigue funcionando para seguridad",
        "Garantía: 30 días para probar. Si no estás satisfecho, devolución 100%",
      ],
      closing: "No es un gasto mensual que desaparece. Es un activo que se divide entre todas tus obras futuras.",
    },
  ],
  ecosystem: {
    title: "Todo incluido en el ecosistema Lisual",
    items: [
      "Stories y Reels automáticos",
      "Reportes con Inteligencia Artificial",
      "Página web exclusiva de la obra",
      "Video en vivo 24/7 + grabaciones",
      "CRM + Nurturing de leads",
      "Timelapse en tiempo real",
      "Alertas inteligentes",
      "Ediciones diarias profesionales",
    ],
    installNote: "Instalación en 5–15 min. No requiere WiFi, electricidad ni personal capacitado.",
  },
  strategicClose: {
    title: "La pregunta no es si necesitás una cámara",
    text: "Si vas a seguir construyendo los próximos 10 años… ¿vas a dividir esta inversión por una sola obra o por todas las que vienen?",
    emphasis: "Lisual no se agota en un proyecto. Se convierte en parte de la estructura de tu empresa. Conecta operación, marketing y ventas en una sola decisión.",
  },
  proof: {
    title: "Mirá los resultados con tus propios ojos",
    subtitle: "Proyectos reales de clientes que ya usan Lisual",
    cases: [
      {
        name: "Torres del Parque",
        type: "Desarrollo inmobiliario",
        result: "+35% en consultas desde que publicaron el timelapse en redes",
        timelapseUrl: "https://lisual.com/timelapse/torres-del-parque",
      },
      {
        name: "BD Constructora",
        type: "Constructora - Obras civiles",
        result: "3 nuevos proyectos cerrados por referidos directos de inversores",
        timelapseUrl: "https://lisual.com/timelapse/bd-constructora",
      },
      {
        name: "Estudio MG Arquitectura",
        type: "Estudio de arquitectura",
        result: "Eliminaron 100% de traslados semanales de control con monitoreo remoto",
        timelapseUrl: "https://lisual.com/timelapse/mg-arquitectura",
      },
    ],
    links: [
      { label: "Ver todos los Timelapses", url: "https://lisual.com/timelapses", icon: "▶" },
      { label: "Webinar completo", url: "https://lisual.com/webinar", icon: "🎥" },
      { label: "Comunidad Lisual", url: "https://lisual.com/comunidad", icon: "👥" },
    ],
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const IVA_PCT = 21;

export function calcQuoteTotals(
  cam: CameraOption,
  license: LicenseOption,
  plan: PlanOption,
  options?: { includeIva?: boolean; discountPct?: number },
) {
  const camCost = cam.totalPrice;
  const licenseCost = license.price;
  const planYearlyCost = plan.monthlyPerCam * cam.quantity * 12;

  const subtotal = camCost + licenseCost + planYearlyCost;

  const discountPct = options?.discountPct ?? 0;
  const discountAmount = subtotal * (discountPct / 100);
  const afterDiscount = subtotal - discountAmount;

  const includeIva = options?.includeIva ?? false;
  const ivaAmount = includeIva ? afterDiscount * (IVA_PCT / 100) : 0;

  const globalTotal = afterDiscount + ivaAmount;
  const monthlyAvg = globalTotal / 12;
  const dailyAvg = globalTotal / 365;
  const dailyPerCam = dailyAvg / cam.quantity;

  return {
    camCost,
    licenseCost,
    planYearlyCost,
    planMonthlyPerCam: plan.monthlyPerCam,
    subtotal,
    discountPct,
    discountAmount,
    afterDiscount,
    includeIva,
    ivaAmount,
    globalTotal,
    monthlyAvg,
    dailyAvg,
    dailyPerCam,
  };
}
