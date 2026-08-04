const fs = require('node:fs');
const path = require('node:path');

const uiRoot = path.resolve('src/app/shared/ui');
const transitionalAliasFiles = new Set([
  'atoms/choice-control/choice-control.ts',
  'atoms/form-input/input.ts',
  'atoms/form-select/select.ts',
  'atoms/table-action/table-action.ts',
  'atoms/toggle/toggle.component.ts',
  'molecules/action-group/action-group.component.ts',
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

const violations = [];
let selectorCount = 0;
let transitionalAliasCount = 0;

for (const filePath of listTypeScriptFiles(uiRoot)) {
  const relativePath = path.relative(uiRoot, filePath).replaceAll('\\', '/');
  const content = fs.readFileSync(filePath, 'utf8');
  const selectorPattern = /selector\s*:\s*(['"`])([^'"`]+)\1/gu;
  for (const match of content.matchAll(selectorPattern)) {
    selectorCount += 1;
    const selectors = match[2].split(',').map((selector) => selector.trim());
    const prestSelectors = selectors.filter((selector) => selector.startsWith('prest-'));
    if (prestSelectors.length === 0) {
      continue;
    }
    transitionalAliasCount += prestSelectors.length;
    if (!transitionalAliasFiles.has(relativePath)) {
      violations.push(`${relativePath}: el alias prest-* no está en la excepción transitoria.`);
    }
    for (const legacySelector of prestSelectors) {
      const canonicalSelector = `app-${legacySelector.slice('prest-'.length)}`;
      if (selectors[0] !== canonicalSelector || !selectors.includes(canonicalSelector)) {
        violations.push(
          `${relativePath}: ${legacySelector} debe acompañar a ${canonicalSelector} y el selector app-* debe aparecer primero.`,
        );
      }
    }
  }
}

if (violations.length > 0) {
  console.error('El gobierno de selectores Atomic detectó incumplimientos:');
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exitCode = 1;
} else {
  console.log(
    `Gobierno de selectores aprobado: ${selectorCount} declaraciones; ${transitionalAliasCount} aliases prest-* acotados.`,
  );
}
