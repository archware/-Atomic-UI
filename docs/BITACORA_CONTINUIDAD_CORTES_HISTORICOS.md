---
title: "Bitácora histórica de cortes de continuidad de Atomic UI"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-10-25"
last_updated: "2026-11-03"
document_type: "bitácora histórica de continuidad"
status: "vigente"
version: "1.0.9"
change_id: "ATOMIC-20261103-002"
canonical_doctrine: "C:\\Users\\cotaha\\source\\repos\\.agent\\doctrinas\\DOCTRINA_MAESTRA_UNIFICADA.md"
document_standard: "C:\\Users\\cotaha\\source\\repos\\.agent\\doctrinas\\ESTANDAR_DOCUMENTAL_AGENTES.md"
---

# Bitácora histórica de cortes de continuidad de Atomic UI

Este archivo conserva los cortes históricos archivados desde [`CONTINUIDAD_AGENTES.md`](./CONTINUIDAD_AGENTES.md) conforme a la ventana deslizante de `DOC-20261025-001`. Solo debe consultarse bajo demanda cuando se investigue un corte anterior.

## Corte archivado por ATOMIC-20261103-002

### 3. Unidad ATOMIC-20261102-004 — dependencias de desarrollo y acreditación por candidatura

La resolución separa `minimatch@<4`, mediante la fachada privada
`tools/compatibilidad-minimatch` y el alias al motor oficial 11.0.4, del rango
`>=4 <11.0.1`, dirigido a 11.0.4. Se conserva la función CommonJS y los
metadatos de segmentos de los consumos comprobados de glob 7 y Karma.
El reemplazo por `@stackline/deepmerge@1.1.0` se acota a
`fork-ts-checker-webpack-plugin@9.1.0`. El bundle de Storybook 10.6.5 recibe
un backport de la corrección oficial de amplificación mediante `postinstall`,
versión y hashes reconocidos, idempotencia y fallo ante deriva. Su siguiente
actualización exige revisar el parche; `--omit=dev` permite la ausencia de
Storybook y `--check` devuelve 1 si falta el bundle. No se afirma equivalencia
universal, motor embebido íntegramente v11 ni ausencia de riesgos desconocidos.

Los originales de la primera candidatura registran 34 alertas eliminadas,
auditorías sin alertas, instalación con npm 11.12.1 y lock intacto, corpus de
66 casos, lint sin errores ni avisos y tres construcciones con código cero.
Karma registra primero 764 casos correctos y un fallo de Select2 entre 765;
la única repetición completa pasa 765/765 con cobertura sin editar fuentes.
Se conservan ambos originales sin causa atribuida. El listado npm completo
conserva 1 por el binding opcional oxc WASI, observado en la referencia previa;
raíz y objetivo terminan con cero. Storybook conserva avisos de tamaño.
La última corrección de esa candidatura es rechazada porque la guarda omite
`make()` sobre una instancia devuelta por una fábrica; se devuelve el criterio
a arquitectura, sin tercera edición bajo la orden agotada.

Los cambios posteriores de ejecución, historias y catálogos de 006 invalidan
las pasadas previas de navegador y las regresiones para el árbol posterior.
El escribano detecta la ventana 006/005/003 y detiene la escritura; la nueva
adenda conserva 006/005, incorpora 004 y archiva íntegro 003. El producto
continúa en `5.22.0`, con Angular 22, Storybook 10.6.5 y Karma 6.4.4,
publicación congelada y sin adopción en consumidores. La corrida completa
conservada del ecosistema devuelve 1 por secretos ajenos (`REAL 34`,
`DEBIL 10`), índice desactualizado y EOF del roadmap paralelo 005, sin verde
global.

La segunda candidatura agotó sus dos correcciones y quedó en TEMP. En una
copia, retirar `@colors/colors/safe.js` impidió cargar el reporter de Karma
mientras la guarda y su CLI devolvían cero. El archivo estaba presente en
la instalación real. Se conservan el ensayo, la restauración y los rechazos
de las propuestas `17/e1`, `8a/4338` y de la última corrección. La nueva
orden mantiene la ruta completa y fija una garantía más acotada. El JSON
de línea base pertenece a la candidatura que quedó en TEMP.

