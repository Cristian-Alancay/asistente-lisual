# Deploy en Vercel – Asistente Lisual

## Causa del 404 NOT FOUND

El frontend Next.js está en la carpeta **`lisual-assistant`**, no en la raíz del repo.  
Si Vercel construye desde la raíz del repo, no encuentra `package.json` ni la app → **404 NOT FOUND**.

---

## Solución (obligatoria)

### 1. Configurar Root Directory en Vercel

1. Entrá a [Vercel Dashboard](https://vercel.com/dashboard) → proyecto **asistente-lisual**
2. **Settings** → **General**
3. En **Root Directory**:
   - Activá **Override**
   - Escribí: `lisual-assistant` (sin barra final)
4. **Save**
5. **Redeploy**: Deployments → ⋮ del último deployment → **Redeploy**

### 2. Variables de entorno

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

Referencia: `lisual-assistant/.env.example`

---

## Verificación local antes de deploy

```bash
# Verificar estructura y requisitos
npm run vercel:check

# Build completo (simula Vercel)
npm run vercel:test
```

---

## Troubleshooting

### Sigue apareciendo 404

- Confirmá que **Root Directory** = `lisual-assistant` (sin `/` final)
- Hacé un **Redeploy** después de cambiar la configuración
- Revisá los **Build Logs** en Vercel: si el build falla, el deploy puede quedar roto

### Build falla en Vercel

- Revisá que todas las variables de entorno obligatorias estén configuradas
- Probá el build local: `cd lisual-assistant && npm run build`
- Revisá errores de TypeScript o dependencias en los logs

### Cache 404

- En Vercel: **Deployments** → **Redeploy** con **Clear Cache**

---

## Estructura del proyecto

```
asistente-lisual/
├── lisual-assistant/       ← Root Directory en Vercel
│   ├── package.json
│   ├── next.config.ts
│   ├── vercel.json
│   └── src/
│       └── app/
├── scripts/
│   └── vercel-check.js
├── package.json            ← Scripts raíz (dev, build, vercel:check)
└── VERCEL.md
```
