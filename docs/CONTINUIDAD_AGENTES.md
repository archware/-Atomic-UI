---
title: "Continuidad para agentes de Atomic UI"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-08-23"
last_updated: "2026-11-15"
document_type: "manual de continuidad"
status: "vigente"
version: "1.6.3"
change_id: "ATOMIC-20261115-001"
canonical_doctrine: "C:\\Users\\cotaha\\source\\repos\\.agent\\doctrinas\\DOCTRINA_MAESTRA_UNIFICADA.md"
document_standard: "C:\\Users\\cotaha\\source\\repos\\.agent\\doctrinas\\ESTANDAR_DOCUMENTAL_AGENTES.md"
---

# Continuidad para agentes de Atomic UI

## Propósito y límites

`-Atomic-UI` es la única fuente visual canónica del ecosistema. Contiene tokens, componentes, catálogo, generador, política de consumo, biblioteca y contrato de distribución. Los consumidores conservan navegación, permisos, contratos API o IPC, estado y reglas de negocio; esas responsabilidades no se trasladan al ADN visual.

La autoridad superior es la [Doctrina maestra unificada](C:/Users/cotaha/source/repos/.agent/doctrinas/DOCTRINA_MAESTRA_UNIFICADA.md) (`C:\Users\cotaha\source\repos\.agent\doctrinas\DOCTRINA_MAESTRA_UNIFICADA.md`). El paquete documental se rige por el [Estándar documental para continuidad de agentes](C:/Users/cotaha/source/repos/.agent/doctrinas/ESTANDAR_DOCUMENTAL_AGENTES.md) (`C:\Users\cotaha\source\repos\.agent\doctrinas\ESTANDAR_DOCUMENTAL_AGENTES.md`). El trabajo se asigna mediante el [Prompt maestro para continuidad de agentes](C:/Users/cotaha/source/repos/.agent/guias/PROMPT_MAESTRO_CONTINUIDAD_AGENTES.md) (`C:\Users\cotaha\source\repos\.agent\guias\PROMPT_MAESTRO_CONTINUIDAD_AGENTES.md`).

## Orden obligatorio de lectura (acotada por defecto)

1. [Guía rápida para agentes con contexto reducido](../../.agent/guias/GUIA_RAPIDA_AGENTES_BAJO_CONTEXTO.md), [`../AGENTS.md`](../AGENTS.md) y el `AGENTS.md` de la raíz `C:\Users\cotaha\source\repos`.
2. Este manual (que consolida en su parte superior la arquitectura perenne y una ventana deslizante de los 3 cortes recientes).
3. Únicamente el roadmap activo en `.agent/roadmaps/` o `.agents/roadmaps/` y las primeras 80 líneas de [`CHANGELOG.md`](../CHANGELOG.md) y [`LESSONS_LEARNED.md`](../LESSONS_LEARNED.md).
4. Bajo demanda según el frente: [`governance/consumer/ATOMIC_GOVERNANCE.md`](../governance/consumer/ATOMIC_GOVERNANCE.md), [`ECOSYSTEM_WORKFLOW.md`](../ECOSYSTEM_WORKFLOW.md), [`DOCTRINA_DE_INTERFAZ.md`](../DOCTRINA_DE_INTERFAZ.md), [`docs/CONTRATO_CATALOGOS_CRUD.md`](./CONTRATO_CATALOGOS_CRUD.md) y [`docs/ATOMIC_UI_AGENT_RUNTIME.md`](./ATOMIC_UI_AGENT_RUNTIME.md). Para migrar un consumidor a la línea 5.22 se consulta [`MIGRAR_A_5.22.md`](../governance/consumer/MIGRAR_A_5.22.md).

## Arquitectura y fronteras

```text
Requisito visual
  -> catalog/: recetas, componentes y variantes declaradas
    -> src/app/shared/ui/: átomos, moléculas, organismos, superficies y plantillas
      -> src/styles/: tokens y temas
        -> projects/atomic-ui/: biblioteca Angular compilable
          -> distribution/: contrato, manifiesto y paquete reproducible
            -> governance/consumer/: política, instalador y gate
              -> consumidores con procedencia exacta o adaptada
tools/ y scripts/ -> consulta, generación, auditoría, pruebas negativas y manifiestos
```

