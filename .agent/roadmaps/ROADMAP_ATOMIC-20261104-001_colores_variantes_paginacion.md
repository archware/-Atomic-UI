---
title: "Corrección de algoritmo de páginas visibles, tokens de contraste y diferenciación de variantes en app-pagination y legibilidad secundaria, hover de avatar y tarjeta PDF en Cierres (app-text, app-badge, app-icon-button, dialogs-page)"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-11-04"
last_updated: "2026-11-04"
document_type: "roadmap"
status: "completado"
version: "1.3.0"
change_id: "ATOMIC-20261104-001"
---

# Corrección de algoritmo de páginas visibles, tokens de contraste y diferenciación de variantes en app-pagination y legibilidad secundaria, hover de avatar y tarjeta PDF en Cierres (app-text, app-badge, app-icon-button, dialogs-page)

## Encuadre y decisión

```yaml
asignacion: "ATOMIC-20261104-001"
ruta: "estandar"
justificacion: "Corrección algorítmica de páginas visibles en extremos, mejora cromática/geométrica de las 4 variantes de app-pagination en temas claro y oscuro, corrección de contraste en app-text (color='secondary'), app-badge, botones secundarios, hover de app-icon-button (variant='avatar'), maquetación responsiva del patrón de tarjeta de documento PDF en el Blueprint de Cierres y preservación/restauración de posición de desplazamiento (scroll) en operaciones de tabla y navegación entre rutas sin romper contratos públicos."
objetivo: "Corregir en PaginationComponent la omisión del botón de página 1 y de la última página cuando el rango visible toca los extremos con totalPages > maxVisible, reemplazar el fondo plano --primary-color-light del contenedor y el activo oscuro apagado --brand-primary-600 por tokens semánticos de alto contraste (--pagination-*) en los tres temas (light, dark y brand-dark), dotar de identidad visual diferenciada a las variantes standard, minimal, rounded y cards, corregir en TextComponent (.color-secondary), BadgeComponent, IconButtonComponent (.icon-btn--avatar:hover e .icon-anim-*:hover), _tokens-semantic.css / _tokens-components.css y DialogsPageComponent el contraste de textos/insignias secundarias, la visibilidad del icono de avatar en hover y el reflujo sin recorte horizontal del patrón de fila de documento PDF en la vista de Cierres (/dialogs), y asegurar en LayoutShellComponent, ScrollOverlayComponent, DataTable, CrudDialog, ActionGroupComponent, ActionMenuComponent, ModalContainerComponent, PopupContainerComponent, DatepickerComponent, CrudTableComponent y ShowcaseFormsComponent que las operaciones en tablas o formularios no refresquen ni colapsen la página ni su posición de scroll al inicio y que al navegar entre rutas y volver a una página previa se restaure su posición de scroll."
base:
  repositorio: "C:/Users/cotaha/source/repos/-Atomic-UI"
  rama: "main"
  oid: "b76f432976d6c1e47de57ee4b4be5821a5195dd8"
  estado: "Árbol con trabajo previo de las unidades ATOMIC-20261102-001 a 006 y ATOMIC-20261103-001 a 002 preservado íntegramente."
ficheros_permitidos:
  - "src/styles/themes/_tokens-semantic.css"
  - "src/styles/themes/_tokens-components.css"
  - "scripts/check-theme-contrast.mjs"
  - "dart/atomic_tokens/lib/src/atomic_colores.g.dart"
  - "dart/atomic_tokens/PROCEDENCIA.json"
  - "src/app/shared/ui/molecules/pagination/pagination.component.ts"
  - "src/app/shared/ui/molecules/pagination/pagination.component.css"
  - "src/app/shared/ui/molecules/pagination/pagination.component.spec.ts"
  - "src/app/shared/ui/atoms/text/text.component.ts"
  - "src/app/shared/ui/atoms/text/text.component.html"
  - "src/app/shared/ui/atoms/text/text.component.css"
  - "src/app/shared/ui/atoms/text/text.component.spec.ts"
  - "src/app/shared/ui/atoms/badge/badge.component.ts"
  - "src/app/shared/ui/atoms/badge/badge.component.html"
  - "src/app/shared/ui/atoms/badge/badge.component.css"
  - "src/app/shared/ui/atoms/badge/badge.component.spec.ts"
  - "src/app/shared/ui/atoms/icon-button/icon-button.component.css"
  - "src/app/shared/ui/atoms/icon-button/icon-button.component.spec.ts"
  - "src/app/shared/ui/atoms/avatar/avatar.component.ts"
  - "src/app/shared/ui/atoms/avatar/avatar.component.html"
  - "src/app/shared/ui/atoms/file-input/file-input.component.ts"
  - "src/app/shared/ui/atoms/number-input/number-input.component.ts"
  - "src/app/shared/ui/molecules/action-group/action-group.component.ts"
  - "src/app/shared/ui/molecules/action-menu/action-menu.component.ts"
  - "src/app/shared/ui/molecules/combobox/combobox.component.ts"
  - "src/app/shared/ui/molecules/context-menu/context-menu.component.ts"
  - "src/app/shared/ui/molecules/data-state/data-state.component.ts"
  - "src/app/shared/ui/molecules/datepicker/datepicker.component.ts"
  - "src/app/shared/ui/molecules/modal/modal.component.ts"
  - "src/app/shared/ui/molecules/modal/modal-container.component.ts"
  - "src/app/shared/ui/molecules/popup/popup-container.component.ts"
  - "src/app/shared/ui/organisms/about-dialog/about-dialog.component.spec.ts"
  - "src/app/shared/ui/organisms/chart/chart.component.ts"
  - "src/app/shared/ui/organisms/crud-dialog/crud-dialog.ts"
  - "src/app/shared/ui/organisms/data-table/data-table.html"
  - "src/app/shared/ui/organisms/data-table/data-table.scss"
  - "src/app/shared/ui/organisms/data-table/data-table.spec.ts"
  - "src/app/shared/ui/organisms/footer/footer.component.html"
  - "src/app/shared/ui/organisms/scroll-overlay/scroll-overlay.component.ts"
  - "src/app/shared/ui/organisms/tabs/tabs.component.ts"
  - "src/app/shared/ui/templates/layout-shell/layout-shell.component.html"
  - "src/app/shared/ui/templates/layout-shell/layout-shell.component.ts"
  - "src/app/shared/ui/templates/layout-shell/layout-shell.component.spec.ts"
  - "src/app/shared/ui/templates/pagina-crud/pagina-crud.ts"
  - "src/app/components/ui-showcase/examples/showcase-forms/showcase-forms.component.ts"
  - "src/blueprints/crud-table/crud-table.component.ts"
  - "src/blueprints/dialogs-page/dialogs-page.component.ts"
  - "src/blueprints/dialogs-page/dialogs-page.component.html"
  - "src/blueprints/dialogs-page/dialogs-page.component.css"
  - "src/blueprints/dialogs-page/dialogs-page.component.spec.ts"
  - "src/blueprints/error-pages/error-pages.component.ts"
  - "src/blueprints/error-pages/error-pages.component.spec.ts"
  - "tools/check-angular-signals.cjs"
  - "tools/test-angular-signals.cjs"
  - "tools/check-angular-control-flow.cjs"
  - "tools/test-angular-control-flow.cjs"
  - "catalog/components/pagination.json"
  - "catalog/components/accordion.json"
  - "src/app/shared/ui/organisms/accordion/accordion.component.ts"
  - "src/app/shared/ui/organisms/accordion/accordion.component.html"
  - "src/app/shared/ui/organisms/accordion/accordion.component.css"
  - "src/app/shared/ui/organisms/accordion/accordion-item-component.component.html"
  - "src/app/shared/ui/organisms/accordion/accordion-item.component.css"
  - "src/app/shared/ui/organisms/accordion/accordion-test-host-component.component.html"
  - "src/app/shared/ui/organisms/accordion/accordion.component.spec.ts"
  - "src/app/shared/ui/templates/modelos-crud.ts"
  - "src/app/shared/ui/templates/pagina-crud-accordion/pagina-crud-accordion.ts"
  - "src/app/shared/ui/templates/pagina-crud-accordion/pagina-crud-accordion.html"
  - "src/app/shared/ui/templates/pagina-crud-accordion/pagina-crud-accordion.spec.ts"
  - "src/app/shared/ui/index.ts"
  - "src/app/components/ui-showcase/examples/showcase-navigation/showcase-navigation.component.ts"
  - "src/app/components/ui-showcase/examples/showcase-templates/showcase-templates.component.ts"
  - "src/stories/ui-accordion.stories.ts"
  - "src/stories/ui-accordion-abierto.stories.ts"
  - "src/stories/ui-pagination.stories.ts"
  - "src/stories/ui-about-dialog.stories.ts"
  - "src/stories/Configure.mdx"
  - "README.md"
  - "src/app/shared/ui/README.md"
  - "documentation.json"
  - "distribution/atomic-source-manifest.json"
  - "AGENTS.md"
  - "CHANGELOG.md"
  - "LESSONS_LEARNED.md"
  - "docs/CONTINUIDAD_AGENTES.md"
trabajo_ajeno: "Se preservan intactos los archivos modificados por las unidades previas en el árbol de trabajo."
contratos: "Se mantienen intactos los selectores app-pagination, app-accordion, app-accordion-item, app-text, app-badge, app-icon-button, app-scroll-overlay y app-layout-shell y sus inputs/outputs."
roles: "Agente constructor en ruta estándar bajo supervisión del orquestador padre."
autorizaciones: "Edición en el árbol de trabajo de -Atomic-UI, regeneración de tokens Dart y manifiesto de distribución, y sincronización autorizada hacia ventas-cxc; prohibido ejecutar git commit, git push, git reset o git checkout."
disparadores_escalado: "Cualquier requerimiento que altere la API pública de app-pagination, app-accordion, app-text, app-badge o app-icon-button de forma incompatible o rompa una compuerta de gobernanza."
rollback: "Restaurar los fragmentos editados en pagination, accordion, pagina-crud-accordion, modelos-crud, text, badge, avatar, file-input, number-input, action-group, action-menu, combobox, context-menu, data-state, datepicker, modal, modal-container, popup-container, chart, crud-dialog, data-table, footer, scroll-overlay, tabs, layout-shell, pagina-crud, icon-button, showcase-forms, showcase-navigation, showcase-templates, crud-table, dialogs-page, error-pages, _tokens-semantic.css, _tokens-components.css, check-theme-contrast.mjs, check-angular-signals.cjs, check-angular-control-flow.cjs y stories, ejecutar npm run tokens:dart y regenerar distribution/atomic-source-manifest.json con npm run package:manifest."
```

