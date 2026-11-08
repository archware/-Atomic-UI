---
title: "Lecciones aprendidas de Atomic UI"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-08-23"
document_type: "registro técnico"
status: "en revisión"
last_updated: "2026-11-04"
version: "1.5.2"
last_change_id: "ATOMIC-20261104-001"
owners:
  - "COTAHA"
---

# Lecciones aprendidas de Atomic UI

## ATOMIC-20261104-001 — exclusión de extremos en ventanas de paginación, contraste en oscuro, semántica de `color="secondary"`, herencia cromática en `icon-button` (`variant="avatar"`) y reflujo de tarjeta PDF en contenedores estrechos

- **Omisión de la página `1` y de `totalPages` cuando el rango visible toca los extremos (`PaginationComponent.visiblePages`)**: si los extremos `1` y `total` solo se agregan fuera del bucle cuando `start > 1` y `end < total`, filtrar dentro del bucle `for (let i = start; i <= end; i++)` con `if (i !== 1 && i !== total)` descarta la página `1` cuando `start === 1` y la página `total` cuando `end === total` siempre que `total > maxVisible`. En consecuencia, al abrir una paginación de 10 páginas en `[page]="1"`, el botón activo `1` desaparece por completo del DOM y la barra solo muestra botones inactivos (`2..5, ..., 10`). El bucle central debe incluir todos los índices de `start` a `end` sin excluir `1` ni `total`, pues las guardas exteriores `start > 1` y `end < total` son disjuntas respecto al intervalo `[start, end]`.
- **Contraste de superficie y diferenciación de variantes en modo oscuro (`_tokens-components.css`, `pagination.component.css`, `check-theme-contrast.mjs`)**: pintar `.pagination-wrapper` con `--primary-color-light` (`#1a0818` en oscuro y `#f5e6f6` en claro) y `.page-btn.active` con `--brand-primary-600` (`#4a2048` en oscuro, relación `1.14:1` frente a la superficie oscura) apaga el botón activo y funde las variantes `minimal` y `rounded` (`background: transparent`) con el contenedor. Toda barra de paginación debe usar `--pagination-wrapper-bg: var(--surface-section)` con borde `--pagination-wrapper-border`, distinguir el estado `:disabled` con `--pagination-disabled-bg` / `--pagination-disabled-text` y `box-shadow: none` (sin `opacity`), usar un relleno activo luminoso en oscuro (`--brand-primary-A700` con borde `--brand-primary-300` y `--shadow-glow-primary`, relación `7.11:1` con `--gray-0`) y auditar los pares en `scripts/check-theme-contrast.mjs`. Además, al verificar en pruebas cambios síncronos de `data-theme` o de variante mediante `getComputedStyle(el).backgroundColor` sobre elementos con `transition: background-color 150ms ease`, debe deshabilitarse `transition: none` en el elemento medido para leer el color final y no el fotograma inicial `t = 0ms` de la interpolación CSS.
- **Confusión entre jerarquía tipográfica secundaria (`--text-color-secondary`) y color de relleno secundario de marca (`--secondary-color`) en `TextComponent`, `BadgeComponent` y botones**: en `TextComponent` (`text.component.css`), asignar `.color-secondary { color: var(--secondary-color); }` pinta los párrafos `<app-text color="secondary">` con el amarillo de relleno de marca (`#FFB800`, contraste `1.75:1` sobre blanco) en lugar del token de texto secundario `--text-color-secondary` (`7.56:1` en claro y `11.5:1` en oscuro, igual que `.text-secondary`). Asimismo, cuando el color secundario de marca es ámbar brillante (`#FFB800`), `--text-color-on-secondary` debe apuntar a un tono oscuro (`var(--brand-secondary-950)` `#422300`, contraste `8.35:1`) y nunca a blanco (`#ffffff`, `1.75:1`), y `<app-badge>` debe proyectar `<ng-content>` dentro de `.badge` cuando `count() === null && !dot() && !overlay()` para no renderizar círculos vacíos en insignias textuales.
- **Sobrescritura de color en pseudo-selectores `::ng-deep i.*`, contraste de gradiente en modo oscuro para `IconButtonComponent` (`variant="avatar"`), desborde/superficie de tarjetas PDF con `FloatingInput` (`dialogs-page`) y alcance de `check:signals` sobre `src/`**: en `icon-button.component.css`, si las reglas de animación `.icon-anim-*:hover ::ng-deep i.fa-solid` fijan `color: var(--primary-color)` directamente sobre el nodo hijo `<i>`, cualquier variante con fondo de marca (como `.icon-btn--avatar`) pierde su icono al hacer hover porque el glifo se pinta del mismo morado que el fondo (`1:1`). Además, en `dark` y `brand-dark`, `--primary-color` (`#bb6bbb`) y `--primary-color-dark` (`#dfa6df`) son tonos pastel diseñados para trazos y acentos sobre fondos oscuros (`1.60:1`–`1.96:1` contra blanco `--text-color-on-primary`), y `.icon-btn:hover:not(:disabled)` aplica `filter: brightness(1.1)`; por ello, `.icon-btn--avatar` debe construir su gradiente con `var(--button-primary-bg, var(--primary-color))` (`#652b63` / `#552153`, contraste `>= 8.98:1` con `--text-color-on-primary`) y `var(--brand-primary-700, var(--primary-color-dark))`, anular `filter: none` en hover, fijar `color: var(--text-color-on-primary)` en `::ng-deep i, ::ng-deep svg` y usar `color: currentColor` en `.icon-anim-*`. Por otra parte, cuando una tarjeta de documento (`.attached-file-row--pdf-card`) anida `<app-floating-input variant="floating">` + `close-ghost` dentro de `<app-scroll-overlay [disableHorizontal]="true">`, debe usar `background-color: var(--surface-background)` (para coincidir con `--input-bg` de `.floating-label`), apilar `.attached-file-main` (`min-width: 0; overflow-wrap: anywhere`) sobre `.file-row-inline-controls` (`width: 100%; align-items: flex-start`, con `--fi-min-width: 0` en el input y `margin-top: var(--space-3)` en `close-ghost`) y declarar `min-width: 0` en todos los ancestros Grid/Flex (`.variant-tile`, `.tile-stage`, `.showcase-group`). Finalmente, limitar la raíz por defecto de `tools/check-angular-signals.cjs` a `src/app/shared/ui` dejaba fuera `src/blueprints/` (permitiendo que `ErrorPagesComponent` conservara 9 `@Input()` heredados), y calcular `renderAs` una sola vez en `ngOnInit()` dentro de `TextComponent` impedía reaccionar a cambios dinámicos de `variant()` bajo `ChangeDetectionStrategy.OnPush`; toda derivación de entradas Signal debe expresarse con `computed()` y enlaces nativos (`[class]`, `[ngTemplateOutlet]`), y `check-angular-signals.cjs` debe barrer `src/` completo al igual que `check-angular-control-flow.cjs`.

- **Colapso de altura de tabla durante recargas (`DataTable`), saltos de scroll por foco nativo (`CrudDialog`, `ActionGroup`) y pérdida de posición de scroll entre rutas (`LayoutShellComponent`)**: reemplazar todas las filas `<tr>` del `<tbody>` por una única fila spinner cuando `effectiveStatus() === 'loading'` reduce súbitamente la altura del contenedor `.so-scroll-area` por debajo del `scrollTop` actual, forzando al navegador a recortar `scrollTop = 0` y produciendo un salto visual al inicio de la página tras cada operación de guardado, cambio de estado o eliminación. Cuando `displayedRows().length > 0`, `DataTable` debe conservar las filas renderizadas durante la recarga en segundo plano (anunciando el estado mediante `.sr-only[role="status"]`). Del mismo modo, invocar `.focus()` sin `{ preventScroll: true }` al cerrar menús contextuales/portales (`ActionGroupComponent`, `ActionMenuComponent`, `ModalContainerComponent`, `PopupContainerComponent`, `DatepickerComponent`) o ejecutar `HTMLDialogElement.showModal()` / `close()` en `CrudDialog` sin preservar los `.so-scroll-area` externos desplaza el contenedor principal; y dado que el scroll del chasis vive en `.so-scroll-area` dentro de `<app-layout-shell>` (y no en `window`), `LayoutShellComponent` debe persistir por ruta `{ top, left }` (en memoria y `sessionStorage`) y restaurarlo en `NavigationEnd` y `ngAfterViewInit` observando el crecimiento asíncrono del contenido (`ResizeObserver` / `MutationObserver`) hasta alcanzar el desplazamiento guardado o detectar interacción manual del usuario.
- **Orden de registro inicial `[open]="true"`, ordenación por DOM (`compareDocumentPosition`) e invariante `[collapsible]="false"` en `AccordionComponent` (`variant="single"`)**: dado que `ngOnInit()` se ejecuta antes que los `effect()` de componente en Angular y que las vistas embebidas condicionales (`@if`, `@for`) se instancian después de los nodos estáticos hermanos, `AccordionItemComponent.ngOnInit()` debe sincronizar `isOpen` desde `entradaAbierto()` antes de invocar `this.accordion?.register(this)`, y `AccordionComponent` debe ordenar `this.items` mediante `compareDocumentPosition` (`ordenarItemsPorDom()`) en `register`, `sincronizarModoUnico`, `moveFocus` y `asegurarAlMenosUnoAbierto()` para conservar abierto el primer panel en orden visual/DOM cuando varios declaran `[open]="true"` y para recorrer los encabezados en orden real con `ArrowUp`/`ArrowDown`/`Home`/`End`. Asimismo, cuando `[collapsible]="false"` en modo `single`, `unregister(item)` y `sincronizarModoUnico` deben invocar `asegurarAlMenosUnoAbierto()` para abrir automáticamente el primer panel habilitado si el panel activo se destruye o si todos inician cerrados.

## ATOMIC-20261103-002 — medición del disparador real en directivas sobre custom elements y orden de cascada en modificadores de tamaño

- **Medición de `getBoundingClientRect()` sobre hosts de componentes Angular (`appTooltip`) y prohibición de tooltips CSS paralelos:** aplicar `[appTooltip]` sobre un componente personalizado cuyo `:host` tiene `display: block` (como `<app-button>`) dentro de un contenedor de bloque hace que el elemento host ocupe el `100%` del ancho de la fila mientras el `<button class="btn">` interno mide solo el ancho de su contenido (`inline-flex`). Si la directiva mide únicamente `host.getBoundingClientRect()` (o si una vista improvisa un pseudo-elemento `.tooltip-trigger:hover::after` con `left: 50%`), el tooltip aparece desplazado a la mitad de la pantalla en lugar de centrarse sobre el botón. Además, combinar `--text-color` como fondo y `--text-color-on-primary` (`#ffffff`) como texto produce blanco sobre blanco (`1.04:1`) en tema oscuro. Todo tooltip debe usar exclusivamente `TooltipDirective` con tokens `--tooltip-bg`, `--tooltip-text` y `--tooltip-border` auditados en `scripts/check-theme-contrast.mjs`, acotar `.tooltip-host:not(.atomic-button--full-width) { width: fit-content; }` y resolver el rectángulo del hijo interactivo cuando el host lo envuelva con ancho mayor.
- **Especificidad y orden de cascada en modificadores de tamaño y altura de variantes (`.loader-sm`, `.dots`):** declarar `.loader-sm { --loader-size: var(--space-5); }` antes de `.loader-container { --loader-size: 2.5rem; }` con la misma especificidad `(0,1,0)` en el mismo elemento `<div class="loader-container loader-sm">` hace que la regla base posterior sobrescriba al modificador `sm`, igualándolo silenciosamente con `md` (`40px`). Asimismo, si una variante horizontal como `.dots` define solo el diámetro de cada punto (`calc(var(--loader-size) * 0.2)`) sin declarar `height: var(--loader-size)` en su contenedor flex, la tarjeta encoge verticalmente y desalinea su etiqueta inferior frente a `spinner`, `pulse`, `bars`, `gradient` y `orbit`. Los modificadores de tamaño deben declararse después de la regla base con especificidad compuesta (`.loader-container.loader-sm`, `.loader-container.loader-md`, `.loader-container.loader-lg`) y todas las variantes deben reservar `height: var(--loader-size)`.

## ATOMIC-20261103-001 — contratos de catálogo y tokens definidos en organismos multi-variante (`app-about-dialog`)

- **Evidencia:** al introducir un organismo nuevo (`app-about-dialog`) que proyecta el mismo cuerpo semántico dentro de tres variantes de contenedor (`modal`, `popup` y `card`), el validador de catálogo (`tools/check-atomic-catalog.js`) exige que cada entrada de `inputs` y `outputs` en `catalog/components/about-dialog.json` declare `meaning` (y `default` tipado en inputs) bajo `layer: "organism"`, mientras que `scripts/audit-tokens.ps1` rechaza cualquier token CSS intermedio (`--space-1-5`, `--duration-fast`, `--z-modal`) que no esté declarado en `src/styles/themes/_tokens-*.css`.
- **Decisión:** reutilizar un único `<ng-template #aboutBody>` con `<app-scroll-overlay class="so-block">` para las tres variantes (`modal`, `popup` y `card`), consumir exclusivamente los tokens primitivos y de componente definidos en `src/styles/themes/` (`--space-1` a `--space-5`, `--radius-*`, `--font-size-*`, `--font-weight-*`, `--surface-*`) y alinear `catalog/components/about-dialog.json` con `catalog/schemas/component.schema.json`.
- **Prevención:** ejecutar siempre `npm run catalog:generate`, `scripts/audit-tokens.ps1`, `scripts/check-css-units.mjs`, `scripts/check-typography-scale.mjs` y `node tools/check-package-distribution.js manifest` antes de propagar un organismo nuevo a proyectos consumidores con pin gobernado (`check:atomic:pin`).

## ATOMIC-20261102-006 — orden de render y evidencia de foco

La apertura modal puede enfocar un input antes de que su CVA haya renderizado `writeValue`. Si el control reconcilia valores restaurados al recibir foco, ese DOM antiguo puede volver al modelo: una reproducción real con 0 inicial y 500 asignado en el mismo turno detecta la carrera. `afterRenderEffect` corrige el orden de apertura declarativa conservando el comportamiento legítimo del CVA; desactivar esa reconciliación habría alterado otra responsabilidad.

Encontrar un destino de retorno no acredita haberlo enfocado. La restauración comprueba conexión, documento, visibilidad, restricciones heredadas y `activeElement`; conserva el origen cuando el callback falla. El host del catálogo permanece estable cuando una fila desaparece y evita que el consumidor inspeccione botones privados. Una restauración pendiente requiere cancelación y generación para no actuar sobre una apertura posterior.

La destrucción de una fixture Angular por sí sola no representa la retirada del DOM que produce `@if`; las regresiones de destrucción retiran también el host antes de esperar la microtarea. Las pruebas usan foco real y una segunda ventana para acreditar que no se roba su foco. Las mutaciones de carrera, callback omitido y generación se ejecutan exclusivamente en TEMP, conservando fuentes y resultados originales.


Acreditación complementaria del 2026-11-03: el orquestador repitió las familias de carrera, callback y generación en `negativas-atomic-responsable`, con códigos limpio/detección/restaurado `0/1/0`. El constructor verificó los originales y la igualdad de las siete categorías —archivos, dependencias, configuración, herramientas, comando, alcance y entorno— antes y después de cada fase y entre limpio y restaurado. Esta evidencia nueva sustituye únicamente la acreditación insuficiente anterior; siete archivos con SHA no constituían siete categorías. El inventario `atomic-guardas-fuentes-responsable.json`, generado por AST desde las cuatro fuentes runtime, descubre 259 sitios, 70 relevantes y siete métodos; su contenido y las huellas de entrada fueron contrastados por el constructor.

