---
title: "Mejora geométrica y consistencia de tokens en etiquetas flotantes de controles de formulario"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-11-02"
last_updated: "2026-11-03"
document_type: "roadmap"
status: "completado"
version: "1.1.0"
change_id: "ATOMIC-20261102-005"
---

# Mejora geométrica y consistencia de tokens en etiquetas flotantes de controles de formulario

## Encuadre y decisión

```yaml
asignacion: "ATOMIC-20261102-005"
ruta: "estandar"
justificacion: "Ajuste visual, geométrico y de tokens CSS en controles de formulario de Atomic UI sin cambio de contratos públicos, esquemas de datos ni dependencias."
objetivo: "Eliminar el solapamiento entre etiquetas flotantes y el contenido o botones internos en number-input, tag-input, select2, combobox, dropdown, select, textarea y floating-textarea, reforzar el grosor (700), tamaño (0.8125rem / 13px) y contraste en reposo (--field-label-color-resting) de las etiquetas flotantes, suprimir el doble borde de foco interno (:focus-visible) en tag-input/number-input y evitar el truncado prematuro horizontal."
base:
  repositorio: "C:/Users/cotaha/source/repos/-Atomic-UI"
  rama: "main"
  oid: "7633d4c81384cfda10d6e7108750870ca44b8dc0"
  estado: "Árbol con trabajo previo de las unidades ATOMIC-20261102-001 a 006 preservado íntegramente."
ficheros_permitidos:
  - "src/styles/themes/_tokens-primitives.css"
  - "src/styles/themes/_tokens-components.css"
  - "scripts/check-theme-contrast.mjs"
  - "dart/atomic_tokens/PROCEDENCIA.json"
  - "src/app/shared/ui/atoms/form-field/field-label.css"
  - "src/app/shared/ui/atoms/number-input/number-input.component.html"
  - "src/app/shared/ui/atoms/number-input/number-input.component.css"
  - "src/app/shared/ui/atoms/number-input/number-input-variant.spec.ts"
  - "src/app/shared/ui/molecules/tag-input/tag-input.component.ts"
  - "src/app/shared/ui/molecules/tag-input/tag-input.component.css"
  - "src/app/shared/ui/molecules/tag-input/tag-input-variant.spec.ts"
  - "src/app/shared/ui/molecules/select2/select2.component.ts"
  - "src/app/shared/ui/molecules/select2/select2.component.html"
  - "src/app/shared/ui/molecules/select2/select2.component.css"
  - "src/app/shared/ui/molecules/select2/select2-variant.spec.ts"
  - "src/app/shared/ui/molecules/combobox/combobox.component.ts"
  - "src/app/shared/ui/molecules/combobox/combobox.component.css"
  - "src/app/shared/ui/molecules/combobox/combobox-variant.spec.ts"
  - "src/app/shared/ui/molecules/dropdown/dropdown.component.ts"
  - "src/app/shared/ui/molecules/dropdown/dropdown.component.css"
  - "src/app/shared/ui/molecules/datepicker/datepicker.component.html"
  - "src/app/shared/ui/molecules/datepicker/datepicker.component.css"
  - "src/app/shared/ui/molecules/datepicker/datepicker-variant.spec.ts"
  - "src/app/shared/ui/atoms/input/input.component.html"
  - "src/app/shared/ui/atoms/input/input.component.css"
  - "src/app/shared/ui/atoms/select/select.component.html"
  - "src/app/shared/ui/atoms/select/select.component.css"
  - "src/app/shared/ui/atoms/textarea/textarea.component.html"
  - "src/app/shared/ui/atoms/textarea/textarea.component.css"
  - "src/app/shared/ui/atoms/floating-input/floating-input.component.ts"
  - "src/app/shared/ui/atoms/floating-input/floating-input.component.html"
  - "src/app/shared/ui/atoms/floating-input/floating-input.component.css"
  - "src/app/shared/ui/atoms/floating-input/floating-input-variant.spec.ts"
  - "src/app/shared/ui/atoms/floating-textarea/floating-textarea.component.ts"
  - "src/app/shared/ui/atoms/floating-textarea/floating-textarea.component.html"
  - "src/app/shared/ui/atoms/floating-textarea/floating-textarea.component.css"
  - "src/app/shared/ui/atoms/floating-textarea/floating-textarea.component.spec.ts"
  - "src/app/shared/ui/atoms/radio/radio.component.css"
  - "src/app/shared/ui/atoms/toggle/toggle.component.css"
  - "src/app/shared/ui/templates/pagina-crud/pagina-crud.ts"
  - "src/app/shared/ui/templates/pagina-crud/pagina-crud.html"
  - "src/app/shared/ui/templates/pagina-crud/pagina-crud.scss"
  - "src/app/shared/ui/templates/pagina-crud/pagina-crud.spec.ts"
  - "src/app/components/ui-showcase/examples/showcase-forms/showcase-forms.component.ts"
  - "src/app/components/ui-showcase/examples/showcase-forms/showcase-forms.component.spec.ts"
  - "src/app/components/ui-showcase/examples/showcase-templates/showcase-templates.component.ts"
  - "src/app/components/ui-showcase/examples/showcase-templates/showcase-templates.component.spec.ts"
  - "catalog/components/input.json"
  - "catalog/components/number-input.json"
  - "catalog/components/tag-input.json"
  - "catalog/components/combobox.json"
  - "catalog/components/dropdown.json"
  - "catalog/components/floating-input.json"
  - "catalog/components/floating-textarea.json"
  - "catalog/components/datepicker.json"
  - "catalog/components/form-select.json"
  - "catalog/components/select2.json"
  - "catalog/components/textarea.json"
  - "catalog/components/radio.json"
  - "catalog/components/pagina-crud.json"
  - "distribution/atomic-source-manifest.json"
  - "CHANGELOG.md"
  - "LESSONS_LEARNED.md"
  - "docs/CONTINUIDAD_AGENTES.md"
  - "docs/BITACORA_CONTINUIDAD_CORTES_HISTORICOS.md"
trabajo_ajeno: "Se preservan intactos los archivos modificados por las unidades 001 a 006 en el árbol de trabajo."
contratos: "Se mantienen inalterados los selectores, @Input(), @Output() y firmas de ControlValueAccessor de todos los componentes."
roles: "Agente constructor en ruta estándar bajo supervisión del orquestador padre."
autorizaciones: "Edición en el árbol de trabajo de -Atomic-UI y regeneración del manifiesto de distribución; prohibido ejecutar git commit, git push, git reset o git checkout."
disparadores_escalado: "Cualquier requerimiento que altere la API pública de un componente o rompa una compuerta de gobernanza."
rollback: "Restaurar los fragmentos editados en los componentes de formulario y temas, ejecutar npm run tokens:dart y regenerar distribution/atomic-source-manifest.json con npm run package:manifest."
```

