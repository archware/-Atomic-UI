'use strict';

const archivos = require('node:fs');
const rutas = require('node:path');
const { createRequire: crearRequire } = require('node:module');
const FAMILIAS = ['minimatch', 'motor-minimatch', 'deepmerge'];
const FACHADA = '@atomic-ui/compatibilidad-minimatch';
const REEMPLAZO = '@stackline/deepmerge';
const RUTA_FACHADA = 'tools/compatibilidad-minimatch';
const relativa = (raiz, ruta) => rutas.relative(raiz, ruta).split(rutas.sep).join('/');
const nombreInstalado = (ruta) => ruta.match(/(?:^|\/)node_modules\/((?:@[^/]+\/)?[^/]+)$/)?.[1];
const dentro = (raiz, ruta) => { const id = rutas.relative(raiz, ruta); return id !== '..' && !id.startsWith('..' + rutas.sep) && !rutas.isAbsolute(id); };

function leerEstado(ruta) {
  try { return archivos.lstatSync(ruta); }
  catch (error) { if (error.code === 'ENOENT' || error.code === 'ENOTDIR') return null; throw error; }
}

function leerManifiesto(ruta) {
  const dato = JSON.parse(archivos.readFileSync(ruta, 'utf8'));
  if (!dato || typeof dato !== 'object' || Array.isArray(dato)) throw Error('Manifiesto invalido: ' + ruta);
  return dato;
}

function aristasObjetivo(manifiesto, esRaiz) {
  const resultado = new Map();
  const grupos = ['peerDependencies', 'dependencies', 'optionalDependencies', ...(esRaiz ? ['devDependencies'] : [])];
  for (const grupo of grupos) {
    const declaraciones = manifiesto[grupo];
    if (declaraciones === undefined) continue;
    if (!declaraciones || typeof declaraciones !== 'object' || Array.isArray(declaraciones)) throw Error('Grupo de dependencias invalido: ' + grupo);
    for (const dependencia of FAMILIAS) {
      if (!Object.hasOwn(declaraciones, dependencia)) continue;
      const declaracion = declaraciones[dependencia];
      if (typeof declaracion !== 'string' || !declaracion.trim()) throw Error('Declaracion invalida: ' + dependencia);
      const bandera = grupo === 'peerDependencies' ? manifiesto.peerDependenciesMeta?.[dependencia]?.optional : undefined;
      if (bandera !== undefined && typeof bandera !== 'boolean') throw Error('Peer opcional no booleano: ' + dependencia);
      resultado.set(dependencia, { declaracion, grupo, opcional: grupo === 'optionalDependencies' || bandera === true });
    }
  }
  return resultado;
}