En la caracterización previa al caso final, el constructor ejecutó cuatro mutaciones adicionales, exclusivamente en TEMP y sin nuevas pruebas de producto. `validacion_crud`, `otra_ventana_crud` y `otra_ventana_modal` obtuvieron `0/1/0`. `validacion_modal` obtuvo `0/0/0`: retirar solo `[aria-disabled="true"], ` del selector de `ModalComponent.restaurarFoco` no fue detectado por las 33 pruebas existentes. La fuente temporal se restauró exactamente y sus siete categorías volvieron a coincidir con la fase limpia. En esa medición se conservó el residual de cobertura; ese resultado histórico no acreditó todas las obligaciones de las guardas ni constituyó aprobación del frente. Los originales y resultados residen en `negativas-atomic-adicionales`, `negativas-atomic-adicionales-resumen.json` y `acreditacion-constructor-evidencia-raiz.json`, bajo el temporal custodiado por el roadmap.

La sesión histórica de `governance:check` identificada como `23488` no conserva proceso recuperable ni archivo de salida final; su log alcanza `governance:smoke`, pero no acredita éxito ni permite reconstruir el código de salida. El responsable ejecutó la corrida definitiva de gobierno en la sesión 60660 y recuperó su código nativo 0. Los originales se conservan en `governance-cobertura-final.stdout.txt`, `governance-cobertura-final.stderr.txt` y `governance-cobertura-final.exit.txt`. La acreditación corresponde a esa corrida. La sesión histórica 23488 y el intento interrumpido quedan como antecedentes. La revisión de codificación verifica UTF-8 estricto y preservación literal de todas las líneas previas no ASCII de las cinco rutas afectadas, con evidencia en `acreditacion-encoding007-constructor.json`; no existen snapshots de las fuentes defectuosas y la desviación 007 continúa condicionada al juicio independiente del delta completo. La corrida histórica de 800 pruebas correctas no sustituye esa comprobación de preservación.



Cierre de cobertura del 2026-11-03: se añade un único caso persistente en `modal.component.spec.ts` que utiliza la API pública y el foco real. El origen permanece conectado y enfocado antes de abrir; el callback entrega otro botón visible, conectado, habilitado nativamente y con `aria-disabled="true"`. Tras destruir la fixture, retirar su DOM y vaciar la microtarea mediante el mecanismo existente, se verifica que `document.activeElement` vuelve al origen y no al candidato. No se modifican el código de producción, las historias, el catálogo ni los estilos.

La corrida nueva obtiene 34/34 casos de Modal, 108/108 de los cuatro componentes y de Input, y 801/801 en la suite completa; lint, build y lib:build terminan con código cero. El resultado 800/800 y el mutante 33/33 pertenecen a la caracterización histórica anterior. Se repiten las siete familias completas —carrera, callback, generación, validación del destino en Crud y Modal, y otra ventana en Crud y Modal— sobre TEMP sincronizado con el caso final: todas obtienen `0/1/0`, con fuentes, comandos, resultados y siete categorías antes y después de cada fase, además de igualdad entre limpio y restaurado. En `validacion_modal` el fallo se atribuye al nuevo caso de `aria-disabled`, sin modificar otra cláusula ni aceptar un fallo de compilación o timeout como detección. Los originales nuevos se conservan en `negativas-atomic-cobertura-final` y `negativas-atomic-cobertura-final-resumen.json`; los anteriores no se reasignan ni sobrescriben.

El manifiesto se regenera únicamente mediante `npm.cmd run package:manifest`: conserva 337 archivos y `sourceTreeSha256=386c85a20877b07389978c225d2eb3d492656d219d4481375c788007dbe9f5c6`. El inventario propagable no incluye el spec de Modal; no se interpreta esa huella como cobertura de pruebas. El build y la evidencia visual anteriores de Storybook se reutilizan tras contrastar 539 entradas de producción, historias, estilos, configuración y declaraciones de dependencias sin cambios, según `storybook-reuso-cobertura-final.json`; no existe una interfaz nueva que requiera otro escenario visual. La desviación 007 conserva su revisión independiente. La procedencia del consumidor, su `atomicRef` y la adopción siguen pendientes del Guardián y de CI.


## ATOMIC-20261102-005 — holgura vertical, grosor tipográfico y contraste de etiquetas flotantes, supresión de doble foco interno y búsqueda en cascada

- **Grosor tipográfico, contraste en reposo, sangría, paridad cromática y especificidad de deshabilitado en variantes `underline`/`material`:** reducir simultáneamente el tamaño (`14px` → `12px`) y el peso (`700` → `600`) en `.fl-label--floated` adelgaza visiblemente las astas de Open Sans frente a la etiqueta `standard`, mientras que pintar la etiqueta flotante en reposo con `--input-placeholder` (`#9CA3AF`, `2.54:1` sobre `#FFFFFF`) la deja lavada e incumple el mínimo de `4.5:1`. Asimismo, pintar `.variant-material.focused .floating-label` con `var(--primary-color)` (morado) mientras la línea inferior usa `var(--info-color)` (azul) y `.variant-underline` usa `var(--field-label-color-floated)` rompe la coherencia visual entre controles adyacentes (`Email` vs `Contraseña`), y repetir `color: var(--field-label-color-floated)` en `.variant-underline.has-value .floating-label` (`(0,3,0)`) pisa a `.disabled .floating-label` (`(0,2,0)`). Todas las variantes flotantes deben heredar `color`/`font-size`/`font-weight` desde `.focused .floating-label, .has-value .floating-label` y declarar `.disabled .floating-label, .disabled.focused .floating-label, .disabled.has-value .floating-label { color: var(--input-disabled-text); }`, manteniendo `top: var(--space-1)` (`4px` dentro de la caja) en variantes sin borde superior (`underline`/`material`).
- **Fuga de `box-shadow` desde `:focus-visible` global y botón vacío enfocable en `clearable` (`tag-input`, `number-input`, `datepicker`, `floating-input`, `floating-textarea`):** `src/styles/themes/index.css` declara una regla global `:focus-visible { outline: none; box-shadow: var(--focus-ring); }`. En controles compuestos donde el anillo de foco pertenece a la caja exterior, todo `<input>` o disparador interno sin anillo propio debe declarar explícitamente `box-shadow: none;` en `:focus, :focus-visible`. Asimismo, cuando `clearable="true"` se usa sin `iconClass()`, el `<button tabindex="0">` de limpieza solo debe montarse cuando `hasValue()` es verdadero (y en `type="search"` debe suprimirse `.floating-input::-webkit-search-cancel-button`) para evitar paradas de tabulación fantasma o doble icono `X`.
- **Intrusión vertical de `.fl-label--floated` y centrado vertical en foco vacío (`tag-input`, `number-input`, `select2`, `textarea`):** la etiqueta flotante compartida (`top: 0; transform: translateY(-50%)`, `font-size: 0.8125rem`, `line-height: 1.25`) penetra `8.125px` dentro del borde superior de `.fl-control`. En `tag-input`, aplicar `padding-top: var(--space-4)` (`16px`) solo cuando existen chips (`.fl-field--floating.tag-input--elevated.tag-input--has-tags .tag-input__field`) junto con `padding: 0; line-height: var(--field-label-line-height)` en `.tag-input__input` mantiene el marcador `Agregar etiqueta...` perfectamente centrado en vertical (`13px` arriba y abajo, `3.875px` bajo `.fl-label--floated`) cuando se enfoca vacío y deja `8.875px` de holgura sobre los chips cuando está poblado. En `number-input`, botones `.number-input__btn` de `var(--control-height-xs)` (`24px`) centrados en `46px` (`11px` por arriba y por abajo) dejan `2.875px` de holgura bajo la etiqueta elevada sin divisores verticales de altura completa.
- **Dimensionamiento `:host` con `[width]` en barras flex y opciones centinela en filtros en cascada (`select2`, `floating-input`, `floating-textarea`, `pagina-crud`):** cuando `:host` declara `width: 100%` fijo y el wrapper interno recibe `--select2-width: 180px` junto con `min-width: 15rem` (`240px`), un contenedor padre `display: flex; flex-wrap: wrap` fuerza cada selector a ocupar su propia fila (`100%`), apilando verticalmente los controles de una barra de búsqueda en cascada. Dado que `check:external-styles` prohíbe `[style]` en `@Component.host`, la solución limpia consiste en marcar `[class.has-custom-width]="tieneAnchoFijo()"` en el wrapper cuando `width()` no es vacío ni contiene `%` (`!ancho.includes('%')`, excluyendo tanto `50%` como `calc(100% - 2rem)`), aplicar `:host:has(> .*-wrapper.has-custom-width) { width: fit-content; max-width: 100%; }` en la hoja externa y dar prioridad a `var(--select2-width, var(--select2-min-width, 15rem))`. En `PaginaCrud` y los ejemplos de búsqueda en cascada (`ShowcaseFormsComponent`, `ShowcaseTemplatesComponent`), el selector primario `Buscar por` debe iniciar en `null` con la opción centinela `{ label: 'Seleccionar...', value: null }` y el marcador por defecto `'Seleccionar...'`, mostrando inicialmente un único selector, desplegando el segundo control únicamente cuando el usuario elige un criterio e instanciando dicho subfiltro con `@for (...; track tipo)` para evitar carreras de microtarea de `NgModel`.

## ATOMIC-20261102-004 — contratos transitivos, código embebido y límites de una guarda

- **La forma CommonJS y los metadatos son contrato:** glob 7 y Karma
  consumen una función y los segmentos `set`, `globSet` y `globParts`.
  Sustituir directamente el paquete por una versión mayor puede romper esos
  consumos aunque la auditoría no registre alertas. La fachada tiene
  identidad privada propia y utiliza el motor oficial 11.0.4; el corpus
  acredita los casos ejecutados, sin prometer equivalencia universal.
- **Auditoría y resolución efectiva son comprobaciones distintas:** una
  probeta obtuvo audit cero con el motor ausente. Se conservan por separado
  la inspección física descubierta, la resolución objetivo, los consumidores
  reales y las auditorías completa y `--omit=dev`. La instalación con npm
  11.12.1 se vincula a su versión y CLI comprobados. El reemplazo de deepmerge
  permanece acotado al consumidor 9.1.0 de fork-ts-checker; no se extrapola
  su semántica a todos los consumidores. El código 1 del listado completo
  por el binding opcional oxc WASI se conserva junto con su referencia.
- **Los overrides no reescriben código embebido:** el backport del bundle de
  Storybook 10.6.5 requiere procedencia oficial, versión y hashes reconocidos,
  idempotencia y rechazo de deriva. `postinstall` permite la ausencia de
  Storybook sin dependencias de desarrollo; `--check` devuelve 1 si falta el
  bundle. Cada actualización exige revisar el parche. Los mapas de depuración
  no acreditan el código ejecutado ni convierten todo el motor embebido en v11.
- **Descubrir superficies no demuestra analizar todos sus usos:** la segunda
  corrección de la primera candidatura descubre 25 superficies por reflexión,
  pero acepta una llamada a `make()` sobre una instancia que devuelve una
  fábrica. El contraste funciona con v3 y falla con la fachada; no demuestra
  ese uso en el Karma instalado. El rechazo de la última vuelta devuelve el
  criterio a arquitectura; no autoriza otra edición bajo la orden agotada.

Se conservan los dos originales de Karma de la primera candidatura: 764 casos
correctos y un fallo entre 765, y una única repetición completa de 765/765
con cobertura sin cambios de fuentes, sin causa atribuida. Los resultados
anteriores de lint, construcciones y navegador pertenecen a sus cortes
identificados. Los cambios posteriores de ejecución, historias y catálogos
de 006 invalidan su reutilización como acreditación del árbol posterior.
La detección de la nueva ventana documental detiene la escritura y exige
fuentes vivas y nueva adenda, conservando 006, 005 y la historia completa.

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

La evidencia de la nueva candidatura, las revalidaciones, el juicio y los
límites de las compuertas se consultan en el
[roadmap](.agent/roadmaps/ROADMAP_ATOMIC-20261102-004_seguridad_dependencias.md).

## ATOMIC-20261102-003 — tipos de UI y prueba del comportamiento real

- **Vocabularios de UI:** `any` ocultaba tonos de chip incompatibles con Chip.
  El adaptador tipado traduce los vocabularios y conserva las variantes
  previstas; sustituir una aserción no demuestra por sí mismo esa equivalencia.
- **API estática:** el valor genérico predeterminado forma parte del contrato.
  `PaginaCrud<Entidad>` admite interfaces sin firma de índice, mientras una
  referencia desnuda usa `Record<string, unknown>` y exige estrechamiento para
  operar sobre una propiedad de entidad. La fixture Angular estricta pasa con
  entidad explícita e inferida; su negativo rechaza asignar `unknown` a `string`
  con TS2322. Esta evidencia local no compila ni certifica todos los consumidores.
- **Accesibilidad:** un listener sobre un contenedor no se corrige añadiendo
  foco ficticio. La intención debe residir en la superficie interactiva real.
  El diálogo nativo requiere comprobar teclado verdadero, foco inicial,
  cancelación, modalidad y retorno al disparador; un evento sintético no
  sustituye esa comprobación en navegador.
- **Renderer de historias:** Storybook 10.6.5 conserva IDs públicos que pueden
  comenzar por un número. El renderer Angular se adapta mediante una copia
  interna tipada del contexto para construir un selector válido, sin cambiar
  esos IDs ni sus enlaces. El navegador definitivo acredita el diálogo con ID
  numérico, nueve tablas de propiedades y un cambio de control con una sola
  instancia, conservando las cuatro URLs originales. La compilación y la
  ejecución en navegador acreditan aspectos distintos de esa adaptación.
- **Prueba negativa:** las mutaciones aisladas de prioridad de ordenación y
  estabilidad de empates fallan al introducir el defecto y pasan al restaurar.
  La primera mutación de emisión antes de consumir la intención detectó una
  insuficiencia de prueba: `button.click()` nativo evitaba la recursión. Su
  refuerzo utiliza la salida Atomic pública: la base pasa 8/8, la mutación
  falla al producir dos emisiones y la restauración vuelve a pasar 8/8. La
  regresión debe activar el comportamiento reentrante real para acreditar la
  guarda, sin asumir que una llamada nativa recursiva lo reproduce.
- **Resultado y límites:** el lint final pasa con cero errores y cero avisos;
  la suite completa pasa 762/762 casos tras el refuerzo de la prueba de
  reentrada, con 54 regresiones adicionales frente a la unidad 002. Las
  construcciones de aplicación, biblioteca y Storybook terminan con código
  cero, al igual que el gobierno Atomic completo. El navegador definitivo
  comprueba contenido visible sin errores, tres variantes de tonos en dos
  historias, confirmación y foco; las capturas de 375 y 1280 CSS px acreditan
  los radios interiores corregidos. Los originales, las desviaciones, la
  revisión independiente y los límites de las compuertas del ecosistema se
  conservan en el
  [roadmap](.agent/roadmaps/ROADMAP_ATOMIC-20261102-003_avisos_lint.md).
  No se acredita publicación ni adopción de un `atomicRef` nuevo.

## ATOMIC-20261102-002 — HTTP 200 no acredita el bootstrap del navegador

- **Evidencia:** la compilación y la respuesta HTTP de la unidad anterior eran
  correctas, pero `require('@angular/compiler')` fallaba al ejecutarse en el
  navegador y dejaba el contenido vacío. Una pestaña limpia reprodujo esa
  excepción propia de la aplicación.
- **Corrección:** se conserva el import ESM y se comprueba el arranque mediante
  contenido visible, consola de la nueva navegación y captura del resultado.
  La verificación por HTTP se conserva como una comprobación distinta.
- **Contrato de pruebas:** el interceptor vigente envía credenciales mediante
  cookies para el origen permitido; no incorpora un Bearer. Las expectativas
  antiguas y los comentarios se corrigen conservando el filtro por origen, las
  solicitudes excluidas intactas y el tratamiento de errores. `withCredentials`
  no demuestra el atributo HttpOnly que configura el servidor.
