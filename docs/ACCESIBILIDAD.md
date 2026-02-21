# Accesibilidad (a11y)

## Herramientas configuradas

- **ESLint**: `eslint-config-next` incluye `eslint-plugin-jsx-a11y`
- **vitest-axe**: Tests automatizados de accesibilidad en `src/lib/accessibility.test.tsx`
- **Radix/shadcn**: Componentes con ARIA y navegación por teclado

## Tests de accesibilidad

```bash
npm run test
```

Los tests verifican:

- Formularios con labels correctos
- Botones con `aria-label` cuando el texto no es descriptivo
- Estructura de cards sin violaciones axe

## Reglas deshabilitadas en tests

- `color-contrast`: No funciona correctamente en jsdom (requiere layout real)

## Auditoría manual

1. **Lighthouse** (Chrome DevTools > Lighthouse): Ejecutar auditoría de accesibilidad
2. **axe DevTools** (extensión): Inspeccionar páginas en tiempo real
3. **Navegación por teclado**: Tab, Enter, Escape en toda la app
4. **Screen reader**: VoiceOver (macOS) o NVDA (Windows)

## Páginas prioritarias

- `/login`, `/register`, `/forgot-password`
- `/dashboard` (shell, sidebar)
- `/dashboard/chat`
- Formularios de leads y presupuestos
