#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const atomicRoot = path.resolve(__dirname, '..');
const blueprintsRoot = path.join(atomicRoot, 'src', 'blueprints');
const failures = [];
const nativeTags = /<(?:button|dialog|input|select|table|textarea)\b/i;
const nativeSelectors =
  /(?<![-\w])(?:button|dialog|input|select|table|textarea)(?=\s*(?:\[|:|\.|#|\{|,|>|\+|~))/im;
const fixedColor = /(?<!&)#[0-9a-f]{3,8}\b/i;

function filesBelow(root) {
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const current = path.join(root, entry.name);
    if (entry.isDirectory()) return filesBelow(current);
    return /\.(?:html|css|scss)$/.test(entry.name) ? [current] : [];
  });
}

for (const file of filesBelow(blueprintsRoot)) {
  const source = fs.readFileSync(file, 'utf8');
  const local = path.relative(atomicRoot, file).replaceAll('\\', '/');
  if (file.endsWith('.html') && nativeTags.test(source)) {
    failures.push(`Blueprint con primitiva visual nativa: ${local}`);
  }
  if (file.endsWith('.html') && /\sstyle\s*=/i.test(source)) {
    failures.push(`Blueprint con estilo inline: ${local}`);
  }
  if (!file.endsWith('.html') && nativeSelectors.test(source)) {
    failures.push(`Blueprint con selector visual nativo: ${local}`);
  }
  if (fixedColor.test(source)) failures.push(`Blueprint con color fijo: ${local}`);
}

const generator = fs.readFileSync(path.join(atomicRoot, 'tools', 'create-project.js'), 'utf8');
if (!generator.includes('GOVERNANCE_INSTALLER') || !generator.includes('install-consumer-governance')) {
  failures.push('El generador de aplicaciones no instala el gobierno Atomic obligatorio.');
}

for (const required of [
  'governance/consumer/ATOMIC_GOVERNANCE.md',
  'governance/consumer/AGENTS.template.md',
  'governance/consumer/atomic-provenance.template.json',
  'governance/consumer/check-atomic-provenance.mjs',
  'governance/consumer/atomic-governance.yml',
  'tools/install-consumer-governance.js',
]) {
  if (!fs.existsSync(path.join(atomicRoot, required))) failures.push(`Artefacto normativo ausente: ${required}`);
}

if (failures.length > 0) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exit(1);
}

console.log('Blueprints y generador cumplen la ley Atomic-first.');