La guarda adoptada limita la comprobación local a descubrir instalaciones y consumos
de `minimatch`, `motor-minimatch` y `deepmerge`, incluidas las declaraciones
de la raíz. Comprueba identidad, versión y resolución efectiva desde cada
propietario, con contraste del lock y distinción de dependencias requeridas
y omisiones opcionales. La comprobación tiene alcance de desarrollo y se
ejecuta sin red. El helper separado verifica la versión y los hashes del
backport de Storybook. El corpus y la carga del reporter de Karma son pruebas
separadas. La evidencia se limita a los consumos y casos medidos.

La revalidación sobre el corte 006 registra 800/800 casos, lint sin avisos y
las construcciones de aplicación, biblioteca y Storybook con código cero.
Una especificación posterior de Modal motiva repetir lint y Karma. Esa
corrida registra 801/801 casos y cobertura de 78,07 % de sentencias,
68,04 % de ramas, 76,65 % de funciones y 78,83 % de líneas. La especificación
queda fuera de las entradas de las compilaciones y del navegador. La pasada
de navegador del corte 006 verifica la aplicación en 4200, Storybook de
desarrollo, el diálogo y su foco, una sola instancia de tabla en los tres
estados del control y el preview estático, sin errores de consola.
La comprobación ADN R1–R10 termina con código cero para los diez archivos
fuente aplicables de su alcance.

La guarda acotada y su README se adoptaron con código cero y con las
huellas esperadas. En el árbol vivo, `check:dependencias` termina con cero.
Las instalaciones limpias con npm 11.12.1 y 11.16.0 pasan. Ambas auditorías
del árbol vivo arrojan un total de cero y conservan iguales las siete
huellas de entradas.

Los lotes concurrentes `ui-acotada-css-final` y `ui-acotada-ultimo-corte`
conservan sus códigos 2 del driver. El primero registró un cambio de
`catalog/components/about-dialog.json`, ajeno a Karma y a los builds de
aplicación y biblioteca. Las ejecuciones individuales y su alcance se
conservan en el roadmap.

El lote estable `ui-006-lote-H87f4t` pasa 807/807 pruebas de Karma y los
tres builds con código cero y siete huellas iguales, sobre CSS
`9078ef48…` y manifiesto `3718b8c0…`. Se conserva el lint con código cero
del lote anterior porque las diferencias de CSS y manifiesto quedan
fuera de sus entradas. La aplicación renderiza con la consola sin errores
en la observación del corte estable. Las observaciones de Storybook
estático y de desarrollo corresponden a sus cortes registrados. La
comprobación ADN R1–R10 termina con cero en su alcance aplicable.

La corrida global completa registra código 1 por índice documental y
hallazgos de secretos fuera de Atomic UI. El índice se verifica por
separado. En la corrida original de gobierno pasan la comprobación de
dependencias y la del consumidor. El smoke registra código 1 por el
arnés. El lote v3 registra código cero en el smoke y en otras 22
obligaciones y conserva la deriva externa observada. Los códigos originales y las repeticiones se conservan.

La corrida definitiva de `package:check` termina con código cero, incluido
el driver, y conserva iguales las siete huellas. Registra 347 lecturas y
cero fuera de las entradas previstas, valida 340 fuentes y produce un
ensayo de empaquetado privado de cinco archivos y 78.488 bytes. Se preservan
los dos intentos fallidos, por cambio concurrente del inventario y por la
caché temporal del arnés, respectivamente. El roadmap conserva los códigos
de gobierno, incluida la repetición del smoke en el corte de cierre.

Los resultados definitivos de la nueva candidatura, sus revalidaciones,
juicio, gobierno, índice, confinamiento, sondeo, desviaciones y rollback se
identifican en el [roadmap](../.agent/roadmaps/ROADMAP_ATOMIC-20261102-004_seguridad_dependencias.md).

## Corte archivado por ATOMIC-20261102-004

### 3. Unidad ATOMIC-20261102-003 — tipado y confirmación nativa

