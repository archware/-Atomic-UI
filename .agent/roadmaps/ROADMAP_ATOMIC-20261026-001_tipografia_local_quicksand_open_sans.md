---
title: "Tipografía local canónica Quicksand y Open Sans en Atomic UI y consumidores"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-10-26"
last_updated: "2026-10-26"
document_type: "roadmap de asignación"
status: "completado"
version: "1.0.0"
change_id: "ATOMIC-20261026-003"
---

# Tipografía local canónica Quicksand y Open Sans en Atomic UI y consumidores

## Autoridad y ficha por riesgo

```yaml
asignacion: ATOMIC-20261026-003
ruta: estandar
justificacion: "Evolución upstream-first del sistema de temas de Atomic UI para empaquetar localmente las fuentes Quicksand y Open Sans en formato woff2, definir tokens de familia tipográfica y propagarlos a consumidores gobernados y al puente Dart."
firmas: usuario_autoriza_boost_procede
repositorio: "C:/Users/cotaha/source/repos/-Atomic-UI"
rama: main
oid_base: dd93734a3eea40b87d46b4990976231fe2d6ca19
```

## Objetivo y alcance

Adoptar en `-Atomic-UI` una combinación tipográfica 100 % local y sin dependencias de red en tiempo de ejecución:
- **`Open Sans`** (`400`, `500`, `600`, `700` en subconjuntos `latin` y `latin-ext`) para texto corrido, tablas, etiquetas y controles interactivos mediante `--font-family-base`.
- **`Quicksand`** (`400`, `500`, `600`, `700` con cobertura `latin` y `latin-ext`) para encabezados (`h1`–`h6`), títulos de página, cabeceras de diálogos/modales y métricas de tarjetas KPI mediante `--font-family-heading`.
- **`--font-family-mono`** para bloques y elementos de código (`code`, `pre`, `kbd`, `samp`).

## Tareas ejecutadas

- [x] **T1 — Empaquetado local de fuentes `.woff2` y hoja `_fonts.css`:**
  - Copia de 12 archivos `.woff2` (`open-sans-latin-{400,500,600,700}-normal.woff2`, `open-sans-latin-ext-{400,500,600,700}-normal.woff2` y `quicksand-all-{400,500,600,700}.woff2`) en `src/styles/themes/fonts/`.
  - Creación de `src/styles/themes/_fonts.css` con declaraciones `@font-face` (`font-display: swap`) e importación al inicio de `src/styles/themes/index.css`.
  - Retiro de importaciones redundantes `@import "@fontsource/open-sans/..."` en `src/styles.css`, `tools/create-project.js`, `ventas-cxc/src/styles.css` y `pdf-tool/frontend/src/styles.css`.
- [x] **T2 — Tokens primitivos, componentes y estilos globales:**
  - Definición de `--font-family-base`, `--font-family-heading` y `--font-family-mono` en `src/styles/themes/_tokens-primitives.css`.
  - Enlace de `--heading-font-family: var(--font-family-heading)` y `--table-font-family: var(--font-family-base)` en `src/styles/themes/_tokens-components.css`.
  - Aplicación global en `src/styles/themes/index.css` (`html, body`, `h1`–`h6`, `code, pre, kbd, samp` y `button, input, optgroup, select, textarea`).
  - Aplicación de `var(--font-family-heading)` en `text.component.css`, `page-header.scss`, `pagina-crud.scss`, `pagina-crud-accordion.scss`, `modal.component.css`, `modal-container.component.css`, `popup-container.component.css`, `form-dialog.scss` y `kpi-card.component.css`, y de `var(--font-family-base)` en `version.component.css`.
- [x] **T3 — Herramientas de gobernanza, distribución y puente Dart:**
  - Actualización de `scripts/check-typography-scale.mjs` para excluir `_fonts.css`, comentarios de bloque CSS y bloques `@font-face` del conteo de pesos escritos a mano, junto con la prueba negativa `tools/test-typography-scale-gate.mjs`.
  - Inclusión de `.woff2` en `sourceInventory.roots` de `distribution/package-contract.json` y validación en `tools/copy-lib-tokens.cjs` de que `_fonts.css` y todas sus fuentes `.woff2` referenciadas se copien a `dist/atomic-ui/tokens/fonts/`.
  - Actualización de `scripts/emit-dart-tokens.mjs` para enlazar `fontFamily: AtomicFamilias.fontFamilyHeading` en `displayLarge`, `displayMedium`, `headlineMedium`, `titleLarge` y `titleMedium` de `TextTheme` y regeneración de `dart/atomic_tokens`.
- [x] **T4 — Manifiesto, documentación y sincronización con consumidores:**
  - Regeneración de `distribution/atomic-source-manifest.json`, ejecución de `npm run lib:build`, `npx ng build` y las 19 compuertas de `npm run governance:check`.
  - Sincronización de temas y componentes gobernados en `ventas-cxc` y `pdf-tool/frontend`, reconciliación de `docs/atomic-provenance.json` y verificación de `npm run check:atomic`, `npm run check:atomic-rules` y `npx ng build`.

## Reversión (Rollback)

Restaurar los archivos de tema (`src/styles/themes/`), componentes tocados, scripts (`scripts/check-typography-scale.mjs`, `scripts/emit-dart-tokens.mjs`, `tools/copy-lib-tokens.cjs`, `tools/create-project.js`, `tools/test-typography-scale-gate.mjs`), `distribution/package-contract.json`, `dart/atomic_tokens/` y `distribution/atomic-source-manifest.json` al commit previo, y ejecutar `node scripts/reconcile-provenance.cjs` en los consumidores.
