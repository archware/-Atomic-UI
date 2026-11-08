'use strict';

const archivos = require('node:fs');
const rutas = require('node:path');
const criptografia = require('node:crypto');
const { createRequire: crearRequire } = require('node:module');

const VERSION = '10.6.5';
const RUTA = 'node_modules/storybook/dist/_node-chunks/chunk-YXWABFAG.js';
const ORIGINAL = '4b061d2248fc32b4a9a83b574532ec92036737c58ed2e9ae0bbb4576f0599956';
const CORREGIDO = 'a6cab107269991c07a939d128a71a7a0d9c3f5bfd935274566f18f54559056ec';
// Backport oficial: https://github.com/isaacs/minimatch/commit/77a0f5c4b80bdc641c3c930a1d9edf5ad2db57f8
const SUSTITUCIONES = [
  ['  firstPhasePreProcess(globParts) {\n    let didSomething = !1;',
    '  firstPhasePreProcess(globParts) {\n    const { braceExpandMax = 100_000 } = this.options;\n    let didSomething = !1;'],
  ['          if (next !== ".." || !p || p === "." || p === ".." || !p2 || p2 === "." || p2 === "..")',
    '          if (next !== ".." || !p || p === "." || p === ".." || !p2 || p2 === "." || p2 === ".." || globParts.length >= braceExpandMax)'],
  ['  secondPhasePreProcess(globParts) {\n    for (let i = 0; i < globParts.length - 1; i++)',
    '  secondPhasePreProcess(globParts) {\n    if (globParts.length > 1000)\n      return globParts;\n    for (let i = 0; i < globParts.length - 1; i++)'],
];

function huella(contenido) { return criptografia.createHash('sha256').update(contenido).digest('hex'); }

function descubrirBundle(raiz) {
  const paquetes = [];
  function recorrerInstalados(directorio, ancestros = new Set()) {
    if (!archivos.existsSync(directorio)) return;
    const real = archivos.realpathSync(directorio);
    if (ancestros.has(real)) return;
    const siguientes = new Set([...ancestros, real]);
    for (const entrada of archivos.readdirSync(directorio, { withFileTypes: true })) {
      if (entrada.name.startsWith('.')) continue;
      const ruta = rutas.join(directorio, entrada.name);
      if (!entrada.isDirectory() && !entrada.isSymbolicLink()) continue;
      if (entrada.name.startsWith('@')) { recorrerInstalados(ruta, siguientes); continue; }
      const manifiesto = rutas.join(ruta, 'package.json');
      if (!archivos.existsSync(manifiesto)) throw new Error(`Manifiesto ausente: ${manifiesto}`);
      const paquete = JSON.parse(archivos.readFileSync(manifiesto, 'utf8'));
      if (paquete.name === 'storybook') paquetes.push({ ruta, version: paquete.version });
      recorrerInstalados(rutas.join(ruta, 'node_modules'), siguientes);
    }
  }
  recorrerInstalados(rutas.join(raiz, 'node_modules'));
  const candidatos = [];
  function recorrerFuentes(directorio, paquete, ancestros = new Set()) {
    const real = archivos.realpathSync(directorio);
    if (ancestros.has(real)) {
      const error = new Error(`Ciclo en las fuentes de Storybook: ${directorio}`);
      error.codigo = 'STORYBOOK_MINIMATCH_DERIVA';
      throw error;
    }
    const siguientes = new Set([...ancestros, real]);
    for (const entrada of archivos.readdirSync(directorio, { withFileTypes: true })) {
      const ruta = rutas.join(directorio, entrada.name);
      if (entrada.isSymbolicLink()) {
        const error = new Error(`Enlace no autorizado en las fuentes de Storybook: ${ruta}`);
        error.codigo = 'STORYBOOK_MINIMATCH_DERIVA';
        throw error;
      }
      if (entrada.isDirectory()) recorrerFuentes(ruta, paquete, siguientes);
      else if (/\.(?:js|cjs|mjs)$/.test(entrada.name)) {
        const contenido = archivos.readFileSync(ruta);
        const texto = contenido.toString('utf8');
        if (['firstPhasePreProcess', 'secondPhasePreProcess', 'globParts.push(other)'].every((anclaje) => texto.includes(anclaje))) {
          candidatos.push({ ruta, version: paquete.version, sha256: huella(contenido) });
        }
      }
    }
  }
  for (const paquete of paquetes) recorrerFuentes(rutas.join(paquete.ruta, 'dist'), paquete);
  console.log(JSON.stringify({ instalacionesStorybook: paquetes, candidatos }));
  if (paquetes.length === 0) return { estado: 'ausente', ruta: null, version: null, sha256: null };
  if (paquetes.length !== 1 || candidatos.length !== 1) return { estado: 'deriva', ruta: null, version: null, sha256: null };
  const candidato = candidatos[0];
  const relativo = rutas.relative(raiz, candidato.ruta).split(rutas.sep).join('/');
  const resolver = crearRequire(rutas.join(raiz, 'package.json'));
  if (rutas.dirname(resolver.resolve('storybook/package.json')) !== paquetes[0].ruta || relativo !== RUTA || candidato.version !== VERSION) {
    return { ...candidato, estado: 'deriva' };
  }
  return { ...candidato, estado: candidato.sha256 === ORIGINAL ? 'original' : candidato.sha256 === CORREGIDO ? 'corregido' : 'deriva' };
}

