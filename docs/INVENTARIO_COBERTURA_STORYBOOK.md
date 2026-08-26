---
title: "Inventario de cobertura de Storybook"
document_type: "inventario"
status: "vigente"
version: "1.0.0"
updated: "2026-08-25"
scope: "src/app/shared/ui · src/blueprints · src/stories · src/app/pages/showcase"
baseline_commit: "19e1298"
---

# Inventario de cobertura de Storybook

Nadie sabía qué piezas del ADN están documentadas. Este documento lo cuenta. No
estima: cada cifra sale de leer los ficheros y cruzarlos, y al final está escrito
cómo se reproduce el conteo.

La conclusión corta, para quien no siga leyendo: **de 95 clases con decorador,
71 tienen entrada propia en Storybook y 18 no aparecen en ninguna parte**. Y las
73 entradas que existen se reparten así: **19 documentan estados reales, 4 los
documentan a medias, 47 documentan sólo apariencia y 3 no renderizan lo que
dicen renderizar**.

---

## 0. Qué se contó, y con qué criterio

Contar «componentes» admite tres respuestas distintas, así que las tres están
aquí y se distinguen en cada tabla:

- **Carpeta.** Una carpeta bajo `atoms/`, `molecules/`, `organisms/`,
  `surfaces/`, `templates/` o `src/blueprints/`. Es la unidad con la que se
  habla en las reuniones: «el acordeón», «la tabla».
- **Clase con decorador.** Cada `@Component` o `@Directive` exportado. Una
  carpeta puede tener varias: `accordion/` tiene dos, `table/` tiene cinco.
  Es la unidad que de verdad se puede documentar por separado.
- **Entrada propia en Storybook.** Un fichero `*.stories.ts` cuyo `component:`
  es esa clase. Aparecer *dentro* de la historia de otro —el botón dentro de la
  historia del diálogo— no es tener entrada: es ser decorado.

Y para el capítulo de estados, un criterio que conviene enunciar porque cambia
el resultado: **una perilla no es documentación; una historia sí**. Si el estado
`busy` existe como `control: 'boolean'` con valor por defecto `false` pero
ninguna historia aterriza en `true`, ese estado no está documentado: está
disponible para quien ya sepa que existe y vaya a buscarlo.

---

## 1. El recuento

| Capa | Carpetas | Clases con decorador | Con entrada propia | Sin entrada propia |
|---|---:|---:|---:|---:|
| Átomos | 34 | 38 | 28 | 10 |
| Moléculas | 19 | 20 | 18 | 2 |
| Organismos | 21 | 24 | 16 | 8 |
| Superficies | 1 | 1 | 1 | 0 |
| Plantillas | 2 | 2 | 2 | 0 |
| Blueprints | 11 | 10 | 6 | 4 |
| **Total** | **88** | **95** | **71** | **24** |

Los ficheros de historias son **73** y contienen **345 historias exportadas**.
La suma cuadra: 71 entradas de clases del ADN + 2 entradas cuyo `component:` es
un componente de demostración declarado dentro de la propia historia
(`ui-popup`, `ui-tooltip`) = 73.

**Dos correcciones al enunciado de partida.** La misión hablaba de 13
blueprints; hay **11 carpetas**, y una de ellas —`auth-guards`— no contiene
ningún componente: son guardas, interceptor y servicios, así que no es
documentable en Storybook y quedan **10 blueprints visuales**. El total real de
piezas por carpeta es **88**, no 87, porque `surfaces/panel`,
`templates/auth-layout` y `templates/layout-shell` son tres piezas que la cuenta
de «34 + 19 + 21 + blueprints» no recogía.

De las 24 clases sin entrada propia, **6 aparecen al menos como piezas
secundarias** dentro de la historia de otro componente, y **18 no aparecen en
absoluto**.

---

## 2. Lo que no está documentado

### 2.1 Átomos

