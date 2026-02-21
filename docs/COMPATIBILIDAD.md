# Compatibilidad y pruebas en navegadores/dispositivos

## Navegadores soportados

| Navegador | Versión mínima | Notas |
|-----------|----------------|-------|
| Chrome | últimas 2 versiones | Recomendado |
| Firefox | últimas 2 versiones | |
| Safari | últimas 2 versiones | macOS e iOS |
| Edge | últimas 2 versiones | Chromium-based |

## Dispositivos y viewports

| Tipo | Resolución | Uso |
|------|------------|-----|
| Desktop | 1920×1080, 1366×768 | Dashboard principal |
| Tablet | 768×1024 | Vista intermedia |
| Mobile | 375×667, 390×844 | iPhone, Android |

## Configuración actual

- **Viewport**: `device-width`, `initial-scale=1` (ver `src/app/layout.tsx`)
- **Responsive**: Tailwind breakpoints (`sm`, `md`, `lg`, `xl`)
- **PWA**: `appleWebApp.capable`, `viewportFit: cover` para iOS

## Cómo probar compatibilidad

1. **Chrome DevTools**: Device toolbar (Ctrl+Shift+M) para simular móvil/tablet
2. **Lighthouse** (Chrome): Auditar Performance, Accessibility, Best Practices
3. **BrowserStack / Sauce Labs**: Pruebas reales en dispositivos si se requiere

## Headers de seguridad

Configurados en `next.config.ts`:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
