---
title: "Continuidad para agentes de Atomic UI"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-08-23"
last_updated: "2026-11-04"
document_type: "manual de continuidad"
status: "vigente"
version: "1.6.1"
change_id: "ATOMIC-20261104-001"
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
1. **Medidas rígidas:** `[x]` sustituidas por tokens o `rem` en `src/app/shared/ui/` y `src/styles/themes/_utilities.css`, gobernadas por `check:units` y `test:units-gate` (106 hojas auditadas, 0 medidas `px` rígidas prohibidas).
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

### 1. Unidades ATOMIC-20261104-001, ATOMIC-20261103-002 y ATOMIC-20261103-001 — variantes y contraste de Paginación, legibilidad secundaria, hover de avatar y tarjeta PDF en Cierres, alineación a `Angular 22 + Signals`, Tooltips, Loaders y organismo `app-about-dialog`

En [`ROADMAP_ATOMIC-20261104-001_colores_variantes_paginacion.md`](../.agent/roadmaps/ROADMAP_ATOMIC-20261104-001_colores_variantes_paginacion.md) se corrige en `PaginationComponent.visiblePages()` la condición `if (i !== 1 && i !== total)` que omitía la página `1` cuando `start === 1` y la última página `total` cuando `end === total` con `totalPages > maxVisible` (impidiendo que se renderizara el botón `.page-btn.active` en `[page]="1"` con `[total]="100"`), se sustituye en `.pagination-wrapper` el fondo `--primary-color-light` por `--pagination-wrapper-bg` (`var(--surface-section)`) con borde `--pagination-wrapper-border`, se define la familia `--pagination-*` en `light`, `dark` (`--pagination-active-bg: var(--brand-primary-A700)`, contraste `7.11:1`) y `brand-dark`, se diferencian visualmente las 4 variantes (`standard`, `minimal` con insignia central en píldora, `rounded` con riel en píldora y `cards` con borde inferior acentuado de `2px`), y se corrige en `TextComponent` (`.color-secondary` -> `var(--text-color-secondary)`, `ChangeDetectionStrategy.OnPush`, `renderAs` y `classes` con `computed()`, `[class]="classes()"` y `[ngTemplateOutlet]="content"` sin `NgClass` ni `*ngTemplateOutlet`), `BadgeComponent` y `AvatarComponent` (proyección de `<ng-content>` en modo standalone, `color: var(--text-color-on-secondary)` y `[class]` nativo sin `NgClass`), `DataStateComponent` y `FooterComponent` (sustitución de las 14 directivas `*ngTemplateOutlet` por `[ngTemplateOutlet]` y `[ngTemplateOutletContext]`), la migración íntegra de `@ViewChild`/`@ViewChildren`/`@ContentChild`/`@ContentChildren`/`QueryList` a `viewChild()`/`viewChildren()`/`contentChild()`/`contentChildren()` en `crud-table`, `number-input`, `file-input`, `combobox`, `context-menu`, `data-state`, `modal`, `modal-container`, `chart`, `scroll-overlay` y `tabs`, `IconButtonComponent` (gradiente `--button-primary-bg` / `--brand-primary-700`, `color: var(--text-color-on-primary)`, `filter: none` y `color: currentColor` en `.icon-anim-*:hover:not(:disabled) ::ng-deep i.*`), `DialogsPageComponent` (actualización de `'Angular 19 + Signals'` a `'Angular 22 + Signals'` junto con `ui-about-dialog.stories.ts`, `about-dialog.component.spec.ts` y `documentation.json`, actualización completa de `Configure.mdx`, `README.md` y `src/app/shared/ui/README.md` a `5.22.0` / `TypeScript 6.0+` / `viewChild.required()`, fondo `--surface-background` homologado con `.floating-label`, apilado responsivo `.attached-file-main` + `.file-row-inline-controls` con `align-items: flex-start` en `.attached-file-row--pdf-card`, `min-width: 0` en ancestros y grilla `.catalog-grid--showcase`), `ErrorPagesComponent` (migración de los 9 `@Input()` a Signals `input()` + `computed()` + `OnPush`, inyección opcional de `Router`/`ActivatedRoute`, fallback ante cadenas vacías `""` y suite `error-pages.component.spec.ts`) y el endurecimiento de `tools/check-angular-signals.cjs` y `tools/check-angular-control-flow.cjs`, además de la persistencia y restauración de scroll por ruta en `LayoutShellComponent` y `ScrollOverlayComponent`, la conservación de filas en `DataTable` durante recargas (`effectiveStatus() === 'loading' && displayedRows().length > 0`, anunciando `loadingMessage()` vía `.visually-hidden[role="status"]`), la protección de desplazamiento externo en `CrudDialog`, `ActionGroupComponent`, `ActionMenuComponent`, `ModalContainerComponent`, `PopupContainerComponent`, `DatepickerComponent`, `CrudTableComponent` y `ShowcaseFormsComponent`, y la variante de selección única (`variant="single"`, `AccordionVariant`, `collapsible`, `icon` y ordenación DOM en `AccordionComponent`/`AccordionItemComponent`, passthrough `varianteAccordion`/`soloUnoAbierto`/`colapsable`/`icono`/`deshabilitada` en `PaginaCrudAccordion` y `catalog/components/accordion.json`), auditando `20` pares por tema en `scripts/check-theme-contrast.mjs` y superando `134/134` pruebas Karma en las suites de scroll/tabla/diálogo/acciones y `22/22` en `accordion` + `pagina-crud-accordion` de `-Atomic-UI`, y `216/216` + `16/16` pruebas Vitest en las suites sincronizadas de `ventas-cxc`. En [`ROADMAP_ATOMIC-20261103-002_tooltips_y_loaders.md`](../.agent/roadmaps/ROADMAP_ATOMIC-20261103-002_tooltips_y_loaders.md) se corrige el posicionamiento desplazado y el contraste de los tooltips en tema oscuro (`TooltipDirective.resolveTriggerRect()`, `.tooltip-host:not(.atomic-button--full-width) { width: fit-content; }`, tokens `--tooltip-*`) y la progresión de tamaños (`sm` < `md` < `lg`) y altura uniforme de las 6 variantes de `<app-loader>`. En `ATOMIC-20261103-001` ([`ROADMAP_ATOMIC-20261103-001_about_dialog.md`](../.agent/roadmaps/ROADMAP_ATOMIC-20261103-001_about_dialog.md)) se incorpora el organismo `<app-about-dialog>` (`modal`, `popup`, `card`). Se actualizan `dart/atomic_tokens` (`440` colores por tema) y `distribution/atomic-source-manifest.json` (`340` fuentes, SHA-256 `6dc93cdeb4f891e3e72349c4390acccc055a854d33d30b477bf557a8cc506900`) y se sincronizan las fuentes modificadas hacia `ventas-cxc`.