- Una feature de consumidor nunca se convierte en origen visual. Un hallazgo útil vuelve primero a esta fuente, queda catalogado y supera sus compuertas.
- La biblioteca `@atomic-ui/core` es el destino estable de distribución; un paquete local verde no autoriza publicación en un registro.
- `generate:ui` compone únicamente contratos declarados. El modo integrado se rechaza si faltan endpoint, método o contrato real.
- El instalador fija remoto, OID, política, versión y SHA-256 en `docs/atomic-provenance.json` de cada consumidor contra el `HEAD` confirmado de esta fuente y el inventario de `distribution/atomic-source-manifest.json`. No deje cambios sin confirmar en `governance/consumer/` ni en `src/app/shared/ui/` sin autorización de commit del Guardián, pues romperán `check:atomic` en los consumidores.

## Estado doctrinal comprobado

El paquete avanza a la versión `5.23.1` y la hoja [`ROADMAP_20260823_atomic_ui_6_0.md`](../.agents/roadmaps/ROADMAP_20260823_atomic_ui_6_0.md) mantiene tres cortes técnicos validados: contratos Signals, estilos externos y saneamiento de Tailwind, unidades relativas y tokens canónicos. Estado de las seis familias hacia 6.0.0:
1. **Medidas rígidas:** `[x]` sustituidas por tokens o `rem` en `src/app/shared/ui/` y `src/styles/themes/_utilities.css`, gobernadas por `check:units` y `test:units-gate` (107 hojas auditadas, 0 medidas `px` rígidas prohibidas).
2. **Tailwind:** `[x]` `tailwind.config.js`, `@tailwind`, dependencias y utilidades residuales retirados en historias, vistas y generador, gobernados por `check:no-tailwind` y `test:no-tailwind-gate` (573 archivos auditados, 0 residuos).
3. **Aliases:** permanecen 16 alias transitorios `prest-*` acotados en `ALIAS_TRANSITORIOS_DEL_ADN` con selector primario `app-*` obligatorio (`check:selectors` y `test:selectors-gate`, 121 declaraciones verificadas) y retirados de `tools/generate-ui.js`.
4. **Colisiones:** `[x]` resueltas en `ATOMIC-20261019-001` (`InputComponent` y `SelectComponent` como implementaciones únicas de `app-input` y `app-select`).
5. **Generador:** `[x]` `tools/generate-ui.js` emite exclusivamente Signals, estilos externos, clases semánticas y selectores `app-`.
6. **Cambio de versión:** pendiente el salto administrativo a `6.0.0`, retiro final de los 16 alias transitorios, política `2.0` y propagación sincronizada con consumidores.

## Fuentes locales y rutas operativas

| Necesidad | Fuente |
|---|---|
| Política de consumidor | [`governance/consumer/ATOMIC_GOVERNANCE.md`](../governance/consumer/ATOMIC_GOVERNANCE.md) |
| Flujo de propagación | [`ECOSYSTEM_WORKFLOW.md`](../ECOSYSTEM_WORKFLOW.md) |
| Reglas derivadas de uso | [`DOCTRINA_DE_INTERFAZ.md`](../DOCTRINA_DE_INTERFAZ.md) |
| Runtime para agentes | [`docs/ATOMIC_UI_AGENT_RUNTIME.md`](./ATOMIC_UI_AGENT_RUNTIME.md) |
| Catálogo y Fuente UI | [`catalog/`](../catalog/) y [`src/app/shared/ui/`](../src/app/shared/ui/) |
| Tokens, Biblioteca y Distribución | [`src/styles/`](../src/styles/), [`projects/atomic-ui/`](../projects/atomic-ui/) y [`distribution/`](../distribution/) |
| Roadmaps y Bitácora histórica | [`.agents/roadmaps/`](../.agents/roadmaps/), [`ROADMAP_20260823_continuidad_documental_agentes.md`](../.agents/roadmaps/ROADMAP_20260823_continuidad_documental_agentes.md) (`ECO-20260823-003`) y [`BITACORA_CONTINUIDAD_CORTES_HISTORICOS.md`](./BITACORA_CONTINUIDAD_CORTES_HISTORICOS.md) |

