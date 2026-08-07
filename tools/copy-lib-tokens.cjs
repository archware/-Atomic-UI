#!/usr/bin/env node
/**
 * copy-lib-tokens.cjs — Copia los tokens de tema a la biblioteca empaquetada.
 *
 * ng-packagr 22 prohíbe `assets` fuera del directorio del ng-package.json
 * (projects/atomic-ui), y las fuentes canónicas de tokens viven en
 * `src/styles/themes/` (no se mueven: las consumen la app demo y los
 * contratos de activación). Este paso copia `src/styles/themes/*.css`
 * a `dist/atomic-ui/tokens/` tras `ng build atomic-ui`.
 *
 * Uso: npm run lib:build   (= ng build atomic-ui && node tools/copy-lib-tokens.cjs)
 */

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const sourceDir = path.join(root, 'src', 'styles', 'themes');
const packageDir = path.join(root, 'dist', 'atomic-ui');
const targetDir = path.join(packageDir, 'tokens');

function fail(message) {
  console.error(`Copia de tokens rechazada: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(sourceDir)) fail(`no existe la fuente de tokens ${sourceDir}.`);
if (!fs.existsSync(path.join(packageDir, 'package.json'))) {
  fail('no existe dist/atomic-ui/package.json; ejecute primero "npx ng build atomic-ui".');
}
if (!fs.existsSync(path.join(sourceDir, 'tokens.css'))) {
  fail('falta src/styles/themes/tokens.css, el punto de entrada distribuido.');
}

fs.mkdirSync(targetDir, { recursive: true });
const copied = [];
for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith('.css')) continue;
  fs.copyFileSync(path.join(sourceDir, entry.name), path.join(targetDir, entry.name));
  copied.push(entry.name);
}

if (!copied.includes('tokens.css') || !copied.includes('index.css')) {
  fail('la copia no incluyó tokens.css e index.css.');
}
console.log(
  `Tokens copiados a dist/atomic-ui/tokens: ${copied.length} archivos (${copied.sort().join(', ')}).`,
);