### 2. Unidad ATOMIC-20261102-006 — apertura tras render y retorno estable de foco

`FormDialog` abre declarativamente mediante `afterRenderEffect`, después de renderizar los controles proyectados. El host real conserva 500 en modelo y DOM tras partir de 0, recibir foco, desenfocarse y reabrirse; el campo independiente 35 permanece intacto. El ensayo con `effect` falla por restitución a 0. `InputComponent` y su CVA se conservan.

`resolverFocoRetorno` añade un callback opcional a `CrudDialog`, `FormDialog`, `ModalComponent` y `PaginaCrud`. El destino válido tiene prioridad sobre el origen y se comprueba con `activeElement`; los destinos desconectados, ocultos, deshabilitados o no enfocables se descartan sin alterar su `tabindex`. El cierre continúa ante un callback fallido. La restauración se invalida al reabrir o destruir y no roba foco a otra ventana. `PaginaCrud.obtenerDestinoFocoRetorno()` expone el host estable como región nombrada por `titulo`, con `tabindex=-1`, y transmite el callback a ambos diálogos. Modal conserva su cierre por destrucción sin emitir un éxito adicional.

Las cuatro historias documentan la apertura y la retirada del origen con datos sintéticos. La corrida histórica anterior pasó 800/800 casos en ChromeHeadless; catálogo, API, foco y lint terminan con código cero. Los resultados de construcción, negativas aisladas, revisión y límites se registran en el [roadmap](../.agent/roadmaps/ROADMAP_ATOMIC-20261102-006_restauracion_foco.md). El rollback corresponde al parche inverso exclusivo del delta propio sobre las copias previas. La publicación permanece congelada, sin cambios de versión, dependencia, `atomicRef` ni adopción del consumidor actual.

