#!/usr/bin/env node
/*
COMPUERTA DE REGLAS ATOMIC PARA CONSUMIDORES — CORE-GATES-20260824-01

QUE PROBLEMA RESUELVE. Las cinco reglas de la Ley C -Signals, hojas externas,
selectores, valores CSS y escala tipografica- se comprobaban SOLO en el ADN.
Un consumidor podia escribir `@Input()`, `styles: []`, `24px` y selectores
`prest-*` nuevos con todas sus compuertas en verde, porque ninguna las miraba.
Esa es la razon material de que en `prestamo_front_atomic` convivan 351 lineas
con `px`, 62 selectores `prest-` y 13 decoradores sin que nada se queje.

UNA SOLA IMPLEMENTACION. Este archivo NO reescribe las reglas: importa las
auditorias de las herramientas del ADN y las corre contra el arbol del
consumidor. Si las copiara, el dia que una regla se afine habria dos versiones y
la del consumidor seria la que nadie recuerda actualizar.

TRINQUETE, NO INTERRUPTOR. Apagar las reglas hasta pagar la deuda las deja
apagadas para siempre; encenderlas de golpe rompe el build de hoy y acaban
desactivadas por urgencia. Asi que la deuda medida en el momento de instalar la
compuerta se congela en una LINEA BASE, y a partir de ahi:

  - un hallazgo que NO esta en la linea base rompe el build;
  - un hallazgo que si esta se informa como deuda heredada y no rompe nada;
  - una entrada de la linea base que ya no aparece se avisa para retirarla.

Es el mismo patron que `scripts/check-typography-scale.mjs` uso en el ADN para
llegar de 147 pesos a mano a cero sin bloquear el trabajo por el camino.

LA CLAVE NO LLEVA NUMERO DE LINEA, A PROPOSITO. Una linea base indexada por
linea caduca en cuanto alguien anade un import: todos los hallazgos del archivo
se vuelven "nuevos" y el build se rompe por un cambio que no tiene nada que ver.
La clave es `regla|archivo|detalle`, que sobrevive al movimiento vertical y
sigue distinguiendo dos incumplimientos distintos del mismo archivo.

USO
  node check-atomic-rules.mjs --consumer-root=<ruta> [--ui-root=<rel>] [--src-root=<rel>]
  node check-atomic-rules.mjs --consumer-root=<ruta> --update-baseline
*/

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import signals from '../../tools/check-angular-signals.cjs';
import selectores from '../../tools/check-selector-prefixes.cjs';
import valoresCss from '../../tools/check-invalid-css-values.js';
import { auditarArbol as auditarEstilosExternos } from '../../tools/check-external-angular-styles.mjs';
import { auditarPesos } from '../../scripts/check-typography-scale.mjs';

const RUTA_LINEA_BASE = 'docs/atomic-gate-baseline.json';

function argumento(nombre, porDefecto = null) {
  const prefijo = `--${nombre}=`;
  const encontrado = process.argv.find((valor) => valor.startsWith(prefijo));
  return encontrado ? encontrado.slice(prefijo.length) : porDefecto;
}

function normalizar(ruta) {
  return String(ruta).replaceAll('\\', '/');
}

function clave(hallazgo) {
  return `${hallazgo.regla}|${hallazgo.archivo}|${hallazgo.detalle}`;
}

/*
`uiRoot` y `srcRoot` se separan porque no todas las reglas miran lo mismo.
Signals, estilos externos y selectores son contratos de COMPONENTE y solo tienen
sentido bajo el arbol de interfaz. Los valores CSS y la escala tipografica son
propiedades de la hoja, y una medida rota duele igual en una feature que en un
atomo: esas dos barren `src` entero.
*/
export function auditarConsumidor(consumerRoot, { uiRoot, srcRoot }) {
  const rutaUi = resolve(consumerRoot, uiRoot);
  const rutaSrc = resolve(consumerRoot, srcRoot);
  const hallazgos = [];

  const rel = (ruta) => normalizar(relative(consumerRoot, ruta));

  for (const item of signals.auditarArbol(rutaUi)) {
    hallazgos.push({
      regla: 'signals',
      archivo: rel(item.rutaArchivo),
      linea: item.linea,
      detalle: `importa ${item.simbolo}; use input() y output()`,
    });
  }

  for (const item of auditarEstilosExternos(rutaUi)) {
    hallazgos.push({
      regla: 'estilos-externos',
      archivo: rel(item.rutaArchivo),
      linea: item.linea,
      detalle: `${item.tipo}; la presentacion vive en una hoja externa`,
    });
  }

  // Conjunto vacio de excepciones: el inventario del consumidor es su linea
  // base, no una lista escrita a mano dentro de la herramienta del ADN.
  for (const item of selectores.auditarSelectores(rutaUi, new Set()).hallazgos) {
    hallazgos.push({
      regla: 'selectores',
      archivo: rel(item.rutaArchivo),
      linea: item.linea,
      detalle: item.detalle,
    });
  }

  for (const item of valoresCss.auditarValoresCss(rutaSrc, consumerRoot)) {
    hallazgos.push({
      regla: 'valores-css',
      archivo: normalizar(item.rutaRelativa),
      linea: item.linea,
      detalle: item.detalle,
    });
  }

  for (const item of auditarPesos(rutaSrc, consumerRoot)) {
    hallazgos.push({
      regla: 'tipografia',
      archivo: normalizar(item.archivo),
      linea: item.linea,
      detalle: `font-weight: ${item.peso} escrito a mano${item.fueraDeEscala ? ' (sin destino en la escala)' : ''}`,
    });
  }

  return hallazgos.sort((a, b) =>
    clave(a).localeCompare(clave(b), 'es'),
  );
}