## Diseño y aceptación

La etiqueta flotante compartida (`.fl-label--floating.fl-label--floated`) se posiciona en `top: 0; transform: translateY(-50%)` con tamaño `var(--field-label-floated-font-size)` (`0.8125rem` = `13px`), peso `var(--field-label-floated-font-weight)` (`var(--font-weight-title)` = `700`), altura de línea `var(--field-label-line-height)` (`1.25`), relleno horizontal `var(--field-label-padding)` (`0 var(--space-1)` = `0 4px`) y radio `var(--radius-sm)`, proyectando `0.5078rem` (`8.125px`) hacia el interior de `.fl-control` sobre un parche redondeado `background: var(--input-bg)`. En reposo, `.fl-label--floating` y `.floating-label` consumen `--field-label-color-resting: var(--text-color-secondary)` (contraste `7.56:1` en tema claro y `11.9:1` en tema oscuro, frente al `2.54:1` previo de `--input-placeholder`), registrado en `scripts/check-theme-contrast.mjs`.

1. **`app-number-input`**:
   - `.number-input__control` conserva su altura canónica `height: var(--control-height); min-height: var(--control-height)` (`2.875rem` = `46px`) en todos los modos de etiqueta, con `box-sizing: border-box`, `padding: var(--space-1) var(--space-2)`, `gap: var(--space-1)` y los tokens canónicos `--input-border`, `--input-shadow`, `--input-border-hover`, `--input-shadow-hover`, `--input-border-focus`, `--input-shadow-focus` y estado `.number-input--error`.
   - Los botones `.number-input__btn` se dimensionan como botones internos redondeados centrados verticalmente (`width: var(--control-height-xs); height: var(--control-height-xs)` = `1.5rem` = `24px`, `border-radius: var(--radius-sm)`) sin divisores verticales de altura completa que fueran cortados por el parche de la etiqueta flotante. Con `24px` de alto centrados en una caja de `46px` (`11px` desde el borde superior y `11px` desde el inferior), queda una franja limpia de `2.875px` (`11px - 8.125px`) bajo `.fl-label--floated` sin inflar ni descentrar el control.
   - `.number-input__field`, `.number-input__field:focus, .number-input__field:focus-visible` y `.number-input__btn:focus-visible` declaran `box-shadow: none;` para suprimir el anillo global `:focus-visible` (`--focus-ring`) dentro de `.number-input__control`.
   - El estado `.number-input__btn:hover:not(:disabled)` usa `background: var(--primary-color); color: var(--text-color-on-primary)` (eliminando el respaldo `var(--surface-hover, var(--primary-color))` que pintaba texto blanco sobre gris claro `#F3F4F6`).