| Carpeta | Clase | Selector | ¿Aparece en alguna historia? |
|---|---|---|---|
| choice-control | `ChoiceControl` | `app-choice-control` | **No, en ninguna** |
| form-input | `Input` | `app-input, app-form-input` | Sólo como pieza secundaria en `ui-form-dialog` y `ui-query-toolbar` |
| form-select | `Select` | `app-select, app-form-select` | **No, en ninguna** |
| table | `TableHeadComponent` | `app-table-head` | **No, en ninguna** |
| table | `TableHeaderCellComponent` | `th[app-table-header-cell]` | **No, en ninguna** |
| table | `TableCellComponent` | `[app-table-cell]` | Secundaria en `ui-table` |
| table | `TableRowComponent` | `tr[app-table-row]` | Secundaria en `ui-table` |
| table-action | `TableAction` | `app-table-action` | **No, en ninguna** |
| tooltip | `TooltipDirective` | `[appTooltip]` | Sí, cubierta: `ui-tooltip` la monta sobre un componente de demostración propio |
| version | `VersionComponent` | `app-version` | **No, en ninguna** |

Merecen mirarse dos cosas de esta lista. La primera: `choice-control`,
`form-input` y `form-select` **están en el catálogo normativo**
(`catalog/components/choice-control.json`, `input.json`, `form-select.json`),
es decir, son componentes que el catálogo obliga a usar y que Storybook no
enseña. La segunda: los cinco átomos de tabla se documentan a medias —la
historia de `Table` monta `<thead>` y `<th>` nativos en vez de los dos átomos de
cabecera que existen para eso, así que `app-table-head` y
`th[app-table-header-cell]` no se ven en ninguna parte.

### 2.2 Moléculas

| Carpeta | Clase | ¿Aparece? |
|---|---|---|
| modal | `ModalContainerComponent` | **No, en ninguna** |
| popup | `PopupContainerComponent` | Secundaria en `ui-popup` (que no renderiza, §4) |

Las 19 carpetas de moléculas tienen fichero de historia. Lo que falta son los
dos **contenedores raíz** —los que el consumidor tiene que montar una vez en el
layout para que `ModalService` y `PopupService` funcionen—. Es justo la pieza
que alguien que integra el ADN por primera vez necesita ver.

### 2.3 Organismos

| Carpeta | Clase | ¿Aparece? |
|---|---|---|
| accordion | `AccordionItemComponent` | Se usa en la plantilla de `ui-accordion` **sin estar declarado** (§4) |
| chart | `ChartComponent` | **No, en ninguna** |
| crud-dialog | `CrudDialog` | **No, en ninguna** |
| data-pager | `DataPagerComponent` | **No, en ninguna** |
| data-table | `DataTable` | **No, en ninguna** |
| form-dialog | `FormDialogActions` | Secundaria en `ui-form-dialog` |
| print-document-panel | `PrintDocumentPanel` | **No, en ninguna** |
| tabs | `TabComponent` | Se usa en la plantilla de `ui-tabs` **sin estar declarado** (§4) |

Cinco carpetas enteras sin historia: `chart`, `crud-dialog`, `data-pager`,
`data-table`, `print-document-panel`.

`DataTable` es la ausencia más cara. Es el organismo con **26 entradas**, el que
declara `loadingMessage`, `emptyMessage` y `errorMessage` —los tres estados del
capítulo 1 de la doctrina, ya resueltos en el código— y no hay ni una sola
pantalla en Storybook donde se vean.

### 2.4 Superficies y plantillas

Completas: `panel`, `auth-layout` y `layout-shell` tienen entrada propia.

### 2.5 Blueprints