Se corrigen localmente los 18 avisos de tipado y los cuatro de accesibilidad.
`PaginaCrud<T extends object = Record<string, unknown>>` conserva las entidades
explícitas y endurece los accesos de referencias desnudas; el contrato de
catálogos detalla la migración y los límites del fixture estricto.
`PaginaCrudAccordion` usa `CrudDialog` con rol `alertdialog`, foco inicial en
Cancelar, Escape, fondo optativo y retorno al disparador. Se conserva la
intención `{ clave, datos }`, sin persistencia ni ciclo asíncrono controlado.
La fuente, las historias y las regresiones permanecen locales, bajo el
congelamiento de publicación, con producto `5.22.0` y sin cambio de dependencias.
El lint final pasa con cero errores y cero avisos; la suite completa pasa
762/762 casos con 54 regresiones nuevas, después del refuerzo de emisión única.
Las construcciones de aplicación, biblioteca y Storybook terminan con código
cero y se regenera el manifiesto de las 337 fuentes. El gobierno Atomic
completo termina con código cero. El navegador definitivo acredita título y
tabla visibles sin errores, tres variantes de tonos en dos
historias y la confirmación con X, Cancelar y foco; las capturas de 375 y
1280 CSS px muestran los radios interiores sin puntas. La adaptación tipada
del renderer de Storybook 10.6.5 conserva los IDs y enlaces públicos y se
comprueba con el diálogo numérico, nueve tablas de propiedades y un cambio de
control con una sola instancia. No se certifica adopción en consumidores ni
un `atomicRef` nuevo. Los originales, la revisión independiente y los límites
de las compuertas del ecosistema se conservan en el
[roadmap](../.agent/roadmaps/ROADMAP_ATOMIC-20261102-003_avisos_lint.md).

## Corte archivado por ATOMIC-20261102-005

### 3. Unidad ATOMIC-20261102-001 — dependencias y arranque local

La unidad actualiza herramientas compatibles de Angular 22.2 y Storybook 10, revisa overrides antiguos y habilita el prebundling al desactivar la optimización exclusivamente en desarrollo. Se conserva la versión del producto `5.22.0`, el contrato de componentes y los cambios previos del usuario en el lock. La instalación reproducible, las versiones finales, la auditoría, sus remanentes y las validaciones se consultan en el [roadmap](../.agent/roadmaps/ROADMAP_ATOMIC-20261102-001_dependencias.md). Después de obtener el árbol revisado se utiliza `npm ci`; el CLI local se ejecuta mediante `npm start`, sin requerir una instalación global de Angular.

## Corte archivado por ATOMIC-20261102-003

### 3. Unidad ATOMIC-20260823-600 (corte 3) — compuertas de selectores y Tailwind, unidades relativas y tokens canónicos

Se sanea `ScrollOverlayComponent` (`variant: 'default' | 'brand'`, UTF-8, unidades `rem`), se repara `PaginaCrudAccordion` (`(buttonClick)` en Cancelar, pie en modo `ver`, tokens reales y `pagina-crud-accordion.spec.ts`), se protege `ThemeService.getEffectiveTheme()` para SSR (`typeof window.matchMedia !== 'function'`), se retiran rotaciones en hover de `ThemeSwitcherComponent`, se eliminan dos hojas CSS huérfanas (`filters.component.css`, `chart-tokens.css`) y se prohíbe `CommonModule` en `check:control-flow` (`test:control-flow-gate`). Se acotan los 16 alias transitorios `prest-*` bajo `app-*` primario obligatorio (`check:selectors` y `test:selectors-gate`, 120 declaraciones) retirándolos del generador `tools/generate-ui.js`, y se purgan las utilidades residuales de Tailwind en historias, vistas de demostración y generador (`check:no-tailwind` y `test:no-tailwind-gate`, 558 archivos). Se sustituyen las medidas rígidas `px` no pertenecientes a trazos finos (`<= 2px`) o puntos de corte en las 35 hojas `.css`/`.scss` y 6 archivos `.ts`/`.html` de `src/app/shared/ui/` y en `src/styles/themes/_utilities.css` por tokens o `rem`, gobernadas por `check:units` (`scripts/check-css-units.mjs` y `tools/test-css-units-gate.mjs`, 105 hojas auditadas). Se añaden `--checkbox-size`, `--checkbox-icon-size` y `--topbar-height`, se eliminan tokens fantasma y colores literales `#hex`/`rgb()`/`rgba()`, se acotan con `:host` las reglas `::ng-deep` en `icon-button.component.css` y `row.component.css`, se reemplazan `--floating-*-icon-cursor` por clases de estado, se regeneran `catalog/`, `dart/atomic_tokens` y `distribution/atomic-source-manifest.json`, y se validan `npm run lib:build` y 198/198 pruebas unitarias en Karma + `ChromeHeadless`. Consultar el [roadmap](../.agents/roadmaps/ROADMAP_20260823_atomic_ui_6_0.md).