function corregirContenido(contenido) {
  const resumen = huella(contenido);
  if (resumen === CORREGIDO) return Buffer.from(contenido);
  if (resumen !== ORIGINAL) throw new Error('STORYBOOK_MINIMATCH_DERIVA: hash original desconocido');
  let texto = contenido.toString('utf8');
  for (const [antes, despues] of SUSTITUCIONES) {
    if (texto.split(antes).length !== 2) throw new Error('STORYBOOK_MINIMATCH_DERIVA: anclaje no unico');
    texto = texto.replace(antes, despues);
  }
  const corregido = Buffer.from(texto, 'utf8');
  if (huella(corregido) !== CORREGIDO) throw new Error('STORYBOOK_MINIMATCH_DERIVA: resultado desconocido');
  return corregido;
}

function ejecutarParche({ raiz, comprobar, postinstall }) {
  try {
    if (!rutas.isAbsolute(raiz) || (comprobar && postinstall)) throw new Error('Opciones contradictorias o raiz relativa');
    const inspeccion = descubrirBundle(raiz);
    if (inspeccion.estado === 'corregido') { console.log('STORYBOOK_MINIMATCH_YA_CORREGIDO'); return 0; }
    if (inspeccion.estado === 'deriva') { console.error('STORYBOOK_MINIMATCH_DERIVA'); return 1; }
    if (inspeccion.estado === 'ausente' && postinstall && !comprobar) {
      const separar = (valor) => (valor || '').split(/[\s,]+/).filter(Boolean);
      const incluirDesarrollo = separar(process.env.npm_config_include).includes('dev');
      const omitirDesarrollo = separar(process.env.npm_config_omit).includes('dev') || process.env.NODE_ENV === 'production';
      if (omitirDesarrollo && !incluirDesarrollo) { console.log('STORYBOOK_DESARROLLO_OMITIDO'); return 0; }
    }
    if (inspeccion.estado === 'ausente' || comprobar) { console.error('STORYBOOK_MINIMATCH_PARCHE_AUSENTE'); return 1; }
    const corregido = corregirContenido(archivos.readFileSync(inspeccion.ruta));
    archivos.writeFileSync(inspeccion.ruta, corregido);
    if (huella(archivos.readFileSync(inspeccion.ruta)) !== CORREGIDO) {
      console.error(`STORYBOOK_MINIMATCH_DERIVA: bytes escritos no coinciden en ${inspeccion.ruta}`);
      return 1;
    }
    console.log('STORYBOOK_MINIMATCH_CORREGIDO');
    return 0;
  } catch (error) {
    if (error.codigo === 'STORYBOOK_MINIMATCH_DERIVA') { console.error(`${error.codigo}: ${error.message}`); return 1; }
    console.error(`ARNES_INCOMPLETO: ${error.stack}`); return 2;
  }
}

module.exports = { descubrirBundle, corregirContenido, ejecutarParche };
if (require.main === module) {
  const argumentos = process.argv.slice(2);
  const opciones = { raiz: rutas.resolve(__dirname, '..'), comprobar: false, postinstall: false };
  try {
    const vistos = new Set();
    for (let indice = 0; indice < argumentos.length; indice++) {
      const argumento = argumentos[indice];
      if (vistos.has(argumento)) throw new Error(`Opcion repetida: ${argumento}`);
      vistos.add(argumento);
      if (argumento === '--check') opciones.comprobar = true;
      else if (argumento === '--postinstall') opciones.postinstall = true;
      else if (argumento === '--raiz' && argumentos[indice + 1]) opciones.raiz = argumentos[++indice];
      else throw new Error(`Opcion desconocida: ${argumento}`);
    }
    process.exitCode = ejecutarParche(opciones);
  } catch (error) { console.error(`ARNES_INCOMPLETO: ${error.message}`); process.exitCode = 2; }
}