function descubrirDependencias(raiz) {
  if (typeof raiz !== 'string' || !rutas.isAbsolute(raiz)) throw Error('La raiz debe ser una ruta absoluta');
  raiz = rutas.resolve(raiz);
  const realRaiz = archivos.realpathSync.native(raiz);
  const paquetes = [];
  const consumos = [];
  const archivosInspeccionados = new Set();
  const hallazgos = [];
  const omisiones = [];
  const instalaciones = new Map();
  const declaraciones = new Map();
  function confinar(ruta) {
    const real = archivos.realpathSync.native(ruta);
    if (!dentro(realRaiz, real)) throw Error('Entrada fuera de raiz: ' + ruta);
    return real;
  }
  function enumerar(directorio) {
    const entradas = archivos.readdirSync(directorio, { withFileTypes: true }).sort((a, b) => a.name < b.name ? -1 : 1);
    const nombres = new Set();
    for (const entrada of entradas) {
      const clave = entrada.name.toLowerCase();
      if (nombres.has(clave)) throw Error('Colision por caja: ' + rutas.join(directorio, entrada.name));
      nombres.add(clave);
    }
    return entradas;
  }
  function registrar(ruta, esRaiz = false) {
    const archivo = rutas.join(ruta, 'package.json');
    confinar(archivo);
    const manifiesto = leerManifiesto(archivo);
    if (typeof manifiesto.name !== 'string' || !manifiesto.name || typeof manifiesto.version !== 'string' || !manifiesto.version) throw Error('Identidad de paquete incompleta: ' + archivo);
    const dato = { ruta, rutaReal: confinar(ruta), nombre: manifiesto.name, version: manifiesto.version, enlace: !!leerEstado(ruta)?.isSymbolicLink() };
    instalaciones.set(ruta, dato);
    paquetes.push(dato);
    archivosInspeccionados.add(archivo);
    declaraciones.set(ruta, aristasObjetivo(manifiesto, esRaiz));
  }
  function visitar(directorio, ancestros, clase) {
    const real = confinar(directorio);
    if (ancestros.has(real)) throw Error('Ciclo de instalaciones: ' + directorio);
    const siguientes = new Set([...ancestros, real]);
    for (const entrada of enumerar(directorio)) {
      const ruta = rutas.join(directorio, entrada.name);
      const estado = entrada.isSymbolicLink() ? archivos.statSync(confinar(ruta)) : entrada;
      if (!estado.isDirectory()) continue;
      if (clase === 'interior') {
        visitar(ruta, siguientes, entrada.name.toLowerCase() === 'node_modules' ? 'instalacion' : 'interior');
        continue;
      }
      const manifiesto = rutas.join(ruta, 'package.json');
      if (leerEstado(manifiesto)) { registrar(ruta); visitar(ruta, siguientes, 'interior'); }
      else if (entrada.name.startsWith('@')) visitar(ruta, siguientes, 'instalacion');
      else if (entrada.name.startsWith('.') || clase === 'contenedor') visitar(ruta, siguientes, 'contenedor');
      else throw Error('Manifiesto ausente: ' + manifiesto);
    }
  }
  registrar(raiz, true);
  const lockRuta = rutas.join(raiz, 'package-lock.json');
  confinar(lockRuta);
  const lock = leerManifiesto(lockRuta);
  if (!lock.packages || typeof lock.packages !== 'object' || Array.isArray(lock.packages) || !lock.packages['']) throw Error('Lock sin entradas fisicas: ' + lockRuta);
  archivosInspeccionados.add(lockRuta);
  const modulos = rutas.join(raiz, 'node_modules');
  if (leerEstado(modulos)) visitar(modulos, new Set([realRaiz]), 'instalacion');
  for (const paquete of paquetes) {
    const id = relativa(raiz, paquete.ruta);
    const resolver = crearRequire(rutas.join(paquete.rutaReal, 'package.json'));
    const idReal = relativa(realRaiz, paquete.rutaReal);
    const entradaLock = lock.packages[id] || (idReal !== id ? lock.packages[idReal] : undefined);
    const esperado = entradaLock?.link ? lock.packages[entradaLock.resolved] : entradaLock;
    const actuales = declaraciones.get(paquete.ruta);
    const aristasLock = aristasObjetivo(esperado || {}, id === '');
    for (const dependencia of new Set([...actuales.keys(), ...aristasLock.keys()])) {
      const arista = actuales.get(dependencia);
      const fijada = aristasLock.get(dependencia);
      if (!arista || !fijada || arista.grupo !== fijada.grupo || arista.opcional !== fijada.opcional || arista.declaracion !== fijada.declaracion) hallazgos.push({ codigo: 'RESOLUCION_INCORRECTA', ruta: paquete.ruta, detalle: 'Declaracion objetivo diferente del lock: ' + dependencia });
      if (!arista) continue;
      let encontrado;
      for (const base of resolver.resolve.paths(dependencia) || []) {
        const candidato = rutas.join(base, dependencia, 'package.json');
        if (leerEstado(candidato)) { confinar(candidato); encontrado = candidato; break; }
      }
      let entrada;
      try { entrada = confinar(resolver.resolve(dependencia)); }
      catch (error) {
        if (!['MODULE_NOT_FOUND', 'ERR_MODULE_NOT_FOUND', 'ERR_PACKAGE_PATH_NOT_EXPORTED', 'ENOENT'].includes(error.code)) throw error;
        if (arista.opcional && !encontrado && ['MODULE_NOT_FOUND','ERR_MODULE_NOT_FOUND'].includes(error.code)) omisiones.push({ ruta: paquete.ruta, dependencia, declaracion: arista.declaracion });
        else hallazgos.push({ codigo: 'RESOLUCION_INCORRECTA', ruta: paquete.ruta, detalle: dependencia + ': no resuelve (' + error.code + ')' });
        continue;
      }
      const resuelto = encontrado && (instalaciones.get(rutas.dirname(encontrado)) || paquetes.find((dato) => dato.rutaReal === confinar(rutas.dirname(encontrado))));
      if (!resuelto || !dentro(resuelto.rutaReal, entrada) || !archivos.statSync(entrada).isFile()) {
        hallazgos.push({ codigo: 'RESOLUCION_INCORRECTA', ruta: paquete.ruta, detalle: dependencia + ': la entrada no pertenece al paquete fisico descubierto' });
        continue;
      }
      const rutaResuelta = rutas.join(resuelto.rutaReal, 'package.json');
      archivosInspeccionados.add(rutaResuelta);
      consumos.push({ consumidor: paquete.nombre, versionConsumidor: paquete.version, rutaConsumidor: paquete.ruta, dependencia, declaracion: arista.declaracion, rutaResuelta, nombreResuelto: resuelto.nombre, versionResuelta: resuelto.version, instalacion: resuelto.ruta });
    }
  }
  return { raiz, paquetes, consumos, archivosInspeccionados: [...archivosInspeccionados].sort(), lock, hallazgos, omisiones };
}

