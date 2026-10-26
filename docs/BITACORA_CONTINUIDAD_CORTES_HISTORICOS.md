---
title: "Bitácora histórica de cortes de continuidad de Atomic UI"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-10-25"
last_updated: "2026-10-26"
document_type: "bitácora histórica de continuidad"
status: "vigente"
version: "1.0.3"
change_id: "ATOMIC-20261026-003"
canonical_doctrine: "C:\\Users\\cotaha\\source\\repos\\.agent\\doctrinas\\DOCTRINA_MAESTRA_UNIFICADA.md"
document_standard: "C:\\Users\\cotaha\\source\\repos\\.agent\\doctrinas\\ESTANDAR_DOCUMENTAL_AGENTES.md"
---

# Bitácora histórica de cortes de continuidad de Atomic UI

Este archivo conserva los cortes históricos archivados desde [`CONTINUIDAD_AGENTES.md`](./CONTINUIDAD_AGENTES.md) conforme a la ventana deslizante de `DOC-20261025-001`. Solo debe consultarse bajo demanda cuando se investigue un corte anterior.

## Corte archivado por ATOMIC-20261026-003

### 3. Unidades CLT-20261024-003 y ATOMIC-20261024-003 — reconciliación CVA en Input y procedencia de acciones

`InputComponent` reconcilia valores nativos en `change`, `focus` y `blur` cuando el DOM cambia sin disparar `input`, manteniendo la paridad exacta con la copia gobernada de `ventas-cxc`. Asimismo, se consolida la historia `Basic` de `ActionGroup`, se actualiza `distribution/atomic-source-manifest.json` en el commit local autorizado `3e76966493d4b59273655b7df18c1084fa044b9b` y se acredita `node scripts/check-atomic-provenance.mjs` en `ventas-cxc` con 0 violaciones (`política 1.2.3, 95 componentes y 5 servicios con procedencia`). Véanse los roadmaps [CLT-20261024-003](../../.agent/roadmaps/ROADMAP_CLT-20261024-003_sincronizacion_formulario_clientes.md) y [ATOMIC-20261024-003](../../.agent/roadmaps/ROADMAP_ATOMIC-20261024-003_cierre_procedencia_acciones.md).

## Corte archivado por ATOMIC-20261026-002

### 3. Unidad ACC-20261022-001 — estándar de acciones de catálogo

La fuente incorpora `ActionItem.isMenuOnly` y conserva `ActionGroup.maxVisible` como límite genérico de acciones directas. `PaginaCrud` aplica la regla física del catálogo: Ver, Editar y Más acciones. La papelera de baja y el cambio de estado quedan en el menú; una tercera directa contextual solo se acepta con `accionDirectaContextual`, id existente, justificación y evidencia no vacías, y nunca para semánticas destructivas. Evidencia, validación y rollback en el [roadmap ACC](../../.agent/roadmaps/ROADMAP_ACC-20261022-001_estandar-acciones-catalogo.md).


## Corte archivado por ATOMIC-20261026-001

### 3. Unidad Select2 ATOMIC-20261020-002

La corrección de `Select2` se limita a su capa flotante, pruebas y catálogo. No se deben modificar los contenedores de formularios para compensar el recorte ni sincronizar masivamente el ADN del consumidor. El estado comprobado, límites del ensayo y rollback viven en el [roadmap de Select2](../.agent/roadmaps/ROADMAP_ATOMIC-20261020-002_select2_capa_flotante.md).

## Corte previo ATOMIC-20261020-001

`ATOMIC-20261020-001` incorpora la variante `variant="dropzone"` en `FileInputComponent` (`atoms/file-input`) con soporte para título/subtítulo personalizables, insignia (`badgeHint`), cabecera de lista con contador (`showHeader`, `headerTitle`), vaciado total (`allowClearAll`, `clearAllLabel`, `cleared`), acción contextual por fila (`itemActionIcon`, `itemActionLabel`, `fileAction`, `fileRemoved`) y protecciones contra arrastre fantasma en WebView2/escritorio. Asimismo, homologa el input `[required]` (`false` por defecto), el asterisco `.field__required.fl-label__required` (`aria-hidden="true"`) en modos `standard`, `floating` y `floating-value`, y `aria-required="true"` en `FloatingInputComponent`, `DatepickerComponent`, `ComboboxComponent`, `TagInputComponent` y `NumberInputComponent`. Evidencia y rollback en el [roadmap](../.agent/roadmaps/ROADMAP_ATOMIC-20261020-001_dropzone_y_required.md).

## Corte ATOMIC-20261019-002

`ATOMIC-20261019-002` alinea `--field-label-font-weight` a `var(--font-weight-title)` (700) en `src/styles/themes/_tokens-primitives.css` y añade el input `required` (`false` por defecto) a `Select2Component`, mostrando `.field__required` en las tres variantes (`standard`, `floating`, `floating-value`) y `aria-required="true"` en el disparador. Evidencia y rollback en el [roadmap](../.agent/roadmaps/ROADMAP_ATOMIC-20261019-002_select2_etiqueta_obligatoria.md).