- **Accesibilidad:** un combobox personalizado sobre un div recibe nombre
  mediante `aria-labelledby`; un label sin control HTML etiquetable no crea esa
  asociación nativa. Las pruebas de variantes consultan la clase de etiqueta y
  exigen el nodo, mientras las pruebas específicas verifican la relación ARIA.
- **Resultado observado:** lint con cero errores y 22 avisos; suite completa
  708/708. Los escenarios nuevos comprueban exclusiones y errores, en lugar de
  retirar aserciones para hacer pasar la suite. La trazabilidad queda en el
  [roadmap](.agent/roadmaps/ROADMAP_ATOMIC-20261102-002_arranque_lint_pruebas.md).

## ATOMIC-20261102-001 — overrides antiguos y auditoría compatible

- **Evidencia:** el CLI local faltaba antes de instalar `node_modules`; después
  de `npm install`, `ng serve` compilaba. La auditoría inicial de esta unidad
  detectó 62 vulnerabilidades y el override global `vite: 7.3.6` impedía adoptar
  la dependencia oficial corregida de Angular. El aviso de prebundling se
  originaba en `development.optimization: true`.
- **Corrección:** se actualizan familias compatibles y se revisan las
  fijaciones transitivas contra los manifiestos oficiales. El lock conserva
  el retiro previo de `@fontsource/open-sans` y la declaración de `@eslint/js`.
- **Prevención:** una actualización de herramientas exige revisar sus
  overrides y validar aplicación, biblioteca, lint, pruebas y Storybook.
  `npm audit fix --force` no constituye una solución aceptable cuando propone
  retroceder a versiones incompatibles. La ausencia de un parche compatible
  debe declararse por aviso y paquete, sin afirmar una auditoría limpia.
- **Evidencia de cierre:** se conserva en el
  [roadmap](.agent/roadmaps/ROADMAP_ATOMIC-20261102-001_dependencias.md).

## ATOMIC-20260823-600 (corte 3) — unidades relativas, nombres reales de tokens y clases de estado frente a cursores dinámicos

- **Evidencia:** las hojas de `src/app/shared/ui/` y `_utilities.css` combinaban medidas rígidas `px` con tokens inexistentes (`--avatar-size-*`, `--dropdown-text`, `--header-height`, `--input-background`, `--brand-color*`, `--surface-highlight`, `--surface-card`) cuyos respaldos en duro (`#hex`, `rgba()`, `px`) ocultaban la ausencia del token en `tokens:check`. Además, `FloatingInputComponent` y `FloatingTextareaComponent` utilizaban `[appVariablesCss]` solo para alternar `cursor: pointer|default` mediante `--floating-*-icon-cursor`.
- **Decisión:** definir los tokens faltantes reales (`--checkbox-size`, `--checkbox-icon-size` en `_tokens-primitives.css` y `--topbar-height` en `_tokens-components.css`), enlazar los nombres canónicos verificados por `audit-tokens.ps1` y `check-typography-scale.mjs` (`--font-weight-body`, `--font-weight-emphasis`, `--font-weight-title`, `--text-color-inverse`, `--primary-color-hover`, `--surface-hover`, `--card-bg`), sustituir las variables de cursor por las clases `.floating-input__icon--clickable` y `.floating-textarea__icon--clickable` y acotar con `:host` las reglas `::ng-deep` de `icon-button` y `row`.
- **Prevención:** instalar la compuerta `scripts/check-css-units.mjs` (`npm run check:units`) y su prueba negativa `tools/test-css-units-gate.mjs` (`npm run test:units-gate`) en `tooling:test` y `governance:check`, y regenerar `dart/atomic_tokens`, `catalog/` y `distribution/atomic-source-manifest.json` tras cualquier alta de token primitivo o de componente.

## ATOMIC-20261026-003 — fuentes locales en el tema portable y guarda de pesos en `@font-face`

- **Evidencia:** las aplicaciones consumidoras cargaban `@fontsource/open-sans` por separado en `src/styles.css` mientras que `_tokens-components.css` apuntaba `--table-font-family` a un token inexistente (`--font-sans, 'Inter', sans-serif`) y no existía una familia dedicada para títulos (`Quicksand`). Además, registrar `@font-face` con `font-weight: 400|500|600|700` dentro de `src/styles/themes/` activaba el detector de pesos escritos a mano si no se distinguía una declaración `@font-face` de una regla de estilo de componente.
- **Decisión:** alojar los binarios `.woff2` en `src/styles/themes/fonts/` y declararlos en `src/styles/themes/_fonts.css` importado por `src/styles/themes/index.css`, de modo que cualquier consumidor o empaquetado de `dist/atomic-ui/tokens` reciba la tipografía completa sin depender de CDN ni de importaciones sueltas en `src/styles.css`.
- **Prevención:** excluir `_fonts.css` y filtrar bloques `@font-face` en `scripts/check-typography-scale.mjs`, copiar `fonts/*.woff2` en `tools/copy-lib-tokens.cjs` y propagar `AtomicFamilias.fontFamilyHeading` a los estilos de encabezado del puente Dart (`scripts/emit-dart-tokens.mjs`).

## ATOMIC-20261026-002 — prosa acentuada y contratos ASCII

- **Evidencia:** el baseline contiene 150 hallazgos de tilde y 151 palabras;
  dos apariciones de un adverbio en una misma línea se agrupan en un hallazgo.
- **Corrección:** cada palabra se clasifica por su contexto antes de acentuar
  la prosa, incluidas dos citas explicativas. Los contratos y literales de
  código mantienen sus bytes originales.
- **Prevención:** los encabezados corregidos conservan sus anclas públicas.
  Dos encabezados repetidos mantienen el nivel mediante HTML documental para
  evitar que cambie la numeración de las 43 anclas Markdown posteriores.
- **Límite:** la unidad es editorial; las 70 pruebas de accesibilidad y sus
  resultados históricos permanecen como evidencia del corte anterior.

## ATOMIC-20261026-001 — presencia del nodo y compilación de pruebas

- **Evidencia:** seis comparaciones entre atributos DOM y un identificador
  opcional impedían compilar cuatro especificaciones. El baseline aislado
  confirmó TS2345 y el ensayo final pasó 70/70 casos en seis suites.
- **Corrección:** se exige presencia y se estrecha el nodo antes de leer `id`.
  Convertir dos ausencias a `null` habría permitido acreditar un DOM inexistente.
- **Reutilización:** se emplean dependencias completas ya instaladas y un
  lockfile idéntico, sin modificar el enlace compartido ni instalar paquetes.
- **Límite:** HEAD más cuatro pruebas no certifica otros cambios concurrentes.
  El silencio de un proceso tampoco demuestra un bucle: los originales de
  gobernanza anteriores terminaron con fallo posterior de inventario.
## CLT-20261024-003 — reconciliación de valores DOM sin evento input en ControlValueAccessor

- **Evidencia:** la restauración automática del navegador o el autocompletado podían poblar el `<input>` nativo sin emitir el evento `input`, dejando el `FormControl` reactivo vacío o desactualizado al evaluar `puedeGuardar()` en el consumidor.
- **Decisión:** `InputComponent` reconcilia el valor nativo en `change`, `focus` y `blur` únicamente cuando difiere del valor actual de la señal interna, sin duplicar emisiones de `onChange` ni `valueChange`.
- **Prevención:** cubrir en pruebas unitarias la mutación directa del valor nativo seguida de `change` o `blur` sin `input`, y regenerar `distribution/atomic-source-manifest.json` antes de certificar procedencia en consumidores.

## ACC-20261022-001 — tres controles físicos no equivalen a tres mutaciones directas

- **Evidencia:** una misma grilla podía mostrar tres iconos en Productos y cuatro
  en Clientes porque la acción contextual ocupaba una posición directa por
  costumbre. La papelera, Activar o una política de crédito competían con Ver y
  Editar sin una prueba de frecuencia, y la apariencia sugería que todas eran
  igual de prioritarias.
- **Decisión:** `PaginaCrud` presenta Ver, Editar y Más acciones como base. El
  menú cuenta como el tercer control físico; `ActionGroup.maxVisible` sigue siendo
  una capacidad genérica de directas y `isMenuOnly` conserva las mutaciones de
  estado dentro del menú. La promoción contextual se declara con id,
  justificación y evidencia, no se infiere por nombre, icono o simetría visual.
- **Prevención:** probar el orden con una acción `isMenuOnly` al inicio, menú no
  vacío, teclado/foco, bloqueo y emisión única. Rechazar como tercera directa
  `delete`, `deactivate`, `reverse`, `danger`, Ver, Editar y cualquier acción ya
  forzada al menú. La regla visual no acredita permiso, contrato ni seguridad del
  consumidor; esos controles conservan evidencia por operación.

## ATOMIC-20261020-002 — el apilamiento no elimina el recorte

- **Evidencia:** Select2 abría con posición absoluta y `z-index: 9999`, pero
  el desplazador del formulario seguía recortando sus opciones. Aumentar el
  índice de apilamiento no modifica el recorte de un ancestro.
- **Decisión:** la lista utiliza la capa superior nativa sin separarse del
  DOM del control; se conserva su pertenencia al diálogo y la herencia de
  tokens. El componente calcula el lado disponible y limita tamaño y posición.
- **Prevención:** la regresión debe comprobar un popover real en navegador,
  no solo el valor CSS del z-index. Escape debe cancelar su acción nativa antes
  de cerrar la lista para no cerrar también el formulario. El scroll de la
  opción activa debe mover únicamente la lista, no los ancestros.
- **Foco comprobable:** una clase de posicionamiento no acredita que las
  medidas ya estén aplicadas. El enfoque se solicita tras render y se confirma
  con `activeElement`; Tab conserva su recorrido nativo antes de retirar el
  buscador. Las pruebas no deben enfocar manualmente para ocultar un fallo.
- **Visibilidad:** ResizeObserver no detecta todos los cambios de visibilidad.
  Deben observarse los atributos pertinentes del disparador y sus ancestros,
  contemplando las transiciones existentes y liberando recursos al cerrar.
- **Custodia:** un enlace de dependencias hacia otro proyecto no es una
  instalación aislada. Los ensayos se realizan en una copia independiente; la
  propagación modifica solo la pieza aprobada y conserva snapshots ajenos.
- **Teclado y ratón:** Chromium puede enfocar un contenedor desplazable. El
  listbox conserva tabindex=-1 para no añadir una parada a Tab, pero también
  atiende Tab/Escape cuando el ratón enfoca su barra. La guarda
  target===currentTarget evita procesar dos veces los eventos de opciones.
- **Secuencia de validación:** los recorridos nativos de Tab, Escape y clic
  en scrollbar deben probarse antes de cerrar el candidato, junto con la
  selección al final de una lista larga. Descubrirlos después de cada revisión
  parcial multiplica compilaciones y traspasos de custodia. El ensayo visual
  inicial no reemplaza las pruebas, pero permite agrupar correcciones antes
  del juicio final. Una vía abreviada de gobierno requiere autorización
  separada; esta lección no modifica la doctrina global.

La base de plataforma se documenta en
[Popover de MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/popover).

## ATOMIC-20261020-001 — rescate upstream-first de Dropzone y cierre de paridad `[required]` en controles con etiqueta

- **Evidencia:** `pdf-tool` implementaba una zona de arrastre enriquecida con estilos ad-hoc y valores hexadecimales porque `FileInputComponent` solo ofrecía la vista estándar; además, `DatepickerComponent`, `ComboboxComponent`, `TagInputComponent`, `NumberInputComponent` y `FloatingInputComponent` carecían del input `[required]` que ya exponían `InputComponent`, `SelectComponent` y `Select2Component`.
- **Decisión:** incorporar `variant="dropzone"` en `FileInputComponent` usando exclusivamente tokens semánticos (`var(--...)`), unidades relativas (`rem`) y las guardas de arrastre de escritorio (`draggable="false"`, `preventDefault()` en `mousedown`/`dragstart`, filtro de `Files` en `dragover` y guarda de `relatedTarget` en `dragleave`), y homologar `required = input(false)` con `.field__required.fl-label__required` y `aria-required="true"` en los controles restantes.
- **Prevención:** cualquier selector CSS en un control con `NG_VALUE_ACCESSOR` cuyo nombre contenga la subcadena `label` es auditado por `check-field-label-tokens.mjs` como etiqueta de campo; las clases auxiliares de insignias o cabeceras no deben contener `label` en su nombre, y todos los pesos tipográficos deben expresarse mediante `var(--font-weight-*)` para cumplir `check-typography-scale.mjs`.

## ATOMIC-20261019-002 — paridad tipográfica de etiqueta superior y campo obligatorio en Select2

- **Evidencia:** en los formularios consumidores (como políticas de crédito en `ventas-cxc`), `app-input` mostraba etiqueta superior en negrita (700) y asterisco rojo cuando era obligatorio, mientras `app-select2` carecía del input `required` y el token `--field-label-font-weight` apuntaba a 600.
- **Decisión:** alinear `--field-label-font-weight` a `--font-weight-title` (700) manteniendo `--field-label-floated-font-weight` en 600, e incorporar `required = input(false)` en `Select2Component` con asterisco `.field__required` (`aria-hidden="true"`) y `aria-required` en el disparador `combobox`.
- **Prevención:** `select2-variant.spec.ts` verifica el asterisco y `aria-required` en las tres variantes (`standard`, `floating`, `floating-value`) y su ausencia cuando `required` es `false`.

## ATOMIC-20261019-001 — modos de etiqueta, reactividad CVA y geometría de etiqueta flotante

- **Evidencia:** coexistían dos implementaciones para `app-input` (`InputComponent` e `Input`), tres modos de etiqueta inconexos, superposición entre etiqueta flotante en reposo y `placeholder`, desplazamiento vertical de la etiqueta flotante cuando aparecían mensajes de ayuda o error debajo del control, y falta de reactividad en `TextareaComponent` cuando `writeValue` llegaba desde `ngModel` o `FormControl`.
- **Decisión:** consolidar `InputComponent` y `SelectComponent` como familia canónica (manteniendo `Input` y `Select` como alias de compatibilidad), compartir `FieldLabelVariant` (`standard` | `floating` | `floating-value`) y `field-label.css`, ocultar el marcador mientras la etiqueta flotante reposa, y anclar la etiqueta a `.fl-control`.
- **Prevención:** la compuerta `scripts/check-field-label-tokens.mjs` descubre por barrido todo control con `NG_VALUE_ACCESSOR` y rechaza tamaños o posiciones literales (`px`, `rem`, `em`), `uppercase` y pesos numéricos en reglas de etiqueta, verificada con prueba negativa en `tools/test-field-label-gate.mjs`.

## DOC-20261018-002 — la referencia de doctrina también requiere procedencia

- **Evidencia:** Las entradas AGENTS y continuidad seguían dirigiendo a la raíz antigua pese a existir una autoridad canónica diferente.
- **Decisión:** Se corrigen solo los punteros vigentes y la ubicación de roadmaps nuevos, conservando los destinos históricos existentes.
- **Prevención y límites:** La revisión documental de la asignación comprueba destinos y preservación. No certifica el código Atomic ni autoriza publicar, migrar consumidores o sustituir un contrato visual.

La continuidad documental se rige por ECO-20260823-003; cada corte registra
evidencia propia sin convertir pruebas parciales en certificación global.

## ATOMIC-20261001-002 — controles compuestos dentro de un formulario

- Probar Datepicker dentro de un form, no solo aislado: cualquier botón de
  navegación sin type puede enviarlo. El bloqueo CVA también debe impedir la
  selección programática y quitar el disparador del orden de tabulación.
- Al cambiar mes o año, fijar el día a 1 antes de la operación evita que Date
  normalice el 31 a un mes distinto. El componente sigue emitiendo Date/null;
  la serialización de fechas civiles pertenece al adaptador del consumidor.
