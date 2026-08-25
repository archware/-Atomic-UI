const fs = require('node:fs');
const path = require('node:path');

// REGISTRO DE DEUDA, no lista de permitidos. Cada entrada es un componente que
// todavia responde al alias `prest-*` porque hay marcado de consumidor
// escrito asi. El canonico `app-*` debe ir primero; el alias solo acompana.
// La lista deberia encoger con el tiempo: que crezca sin motivo escrito es la
// senal de que se dejo de migrar marcado y se empezo a normalizar la excepcion.
const ALIAS_TRANSITORIOS_DEL_ADN = new Set([
  'atoms/choice-control/choice-control.ts',
  'atoms/form-input/input.ts',
  'atoms/form-select/select.ts',
  'atoms/table-action/table-action.ts',
  'atoms/toggle/toggle.component.ts',
  'molecules/action-group/action-group.component.ts',
  // 5.6.0: alert unifica su API con la del consumidor, que la invoca como
  // `prest-alert` en 26 ficheros y por tres repos.
  'molecules/alert/alert.component.ts',
  'organisms/crud-dialog/crud-dialog.ts',
  'organisms/data-table/data-table.ts',
  'organisms/denomination-counter/denomination-counter.ts',
  'organisms/form-dialog/form-dialog.ts',
  'organisms/page-header/page-header.ts',
  'organisms/print-document-panel/print-document-panel.ts',
  'organisms/query-toolbar/query-toolbar.ts',
  'organisms/receipt-panel/receipt-panel.ts',
]);

function listTypeScriptFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .sort((left, right) => left.name.localeCompare(right.name, 'en'))
    .flatMap((entry) => {
      const candidate = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return listTypeScriptFiles(candidate);
      }
      return entry.isFile() && entry.name.endsWith('.ts') ? [candidate] : [];
    });
}

/*
LA AUDITORIA SE EXPORTA PARA QUE EL CONSUMIDOR NO LA REESCRIBA.

El registro de deuda de arriba es del ADN y solo del ADN. Un consumidor tiene el
suyo, con otros componentes y otras fechas, y por eso `aliasTransitorios` es un
parametro: la REGLA es comun, el inventario de excepciones no.

`governance/consumer/check-atomic-rules.mjs` la invoca con el conjunto vacio y
resuelve las excepciones contra su propia linea base, que es un trinquete y no
una lista escrita a mano.
*/
function auditarSelectores(uiRoot, aliasTransitorios = ALIAS_TRANSITORIOS_DEL_ADN) {
  const hallazgos = [];
  let declaraciones = 0;
  let aliases = 0;

  for (const filePath of listTypeScriptFiles(uiRoot)) {
    const relativePath = path.relative(uiRoot, filePath).replaceAll('\\', '/');
    const content = fs.readFileSync(filePath, 'utf8');
    const selectorPattern = /selector\s*:\s*(['"`])([^'"`]+)\1/gu;
    for (const match of content.matchAll(selectorPattern)) {
      declaraciones += 1;
      const linea = content.slice(0, match.index).split(/\r?\n/u).length;
      const selectors = match[2].split(',').map((selector) => selector.trim());
      const prestSelectors = selectors.filter((selector) => selector.startsWith('prest-'));
      if (prestSelectors.length === 0) {
        continue;
      }
      aliases += prestSelectors.length;
      if (!aliasTransitorios.has(relativePath)) {
        hallazgos.push({
          rutaArchivo: filePath,
          rutaRelativa: relativePath,
          linea,
          detalle: 'el alias prest-* no está en la excepción transitoria.',
        });
      }
      for (const legacySelector of prestSelectors) {
        const canonicalSelector = `app-${legacySelector.slice('prest-'.length)}`;
        if (selectors[0] !== canonicalSelector || !selectors.includes(canonicalSelector)) {
          hallazgos.push({
            rutaArchivo: filePath,
            rutaRelativa: relativePath,
            linea,
            detalle: `${legacySelector} debe acompañar a ${canonicalSelector} y el selector app-* debe aparecer primero.`,
          });
        }
      }
    }
  }

  return { hallazgos, declaraciones, aliases };
}

function ejecutar() {
  const uiRoot = path.resolve(process.argv[2] || 'src/app/shared/ui');
  const { hallazgos, declaraciones, aliases } = auditarSelectores(uiRoot);

  if (hallazgos.length > 0) {
    console.error('El gobierno de selectores Atomic detectó incumplimientos:');
    for (const hallazgo of hallazgos) {
      console.error(`- ${hallazgo.rutaRelativa}: ${hallazgo.detalle}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(
    `Gobierno de selectores aprobado: ${declaraciones} declaraciones; ${aliases} aliases prest-* acotados.`,
  );
}

if (require.main === module) ejecutar();

module.exports = { auditarSelectores, listTypeScriptFiles, ALIAS_TRANSITORIOS_DEL_ADN };