2. **`app-tag-input`**:
   - `.tag-input-wrapper` incorpora `.fl-field`, `[class.tag-input--elevated]="elevada()"`, `[class.tag-input--has-tags]="tags().length > 0"` y `[class.tag-input--error]="error()"`.
   - `.tag-input__field` aplica `padding: var(--space-2) var(--space-4)` (`8px 16px`), alineando horizontalmente el texto del input y del marcador (`16px`) con el texto de la etiqueta flotante (`12px + 4px = 16px`). Cuando el control está enfocado en vacío (`tags().length === 0`), `.tag-input__input` permanece centrado verticalmente (`13px` desde arriba y desde abajo, con `3.875px` de holgura bajo `.fl-label--floated`). Cuando existen chips (`.fl-field--floating.tag-input--elevated.tag-input--has-tags .tag-input__field`), el relleno superior sube a `var(--space-4)` (`1rem`) con `padding-bottom: var(--space-2)`, dejando `8.875px` de holgura visual limpia entre la etiqueta flotante y la primera fila de chips.
   - `.tag-input__input` define `padding: 0; line-height: var(--field-label-line-height); box-shadow: none;` y `.tag-input__input:focus, .tag-input__input:focus-visible` fija `border: none; outline: none; box-shadow: none;`, eliminando el segundo borde interior alrededor de `Agregar etiqueta…` cuando el control recibe foco y manteniendo fija la altura de `46px` (`--control-height`) en vacío.
   - Se homologan los tokens `--input-border`, `--input-shadow`, `--input-border-hover`, `--input-shadow-hover` y estado de error.
