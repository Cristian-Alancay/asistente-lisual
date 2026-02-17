# Chat y Agente – Cuándo usar cada API

El proyecto tiene dos formas de “chat con IA” que tocan datos de Lisual. Resumen de uso.

---

## POST `/api/chat` (Vercel AI SDK)

- **Stack:** Vercel AI SDK + OpenAI (`gpt-4o-mini`) + Supabase con **sesión del usuario** (RLS).
- **Respuesta:** streaming (UI puede mostrar el texto en tiempo real).
- **Herramientas:** crear lead, consultar presupuestos, consultar estado, listar leads (todo vía Supabase con RLS).
- **Auth:** usa cookies de sesión (mismo usuario que está en el dashboard).
- **Uso recomendado:** chat del **dashboard** cuando querés streaming y que las acciones respeten permisos por usuario (RLS).

---

## POST `/api/agent` (LangChain)

- **Stack:** LangChain + agente ReAct con **gpt-4o** (visión) + herramientas que usan **Supabase con service role**.
- **Respuesta:** JSON con el mensaje final (no streaming).
- **Herramientas:** list_leads, search_leads, create_lead, get_lead, list_presupuestos, ocr_image, analyze_image. Acceso amplio a datos (service role).
- **Auth:** **requiere sesión** (usuario logueado). Si no hay sesión → 401.
- **Uso recomendado:** 
  - Uso **interno** desde el dashboard cuando necesitás el agente completo: búsqueda por nombre, OCR/imágenes, y todas las tools en una conversación.
  - Enviar **imagen** (base64) para que el agente la interprete o haga OCR.

**Body de ejemplo:**

```json
{
  "messages": [
    { "role": "user", "content": "Buscar leads que se llamen Juan" }
  ],
  "imageBase64": "opcional_base64_de_imagen"
}
```

---

## WhatsApp (webhook)

- El webhook **no** llama a `/api/agent` (no hay sesión desde WhatsApp).
- Usa **LangChain**: `detectIntent` + `chat()` o creación de lead según intención; respuesta por Evolution API.
- Si en el futuro se quiere que WhatsApp use el agente (tools + OCR por foto), hay que invocar `lisualAgent.invoke()` **dentro** del handler del webhook (servidor), sin pasar por HTTP a `/api/agent`.

---

## Resumen

| Necesidad                         | API / flujo          |
|----------------------------------|----------------------|
| Chat en dashboard con streaming  | `POST /api/chat`     |
| Agente completo + imágenes/OCR  | `POST /api/agent` (con sesión) |
| WhatsApp                         | Webhook (detectIntent + chat / createLead) |