| Carpeta | Clase | Estado en el manifiesto | ¿Historia? |
|---|---|---|---|
| analytics-page | `AnalyticsPageComponent` | `legacy-demo` | **No** |
| auth-guards | (sin componente) | `legacy-demo` | No aplica |
| crud-table | `CrudTableComponent` | `legacy-demo` | Sí (2) |
| dashboard-page | `DashboardPageComponent` | `legacy-demo` | Sí (2) |
| error-pages | `ErrorPagesComponent` | `legacy-demo` | **No** |
| forgot-password-page | `ForgotPasswordPageComponent` | `legacy-demo` | Sí (3) |
| login-page | `LoginPageComponent` | `legacy-demo` | Sí (3) |
| profile-page | `ProfilePageComponent` | `legacy-demo` | Sí (1) |
| register-page | `RegisterPageComponent` | `legacy-demo` | Sí (1) |
| reports-page | `ReportsPageComponent` | `legacy-demo` | **No** |
| settings-page | `SettingsPageComponent` | `legacy-demo` | **No** |

`error-pages` es la ausencia que contradice a la doctrina de frente: es el
blueprint que pinta 404, 403 y 500 —«no se pudo comprobar» frente a «no tiene
permiso», capítulo 1— y no está documentado en ninguna parte.

### 2.6 Directivas fuera de `atoms/`

`directives/permission.directive.ts` (`[appPermission]`) y
`directives/variables-css.directive.ts` (`[appVariablesCss]`) no tienen historia.
No están en el recuento de las 95 clases por capa porque no viven en una capa
atómica, pero son API pública del ADN.

### 2.7 Resumen: las 18 clases que no aparecen en ninguna historia

`ChoiceControl` · `Select` (form-select) · `TableHeadComponent` ·
`TableHeaderCellComponent` · `TableAction` · `VersionComponent` ·
`ModalContainerComponent` · `AccordionItemComponent`\* · `ChartComponent` ·
`CrudDialog` · `DataPagerComponent` · `DataTable` · `PrintDocumentPanel` ·
`TabComponent`\* · `AnalyticsPageComponent` · `ErrorPagesComponent` ·
`ReportsPageComponent` · `SettingsPageComponent`

\* Se escriben en una plantilla de historia, pero sin declararse en el módulo de
esa historia. Ver §4.

---

## 3. Las historias que sí existen: apariencia frente a estados

Cada fila lleva el número de historias del fichero, qué estados del capítulo 1
de la doctrina **aterrizan en una historia concreta** (no en una perilla), y
cuántas entradas del componente ejercita el fichero de las que declara.