function validarInventario(inventario) {
  const hallazgos = [];
  const agregar = (codigo, ruta, detalle) => hallazgos.push({ codigo, ruta, detalle });
  const salir = () => ({ correcto: !hallazgos.length, hallazgos });
  if (!inventario || typeof inventario.raiz !== 'string' || !Array.isArray(inventario.paquetes) || !Array.isArray(inventario.consumos) || !inventario.lock?.packages) {
    agregar('ARNES_INCOMPLETO', '.', 'Inventario invalido'); return salir();
  }
  const { raiz, paquetes, consumos, lock } = inventario;
  const relevantes = paquetes.filter((p) => p.ruta !== raiz && ([FACHADA, REEMPLAZO, ...FAMILIAS].includes(p.nombre) || FAMILIAS.includes(nombreInstalado(relativa(raiz, p.ruta)))));
  if (paquetes.length <= 1 || relevantes.length === 0) { agregar('INVENTARIO_VACIO', raiz, 'No se descubrieron instalaciones objetivo'); return salir(); }
  let versiones;
  let raizReal;
  try {
    raizReal = archivos.realpathSync.native(raiz);
    const resolver = crearRequire(rutas.join(raizReal, 'package.json'));
    if (!dentro(raizReal, archivos.realpathSync.native(resolver.resolve('semver')))) throw Error('semver fuera de la instalacion');
    versiones = resolver('semver');
  } catch (error) { agregar('ARNES_INCOMPLETO', raiz, 'semver no disponible: ' + (error.code || error.message)); return salir(); }
  hallazgos.push(...inventario.hallazgos);
  const fachadaReal = rutas.join(raizReal, ...RUTA_FACHADA.split('/'));
  for (const paquete of relevantes) {
    const id = relativa(raiz, paquete.ruta);
    const idReal = relativa(raizReal, paquete.rutaReal);
    const idLock = Object.hasOwn(lock.packages, id) ? id : idReal;
    const entrada = lock.packages[idLock];
    const origen = entrada?.link ? entrada.resolved : idLock;
    const efectiva = entrada?.link ? lock.packages[origen] : entrada;
    const nombre = efectiva?.name || nombreInstalado(origen || '');
    const valido = versiones.valid(paquete.version);
    if (!efectiva || efectiva.version !== paquete.version || nombre !== paquete.nombre || (entrada?.link === true) !== paquete.enlace || (entrada?.link && paquete.rutaReal !== rutas.resolve(raizReal, origen))) agregar('RESOLUCION_INCORRECTA', paquete.ruta, 'Identidad, version o enlace diferente del lock: ' + paquete.nombre + '@' + paquete.version);
    if (paquete.nombre === 'minimatch' && valido && versiones.lt(paquete.version, '11.0.1')) agregar('DEPENDENCIA_VULNERABLE', paquete.ruta, 'minimatch@' + paquete.version);
    if (!valido || (paquete.nombre === 'minimatch' ? paquete.version !== '11.0.4' : paquete.nombre === REEMPLAZO ? paquete.version !== '1.1.0' : paquete.nombre === FACHADA ? paquete.version !== '1.0.0' || paquete.rutaReal !== fachadaReal || !paquete.enlace : true)) agregar('RESOLUCION_INCORRECTA', paquete.ruta, 'Instalacion objetivo inesperada: ' + paquete.nombre + '@' + paquete.version);
  }
  const requerido = (dependencia, nombre, version) => relevantes.some((p) => p.nombre === nombre && p.version === version && consumos.some((c) => c.dependencia === dependencia && c.instalacion === p.ruta));
  for (const [dependencia, nombre, version] of [['minimatch', FACHADA, '1.0.0'], ['motor-minimatch', 'minimatch', '11.0.4'], ['deepmerge', REEMPLAZO, '1.1.0']]) {
    if (!requerido(dependencia, nombre, version)) agregar('RESOLUCION_INCORRECTA', raiz, 'Falta instalacion y consumo efectivo: ' + dependencia);
  }
  if (!consumos.some((c) => c.rutaConsumidor === raiz && c.dependencia === 'minimatch' && c.declaracion === 'file:' + RUTA_FACHADA)) agregar('RESOLUCION_INCORRECTA', raiz, 'minimatch raiz no declara la fachada local esperada');
  for (const consumo of consumos) {
    let esperado;
    if (consumo.dependencia === 'deepmerge') esperado = [REEMPLAZO, '1.1.0'];
    else if (consumo.dependencia === 'motor-minimatch') esperado = ['minimatch', '11.0.4'];
    else if (consumo.rutaConsumidor === raiz && consumo.declaracion === 'file:' + RUTA_FACHADA) esperado = [FACHADA, '1.0.0'];
    else {
      const opciones = { includePrerelease: true };
      const rango = versiones.validRange(consumo.declaracion, opciones);
      const posible = rango && versiones.minVersion(rango, opciones);
      const antiguo = posible && versiones.subset(rango, '<4.0.0', opciones);
      const moderno = posible && versiones.subset(rango, '>=4.0.0', opciones);
      if (antiguo && !moderno) esperado = [FACHADA, '1.0.0'];
      else if (moderno && !antiguo) esperado = ['minimatch', '11.0.4'];
      else agregar('RANGO_NO_CLASIFICABLE', consumo.rutaConsumidor, consumo.dependencia + ': ' + consumo.declaracion);
    }
    if (esperado && (consumo.nombreResuelto !== esperado[0] || consumo.versionResuelta !== esperado[1] || (esperado[0] === FACHADA && rutas.dirname(consumo.rutaResuelta) !== fachadaReal))) agregar('RESOLUCION_INCORRECTA', consumo.rutaConsumidor, consumo.dependencia + ' resolvio ' + consumo.nombreResuelto + '@' + consumo.versionResuelta + '; esperado ' + esperado.join('@') + ' en ' + consumo.rutaResuelta);
  }
  return salir();
}

