'use strict';

const motor = require('motor-minimatch');
const rutaSistema = require('node:path');
const motoresPrivados = new WeakMap();

function copiarOpciones(opciones) {
  return { ...(opciones || {}) };
}

function adaptarSegmento(segmento, texto) {
  if (typeof segmento === 'string' || segmento === motor.GLOBSTAR) return segmento;
  return {
    _glob: texto,
    test(cadena) { return segmento.test(cadena); },
    [Symbol.match](cadena) {
      if (!segmento.test(cadena)) return null;
      return Object.assign([cadena], { index: 0, input: cadena });
    },
  };
}

class MinimatchCompatible {
  constructor(patron, opciones) {
    motor.braceExpand(patron, { nobrace: true });
    this.options = copiarOpciones(opciones);
    let normalizado = patron.trim();
    if (process.platform === 'win32' && this.options.allowWindowsEscape !== true) {
      normalizado = normalizado.split('\\').join('/');
    }
    const privado = new motor.Minimatch(normalizado, {
      ...this.options,
      platform: 'linux',
      windowsPathsNoEscape: false,
      allowWindowsEscape: true,
      preserveMultipleSlashes: false,
      optimizationLevel: 0,
      windowsNoMagicRoot: false,
    });
    motoresPrivados.set(this, privado);
    for (const propiedad of ['pattern', 'negate', 'comment', 'empty', 'partial']) {
      this[propiedad] = privado[propiedad];
    }
    this.set = [];
    if (this.comment || this.empty) return;
    this.globSet = privado.braceExpand();
    // La separación v3 conserva segmentos vacíos y alternativas duplicadas.
    this.globParts = this.globSet.map((alternativa) => alternativa.split(/\/+/));
    this.set = this.globParts.map((partes) => partes.map((parte) => this.parse(parte)));
  }

  match(ruta, parcial = this.partial) {
    const normalizada = process.platform === 'win32' ? ruta.split('\\').join('/') : ruta;
    return motoresPrivados.get(this).match(normalizada, parcial);
  }

  braceExpand() { return motoresPrivados.get(this).braceExpand(); }

  parse(segmento) {
    const analizado = segmento === '**' && this.options.noglobstar ? '*' : segmento;
    return adaptarSegmento(motoresPrivados.get(this).parse(analizado), analizado);
  }

  static defaults(opciones) { return crearApi(opciones).Minimatch; }
}
MinimatchCompatible.GLOBSTAR = motor.GLOBSTAR;

function crearApi(opcionesBase) {
  const base = copiarOpciones(opcionesBase);
  const combinar = (opciones) => ({ ...base, ...copiarOpciones(opciones) });
  class ClaseConOpciones extends MinimatchCompatible {
    constructor(patron, opciones) { super(patron, combinar(opciones)); }
    static defaults(opciones) {
      if (!opciones || Object.keys(opciones).length === 0) return this;
      return crearApi(combinar(opciones)).Minimatch;
    }
  }
  function coincidir(ruta, patron, opciones) {
    return new ClaseConOpciones(patron, opciones).match(ruta);
  }
  function filtrar(patron, opciones) { return (ruta) => coincidir(ruta, patron, opciones); }
  function expandirLlaves(patron, opciones) { return motor.braceExpand(patron, combinar(opciones)); }
  function seleccionar(rutas, patron, opciones) {
    const efectivas = combinar(opciones);
    const resultado = rutas.filter(filtrar(patron, efectivas));
    return resultado.length === 0 && efectivas.nonull ? [patron] : resultado;
  }
  coincidir.minimatch = coincidir;
  coincidir.Minimatch = ClaseConOpciones;
  coincidir.filter = filtrar;
  coincidir.braceExpand = expandirLlaves;
  coincidir.match = seleccionar;
  coincidir.defaults = (opciones) => !opciones || Object.keys(opciones).length === 0
    ? coincidir : crearApi(combinar(opciones));
  coincidir.sep = rutaSistema.sep;
  coincidir.GLOBSTAR = motor.GLOBSTAR;
  return coincidir;
}

module.exports = crearApi();
