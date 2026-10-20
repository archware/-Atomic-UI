import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/*
COMPUERTA DE LA ETIQUETA DE CAMPO — ningun tamano literal en la etiqueta de un control.

La etiqueta de un campo (superior o flotante) leia `0.9375rem`, `1.0625rem`, `-0.625rem`,
`uppercase` y pesos propios segun el control que la dibujaba: tres controles, tres etiquetas.
El contrato unico vive en tokens `--field-label-*` y en `atoms/form-field/field-label.css`; esta
compuerta impide que una etiqueta de campo vuelva a escribir un tamano, una separacion o una
mayuscula forzada a mano.

DESCUBRIR, NO DECLARAR. El conjunto de ficheros auditados no se enumera: es todo CSS/SCSS de
`src/app/shared/ui` cuyo componente hermano implementa `ControlValueAccessor` (usa
`NG_VALUE_ACCESSOR`), mas la hoja compartida de la etiqueta. Un control nuevo entra solo. Si el
barrido no descubre ningun control, la compuerta FALLA: una guarda sin entrada no certifica nada.

QUE SE CONSIDERA ETIQUETA. Un selector con una clase cuyo nombre contenga `label` (`fl-label`,
`floating-label`, `field__label`, `textarea-label`, `number-input__label`, ...).

EXCEPCION. Una clase con `label` que no es la etiqueta de un campo (p. ej. la cabecera de dias de un
calendario) lo declara dentro de su regla con un comentario `gate-etiqueta-exento: <motivo>`; el
motivo es obligatorio y queda a la vista en el diff.

QUE SE RECHAZA dentro de esas reglas:
- cualquier literal `px | rem | em` en propiedades de tamano, separacion o posicion, tambien dentro
  del respaldo de un `var()`;
- `text-transform: uppercase`;
- `font-weight` numerico (la escala la gobierna `check-typography-scale`; aqui se repite porque la
  etiqueta es el sitio donde aparecia).
*/

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const origenPorDefecto = resolve(raiz, 'src/app/shared/ui');

// Etiquetas de campo con literales al fijar la compuerta: 0. Es una prohibicion, no un trinquete.
const MAXIMO_LITERALES = 0;

const PROPIEDADES_DE_MEDIDA = new Set([
  'font-size',
  'line-height',
  'letter-spacing',
  'top',
  'right',
  'bottom',
  'left',
  'width',
  'height',
  'min-width',
  'max-width',
  'min-height',
  'max-height',
  'gap',
  'margin',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'padding',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'inset',
  'transform',
]);

/** gate-etiqueta-exento: <motivo> dentro de la regla: la clase no es la etiqueta de un campo. */
const EXCEPCION = /\/\*[\s\S]*?gate-etiqueta-exento:\s*(?!\*\/)\S[\s\S]*?\*\//u;
const LITERAL_DE_MEDIDA = /(?<![\w-])-?(?:\d+\.?\d*|\.\d+)(?:px|rem|em)\b/u;
const CLASE_DE_ETIQUETA = /\.[\w-]*label[\w-]*/u;

function recolectar(directorio, extensiones) {
  const encontrados = [];
  for (const entrada of readdirSync(directorio, { withFileTypes: true })) {
    const ruta = join(directorio, entrada.name);
    if (entrada.isDirectory()) {
      encontrados.push(...recolectar(ruta, extensiones));
    } else if (extensiones.has(extname(entrada.name))) {
      encontrados.push(ruta);
    }
  }
  return encontrados;
}

/** Un control de formulario implementa ControlValueAccessor o consume el contrato field-label. */
function esControlDeFormulario(rutaEstilo) {
  const carpeta = dirname(rutaEstilo);
  return readdirSync(carpeta).some((nombre) => {
    if (!nombre.endsWith('.ts') || nombre.endsWith('.spec.ts') || nombre.endsWith('.stories.ts')) {
      return false;
    }
    const fuente = readFileSync(join(carpeta, nombre), 'utf8');
    return fuente.includes('NG_VALUE_ACCESSOR') || fuente.includes('field-label');
  });
}