- Textos largos deben funcionar tanto seleccionados como en la lista. En un
  dropdown con búsqueda, reservar la búsqueda y hacer flexible el scroll.
  No sustituir una adaptación local de posición por la fuente completa.

## ATOMIC-20261001-001 — promoción visual e integración separadas

- Conservar diseño incluye superficies y contraste en ambos temas, no copiar
  blancos/grises fijos de una captura clara. Usar tokens existentes verificados.
- El organismo recibe presentación, no calcula deuda ni decide moneda/canal.
  Proyección pública acotada al host; no estilizar internamente otros controles.
- La prueba del consumidor debe recorrer CVA y valor DOM de cada entrada.
  Probar solo un texto total deja sin observar los controles vacíos del editor.
- Un cambio de habilitación no debe disparar cambios de negocio al rehidratar
  formularios históricos. Esta responsabilidad se prueba en el consumidor.
- Una adopción candidata local no es publicación ni prueba de toda la fuente.
  Registrar compuertas que fallan o no concluyen; no actualizar hashes para verde.

Fuente y evidencia en el
[roadmap](.agents/roadmaps/ROADMAP_ATOMIC-20261001-001_transacciones.md).

## ATOMIC-20260930-008 — el patrón no certifica su conexión

- **Evidencia:** las revisiones de catálogos CXC encontraron controles visuales
  presentes sin una operación equivalente conectada. Las tres acciones y el
  detalle semántico ya estaban documentados; repetir la norma no migró las rutas.
- **Decisión:** reutilizar composición e intenciones sin heredar contratos o
  seguridad. El consumidor acredita su integración; Atomic, su API visual.
- **Prevención:** matriz local por operación y pruebas de controles conectados,
  cierre, foco y respuestas. Comprobar la versión instalada antes de proyectar
  contenido; no usar una demo como evidencia de la pieza consumida.
- **Alcance:** revisión exigida, no automatización del generador. Sin cambios
  de componentes ni publicación en esta unidad. La falta de integración no
  autoriza rediseño ni sobrescritura de adaptaciones o pruebas anteriores.

## ATOMIC-20260930-007 — separar contenido y chasis de consulta

Dos capturas pueden compartir modal y diferir por una migración parcial del
contenido. Reutilizar SummaryList detail evita un rediseño innecesario.
Registrar la regla de revisión y la prueba efectiva por consumidor; no anunciar
una prohibición automatizada global si solo se verificó una ruta.
No confundir lectura con el bloqueo legítimo del formulario durante un envío.

## ATOMIC-20260929-005 — la muestra debe usar el componente

Una muestra dibujada con HTML/CSS propio puede ser visualmente preferible y no
representar el ADN que se distribuye. Promover el patrón aprobado a la molécula
y consumirla en el ejemplo; no copiar el diseño a cada pantalla. Mantener
proyección, cierre, anuncios accesibles y eventos al cambiar la apariencia.

Ver y Activar no deben compartir el verde en catalog: se aprueba ojo neutro y
activación verde, sin modificar standard. El reintento reutiliza Button neutro.
Probar el tema junto con su superficie: cambiar solo data-theme en un contenedor
transparente mezcla texto oscuro/claro con el fondo del documento.

Compilar Storybook no prueba renderizado. La referencia nueva usa un id
alfabético porque el renderer instalado falla con ids iniciados por número;
no se renombraron contratos históricos. Atribuir al dueño sus confirmaciones
en una sesión compartida; no presentarlas como pruebas automáticas.

## ATOMIC-20260929-004 — adopción parcial comprobable

No copiar la plantilla completa para adoptar una guarda. Exponer bloqueo visual
explícito y probar cierre programático, Escape, X y Cancelar; liberar y renderizar
antes de cerrar tras éxito. Comparar campos corresponde al consumidor, no al
ADN. Una confirmación desde la fila no debe dejar un Guardar adicional.

La recarga es lectura independiente; su fallo no convierte un ACK confirmado en
fracaso ni autoriza repetir escrituras. Códigos, IDs y forma de ACK/DTO no se
trasladan al átomo. Una regla UX de revisión no es una guarda del generador.
Adopción local autorizada y publicación certificada son estados distintos.

## ATOMIC-20260929-003 — una intención por flujo

Un interruptor dentro de Editar que abre otra confirmación y vuelve a un
Guardar habilitado confunde dos operaciones. Para catálogos, reutilizar la
tercera acción de fila con semántica explícita activar/desactivar; conservar
su posición, tamaño y nombres accesibles. No añadir un cuarto botón ni inferir
el estado de un DTO dentro del átomo. La acción y la validez las declara el
consumidor mediante APIs tipadas de Atomic.

Dirty no acredita cambios: la comparación con los valores de entrada pertenece
a la fachada, incluido el caso de editar y restituir. Disabled visual requiere
una guarda de emisión y otra de dominio. La prueba negativa de esta asignación
detectó la retirada de la guarda, no solo un atributo HTML.

## ATOMIC-20260929-002 — alineación semántica y geometría comprobada

La captura de Familias mostró encabezados centrados y etiquetas al inicio.
Renderizar Chip no imponía la clase de alineación del td: solo se aplicaba si
el consumidor declaraba align. Resolver ambos desde la misma clasificación de
columna evita repetir CSS o defaults en cada feature.

El comportamiento por omisión para etiquetas es center; align explícito manda.
No inferirlo del encabezado traducido. En móvil el td es grid: text-align no
centra por sí solo su hijo. justify-self en el host de Chip centra el valor
y conserva la etiqueta ::before al inicio. Las pruebas miden ambos espacios,
en cuatro anchuras y dos temas; las clases DOM por sí solas no prueban geometría.
Los estilos y textos de negocio permanecen fuera del filtro visual.

## ATOMIC-20260928-001 — conservar el diseño al centralizarlo

La regresión de Familias mostró que ensamblar componentes Atomic no garantiza
conservar la plantilla: botones genéricos agrandaron las filas y Cerrar quedó
amarillo y de ancho completo. La corrección reusable pertenece al ADN, no a
CSS correctivo del consumidor. Inventariar antes/después, extender APIs de forma
aditiva y retirar diseño local solo tras validar su reemplazo. Mantener la
semántica de solo lectura sin recuperar inputs deshabilitados.

La revisión de catálogo detectó otra brecha: las plantillas ya estaban en el
árbol y barrel, pero el esquema solo admitía tres capas. El catálogo ahora
representa `surface` y `template` sin disfrazarlas de organismos y sus pruebas
rechazan una capa inventada. Eso no demuestra que el generador ya use la plantilla.

Un proyecto dentro de Git no es la raíz Git. Auditar ambos explícitamente no
autoriza instalar workflows en una raíz compartida; esa decisión queda abierta.

## Índice superior de aprendizajes

Este archivo es la fuente canónica de lecciones reutilizables de Atomic UI; las
entradas existentes se preservan en orden cronológico y no se copian a otra
autoridad. El contexto complementario se consulta en:

- [`DOCTRINA_DE_INTERFAZ.md`](./DOCTRINA_DE_INTERFAZ.md), que convierte daños
  observados y medidos en reglas de interfaz;
- [`ECOSYSTEM_WORKFLOW.md`](./ECOSYSTEM_WORKFLOW.md), que documenta el flujo de
  fuente, propagación y consumidor;
- [`.agents/roadmaps/`](./.agents/roadmaps/), que conserva decisiones y
  evidencia por corte;
- [`CHANGELOG.md`](./CHANGELOG.md), que registra compatibilidad, validación y
  rollback de cada versión;
- [`docs/CONTINUIDAD_AGENTES.md`](./docs/CONTINUIDAD_AGENTES.md), que define el
  orden de lectura y la reanudación segura.

Una lección nueva requiere evidencia, decisión generalizable, mecanismo
preventivo y límite de aplicación. Una incidencia exclusiva de un ticket se
mantiene en su roadmap hasta demostrar que merece una regla común.

## [2026-08-25] - Cambiar un token obliga a regenerar el manifiesto de procedencia

**Contexto.** `F3-ATOMIC-ADR-20260825` elevó `--touch-target-min` de `2.75rem` a
`3rem`. El cambio es de una línea y las cuatro compuertas de estilo —contraste,
tipografía, foco y valores CSS— salieron en verde de inmediato. `governance:check`
falló después, en `governance:smoke`, con un error que no menciona tokens:
«El manifiesto Atomic no coincide con el inventario canónico real».

**Qué pasaba.** `distribution/atomic-source-manifest.json` inventaría 222 fuentes
con su SHA-256 y una huella agregada del árbol. Editar cualquiera de esas 222
invalida el manifiesto, y el instalador de gobierno del consumidor se niega a
correr. El generador de proyectos lo invoca, así que el síntoma aparece a tres
saltos de la causa: el fallo se lee como si el generador estuviera roto.

**Lección.** El manifiesto no es documentación: es la compuerta de procedencia
que exige el apartado 6.1, y comprueba bytes. Cualquier cambio en la fuente
inventariada se completa con `node tools/check-package-distribution.js manifest`
y, solo entonces, con la verificación. Las compuertas de estilo no lo cubren
porque miran significado, no bytes.

**Cómo aplicarla.** El orden correcto es: cambiar la fuente, ejecutar las
compuertas de estilo, terminar TODAS las ediciones sobre archivos inventariados,
regenerar el manifiesto una sola vez al final, y recién entonces ejecutar
`governance:check`. Regenerarlo a mitad de camino obliga a repetirlo.

**Corolario sobre las huellas.** Una huella tomada sobre bytes crudos cambia con
los finales de línea, no solo con el diseño: un `git stash` o un clon con otra
configuración de `autocrlf` la mueve sin que nadie toque una declaración. El
repositorio ya lo tenía resuelto con `git-clean-eol-v1`, que normaliza CRLF a LF
antes de medir. El emisor de tokens de Dart nació calculando la huella sobre
bytes crudos y divergió por esa causa en su primera ejecución real; se corrigió
reutilizando la canonización de la casa en lugar de inventar una segunda.

## [2026-08-23] - La separación de estilos requiere semántica Angular y un canal dinámico limitado

**Contexto.** La biblioteca combinaba hojas externas con bloques `styles`,
bindings `[style.*]`, propiedades personalizadas enlazadas y estilos declarados
en el host. Algunos componentes aceptan anchos, colores o cuadrículas
arbitrarios como parte de su API pública.

**Problema.** Una búsqueda textual confunde comentarios y variables locales con
estilos Angular, pero tampoco detecta de forma completa plantillas literales,
aliases de `HostBinding` ni metadatos de host. Convertir valores públicos
arbitrarios en clases finitas habría cambiado el contrato; trasladar la
propiedad visual a CSS sin transportar el valor dinámico la habría perdido.

**Lección aprendida.** La compuerta recorre el AST de TypeScript y el AST de
plantillas Angular, por lo que rechaza solo construcciones visuales ejecutables.
Las clases representan estados finitos. Los valores dinámicos se transportan
exclusivamente como propiedades personalizadas mediante una directiva que
rechaza nombres ajenos al prefijo `--`; ancho, color, cuadrícula y posición se
resuelven después en la hoja externa. Así se conserva la API sin reintroducir
propiedades visuales en el marcado. Esta directiva no constituye una excepción
permanente a la doctrina: sus nombres quedan fijados por cada componente y solo
adapta entradas públicas que todavía admiten CSS arbitrario. Cada uso deberá
retirarse cuando el contrato pueda expresarse mediante tokens gobernados o un
conjunto cerrado de clases tipadas.

## [2026-08-23] - Un estado deshabilitado debe dominar la cascada y la acción nativa

**Contexto.** Button, Checkbox y Radio disponían de tokens semánticos con
contraste suficiente, pero las variantes y las etiquetas internas volvían a
aplicar colores activos después de la regla deshabilitada. Además, `loading`
conservaba correctamente el foco mediante `aria-disabled`, aunque un botón de
tipo `submit` todavía podía ejecutar la acción predeterminada del navegador.

**Problema.** Cambiar solo el color heredado no neutraliza fondos, bordes ni
descendientes con declaraciones propias. `aria-disabled` tampoco reemplaza el
comportamiento de `disabled`: anuncia indisponibilidad, pero no cancela por sí
solo un clic ni el envío de un formulario. Una compuerta que analiza todo un
archivo TypeScript como CSS mezcla lógica y animaciones con selectores y puede
producir falsos positivos.

**Lección aprendida.** La regla deshabilitada se sitúa después de todas las
variantes y estiliza explícitamente superficie, borde, texto, etiqueta y marca
con pares de tokens verificados. Cuando se conserva el foco con
`aria-disabled`, el manejador cancela también la acción predeterminada. Las
compuertas de CSS embebido extraen los literales de `styles` antes de inspeccionar
selectores y validan todos los temas que expone la API pública.

## [2026-08-23] - La regeneración debe ser monótona para los metadatos del consumidor

**Contexto.** El instalador canónico regenera la procedencia a partir de una
auditoría actual, pero el manifiesto también contiene tokens requeridos y
decisiones que pertenecen al consumidor.

**Problema.** Reiniciar `tokens.required` o reemplazar el `decisionRecord` de
una adaptación sin cambios produce una pérdida silenciosa de contrato e
historia, aunque la huella técnica siga siendo válida.

**Lección aprendida.** Una reinstalación conserva los metadatos del consumidor
cuando la ruta Atomic y el snapshot de adaptación coinciden byte a byte. Si la
fuente o la adaptación cambian, se exige una decisión nueva. La regeneración
automatizada puede ampliar o actualizar el contrato, pero no debe reducir
información válida que no administra.

## [2026-08-23] - La versión local no define por sí sola una fuente reproducible

**Contexto.** La rama local declaraba Atomic UI 5.8.4 y contenía tres mejoras
de gobierno, mientras `origin/main` había avanzado dieciocho commits hasta
5.22.0. El commit local no estaba contenido en una referencia remota.

**Problema.** Actualizar la procedencia de los consumidores al `HEAD` local
habría producido gates correctos en una sola estación, pero CI no habría podido
obtener ese OID. Adoptar directamente la rama remota también habría descartado
la consolidación de `.agents`, la guía 5.8 y los controles documentales locales.

**Lección aprendida.** Antes de propagar se actualizan las referencias remotas,
se calcula el ancestro común y se comprueba que el OID objetivo sea recuperable.
Cuando las líneas divergen, primero se reconcilia la fuente de verdad y se
validan sus manifiestos; solo el commit reconciliado puede convertirse en la
referencia de los consumidores. Una versión semántica coincidente no sustituye
la identidad Git ni la disponibilidad remota.

## [2026-08-21] - La documentación se organiza por autoridad y audiencia

**Contexto.** Desarrollo, integración, comandos, portabilidad y auditorías
visuales estaban distribuidos en archivos que repetían requisitos, gates y
límites de responsabilidad.

**Problema.** Una actualización debía replicarse en varias rutas y podía dejar
versiones contradictorias de Node.js, Angular, gobierno o procedencia.

**Lección aprendida.** La guía de diseño reúne el trabajo cotidiano; gobierno
reúne adopción y portabilidad; el catálogo conserva reglas de componentes; y el
roadmap conserva evidencia histórica. Un archivo separado solo se justifica por
una autoridad o audiencia distinta.

## [2026-08-21] - Una procedencia antigua es un bloqueo de migración, no una huella pendiente

**Contexto.** Acopiador BCP declara Atomic UI 5.5.8 y el árbol institucional
local disponible corresponde a 5.8.4. La compuerta también encontró que el
usuario aislado no podía validar la propiedad Git del repositorio Atomic.

**Problema.** Ejecutar la validación de la línea 5.5.8 contra el árbol 5.8.4
mezcla dos revisiones y produce un bloqueo correcto. Cambiar únicamente la
versión, la referencia o las huellas ocultaría divergencias reales entre
componentes exactos, adaptaciones aprobadas y artefactos de gobierno.

