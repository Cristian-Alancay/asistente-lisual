const BRAND = {
  name: "LISUAL",
  tagline: "Software de Marketing para Obras de Construcción",
  logoUrl: "https://lisual.com/wp-content/uploads/elementor/thumbs/logo_color-re-olnsbqic37u3ix1zizzpmeac2o5fdim50i6vetu69o.png",
  primaryColor: "#1e3a8a",
  accentColor: "#3b82f6",
  website: "https://lisual.com",
  contactEmail: "Cristian.alancay@lisual.com",
  contactPhone: "+54 9 11 3253-6065",
  contactName: "Cristian Alancay",
  contactRole: "Managing Director",
  meetingUrl: "https://calendly.com/cristian-alancay",
};

export function wrapInLayout(bodyHtml: string, preheader = ""): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>${BRAND.name}</title>
${preheader ? `<span style="display:none!important;font-size:0;line-height:0;max-height:0;max-width:0;mso-hide:all;overflow:hidden">${preheader}</span>` : ""}
<style>
  body{margin:0;padding:0;background:#f4f5f7;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased}
  .wrapper{width:100%;background:#f4f5f7;padding:24px 0}
  .container{max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06)}
  .header{background:linear-gradient(135deg,${BRAND.primaryColor} 0%,#1e40af 100%);padding:28px 32px;text-align:center}
  .header img{height:40px;margin-bottom:8px}
  .header h1{color:#ffffff;font-size:18px;font-weight:800;margin:0;letter-spacing:1.5px;text-transform:uppercase}
  .header p{color:rgba(255,255,255,0.75);font-size:11px;margin:4px 0 0;letter-spacing:0.5px}
  .body{padding:32px}
  .footer{background:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 32px;text-align:center}
  .footer-links{margin-bottom:12px}
  .footer-links a{display:inline-block;margin:0 8px;color:${BRAND.accentColor};font-size:12px;font-weight:600;text-decoration:none}
  .footer-contact{font-size:11px;color:#94a3b8;line-height:1.6}
  .footer-contact a{color:#64748b;text-decoration:none}
  .footer-brand{margin-top:12px;font-size:10px;color:#cbd5e1;letter-spacing:0.3px}
  .btn{display:inline-block;padding:12px 28px;background:${BRAND.accentColor};color:#ffffff!important;font-size:14px;font-weight:700;text-decoration:none;border-radius:8px;text-align:center}
  .btn-outline{display:inline-block;padding:10px 24px;border:2px solid ${BRAND.primaryColor};color:${BRAND.primaryColor}!important;font-size:13px;font-weight:700;text-decoration:none;border-radius:8px;text-align:center}
  @media only screen and (max-width:640px){.container{margin:0 12px!important;border-radius:8px!important}.body{padding:20px!important}.header{padding:20px!important}}
</style>
</head>
<body>
<div class="wrapper">
  <div class="container">
    <div class="header">
      <img src="${BRAND.logoUrl}" alt="${BRAND.name}" />
      <h1>${BRAND.name}</h1>
      <p>${BRAND.tagline}</p>
    </div>
    <div class="body">
      ${bodyHtml}
    </div>
    <div class="footer">
      <div class="footer-links">
        <a href="${BRAND.website}" target="_blank">Sitio Web</a>
        <a href="${BRAND.meetingUrl}" target="_blank">Agendar Reunión</a>
      </div>
      <div class="footer-contact">
        <strong>${BRAND.contactName}</strong> · ${BRAND.contactRole}<br>
        <a href="mailto:${BRAND.contactEmail}">${BRAND.contactEmail}</a> · 
        <a href="tel:${BRAND.contactPhone.replace(/\s/g, "")}">${BRAND.contactPhone}</a>
      </div>
      <div class="footer-brand">
        Conectamos a las personas con sus proyectos — ${BRAND.name}, Todos los derechos reservados
      </div>
    </div>
  </div>
</div>
</body>
</html>`;
}

export { BRAND };
