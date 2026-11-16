---
title: "Roadmap ATOMIC-20261114-001: Títulos centrados, completitud de catálogo y sincronización de consumidores"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-11-14"
last_updated: "2026-11-14"
version: "1.1.0"
change_id: "ATOMIC-20261114-001"
document_type: "roadmap de mejora"
status: "completado"
---

# Roadmap ATOMIC-20261114-001: Títulos centrados, completitud de catálogo y sincronización de consumidores

## Ficha de cambio por riesgo

- **Identificador de cambio:** `ATOMIC-20261114-001`
- **Ruta de ejecución:** `estandar` (§17.0 ORQ-20261022-001 — evolución transversal de diseño y catálogo UI en `-Atomic-UI` con propagación controlada hacia consumidores activos).
- **Línea base Git de `-Atomic-UI`:** OID `33caab89f4f3619dd46b2aa4752c00d820fd17b8` (estado previo preservado).
- **Alcance autorizado:**
  - Origen canónico: `c:\Users\cotaha\source\repos\-Atomic-UI`.
  - Consumidores activos de sincronización: `ventas-cxc`, `pdf-tool/frontend` (preservando anclaje `atomicRef` + régimen `adapted`), `demo-chasis-front`, `saas-admin-front`, `saas-erp-front`, `saas-pos-front`, `citas-medicas-web` y ajustes compatibles en `prestamo_front_atomic`.
- **Exclusiones estrictas:** No intervenir `SGP_BE`, `hra_*`, `base_*`, `bcp_pdf_extractor`, `10022024-BASE-WEB`, `Entregable-CitasMedicas`, `camas-nfc-web` (otro agente en curso según `ALCANCE.txt`) ni módulos `src/app/features/` en curso en consumidores.

## Objetivos técnicos

1. **Centrado óptico de títulos y corrección de marca lateral:**
   - Evolucionar `PageHeader` con `PageHeaderAlignment = 'start' | 'center'` (`align = 'center'` por defecto) y rejilla simétrica de 3 columnas que mantiene acciones a la derecha sin desplazar el centro óptico.
   - Propagar `headerAlign` en `pagina-wizard`, `pagina-crud`, `pagina-crud-accordion`, `pagina-dashboard`, `pagina-detalle-pestanas`, `FormDialog` y `CardComponent`; centrar simétricamente `ModalComponent`, `ModalContainerComponent`, `PopupContainerComponent` y cabeceras de diálogo/confirmación en `pagina-crud-accordion`.
   - Limpiar CSS no canónico (`overflow: visible !important`, medidas `rem` crudas en lugar de tokens `--form-row-gap`/`--space-*`, `::ng-deep` en `modal.component.css`, `font-weight: bold` en `sidebar.component.css`, y `style="..."` en blueprints/showcase).
   - Corregir truncamiento de `"Atomic ..."` en `SidebarComponent` reubicando `.logo-badges` en `.logo-subtitle-row` con `var(--icon-sm)`.
2. **Canonización de artefactos faltantes en `-Atomic-UI`:**
   - Crear organismo `ConfirmDialog` (`organisms/confirm-dialog/`) con soporte declarativo y por servicio (`ConfirmDialogService` ubicado en `organisms/confirm-dialog/` para respetar el inventario cerrado de `services/`).
   - Agregar `ChangeDetectionStrategy.OnPush` a `LinkComponent` y completar exportaciones públicas en `src/app/shared/ui/index.ts`.
   - Completar las 45 fichas faltantes en `catalog/components/*.json` más la actualización de fichas existentes (`page-header`, `pagina-crud`, `form-dialog`, `card`), con validación AST (`check-catalog-api.cjs`) y catálogo estricto (`check-atomic-catalog.js --require-complete --strict-references`).
   - Completar pruebas unitarias (`confirm-dialog`, `pagina-wizard`, `link`, `page-header`, `form-dialog`, `sidebar`) y 9 historias Storybook faltantes (`pagina-wizard`, `pagina-ajustes`, `pagina-detalle-pestanas`, `ui-floating-textarea`, `ui-confirm-dialog`, `auth-banner`, `form-actions`, `profile-cover`, `setting-item`).
   - Regenerar `documentation.json` y `distribution/atomic-source-manifest.json`.
