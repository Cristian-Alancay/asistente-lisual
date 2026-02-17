#!/usr/bin/env node
/**
 * Verificación pre-deploy Vercel (proyecto unificado en raíz)
 * Ejecutar: npm run vercel:check
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

const checks = [];
let hasError = false;

function ok(msg) {
  checks.push({ ok: true, msg });
}

function fail(msg, fix) {
  checks.push({ ok: false, msg, fix });
  hasError = true;
}

if (fs.existsSync(path.join(ROOT, "package.json"))) {
  ok("package.json en raíz existe");
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
  if (pkg.scripts?.build) ok("Script 'build' definido");
  else fail("No hay script 'build'", "Añadir \"build\": \"next build\"");
} else {
  fail("package.json no existe en la raíz", "El proyecto debe tener package.json en la raíz");
}

const nextConfig = ["next.config.ts", "next.config.js", "next.config.mjs"].find((f) =>
  fs.existsSync(path.join(ROOT, f))
);
if (nextConfig) ok(`next.config encontrado (${nextConfig})`);
else fail("No se encuentra next.config", "Next.js requiere next.config");

const appDir = fs.existsSync(path.join(ROOT, "src", "app"))
  ? path.join(ROOT, "src", "app")
  : path.join(ROOT, "app");
if (fs.existsSync(appDir)) ok("Carpeta app encontrada (App Router)");
else fail("No se encuentra src/app ni app", "Next.js App Router requiere carpeta app");

if (fs.existsSync(path.join(ROOT, ".env.example"))) ok(".env.example existe");
if (fs.existsSync(path.join(ROOT, ".env.local"))) ok(".env.local existe (desarrollo local)");

console.log("\n=== Verificación Vercel ===\n");
checks.forEach((c) => {
  const icon = c.ok ? "✓" : "✗";
  const color = c.ok ? "\x1b[32m" : "\x1b[31m";
  const reset = "\x1b[0m";
  console.log(`${color}${icon}${reset} ${c.msg}`);
  if (!c.ok && c.fix) console.log(`  → ${c.fix}`);
});

if (hasError) {
  console.log("\nCorregí los errores y volvé a ejecutar npm run vercel:check\n");
  process.exit(1);
}
console.log("\n✓ Estructura OK. Proyecto unificado en la raíz; no hace falta Root Directory en Vercel.\n");
process.exit(0);