## Diseño y criterios de aceptación

- [x] **1. Algoritmo `visiblePages()` en `PaginationComponent` (`pagination.component.ts`)**:
  - Eliminar la condición `if (i !== 1 && i !== total)` dentro del bucle `for (let i = start; i <= end; i++)` que omitía la página `1` cuando `start === 1` y la última página `total` cuando `end === total` en escenarios con `totalPages > maxVisible`, provocando que en `[page]="1"` y `[total]="100"` no se renderizara el botón activo `1`.
- [x] **2. Tokens cromáticos y diferenciación de variantes de paginación (`_tokens-components.css`, `pagination.component.css`, `check-theme-contrast.mjs`)**:
  - Sustituir en `.pagination-wrapper` el fondo `var(--primary-color-light)` por `var(--pagination-wrapper-bg)` y `border: 1px solid var(--pagination-wrapper-border)`.
  - Definir la familia `--pagination-*` en `light`, `dark` y `brand-dark` con contraste `>= 4.5:1` auditado en `scripts/check-theme-contrast.mjs` (incluyendo `--pagination-text`/`--pagination-bg`, `--pagination-active-text`/`--pagination-active-bg` y `--pagination-disabled-text`/`--pagination-disabled-bg`, y prefijo `pagination-` en `GOVERNED`).
  - Diferenciar visualmente las 4 variantes: `standard` (botones con borde y acento en navegación), `minimal` (botones de acción realzados e indicador central en píldora), `rounded` (riel en píldora con botones circulares y activo con resplandor) y `cards` (tarjetas táctiles con borde inferior acentuado de `2px` y activo destacado).