3. **Generalización al resto de controles de formulario (`field-label.css`, `input`, `select`, `select2`, `combobox`, `dropdown`, `datepicker`, `textarea`, `floating-input`, `floating-textarea`, `radio`, `toggle`)**:
   - En `_tokens-primitives.css`, `--field-label-floated-font-weight` sube a `var(--font-weight-title)` (`700`), `--field-label-floated-font-size` sube a `0.8125rem` (`13px`) y `--field-label-padding` se ajusta a `0 var(--space-1)` (`0 4px`). En `field-label.css`, `floating-input` y `floating-textarea`, el `max-width` base de la etiqueta flotante se amplía a `calc(100% - var(--field-label-inset) - var(--space-1))` (`100% - 16px`), recuperando `8px` adicionales de capacidad horizontal, y la sangría izquierda del texto del control se unifica en `var(--space-4)` (`16px`) en `tag-input`, `combobox`, `select2`, `dropdown`, `floating-input` y `floating-textarea` (igual que `input`, `select` y `textarea`).
   - En `_tokens-components.css`, los tres temas (`light`, `dark`, `brand-dark`) declaran `--field-label-color-resting: var(--text-color-secondary)`, consumido por `.fl-label--floating` (`field-label.css`) y `.floating-label` (`floating-input.component.css`, `floating-textarea.component.css`).
   - En `floating-input` y `floating-textarea`, las variantes `.variant-underline` y `.variant-material` unifican el color de su etiqueta elevada/enfocada en `var(--field-label-color-floated)` (sustituyendo el morado `var(--primary-color)` que discrepaba de la línea azul `--info-color` y del resto de variantes), su sangría horizontal en `left: var(--field-label-inset); padding: var(--field-label-padding)` + `padding-left/right: var(--space-4)` en el control, y su posición vertical elevada en `top: var(--space-1)` (`4px` dentro de la caja en vez de `-4px` fuera). Además, `.disabled .floating-label, .disabled.focused .floating-label, .disabled.has-value .floating-label` garantiza que el estado deshabilitado (`var(--input-disabled-text)`) prevalezca en las cuatro variantes flotantes (`floating`, `outline`, `underline`, `material`), se condiciona el botón de limpieza a `clearable() && hasValue()` para no dejar un `<button tabindex="0">` vacío en el orden de tabulación cuando el campo está vacío, y se suprime `.floating-input::-webkit-search-cancel-button` para evitar una segunda `X` nativa junto al botón Atomic en `type="search"`. En `textarea.component.css`, `.variant-material` homologa igualmente `border-bottom-color: var(--input-border-focus)` y `.textarea-line { background: var(--info-color) }`.
   - En `field-label.css`, `.fl-label.fl-label--disabled` y `.fl-label.fl-label--error` aplican `--input-disabled-text` y `--field-label-color-error` también a las etiquetas superiores (`variant="standard"`), enlazando dichas clases en `input`, `select`, `textarea`, `datepicker`, `floating-input` y `floating-textarea`.
   - En `select`, `combobox`, `floating-input` y `floating-textarea` con icono derecho, el límite `max-width` de la etiqueta flotante en reposo se unifica en `calc(100% - var(--space-7) - var(--field-label-inset))` (igual que `select2` y `dropdown`); en `ShowcaseFormsComponent`, `.input-variants-grid` usa `minmax(215px, 1fr)`, conservando la grilla de `4` columnas × `2` filas en escritorio (`1440px`) sin truncar ninguna etiqueta.
   - En `select2`, `dropdown`, `floating-input` y `floating-textarea`, las transiciones de caja se acotan a `border-color` y `box-shadow` (y en `.floating-label` a `top, transform, color, font-size`) en lugar de `transition: all`, evitando retardos de `background-color` al deshabilitar o cambiar de tema; además se incluye `:focus` y `:focus-visible` en `textarea`, `combobox`, `select2`, `dropdown`, `datepicker`, `floating-input` y `floating-textarea`.
4. **Dimensionamiento por `[width]` en contenedores flex y variantes de búsqueda en cascada (`select2`, `floating-input`, `floating-textarea`, `pagina-crud`, `showcase-forms`, `showcase-templates`)**:
   - `Select2Component`, `FloatingInputComponent` y `FloatingTextareaComponent` exponen `tieneAnchoFijo` (`width().trim().length > 0 && !width().trim().includes('%')`) y enlazan `[class.has-custom-width]="tieneAnchoFijo()"` sobre su wrapper interno, aplicando `:host:has(> .*-wrapper.has-custom-width) { width: fit-content; max-width: 100%; }` y respetando `--select2-width` / `--floating-input-width` / `--floating-textarea-width` como prioridad frente al `min-width` por defecto. De este modo, controles con `width="180px"` o `width="200px"` dentro de barras `display: flex; flex-wrap: wrap` se alinean en la misma fila horizontal sin romper anchos porcentuales (`width="25%"`) ni expresiones `calc(100% - 2rem)`.
   - En `Select2Component`, las opciones centinela vacías (`value === null || value === ''`, como `{ label: 'Seleccionar...', value: null }` en los selectores de `PaginaCrud` y `ShowcaseFormsComponent`) restablecen `selectedOption` a `null` al seleccionarse o recibirse por `writeValue`, evitando que la etiqueta flotante se eleve mostrando `"Seleccionar..."` como valor activo, y `writeValue` conserva `pendingValue` cuando `[options]` y `[ngModel]` cambian en el mismo ciclo de plantilla.
   - En `PaginaCrud`, cuando `opcionesBusqueda` tiene elementos y se omite `[tipoBusqueda]` (o se pasa `null`), `tipoBusquedaInterno` inicia en `null` y `opcionesBusquedaParaSelect` antepone `{ label: 'Seleccionar...', value: null }` con el marcador por defecto `'Seleccionar...'`, mostrando inicialmente un único selector (`Buscar por`); el segundo control dependiente (`<app-select2>` o `<app-input>`) solo aparece cuando el usuario elige un criterio de búsqueda y vuelve a ocultarse al elegir `Seleccionar...` (emitiendo `alCambiarTipoBusqueda(null)` y limpiando la búsqueda, incluido el restablecimiento externo de `[tipoBusqueda]` o `[opcionesBusqueda]`). Asimismo, el control secundario se instancia por clave `@for (tipo of ...; track tipo)` para evitar carreras de microtarea de `NgModel` al alternar entre dos criterios del mismo tipo. `.pagina-crud__filtros-cascada` incorpora `flex-wrap: wrap` con `.pagina-crud__filtro-control { width: 15rem; max-width: 100%; }`. En `ShowcaseFormsComponent` (`Variante de Búsqueda`: `1. Buscador Simple` y `2. Búsqueda en Cascada`) y `ShowcaseTemplatesComponent` (`Búsqueda en Cascada (Pagina CRUD)`), el filtro en cascada inicia igualmente con un solo selector (`Buscar por` con marcador `Seleccionar...` y valor inicial `null`), despliega el segundo control únicamente tras seleccionar un criterio (`Estado`, `Categoría` o `Nombre`) y filtra los resultados en vivo.

