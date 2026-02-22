import type { CameraOption, LicenseOption, PlanOption } from "@/lib/config/lisual-products";
import {
  BONUSES, TERMS, QUOTE_DEFAULTS, CAMERA_SPECS, IVA_PCT, CLOSING_PAGE,
  calcQuoteTotals, calcBonusTotal,
} from "@/lib/config/lisual-products";

interface LeadInfo {
  nombre: string;
  empresa: string | null;
  email?: string;
  telefono?: string | null;
}

interface QuotePreviewProps {
  lead: LeadInfo | null;
  camera: CameraOption;
  license: LicenseOption;
  plan: PlanOption;
  fechaEmision: string;
  vigenciaHasta: string;
  numero: string;
  includeIva?: boolean;
  discountPct?: number;
  version?: number;
}

function usd(n: number) {
  return `U$D ${n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" });
}

export function QuotePreview({
  lead,
  camera,
  license,
  plan,
  fechaEmision,
  vigenciaHasta,
  numero,
  includeIva = false,
  discountPct = 0,
  version = 1,
}: QuotePreviewProps) {
  const totals = calcQuoteTotals(camera, license, plan, { includeIva, discountPct });
  const clientName = lead?.empresa || lead?.nombre || "Cliente a designar";
  const bonusTotal = calcBonusTotal();

  return (
    <div className="quote-preview-wrapper">
      {/* ─── PAGE 1 ─── */}
      <div className="quote-page">
        <div className="qp-watermark">{QUOTE_DEFAULTS.brandName}</div>
        <div className="qp-page-accent" />

        {/* Header */}
        <div className="qp-header">
          <div className="qp-header-brand">
            <img
              src={QUOTE_DEFAULTS.brandLogo}
              alt={QUOTE_DEFAULTS.brandName}
              className="qp-logo"
            />
            <div>
              <h1>{QUOTE_DEFAULTS.brandName}</h1>
              <p className="qp-tagline">{QUOTE_DEFAULTS.brandTagline}</p>
            </div>
          </div>
          <div className="qp-header-badge">
            COTIZACIÓN · v{version}
          </div>
        </div>

        <div className="qp-numero-bar">
          <span>N.° {numero || "—"}</span>
          {version > 1 && <span className="qp-revision-tag">Revisión {version}</span>}
        </div>

        {/* Client info */}
        <div className="qp-client-card">
          <div className="qp-client-left">
            <div className="qp-client-section-label">DATOS DEL CLIENTE</div>
            <div className="qp-client-name">{clientName}</div>
            <div className="qp-client-detail">
              <span className="qp-label">Contacto:</span> {lead?.nombre || "—"}
            </div>
            {lead?.telefono && (
              <div className="qp-client-detail">
                <span className="qp-label">Tel:</span>{" "}
                <a href={`tel:${lead.telefono.replace(/\s/g, "")}`}>{lead.telefono}</a>
              </div>
            )}
            {lead?.email && (
              <div className="qp-client-detail">
                <span className="qp-label">Email:</span>{" "}
                <a href={`mailto:${lead.email}`}>{lead.email}</a>
              </div>
            )}
          </div>
          <div className="qp-client-right">
            <div className="qp-client-meta">
              <span className="qp-label">Fecha de emisión</span>
              <strong>{formatDate(fechaEmision)}</strong>
            </div>
            <div className="qp-client-meta">
              <span className="qp-label">Válido hasta</span>
              <strong>{formatDate(vigenciaHasta)}</strong>
            </div>
            <div className="qp-client-meta">
              <span className="qp-label">Moneda</span>
              <strong>U$D (Dólar Americano)</strong>
            </div>
          </div>
        </div>

        {/* Proposal */}
        <h2 className="qp-section-title">
          <span className="qp-section-icon">📋</span>
          ¿Qué incluye la propuesta?
        </h2>
        <ul className="qp-list">
          <li>
            <strong>{camera.quantity} Cámara(s) 4K 4G PTZ:</strong> Propiedad del cliente para
            siempre. Calidad 4K — 8MPX, Visión Nocturna, Alimentación Solar compatible.
          </li>
          <li>
            <strong>Plataforma LisualPro:</strong> Software de Time Lapse durante 12 meses.
          </li>
          <li>
            <strong>{license.name}</strong> (hasta {license.maxCams} cámaras).
          </li>
          <li>
            <strong>{plan.name}:</strong>{" "}
            {plan.monthlyPerCam === 0
              ? "Sin costo mensual de suscripción."
              : `${usd(plan.monthlyPerCam)}/mes por cámara con acceso a la plataforma.`}
          </li>
        </ul>

        {/* Camera specs */}
        <h2 className="qp-section-title">
          <span className="qp-section-icon">📷</span>
          Especificaciones del Equipo
        </h2>
        <div className="qp-equipment-layout">
          <div className="qp-equipment-image">
            <img src={CAMERA_SPECS.image} alt="Cámara 4K PTZ Solar" />
          </div>
          <div className="qp-equipment-specs">
            {CAMERA_SPECS.features.map((spec, i) => (
              <div key={i} className="qp-spec-item">
                <span className="qp-spec-check">✓</span> {spec}
              </div>
            ))}
          </div>
        </div>
        <p className="qp-datasheet-link">
          <a href={CAMERA_SPECS.datasheetUrl} target="_blank" rel="noopener noreferrer">
            📄 {CAMERA_SPECS.datasheetLabel}
          </a>
        </p>

        {/* Pricing table */}
        <h2 className="qp-section-title">
          <span className="qp-section-icon">💰</span>
          Desglose de Inversión
        </h2>
        <table className="qp-table">
          <thead>
            <tr>
              <th>Concepto</th>
              <th>Detalle</th>
              <th className="qp-text-right">Subtotal (U$D)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Equipamiento (Cámaras)</td>
              <td>
                {camera.label}
                {camera.discountPct > 0 && (
                  <span className="qp-badge-discount">−{camera.discountPct}%</span>
                )}
              </td>
              <td className="qp-text-right qp-mono">{usd(totals.camCost)}</td>
            </tr>
            <tr>
              <td>Licencia Anual</td>
              <td>{license.name} (hasta {license.maxCams} cams)</td>
              <td className="qp-text-right qp-mono">{usd(totals.licenseCost)}</td>
            </tr>
            <tr>
              <td>Suscripción (Anualizada)</td>
              <td>
                {plan.name}{" "}
                {totals.planMonthlyPerCam > 0
                  ? `(${usd(totals.planMonthlyPerCam)} × ${camera.quantity} cams × 12 meses)`
                  : "(incluido)"}
              </td>
              <td className="qp-text-right qp-mono">{usd(totals.planYearlyCost)}</td>
            </tr>
          </tbody>
        </table>

        {/* Totals box */}
        <div className="qp-totals-box">
          {(discountPct > 0 || includeIva) && (
            <div className="qp-total-row">
              <span>Subtotal:</span>
              <span className="qp-mono">{usd(totals.subtotal)}</span>
            </div>
          )}
          {discountPct > 0 && (
            <div className="qp-total-row qp-discount-row">
              <span>Descuento ({discountPct}%):</span>
              <span className="qp-mono">−{usd(totals.discountAmount)}</span>
            </div>
          )}
          {includeIva && (
            <div className="qp-total-row">
              <span>I.V.A. ({IVA_PCT}%):</span>
              <span className="qp-mono">{usd(totals.ivaAmount)}</span>
            </div>
          )}
          <div className="qp-total-row qp-total-highlight">
            <span>INVERSIÓN TOTAL (1er Año){includeIva ? " · IVA incluido" : ""}:</span>
            <span>{usd(totals.globalTotal)}</span>
          </div>
          <div className="qp-totals-secondary">
            <div>
              <span className="qp-totals-sec-label">Mensual</span>
              <span className="qp-totals-sec-value">{usd(totals.monthlyAvg)}</span>
            </div>
            <div className="qp-totals-divider" />
            <div>
              <span className="qp-totals-sec-label">Diario / cámara</span>
              <span className="qp-totals-sec-value qp-green">{usd(totals.dailyPerCam)}</span>
            </div>
          </div>
        </div>

        {/* Footer page 1 */}
        <div className="qp-footer">
          <div className="qp-footer-line" />
          <div className="qp-footer-content">
            <span>{QUOTE_DEFAULTS.footerLine1}</span>
            <span className="qp-footer-page">Página 1 de 3</span>
          </div>
        </div>
      </div>

      {/* ─── PAGE 2 ─── */}
      <div className="quote-page">
        <div className="qp-watermark">{QUOTE_DEFAULTS.brandName}</div>
        <div className="qp-page-accent" />

        {/* Mini header page 2 */}
        <div className="qp-header-mini">
          <img src={QUOTE_DEFAULTS.brandLogo} alt="" className="qp-logo-mini" />
          <div>
            <strong>{QUOTE_DEFAULTS.brandName}</strong>
            <span className="qp-header-mini-sep">|</span>
            <span>Presupuesto {numero}</span>
          </div>
        </div>

        <h2 className="qp-section-title">
          <span className="qp-section-icon">🎁</span>
          Bonus de la Oferta — Invertimos en vos
        </h2>

        {BONUSES.map((cat) => (
          <div key={cat.title} className="qp-bonus-category">
            <h3 className="qp-bonus-title">
              {cat.emoji} {cat.title}
            </h3>
            {cat.items.map((item, i) => (
              <div key={i} className="qp-bonus-line">
                {item.value > 0 ? (
                  <span className="qp-bonus-value">${item.value} USD</span>
                ) : (
                  <span className="qp-bonus-value qp-bonus-free">INCLUIDO</span>
                )}
                <span className="qp-bonus-arrow">→</span>
                <span>{item.detail}</span>
              </div>
            ))}
          </div>
        ))}

        <div className="qp-bonus-total-box">
          <div>
            <div className="qp-bonus-total-label">Valor total de bonificaciones incluidas</div>
            <div className="qp-bonus-total-sub">Inversión que hacemos en tu proyecto sin costo adicional</div>
          </div>
          <strong>{usd(bonusTotal)}</strong>
        </div>

        <h2 className="qp-section-title">
          <span className="qp-section-icon">⚖️</span>
          Aclaraciones Administrativas
        </h2>
        <div className="qp-admin-box">
          <strong>El valor {includeIva ? "incluye" : "NO incluye"}:</strong>
          <ul className="qp-list">
            {TERMS.excludes.map((t, i) => {
              if (i === 0 && includeIva) {
                return <li key={i}>Precios con I.V.A. ({IVA_PCT}%) incluido — Expresados en Dólares Americanos.</li>;
              }
              return <li key={i}>{t}</li>;
            })}
          </ul>
          <br />
          <strong>Términos del Servicio:</strong>
          <ul className="qp-list">
            {TERMS.conditions.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>

        {/* Contact box */}
        <div className="qp-contact-box">
          <h3 className="qp-contact-heading">¿Hablamos?</h3>
          <div className="qp-contact-grid">
            <div>
              <span className="qp-contact-label">Contacto</span>
              <strong>{QUOTE_DEFAULTS.contact.name}</strong>
              <br />
              <span className="qp-contact-label">Cargo</span>
              {QUOTE_DEFAULTS.contact.role}
              <br />
              <span className="qp-contact-label">Web</span>
              <a href={QUOTE_DEFAULTS.contact.website} target="_blank" rel="noopener noreferrer">
                {QUOTE_DEFAULTS.contact.website.replace("https://", "")}
              </a>
            </div>
            <div>
              <span className="qp-contact-label">Email</span>
              <a href={`mailto:${QUOTE_DEFAULTS.contact.email}`}>{QUOTE_DEFAULTS.contact.email}</a>
              <br />
              <span className="qp-contact-label">Teléfono</span>
              <a href={`tel:${QUOTE_DEFAULTS.contact.phone.replace(/\s/g, "")}`}>{QUOTE_DEFAULTS.contact.phone}</a>
            </div>
          </div>
          <a
            href={QUOTE_DEFAULTS.contact.meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="qp-meeting-btn"
          >
            📅 Agendá una reunión conmigo
          </a>
        </div>

        {/* Footer page 2 */}
        <div className="qp-footer">
          <div className="qp-footer-line" />
          <div className="qp-footer-content">
            <span>{QUOTE_DEFAULTS.footerLine2}</span>
            <span className="qp-footer-page">Página 2 de 3</span>
          </div>
        </div>
      </div>

      {/* ─── PAGE 3 — CIERRE COMERCIAL ─── */}
      <div className="quote-page qp-closing-page">
        <div className="qp-watermark">{QUOTE_DEFAULTS.brandName}</div>
        <div className="qp-page-accent" />

        {/* Mini header */}
        <div className="qp-header-mini">
          <img src={QUOTE_DEFAULTS.brandLogo} alt="" className="qp-logo-mini" />
          <div>
            <strong>{QUOTE_DEFAULTS.brandName}</strong>
            <span className="qp-header-mini-sep">|</span>
            <span>Presupuesto {numero}</span>
          </div>
        </div>

        {/* Hero */}
        <div className="qp-closing-hero">
          <h2 className="qp-closing-title">{CLOSING_PAGE.title}</h2>
          <p className="qp-closing-subtitle">{CLOSING_PAGE.subtitle}</p>
        </div>

        {/* Social proof stats */}
        <div className="qp-stats-bar">
          {CLOSING_PAGE.stats.map((s, i) => (
            <div key={i} className="qp-stat">
              <span className="qp-stat-value">{s.value}</span>
              <span className="qp-stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Sections */}
        <div className="qp-closing-sections">
          {CLOSING_PAGE.sections.map((section, idx) => (
            <div key={idx} className="qp-closing-section">
              <div className="qp-closing-section-header">
                <span className="qp-closing-num">{idx + 1}</span>
                <span className="qp-closing-section-icon">{section.icon}</span>
                <h3 className="qp-closing-section-title">{section.title}</h3>
              </div>

              {"costComparison" in section && section.costComparison ? (
                <div className="qp-cost-comparison">
                  <p className="qp-cost-intro">{section.costComparison.intro}</p>
                  <table className="qp-cost-table">
                    <tbody>
                      {section.costComparison.items.map((item, i) => (
                        <tr key={i}>
                          <td>{item.service}</td>
                          <td className="qp-cost-range">U$D {item.range}/mes</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="qp-cost-total-row">
                        <td>Total mensual estimado</td>
                        <td className="qp-cost-range">U$D {section.costComparison.monthlyTotal}/mes</td>
                      </tr>
                      <tr className="qp-cost-yearly-row">
                        <td>Acumulado en 12 meses</td>
                        <td className="qp-cost-range">U$D {section.costComparison.yearlyTotal}/año</td>
                      </tr>
                    </tfoot>
                  </table>
                  <p className="qp-cost-note">{section.costComparison.note}</p>
                </div>
              ) : "columns" in section && section.columns ? (
                <div className="qp-closing-columns">
                  <div className="qp-closing-col qp-closing-col-before">
                    <span className="qp-closing-col-heading">{section.columns.left.heading}</span>
                    <ul>
                      {section.columns.left.items.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="qp-closing-col qp-closing-col-after">
                    <span className="qp-closing-col-heading">{section.columns.right.heading}</span>
                    <ul>
                      {section.columns.right.items.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : "bullets" in section && section.bullets ? (
                <ul className="qp-closing-bullets">
                  {section.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              ) : null}

              {section.closing && (
                <p className="qp-closing-emphasis">{section.closing}</p>
              )}
            </div>
          ))}
        </div>

        {/* Ecosystem */}
        <div className="qp-ecosystem-box">
          <h3 className="qp-ecosystem-title">🚀 {CLOSING_PAGE.ecosystem.title}</h3>
          <div className="qp-ecosystem-grid">
            {CLOSING_PAGE.ecosystem.items.map((item, i) => (
              <div key={i} className="qp-ecosystem-item">
                <span className="qp-ecosystem-check">✓</span> {item}
              </div>
            ))}
          </div>
          <p className="qp-ecosystem-note">{CLOSING_PAGE.ecosystem.installNote}</p>
        </div>

        {/* Strategic close */}
        <div className="qp-strategic-close">
          <div className="qp-strategic-icon">🎯</div>
          <div>
            <h3 className="qp-strategic-title">{CLOSING_PAGE.strategicClose.title}</h3>
            <p className="qp-strategic-text">{CLOSING_PAGE.strategicClose.text}</p>
            <p className="qp-strategic-emphasis">{CLOSING_PAGE.strategicClose.emphasis}</p>
          </div>
        </div>

        {/* Proof — Cases & Timelapses */}
        <div className="qp-proof-section">
          <div className="qp-proof-header">
            <h3 className="qp-proof-title">🎬 {CLOSING_PAGE.proof.title}</h3>
            <p className="qp-proof-subtitle">{CLOSING_PAGE.proof.subtitle}</p>
          </div>

          <div className="qp-proof-cases">
            {CLOSING_PAGE.proof.cases.map((cs, i) => (
              <a
                key={i}
                href={cs.timelapseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="qp-proof-card"
              >
                <div className="qp-proof-card-top">
                  <span className="qp-proof-play">▶</span>
                  <div>
                    <strong className="qp-proof-card-name">{cs.name}</strong>
                    <span className="qp-proof-card-type">{cs.type}</span>
                  </div>
                </div>
                <p className="qp-proof-card-result">"{cs.result}"</p>
                <span className="qp-proof-card-cta">Ver Timelapse →</span>
              </a>
            ))}
          </div>

          <div className="qp-proof-links">
            {CLOSING_PAGE.proof.links.map((link, i) => (
              <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="qp-proof-link">
                <span className="qp-proof-link-icon">{link.icon}</span> {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Footer page 3 */}
        <div className="qp-footer">
          <div className="qp-footer-line" />
          <div className="qp-footer-content">
            <span>{QUOTE_DEFAULTS.footerLine2}</span>
            <span className="qp-footer-page">Página 3 de 3</span>
          </div>
        </div>
      </div>
    </div>
  );
}
