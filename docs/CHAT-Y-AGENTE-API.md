# Chat y Agente – Cuándo usar cada API

El proyecto tiene dos formas de “chat con IA” que tocan datos de Assistant Cristian Alancay. Resumen de uso.

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

- El webhook invoca **trabajoAgent.invoke()** directamente en el servidor (no llama a `/api/agent` por HTTP).
- **Flujo:** para cada mensaje (o imagen) entrante se llama al agente completo (tools + visión). Si el agente falla, se hace fallback a `detectIntent` + `chat()` o creación de lead.
- **Multimedia en backend:** las fotos se normalizan en el servidor con `prepareImageForAgent` (ver `src/lib/langchain/multimedia.ts`). Acepta base64, data URL o URL pública; se convierte a data URL y se aplica límite de tamaño (4 MB). Evolution puede enviar imagen en base64 (`webhook_base64: true`) o URL; en ambos casos el backend la prepara para el modelo de visión.
- Respuesta al usuario por Evolution API (`sendWhatsAppText`).

---

## Resumen

| Necesidad                         | API / flujo          |
|----------------------------------|----------------------|
| Chat en dashboard con streaming  | `POST /api/chat`     |
| Agente completo + imágenes/OCR  | `POST /api/agent` (con sesión) |
| WhatsApp                         | Webhook (agente completo; fallback intent + chat) |