function quitarComentarios(texto) {
  // Se sustituye por espacios para conservar los desplazamientos y, con ellos, las lineas.
  return texto.replace(/\/\*[\s\S]*?\*\//gu, (comentario) => comentario.replace(/[^\n]/gu, ' '));
}

/** Reglas planas `selector { cuerpo }`; las reglas dentro de @media se encuentran igual. */
function* reglas(texto) {
  const limpio = quitarComentarios(texto);
  for (const coincidencia of limpio.matchAll(/([^{}]+)\{([^{}]*)\}/gu)) {
    const selector = coincidencia[1].trim();
    if (selector.startsWith('@')) continue;
    const desplazamiento = coincidencia.index + coincidencia[1].length + 1;
    // El comentario de excepcion vive en el cuerpo original, que quitarComentarios ya borro.
    const original = texto.slice(desplazamiento, desplazamiento + coincidencia[2].length);
    yield { selector, cuerpo: coincidencia[2], desplazamiento, exento: EXCEPCION.test(original) };
  }
}

function lineaDe(texto, desplazamiento) {
  return texto.slice(0, desplazamiento).split(/\r?\n/u).length;
}

/**
 * Audita las hojas de estilo de controles de formulario y devuelve cada literal hallado.
 * Exportada para que un consumidor reutilice la misma regla.
 */
export function auditarEtiquetasDeCampo(origen = origenPorDefecto, raizRelativa = origen) {
  const estilos = recolectar(origen, new Set(['.css', '.scss'])).filter(
    (ruta) => esControlDeFormulario(ruta) || ruta.endsWith('field-label.css'),
  );
  const hojaFormulariosTema = resolve(origen, '../../../styles/themes/_forms.css');
  if (existsSync(hojaFormulariosTema)) {
    estilos.push(hojaFormulariosTema);
  }
  const hallazgos = [];

  for (const ruta of estilos) {
    const texto = readFileSync(ruta, 'utf8');
    for (const regla of reglas(texto)) {
      if (regla.exento) continue;
      if (!regla.selector.split(',').some((parte) => CLASE_DE_ETIQUETA.test(parte))) continue;
      let cursor = 0;
      for (const declaracion of regla.cuerpo.split(';')) {
        const posicion = regla.desplazamiento + cursor;
        cursor += declaracion.length + 1;
        const separador = declaracion.indexOf(':');
        if (separador < 0) continue;
        const propiedad = declaracion.slice(0, separador).trim().toLowerCase();
        const valor = declaracion.slice(separador + 1).trim();
        let motivo = null;
        if (PROPIEDADES_DE_MEDIDA.has(propiedad) && LITERAL_DE_MEDIDA.test(valor)) {
          motivo = `literal de medida (${valor.match(LITERAL_DE_MEDIDA)[0]}); use var(--field-label-*), var(--space-*) o var(--text-*)`;
        } else if (propiedad === 'text-transform' && /uppercase/iu.test(valor)) {
          motivo = 'mayusculas forzadas; la etiqueta conserva el texto del consumidor';
        } else if (propiedad === 'font-weight' && /^\d{3}$/u.test(valor)) {
          motivo = 'peso tipografico numerico; use var(--field-label-font-weight)';
        }
        if (motivo) {
          hallazgos.push({
            archivo: relative(raizRelativa, ruta).replaceAll('\\', '/'),
            linea: lineaDe(texto, posicion + declaracion.search(/\S/u)),
            selector: regla.selector.replace(/\s+/gu, ' '),
            propiedad,
            motivo,
          });
        }
      }
    }
  }

  return { hallazgos, descubiertos: estilos.length };
}

function ejecutar() {
  // Un directorio como primer argumento sustituye al origen: lo usa la prueba negativa de la guarda.
  const origen = process.argv[2] ? resolve(process.argv[2]) : origenPorDefecto;
  if (!existsSync(origen) || !statSync(origen).isDirectory()) {
    console.error(`- No existe el origen a auditar: ${origen}`);
    process.exit(2);
  }
  const { hallazgos, descubiertos } = auditarEtiquetasDeCampo(origen, origen);

  // Una guarda sin entrada no certifica nada: el arnes esta roto, no el codigo.
  if (descubiertos === 0) {
    console.error('- El barrido no descubrio ningun control de formulario: la compuerta no certifica nada.');
    process.exit(2);
  }

  if (hallazgos.length > MAXIMO_LITERALES) {
    console.error(
      `Etiquetas de campo con medidas a mano: ${hallazgos.length} (maximo ${MAXIMO_LITERALES}).`,
    );
    for (const hallazgo of hallazgos) {
      console.error(
        `- ${hallazgo.archivo}:${hallazgo.linea} ${hallazgo.selector} { ${hallazgo.propiedad} } -> ${hallazgo.motivo}`,
      );
    }
    process.exit(1);
  }

  console.log(
    `Etiquetas de campo verificadas: ${descubiertos} hojas de controles descubiertas, ` +
      `${hallazgos.length}/${MAXIMO_LITERALES} medidas a mano.`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  ejecutar();
}
