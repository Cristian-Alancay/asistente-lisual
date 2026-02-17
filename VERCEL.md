# Deploy en Vercel

## Configuración obligatoria

El frontend Next.js está en la carpeta **`lisual-assistant`**, no en la raíz del repo.

Para evitar **404: NOT FOUND** en el deploy:

1. Entrá a [Vercel Dashboard](https://vercel.com/dashboard) → tu proyecto.
2. **Settings** → **General**.
3. En **Root Directory**:
   - Activá **Override**.
   - Escribí: `lisual-assistant`.
4. Guardá (**Save**).
5. Hacé un **Redeploy** (Deployments → ⋮ en el último → Redeploy).

Después de eso, Vercel va a instalar dependencias y hacer build desde `lisual-assistant`, y la app debería responder en la URL del proyecto.

## Variables de entorno

En **Settings → Environment Variables** agregá (mismo valor que en `.env.local`):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Para producción podés usar las mismas o un proyecto de Supabase distinto.
