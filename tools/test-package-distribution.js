#!/usr/bin/env node

const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { canonicalSourceBytes } = require('./check-package-distribution.js');

const sha256 = (content) => createHash('sha256').update(content).digest('hex');

function git(repositoryRoot, args) {
  const result = spawnSync('git', args, { cwd: repositoryRoot, encoding: 'utf8' });
  if (result.error || result.status !== 0) {
    throw new Error(result.error?.message || result.stderr || result.stdout);
  }
}

function fingerprint(repositoryRoot, local) {
  const content = canonicalSourceBytes(repositoryRoot, local);
  return { bytes: content.byteLength, sha256: sha256(content) };
}

const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'atomic-manifest-eol-'));

try {
  git(fixtureRoot, ['init', '--quiet']);
  fs.writeFileSync(
    path.join(fixtureRoot, '.gitattributes'),
    '* text=auto eol=crlf\n*.bin -text\n*.ident text ident\n',
    'utf8',
  );

  const textPath = path.join(fixtureRoot, 'sample.txt');
  fs.writeFileSync(textPath, 'primera línea\nsegunda línea\n', 'utf8');
  const lf = fingerprint(fixtureRoot, 'sample.txt');

  fs.writeFileSync(textPath, 'primera línea\r\nsegunda línea\r\n', 'utf8');
  const crlf = fingerprint(fixtureRoot, 'sample.txt');
  assert.deepEqual(crlf, lf, 'LF y CRLF deben producir la misma identidad canónica.');

  fs.writeFileSync(textPath, 'primera línea\r\ncontenido distinto\r\n', 'utf8');
  const semanticChange = fingerprint(fixtureRoot, 'sample.txt');
  assert.notEqual(
    semanticChange.sha256,
    lf.sha256,
    'Un cambio semántico debe modificar la identidad canónica.',
  );

  const binaryPath = path.join(fixtureRoot, 'sample.bin');
  const binaryWithCrlf = Buffer.from([0, 65, 13, 10, 66, 255]);
  fs.writeFileSync(binaryPath, binaryWithCrlf);
  assert.deepEqual(
    canonicalSourceBytes(fixtureRoot, 'sample.bin'),
    binaryWithCrlf,
    'Los binarios deben conservar sus bytes exactos.',
  );

  fs.writeFileSync(binaryPath, Buffer.from([0, 65, 10, 66, 255]));
  assert.notEqual(
    fingerprint(fixtureRoot, 'sample.bin').sha256,
    sha256(binaryWithCrlf),
    'Una diferencia binaria CRLF/LF no debe normalizarse.',
  );

  const transformedPath = path.join(fixtureRoot, 'unsupported.ident');
  fs.writeFileSync(
    transformedPath,
    '$Id: contenido-transformado $\r\n',
    'utf8',
  );
  assert.throws(
    () => canonicalSourceBytes(fixtureRoot, 'unsupported.ident'),
    /transformación clean de Git no admitida/,
    'Un filtro clean distinto de CRLF a LF debe rechazarse.',
  );

  console.log(
    'Canonización de distribución verificada: LF/CRLF equivalentes, cambios semánticos detectados, binarios exactos y filtros clean inesperados rechazados.',
  );
} finally {
  fs.rmSync(fixtureRoot, { recursive: true, force: true });
}
