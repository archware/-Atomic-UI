---
title: "Compatibilidad de minimatch para las herramientas de Atomic UI"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-11-02"
last_updated: "2026-11-02"
version: "1.0.0"
change_id: "ATOMIC-20261102-004"
document_type: "manual técnico"
status: "vigente"
---

# Compatibilidad de minimatch para las herramientas de Atomic UI

El paquete privado `@atomic-ui/compatibilidad-minimatch@1.0.0` conserva la
superficie de minimatch 3 que utilizan las versiones contrastadas de glob 7,
Karma 6, karma-coverage, ESLint y fork-ts-checker. Su identidad corresponde a
una fachada local; no se presenta como una versión oficial de minimatch.
La coincidencia y el análisis de segmentos se delegan exclusivamente en el
motor oficial `minimatch@11.0.4`, instalado bajo el alias `motor-minimatch`.

La dependencia raíz `minimatch: file:tools/compatibilidad-minimatch` y el
override `minimatch@<4: $minimatch` permiten que npm resuelva la fachada y su
motor de forma reproducible. El segundo rango,
`minimatch@>=4 <11.0.1: 11.0.4`, entrega directamente el motor moderno a los
clientes modernos. No se aplica la exportación CJS antigua a esos clientes.
El manifiesto y el lock conservan el nombre y la versión real del motor.

| Superficie | Comportamiento |
|---|---|
| Función CJS y `minimatch` | Coincidencia completa mediante un motor privado. |
| `Minimatch` y `defaults` | Clase adaptada y composición de opciones sin mutar entradas. |
| `filter`, `match`, `braceExpand` | Selección, duplicados, nonull y expansión oficial. |
| `globSet`, `globParts`, `set` | Alternativas ordenadas sin fusionar ni deduplicar; segmentos seguros. |
| `_glob`, `test`, `Symbol.match` | Adaptación del Matcher oficial al consumo de glob 7. |
| `GLOBSTAR`, `Minimatch.GLOBSTAR` | Identidad estricta del símbolo oficial. |
| `sep` | Separador de la plataforma Node efectiva. |

En Windows real, las barras inversas de las rutas se normalizan a `/`; los
patrones se normalizan salvo `allowWindowsEscape: true`. El motor privado
recibe explícitamente semántica POSIX y optimización cero para conservar las
reglas de minimatch 3 sobre unidades, UNC, `.` y `..`. Las rutas UNC de las
pruebas son cadenas sintéticas y no provocan conexiones de red.
Los clientes modernos conservan sus opciones modernas sin esa adaptación.

La fachada conserva los límites oficiales de longitud, expansión y recursión.
No implementa `makeRe`, `matchOne`, `_src`, AST ni un compilador alternativo
de expresiones regulares. La guarda comprueba físicamente las identidades, versiones y resoluciones de
`minimatch`, `motor-minimatch` y `deepmerge`. `npm run check:dependencias`
ejecuta también la verificación separada del backport de Storybook. La guarda
no certifica todo el grafo npm, sus subrutas ni todos los usos de la API.
El corpus de compatibilidad y seguridad se ejecuta por separado en TEMP, con
una instalación de referencia preservada para el contraste.

La sustitución independiente de `deepmerge` se limita a
`fork-ts-checker-webpack-plugin@9.1.0`, mediante el alias explícito
`npm:@stackline/deepmerge@1.1.0`. Se conservan las opciones predeterminadas;
no se activan opciones estrictas o estrategias nuevas. El reemplazo es una
implementación independiente compatible con v4 y no se atribuye al proyecto
original. El corpus contrasta fusión ordinaria y la configuración real del
plugin, y comprueba el prototipo del resultado frente al aviso publicado.

La copia embebida de minimatch en Storybook 10.6.5 recibe el backport mínimo
mediante `tools/corregir-storybook-minimatch.cjs`. El postinstall descubre la
instalación y el candidato, verifica versión, ruta y SHA-256, y aplica tres
sustituciones exactas. El modo `--check` no escribe y falla si el parche falta
o aparecen bytes, versiones o candidatos desconocidos. El parche limita la
amplificación y las comparaciones cuadráticas; no reemplaza íntegramente el
motor embebido. El glob real de ese bundle se contrasta antes y después.

La retirada se realiza cuando todos los consumidores antiguos hayan migrado
a la API moderna: se descubre de nuevo el árbol, se eliminan la dependencia
local y el override antiguo en una asignación propia, y se repiten instalación
limpia, corpus, audit, lint, cobertura y construcciones. El backport se retira
cuando una versión oficial contrastada incorpore la corrección; el fallo de
hash evita aplicarlo silenciosamente a una actualización desconocida.

## Procedencia y licencias

El motor oficial minimatch 11 se distribuye bajo BlueOak-1.0.0; sus avisos se
conservan en el paquete instalado. La implementación independiente
`@stackline/deepmerge@1.1.0` se distribuye bajo MIT y conserva su NOTICE.
La fachada no copia sus algoritmos. El backport procede del
[commit oficial 77a0f5c](https://github.com/isaacs/minimatch/commit/77a0f5c4b80bdc641c3c930a1d9edf5ad2db57f8),
conservando los avisos de licencia del bundle. Las integridades publicadas
quedan en el lock y en la evidencia original de la asignación.

Los avisos y fuentes de referencia son
[GHSA-g3hv-75wg-m249](https://github.com/isaacs/minimatch/security/advisories/GHSA-g3hv-75wg-m249),
[GHSA-gcqx-w48m-w2h4](https://github.com/advisories/GHSA-gcqx-w48m-w2h4) y la
[implementación independiente 1.1.0](https://github.com/alexandroit/stackline-deepmerge/tree/v1.1.0).