3. **Sincronización de consumidores y compuertas transversales:**
   - Propagar cambios hacia consumidores activos manteniendo sus reglas de procedencia (`docs/atomic-provenance.json`), reparando el formato de procedencia en `citas-medicas-web` y validando compilación/pruebas de cada consumidor.
   - Ejecutar compuertas del ecosistema (`verificar-adn-frontend.ps1`, `verificar-control-flow-angular.ps1`, `verificar-contratos.ps1`, `verificar-secretos.ps1`, `generar-indice-documental.ps1 -Verificar`, `verificar-vigencia.ps1`).

## Plan de reversión (rollback)

- Todo cambio en `-Atomic-UI` y consumidores queda sin `commit`; ante cualquier regresión, puede revertirse puntualmente por archivo sobre la línea base registrada (`33caab89f4f3619dd46b2aa4752c00d820fd17b8`) preservando el trabajo previo.

## Registro de tareas

- [x] `T1`: Apertura de roadmap y registro de línea base (`ATOMIC-20261114-001`).
- [x] `T2`: Centrado simétrico de cabeceras, eliminación de estilos ad-hoc y corrección de truncamiento en `SidebarComponent`.
- [x] `T3`: Canonización de `ConfirmDialog`, exportaciones en `index.ts`, 45 fichas de catálogo JSON, pruebas y 9 historias Storybook en `-Atomic-UI`.
- [x] `T4`: Sincronización controlada de consumidores activos y verificación individual de cada proyecto.
- [x] `T5`: Ejecución de compuertas transversales y cierre de continuidad documental (incluyendo auditoría anti-solapamiento, compactación CSS `< 6.00 kB` y limpieza EOF).

## Evidencia de cierre

- **`-Atomic-UI` (`5.22.0`, política `1.2.3`, `sourceTreeSha256: 5b53c57599833817050841b810ca8745688805900c6d457c358c626362203374`, `345` archivos en manifiesto):** `ChromeHeadless` (`888` SUCCESS), `lint` (`0` errores, `1` aviso), `build`, `lib:build`, `governance:smoke`, `package:check`, `check:units` (`107` hojas), `check:css-values`, `check:contrast` (`3` temas × `36` pares), `check:focus`, `check:catalog-api` (`84` componentes, `725` entradas), `catalog:check` (`106` fichas) y `git diff --check` con salida `0`. Auditoría final resuelta en:
  - `ShowcasePageComponent`: reubicación de `<app-panel title="Identidad de Artefactos...">` (`titleAlign="center"`, `titleWeight="bold"`) y `Information Panels` dentro de `.content-sections`, mantenimiento de modales/popups cerrados fuera de paneles elevados, sustitución de clases inexistentes `mb-md`/`mb-sm`/`mt-md` por `mb-4`/`mb-2`/`mt-4` y `--form-row-gap`, eliminando el solapamiento visual.
  - `AboutDialogComponent`: getter `normalizedCopyrightText` que retira `©`/`(c)` inicial duplicado, centrado horizontal en `card` (`margin-inline: auto`) y cabecera de `popup`, y compactación CSS sin pérdida (`5.85 kB` compilados en `demo-chasis-front`, bajo el umbral `6.00 kB`), más prueba unitaria dedicada.
  - `PageHeader`, `FormDialog`, `Panel`, `PopupContainer`, `Sidebar`, `ui-showcase` y `dialogs-page`: guardias de rejilla simétrica (`minmax(0, ...)`), `.panel__header-actions:empty { display: none; }`, respaldo de 1 columna en `.popup-header:not(:has(.popup-icon))`, `min-width: 0` + elipsis en `.user-info`/`.user-name`/`.user-role` de `SidebarComponent`, centrado de encabezados en showcases/blueprints, retiro de 4 `style="..."` en `showcase-data-display` y limpieza de espacios/EOF en 13 fuentes upstream para `git diff --check` limpio en los 9 repositorios.
  - Al quedar pendiente la autorización de `git commit` en `-Atomic-UI`, la procedencia de consumidores no anclados se validó contra el árbol preparado actual mediante `verify_staged_provenance.cjs` (caché temporal ya depurada con `--cleanup`, `STAGED_TEMP_EXISTS=False`); cuando el dueño autorice `git commit`, bastará actualizar `atomicRef` al nuevo `HEAD` para que `npm run check:atomic` directo valide contra repositorio limpio.
