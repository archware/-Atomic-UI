---
title: "Modos de etiqueta unificados (superior / flotante) en los controles de formulario"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-10-19"
last_updated: "2026-10-19"
document_type: "roadmap de implementación"
status: "vigente"
version: "1.0.0"
change_id: "ATOMIC-20261019-001"
---

# ATOMIC-20261019-001: modos de etiqueta unificados

## Alcance y línea base

Un único contrato `variant` (`standard` | `floating` | `floating-value`) para todos los controles
con `label`; la familia canónica es `InputComponent` / `SelectComponent` (los alias `Input` y
`Select` se conservan). Con etiqueta flotante el marcador (`placeholder`) permanece oculto mientras
la etiqueta reposa dentro del control y aparece cuando ya subió.

Rama `main`, OID inicial `866fc4708fc2e89ec7457afad6b7875a19579aa5`, árbol limpio.
Sin publicación, sin push, sin cambio de versión del paquete.

## Decisiones del dueño

1. Cubrir reproducción en navegador y pruebas automáticas.
2. Familia canónica: `InputComponent` / `SelectComponent` (se resuelve el `app-input` duplicado).
3. La API es una variante (`variant`) con la que el consumidor elige cuándo sube la etiqueta.
4. Marcador oculto en modo flotante hasta que la etiqueta sube.

## Fases y aceptación

### P0 — defectos
- [x] Textarea reacciona al valor (`ngModel` y `FormControl`) — valor como señal.
- [x] Marcador y etiqueta flotante no se superponen (Input, Select, Select2, Textarea).
- [x] La etiqueta flotante se ancla a la caja del control, no a la caja más ayuda/error.
- [x] Una sola implementación de `app-input` y `app-select` (alias de compatibilidad).
- [x] Pruebas TestBed por modo, por reactividad, por geometría y por accesibilidad.

### P1 — consistencia
- [x] Tipografía de etiqueta por tokens `--field-label-*` en todos los controles.
- [x] `variant` en Datepicker/FloatingInput, Combobox, TagInput, NumberInput y Dropdown.
- [x] `FormErrorComponent` adoptado como mensaje de error central.
- [x] Blueprints (`crud-table`, `login-page`, `settings-page`, `pagina-crud`) verificados.
- [x] Compuerta que rechaza tamaños literales en etiquetas de campo, con prueba negativa.

### P2 — documentación y evidencia
- [x] `var(--font-medium, 500)` retirado de `number-input` y `tag-input`.
- [x] Catálogo de los controles sin entrada.
- [x] Historias de Storybook y showcase con ambos modos.
- [x] CHANGELOG, LESSONS_LEARNED, CONTINUIDAD_AGENTES y README de UI.

## Rollback

Revertir los commits de la fase (`git revert`), o restituir los alias: `Input` y `Select`
conservan su contrato público, de modo que el rollback no exige cambios en consumidores.
Los ficheros `form-input/input.html|scss` y `form-select/select.html|scss` siguen en el historial
de Git (commit anterior a `ATOMIC-20261019-001`).

## Evidencia

- **P0 (`829a21a`):** `field-label.ts` / `field-label.css` creados; `InputComponent`, `SelectComponent`, `Select2Component` y `TextareaComponent` unificados bajo `variant: 'standard' | 'floating' | 'floating-value'`; `Input` y `Select` conservados como alias; 51 pruebas unitarias en verde.
- **P1 (`1187463`):** `FloatingInputComponent`, `FloatingTextareaComponent`, `DatepickerComponent` (con elevación al enfocar o abrir el disparador), `ComboboxComponent`, `TagInputComponent`, `NumberInputComponent` y `DropdownComponent` alineados con `variant` y `field-label.css`; `.form-label` en `src/styles/themes/_forms.css` migrado a `--field-label-*`; `FormErrorComponent` adoptado en `InputComponent`, `SelectComponent` y `TextareaComponent`; `scripts/check-field-label-tokens.mjs` + `tools/test-field-label-gate.mjs` en verde (18 hojas descubiertas, 0 literales); 16 suites / 102 pruebas unitarias en verde.
- **P2:** 11 entradas nuevas en `catalog/components/` (`textarea`, `floating-textarea`, `form-error`, `checkbox`, `radio`, `toggle`, `rating`, `select2`, `combobox`, `tag-input`, `dropdown`); `catalog:check` (56 entradas) y `check:catalog-api` (43 componentes, 375 inputs) en verde; historias de Storybook y `showcase-forms.component.ts` actualizados con los tres modos de etiqueta; `npx ng build` y `npm run governance:check` en verde.
