import { wrapInLayout, BRAND } from "./base-layout.ts";

type NotificationType =
  | "presupuesto_por_vencer"
  | "instalacion_proxima"
  | "revision_pendiente"
  | "general";

interface NotificacionEmailData {
  type: NotificationType;
  title: string;
  message: string;
  details?: { label: string; value: string }[];
  actionUrl?: string;
  actionLabel?: string;
}

const ICONS: Record<NotificationType, string> = {
  presupuesto_por_vencer: "⏰",
  instalacion_proxima: "🔧",
  revision_pendiente: "📋",
  general: "🔔",
};

const COLORS: Record<NotificationType, { bg: string; border: string; text: string }> = {
  presupuesto_por_vencer: { bg: "#fef2f2", border: "#fecaca", text: "#991b1b" },
  instalacion_proxima: { bg: "#eff6ff", border: "#bfdbfe", text: "#1e3a8a" },
  revision_pendiente: { bg: "#fffbeb", border: "#fde68a", text: "#92400e" },
  general: { bg: "#f8fafc", border: "#e2e8f0", text: "#334155" },
};

export function renderNotificacionEmail(data: NotificacionEmailData): { subject: string; html: string } {
  const subject = `${ICONS[data.type] ?? "🔔"} ${data.title} | ${BRAND.name}`;
  const colors = COLORS[data.type] ?? COLORS.general;

  const detailRows = (data.details ?? [])
    .map(
      (d) => `
      <tr>
        <td style="padding:6px 0;font-size:12px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;width:120px;vertical-align:top">${d.label}</td>
        <td style="padding:6px 0;font-size:13px;color:#1e293b;font-weight:600">${d.value}</td>
      </tr>`
    )
    .join("");

  const body = `
    <!-- Alert box -->
    <div style="background:${colors.bg};border:1px solid ${colors.border};border-left:4px solid ${colors.text};border-radius:0 10px 10px 0;padding:16px 20px;margin-bottom:24px">
      <div style="font-size:20px;margin-bottom:6px">${ICONS[data.type] ?? "🔔"}</div>
      <h2 style="font-size:16px;font-weight:800;color:${colors.text};margin:0 0 6px">${data.title}</h2>
      <p style="font-size:14px;color:#475569;line-height:1.6;margin:0">${data.message}</p>
    </div>

    ${detailRows ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      ${detailRows}
    </table>
    ` : ""}

    ${data.actionUrl ? `
    <div style="text-align:center;margin-bottom:16px">
      <a href="${data.actionUrl}" style="display:inline-block;padding:12px 28px;background:${BRAND.accentColor};color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;border-radius:8px">
        ${data.actionLabel ?? "Ver detalle"}
      </a>
    </div>
    ` : ""}

    <p style="font-size:12px;color:#94a3b8;text-align:center;margin:16px 0 0">
      Esta es una notificación automática del sistema ${BRAND.name}.
    </p>
  `;

  return { subject, html: wrapInLayout(body, data.title) };
}