**Lección aprendida.** La línea actual se comprueba con un checkout fijado al
`atomicRef` declarado. Una migración a 5.8.4 solo se inicia con autorización y
se cierra cuando el consumidor se audita, declara sus adaptaciones, regenera la
procedencia mediante el flujo canónico y supera sus pruebas. La restricción
`safe.directory` se resuelve en un checkout controlado por su propietario o en
CI; no se usa como sustituto de ninguno de esos controles.

## [2026-08-20] - Un ejemplo de presentación no puede convertirse en contrato de dominio

**Contexto.** Las guías históricas mezclaban copia manual del sistema visual,
credenciales literales, DTO de autenticación y endpoints dentro de Atomic.

**Problema.** Un ejemplo ejecutable tiende a copiarse como arquitectura oficial,
aunque el manifiesto lo clasifique como demostración heredada.

**Lección aprendida.** Atomic solo publica contratos visuales, variantes y
generación determinista. Autenticación, permisos, DTO, endpoints y credenciales
permanecen en el consumidor. Las migraciones empiezan con auditoría de solo
lectura y se cierran mediante procedencia, pruebas y build; la copia manual no
es una ruta de adopción.

Este documento centraliza el conocimiento adquirido tras solucionar problemas complejos de arquitectura, diseño e integración en el ecosistema de Atomic-UI, sirviendo como guía maestra para que agentes y desarrolladores entiendan el "por qué" de ciertas decisiones técnicas críticas y puedan portar este comportamiento a otros ecosistemas (Wails, Tauri, Web, etc).

---

## [2026-08-13] - `display: grid` NO retira la semántica de tabla, y lo medimos tarde

**La creencia.** Cambiar el `display` de los elementos de tabla les retira su rol
implícito, así que la rejilla de columnas de `ScrollOverlay` —que pone
`display: grid` en las filas y `display: block` en el cuerpo— dejaría a un lector
de pantalla sin poder anunciar filas ni celdas. Es lo que dice la guía clásica de
ARIA in HTML, y sobre esa creencia se añadió en 5.7.0 un `restoreTableSemantics()`
que declaraba la jerarquía completa de roles.

**La medición.** Se preguntó al árbol de accesibilidad REAL de los dos motores
que importan: por CDP (`Accessibility.getFullAXTree`) en Chromium y por
`page.accessibility.snapshot()` en WebKit, con una tabla de doce filas y
cabeceras con `scope="col"`.

```text
WebKit    nativa    {"table":1,"row":13,"columnheader":9,"cell":72}
          con rejilla  ← IDÉNTICO
          con roles    ← IDÉNTICO

Chromium  nativa    {"table":1,"rowgroup":1,"row":13,"columnheader":3,"cell":36}
          con rejilla  ← IDÉNTICO
          con roles    ← rowgroup:2, un nodo que el navegador no expone solo
```

**El resultado.** Ninguno de los dos motores pierde la semántica. Y los roles
explícitos no eran «redundantes e inocuos»: en Chromium **añadían** un `rowgroup`
que el navegador deliberadamente no expone. Se revirtió en 5.7.4.

### Lo que hay que llevarse de aquí

1. **El árbol de accesibilidad se puede medir, y no hace falta un lector de
   pantalla para la mayor parte.** El árbol *es* lo que consume la tecnología
   asistiva. Si el de una tabla con rejilla es idéntico al de una nativa, no
   queda nada que un lector pueda anunciar distinto.
2. **`getByRole` de Playwright NO sirve para esto.** Calcula el rol él mismo en
   JavaScript siguiendo la especificación ARIA, así que es ciego a lo que el
   navegador hace de verdad y responde «idéntico» por construcción. Hay que
   pedir el árbol real. Estuvimos a punto de dar por buena una medición vacía.
3. **Cuidado con la tabla de juguete.** Con dos filas los tres casos daban
   `columnheader: 0`, por la heurística de «tabla de maquetación». La conclusión
   solo aparece con una tabla realista.
4. **Una guía de accesibilidad de hace años no es una medición de hoy.** Los
   motores corrigieron esto; el documento que lo advertía sigue circulando.

### Cómo repetirlo

Requiere Playwright y WebKit (`npx playwright install webkit`), que Atomic no
trae. Se ejecuta desde un consumidor que sí los tenga:

```js
import { webkit, chromium } from '@playwright/test';
const cuenta = (n, acc = {}) => {
  if (n.role) acc[n.role] = (acc[n.role] ?? 0) + 1;
  for (const h of n.children ?? []) cuenta(h, acc);
  return acc;
};
const b = await webkit.launch({ headless: true });
const page = await b.newPage();
await page.goto(urlDeLaPaginaDePrueba);
console.log(cuenta(await page.accessibility.snapshot({ interestingOnly: false })));
await b.close();
```

Compara tres variantes en la misma página —tabla nativa, tabla con la rejilla, y
tabla con los roles declarados— retirando las otras dos del documento antes de
cada medición para que los conteos no se sumen.

---

## [2026-08-07] - Stacking Contexts y Container Queries en Tarjetas

**Evidencia:** El componente `app-select2` (Combobox) presentaba problemas de superposición (overlapping) siendo ocultado por la `<app-card>` adyacente inferior. El uso de `z-index: 1000` en el dropdown del combobox resultaba inefectivo porque el padre (`app-card`) contenía la propiedad `container-type: inline-size;`.

**Decisión:** Se validó que `container-type` crea inherentemente un contexto de apilamiento (stacking context) estricto. La forma correcta de manejar menús flotantes que deben desbordar tarjetas en un sistema UI es elevar dinámicamente el `z-index` de toda la tarjeta que posee el foco interactivo. Se implementó `.card:focus-within { z-index: 50; position: relative; }` en `card.component.ts`. Esta solución arquitectónica CSS resuelve solapamientos en todo el grid sin necesidad de CDK Overlays globales.

## [2026-08-05] - Estandarización de Separación Vertical en Formularios (Modales)

**Evidencia:** Las integraciones de los modales de configuración de base de datos en Python, Wails y Tauri tenían inconsistencias visuales: algunos usaban inputs crudos y otros app-floating-input, además de márgenes arbitrarios sin orden estandarizado.

**Decisión:** Se instauró la clase .atomic-form-stack (gap: var(--space-5) / 24px) en _forms.css como la única directiva para agrupar entradas de configuración. Cualquier mejora visual o espacial en Tauri/Wails siempre debe retornar y oficializarse en Atomic-UI, asegurando que todos los modales heredados y futuros (Servidor, BD, Usuario, Contraseña) tengan idéntico espaciado y jerarquía en todo el ecosistema.

---

## [2026-08-02] - Una colección visual no basta: variantes y UX deben ser ejecutables

**Evidencia:** Front Atomic repetía correctamente encabezados, barras de
consulta, estados, tablas y editores, pero un agente todavía debía leer muchos
archivos para reconstruir el patrón. A la vez, los blueprints históricos
mezclaban demos y mocks con artefactos que podían copiarse a un consumidor.

**Decisión:** Atomic publica contratos JSON versionados para componentes y sus
variantes, reglas UX transversales y tres recetas iniciales. `agent:context`
entrega solo la fracción necesaria y `generate:ui` crea una base determinista
desde un requisito explícito. `ui-only` no contiene HTTP; `integrated` exige
endpoint, método y contrato. Los demos permanecen en el showcase, identificados
como `legacy-demo`, y el bootstrap productivo nunca los copia.

**Prevención:** toda variante nueva debe existir primero en código, prueba,
story y catálogo. Todo agente revisa `--dry-run`; el gate bloquea referencias
ausentes, sobrescritura, integración inferida, tokens sin resolver y blueprints
productivos fuera del ADN.

---

## [2026-07-22] - Anclaje del pie de página en el shell de la aplicación y desacoplamiento de pipes de traducción

**Contexto:** En aplicaciones Angular empaquetadas (Tauri, Wails, PyWebView), el pie de página (`<app-footer>`) no era visible en ciertas vistas o pestañas internas (`GerencialComponent`, `OperativoComponent`), o se colapsaba visualmente debido a desbordamientos de layout y a la dependencia implícita del pipe `| translate` de `@ngx-translate/core`.

**Causa raíz:**

1. **Alcance del layout y del scroll:** Al renderizar pestañas (`<app-tabs>`) con contenedores de scroll independientes (`<app-scroll-overlay>` o `overflow: auto`), colocar el pie de página dentro de componentes secundarios o sub-vistas provocaba que quedara recortado por la altura de las tablas o desplazado fuera del área visible (*below the fold*).
2. **Fallo de los pipes de traducción:** El componente `FooterComponent` incluía `| translate` en plantillas por defecto sin que los proyectos consumidores proveyeran explícitamente `TranslateService` o archivos i18n JSON, generando fallos de inyección que cancelaban la renderización del DOM.

**Lección y solución arquitectónica:**

1. **Layout anclado en el shell raíz:** El pie de página no debe incrustarse dentro de componentes de pestañas ni vistas secundarias. Debe declararse exclusivamente en el `AppComponent` raíz mediante un contenedor flexbox de pantalla completa:
   ```html
   <div class="app-root-shell" style="display: flex; flex-direction: column; height: 100vh; width: 100vw; overflow: hidden; background: var(--surface-base, #0f172a);">
     <div class="app-root-content" style="flex: 1; overflow-y: auto; min-height: 0;">
       <app-dashboard></app-dashboard>
     </div>
     <app-footer variant="inline" companyName="Suite Barracuda"></app-footer>
   </div>
   ```
2. **Independencia total de i18n:** El `FooterComponent` de Atomic UI debe usar valores en texto plano con valores predeterminados (`copyrightText || 'Todos los derechos reservados.'`), evitando dependencias duras de `@ngx-translate/core` para garantizar un renderizado atómico libre de errores en cualquier entorno.
3. **Estilos protegidos del host:** `:host { display: block !important; width: 100% !important; margin-top: auto !important; }` asegura que el pie de página ocupe el ancho completo y permanezca fijo en la base del viewport.

**Actualización 2026-08-03:** El ejemplo histórico con estilos inline queda sustituido por clases y tokens de Atomic UI. El pie de página se ubica como hermano inferior del área desplazable del shell, recibe la información de versión mediante entradas tipadas y no importa servicios específicos de Tauri, Wails o PyWebView.

---

## [2026-07-23] - Prohibición de Bypass Atomic UI: Scrollbars de SO en Tema Oscuro y Grillas Rígidas

**Evidencia:** En aplicaciones consumidoras (`prestamo_front_atomic`), se detectaron fallas visuales graves:
1. El navegador renderizaba la barra gris nativa del sistema operativo en tema oscuro al no incluir `::-webkit-scrollbar` en la capa base de tokens `_base.scss`.
2. Los organismos de tablas imponían `max-height` con `overflow-y: auto` compitiendo contra el scroll de `AppShell`, creando un doble scrollbar vertical nativo.
3. Se forzaron reglas CSS ad-hoc con píxeles hardcodeados (`width: 220px`) y grillas de 3 columnas gigantescas en el Dashboard.

**Decisión y Regla de Gobernanza:**
1. **Scrollbars Estilizados en Capa Base:** `-Atomic-UI` define obligatoriamente los seudoelementos `::-webkit-scrollbar` (ancho 6px, thumb `var(--border-color)`, hover `var(--primary-color)`) y `scrollbar-color` para garantizar que ninguna aplicación consumidora muestre barras nativas del SO en tema oscuro.
2. **Eliminación de Scroll Anidado:** `DataTable` no impone restricciones rígidas de altura ni scrollbar vertical compitiendo con el layout global del consumidor.
3. **Métricas en 4 Cajas Compactas:** `MetricsGrid` y `Card` invocan `minCardWidth="14rem"` y `size="sm"` para distribuir 4 métricas compactas por fila en escritorio.
4. **Enforcement de Tokens:** Prohibido el uso de píxeles hardcodeados (`px`); se exige el uso estricto de Design Tokens (`var(--space-*)`, `var(--radius-*)`).

---

## [2026-07-22] - La fuente visual se corrige antes que el consumidor

**Evidencia:** `prestamo_front_atomic` había evolucionado la tabla, las acciones
y los diálogos CRUD, mientras el changelog de Atomic mencionaba parte de esos
objetos sin que los componentes existieran realmente en su árbol.

**Decisión:** `TableAction`, `DataTable`, `CrudDialog` y sus tokens viven primero
en `-Atomic-UI`. Cada consumidor mantiene un manifiesto de procedencia; los
archivos exactos se comparan por contenido y las adaptaciones declaran su motivo.

**Prevención:** ningún cambio visual se cierra sin build de Atomic previo,
propagación posterior y una auditoría que rechace objetos desconocidos, diálogos
directos, estilos inline y colores fijos.

---

## [2026-07-21] - Auditoría Agresiva ADN: Cabecera `th` 100% Opaca con Tinte Azul, Elevación `shadow-sm` en Botones y Estilo Forzado en Paginación

**Contexto:**
Tras una auditoría visual agresiva, se resolvieron 3 defectos sutiles pero críticos:
1. La cabecera `th` utilizaba `color-mix` que en ciertas encapsulaciones provocaba transparencia e interferencia visual con las filas al desplazarse.
2. Los botones carecían de sombra de reposo (`box-shadow: var(--shadow-sm)`), luciendo planos sin profundidad.
3. El combo de paginación sufría interferencia de especificidad en reglas SCSS locales.

**La Lección:**
1. **Fondo de Cabecera 100% Opaco y Azulado:** Las celdas `th` DEBEN vestir un fondo sólido opaco (nunca transparente o dinámico inestable):
   - **Modo Claro:** `background-color: #dbeafe !important; color: #1e40af !important; border-bottom: 2px solid #2563eb !important;` (Fondo azul cielo opaco con texto azul marino).
   - **Modo Oscuro:** `background-color: #1e293b !important; color: #93c5fd !important; border-bottom: 2px solid #38bdf8 !important;` (Fondo pizarra azul noche opaco con texto azul celeste).
2. **Elevación Obligatoria en Botones (`box-shadow: var(--shadow-sm)`):** La clase `.button` e instancias `<prest-button>` DEBEN incluir `box-shadow: var(--shadow-sm)` en reposo y `box-shadow: var(--shadow-md)` en `:hover` con traslación `translateY(-1px)` para garantizar profundidad visual ejecutiva.
3. **Especificidad Forzada en Paginación:** `.data-table__page-size select` debe declarar sus propiedades de borde, fondo y sombras con especificidad estricta para no ceder frente a contenedores de tabla contenedores.

---

## [2026-07-21] - Auditoría ADN de Estados de Entrada: Borde Morado en Hover (`:hover`) y Borde Azul en Enfoque/Escritura (`:focus`)

**Contexto:**
Se identificó una inconsistencia en los estados de entrada: los campos de texto e inputs de paginación no conservaban la sombra de reposo al tener contenido (`:not(:placeholder-shown)`), y el comportamiento ADN original (borde **morado de marca en `:hover`** y borde **azul de escritura en `:focus`**) se había distorsionado por reglas ad-hoc en vistas locales.

**La Lección:**
1. **Regla de Estados ADN Unificada:** Todos los componentes de entrada de la arquitectura (`input`, `select`, `textarea`, `.form-input`, `.form-select`, `.form-textarea`, `.data-table__page-size select`) DEBEN heredar estrictamente la misma secuencia cromática de interacción:
   - **Reposo / Con Contenido:** `border-color: var(--input-border); box-shadow: var(--shadow-sm);` (La sombra `shadow-sm` se conserva SIEMPRE, con o sin texto escrito).
   - **Paso del Ratón (`:hover`):** **BORDE MORADO DE MARCA** (`border-color: var(--primary-color)`) con elevación (`box-shadow: var(--shadow-md)`).
   - **Enfoque / Digitando (`:focus` / `:focus-visible`):** **BORDE AZUL DE ESCRITURA** (`border-color: var(--info-color)`) con resplandor cian/azul (`box-shadow: var(--shadow-focus-secondary)`).