| Criterio | Comando o comprobación observable | Resultado esperado | Entradas, dependencias y entorno | Invalidación |
|---|---|---|---|---|
| Gobernanza y tokens | `npm run governance:check` (compuertas `check:field-labels`, `units`, `typography`, `contrast`, `catalog`, `package`, `tokens:dart:check`, `external-styles`, `signals`, `control-flow`, `focus`) | Salida 0 en las 24 compuertas (`18` hojas de controles en `check:field-labels` con `0/0` medidas a mano; `12` pares por tema en `check:contrast`) | Hojas CSS/TS de controles, temas, catálogo y manifiesto | Cualquier edición posterior en `src/` o `catalog/` |
| Lint | `npm run lint` | Salida 0 sin errores ni advertencias | Árbol fuente TypeScript y plantillas HTML | Cualquier edición en `.ts` o `.html` |
| Pruebas unitarias | `npx ng test --watch=false --browsers=ChromeHeadless` | Salida 0 con todas las suites en verde (`821/821`), incluidas pruebas geométricas `getBoundingClientRect()`, estilos computados (`fontWeight: 700`, `fontSize: 13px`, `boxShadow: none`, color unificado y deshabilitado en `underline`/`material`), `clearable` sin botón vacío y búsqueda en cascada | Suites `*-variant.spec.ts`, `pagina-crud.spec.ts`, `showcase-forms.component.spec.ts`, `showcase-templates.component.spec.ts` y specs del repositorio | Cambios en componentes o pruebas |
| Compilación | `npm run build && npm run lib:build` | Salida 0 en aplicación y librería `@atomic-ui/core` | Fuentes de aplicación y librería | Cambios en `src/` |

## Lista de tareas

