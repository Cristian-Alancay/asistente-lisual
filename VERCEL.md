# Deploy en Vercel – Assistant Cristian Alancay

Proyecto **unificado en la raíz**: todo está en la raíz del repo, no hay subcarpeta. Vercel no requiere Root Directory.

---

## Deploy

1. Conectá el repo **assistant-cristian-alancay** a Vercel (si no está conectado).
2. Vercel detecta Next.js y usa `npm run build` en la raíz.
3. **No configures Root Directory** (dejalo vacío o por defecto).

---

## Variables de entorno

En **Settings → Environment Variables** agregá:

| Variable | Obligatorio | Descripción |
|----------|-------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Sí | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sí | Anon key de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Sí | Para cron y agente |
| `OPENAI_API_KEY` | Sí | Para chat y agente |
| `ALLOWED_USER_EMAILS` | Opcional | Emails autorizados (coma) |
| `EVOLUTION_API_URL` | Opcional | Para WhatsApp |
| `EVOLUTION_API_KEY` | Opcional | Para WhatsApp |
| `EVOLUTION_INSTANCE` | Opcional | Para WhatsApp |
| `CRON_SECRET` | Opcional | Proteger `/api/cron/seguimientos` |

Referencia: `.env.example`

---

## Verificación local

```bash
npm run vercel:check   # Estructura
npm run vercel:test    # Check + build
npm run test:all       # Check + tests + build
```

---

## Estructura (raíz única)

```
assistant-cristian-alancay/
├── src/
│   └── app/
├── public/
├── package.json
├── next.config.ts
├── vercel.json
├── .env.example
├── scripts/
│   └── vercel-check.js
└── VERCEL.md
```