## Compuertas, protocolo de cambio, definición de terminado y rollback

Una modificación propagable ejecuta desde la raíz del proyecto:
```powershell
npm ci
npm run governance:check
npm run lint
npm test -- --watch=false
npm run build
npm run lib:build
npm run build-storybook
npm run package:check
git diff --check
git status --short --branch
```

- **Protocolo de cambio:** (1) Registrar ruta, rama, OID y árbol sucio; abrir roadmap antes de editar; consultar `agent:context` y catálogo. (2) Modificar la capa Atomic correcta usando `input()`/`output()`, hojas externas y selectores `app-`; actualizar catálogo, barrel, pruebas y herramientas en la misma unidad; ejecutar compuertas de fuente antes de propagar. (3) Fijar OID recuperable y registrar procedencia exacta o adaptación decidida; actualizar changelog, lecciones, manifiestos y roadmap.
- **Definición de terminado:** Una capacidad visual queda terminada cuando está en la capa correcta, usa tokens, Signals, estilos externos y `app-`, dispone de catálogo, barrel, accesibilidad, pruebas y responsive, supera las compuertas de fuente y queda propagada con procedencia verificable.
- **Riesgos y rollback:** El rollback restaura únicamente la unidad, el catálogo y los manifiestos correspondientes; nunca usa operaciones Git destructivas ni borra trabajo preexistente.

---

## Ventana deslizante de cortes recientes (máximo 3)

> Los cortes históricos anteriores a esta ventana se conservan íntegros en [`BITACORA_CONTINUIDAD_CORTES_HISTORICOS.md`](./BITACORA_CONTINUIDAD_CORTES_HISTORICOS.md).

### 1. Unidad ATOMIC-20261115-001 — efecto mouse-over cromático en `app-stepper` y cierre de versión `5.23.1`

En [`ROADMAP_ATOMIC-20261115-001_stepper_hover_y_cierre_5_23.md`](../.agent/roadmaps/ROADMAP_ATOMIC-20261115-001_stepper_hover_y_cierre_5_23.md) se implementa el efecto de realce al pasar el puntero sobre `StepperComponent` (`stepper.component.css`, `_tokens-components.css` en `light`, `dark` y `brand-dark`) mediante la familia de tokens `--stepper-hover-*`, `--stepper-active-hover-indicator-*` y `--stepper-completed-hover-*` (incluido `--stepper-completed-hover-description`), con contorno interior `--border-width-thin`, contraste WCAG `>= 4.5:1` verificado en `scripts/check-theme-contrast.mjs` (`43` pares por tema), paridad `goToStep(index)` / `isStepDisabled(index)` para `maxReachableStep`, apilamiento continuo del conector vertical/móvil en `:hover` y respeto a `prefers-reduced-motion`; se añade `stepper.component.spec.ts`, se actualiza `catalog/components/stepper.json`, se agrega selección interactiva de paso en `ShowcaseNavigationComponent` y se promueve `@atomic-ui/core` / `atomic-ui` a `5.23.1` regenerando `dart/atomic_tokens` (`489` colores por tema), `documentation.json` y `distribution/atomic-source-manifest.json` (`345` fuentes, SHA-256 `1b428c625386a1c4adb22aab30756c5cfd0dee589918cc0bb528dc7464f2dd1a`).

### 2. Unidad ATOMIC-20261114-001 — títulos centrados, completitud de catálogo (`ConfirmDialog`), auditoría anti-solapamiento y sincronización de 8 consumidores

