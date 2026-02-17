#!/usr/bin/env node
/**
 * Script de verificación pre-deploy Vercel
 * Ejecutar: npm run vercel:check
 * 
 * Comprueba que la estructura del proyecto sea correcta para deploy en Vercel.
 * Si falla, imprime instrucciones para corregir.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const APP_DIR = path.join(ROOT, "lisual-assistant");

const checks = [];
let hasError = false;

function ok(msg) {
  checks.push({ ok: true, msg });
}

function fail(msg, fix) {
  checks.push({ ok: false, msg, fix });
  hasError = true;
}

// 1. lisual-assistant existe
if (fs.existsSync(APP_DIR)) {
  ok("Carpeta lisual-assistant existe");
} else {
  fail("Carpeta lisual-assistant no encontrada", "El frontend Next.js debe estar en lisual-assistant/");
}

// 2. package.json en lisual-assistant
const pkgPath = path.join(APP_DIR, "package.json");
if (fs.existsSync(pkgPath)) {
  ok("lisual-assistant/package.json existe");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  if (pkg.scripts?.build) {
    ok("Script 'build' definido en lisual-assistant");
  } else {
    fail("No hay script 'build' en lisual-assistant/package.json", "Añadir \"build\": \"next build\"");
  }
} else {
  fail("lisual-assistant/package.json no existe", "El frontend Next.js debe tener package.json");
}

// 3. next.config
const nextConfig = ["next.config.ts", "next.config.js", "next.config.mjs"].find(
  (f) => fs.existsSync(path.join(APP_DIR, f))
);
if (nextConfig) {
  ok(`next.config encontrado (${nextConfig})`);
} else {
  fail("No se encuentra next.config en lisual-assistant", "Next.js requiere next.config");
}

// 4. src/app o app
const appDir = fs.existsSync(path.join(APP_DIR, "src", "app"))
  ? path.join(APP_DIR, "src", "app")
  : path.join(APP_DIR, "app");
if (fs.existsSync(appDir)) {
  ok("Carpeta app encontrada (App Router)");
} else {
  fail("No se encuentra src/app ni app", "Next.js App Router requiere carpeta app");
}

// 5. Variables de entorno (solo aviso, no bloqueante)
const envExample = path.join(APP_DIR, ".env.example");
const envLocal = path.join(APP_DIR, ".env.local");
if (fs.existsSync(envExample)) {
  ok(".env.example existe (referencia para Vercel)");
}
if (fs.existsSync(envLocal)) {
  ok(".env.local existe (desarrollo local)");
} else {
  checks.push({
    ok: true,
    msg: ".env.local no encontrado (opcional en dev; obligatorio configurar en Vercel)",
  });
}

// Resultado
console.log("\n=== Verificación Vercel ===\n");
checks.forEach((c) => {
  const icon = c.ok ? "✓" : "✗";
  const color = c.ok ? "\x1b[32m" : "\x1b[31m";
  const reset = "\x1b[0m";
  console.log(`${color}${icon}${reset} ${c.msg}`);
  if (!c.ok && c.fix) {
    console.log(`  → ${c.fix}`);
  }
});

if (hasError) {
  console.log("\n--- Configuración Vercel requerida ---\n");
  console.log("Para evitar 404 NOT FOUND en el deploy:\n");
  console.log("1. Vercel Dashboard → tu proyecto asistente-lisual");
  console.log("2. Settings → General");
  console.log("3. Root Directory: Override → lisual-assistant");
  console.log("4. Guardar y Redeploy\n");
  console.log("Ver VERCEL.md para más detalles.\n");
  process.exit(1);
} else {
  console.log("\n✓ Estructura OK. Asegurate de configurar Root Directory = lisual-assistant en Vercel.\n");
  process.exit(0);
}
