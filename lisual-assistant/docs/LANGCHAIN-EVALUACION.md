# Evaluación LangChain – Asistente Lisual

Evaluación del uso de LangChain en el sistema según funcionalidades actuales y recomendaciones de mejora.

---

## 1. Estado actual

| Componente | Ubicación | Función |
|------------|-----------|---------|
| **Config** | `src/lib/langchain/config.ts` | `getChatModel`, `getVisionModel`, `isLangChainAvailable` |
| **Chat** | `src/lib/langchain/chat.ts` | Respuesta libre con sistema opcional (WhatsApp, etc.) |
| **Intent** | `src/lib/langchain/intent.ts` | Detección de intención con structured output (Zod) |
| **Agent** | `src/lib/langchain/agent.ts` | Agente ReAct con herramientas (leads, presupuestos, OCR, imágenes) |
| **Tools** | `src/lib/langchain/tools/lisual-tools.ts` | list_leads, create_lead, get_lead, list_presupuestos, ocr_image, analyze_image |
| **API Agent** | `src/app/api/agent/route.ts` | POST con mensajes + imagen opcional |
| **WhatsApp** | `src/app/api/webhook/whatsapp/route.ts` | detectIntent → crear lead o chat() → Evolution |

**Fortalezas**
- Agente con visión (gpt-4o) y herramientas alineadas al dominio (leads, presupuestos, OCR).
- Intent bien acotado para WhatsApp (crear_lead, consultar_presupuesto, etc.) con confianza y datos extraídos.
- Herramientas con Zod y descripciones claras para el LLM.
- Uso de service role en tools para operaciones server-side.

---

## 2. Brechas y riesgos

| Área | Problema | Impacto |
|------|----------|---------|
| **Límites del agente** | Sin `recursionLimit` explícito | Riesgo de loops o muchas llamadas a tools en una conversación. |
| **Tiempo / costo** | Sin `maxTokens` ni timeout en rutas | Respuestas muy largas o carreras largas consumen tokens y tiempo. |
| **API Agent** | Sin `maxDuration` en Vercel | Timeout genérico del plan puede cortar invocaciones largas sin control fino. |
| **Búsqueda de leads** | Solo list_leads (ordenado por fecha) y get_lead (id/email) | No se puede “buscar por nombre” desde el agente. |
| **get_lead** | Schema con id y email opcionales; si no pasan ninguno devuelve mensaje | El modelo a veces no pasa argumentos; conviene refinar schema o descripción. |
| **Observabilidad** | Sin logging de tool calls ni tokens | Difícil depurar y medir uso/costo. |
| **WhatsApp vs agente** | WhatsApp usa detectIntent + chat(), no el agente completo | No se aprovechan tools (listar/consultar presupuestos, OCR por foto) desde WhatsApp. |
| **Duplicidad** | `/api/chat` usa Vercel AI SDK con tools; `/api/agent` usa LangChain | Dos stacks de “chat con tools”; mantenimiento y consistencia. |

---

## 3. Mejoras recomendadas

### 3.1 Configuración y límites (prioridad alta)

- **recursionLimit** en las invocaciones del agente (ej. 15–25) para acotar pasos de razonamiento y tool calls.
- **maxTokens** en `getChatModel` / `getVisionModel` (ej. 1024–2048) para controlar costo y longitud.
- **maxDuration** en la ruta `/api/agent` (ej. 30–60 s) para alinearse con el plan de Vercel y evitar colgar.

### 3.2 Herramientas (prioridad alta)

- **search_leads**: búsqueda por nombre (o texto) en leads; devolver id, nombre, email, estado para que el agente pueda luego usar get_lead o list_presupuestos.
- **get_lead**: exigir en descripción “debes indicar id O email”; opcionalmente validar en la tool que al menos uno venga informado.

### 3.3 WhatsApp (prioridad media)

- Opción de usar el **agente completo** en el webhook (invocar `lisualAgent.invoke` con el mensaje del usuario) para que desde WhatsApp se puedan listar leads, consultar presupuestos y usar OCR con fotos. Mantener detectIntent + chat() como flujo alternativo más liviano si se quiere ahorrar tokens en conversaciones simples.

### 3.4 Observabilidad y costos (prioridad media)

- Log de tool calls (nombre + args sin datos sensibles) y, si es posible, uso de tokens por request (vía callbacks o respuesta del modelo) para estimar costo.
- Opcional: LangSmith o logging a un almacén propio para trazabilidad.

### 3.5 Consistencia y mantenimiento (prioridad baja)

- Decidir un “dueño” del chat con tools: o bien todo por LangChain (agente) y que el dashboard llame a `/api/agent`, o bien unificar en Vercel AI SDK y que WhatsApp/otros usen esa API. Evitar duplicar lógica de “crear lead / listar presupuestos” en dos stacks.

### 3.6 Seguridad (prioridad alta)

- Las tools usan **service role**; no exponer `/api/agent` sin autenticación si puede ser llamado desde el front público. Proteger con sesión (Supabase) o API key.
- Revisar que en las respuestas del agente no se devuelvan datos sensibles crudos (emails, teléfonos) más allá de lo necesario; el prompt puede pedir “resumir sin repetir datos personales completos”.

---

## 4. Resumen por funcionalidad del sistema

| Funcionalidad | Uso de LangChain | Estado | Sugerencia |
|---------------|------------------|--------|------------|
| Detección de intención WhatsApp | detectIntent (structured output) | Bien | Mantener; opcional cache por mensaje hash. |
| Respuesta libre WhatsApp | chat() con system prompt | Bien | Valorar pasar a agente para tener tools. |
| Crear lead desde WhatsApp | createLead (acción) + intent | Bien | Mantener; agente podría unificar. |
| Chat dashboard con tools | Vercel AI SDK en `/api/chat` | Duplicado | Unificar con LangChain agente o documentar cuándo usar cada uno. |
| Agente con herramientas + visión | lisualAgent + /api/agent | Bien | Añadir límites, búsqueda de leads, protección de ruta. |
| OCR / análisis de imágenes | ocr_image, analyze_image + visión | Bien | Mantener; opcional límite de tamaño de imagen. |

---

## 5. Próximos pasos sugeridos

1. ~~Aplicar **límites** (recursionLimit, maxTokens, maxDuration)~~ **Hecho:** config con maxTokens, API con recursionLimit 20 y maxDuration 60.
2. ~~Añadir **search_leads** y ajustar **get_lead**~~ **Hecho:** tool search_leads por nombre/empresa/email; get_lead con descripción clara.
3. ~~Proteger **POST /api/agent** con auth o API key~~ **Hecho:** requiere sesión Supabase (401 si no hay usuario).
4. (Opcional) Probar en WhatsApp el flujo con **lisualAgent** y comparar con detectIntent + chat().
5. ~~Documentar en el repo cuándo usar `/api/chat` (Vercel AI) vs `/api/agent` (LangChain)~~ **Hecho:** ver `docs/CHAT-Y-AGENTE-API.md`.