## Corte archivado por ATOMIC-20261102-002

### 3. Unidad ATOMIC-20261026-003 — tipografía local canónica Quicksand y Open Sans

Se empaquetan en `src/styles/themes/fonts/` los 12 archivos `.woff2` locales de `Open Sans` (`400`, `500`, `600`, `700` en `latin` y `latin-ext`) y `Quicksand` (`400`, `500`, `600`, `700` completo), declarados en `src/styles/themes/_fonts.css`, importados al inicio de `src/styles/themes/index.css` e inventariados en `distribution/package-contract.json` y `distribution/atomic-source-manifest.json`. Se definen `--font-family-base`, `--font-family-heading` y `--font-family-mono` en `_tokens-primitives.css`, se corrige `--table-font-family: var(--font-family-base)` en `_tokens-components.css` y se enlaza `--font-family-heading` en encabezados globales (`h1`–`h6`), `text.component.css`, `page-header.scss`, `pagina-crud.scss`, `pagina-crud-accordion.scss`, `modal.component.css`, `modal-container.component.css`, `popup-container.component.css`, `form-dialog.scss` y `kpi-card.component.css`, además de `version.component.css`, el puente Dart (`scripts/emit-dart-tokens.mjs`) y la prueba negativa `tools/test-typography-scale-gate.mjs`. Consultar el [roadmap](../.agent/roadmaps/ROADMAP_ATOMIC-20261026-001_tipografia_local_quicksand_open_sans.md).

## Corte archivado por ATOMIC-20261102-001

### 3. Unidad ATOMIC-20261026-002 — corrección editorial y referencia material

Se corrigen las 151 ocurrencias de prosa que producen los 150 hallazgos
ortográficos de los dos registros. Los identificadores ASCII, bloques de
código, versiones y anclas históricas se conservan. La referencia visual se
califica como maestra §3.1; la desviación original sigue abierta y declara
`por-clasificar` para su atribución operativa a Orquestación. El control de
referencias del directorio pasa; el control ortográfico conserva código 1
por un falso positivo en el identificador HTML ASCII de la primera ancla.
La [evidencia y checklist](../.agent/auditorias/ATOMIC-20261026-002/CIERRE_EDITORIAL.md)
conservan las salidas originales, el juicio independiente y la limitación.
No se repiten las 70 pruebas válidas del corte anterior ni se modifica
producto, dependencias, manifiestos o trabajo de otras sesiones.

## Corte archivado por ATOMIC-20260823-600 (corte 3)

### 3. Unidad ATOMIC-20261026-001 — pruebas de accesibilidad

Se corrigen seis expectativas en cuatro especificaciones mediante presencia obligatoria y estrechamiento del nodo, conservando los casos existentes. La copia aislada del HEAD `dd93734a3eea40b87d46b4990976231fe2d6ca19` más las cuatro pruebas propias pasa 70/70 casos de Input, Select, Textarea, Dropdown, ActionGroup y PaginaCrud. Los otros 802 archivos conservan los bytes de la copia inicial; el cotejo con blobs Git normaliza CRLF. Se conserva el lockfile de las dependencias completas existentes. No se cambian componentes, configuración ni dependencias. El [roadmap](../.agent/roadmaps/ROADMAP_ATOMIC-20261026-001_desbloqueo_pruebas.md) registra revisión independiente, custodia y límites del corte; no acredita el árbol móvil, paquete, gobernanza o procedencia actuales.

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


### 3. Unidad ATOMIC-20261102-002 — arranque visible, lint y pruebas

Se corrige el bootstrap ESM que dejaba la aplicación en blanco. El navegador
renderiza la interfaz y la consola del nuevo arranque no contiene la excepción
del compilador. Se eliminan los 11 errores de lint conservando sus reglas y
22 avisos, y la suite completa pasa 708/708 casos con cobertura adicional de
credenciales, errores y asociación accesible de Select2. Se conserva la política
activa del interceptor y las dependencias de la unidad anterior. La revisión,
compuertas completas, manifiesto y límites se consultan en el
[roadmap](../.agent/roadmaps/ROADMAP_ATOMIC-20261102-002_arranque_lint_pruebas.md).
