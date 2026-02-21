/**
 * Headers de caché y seguridad para respuestas API.
 * Uso: NextResponse.json(data, { headers: cacheHeaders.private() })
 */

/** No cachear: datos por usuario o sensibles. */
export const cacheHeaders = {
  private: () => ({
    "Cache-Control": "private, no-store, max-age=0",
  }),
  /** Cache público con revalidación (ej. dólar oficial). */
  publicRevalidate: (sMaxAge = 300, staleWhileRevalidate = 60) => ({
    "Cache-Control": `public, s-maxage=${sMaxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
  }),
} as const;