- [x] **3. Legibilidad de textos secundarios, insignias, hover de `variant="avatar"` en `app-icon-button`, patrón de tarjeta de documento PDF en Cierres, alineación de versión Angular 22 + Signals y eliminación de sintaxis heredada (`text.component.*`, `badge.component.*`, `avatar.component.*`, `data-state.component.ts`, `footer.component.html`, `file-input.component.ts`, `number-input.component.ts`, `combobox.component.ts`, `context-menu.component.ts`, `modal.component.ts`, `modal-container.component.ts`, `chart.component.ts`, `scroll-overlay.component.ts`, `tabs.component.ts`, `crud-table.component.ts`, `icon-button.component.css`, `dialogs-page.component.*`, `error-pages.component.*`, `check-angular-signals.cjs`, `check-angular-control-flow.cjs`, `_tokens-semantic.css`, `_tokens-components.css`)**:
  - Mapear `.color-secondary` en `TextComponent` (`text.component.css`) a `var(--text-color-secondary)` (`7.56:1` en claro y `11.5:1` en oscuro) en lugar del token de relleno amarillo de marca `var(--secondary-color)` (`#FFB800`, `1.75:1` sobre blanco), eliminando el texto amarillo ilegible en los 28 párrafos descriptivos del Blueprint de Cierres (`dialogs-page.component.html`) y en `wizard-page.component.html`.
  - Modernizar `TextComponent` (`text.component.ts`, `text.component.html`), `BadgeComponent` (`badge.component.ts`, `badge.component.html`), `AvatarComponent` (`avatar.component.ts`, `avatar.component.html`), `DataStateComponent` (`data-state.component.ts`) y `FooterComponent` (`footer.component.html`) retirando `OnInit`, `NgClass` y las directivas estructurales con asterisco `*ngTemplateOutlet` en favor de `ChangeDetectionStrategy.OnPush`, `computed()`, `[class]` nativo y `[ngTemplateOutlet]`.
  - Migrar la totalidad de consultas de vista y contenido con decoradores heredados (`@ViewChild`, `@ViewChildren`, `@ContentChild`, `@ContentChildren`, `QueryList`) a consultas basadas en Signals (`viewChild()`, `viewChildren()`, `contentChild()`, `contentChildren()`) en `crud-table.component.ts`, `number-input.component.ts`, `file-input.component.ts`, `combobox.component.ts`, `context-menu.component.ts`, `data-state.component.ts`, `modal.component.ts`, `modal-container.component.ts`, `chart.component.ts`, `scroll-overlay.component.ts` y `tabs.component.ts`.
  - Proyectar `<ng-content></ng-content>` dentro de `.badge` en `BadgeComponent` (`badge.component.html`) cuando `count() === null && !dot() && !overlay()` (y fuera de `.badge` cuando `overlay()` es verdadero), para que las 17 insignias textuales de `dialogs-page.component.html` muestren su etiqueta en lugar de círculos vacíos.
  - Actualizar `--text-color-on-secondary` a `var(--brand-secondary-950)` (`#422300`, contraste `8.35:1` sobre `#FFB800`), `--secondary-color-text` a `var(--brand-secondary-800)` (`#8a5200`, contraste `6.58:1` sobre `--secondary-color-lighter`), `--secondary-color-lighter` en oscuro a `rgba(255, 184, 0, 0.15)` y `.badge--secondary` / `.badge--warning` a `color: var(--text-color-on-secondary)`, auditando los `20` pares por tema en `scripts/check-theme-contrast.mjs`.
  - En `IconButtonComponent` (`icon-button.component.css`), usar `var(--button-primary-bg, var(--primary-color))` y `var(--brand-primary-700, var(--primary-color-dark))` en el degradado de `.icon-btn--avatar` y `.icon-btn--avatar:hover:not(:disabled)` (preservando contraste `>= 8.98:1` con `--text-color-on-primary` en `light`, `dark` y `brand-dark`), añadir `color: var(--text-color-on-primary)` y `filter: none` a `.icon-btn--avatar:hover:not(:disabled)`, fijar `color: var(--text-color-on-primary)` sobre `::ng-deep i` y `::ng-deep svg` en `.icon-btn--avatar`, y cambiar `color: var(--primary-color)` a `color: currentColor` en `.icon-anim-rotate:hover:not(:disabled) ::ng-deep i.*`, `.icon-anim-grow:hover:not(:disabled) ::ng-deep i.*` y `.icon-anim-none:hover:not(:disabled) ::ng-deep i.*` para que al hacer hover sobre `variant="avatar"` el icono interior conserve el contraste blanco (`--text-color-on-primary`) sobre el degradado morado en todas las variantes de animación y temas.
  - En el Blueprint de Cierres (`dialogs-page.component.ts`, `dialogs-page.component.html`, `dialogs-page.component.css`), actualizar la insignia tecnológica de `app-about-dialog` de `'Angular 19 + Signals'` a `'Angular 22 + Signals'` (así como en `src/stories/ui-about-dialog.stories.ts`, `about-dialog.component.spec.ts`, `documentation.json`, y actualizar todas las apariciones de `Configure.mdx`, `README.md` y `src/app/shared/ui/README.md` a la versión vigente `5.22.0`, `TypeScript 6.0+` y consultas Signal `viewChild.required()`), y estructurar el patrón de tarjeta de documento PDF (`.attached-file-row--pdf-card`) con `background-color: var(--surface-background)` (homologado con `.floating-label`), cabecera `.attached-file-main` (`min-width: 0`, `overflow-wrap: anywhere`) apilada sobre la barra de controles `.file-row-inline-controls` (`width: 100%; align-items: flex-start`, `app-floating-input.pdf-demo-page-input` con `flex: 1 1 0%; min-width: 0; --fi-min-width: 0;` y `app-icon-button[variant="close-ghost"]` con `flex-shrink: 0; margin-top: var(--space-3)`), añadir `min-width: 0` a `.variant-tile`, `.tile-stage`, `.showcase-group` y `.attached-files-box`, y dotar a la grilla de la Sección 4 de `.catalog-grid--showcase` (`minmax(min(100%, 26rem), 1fr)`), evitando el recorte horizontal dentro de `<app-scroll-overlay [disableHorizontal]="true">` en contenedores estrechos.
  - En `ErrorPagesComponent` (`src/blueprints/error-pages/error-pages.component.ts`, `error-pages.component.spec.ts`), migrar los 9 decoradores heredados `@Input()` a Signals (`input()`, `computed()`) con `ChangeDetectionStrategy.OnPush`, unidades relativas `rem`, inyección opcional de `Router`/`ActivatedRoute` y fallback a `ERROR_DEFAULTS[code]` cuando los controles de texto reciben cadena vacía `""`, y endurecer `tools/check-angular-signals.cjs` (raíz `../src`, prohibición de `Input`, `Output`, `EventEmitter`, `ViewChild`, `ViewChildren`, `ContentChild`, `ContentChildren`) y `tools/check-angular-control-flow.cjs` (prohibición de `*ngIf`, `*ngFor`, `*ngSwitch`, `*ngTemplateOutlet`, `CommonModule`, `NgClass`, `NgStyle`, `NgIf`, `NgFor`, `NgSwitch`, `NgSwitchCase`, `NgSwitchDefault`).