| Historia | n | Estados que aterrizan | Inputs | Veredicto |
|---|---:|---|---:|---|
| blueprint-crud-table | 2 | — | 0/0 | apariencia (Default + DarkMode) |
| blueprint-dashboard-page | 2 | — | 0/0 | apariencia (Default + DarkMode) |
| blueprint-forgot-password-page | 3 | — | 0/0 | dos pasos de flujo, ningún estado de dato |
| blueprint-login-page | 3 | — | 0/0 | apariencia (Default + DarkMode + Mobile) |
| blueprint-profile-page | 1 | — | 0/0 | **una sola historia** |
| blueprint-register-page | 1 | — | 0/0 | **una sola historia** |
| ui-accordion | 5 | — | 0/2 | **no renderiza** (§4) |
| ui-action-group | 8 | deshabilitado | 5/6 | estados |
| ui-alert | 6 | — | 4/4 | tonos, no estados |
| ui-auth-layout | 3 | — | 0/0 | composición |
| ui-avatar | 12 | — | 7/9 | apariencia |
| ui-avatar-group | 6 | — | 3/3 | apariencia + desborde |
| ui-badge | 6 | — | 8/9 | apariencia |
| ui-breadcrumb | 4 | — | 2/2 | apariencia |
| ui-button | 14 | cargando · deshabilitado | 8/13 | estados |
| ui-card | 6 | — | 6/7 | apariencia |
| ui-checkbox | 7 | deshabilitado | 2/2 | estados |
| ui-chip | 10 | — | 6/6 | apariencia |
| ui-combobox | 7 | error · deshabilitado | 7/7 | estados |
| ui-context-menu | 3 | deshabilitado | 1/2 | estados |
| ui-data-state | 4 | **cargando · vacío · error** | 9/10 | **la única con los tres** |
| ui-datepicker | 4 | deshabilitado | 2/4 | parcial: declara `error` y no lo enseña |
| ui-denomination-counter | 3 | vacío | 6/16 | parcial: `state` y `disabled` sin ejercitar |
| ui-divider | 5 | — | 3/4 | apariencia |
| ui-dropdown | 4 | deshabilitado | 4/4 | estados |
| ui-file-input | 5 | error · deshabilitado | 8/10 | estados |
| ui-filters | 2 | — | 1/4 | apariencia; el filtro no filtra (§5) |
| ui-floating-input | 10 | deshabilitado | 8/13 | parcial: `error` y `readonly` sin enseñar |
| ui-footer | 3 | — | 6/18 | apariencia; 12 entradas sin tocar |
| ui-form-dialog | 1 | (`busy` sólo como perilla) | 6/7 | **una sola historia** |
| ui-form-error | 4 | — | 1/3 | apariencia; `showOnTouched` sin ejercitar |
| ui-form-row | 3 | — | 2/2 | apariencia |
| ui-icon-button | 5 | deshabilitado | 3/5 | estados |
| ui-input | 6 | error · deshabilitado | 6/7 | estados |
| ui-kpi-card | 4 | — | 13/14 | apariencia + contenedor estrecho |
| ui-language-switcher | 3 | — | 0/0 | apariencia |
| ui-layout-shell | 3 | — | 2/12 | composición; 10 entradas de pie de página sin tocar |
| ui-loader | 8 | — | 2/2 | apariencia; faltan 2 de 6 variantes (§5) |
| ui-metrics-grid | 3 | — | 3/3 | apariencia + 320 px |
| ui-modal | 7 | cargando · error | 3/5 | estados, con prueba de interacción |
| ui-navbar | 4 | — | 4/6 | apariencia |
| ui-number-input | 3 | deshabilitado | 6/8 | estados |
| ui-page-header | 2 | — | 4/6 | apariencia |
| ui-pagination | 11 | — | 5/6 | apariencia + volumen (500 elementos) |
| ui-panel | 4 | — | **2/9** | apariencia mínima: nunca cambia de variante |
| ui-popup | 1 | — | — | **no renderiza** (§4) |
| ui-progress | 4 | — | 4/6 | apariencia; `indeterminate` sin ejercitar |
| ui-query-toolbar | 2 | — | 3/3 | apariencia |
| ui-radio | 4 | deshabilitado | 4/5 | estados |
| ui-rating | 8 | solo lectura | 4/6 | estados |
| ui-receipt-panel | 1 | — | 6/8 | **una sola historia** |
| ui-row | 3 | — | 4/9 | apariencia: sólo columnas |
| ui-scroll-overlay | 5 | — | 8/16 | apariencia + geometría |
| ui-select | 4 | error · deshabilitado | 5/5 | estados + volumen |
| ui-select2 | 8 | deshabilitado | 8/9 | estados |
| ui-sidebar | 3 | — | **1/5** | apariencia mínima: nunca recibe datos (§5) |
| ui-skeleton | 8 | — | 3/3 | apariencia (el componente *es* el estado de carga) |
| ui-spinner | 3 | — | 2/3 | apariencia |
| ui-status-badge | 5 | — | 4/6 | tonos + contenedor estrecho |
| ui-stepper | 8 | — | 2/4 | apariencia; `vertical` y `allowSkip` sin ejercitar |
| ui-table | 6 | vacío (como fila, §4) | 9/9 | parcial |
| ui-table-actions | 3 | — | 0/0 | apariencia |
| ui-tabs | 5 | deshabilitado (no llega a pintarse) | 0/3 | **no renderiza** (§4) |
| ui-tag-input | 4 | deshabilitado | 5/8 | estados |
| ui-text | 5 | — | 3/4 | apariencia |
| ui-textarea | 5 | error · deshabilitado | 8/9 | estados; `readonly` sin ejercitar |
| ui-theme-switcher | 3 | — | 0/0 | apariencia |
| ui-timeline | 3 | — | 1/2 | apariencia; `orientation` sin ejercitar |
| ui-toast | 7 | — | 0/0 | tonos + posiciones |
| ui-toggle | 7 | deshabilitado | 2/3 | estados |
| ui-tooltip | 2 | — | — | apariencia |
| ui-topbar | 3 | — | 5/8 | apariencia |
| ui-user-menu | 5 | — | 2/5 | apariencia |