- **`ventas-cxc`:** `reconcile:atomic` + `verify_staged_provenance.cjs` (`97` componentes, `5` servicios), `check:atomic-rules` (`0` nuevos, `16` heredados `selectores`), `ng build` y `npx ng test --watch=false` (`138` archivos, `1949` pruebas) con salida `0`.
- **`pdf-tool/frontend`:** conserva `atomicRef: b76f432976d6c1e47de57ee4b4be5821a5195dd8` (`policyVersion: 1.2.3`); `check:atomic:pin` (`66` componentes, `5` servicios), `check:css`, `check:theme`, `check:types`, `ng build` (`4.351s`, sin aviso de presupuesto en `sidebar.component.css`) y `npx ng test --watch=false` (`31` archivos, `325` pruebas) con salida `0`.
- **`demo-chasis-front`:** `modelos-crud.ts` espejado y ajustes puntuales en `showcase-feedback`, `clientes.pagina.ts` (`[required]="true"`) y `productos.facade.ts` (`string | null`); línea base `29 -> 17` (`0` `control-flow`), `check:atomic-rules`, `verify_staged_provenance.cjs` (`95` componentes, `5` servicios) y `ng build` vía junction temporal depurada (`exists=false`) con salida `0`.
- **`saas-admin-front`, `saas-erp-front` y `saas-pos-front`:** `form-error`, `floating-input` y `crud-dialog` promovidos a `exact`; líneas base `344 -> 181`, `369 -> 206` y `352 -> 189` (`0` `control-flow`), `check:atomic-rules`, `verify_staged_provenance.cjs` (`80` componentes y `5` servicios en los tres) y `ng build` vía junction temporal depurada (`exists=false`) con salida `0`.
- **`citas-medicas-web`:** manifiesto `docs/atomic-provenance.json` reconstruido, BOM retirado en `package.json`, `modelos-crud.ts` espejado, `form-error`/`floating-input`/`crud-dialog` promovidos a `exact` y remediación ADN en 10 archivos de `src/app/features/**` (`SelectComponent`, `FloatingInputComponent`, `PageHeader`, `CardComponent` y utilidades de `_utilities.css`); línea base `344 -> 181` (`0` `control-flow`), `check:atomic-rules`, `verify_staged_provenance.cjs` (`82` componentes, `5` servicios) y `ng build` vía junction temporal depurada (`exists=false`) con salida `0`.
- **`prestamo_front_atomic`:** prefijo `app-*` antepuesto a `prest-*` en `19` componentes adaptados, actualización de `scroll-overlay.component.*` y corrección de `scripts/refresh-atomic-snapshots.mjs` (`null` para rutas ausentes en `atoms/form-{input,select}` + actualización de `governedServices` adaptados); línea base `77 -> 59` (`0` `control-flow`), `check:atomic-rules` (`13/13` pruebas unitarias, `0` nuevos, `59` heredados), `check:contrast` (`2` temas, `8` pares), `check:focus`, `typecheck`, `check:test-inventory` (`133`), `ng build`, `npx ng test --watch=false` (`133` archivos, `1108` pruebas) y `verify_staged_provenance.cjs` (`33` componentes, `5` servicios) con salida `0`, preservando intactos los 5 archivos WIP del frente `PREST-20261103-241`.