- [x] **4. Preservación y restauración de scroll en operaciones y navegación entre rutas (`scroll-overlay.component.ts`, `layout-shell.component.*`, `data-table.html`, `data-table.scss`, `data-table.spec.ts`, `crud-dialog.ts`, `action-group.component.ts`, `action-menu.component.ts`, `modal-container.component.ts`, `popup-container.component.ts`, `datepicker.component.ts`, `pagina-crud.ts`, `crud-table.component.ts`, `showcase-forms.component.ts`)**:
  - Añadir `getScrollElement()`, `getScrollPosition()` y `setScrollPosition()` en `ScrollOverlayComponent`, y persistir/restaurar por ruta la posición `{ top, left }` del contenedor `.so-scroll-area` en `LayoutShellComponent` (`ROUTE_SCROLL_POSITIONS` + `sessionStorage` `'atomic-ui:layout-scroll:v1'`, `LayoutShellComponent.clearSavedScrollPositions()`), soportando tanto instancias persistentes (`<router-outlet>` dentro de `<app-layout-shell>`) como instancias recreadas por ruta (`ngAfterViewInit`) con `ResizeObserver` / `MutationObserver` para contenido diferido (`@defer`, carga asíncrona de tablas) y cancelación inmediata ante interacción manual del usuario.
  - Preservar en `DataTable` (`data-table.html`, `data-table.scss`) las filas renderizadas (`@for (row of displayedRows(); ...)`) cuando `effectiveStatus() === 'loading' && displayedRows().length > 0` (anunciando `loadingMessage()` vía `.visually-hidden[role="status"]`), evitando que una recarga tras crear/editar/cambiar estado destruya el `<tbody>` y colapse la altura de la tabla y el `scrollTop` a `0`.
  - Capturar y restaurar los desplazamientos externos (`.so-scroll-area` fuera del `<dialog>`) en `CrudDialog` alrededor de `showModal()`, `close()` y `handleClosed()`, aplicar `{ preventScroll: true }` en todas las llamadas `.focus({ preventScroll: true })` de `ActionGroupComponent`, `ActionMenuComponent`, `ModalContainerComponent`, `PopupContainerComponent` y `DatepickerComponent` (cerrando el menú flotante antes de emitir `actionClick` para no pisar el foco del diálogo), preservar `paginaActual`, `tamanoActual` y `busquedaActual` en `CrudTableComponent`, y prevenir el envío nativo de formulario en `ShowcaseFormsComponent`.