En [`ROADMAP_ATOMIC-20261114-001_titulos_centrados_catalogo_y_sincronizacion.md`](../.agent/roadmaps/ROADMAP_ATOMIC-20261114-001_titulos_centrados_catalogo_y_sincronizacion.md) se centra simétricamente `PageHeaderComponent` (`PageHeaderAlignment = 'start' | 'center'`, defecto `'center'`, rejilla de 3 columnas `1fr minmax(0, auto) 1fr` que mantiene acciones a la derecha) propagando `headerAlign` hacia `PaginaWizard`, `PaginaCrud`, `PaginaCrudAccordion`, `PaginaDashboard`, `PaginaDetallePestanas`, `FormDialog` (`minmax(0, 1fr)` + `--space-3`) y `CardComponent`, además de centrar `ModalComponent`, `ModalContainerComponent`, `PopupContainerComponent` (respaldo 1 columna cuando falta `.popup-icon`), ocultar `.panel__header-actions:empty`, centrar confirmaciones en `PaginaCrudAccordion`, corregir `SidebarComponent` (reubicación de `.logo-badges` a `.logo-subtitle-row` + `min-width: 0` y elipsis en `.user-info`/`.user-name`/`.user-role`), corregir el solapamiento en `ShowcasePageComponent` (moviendo los paneles de `Identidad de Artefactos` e `Information Panels` dentro de `.content-sections` y sustituyendo `mb-md`/`mb-sm`/`mt-md` por `mb-4`/`mb-2`/`mt-4` y `--form-row-gap`), normalizar `©`/`(c)` en `AboutDialogComponent` (`normalizedCopyrightText`, centrado horizontal de `card`/`popup` y compactación CSS a `5.85 kB` compilados en `demo-chasis-front`, bajo `6.00 kB`), limpiar estilos ad-hoc y sanear espacios/EOF en 13 fuentes upstream. Se canoniza `ConfirmDialog` (`organisms/confirm-dialog/`), `OnPush` en `LinkComponent`, exportaciones en `src/app/shared/ui/index.ts`, `45` fichas nuevas JSON (`106` totales), pruebas unitarias y `9` historias Storybook manteniendo `@atomic-ui/core` `5.22.0` (`345` archivos en `distribution/atomic-source-manifest.json`, `sourceTreeSha256: 5b53c57599833817050841b810ca8745688805900c6d457c358c626362203374`; `ChromeHeadless` `888` SUCCESS, `lint` `0` errores / `1` aviso, `build`, `lib:build`, `governance:smoke`, `package:check`, `git diff --check` en los 9 repositorios). Sincronización con política `1.2.3` verificada en `ventas-cxc` (`97` componentes + `5` servicios, `0` nuevos / `16` heredados, `ng build`, `138/138` archivos y `1949/1949` pruebas), `pdf-tool/frontend` (pin `b76f4329...`, `66` componentes + `5` servicios en `check:atomic:pin`), `demo-chasis-front`, `saas-admin-front`, `saas-erp-front`, `saas-pos-front`, `citas-medicas-web` (`ng build` verde vía junction temporal depurada y procedencia staged limpia) y `prestamo_front_atomic` (`ng build`, `133` archivos / `1108` pruebas, `33` componentes + `5` servicios y los 5 WIP hashes preservados).

### 3. Unidad ATOMIC-20261113-001 — mejora visual de Acerca de y rediseño de logos e ilustraciones de artefactos (`Artifact Mangosta`, `Artifact Barracuda` y `Atomic UI`)

