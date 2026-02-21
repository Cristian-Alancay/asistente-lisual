# Auditoría de caché y buenas prácticas

**Fecha:** 2025-02  
**Objetivos:** seguridad, velocidad, consistencia.

---

## 1. Estado actual (pre-auditoría)

### 1.1 Next.js

| Área | Estado | Notas |
|------|--------|--------|
| `next.config` | Sin headers de caché ni seguridad | No hay `headers()`, ni `Cache-Control` para estáticos |
| Route Segment Config | Parcial | Solo `/api/dolar-oficial` usa `revalidate = 300` |
| `revalidatePath` | Correcto | Usado en server actions (personal, leads, operaciones, etc.) tras mutaciones |
| Fetch en servidor | Parcial | Dolar API usa `next: { revalidate: 300 }`; resto sin política explícita |

### 1.2 API Routes

| Ruta | Auth | Cache-Control | Riesgo |
|------|------|----------------|--------|
| `GET /api/dolar-oficial` | No (público) | `revalidate` 300 s | Bajo; cacheable |
| `GET /api/clientes` | No comprobado en ruta | Ninguno | **Alto** – datos sensibles, cacheable por CDN/navegador |
| `GET /api/leads` | No comprobado | Ninguno | **Alto** |
| `GET /api/proyectos` | No comprobado | Ninguno | **Alto** |
| `GET /api/chat/history` | Sí (Supabase user) | Ninguno | Medio; no cacheable |
| `POST /api/chat` | Implícito | N/A | OK |
| `GET /api/auth/deny` | N/A | N/A | OK |
| Webhooks/cron | Por clave/headers | N/A | Revisar por ruta |

**Problemas:** Rutas privadas (`/api/clientes`, `/api/leads`, etc.) no exigen sesión en el handler ni en middleware; respuestas sin `Cache-Control` (riesgo de caché de datos privados y de contenido obsoleto).

### 1.3 Middleware

- Ejecuta en todas las rutas salvo estáticos (`_next/static`, imágenes, favicon).
- Protege `/dashboard` y `/` (redirige a login si no hay usuario).
- **No** trata `/api/*`: una petición directa a `GET /api/clientes` sin cookie puede devolver datos si el backend no comprueba sesión.
- No añade headers de caché ni seguridad a la respuesta.

### 1.4 Almacenamiento cliente

| Clave / uso | Dónde | Contenido | Seguridad |
|-------------|--------|-----------|-----------|
| `dashboard_context` | localStorage | `"trabajo"` \| `"personal"` | OK, no sensible |
| `locale` | localStorage | `"es"` \| `"en"` | OK |
| `proactive-alerts-shown` | sessionStorage | Timestamp | OK |
| `sidebar_state` | Cookie | `true` \| `false` | OK; falta `SameSite` explícito |

No se almacenan tokens ni datos personales en localStorage/sessionStorage.

### 1.5 Cookies

- Supabase: gestionadas por `@supabase/ssr` (auth).
- Sidebar: `sidebar_state` con `path=/; max-age=7d`; **sin `SameSite`** (el valor por defecto en muchos navegadores es `Lax`, pero conviene fijarlo).

---

## 2. Mejoras aplicadas

### 2.1 Next.js (`next.config`)

- Headers de seguridad: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`.
- Cache largo para `_next/static` e inmutable para hashes de build.

### 2.2 API

- **Rutas privadas:** middleware exige sesión para `/api/*` excepto rutas públicas (p. ej. `dolar-oficial`, `webhook/*`, `auth/*`).
- **Cache-Control en respuestas:**
  - Públicas/cacheables (p. ej. dólar): `public, s-maxage=300, stale-while-revalidate`.
  - Privadas (clientes, leads, chat, etc.): `private, no-store` (o `max-age=0`) para no cachear datos por usuario.

### 2.3 Middleware

- Comprobación de sesión para APIs privadas; 401 si no hay usuario.
- Posible inyección de headers de seguridad/caché para respuestas HTML si se desea (opcional).

### 2.4 Cookies y storage

- Cookie de sidebar: `SameSite=Lax` (y `path`/`max-age` como hasta ahora).
- Claves de storage: prefijo `trabajo_` vía `src/lib/storage-keys.ts` (`trabajo_dashboard_context`, `trabajo_locale`, `trabajo_proactive-alerts-shown`). Lectura con fallback a claves legacy (`lisual_*`, sin prefijo) para migración transparente.

---

## 3. Resumen de buenas prácticas

1. **Datos privados:** no cachear en CDN ni en navegador; `Cache-Control: private, no-store` (o equivalente).
2. **Datos públicos/cacheables:** TTL acotado y `stale-while-revalidate` cuando aplique.
3. **APIs:** exigir autenticación en middleware o en el handler para rutas con datos sensibles.
4. **Cookies:** `SameSite=Lax` (o `Strict`) para reducir CSRF; `HttpOnly` y `Secure` en cookies de sesión (Supabase ya las gestiona).
5. **Storage:** solo preferencias/UI; nunca tokens ni datos sensibles; claves con prefijo de app si hay riesgo de colisión.