### 3.1 Los cuatro estados de la doctrina, contados

| Estado (capítulo 1) | Historias que lo pintan | Cuáles |
|---|---:|---|
| Cargando | **3** | `ui-button` (Loading), `ui-data-state` (Loading), `ui-modal` (AsyncActionLifecycle) |
| Vacío | **3** | `ui-data-state` (Empty), `ui-denomination-counter` (Empty), `ui-table` (Empty) |
| Error | **7** | `ui-combobox`, `ui-data-state`, `ui-file-input`, `ui-input`, `ui-modal`, `ui-select`, `ui-textarea` |
| Sin permiso | **0** | ninguna |
| Deshabilitado / solo lectura | **20** | (ver tabla anterior) |

De 73 entradas, **una sola** —`ui-data-state`— enseña cargando, vacío y error
juntos. Es exactamente el reparto contra el que advierte la doctrina: el estado
deshabilitado, que es el barato de pintar, está en veinte sitios; el error está
en siete y siempre en campos de formulario; el «cargando» está en tres; y «sin
permiso» no está en ninguno.

Y el «vacío» de `ui-table` no es un estado: es una fila. La historia `Empty`
mete el texto «No hay datos para mostrar» dentro de un `<tr app-table-row>` con
un `<td app-table-cell>`, es decir, **como si fuera un registro**. El capítulo 11
dice lo contrario: el estado «no se convierte en tarjeta: sigue siendo un
bloque, porque no es un registro».

### 3.2 Las cinco entradas de una sola historia

`blueprint-profile-page` · `blueprint-register-page` · `ui-form-dialog` ·
`ui-popup` · `ui-receipt-panel`.

De las cinco, `ui-popup` no renderiza (§4) y `ui-form-dialog` deja el estado
`busy` detrás de una perilla. `ui-receipt-panel` documenta un recibo de pago con
6 de 8 entradas, y es la más honrada de las cinco.

### 3.3 Las entradas con menos de la mitad de su API ejercitada

| Historia | Ejercitadas | Lo que falta |
|---|---|---|
| ui-sidebar | 1/5 | `menuItems`, `user`, `logoText`, `logoIcon` |
| ui-panel | 2/9 | `variant`, `icon`, `showHeader`, `fullWidth`, `titleSize`, `titleWeight`, `titleAlign` |
| ui-layout-shell | 2/12 | las 7 entradas de pie de página, `skipLinkLabel`, `sidebarLabel`, `compactViewportQuery` |
| ui-datepicker | 2/4 | `variant`, `error` |
| ui-tabs | 0/3 | `defaultIndex`, `ariaLabel`, `orientation` |
| ui-accordion | 0/2 | `flush`, `single` |
| ui-filters | 1/4 | `filterLabel`, `clearLabel`, `showClear` |
| ui-form-error | 1/3 | `customMessage`, `showOnTouched` |
| ui-timeline | 1/2 | `orientation` |
| ui-denomination-counter | 6/16 | `state`, `disabled`, `emptyMessage`, `maxQuantity`, `locale`, `currency`… |
| ui-footer | 6/18 | `version`, `environment`, `buildDate`, `showVersion`, `showBuildDate`… |
| ui-scroll-overlay | 8/16 | `minColumnWidth`, `syncTableColumns`, `trackSize`, `autoHideDelay`… |
| ui-stepper | 2/4 | `vertical`, `allowSkip` |
| ui-user-menu | 2/5 | `initials`, `userRole`, `menuActions` |
| ui-row | 4/9 | `variant`, `wrap`, `verticalAlign`, `responsive`, `minColumnWidth` |