2. **Eliminación de Estilos Ad-Hoc:** Ninguna vista local debe declarar estados de enfoque o hover aislados; la totalidad de formularios, paginación y controles de búsqueda consumen esta definición unificada desde los tokens globales (`_base.scss` y `_forms.css`).

---

## [2026-07-21] - Sombra de Elevación Reposo (`shadow-sm`) en Todos los Inputs, Resaltado en Paginación y Cabecera Azul Adaptativa con `color-mix`

**Contexto:**
1. Los campos de texto `<input>` no poseían sombra de reposo (`box-shadow`), luciendo planos en comparación con los combos `<select>`.
2. El selector de paginación no activaba el borde púrpura de marca al pasar el ratón.
3. La cabecera `thead` requería un tinte azul elegante que se adaptara a modo claro y modo oscuro sin romper el esquema visual.

**La Lección:**
1. **Sombra de Reposo Obligatoria (`box-shadow: var(--shadow-sm)`):** Todos los elementos de entrada (`input`, `select`, `textarea`) DEBEN poseer `box-shadow: var(--shadow-sm)` en estado de reposo para transmitir profundidad y elevación consistente desde el primer vistazo.
2. **Resaltado en Combo de Paginación:** `.data-table__page-size select` debe incluir las mismas reglas de `:hover` (`border-color: var(--primary-color); box-shadow: var(--shadow-md);`) y `:focus` que el resto de los componentes.
3. **Cabecera Azul Adaptativa (`color-mix`):** Usar `background: color-mix(in srgb, var(--info-color) 12%, var(--surface-section));` en las celdas `th`. En modo claro produce un azul suave `#e0f2fe`, y en modo oscuro produce un elegante azul noche `#243656` totalmente integrado al tema.

---

## [2026-07-21] - Propagación Global del Estado Hover (`:hover`) y Glow en Todos los Inputs y Selects

**Contexto:**
Los combos `<select>` tenían un efecto de resaltado al pasar el cursor (`:hover`), mientras que los campos de texto `<input>` permanecían estáticos, generando inconsistencia visual en los formularios.

**La Lección:**
1. **Consistencia Visual en Formularios:** Todos los elementos interactivos de entrada (`input`, `select`, `textarea`, `.form-input`, `.form-select`, `.form-textarea`) DEBEN compartir la misma regla global de `:hover` y `:focus`:
   ```css
   input:hover:not(:disabled):not(:focus),
   select:hover:not(:disabled):not(:focus),
   textarea:hover:not(:disabled):not(:focus) {
     border-color: var(--primary-color);
     box-shadow: var(--shadow-md);
   }
   ```
2. **Experiencia Fluida:** Al asegurar que tanto campos de texto como desplegables reaccionen con el mismo resplandor púrpura de la marca, los formularios lucen uniformes y armónicos al interactuar con ellos.

---

## [2026-07-21] - Fondo Oscuro Integrado (`var(--surface-section)`) con Texto Azul (`var(--info-color-text)`) y Línea de Acento Azul (`var(--info-color)`)

**Contexto:**
El usuario confirmó que la tipografía azul y la línea de acento azul eran ideales, pero cualquier fondo claro estático en la cabecera `thead` rompía el look and feel del Tema Oscuro.

**La Lección:**
1. **Fondo de Superficie Integrado + Letras y Línea Azules:** Las celdas `th` DEBEN mantener el fondo de superficie nativo del tema (`background: var(--surface-section)`), combinando únicamente **letras azules** (`color: var(--info-color-text)`) y una **línea de acento inferior azul** (`border-bottom: 2px solid var(--info-color)`).
2. **Harmonía Visual en Tema Oscuro:** De este modo, en Tema Oscuro el fondo de la cabecera se integra al 100% con las tarjetas azul noche/negras sin ninguna franja clara desencajada, manteniendo los títulos y la línea de acento en un elegante tono azul luminoso (`#93c5fd` / `#0a84ff`).

---

## [2026-07-21] - Fondo de Cabecera Integrado `var(--surface-section)`, Restablecimiento de Combos de Búsqueda a 220px y Ultra-Recorte de Paginación (`3.25rem`)

**Contexto:**
1. Usar tonos fijos o slate-200 en `thead` desentonaba en Tema Oscuro ("desencajaba mucho") al crear una franja brillante estridente.
2. Los combos de búsqueda debían permanecer en su estándar amplio de 220px.
3. El combo de paginación (`POR PÁGINA: [10]`) requería un recorte adicional a un tamaño ultra-compacto.

**La Lección:**
1. **Fondo de Cabecera Seamless Integrado (`var(--surface-section)`):** Las celdas `th` DEBEN emplear `background: var(--surface-section)` con `color: var(--text-color)` y `border-bottom: 2px solid var(--primary-color)`. De este modo, en modo claro la cabecera es de un gris suave `#efeff4`, y en modo oscuro adopta el tono azul noche/oscuro `#2a3556` / `#252525` del tema, integrándose 100% sin bandas desentonadas.
2. **Combos de Búsqueda a 220px:** Los desplegables de búsqueda en formularios se mantienen en su estándar amplio de `220px` (`width: 220px; min-width: 220px; max-width: 220px;`).
3. **Ultra-Recorte de Paginación (`3.25rem`):** `.data-table__page-size select` se redujo a `3.25rem` (~52px), envolviendo apretadamente las cifras de paginación (`10`, `30`, `50`) con ícono de flecha SVG adaptable según el tema.

---

## [2026-07-21] - Cabecera `thead` de Alto Contraste en Modo Oscuro (`#1e293b` con Texto Blanco `#f8fafc`) y Reducción del 45% en Combos (120px)

**Contexto:**
1. En Modo Oscuro (`brand-dark` y `dark`), el texto azul sobre fondo azul oscuro en `thead` producía una relación de contraste deficiente y baja legibilidad.
2. Los combos de búsqueda requerían reducirse un 45% (de 220px a 120px) para lucir ultra-compactos y estilizados.

**La Lección:**
1. **Contraste de Alto Nivel en Modo Oscuro (`#1e293b` + `#f8fafc`):** En Tema Oscuro, las celdas `th` DEBEN vestir un fondo pizarra oscuro azulado (`background: #1e293b !important;`) con texto blanco brillante de alto contraste (`color: #f8fafc !important;`) y un borde inferior cian/azul luminoso (`border-bottom: 2px solid #60a5fa !important;`), garantizando legibilidad y legibilidad ejecutiva al 100%.
2. **Ancho Compacto de 120px (Reducción 45%):** Los campos `<select>` de búsqueda en formularios deben acotarse a `120px` (`width: 120px; min-width: 120px; max-width: 120px;`), logrando un diseño ultra-compacto, estilizado y ágil.

---

## [2026-07-21] - Cabecera Azul Semántica Reactiva a Temas (`var(--info-color-*)`), Restauración del Ícono SVG de Flecha en Paginación y Reducción del 30% en Combos (154px)

**Contexto:**
1. Al usar tonos HEX fijos (`#ebf5ff` / `#1e40af`), la cabecera azul no reaccionaba al cambiar entre tema claro y tema oscuro.
2. El combo de paginación perdió su flecha SVG de despliegue al recortar excesivamente los márgenes de relleno.
3. El usuario solicitó reducir el ancho de los combos de búsqueda en un 30% (de 220px a 154px).

**La Lección:**
1. **Tokens Semánticos Reactivos para Cabeceras Azul (`var(--info-color-*)`):** Las celdas `th` DEBEN emplear tokens semánticos contextuales (`background: var(--info-color-lighter); color: var(--info-color-text); border-bottom: 2px solid var(--info-color)`). De este modo, la cabecera reacciona dinámicamente y se adapta impecablemente a Tema Claro, Tema Oscuro y Tema Brand Dark.
2. **Preservación del Ícono SVG de Flecha en Paginación:** El selector `.data-table__page-size select` debe declarar explícitamente `background-image: url(...)` con `background-position: right 0.25rem center;` y `padding-right: 1.25rem !important;`, garantizando que la flecha `chevron` sea siempre visible.
3. **Ancho Reducido un 30% (154px):** Los campos `<select>` de formularios de búsqueda deben acotarse a `154px` (`width: 154px; min-width: 154px; max-width: 154px;`), ofreciendo un equilibrio compacto de espacio.

---

## [2026-07-21] - Cabecera Azul Distintiva (`#ebf5ff` / `#1e40af`) y Reducción al 50% del Combo de Paginación (`3.85rem`)

**Contexto:**
1. El usuario solicitó evaluar una tonalidad azul ejecutiva en la cabecera `thead` de las tablas.
2. El selector de paginación (`POR PÁGINA: [40]`) requería reducirse a la mitad para lucir ultra-compacto y afinado.

**La Lección:**
1. **Cabecera Azul Corporativa (`#ebf5ff` / `#1e40af`):** Las celdas `th` lucen una tonalidad azul suave de contraste (`background: #ebf5ff; color: #1e40af; border-bottom: 2px solid #2563eb;`), proporcionando una lectura clara, fresca y profesional.
2. **Reducción al 50% del Combo de Paginación (`3.85rem`):** `.data-table__page-size select` se ajustó a `3.85rem` (~58px), recortando el tamaño a la mitad para albergar estrictamente las cifras de página (`10`, `30`, `40`, `50`, `100`) de forma minimalista.

---

## [2026-07-21] - Combo de Paginación Compacto (Máx 3 Cifras / `5.25rem`) y Fondo de Cabecera con Color Secundario de Marca

**Contexto:**
1. Al estandarizar los combos de búsqueda en 220px, el desplegable de paginación (`POR PÁGINA: [40]`) heredó esa anchura excesiva.
2. El color de la cabecera `thead` requería mayor expresividad utilizando la paleta secundaria de la marca.

**La Lección:**
1. **Diferenciación de Combo de Paginación:** Mientras que los campos de búsqueda miden 220px, el selector de paginación (`.data-table__page-size select`) DEBE estar acotado a un tamaño compacto de `width: 5.25rem !important` (aprox. 84px), permitiendo alojar como máximo 3 dígitos (ej. `10`, `30`, `50`, `100`) sin desperdiciar espacio.
2. **Cabecera con Color Secundario:** Las celdas `th` deben vestir el tono secundario contextual `background: var(--secondary-color-lighter)`, `color: var(--secondary-color-text)` y un borde inferior pronunciado `border-bottom: 2px solid var(--secondary-color)`, otorgando una apariencia fresca, distintiva y armonizada con la marca.

---

## [2026-07-21] - Requisito Obligatorio `[fill]="true"` en ScrollOverlay, Tamaño Estándar de 220px para Combos y Color Distintivo en `thead`

**Contexto:**
1. Al incrustar `<prest-scroll-overlay class="data-table__viewport">` sin la propiedad `[fill]="true"`, el viewport interno tenía `height: auto` en lugar de `height: 100%`, impidiendo la activación del scroll vertical.
2. La anchura de 185px resultaba aún muy ajustada para ciertas opciones largas; el estándar definitivo solicitado es de **220px**.
3. Las cabeceras `thead` se confundían con el fondo de la tarjeta al usar `var(--surface-ground)`.

**La Lección:**
1. **`[fill]="true"` Obligatorio en ScrollOverlay:** Todo uso de `<prest-scroll-overlay>` en componentes de alto rígido (como tablas y paneles) DEBE incluir `[fill]="true"` para forzar `height: 100%` en la vista interna y permitir el disparo de `overflow-y: auto`.
2. **Ancho Estándar Definitivo de 220px:** Todos los desplegables `<select>` en formularios deben medir estrictamente `width: 220px; min-width: 220px; max-width: 220px;`.
3. **Fondo de Cabecera Contrastante (`var(--border-color-light)`):** Las celdas `th` deben usar `background: var(--border-color-light)` con un borde inferior de marca `border-bottom: 2px solid var(--primary-color)` y sombra sutil `box-shadow: 0 2px 4px rgba(0,0,0,0.08)`, destacando la cabecera tanto en modo claro (`#e2e8f0`) como en oscuro.

---

## [2026-07-21] - Estandarización de Ancho de Combos (185px), Unificación de Tabla y Color Distintivo de Cabecera `thead`

**Contexto:**
1. Los desplegables `<select>` cambiaban de ancho dinámicamente según la etiqueta o la opción seleccionada, produciendo desalineación visual.
2. Dividir la tabla en dos elementos `<table>` separados desalineaba las columnas e impedía el funcionamiento correcto del scroll.
3. Las cabeceras `thead` carecían de un tono de fondo distintivo.

**La Lección:**
1. **Ancho Estándar de 185px:** Todos los campos `<select>` y combos de formulario deben poseer una anchura estándar estricta de `width: 185px; min-width: 185px; max-width: 185px;`. Esto garantiza una retícula limpia, predecible y uniforme en todos los formularios.
2. **Tabla Única con Cabecera Pegajosa (`sticky`):** La estructura HTML de una grilla debe consistir en una **ÚNICA tabla `<table>`** dentro del contenedor `<prest-scroll-overlay class="data-table__viewport">`. Esto asegura la alineación matemática exacta de todas las columnas entre `thead` y `tbody`.
3. **Color Distintivo de Cabecera `thead`:** Las celdas `th` deben declarar `background: var(--surface-ground)` con un borde inferior pronunciado (`border-bottom: 2px solid var(--border-color-strong)`), otorgándole un color de cabecera limpio y distinguible.

---

## [2026-07-21] - Separación de `thead`, Envoltura de `tbody` con Scroll Auto-Ocultable, Distinción de Cabecera y Variación de Botones

**Contexto:**
1. El scrollbar de la tabla se extendía erróneamente cubriendo el `thead` y permanecía visible de forma tosca.
2. El fondo de `thead` usaba el mismo tono que la barra de paginación (`.data-table__toolbar`), provocando confusión visual.
3. El botón "BUSCAR" en formularios usaba el color primario idéntico al botón de acción principal ("NUEVO CLIENTE") y carecía de íconos.
4. El espaciado horizontal entre filtros era excesivo (36px).

**La Lección:**
1. **Aislamiento de `tbody` en Scroll Overlay:** `thead` debe residir en su propio contenedor fijo (`.data-table__header-container`), mientras que `<prest-scroll-overlay>` envuelve **únicamente al `<tbody>`**. Esto garantiza que el scrollbar sea auto-ocultable al mover el ratón y NUNCA se extienda hasta las cabeceras `thead`.
2. **Distinción Visual de `thead`:** `thead` debe pintar un fondo contrastante (`background: var(--surface-ground)`) con un borde inferior pronunciado (`border-bottom: 2px solid var(--border-color)`), separándolo claramente de la barra de paginación superior.
3. **Variantes de Botón e Íconos Obligatorios:** Los botones de búsqueda de formulario deben usar `variant="secondary"` (o `outline`/`ghost`) e incluir siempre un ícono explícito (ej. `icon="magnifying-glass"`, `icon="plus"`, `icon="rotate-left"`), diferenciándose visualmente del botón de creación principal.
4. **Espaciado Horizontal de Filtros:** Los elementos de formularios de búsqueda en línea deben distanciarse con `gap: var(--space-4)` (16px) en lugar de espaciados gigantescos.

---

## [2026-07-21] - Auditoría Profunda: Habilitación de Scroll Vertical (`[vertical]="true"`), Preservación de Flechas SVG (`background-color`) y Espaciado Holgado en Filas

**Contexto:** Se detectaron 4 problemas en auditoría profunda:
1. El scrollbar vertical de la tabla no funcionaba y solo mostraba 18 de 40 filas por tener `[vertical]="false"` en la envoltura `<prest-scroll-overlay>`.
2. Las flechas SVG de los combos se borraban silenciosamente por usar `background: var(--input-bg)` en lugar de `background-color`.
3. Los combos lucían desproporcionadamente grandes en los formularios.
4. El espaciado interno de las filas de las tablas se sentía apretado y comprimido.

