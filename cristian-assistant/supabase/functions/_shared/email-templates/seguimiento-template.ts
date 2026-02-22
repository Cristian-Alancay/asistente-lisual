import { wrapInLayout, BRAND } from "./base-layout.ts";

interface SeguimientoEmailData {
  clientName: string;
  tipo: "d3" | "d7" | "pre_vencimiento";
  numero: string;
  total: number;
  moneda: string;
  vigenciaHasta: string;
}

const COPY: Record<string, { greeting: string; body: string; cta: string }> = {
  d3: {
    greeting: "¿Cómo estás?",
    body: "Hace unos días te enviamos la cotización <strong>{{numero}}</strong>. Queríamos saber si tuviste la oportunidad de revisarla y si tenés alguna consulta que podamos resolver.",
    cta: "Estamos a disposición para cualquier duda. Podés agendar una llamada rápida o responder este email directamente.",
  },
  d7: {
    greeting: "¿Cómo estás?",
    body: "Hace una semana te compartimos la cotización <strong>{{numero}}</strong> por <strong>{{total}}</strong>. Queremos asegurarnos de que tengas toda la información necesaria para tomar la mejor decisión.",
    cta: "Si querés que revisemos juntos la propuesta o que la ajustemos, estamos para ayudarte.",
  },
  pre_vencimiento: {
    greeting: "Un recordatorio importante:",
    body: "Tu cotización <strong>{{numero}}</strong> tiene vigencia hasta el <strong>{{vigencia}}</strong>. Después de esa fecha, las condiciones y precios podrían cambiar.",
    cta: "Si estás listo para avanzar o necesitás una extensión, contactanos antes del vencimiento.",
  },
};

function fmtCurrency(n: number, moneda: string): string {
  const symbol = moneda === "USD" ? "U$D" : "$";
  return `${symbol} ${n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function renderSeguimientoEmail(data: SeguimientoEmailData): { subject: string; html: string } {
  const copy = COPY[data.tipo] ?? COPY.d3;

  const subjects: Record<string, string> = {
    d3: `Seguimiento: Cotización ${data.numero} | ${BRAND.name}`,
    d7: `¿Revisaste tu cotización ${data.numero}? | ${BRAND.name}`,
    pre_vencimiento: `Tu cotización ${data.numero} vence pronto | ${BRAND.name}`,
  };
  const subject = subjects[data.tipo] ?? subjects.d3;

  const bodyText = copy.body
    .replace("{{numero}}", data.numero)
    .replace("{{total}}", fmtCurrency(data.total, data.moneda))
    .replace("{{vigencia}}", data.vigenciaHasta);

  const isUrgent = data.tipo === "pre_vencimiento";

  const body = `
    <p style="font-size:15px;color:#1e293b;margin:0 0 6px">
      Hola <strong>${data.clientName}</strong>,
    </p>
    <p style="font-size:14px;color:#475569;line-height:1.6;margin:0 0 8px">
      ${copy.greeting}
    </p>
    <p style="font-size:14px;color:#475569;line-height:1.6;margin:0 0 20px">
      ${bodyText}
    </p>

    ${isUrgent ? `
    <div style="background:#fef2f2;border:1px solid #fecaca;border-left:4px solid #ef4444;border-radius:0 8px 8px 0;padding:14px 16px;margin-bottom:20px">
      <strong style="font-size:13px;color:#991b1b">⏰ Vigencia hasta: ${data.vigenciaHasta}</strong>
    </div>
    ` : ""}

    <p style="font-size:14px;color:#475569;line-height:1.6;margin:0 0 24px">
      ${copy.cta}
    </p>

    <div style="text-align:center;margin-bottom:16px">
      <a href="${BRAND.meetingUrl}" style="display:inline-block;padding:12px 28px;background:${isUrgent ? "#ef4444" : BRAND.accentColor};color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;border-radius:8px">
        ${isUrgent ? "Quiero avanzar" : "📅 Agendar una llamada"}
      </a>
    </div>
    <div style="text-align:center">
      <a href="mailto:${BRAND.contactEmail}" style="display:inline-block;padding:10px 24px;border:2px solid ${BRAND.primaryColor};color:${BRAND.primaryColor};font-size:13px;font-weight:700;text-decoration:none;border-radius:8px">
        Responder por email
      </a>
    </div>
  `;

  const preheader = data.tipo === "pre_vencimiento"
    ? `Tu cotización vence pronto — ${data.numero}`
    : `Seguimiento de cotización ${data.numero}`;

  return { subject, html: wrapInLayout(body, preheader) };
}