- [x] **5. Variante exclusiva (`variant="single"`) y mejoras de `app-accordion` y `app-pagina-crud-accordion` (`accordion.component.*`, `accordion-item*`, `pagina-crud-accordion.*`, `modelos-crud.ts`, `catalog/components/accordion.json`, `showcase-navigation.component.ts`, `showcase-templates.component.ts`, `ui-accordion*.stories.ts`)**:
  - Incorporar y exportar `AccordionVariant = 'default' | 'multiple' | 'single' | 'flush'`, `variant = input<AccordionVariant>('default')` y `collapsible = input(true)` en `AccordionComponent`, además de `icon = input('')` en `AccordionItemComponent`.
  - Sincronizar el estado inicial `[open]` en `AccordionItemComponent.ngOnInit()` antes de `register(this)` y mantener `this.items` ordenado según la posición real en el DOM (`compareDocumentPosition`) para que en modo `single` se conserve abierto el primer panel del DOM incluso cuando existen bloques condicionales `@if`/`@for`, notificar aperturas reactivas mediante `notifyItemOpened(this)` y garantizar con `asegurarAlMenosUnoAbierto()` que cuando `[collapsible]="false"` en modo `single` permanezca siempre al menos un panel habilitado abierto incluso tras destruir el panel activo.
  - Exponer `varianteAccordion`, `soloUnoAbierto` y `colapsable` en `PaginaCrudAccordion` y `icono`/`deshabilitada` en `EntidadAccordion`, catalogar `app-accordion` en `catalog/components/accordion.json` y actualizar el Showcase y Storybook.
- [x] **6. Pruebas, catálogo y propagación**:
  - Ejecutar en `ChromeHeadless` las suites afectadas (`134/134` pruebas en las 4 suites de scroll/tabla/diálogo/acciones y `22/22` en `accordion` + `pagina-crud-accordion` en `-Atomic-UI`, y `216/216` + `16/16` pruebas Vitest en las suites sincronizadas de `ventas-cxc`).
  - Actualizar `catalog/components/pagination.json` y `catalog/components/accordion.json`, regenerar `documentation.json`, `dart/atomic_tokens` (`440` colores por tema) y `distribution/atomic-source-manifest.json` (`340` fuentes, SHA-256 `6dc93cdeb4f891e3e72349c4390acccc055a854d33d30b477bf557a8cc506900`), superar las compuertas de `-Atomic-UI` y sincronizar hacia `ventas-cxc`.
