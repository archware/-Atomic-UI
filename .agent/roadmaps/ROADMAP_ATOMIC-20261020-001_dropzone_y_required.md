---
title: "Variante dropzone en FileInput y homologación de required en controles compuestos"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-10-20"
last_updated: "2026-10-20"
document_type: "roadmap de implementación"
status: "vigente"
version: "1.0.0"
change_id: "ATOMIC-20261020-001"
extends: "ATOMIC-20261019-002"
---

# ATOMIC-20261020-001: variante dropzone en FileInput y homologación de required en controles compuestos

## Alcance y línea base

Extiende [ATOMIC-20261019-002](ROADMAP_ATOMIC-20261019-002_select2_etiqueta_obligatoria.md). Motivo:
1. Rescatar bajo el principio *upstream-first* el patrón enriquecido de zona de carga (`variant="dropzone"`) observado en `pdf-tool` (icono circular destacado, título y subtítulo configurables, píldora de ayuda con icono de verificación `badgeHint`, cabecera de archivos cargados con contador y acción de vaciado `showHeader` / `allowClearAll`, acción contextual por archivo y protecciones de arrastre nativo para escritorio) dentro de `FileInputComponent`, conservando compatibilidad total con `variant="standard"` y `density` (`comfortable` | `compact`).
2. Homologar la entrada `required` (`false` por defecto), el marcador visual `.field__required` / `.fl-label__required` (`*`, `aria-hidden="true"`) y `aria-required="true"` en los cuatro controles de formulario con etiqueta pendientes (`DatepickerComponent`, `ComboboxComponent`, `TagInputComponent` y `NumberInputComponent`), además del soporte correspondiente en `FloatingInputComponent`.

Rama `main`, OID inicial `ec74abc7c80b85882a31500de7852cbc0028887b`, árbol limpio en `-Atomic-UI`.
Sin publicación externa ni `git push`.

## Decisiones técnicas

1. `FileInputComponent` incorpora `variant = input<FileInputVariant>('standard')` (`'standard' | 'dropzone'`), `dropzoneTitle`, `dropzoneSubtitle`, `badgeHint`, `showHeader`, `headerTitle`, `allowClearAll`, `clearAllLabel`, `itemActionIcon`, `itemActionLabel` y las salidas `cleared`, `fileRemoved` y `fileAction`.
2. La variante `dropzone` emplea exclusivamente tokens canónicos de Atomic UI (`var(--...)`) y unidades relativas (`rem`), sin medidas en `px`, sin estilos en línea ni pesos numéricos literales.
3. `DatepickerComponent`, `ComboboxComponent`, `TagInputComponent`, `NumberInputComponent` y `FloatingInputComponent` incorporan `required = input(false)`, proyectando el asterisco decorativo tanto en etiqueta superior (`standard`) como en etiquetas flotantes (`floating`, `floating-value`) y exponiendo `aria-required="true"` en el elemento interactivo o disparador.

## Fases y aceptación

- [x] `FileInputComponent`: implementación de `variant="dropzone"`, cabecera de lista, vaciado total, acción por fila y protecciones de arrastre en escritorio.
- [x] `DatepickerComponent`, `ComboboxComponent`, `TagInputComponent`, `NumberInputComponent` y `FloatingInputComponent`: soporte de `required` y `aria-required`.
- [x] Catálogo (`catalog/components/file-input.json`, `datepicker.json`, `combobox.json`, `tag-input.json`, `number-input.json`, `floating-input.json`), historias de Storybook y `showcase-forms.component.ts`.
- [x] Pruebas unitarias en `file-input.component.spec.ts`, `datepicker-variant.spec.ts`, `combobox-variant.spec.ts`, `tag-input-variant.spec.ts` y `number-input-variant.spec.ts`.
- [x] Actualización documental (`CHANGELOG.md`, `LESSONS_LEARNED.md`, `docs/CONTINUIDAD_AGENTES.md`, `src/app/shared/ui/README.md`, `ROADMAP_20260823_atomic_ui_6_0.md`).
- [x] Compuertas de Atomic UI (`npm run governance:check`), build, `package:manifest` y sincronización de procedencia en `ventas-cxc`.

## Rollback

Revertir el commit de la unidad `ATOMIC-20261020-001` en `-Atomic-UI` y restituir `docs/atomic-provenance.json` junto con las copias exactas en `ventas-cxc`. Todas las entradas nuevas poseen valores por defecto compatibles (`variant = 'standard'`, `required = false`, `showHeader = false`, `allowClearAll = false`), por lo que no alteran a los consumidores que no las declaren.

## Evidencia

Ver `CHANGELOG.md` (entrada `ATOMIC-20261020-001`) y las suites de pruebas unitarias de cada control.