En [`ROADMAP_ATOMIC-20261113-001_artifact_logos_about_dialog.md`](../.agent/roadmaps/ROADMAP_ATOMIC-20261113-001_artifact_logos_about_dialog.md) se rediseñan los emblemas `1:1` (`1024x1024`) e ilustraciones `16:9` (`1376x768`) de `src/assets/doctrinas/` con lenguaje visual de artefactos arquitectónicos de ingeniería y se sustituyen los rótulos previos `DOCTRINA MANGOSTA` / `DOCTRINA BARRACUDA` por `ARTIFACT MANGOSTA` (`HEXAGONAL · CQRS · DDD`), `ARTIFACT BARRACUDA` (`ATOMIC UI · SIGNALS`), `ATOMIC UI` (`DESIGN SYSTEM · ARTIFACTS`) y `@archware` (`ENGINEERING ARTIFACTS`). En `AboutDialogComponent` (`about-dialog.component.html`, `.css`, `.spec.ts`) `.about-credit-item__banner` adopta `aspect-ratio: 16 / 9; display: block; object-fit: cover;` a ancho completo sobre `.about-credit-item` en columna con `.about-credit-item__top` y cuerpo sin canalón lateral vacío, se corrige el encogimiento flex de `.about-popup__scroll`/`.about-popup__footer` y se compacta el CSS por debajo de `6.00 kB`; en `ShowcasePageComponent` (`showcase-page.component.ts` y `.html`) se actualizan las etiquetas residuales hacia `Artifact Mangosta` / `Artifact Barracuda` y se extraen `modal`/`popup` fuera de `<app-panel variant="elevated">` para evitar la captura de `position: fixed` por `:hover { transform }`; y en `DialogsPageComponent` (`dialogs-page.component.ts`, `.html`, `.spec.ts`) y `ui-about-dialog.stories.ts` se sincroniza el enfoque corporativo de **Unión PDF** (`v0.5.3`), incluyendo la tarjeta `Compilación Multiplataforma CI/CD & Binarios Nativos Autónomos` (`union-pdf-windows-x86_64.exe` PE64 `.exe`, `union-pdf-macos-arm64.app.tar.gz` / `union-pdf-macos-x86_64.app.tar.gz` Application Bundle `union-pdf.app` Mach-O 64-bit en `.app.tar.gz` y `union-pdf-linux-x86_64.tar.gz` ELF 64-bit en `.tar.gz`) y los enlaces a GitHub Releases y GitHub Actions. Asimismo, en `Alert` (`src/app/shared/ui/molecules/alert/alert.component.ts`, `alert.component.spec.ts` y `catalog/components/alert.json`) y `SummaryList` (`catalog/components/summary-list.json`) se retira la línea en blanco sobrante al final de `alert.component.ts`, se migran las llamadas heredadas `vi.*` a `jasmine.clock()` y se documentan las entradas pendientes en catálogo; se corrige además la cascada de `brand-dark` (`[data-theme="brand-dark"]` en `BASE OSCURA COMPARTIDA` de `_tokens-semantic.css`, `:not([data-theme="brand-dark"])` sobre `.theme-dark`/`html.dark` en `_tokens-components.css`, `--field-label-color-floated: var(--blue-400)`, sanea `:not(...)` en `scripts/lib/atomic-tokens.mjs` y limpieza DOM `afterEach` en `app.spec.ts` junto con paridad real de clase `dark` en pruebas de contraste). Se regeneran `dart/atomic_tokens/` (`474` colores/tema), `documentation.json` (`0` ocurrencias de `Doctrina Mangosta|Barracuda`) y `distribution/atomic-source-manifest.json` (`345` fuentes, SHA-256 `cf9af920de0830fa5e98dea5809db2a6195fc546f7140abe9ab65cc7402480f0`), pasan las 26 compuertas de `governance:check` (incluidos `catalog:check` con `62` entradas, `check:catalog-api` con `49` componentes y `458` entradas, `package:check`, `tokens:dart:check` y `check:contrast` con `36` pares x `3` temas), `lint`, `ng test --watch=false --browsers=ChromeHeadless` (`874/874 SUCCESS`), `build`, `lib:build` y `git diff --check`, se valida renderizado real en Chromium (`1440x900` y `360x800`, variantes `card`, `modal` y `popup`), y se sincronizan activos + `about-dialog` + `_tokens-semantic.css`/`_tokens-components.css` + huellas `localSha256` (`badge.component.ts`, `chip.component.ts` con salto de línea final agregado y `about-dialog`) en `pdf-tool/frontend` (`31/31` archivos, `325/325` pruebas Vitest incluyendo pruebas de banner `16/9`, tarjeta vertical y popup, `ng build` sin advertencia de presupuesto en `about-dialog.component.css`, y `check:atomic:pin` limpio para `66` componentes y `5` servicios) y las 5 imágenes heredadas en `ventas-cxc/public/assets/doctrinas/`.
