#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const invalidNumericToken = /\d+(?:\.\d+)?var\s*\(/g;
const invalidNegatedToken = /(?<![\w-])-var\s*\(/g;
const invalidTrailingResidue = /var\([^()]*(?:\([^()]*\)[^()]*)?\)[0-9a-f]{3,8}\b/gi;

function filesBelow(root) {
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const current = path.join(root, entry.name);
    if (entry.isDirectory()) return filesBelow(current);
    return /\.(?:css|scss|ts)$/.test(entry.name) ? [current] : [];
  });
}

function withoutComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
}

/*
LA AUDITORIA SE EXPORTA PARA QUE EL CONSUMIDOR NO LA REESCRIBA.

Estos tres patrones nacieron de sustituciones mecanicas que dejaron `16var(...)`,
`-var(...)` y `var(...)ffffff` en hojas reales. La regla vale igual en el ADN y en
cualquier consumidor; lo unico que cambia es la raiz que se escanea, y por eso es
un parametro. `governance/consumer/check-atomic-rules.mjs` la invoca con el `src`
del consumidor.
*/
function auditarValoresCss(sourceRoot, raizRelativa = sourceRoot) {
  const hallazgos = [];
  for (const file of filesBelow(sourceRoot)) {
    const source = withoutComments(fs.readFileSync(file, 'utf8'));
    for (const pattern of [invalidNumericToken, invalidNegatedToken, invalidTrailingResidue]) {
      for (const match of source.matchAll(pattern)) {
        const linea = source.slice(0, match.index).split(/\r?\n/).length;
        hallazgos.push({
          rutaArchivo: file,
          rutaRelativa: path.relative(raizRelativa, file).replaceAll('\\', '/'),
          linea,
          detalle: `contiene ${match[0]} (use calc(-1 * var(...)) para negar tokens)`,
        });
      }
    }
  }
  return hallazgos;
}

function ejecutar() {
  const atomicRoot = path.resolve(__dirname, '..');
  const sourceRoot = process.argv[2] ? path.resolve(process.argv[2]) : path.join(atomicRoot, 'src');
  const hallazgos = auditarValoresCss(sourceRoot, atomicRoot);

  if (hallazgos.length > 0) {
    console.error(
      [
        'Se detectaron valores CSS dañados por sustituciones mecánicas:',
        ...hallazgos.map((item) => `- ${item.rutaRelativa}:${item.linea} ${item.detalle}`),
      ].join('\n'),
    );
    process.exit(1);
  }

  console.log('Valores CSS verificados: no existen fragmentos numéricos adyacentes a var().');
}

if (require.main === module) ejecutar();

module.exports = { auditarValoresCss, filesBelow };