function leerLineaBase(rutaArchivo) {
  if (!existsSync(rutaArchivo)) {
    return { generadoPor: null, entradas: [] };
  }
  return JSON.parse(readFileSync(rutaArchivo, 'utf8'));
}

function ejecutar() {
  const consumerRoot = resolve(argumento('consumer-root', process.cwd()));
  const uiRoot = argumento('ui-root', 'src/app/ui');
  const srcRoot = argumento('src-root', 'src');
  const actualizar = process.argv.includes('--update-baseline');
  const rutaLineaBase = join(consumerRoot, RUTA_LINEA_BASE);

  if (!existsSync(resolve(consumerRoot, uiRoot))) {
    console.error(
      `No existe el arbol de interfaz "${uiRoot}" bajo ${consumerRoot}. ` +
        'Indique --ui-root con la ruta real del consumidor.',
    );
    process.exit(1);
  }

  const hallazgos = auditarConsumidor(consumerRoot, { uiRoot, srcRoot });

  if (actualizar) {
    const entradas = hallazgos.map((hallazgo) => ({
      regla: hallazgo.regla,
      archivo: hallazgo.archivo,
      detalle: hallazgo.detalle,
    }));
    writeFileSync(
      rutaLineaBase,
      `${JSON.stringify(
        {
          descripcion:
            'Deuda Atomic congelada por CORE-GATES-20260824-01. Solo puede encoger. ' +
            'Una entrada nueva exige una decision escrita, no una regeneracion.',
          generadoPor: 'governance/consumer/check-atomic-rules.mjs --update-baseline',
          entradas,
        },
        null,
        2,
      )}\n`,
      'utf8',
    );
    console.log(
      `Linea base escrita en ${RUTA_LINEA_BASE} con ${entradas.length} incumplimientos heredados.`,
    );
    return;
  }

  const lineaBase = leerLineaBase(rutaLineaBase);
  const conocidos = new Set(lineaBase.entradas.map((entrada) => clave(entrada)));
  const vistos = new Set();

  const nuevos = [];
  let heredados = 0;
  for (const hallazgo of hallazgos) {
    const identidad = clave(hallazgo);
    vistos.add(identidad);
    if (conocidos.has(identidad)) {
      heredados += 1;
      continue;
    }
    nuevos.push(hallazgo);
  }

  const resueltos = lineaBase.entradas.filter((entrada) => !vistos.has(clave(entrada)));

  if (nuevos.length > 0) {
    console.error(
      `Reglas Atomic: ${nuevos.length} incumplimiento(s) NUEVO(s) fuera de la linea base.`,
    );
    for (const hallazgo of nuevos) {
      console.error(`- [${hallazgo.regla}] ${hallazgo.archivo}:${hallazgo.linea} ${hallazgo.detalle}`);
    }
    console.error(
      '\nLa linea base congela la deuda que ya existia; no admite deuda nueva. ' +
        'Corrija el hallazgo, o justifique por escrito por que la regla no aplica ' +
        'antes de regenerar la linea base.',
    );
    process.exit(1);
  }

  const porRegla = new Map();
  for (const entrada of lineaBase.entradas) {
    porRegla.set(entrada.regla, (porRegla.get(entrada.regla) ?? 0) + 1);
  }
  const resumen = [...porRegla.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([regla, total]) => `${regla}: ${total}`)
    .join(', ');

  console.log(
    `Reglas Atomic verificadas: 0 incumplimientos nuevos; ${heredados} heredados en la linea base` +
      (resumen ? ` (${resumen})` : '') +
      '.',
  );

  if (resueltos.length > 0) {
    console.log(
      `${resueltos.length} entrada(s) de la linea base ya no se reproducen. ` +
        'Ejecute --update-baseline para retirarlas y dejar constancia de la deuda pagada:',
    );
    for (const entrada of resueltos) {
      console.log(`  - [${entrada.regla}] ${entrada.archivo} ${entrada.detalle}`);
    }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  ejecutar();
}
