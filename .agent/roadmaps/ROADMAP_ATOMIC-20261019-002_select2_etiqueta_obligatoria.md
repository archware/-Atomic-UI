---
title: "Select2: etiqueta superior alineada con el formulario de referencia y campo obligatorio"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-10-19"
last_updated: "2026-10-19"
document_type: "roadmap de implementación"
status: "vigente"
version: "1.0.0"
change_id: "ATOMIC-20261019-002"
extends: "ATOMIC-20261019-001"
---

# ATOMIC-20261019-002: Select2 con etiqueta superior y marcador de obligatorio

## Alcance y línea base

Extiende [ATOMIC-20261019-001](ROADMAP_ATOMIC-20261019-001_modos_etiqueta.md). Motivo: en un
consumidor (`ventas-cxc`, popup de políticas de crédito) `app-input` mostraba la etiqueta arriba,
en negrita y con asterisco rojo, mientras `app-select2` la mostraba flotante, pequeña y sin negrita.

Rama `main`, OID inicial `c6963b08e8732a88aac2b67880103c1711c75df7`, árbol limpio.
Sin publicación, sin push, sin cambio de versión del paquete.

## Decisiones del dueño

1. El peso de la etiqueta superior se alinea a 700: `--field-label-font-weight` resuelve a
   `--font-weight-title` (antes `--font-weight-emphasis` = 600). La etiqueta flotante elevada conserva
   `--field-label-floated-font-weight` (600).
2. `Select2Component` conserva las tres variantes (`standard` | `floating` | `floating-value`); el valor
   por defecto es `standard`. Las variantes flotantes siguen disponibles (los blueprints las piden).
3. El alcance es Select2. No se modifican Datepicker, Combobox, Dropdown ni Input.

## Fases y aceptación

- [x] Token `--field-label-font-weight` a 700 (`src/styles/themes/_tokens-primitives.css`).
- [x] `Select2Component`: input `required` (por defecto `false`), asterisco `.field__required`
      (`aria-hidden`) dentro de la etiqueta superior y de la flotante, `aria-required` en el disparador.
- [x] Pruebas en `select2-variant.spec.ts` (standard, floating, floating-value y sin `required`).
- [x] Catálogo `catalog/components/select2.json`, historia `ui-select2.stories.ts` y `showcase-forms`.
- [x] Compuertas de Atomic UI, pruebas unitarias, build y `package:manifest`.

## Rollback

Revertir el commit de esta unidad. Reponer el token a `var(--font-weight-emphasis)` devuelve el peso 600
a todas las etiquetas superiores. `required` es un input nuevo con valor por defecto `false`: retirarlo
no rompe a ningún consumidor que no lo use.

## Evidencia

Ver `CHANGELOG.md` (entrada ATOMIC-20261019-002) y el informe de la asignación. Resultados de las
compuertas y pruebas se registran en la entrada del changelog.
