import { wrapInLayout, BRAND } from "./base-layout.ts";

interface PresupuestoEmailData {
  clientName: string;
  empresa?: string;
  numero: string;
  fechaEmision: string;
  vigenciaHasta: string;
  moneda: string;
  items: { descripcion: string; cantidad: number; precio_unitario: number }[];
  subtotal: number;
  impuestos: number;
  total: number;
}

function fmtCurrency(n: number, moneda: string): string {
  const symbol = moneda === "USD" ? "U$D" : "$";
  return `${symbol} ${n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function renderPresupuestoEmail(data: PresupuestoEmailData): { subject: string; html: string } {
  const subject = `Cotización ${data.numero} | ${BRAND.name} — ${data.clientName}`;

  const itemRows = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#334155">${item.descripcion}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;text-align:center">${item.cantidad}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#334155;text-align:right;font-weight:600">${fmtCurrency(item.cantidad * item.precio_unitario, data.moneda)}</td>
      </tr>`
    )
    .join("");

  const body = `
    <p style="font-size:15px;color:#1e293b;margin:0 0 6px">
      Hola <strong>${data.clientName}</strong>,
    </p>
    <p style="font-size:14px;color:#475569;line-height:1.6;margin:0 0 24px">
      Adjuntamos la cotización formal de nuestros servicios. A continuación encontrás un resumen de la propuesta:
    </p>

    <!-- Quote number badge -->
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:12px 16px;margin-bottom:20px;text-align:center">
      <span style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;font-weight:600">Cotización N.°</span><br>
      <strong style="font-size:16px;color:${BRAND.primaryColor};font-family:monospace;letter-spacing:0.5px">${data.numero}</strong>
    </div>

    <!-- Dates -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px">
      <tr>
        <td style="padding:8px 12px;background:#f8fafc;border-radius:6px 0 0 6px;border:1px solid #e2e8f0;border-right:none">
          <span style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;font-weight:600">Fecha de emisión</span><br>
          <strong style="font-size:13px;color:#1e293b">${data.fechaEmision}</strong>
        </td>
        <td style="padding:8px 12px;background:#f8fafc;border-radius:0 6px 6px 0;border:1px solid #e2e8f0;border-left:none">
          <span style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;font-weight:600">Válida hasta</span><br>
          <strong style="font-size:13px;color:#1e293b">${data.vigenciaHasta}</strong>
        </td>
      </tr>
    </table>

    <!-- Items table -->
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:20px">
      <thead>
        <tr style="background:${BRAND.primaryColor}">
          <th style="padding:10px 12px;font-size:11px;color:#ffffff;text-align:left;font-weight:700;text-transform:uppercase;letter-spacing:0.5px">Concepto</th>
          <th style="padding:10px 12px;font-size:11px;color:#ffffff;text-align:center;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;width:60px">Cant.</th>
          <th style="padding:10px 12px;font-size:11px;color:#ffffff;text-align:right;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;width:120px">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>

    <!-- Totals -->
    <div style="background:linear-gradient(135deg,#eff6ff 0%,#f0fdf4 100%);border:1px solid #bfdbfe;border-radius:10px;padding:20px;margin-bottom:24px">
      ${data.impuestos > 0 ? `
      <div style="display:flex;justify-content:space-between;font-size:13px;color:#475569;margin-bottom:6px">
        <span>Subtotal:</span>
        <span style="font-weight:600">${fmtCurrency(data.subtotal, data.moneda)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:13px;color:#475569;margin-bottom:10px;padding-bottom:10px;border-bottom:1px dashed #bfdbfe">
        <span>IVA (21%):</span>
        <span style="font-weight:600">${fmtCurrency(data.impuestos, data.moneda)}</span>
      </div>
      ` : ""}
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:14px;font-weight:700;color:${BRAND.primaryColor}">INVERSIÓN TOTAL (1er Año)${data.impuestos > 0 ? " · IVA incluido" : ""}</span>
        <span style="font-size:22px;font-weight:800;color:${BRAND.primaryColor}">${fmtCurrency(data.total, data.moneda)}</span>
      </div>
    </div>

    <p style="font-size:13px;color:#475569;line-height:1.6;margin:0 0 24px">
      Encontrás la cotización completa con todos los detalles en el <strong>PDF adjunto</strong>. Si tenés alguna consulta, no dudes en contactarnos.
    </p>

    <!-- CTA buttons -->
    <div style="text-align:center;margin-bottom:16px">
      <a href="${BRAND.meetingUrl}" class="btn" style="display:inline-block;padding:12px 28px;background:${BRAND.accentColor};color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;border-radius:8px">
        📅 Agendar una reunión
      </a>
    </div>
    <div style="text-align:center">
      <a href="mailto:${BRAND.contactEmail}" class="btn-outline" style="display:inline-block;padding:10px 24px;border:2px solid ${BRAND.primaryColor};color:${BRAND.primaryColor};font-size:13px;font-weight:700;text-decoration:none;border-radius:8px">
        Responder por email
      </a>
    </div>
  `;

  const preheader = `Cotización ${data.numero} — ${fmtCurrency(data.total, data.moneda)} | ${BRAND.name}`;

  return { subject, html: wrapInLayout(body, preheader) };
}