Acreditación complementaria del 2026-11-03: el orquestador repitió las familias de carrera, callback y generación en `negativas-atomic-responsable`, con códigos limpio/detección/restaurado `0/1/0`. El constructor verificó los originales y la igualdad de las siete categorías —archivos, dependencias, configuración, herramientas, comando, alcance y entorno— antes y después de cada fase y entre limpio y restaurado. Cierre de cobertura del 2026-11-03: se añade un único caso persistente en `modal.component.spec.ts` para candidato con `aria-disabled="true"`, obteniendo `34/34` casos de Modal y `801/801` en la suite completa de ese corte.

### 3. Unidad ATOMIC-20261102-005 — geometría, trazo y contraste de etiquetas flotantes y consistencia de tokens en controles de formulario

Se corrige el solapamiento entre las etiquetas flotantes (`floating` y `floating-value`) y el contenido o botones internos en `number-input`, `tag-input`, `select2`, `combobox`, `dropdown`, `datepicker`, `input`, `select`, `textarea`, `floating-input` y `floating-textarea`, se refuerza el peso de la etiqueta elevada a `700` (`--font-weight-title`) con tamaño `0.8125rem` (`13px`), sangría `0 var(--space-1)` (`4px`), ancho útil `calc(100% - var(--field-label-inset) - var(--space-1))` (`100% - 16px`, y `calc(100% - var(--space-7) - var(--field-label-inset))` con icono derecho) y contraste en reposo `--field-label-color-resting: var(--text-color-secondary)` (`7.56:1` en claro y `11.9:1` en oscuro, registrado en `check-theme-contrast.mjs`), y se homologan los tokens `--input-*`, `--field-label-*` y la sangría horizontal `var(--space-4)` (`16px`). En `floating-input` y `floating-textarea`, las variantes `underline` y `material` unifican el color de la etiqueta elevada en `--field-label-color-floated` (eliminando el color morado `--primary-color` discrepante), preservan `--input-disabled-text` cuando están deshabilitadas con valor, suprimen el botón enfocable vacío en `clearable` sin valor y `::-webkit-search-cancel-button` en `type="search"`, y unifican su sangría en `16px` y su posición vertical en `top: var(--space-1)` (`4px` dentro de la caja). En `number-input` (`46px`), `tag-input` (`46px` centrado en vacío y `.tag-input--has-tags` con chips) y `datepicker` se suprime el doble borde interno `:focus-visible` (`box-shadow: none`) y se acotan las transiciones de superficie a `border-color, box-shadow`. Además, `select2`, `floating-input` y `floating-textarea` ajustan su `:host` a `fit-content` cuando reciben `[width]` fijo sin `%` (alineándose en fila dentro de barras `flex-wrap: wrap`), `Select2Component` ignora opciones centinela vacías (`value: null` o `""`) para no elevar la etiqueta en reposo y conserva `pendingValue` en cambios simultáneos de `[options]` + `[ngModel]`, y `PaginaCrud`, `ShowcaseFormsComponent` y `ShowcaseTemplatesComponent` conectan de punta a punta la búsqueda en cascada (`select` y `texto`, iniciando con un único selector `Buscar por` en valor `null` y marcador `Seleccionar...`, desplegando el segundo control al elegir criterio e instanciando el subfiltro con `@for (...; track tipo)`). Consultar el [roadmap](../.agent/roadmaps/ROADMAP_ATOMIC-20261102-005_mejoras_etiquetas_inputs.md).
