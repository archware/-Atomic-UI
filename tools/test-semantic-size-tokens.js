#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const atomicRoot = path.resolve(__dirname, '..');
const tokenFile = path.join(atomicRoot, 'src', 'styles', 'themes', '_tokens-components.css');
const css = fs.readFileSync(tokenFile, 'utf8');

const expectedTokens = [
  {
    name: '--size-scroll-region-compact',
    value: '7.5rem',
    pixelsAtDefaultRoot: 120,
    catalog: 'scroll-overlay.json',
  },
  {
    name: '--size-table-viewport-compact',
    value: '13.75rem',
    pixelsAtDefaultRoot: 220,
    catalog: 'table.json',
  },
  {
    name: '--size-dialog-wide',
    value: '53.125rem',
    pixelsAtDefaultRoot: 850,
    catalog: 'modal.json',
  },
];

for (const expected of expectedTokens) {
  const escapedName = expected.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const declarations = Array.from(
    css.matchAll(new RegExp(`${escapedName}\\s*:\\s*([^;]+);`, 'g')),
    (match) => match[1].trim(),
  );

  assert.deepEqual(
    declarations,
    [expected.value],
    `${expected.name} debe declararse una sola vez con el valor canónico.`,
  );

  const remValue = Number.parseFloat(expected.value);
  assert.equal(
    remValue * 16,
    expected.pixelsAtDefaultRoot,
    `${expected.name} debe conservar su equivalencia con una raíz de 16 px.`,
  );

  const catalogPath = path.join(atomicRoot, 'catalog', 'components', expected.catalog);
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  assert.ok(
    catalog.tokens.includes(expected.name),
    `${expected.name} debe figurar en ${expected.catalog}.`,
  );
}

console.log('Atomic semantic size tokens: values, equivalences and catalogs verified.');