**La Lección:**
1. **Activación de Scrollbar Vertical:** `<prest-scroll-overlay>` en tablas de datos debe declarar explícitamente `[vertical]="true"` y el contenedor `.data-table__viewport` debe poseer `overflow-y: auto` con scrollbars WebKit estilizados (`::-webkit-scrollbar`).
2. **Preservación de SVG de Flecha:** Usar estrictamente la propiedad singular `background-color: var(--input-bg)` en lugar del taquigráfico `background: ...`, para evitar la anulación accidental de `background-image: url(...)`.
3. **Ancho Compacto de Combos:** Los desplegables `<select>` en formularios deben acotarse a `max-width: 14rem; min-height: 2.375rem;` para lucir elegantes y estilizados.
4. **Espaciado Holgado y Ejecutivo de Filas:** `th` y `td` deben emplear un relleno holgado `padding: var(--space-4) var(--space-5)` (16px top/bottom, 20px left/right), proporcionando un diseño respirable y de alta gama.

---

## [2026-07-21] - Contraste en Modo Oscuro (Hover de Filas), Margen Respirable (36px) y Flechas SVG de Combos

**Contexto:** Al pasar el ratón (`hover`) por las filas de las tablas en Tema Oscuro, las filas se pintaban de blanco brillante cegador, tornando ilegible el texto. Además, los combos `<select>` perdían las flechas de despliegue en modo oscuro y las tarjetas de tabla quedaban pegadas al borde inferior sin espacio respirable.

**La Lección:**
1. **Hover Semántico de Filas (`var(--hover-background)`):** Jamás usar colores claros rígidos (como `var(--brand-primary-50)`) para eventos `:hover` en elementos de tabla. Utilizar siempre el token semántico de interacción `var(--hover-background)` (que en tema claro es celeste suave `#e8f0fe` y en tema oscuro es azul naval/slate `#202f61` / `#2d2d2d`).
2. **Margen Respirable de 36px:** Todo contenedor de tabla acotado debe acotar su viewport (`height: calc(100vh - 27rem)`) para garantizar una holgura o aire de al menos 36px (`2.25rem`) por encima del borde inferior de la pantalla.
3. **Flecha SVG Dinámica en Combos:** El SVG inyectado en `background-image` para desplegables `<select>` debe alternar su trazo (`stroke='%23cbd5e1'`) en selectores oscuros (`[data-theme='dark'] select`), asegurando legibilidad perfecta.

---

## [2026-07-21] - Supresión de Contenedores Dobles (Single Card Boxing) y Estilos de Combos Atómicos

**Contexto:** Los componentes de tabla (`DataTableComponent`) se estaban envolviendo erróneamente dentro de tarjetas adicionales (`<prest-card>`), lo que creaba bordes y sombras dobles anidadas y desbordaba la pantalla. Además, los desplegables `<select>` mostraban los menús rectangulares por defecto del SO.

**La Lección:**
1. **Contenedor Único Atómico:** Los componentes de organismo como `DataTableComponent` constituyen su propia tarjeta atómica. Prohibido envolver un `DataTableComponent` dentro de un `<prest-card>`.
2. **Estilizado Universal de Combos y Desplegables:** Todos los elementos `<select>` u `<option>` deben anular la apariencia nativa (`appearance: none`), incluir íconos SVG de despliegue estilizados y utilizar el token de superficie `var(--surface-background)` con bordes redondeados y estados `:hover`/`:focus` atómicos.
3. **Cálculo de Altura del Viewport:** La altura del viewport de tablas dentro de la aplicación principal debe acotarse exactamente a `height: calc(100vh - 23.5rem)` para garantizar cero desbordamiento vertical y un margen inferior respirable.

---

## [2026-07-21] - Contenedores de Tabla con Altura Fija e Integridad de thead

**Contexto:** Al seleccionar 40 o 50 registros por página, la tarjeta contenedora de la tabla se expandía libremente hacia abajo empujando el layout y creando scrollbars innecesarias en la ventana del navegador. Además, el `thead` dejaba un espacio blanco no pintado a la derecha junto al scrollbar de las filas.

**Causa Raíz:** Las tablas dependían de `height: auto` o `max-height` variable en el contenedor viewport, y la propiedad `border-collapse: separate` dejaba sin pintar el fondo del gutter sobre el scrollbar.

**La Lección:**
1. Los contenedores de tablas de datos (`data-table__viewport`) deben declarar una altura fija o acotada (`height: calc(100vh - 18.5rem); overflow: auto; background: var(--surface-section)`). Seleccionar 10, 20 o 50 filas por página NUNCA debe alterar la altura del contenedor principal.
2. Para evitar esquinas superiores sin pintar en `thead`, el contenedor `.data-table__viewport` debe pintar su fondo con `var(--surface-section)`, heredando la continuidad visual perfecta sobre el gutter del scrollbar.
3. Se deben eliminar los subtítulos y títulos duplicados "BÚSQUEDA" y "RESULTADOS" de los contenedores cuando la estructura visual es auto-explicativa, ahorrando espacio vertical valioso para los datos de negocio.

---

## [2026-07-21] - Anclaje del Viewport y Bloqueo de Scroll Nivel Navegador

**Contexto:** En aplicaciones consumidoras Web/Angular, al mover la rueda del ratón el documento entero (`body`) se desplazaba verticalmente, destruyendo el encuadre fijo del layout del tablero.

**Causa Raíz:** Las etiquetas raíz `html` y `body` declaraban `min-height: 100vh` sin `overflow: hidden`, lo que permitía la generación de una barra de scroll nativa externa del navegador.

**La Lección:** Todo layout SPA debe declarar en `html` y `body`: `width: 100%; height: 100dvh; overflow: hidden;`. Ningún scroll debe ocurrir en la ventana principal del navegador. Todo scroll se delega internamente a los contenedores `<prest-scroll-overlay>`.

---

## [2026-07-21] - Transformación Automática de Estados a StatusBadge

**Contexto:** Los desarrolladores solían inyectar valores de estado ("Activo", "Inactivo", "Vigente") como cadenas de texto plano dentro de las tablas de datos (`DataTable`).

**La Lección:** Ninguna tabla del ecosistema debe mostrar estados en texto plano. El componente `DataTable` intercepta automáticamente las columnas de estado (`stateLabel`, `status`, `b_STATE`, `isBadge`) y las convierte al átomo `StatusBadgeComponent`, ofreciendo código de color y voz accesible ARIA nativa.

---

## [2026-07-20] - Fugas de Click en Componentes Encapsulados (app-button)

**Contexto:** En el Orquestador del Acopiador, el boton "Ejecutar Calculo" se mostraba deshabilitado (gris, opacity reducida) cuando faltaban fuentes de datos `[disabled]="!canExecuteIndicador()"`, pero el usuario reporto que al hacer click, el calculo se ejecutaba de todas formas.

**Causa Raiz:** El consumidor enlazo la accion usando el evento nativo del DOM `(click)="ejecutarIndicador()"` directamente sobre la etiqueta `<app-button>`. En Angular, esto enlazar el listener al *Host Element*. Aunque el `<button>` HTML nativo en el interior del componente este `disabled` y no dispare eventos de click, el click del usuario impactaba en el host (padding, wrapper) y disparaba la funcion.

**La leccion:** Los componentes de UI empaquetados (como `app-button`) gestionan su estado `disabled` bloqueando la emision de eventos desde dentro. El `ButtonComponent` de Atomic UI cuenta con un `@Output() buttonClick` que solo emite si el boton no esta deshabilitado.

**Regla de propagacion (Angular Consumidor):** 
Queda estrictamente prohibido usar `(click)` sobre elementos custom de la libreria Atomic UI como `<app-button>`, `<app-icon-button>` o `<app-chip>`. Se debe usar siempre el `@Output()` disenado para tal fin:
- ✅ Correcto: `<app-button (buttonClick)="save()">`
- ❌ Incorrecto: `<app-button (click)="save()">`

---

## [2026-07-20] - El componente visual no debe reinterpretar importes ni tendencias

**Contexto:** Una tarjeta KPI genérica redondeaba monedas a cero decimales y mostraba una tendencia neutral aun cuando el consumidor no había recibido comparación. Además de perder precisión visible, esto convertía una ausencia de datos en una afirmación visual.

**La lección:** Los componentes de presentación financiera deben aceptar un `displayValue` ya formateado por la frontera autorizada y conservar dos decimales cuando deban aplicar un formato monetario genérico. Tendencias, comparaciones y estados no se infieren: permanecen ausentes hasta que el consumidor los entrega explícitamente.

**Regla de estado:** Un estado operativo siempre incluye texto; el color y el icono son apoyos visuales. Los badges de estado se mantienen separados de los contadores de notificaciones para no generar nombres accesibles engañosos.

**Regla responsive:** Una grilla reutilizable debe permitir que la columna mínima nunca supere a su contenedor mediante `min(100%, medida)`, y cada host participante debe declarar `min-width: 0`.

---

## [2026-07-20] - Propagación visual sólo después de validar la fuente

**Contexto:** Una sustitución mecánica de píxeles por tokens dejó expresiones como `76var(...)` dentro de media queries y tamaños. CSS descarta esas declaraciones sin generar un error de compilación, por lo que el defecto responsive puede propagarse silenciosamente a todos los consumidores.

**La lección:** La fuente de diseño debe pasar una búsqueda estática de valores inválidos, pruebas de componente y validación en los breakpoints nominales antes de copiarse. Los valores numéricos dañados se restauran únicamente cuando se conoce su medida original; no se hacen reemplazos globales especulativos.

**Regla de feedback:** El espacio posterior a un mensaje forma parte del contrato del componente y debe expresarse con un token y una variante explícita. La mayúscula corresponde a títulos o etiquetas de interfaz; nunca se transforma el cuerpo del mensaje ni datos del usuario.

**Regla de navegación:** Un padre con hijos controla expansión y una hoja controla navegación. La presentación en mayúsculas se resuelve con CSS para no mutar etiquetas, rutas ni contratos de backend.

**Regla de acciones de icono:** Todo botón que sólo contiene un icono necesita nombre accesible. Enter y Espacio ya activan un `<button>` nativo; añadir handlers de teclado paralelos duplica eventos y puede ejecutar una mutación dos veces.

---

## [2026-07-19] - Tokens de Color Obligatorios en Modales y Overlays Custom

**Contexto:** En la aplicación base_python_angular (Acopiador), los modales de alerta y confirmacion construidos con `app-card variant="elevated"` + `slot="image"` tenian colores hexadecimales fijos en el header (`#1e293b`, `#f8fafc`, `#334155`). En modo oscuro el texto parecia correcto (porque los colores fijos simulaban el dark mode), pero en modo claro el fondo quedaba negro y el texto blanco, siendo completamente ilegible.

**La leccion:** Los consumidores de Atomic UI (Wails, Tauri, Python/WebView) NO deben usar colores hexadecimales fijos en ningún elemento que forme parte de un modal, overlay o dialogo. El sistema de tokens de Atomic garantiza la paridad automatica entre Light Mode y Dark Mode. Al forzar un color fijo, se rompe esa garantía y el componente queda "atado" a un solo tema.

**Regla de tokens para modales:**
- Header/cabecera del modal: `background: var(--surface-section)` + `border-bottom: 1px solid var(--border-color)`
- Titulo del modal: `color: var(--text-color)`
- Texto del cuerpo: `color: var(--text-color)` explicito (NO usar `text-secondary` ni `text-muted` en modales; esas clases aplican opacidad reducida que resulta ilegible sobre fondos de superficie)
- Iconos de estado: `color: var(--danger-color)`, `var(--warning-color)`, `var(--success-color)` según el tipo de alerta
- Separadores: `border-color: var(--border-color)`

**Regla de propagacion:** Cualquier modal o elemento HTML flotante (overlay, drawer, tooltip, popover) en cualquier consumidor del ecosistema (Wails, Tauri, Python/WebView) debe heredar exclusivamente tokens semanticos de Atomic UI. Esta regla aplica antes de cualquier decisión de layout o color.

---

## [2026-07-16] - Datos demo de graficos y contratos productivos
**Contexto:** Atomic UI contiene showcase, stories y blueprints que necesitan datos de demostracion para exponer el comportamiento de `app-chart`, dashboards y paginas analiticas. Esos datos pueden confundirse con mocks operativos cuando se propagan componentes hacia Wails, Tauri o Python.
**La leccion:** Los datos de showcase, stories y blueprints son demostrativos y no constituyen contrato de negocio. Toda aplicación productiva debe enlazar sus graficos a contratos backend, SP o vistas versionadas. Cuando un consumidor no tenga datos reales, debe renderizar estado vacio o contrato vacio, no valores inventados.
**Regla de propagacion:** Los ejemplos de graficos en Atomic UI deben estar rotulados como demo y consumir tokens `--chart-color-*`, `--chart-grid-color`, superficie y tooltip. Al copiar componentes a Wails, Tauri o Python, se propaga el componente y los tokens, pero no los arreglos demo de datos.

---

## [2026-07-16] - Reserva inferior en tablas con scroll sincronizado
**Contexto:** La grilla nominal del indicador 11 combinaba `ScrollOverlayComponent`, cuerpo de tabla scrolleable (`tbody[data-so-vertical]`), columnas sincronizadas con grid y barra horizontal superpuesta. En ese escenario, la última fila quedaba visualmente demasiado cerca de la barra horizontal y el texto secundario de `Estado TA` podia percibirse incompleto.
**La leccion:** En tablas sincronizadas por grid, no se debe depender de `tbody::after` para crear aire al final del scroll. El `tbody` actua como scroller real y debe recibir `padding-bottom` y `scroll-padding-bottom` condicionados por `so-has-overflow-x`. La reserva debe ser mayor que el grosor visual de la barra; por ello `--so-scroll-end-space` usa `calc(var(--so-track-size) + var(--space-8))`.
**Regla de propagacion:** Cualquier ajuste de `ScrollOverlayComponent`, `TableComponent`, `table-tokens.css` o `responsive-table.css` debe aplicarse primero en Atomic UI y luego copiarse a Wails, Tauri y Python. Los consumidores no deben resolver este problema con estilos locales porque se generaria drift visual entre aplicaciones.
**Regla visual:** Las celdas cuyo único contenido es `app-chip` pueden centrarse verticalmente mediante `display: flex; align-items: center;`. Las celdas compuestas, como `Estado TA`, deben conservar flujo vertical para mostrar el chip y el detalle secundario sin comprimir el texto.

---

<a id="2026-07-01---auditoria-de-ecosistema-drift-dependencias-y-seguridad"></a>

## [2026-07-01] - Auditoría de Ecosistema: Drift, Dependencias y Seguridad

### 1. El Drift Silencioso en Ecosistemas Multi-Repo
**Contexto**: La auditoría SHA-256 de todos los archivos `shared/ui` revelo que 10 archivos tenian drift y 5 estaban completamente ausentes en Tauri y Wails. En ningún momento hubo errores visibles — el drift se acumula silenciosamente.
**La Leccion**: Los fixes aplicados en un consumidor (Wails, Tauri) deben retroalimentarse SIEMPRE a Atomic-UI (Fuente de la Verdad) antes de propagarse. El flujo correcto es: *Arreglar en Atomic-UI → Propagar a consumidores*. Nunca al reves. Validar con SHA-256 periodicamente es la única forma de detectar drift oculto.

<a id="2-las-dependencias-de-packagejson-tambien-son-parte-de-la-fuente-de-la-verdad"></a>

### 2. Las Dependencias de package.json también son parte de la Fuente de la Verdad
**Contexto**: `chartjs-plugin-datalabels` estaba en `package.json` de Tauri y Wails pero faltaba completamente en Atomic-UI, causando errores TS2307 unicamente en la fuente. Los errores eran invisibles en los consumidores porque tenian el paquete.
**La Leccion**: Atomic-UI debe tener instaladas TODAS las dependencias que sus componentes consumen, aunque los consumidores también las tengan. El `package.json` de Atomic-UI es también la Fuente de la Verdad de dependencias. El script de propagacion deberia incluir una verificación de paquetes cruzada.