`ui-sidebar` es el caso que mejor lo resume: sus tres historias
—Expanded, Collapsed, WithContent— sólo cambian `[collapsed]` y no le pasan
**ni un solo elemento de menú ni un usuario**. El sidebar con datos reales
existe en Storybook, pero dentro de la historia de `LayoutShell`, donde nadie
lo busca.

---

## 4. Historias que no pintan lo que dicen pintar

Cuatro casos verificados. No son opiniones de estilo: son ficheros que fallan al
representar el componente que anuncian.

**1. `ui-popup.stories.ts` no renderiza nada.** El componente de demostración se
declara con `selector: 'app-popup-demo'` y la única historia lo invoca como
`<sb-popup-demo></sb-popup-demo>`. Es la única entrada de Popup del catálogo, y
además es donde vive el ejemplo de confirmación redactado según el capítulo 7
(«Eliminar el elemento» en el botón, y el mensaje diciendo qué pasa).

**2. `ui-accordion.stories.ts` usa una entrada que no existe y un componente que
no declara.** Las cinco historias escriben `<app-accordion-item>`, pero el
fichero sólo importa `AccordionComponent`: `AccordionItemComponent` no está en
el módulo de la historia. Y dos historias —`WithOneExpanded` y `SingleItem`—
abren el panel con `[expanded]="true"`, cuando la entrada real se llama `open`
(`readonly entradaAbierto = input(false, { alias: 'open' })`). El showcase, que
sí importa el hijo y sí usa `[open]`, demuestra cuál es la API correcta.

**3. `ui-tabs.stories.ts` tiene el mismo defecto.** Las cinco historias montan
`<app-tab>` y el fichero sólo importa `TabsComponent`. `TabComponent` —que es
quien lleva `label`, `icon` y `disabled`— no está declarado, así que la historia
`DisabledTab` no puede enseñar una pestaña deshabilitada.

**4. El «Reintentar» de `ui-data-state` no reintenta.** La historia `Error` pasa
`showRetryButton: true` y no pasa `onRetry`, cuyo valor por defecto es
`{ emit: () => { } }`. El botón se pinta y no hace nada. El capítulo 1 de la
doctrina cierra con esa frase exacta: «Un "Reintentar" reintenta. Si cierra el
panel, es un botón que miente.» La única historia del ADN que enseña un error
recuperable enseña el contraejemplo.

Búsqueda de comprobación: `retry` y `Reintentar` no aparecen **ni una vez** en
los 73 ficheros de historias.

---

## 5. El showcase frente a Storybook

`src/app/pages/showcase/` es el catálogo vivo. Son 110 líneas de plantilla que
montan `LayoutShell` + `Sidebar` + `Topbar` + `ThemeSwitcher`, un panel de
`Filters`, un `Panel` con `ScrollOverlay` sobre una tabla nativa de nueve
columnas con `ActionGroup` por fila, y —tras un `@defer (on viewport)`— el
componente `app-ui-showcase`, que a su vez reparte ocho secciones en
`src/app/components/ui-showcase/examples/`: navegación, tipografía, estructura,
acciones, formularios, presentación de datos, retroalimentación y estado.

### 5.1 Patrones del showcase que Storybook no tiene