## Corte ATOMIC-20261019-001

`ATOMIC-20261019-001` unifica los modos de etiqueta (`variant`: `standard` | `floating` | `floating-value`) y los tokens `--field-label-*` en `InputComponent`, `SelectComponent`, `Select2Component`, `TextareaComponent`, `FloatingInputComponent`, `FloatingTextareaComponent`, `DatepickerComponent`, `ComboboxComponent`, `TagInputComponent`, `NumberInputComponent`, `DropdownComponent` y `.form-label` (`_forms.css`). `InputComponent` y `SelectComponent` quedan como implementaciones únicas de `app-input` y `app-select`, mientras `Input` y `Select` se reexportan como alias de compatibilidad. En modo flotante el `placeholder` se oculta mientras la etiqueta reposa dentro de `.fl-control`.

102 pruebas unitarias en 16 suites de controles de formulario, la prueba negativa `tools/test-field-label-gate.mjs` (18 hojas descubiertas, 0 literales) y todas las compuertas de `npm run governance:check` pasan en verde. Sin publicación ni push. Evidencia y rollback en el [roadmap](../.agent/roadmaps/ROADMAP_ATOMIC-20261019-001_modos_etiqueta.md).

## Calendario y selector candidatos (ATOMIC-20261001-002)

ATOMIC-20261001-002 corrige navegación, bloqueo CVA y submit involuntario del Datepicker existente; su contrato Date/null no cambia. El catálogo registra las pruebas. Select2 flexibiliza texto seleccionado y lista con búsqueda. Ventas consume solo los bloques compatibles, sin perder su posición fija adaptada. 17 pruebas focalizadas y build pasan; no hay certificación global, publicación ni cambio del manifiesto canónico. El smoke de gobierno falla por inventario. El popup de calendario conserva 320 px y no ofrece min/max: comprobar móvil y validar fechas en el consumidor, sin inventar inputs. Evidencia y rollback en el [roadmap](../.agents/roadmaps/ROADMAP_ATOMIC-20261001-002_calendario_selector.md).

## Presentación de transacciones candidata (ATOMIC-20261001-001)

ATOMIC-20261001-001 incorpora dos organismos para preservar Ventas sin estilos en la feature: TransactionDetail (grupos semánticos, tablas, acción, total) y TransactionEditor (disposición proyectada). El catálogo documenta API candidata; el consumidor aporta textos formateados y reglas de operación. Sin dependencias financieras, moneda o acceso HTTP en las piezas. No reemplazar ReceiptPanel ni PrintDocumentPanel: tienen otras responsabilidades. Véase [roadmap](../.agents/roadmaps/ROADMAP_ATOMIC-20261001-001_transacciones.md).

## Cortes documentales y previos (ATOMIC-20260928-001 a ATOMIC-20260930-008)

- **ATOMIC-20260930-008:** Reutilizar experiencia visual no transfiere contrato ni seguridad; exigir matriz local del consumidor conforme a la maestra, apartado 1.10, y al [contrato](CONTRATO_CATALOGOS_CRUD.md). Ver [roadmap](../.agents/roadmaps/ROADMAP_ATOMIC-20260930-008_reutilizacion_segura.md).
- **ATOMIC-20260930-007:** Consulta de catálogos mediante `SummaryList detail`, conservando cabecera, cierre y pie Atomic. Ver [roadmap](../.agents/roadmaps/ROADMAP_ATOMIC-20260930-007_detalle_catalogos.md).
- **ATOMIC-20260930-006:** Checkpoint local autorizado por el dueño sin push ni publicación. Ver [roadmap](../.agents/roadmaps/ROADMAP_ATOMIC-20260930-006_checkpoint.md).
- **ATOMIC-20260929-005:** Homologación de `Alert` y `TableAction catalog` (Ver neutro, Editar azul, Activar verde, Desactivar rojo). Ver [roadmap](../.agents/roadmaps/ROADMAP_ATOMIC-20260929-005_alertas.md).
- **ATOMIC-20260929-004:** `PaginaCrud.bloquearCierre` y `SummaryList detail`. Ver [roadmap](../.agents/roadmaps/ROADMAP_ATOMIC-20260929-004_lecciones_catalogos.md).
- **ATOMIC-20260929-003:** Tercera acción contextual de catálogo y `PaginaCrud.guardarHabilitado`. Ver [roadmap](../.agents/roadmaps/ROADMAP_ATOMIC-20260929-003_accion_contextual.md).
- **ATOMIC-20260929-002:** Centrado de estados en `DataTable`. Ver [roadmap](../.agents/roadmaps/ROADMAP_ATOMIC-20260929-002_alineacion_estados.md).
- **ATOMIC-20260928-001:** Preservación visual en `PaginaCrud`, `SummaryList layout="detail"` y `TableAction profile="catalog"`. Ver [roadmap](../.agents/roadmaps/ROADMAP_ATOMIC-20260928-001_preservacion_visual.md).
