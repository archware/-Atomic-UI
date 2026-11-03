---
title: "Continuidad para agentes de Atomic UI"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-08-23"
last_updated: "2026-11-03"
document_type: "manual de continuidad"
status: "vigente"
version: "1.5.5"
change_id: "ATOMIC-20261103-001"
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

El paquete continúa en la versión `5.22.0` y la hoja [`ROADMAP_20260823_atomic_ui_6_0.md`](../.agents/roadmaps/ROADMAP_20260823_atomic_ui_6_0.md) mantiene tres cortes técnicos validados: contratos Signals, estilos externos y saneamiento de Tailwind, unidades relativas y tokens canónicos. Estado de las seis familias hacia 6.0.0:
1. **Medidas rígidas:** `[x]` sustituidas por tokens o `rem` en `src/app/shared/ui/` y `src/styles/themes/_utilities.css`, gobernadas por `check:units` y `test:units-gate` (105 hojas auditadas, 0 medidas `px` rígidas prohibidas).
2. **Tailwind:** `[x]` `tailwind.config.js`, `@tailwind`, dependencias y utilidades residuales retirados en historias, vistas y generador, gobernados por `check:no-tailwind` y `test:no-tailwind-gate` (558 archivos auditados, 0 residuos).
3. **Aliases:** permanecen 16 alias transitorios `prest-*` acotados en `ALIAS_TRANSITORIOS_DEL_ADN` con selector primario `app-*` obligatorio (`check:selectors` y `test:selectors-gate`, 120 declaraciones verificadas) y retirados de `tools/generate-ui.js`.
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

### 1. Unidad ATOMIC-20261103-001 — organismo canónico `app-about-dialog` («Acerca de» y Créditos del Sistema)

Se crea y cataloga en `-Atomic-UI` el organismo canónico `<app-about-dialog>` (`src/app/shared/ui/organisms/about-dialog/`) para presentar identidad de producto, versión, entorno, runtime, autoría principal (`Ing. Havel CONTRERAS TAPAHUASCO` — `@archware`), transparencia de co-ingeniería con IA Agéntica (`aiDisclosure`), tabla de créditos técnicos (`AboutCreditItem[]`), stack tecnológico (`AboutTechBadge[]`), enlaces externos verificados (`AboutLinkItem[]`) y derechos de autor en tres variantes (`modal`, `popup` y `card`). Se reexporta en `src/app/shared/ui/index.ts`, se registra en `catalog/components/about-dialog.json`, se expone en Storybook (`src/stories/ui-about-dialog.stories.ts`) y en la Sección 5 de `DialogsPageComponent`, y se actualiza `distribution/atomic-source-manifest.json`. Consultar el [roadmap](../.agent/roadmaps/ROADMAP_ATOMIC-20261103-001_about_dialog.md).

### 2. Unidad ATOMIC-20260823-600 (corte 3) — compuertas de selectores y Tailwind, unidades relativas y tokens canónicos

Se sanea `ScrollOverlayComponent` (`variant: 'default' | 'brand'`, UTF-8, unidades `rem`), se repara `PaginaCrudAccordion` (`(buttonClick)` en Cancelar, pie en modo `ver`, tokens reales y `pagina-crud-accordion.spec.ts`), se protege `ThemeService.getEffectiveTheme()` para SSR (`typeof window.matchMedia !== 'function'`), se retiran rotaciones en hover de `ThemeSwitcherComponent`, se eliminan dos hojas CSS huérfanas (`filters.component.css`, `chart-tokens.css`) y se prohíbe `CommonModule` en `check:control-flow` (`test:control-flow-gate`). Se acotan los 16 alias transitorios `prest-*` bajo `app-*` primario obligatorio (`check:selectors` y `test:selectors-gate`, 120 declaraciones) retirándolos del generador `tools/generate-ui.js`, y se purgan las utilidades residuales de Tailwind en historias, vistas de demostración y generador (`check:no-tailwind` y `test:no-tailwind-gate`, 558 archivos). Se sustituyen las medidas rígidas `px` no pertenecientes a trazos finos (`<= 2px`) o puntos de corte en las 35 hojas `.css`/`.scss` y 6 archivos `.ts`/`.html` de `src/app/shared/ui/` y en `src/styles/themes/_utilities.css` por tokens o `rem`, gobernadas por `check:units` (`scripts/check-css-units.mjs` y `tools/test-css-units-gate.mjs`, 105 hojas auditadas). Se añaden `--checkbox-size`, `--checkbox-icon-size` y `--topbar-height`, se eliminan tokens fantasma y colores literales `#hex`/`rgb()`/`rgba()`, se acotan con `:host` las reglas `::ng-deep` en `icon-button.component.css` y `row.component.css`, se reemplazan `--floating-*-icon-cursor` por clases de estado, se regeneran `catalog/`, `dart/atomic_tokens` y `distribution/atomic-source-manifest.json`, y se validan `npm run lib:build` y 198/198 pruebas unitarias en Karma + `ChromeHeadless`. Consultar el [roadmap](../.agents/roadmaps/ROADMAP_20260823_atomic_ui_6_0.md).

### 3. Unidad ATOMIC-20261026-003 — tipografía local canónica Quicksand y Open Sans

Se empaquetan en `src/styles/themes/fonts/` los 12 archivos `.woff2` locales de `Open Sans` (`400`, `500`, `600`, `700` en `latin` y `latin-ext`) y `Quicksand` (`400`, `500`, `600`, `700` completo), declarados en `src/styles/themes/_fonts.css`, importados al inicio de `src/styles/themes/index.css` e inventariados en `distribution/package-contract.json` y `distribution/atomic-source-manifest.json`. Se definen `--font-family-base`, `--font-family-heading` y `--font-family-mono` en `_tokens-primitives.css`, se corrige `--table-font-family: var(--font-family-base)` en `_tokens-components.css` y se enlaza `--font-family-heading` en encabezados globales (`h1`–`h6`), `text.component.css`, `page-header.scss`, `pagina-crud.scss`, `pagina-crud-accordion.scss`, `modal.component.css`, `modal-container.component.css`, `popup-container.component.css`, `form-dialog.scss` y `kpi-card.component.css`, además de `version.component.css`, el puente Dart (`scripts/emit-dart-tokens.mjs`) y la prueba negativa `tools/test-typography-scale-gate.mjs`. Consultar el [roadmap](../.agent/roadmaps/ROADMAP_ATOMIC-20261026-001_tipografia_local_quicksand_open_sans.md).