| Patrón | Dónde vive en el showcase | Estado en Storybook |
|---|---|---|
| Gráficas `line`, `doughnut` y `bar` leyendo `--chart-color-N` | showcase-data-display | `ChartComponent` no tiene historia |
| `app-table-head` + `th[app-table-header-cell]`, fila `[selected]`, `[maxHeight]`, `[columnTemplate]` | showcase-data-display | La historia de Table monta `<thead>`/`<th>` nativos; los dos átomos de cabecera no aparecen en ningún sitio |
| Sidebar con `menuItems`, `user`, `badge`, `active` e `iconColor` | showcase-navigation | La historia de Sidebar no pasa datos (1/5 entradas) |
| Stepper **vertical** y paso `optional` | showcase-navigation | 8 historias y ninguna toca `vertical` |
| Acordeón con un panel abierto por defecto (`[open]="true"`) | showcase-navigation | La historia usa `[expanded]`, que no es una entrada (§4) |
| Panel: matriz de `variant` × `titleAlign` × `titleSize` × `titleWeight` | showcase-structure | 2/9 entradas; ninguna historia cambia de variante |
| Row: `align` izquierda/centro/derecha, `justify`, `wrap`, `variant="form"` | showcase-structure y showcase-forms | 4/9 entradas; sólo columnas |
| Divider con `text=` (la historia usa `label`) | showcase-structure | `text` sin ejercitar |
| Loader `gradient` y `orbit` | showcase-status | La historia documenta 4 de las 6 variantes |
| `ModalService`: `confirm`, modal bloqueante (`closable:false`, `closeOnBackdrop:false`) y `alert`; más `app-modal-container` | showcase-feedback | La historia de Modal es puramente declarativa; ni el servicio ni el contenedor aparecen |
| `PopupService` con botones a medida (promoción con dos acciones) | showcase-feedback | La única historia de Popup no renderiza (§4) |
| `@defer (on viewport)` con `@placeholder` de carga | showcase-page.component.html | Sin equivalente |
| Traducción en vivo (`\| translate` sobre etiquetas y datos) | showcase-page.component.html | Sólo `ui-topbar` monta `TranslateModule`; ninguna historia usa el pipe sobre contenido |
| Volumen de filas configurable en caliente (25 por defecto, regenerable) | showcase-page.component.ts | La tabla del ADN se documenta con 7 filas fijas |
| Filtro que filtra de verdad (`onFilter`/`onClear` sobre los datos) | showcase-page.component.ts | La historia `Default` de Filters lanza `alert('Filtrar')` y no cablea `(clear)` |

### 5.2 Al revés: lo que el catálogo vivo pinta a mano teniendo componente gobernado

Esto no es un hueco de Storybook: es un hueco del showcase, y sale a la luz
justo al cruzar los dos. Seis familias de patrones se dibujan en el showcase con
CSS suelto mientras el componente gobernado existe y **sí** está documentado.

| Patrón dibujado a mano | Dónde | Componente gobernado que ya existe |
|---|---|---|
| `.btn`, `.btn-primary`, `.btn-danger`, `:disabled`… | showcase-actions, showcase-feedback, showcase-structure | `app-button` (14 historias) |
| `.badge`, `.badge-success`… | showcase-data-display, showcase-structure | `app-badge` (6) y `app-status-badge` (5) |
| `.alert`, `.alert-info`, `.alert-danger`… | showcase-feedback | `app-alert` (6) |
| `.card`, `.card-elevated`, `.card-header`… | showcase-structure | `app-card` (6) |
| `.progress-bar` + `.progress-fill` | showcase-status | `app-progress` (4) |
| `.tooltip-trigger::after` con `data-tooltip` | showcase-feedback | `TooltipDirective` (2) |

El showcase se llama «UI Components Showcase (Refactorizado)» y en seis sitios
enseña lo contrario de lo que el catálogo obliga a usar. Es el mismo patrón que
cierra la doctrina: alguien resolvió bien el caso que tenía delante —los
`app-button` con icono conviven en la misma sección que los `.btn` a mano— y
nadie generalizó.

---

## 6. Hallazgos colaterales del cruce

- **`app-divider align="start"` no hace nada.** En showcase-structure se escribe
  `<app-divider text="Continuar" align="start">`, y `DividerComponent` declara
  `text`, `label`, `variant` y `orientation`: no hay `align`. El atributo se
  ignora en silencio.