- [x] Actualizar tokens de etiqueta flotante en `_tokens-primitives.css` (`--field-label-floated-font-weight: var(--font-weight-title)`, `--field-label-floated-font-size: 0.8125rem`, `--field-label-padding: 0 var(--space-1)`), `_tokens-components.css` (`--field-label-color-resting: var(--text-color-secondary)`), `scripts/check-theme-contrast.mjs` y `dart/atomic_tokens/PROCEDENCIA.json`.
- [x] Actualizar `number-input` (plantilla, estilos con altura canónica `46px`, botones centrados `--control-height-xs`, supresión de `box-shadow` en `.number-input__field:focus-visible` y `.number-input__btn:focus-visible`, contraste hover `--primary-color`, catálogo y pruebas unitarias con verificación geométrica `getBoundingClientRect()` y `getComputedStyle()`).
- [x] Actualizar `tag-input` (componente con `.tag-input--has-tags`, estilos centrados verticalmente en foco vacío y padding superior extra cuando hay chips, sangría izquierda `16px`, supresión del doble borde `:focus-visible` en `.tag-input__input`, catálogo y pruebas unitarias con verificación geométrica `getBoundingClientRect()` y `getComputedStyle()`).
- [x] Generalizar mejoras de geometría, alineación horizontal a `16px`, color unificado `--field-label-color-floated`, estado deshabilitado `--input-disabled-text` y posición interior en variantes `underline`/`material`, contraste en reposo, transiciones acotadas, dimensionamiento `[width]` en contenedores flex y búsqueda en cascada en `field-label.css`, `input`, `select2`, `combobox`, `dropdown`, `datepicker`, `select`, `textarea`, `floating-input`, `floating-textarea`, `radio`, `toggle`, `pagina-crud`, `showcase-forms` y `showcase-templates`.
- [x] Regenerar `distribution/atomic-source-manifest.json` y actualizar documentación de continuidad (`CHANGELOG.md`, `LESSONS_LEARNED.md`, `docs/CONTINUIDAD_AGENTES.md`).
- [x] Ejecutar compuertas de gobernanza (`24/24`), `npm run lint`, pruebas unitarias (`821/821`) y builds (`build`, `lib:build`).

## Resultado y revisión

- **Pruebas unitarias y geométricas en navegador real (`ChromeHeadless`):** `821 of 821 SUCCESS` (`0` fallos). Se añadieron comprobaciones `getComputedStyle` y `getBoundingClientRect()` en `number-input-variant.spec.ts`, `tag-input-variant.spec.ts`, `select2-variant.spec.ts`, `datepicker-variant.spec.ts`, `floating-input-variant.spec.ts`, `floating-textarea.component.spec.ts`, `pagina-crud.spec.ts`, `showcase-forms.component.spec.ts` y `showcase-templates.component.spec.ts` que acreditan peso `700` y tamaño `13px` (`0.8125rem`) en etiquetas flotantes elevadas, igualdad de color (`--field-label-color-floated`), color deshabilitado (`--input-disabled-text`) y sangría (`12px`) entre `floating`, `outline`, `underline` y `material`, ausencia de botón enfocable vacío en `clearable` cuando no hay valor, ausencia de anillo interno (`boxShadow: 'none'`, `outlineStyle: 'none'`) en `.tag-input__input`, `.number-input__field`, `.number-input__btn` y `.datepicker-trigger` al enfocar, centrado vertical exacto de `.tag-input__input` al enfocar vacío y separación limpia sobre los chips cuando existen etiquetas, ausencia de solapamiento entre `.fl-label--floated` y los botones `.number-input__btn`, manejo de opciones centinela vacías y cambios simultáneos de `[options]` + `writeValue` en `Select2Component`, dimensionamiento `has-custom-width` para anchos fijos (excluyendo `%` y `calc(100% - ...)`) y conmutación completa de búsqueda en cascada (`select` y `texto`, iniciando con un único selector `Buscar por`, desplegando el subfiltro al elegir criterio y ocultándolo al volver a `Seleccionar...`) en `PaginaCrud`, `ShowcaseFormsComponent` y `ShowcaseTemplatesComponent`.
- **Compuertas de gobernanza UI y compilación:** las 24 compuertas de `npm run governance:check` (`check:dependencias`, `governance:test`, `governance:smoke`, `check-atomic-blueprints`, `catalog:check`, `check:catalog-api`, `tokens:check`, `tooling:test`, `test:signals-gate`, `check:signals`, `test:control-flow-gate`, `check:control-flow`, `check:external-styles`, `check:field-labels` con `18` hojas descubiertas y `0/0` medidas a mano, `test:selectors-gate`, `check:selectors`, `test:no-tailwind-gate`, `check:no-tailwind`, `test:units-gate`, `check:units` con `106` hojas y `0` px rígidos, `check:css-values`, `check:typography`, `package:check`, `tokens:dart:check`, `check:contrast` sobre `3` temas y `12` pares por tema, y `check:focus`), `npm run lint`, `npm run build` y `npm run lib:build` terminaron con código `0`.
- **Manifiesto de distribución:** `distribution/atomic-source-manifest.json` regenerado (`340 archivos, SHA-256 ac6c89c728c8d678288551c29a8532cf5f3c651e49bde5041c8d41f3bf719d00`).