### 3. API Breaking Change en ngx-translate v18 (TranslateModule eliminado)
**Contexto**: Wails tenia `@ngx-translate/core@^18.0.0` mientras Atomic-UI y Tauri usaban `^17.0.0`. Los componentes propagados que usaban `TranslateModule` fallaban con `TS2724` en Wails porque v18 elimino esa exportacion.
**La Leccion**: Al propagar componentes que dependen de librerias con versiones semanticas distintas entre proyectos, el primer paso es alinear TODAS las versiones al semver del proyecto Fuente de la Verdad. Nunca asumir que `^18` incluye la API de `^17` — los breaking changes son reales aunque sean parches mayores.

### 4. Scripts de Desarrollo con Credenciales Hardcodeadas (OWASP A07)
**Contexto**: Se encontraron credenciales SQL Server privilegiadas en texto plano dentro de scripts auxiliares del workspace. Los valores fueron redactados y deben tratarse como comprometidos; la documentación no conserva contraseñas, cuentas ni direcciones internas.
**La Leccion**: Los scripts de utilidad de desarrollo deben seguir el mismo patron de seguridad que el código de produccion. El patron correcto para scripts locales es: centralizar en `config.js` o usar el keyring del sistema (`go-keyring`), gitignorear el archivo de credenciales, y proveer un `config.example.js` como plantilla. Ningún password debe existir en texto plano en el repositorio.

---

## [2026-06-26] - Iluminación de Fondos sin pérdida de Saturación (Hover)

### 1. Highlight UI vs Background Colors
**Contexto**: Los encabezados de tabla (`thead`) contaban con un efecto `hover` implementado inyectando un overlay negro translúcido (`rgba(0,0,0,0.05)`) o gris. Sin embargo, esto destruía visualmente colores vibrantes (como morados intensos o verdes puros) al "ensuciarlos" o "des-saturarlos".
**La Lección**: En componentes genéricos de UI (como un Design System) donde se desconoce si el consumidor usará colores claros o fondos fuertemente saturados, nunca se debe inyectar gris o negro semitransparente como estrategia de `hover`. La solución nativa ideal para preservar exactamente la saturación de color de origen (Hue) mientras se destaca la interacción es el uso de `filter: brightness(X)`. Por ejemplo, `filter: brightness(1.2)` aumenta mágicamente el brillo 20% logrando un resaltado espectacular y fiel al ADN cromático subyacente.

## [2026-06-23] - Aislamiento de Propagación de Eventos en Dropdowns y Rust Tiberius Panics

### 1. El Falso "Refresco" en Selects sobre Wails (WebView2)
**Contexto**: Los elementos `Select2Component` perdían el dato recién seleccionado al hacer click en una opción, pareciendo reiniciarse o cerrarse prematuramente sin actualizarse en el frontend.
**La Lección**: La causa real es la propagación (bubbling) del evento `click` hacia el `document` combinado con la destrucción del elemento del DOM. Al seleccionar la opción, el dropdown se ocultaba eliminando el elemento del DOM. Cuando el evento `click` llegaba a la directiva global `@HostListener('document:click')`, esta ejecutaba `contains(event.target)`. Como el elemento clickeado ya no existía en el DOM, la directiva creía falsamente que se hizo un click "fuera" del componente y sobreescribía el estado. 
La solución robusta es detener la propagación del evento `click` en la opción mediante `(click)="$event.stopPropagation(); ..."` y utilizar `(mousedown)="$event.preventDefault()"` para retener el foco en el input de búsqueda. Esto elimina la necesidad de retardar la destrucción del DOM con `setTimeout`.

### 2. Crasheos Silenciosos en Rust y Activación de Mock Data
**Contexto**: El dashboard de Tauri mostraba "Datos de prueba" aunque el ping DB funcionara. Se debió a un panic de la librería Tiberius usando `row.get()`.
**La Lección**: En Rust, `row.get::<T>` hace `unwrap` interno de los tipos SQL exactos. Si SQL manda un FLOAT donde Rust pide un INT, la aplicación colapsa y Angular atrapa el error como "conexión caída". Toda capa Repository en Tauri debe usar strictly iteradores `.try_get()` aplanados a defaults: `row.try_get::<i32, _>("col").ok().flatten().unwrap_or(0)`.

### 3. Excepción TLS en Bases de Datos Legacy
**Contexto**: El intento de forzar `TrustServerCertificate=true` destruyó por completo el acceso a Tauri arrojando "os error -2146893007".
**La Lección**: Windows 11/10 modernos no comparten algoritmos TLS con SQL Servers sin parchar. El único túnel viable de desarrollo local es `encrypt=DANGER_PLAINTEXT`.

---

## [2026-06-19] - Paginación, Scrollbars Nativos vs Custom y Sticky Headers

### 1. Paginación y Comportamiento del "Remanente" (Falso Bug)
**Contexto**: Los usuarios reportaron que al navegar a la última página de una tabla, "por defecto se regresaba a 10 registros pero el combo seguía marcando 50".
**La Lección**: Matemáticamente, la última página rara vez completa el `pageSize` exacto. Si el total es 110 registros y el tamaño es 50, la página 3 mostrará exactamente los 10 registros restantes. 
**Resolución de UX**: Se confirmó que esto no es un error de estado (el combo box `pageSize` mantiene su estado correctamente en 50 porque sigue siendo el tope máximo), sino una confusión natural del usuario. La solución real es instruir al usuario (o manejar estados vacíos "ghost rows" si el negocio lo demanda explícitamente), manteniendo la arquitectura fiel al remanente real del Stored Procedure.

### 2. El desafío de los "Sticky Headers" en Tablas con CSS Grid
**Contexto**: Para habilitar un ScrollOverlay con capacidad de redimensionamiento de columnas, se inyecta la tabla dentro de una estructura `display: block` o `display: grid`, y se le aplica `overflow: hidden` a las áreas inyectadas para evitar barras dobles.
**La Lección**: Cualquier elemento (`th`) que tenga `position: sticky` **perderá su efecto automáticamente** si cualquiera de sus padres tiene `overflow: hidden`. 
**Solución Arquitectónica**: Para volver a hacer la cabecera pegajosa dentro del contenedor, el `position: sticky; top: 0; z-index: 20;` debe declararse **directamente en el thead** (`.rtc-header` / `.atomic-thead`) y no solo en las celdas `<th>`. De este modo, la capa principal del header se ancla en el contenedor scrollable (`.so-scroll-area`) sin importar los bloqueos de overflow que tenga debajo.

### 3. Solapamiento (Overlap) de Custom Scrollbars sobre Componentes Sticky
**Contexto**: El componente `ScrollOverlay` inyecta barras de desplazamiento estéticas (`.so-scrollbar-y`) que se posicionan de manera absoluta dentro de la caja visible (`top: 0`).
**La Lección**: Si la caja contiene un elemento `sticky` anclado a `top: 0` (como un header), el track del scrollbar virtual se renderizará cruzando o pisando visualmente esa cabecera.
**Solución Arquitectónica**: En el cálculo de geometría (`syncGeometry`), el componente debe leer dinámicamente la altura reservada del header (`this.tableHead.offsetHeight`) y utilizar ese valor como un offset tanto para el inicio del recorrido (`top = offset`) como para recortar la altura de la vía (`barHeight = containerHeight - offset`). A nivel de motor lógico (`updateVerticalThumb`), la matemática que calcula la altura del thumb de scroll también debe iterar sobre el nuevo tamaño neto de la vía y no sobre todo el viewport general del contenedor.

---

## [2026-07-06] - Uso Correcto de Variantes de Tarjeta y Alineación (Atomic-UI)
- **Problema:** Al utilizar <app-card variant="filled"> en contenedores grid, los fondos se veían planos sin profundidad, y el texto interior no se alineaba verticalmente causando desbalances estéticos. Inicialmente se intentó "hackear" el CSS agregando bordes y sombras al variant filled.
- **Solución y Regla de Oro:** NO hackear los estilos base. El sistema Atomic-UI contiene la variante elevated que utiliza el color de fondo --surface-elevated y aplica las sombras predefinidas según el tema claro/oscuro. Además, para las cuadrículas (CSS Grid), el contenedor interno de la tarjeta debe utilizar class="text-center h-full d-flex flex-col justify-center" para alinear los elementos dinámicamente y centrar de forma perfecta.

### [2026-07-08] Desarrollo Independiente y Sintaxis Nativa (Arquitectura Desacoplada)
- **Contexto:** Al abordar problemas en el mapeo de variables desde bases de datos, se intentó replicar (hacer análoga) la lógica del ecosistema de Wails (Go) directamente al ecosistema de Tauri (Rust).
- **Problema:** Wails (Go) y Tauri (Rust) manejan el acceso a base de datos, mapeo JSON, y serialización de formas muy distintas (ej. `row.Scan` vs `tiberius` y `serde`). Tratar de forzar que Tauri funcionara exactamente con las convenciones, nombres de variables o estructuras parciales copiadas de Wails ocasionó roturas críticas en el frontend al intentar pintar la data.
- **Lección Aprendida:** **NUNCA se debe asumir que una mejora en Wails es análoga a Tauri.** Queda strictly prohibido desarrollar mezclando o copiando sintaxis entre ecosistemas. A partir de ahora, cada ecosistema (Python, Wails, Tauri) debe ser desarrollado **de forma individual con su sintaxis nativa** y respetando sus propios paradigmas y librerías. Cualquier nueva característica o corrección requiere una auditoría profunda e independiente en su respectivo entorno para solucionar el problema de raíz, sin asumir paridad automática con los otros frameworks.

## Desbordamiento silencioso en grillas Flexbox
- **Contexto:** Al usar el sistema en aplicaciones como el Acopiador en Python, ciertas tarjetas de consola de texto forzaban el crecimiento vertical de la ventana más allá de `100vh`.
- **Problema:** En `app-card`, el contenedor interno `.card__body` es un bloque tradicional que crece con su contenido. Si un consumidor inyecta un `div` con `flex: 1` asumiendo que llenará el espacio, el texto largo puede expandir la grilla.
- **Lección aprendida:** No se debe mutar `.card__body` a `display: flex` de forma global en Atomic UI, ya que rompería el flujo normal de texto y botones de las tarjetas tradicionales. Cuando un proyecto consumidor necesite que el contenido interno de una tarjeta ocupe el resto del layout, por ejemplo una terminal, el consumidor debe inyectar una regla estricta local: `:host ::ng-deep .mi-tarjeta .card__body { display: flex; flex-direction: column; min-height: 0; }`.

## Una corrección automática de auditoría puede degradar el framework

- **Contexto:** la fuente Atomic usaba Angular 22.0.0 y herramientas de diseño con rangos de compatibilidad anteriores; la auditoría proponía resolver avisos del entorno instalando Angular 21.
- **Decisión:** alinear primero Angular, DevKit, Storybook y ESLint dentro de Angular 22, fijar el motor Node compatible y validar pruebas/builds; no aceptar una solución `--force` que cambie la línea arquitectónica.
- **Prevención:** separar vulnerabilidades de producción y desarrollo, revisar el plan exacto de actualización y conservar explícitos `engines`, `.node-version` y el lockfile.

## Un aviso transitivo puede cerrarse sin cambiar la línea Angular

- **Contexto:** Angular 22.0.7 aún resolvía `webpack-dev-server 5.2.3` y
  `sockjs → uuid 8.3.2`, aunque sus revisiones compatibles ya corregían los
  avisos publicados.
- **Decisión:** fijar únicamente `webpack-dev-server 5.2.6` y el `uuid` interno
  en `11.1.1`, y volver a ejecutar pruebas dirigidas, build Angular, Storybook y
  auditoría completa con el Node fijado.
- **Prevención:** un `override` mayor solo se acepta cuando la API consumida se
  inspecciona y todo el toolchain se ejecuta; nunca se usa el cero de auditoría
  como sustituto de las pruebas.

## Una suite histórica roja debe reportarse por separado

- **Contexto:** los 24 casos del ADN propagado pasan, pero la corrida completa
  descubrió 68 specs antiguos que establecen inputs de componentes Angular como
  propiedades ordinarias y ya no ejercitan la plantilla real.
- **Decisión:** no mezclar su reparación con PREST-014 ni declarar la suite global
  aprobada; registrar 106 éxitos/68 fallos y mantener como gate la suite dirigida,
  los builds y las pruebas del consumidor.
- **Prevención:** al migrar componentes a `input()`, actualizar sus fixtures con
  `ComponentRef.setInput()` en un incremento dedicado y conservar una línea base
  explícita de la suite completa.

## Modales personalizados y modo oscuro
- **Contexto:** En aplicaciones híbridas a veces se inyectan modales HTML custom en lugar de los componentes estándar de Atomic UI.
- **Problema:** Los desarrolladores acostumbran hardcodear colores (ej. #1e293b o texto gris) que se rompen (volviéndose invisibles) cuando el usuario activa el Dark Mode global.
- **Lección aprendida:** Cualquier modal proyectado fuera de los componentes empaquetados de Atomic UI debe estar construido utilizando obligatoriamente los tokens semánticos `var(--surface-section)`, `var(--surface-elevated)` y `var(--text-color)`. Queda prohibido el uso de utilitarios de color estáticos, como Tailwind `text-secondary` o hexadecimales fijos, para superficies modales.

### Resolucin de la Grilla Responsiva (Acciones)
- **Doctrina:** Las acciones de la grilla de datos (Data Table) en formato responsivo (mvil/tarjetas) NUNCA deben romper la cuadricula de dos columnas establecida por las celdas de datos. 
- El label "ACCIONES" se debe ubicar en la primera columna (grid-template-columns: 40%) como un texto normal (sin opacidad, sin posiciones absolutas).
- Los iconos (ver, editar, eliminar) deben estar contenidos en la segunda columna (1fr) usando justify-content: center para asegurar alineacin esttica con el resto de la tarjeta.

## [2026-09-25] - Paginación Selects, CSS Flex-Grow y Color de Marca

**Evidencia observada:** Los combos de selección de paginación presentaban problemas de anchos CSS (`flex-grow` desconfigurado) y discrepancias en el diseño usando `app-form-select`.
**Decisión generalizable:** Reemplazar obligatoriamente `app-form-select` por `app-select2` (versión robusta) en los módulos de paginación. Se han fijado los anchos `flex-grow` para evitar desbordamientos y se ha unificado el fondo de la paginación al color de marca `var(--primary-color-light)`.
**Mecanismo preventivo:** Las compuertas de gobernanza y visuales rechazarán componentes de paginación basados en elementos estándar que no apliquen el patrón robusto estipulado.

## [2026-09-25] - Arquitectura y Topología de Proxy

**Evidencia observada:** Ambigüedad en la resolución de peticiones locales del ecosistema Angular (puerto 5007) dirigidas al backend CQRS.
**Decisión generalizable:** Toda llamada hacia `/api/v2/...` en el puerto 5007 será redirigida a través de `proxy.conf.json` hacia el backend central (puerto 7149), como la arquitectura predeterminada de desarrollo.
**Mecanismo preventivo:** Proteger el `proxy.conf.json` de modificaciones aleatorias y asegurar su validación mediante pruebas cruzadas con `endpoints.rest`.

## [2026-09-25] - Autenticación y Credenciales Backend Legacy (Referencia)

**Contexto en el consumidor:** Los consumidores experimentaban `401 CREDENCIALES_INVALIDAS` y `403 Forbidden` al interactuar con el backend `cxc-ventas-back`.
**Lección aprendida:** Los fallos se derivaron de corrupción en variables shell para PBKDF2 y falta de roles legacy en la matriz de permisos de CQRS. El backend debe asegurar que `ObtenerRolesPermisosAsync` use `NombreUsuario` e implemente fallbacks, garantizando que el UI reciba un estado transparente y confiable sin tener que gestionar parches locales para permisos.