- **36 colores escritos a mano en las plantillas del showcase**: 27 `: white`,
  5 respaldos de color de gráfica (`#3b82f6` ×2, `#ec4899`, `#8b5cf6`,
  `#10b981`), 2 `#e5e7eb` y 2 `rgba(0,0,0,0.45)`. Viven en `styles: []` en línea
  dentro de ficheros `.ts`, fuera del glob `-ComponentGlob src/app/shared/ui`
  con el que corre `tokens:check`.
- **39 colores escritos a mano en 9 ficheros de historias**, entre ellos un
  `#6b7280` en `ui-tooltip.stories.ts`.
- **`ui-tooltip.stories.ts` declara `TooltipLongDemoComponent` y no lo usa**: la
  historia `WithIcon` repite la plantilla en línea en vez de montarlo.
- **El árbol de Storybook no está numerado de forma coherente.**
  `Molecules/ActionGroup` y `Organisms/Denomination Counter` no llevan prefijo
  numérico, así que quedan fuera de sus grupos. Los blueprints están partidos en
  dos: `4. Blueprints` (Forgot Password, Profile, Register) y `5. Blueprints`
  (CRUD Table, Dashboard, Login) — el mismo grupo aparece dos veces en la barra
  lateral. Y el `4.` y el `5.` los comparten con `4. Surfaces` y
  `5. Templates`. Además `popup`, que es una molécula en el árbol de ficheros,
  se publica como `3. Organisms/Popup`.

---

## 7. Movimiento durante el conteo

Mientras se contaba, un frente paralelo añadió
`src/stories/layout-dashboard-completo.stories.ts` (545 líneas, 1 historia). No
entra en las cifras de este documento —que se cierran sobre los 73 ficheros y
las 345 historias que había al empezar—, pero conviene dejar escrito qué toca:
monta `Chart`, `DataTable`, `TableAction`, `Sidebar` con datos, `MetricsGrid`,
`Progress`, `Panel`, `LayoutShell`, `Topbar` y `ThemeSwitcher` dentro de una
plantilla de panel de control.

Eso da a `ChartComponent`, `DataTable` y `TableAction` su **primera aparición**
en Storybook. No les da entrada propia: siguen sin sitio donde alguien que busca
«la tabla de datos» la encuentre con sus tres estados. La lista de §2.3 se
mantiene tal cual, con esta nota al margen.

---

## 8. Cómo se reprodujo el conteo

Todo lo de arriba sale de cruzar cuatro cosas, y cualquiera puede repetirlo:

1. **Piezas.** Carpetas de `src/app/shared/ui/{atoms,molecules,organisms,surfaces,templates}`
   y `src/blueprints`, y dentro de cada fichero `.ts` los bloques `@Component(`
   y `@Directive(` con su `export class` y su `selector`.
2. **Entradas.** Para cada `src/stories/*.stories.ts`, el `component:` del
   `meta` (la entrada propia) y los `import { … } from '../…'` (las apariciones
   secundarias).
3. **Estados.** Troceando cada fichero de historias por `export const` y
   buscando en cada bloque los enlaces `[loading]`, `[busy]`, `[error]`,
   `[disabled]`, `[readonly]`, `isEmpty` y sus equivalentes como argumentos.
   Los casos ambiguos —`disabled: true` en una opción de un combo dentro de la
   historia de otro componente, `busy: false` como valor por defecto de una
   perilla— se resolvieron abriendo el fichero.
4. **API ejercitada.** Extrayendo de cada clase sus `readonly X = input(…)` /
   `model(…)`, resolviendo los `alias` **dentro de la misma sentencia** (no por
   proximidad: hacerlo por proximidad atribuye el alias de una entrada a la
   anterior y falsea la cuenta), y buscando cada nombre en el fichero de la
   historia.

Comandos útiles para la comprobación rápida:

```bash
ls src/stories/*.stories.ts | wc -l              # ficheros de historias
grep -h '^export const ' src/stories/*.stories.ts | wc -l   # historias exportadas
grep -rn 'selector:' src/app/shared/ui --include='*.ts' | grep -v spec
```