async function ejecutarVerificacion({ raiz } = {}) {
  try {
    const inventario = descubrirDependencias(raiz);
    const resultado = validarInventario(inventario);
    for (const omision of inventario.omisiones) console.log(JSON.stringify({ codigo: 'DEPENDENCIA_OPCIONAL_OMITIDA', ...omision }));
    for (const hallazgo of resultado.hallazgos) console.error(JSON.stringify(hallazgo));
    if (resultado.correcto) console.log(JSON.stringify({ codigo: 'DEPENDENCIAS_OBJETIVO_VERIFICADAS', paquetes: inventario.paquetes.length, consumos: inventario.consumos.length, alcance: FAMILIAS }));
    return resultado.correcto ? 0 : resultado.hallazgos.some(({ codigo }) => ['ARNES_INCOMPLETO', 'INVENTARIO_VACIO'].includes(codigo)) ? 2 : 1;
  } catch (error) {
    console.error(JSON.stringify({ codigo: 'ARNES_INCOMPLETO', ruta: raiz || '.', detalle: error.message }));
    return 2;
  }
}

module.exports = { descubrirDependencias, validarInventario, ejecutarVerificacion };
if (require.main === module) {
  const argumentos = process.argv.slice(2);
  if (argumentos.length && (argumentos.length !== 2 || argumentos[0] !== '--raiz' || !rutas.isAbsolute(argumentos[1]))) {
    console.error(JSON.stringify({ codigo: 'ARNES_INCOMPLETO', ruta: '.', detalle: 'Se admite solo --raiz con ruta absoluta' }));
    process.exitCode = 2;
  } else ejecutarVerificacion({ raiz: argumentos[1] || rutas.resolve(__dirname, '..') }).then((codigo) => { process.exitCode = codigo; });
}
