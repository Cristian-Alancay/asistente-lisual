# Console Ninja y DevTools

## Console Ninja

Ya está conectado cuando ves en consola:
`Console Ninja extension is connected to Next.js`

### Cómo usarlo

1. **Arrancar la app:** `npm run dev` y abrí http://localhost:3000 en el navegador (o en el browser de Cursor).
2. **Ver logs en el editor:** Los `console.log` y errores de runtime aparecen en Cursor junto al código (inline o en el panel de Console Ninja).
3. **Panel Ninja:** En la barra inferior de Cursor, buscá la sección **Ninja** (icono de pausa). Ahí podés ver logs y errores; si está pausado, hacé clic y elegí **Start Console Ninja**.

### Configuración (ya aplicada en el proyecto)

- En **Usuario** y en **.vscode/settings.json** del proyecto:
  - `console-ninja.featureSet`: `"Community"`
  - `console-ninja.showOnRun`: `true` (mostrar al ejecutar)

Si no ves logs: asegurate de que la app esté corriendo y que hayas interactuado con la página (Console Ninja necesita actividad en el navegador).

---

## DevTools

### DevTools del navegador

- **En el browser de Cursor:** Click derecho en la página → **Inspect** / **Inspeccionar**, o atajo para abrir DevTools (depende del browser).
- **Chrome/Edge:** `F12` o `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows).
- Ahí tenés **Console**, **Network**, **Elements**, etc.

### React DevTools

El mensaje *"Download the React DevTools for a better development experience"* es de React. Para tener componentes, props y estado en el navegador:

1. Instalá la extensión **React Developer Tools** en Chrome:  
   https://react.dev/link/react-devtools  
   (o buscá "React Developer Tools" en la Chrome Web Store).
2. Con la app abierta en el navegador, en DevTools aparecen las pestañas **Components** y **Profiler** cuando la extensión detecta React.

### Resumen

| Herramienta        | Dónde actúa              | Para qué sirve                          |
|--------------------|---------------------------|-----------------------------------------|
| Console Ninja      | Dentro de Cursor          | Ver `console.log` y errores en el editor |
| Browser DevTools   | En el navegador           | Console, Network, DOM, etc.             |
| React DevTools     | Extensión en el navegador | Inspeccionar árbol de componentes React |
