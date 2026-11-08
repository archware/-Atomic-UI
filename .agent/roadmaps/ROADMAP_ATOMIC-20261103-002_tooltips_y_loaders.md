---
title: "Corrección de posicionamiento y contraste de Tooltips y progresión geométrica de Loaders"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-11-03"
last_updated: "2026-11-03"
document_type: "roadmap"
status: "completado"
version: "1.0.0"
change_id: "ATOMIC-20261103-002"
---

# Corrección de posicionamiento y contraste de Tooltips y progresión geométrica de Loaders

## Encuadre y decisión

```yaml
asignacion: "ATOMIC-20261103-002"
ruta: "estandar"
justificacion: "Corrección visual, geométrica y de contraste de tokens en los átomos appTooltip y app-loader y sus showcases sin alterar contratos públicos ni esquemas de datos."
objetivo: "Corregir el posicionamiento desplazado y el contraste ilegible de Tooltips en tema oscuro (eliminando la implementación CSS paralela en ShowcaseFeedbackComponent, acotando el ancho del host con appTooltip y reforzando los tokens --tooltip-* en los tres temas) y restablecer la progresión real de tamaños sm/md/lg y la altura uniforme de las seis variantes de app-loader (en especial dots)."
base:
  repositorio: "C:/Users/cotaha/source/repos/-Atomic-UI"
  rama: "main"
  oid: "b76f432976d6c1e47de57ee4b4be5821a5195dd8"
  estado: "Árbol con trabajo previo de las unidades ATOMIC-20261102-001 a 006 y ATOMIC-20261103-001 preservado íntegramente."
ficheros_permitidos:
  - "src/styles/themes/_tokens-components.css"
  - "scripts/check-theme-contrast.mjs"
  - "dart/atomic_tokens/lib/src/atomic_colores.g.dart"
  - "dart/atomic_tokens/PROCEDENCIA.json"
  - "src/app/shared/ui/atoms/tooltip/tooltip.css"
  - "src/app/shared/ui/atoms/tooltip/tooltip.directive.ts"
  - "src/app/shared/ui/atoms/tooltip/tooltip.directive.spec.ts"
  - "src/app/shared/ui/atoms/loader/loader.component.ts"
  - "src/app/shared/ui/atoms/loader/loader.component.html"
  - "src/app/shared/ui/atoms/loader/loader.component.css"
  - "src/app/shared/ui/atoms/loader/loader.component.spec.ts"
  - "src/app/shared/ui/molecules/data-state/data-state.component.ts"
  - "catalog/components/loader.json"
  - "catalog/components/tooltip.json"
  - "catalog/components/spinner.json"
  - "src/app/components/ui-showcase/examples/showcase-feedback/showcase-feedback.component.ts"
  - "src/app/components/ui-showcase/examples/showcase-feedback/showcase-feedback.component.html"
  - "src/app/components/ui-showcase/examples/showcase-feedback/showcase-feedback.component.css"
  - "src/app/components/ui-showcase/examples/showcase-feedback/showcase-feedback.component.spec.ts"
  - "src/app/components/ui-showcase/examples/showcase-status/showcase-status.component.ts"
  - "src/app/components/ui-showcase/examples/showcase-status/showcase-status.component.spec.ts"
  - "src/stories/ui-loader.stories.ts"
  - "distribution/atomic-source-manifest.json"
  - "CHANGELOG.md"
  - "LESSONS_LEARNED.md"
  - "docs/CONTINUIDAD_AGENTES.md"
  - "docs/BITACORA_CONTINUIDAD_CORTES_HISTORICOS.md"
trabajo_ajeno: "Se preservan intactos los archivos modificados por las unidades previas en el árbol de trabajo."
contratos: "Se mantienen inalterados los selectores ([appTooltip], app-loader) y sus entradas públicas (appTooltip, tooltipPosition, variant, size)."
roles: "Agente constructor en ruta estándar bajo supervisión del orquestador padre."
autorizaciones: "Edición en el árbol de trabajo de -Atomic-UI, regeneración de tokens Dart y manifiesto de distribución, y sincronización autorizada hacia ventas-cxc; prohibido ejecutar git commit, git push, git reset o git checkout."
disparadores_escalado: "Cualquier requerimiento que altere la API pública de un componente o rompa una compuerta de gobernanza."
rollback: "Restaurar los fragmentos editados en tooltip, loader, showcase y temas, ejecutar npm run tokens:dart y regenerar distribution/atomic-source-manifest.json con npm run package:manifest."
```

## Diseño y criterios de aceptación

- [x] **1. Tooltips (`tooltip.directive.ts`, `tooltip.css`, `_tokens-components.css`, `check-theme-contrast.mjs`, `showcase-feedback`)**:
  - Retirar la implementación CSS paralela `.tooltip-trigger:hover::after` de `ShowcaseFeedbackComponent` y consumir `TooltipDirective` (`[appTooltip]`).
  - Acotar `.tooltip-host:not(.atomic-button--full-width) { width: fit-content; }` en `tooltip.css` y resolver en `TooltipDirective.resolveTriggerRect()` el rectángulo efectivo del control interactivo cuando el host sea un elemento personalizado que envuelva un único hijo de menor ancho, evitando que el tooltip se desplace al 50% del ancho de fila.
  - Definir `--tooltip-bg`, `--tooltip-text`, `--tooltip-border` y `--tooltip-shadow` en `light`, `dark` y `brand-dark` dentro de `_tokens-components.css`, auditar el par `--tooltip-text` / `--tooltip-bg` en `scripts/check-theme-contrast.mjs` (`>= 4.5:1` en los tres temas) y sincronizar `dart/atomic_tokens`.
- [x] **2. Loaders (`loader.component.html`, `loader.component.css`, `showcase-status.component.ts`, `ui-loader.stories.ts`)**:
  - Corregir el orden y especificidad en `loader.component.css` (`.loader-container.loader-sm`, `.loader-container.loader-md`, `.loader-container.loader-lg`) donde `.loader-container` sobrescribía a `.loader-sm`, restableciendo la progresión `sm` (`1.5rem` / `24px`, trazo `2px`), `md` (`2.5rem` / `40px`, trazo `3px`) y `lg` (`3.5rem` / `56px`, trazo `4px`).
  - Dotar a `:host`, `.loader-container`, `.dots` y `.bars` de dimensiones coherentes con `var(--loader-size)` para que las seis variantes (`spinner`, `dots`, `pulse`, `bars`, `gradient`, `orbit`) reserven exactamente la misma altura y alineen sus etiquetas inferiores en una misma línea base.
- [x] **3. Pruebas y compuertas**:
  - Añadir pruebas reales con `getComputedStyle` y `getBoundingClientRect` en `ChromeHeadless` dentro de `tooltip.directive.spec.ts`, `loader.component.spec.ts`, `showcase-feedback.component.spec.ts` y `showcase-status.component.spec.ts` (`15/15` casos específicos en los 4 archivos de prueba).
  - Superar las compuertas de `-Atomic-UI` (`check:units`, `check:css-values`, `check:typography`, `check:external-styles`, `check:control-flow`, `check:selectors`, `check:no-tailwind`, `tokens:dart:check`, `check:contrast` con `13` pares por tema, `check:focus`, `catalog:check`, `check:catalog-api`, `npm run lint`, `npm run build`, `npm run lib:build` y `npm run package:manifest` con `340` fuentes y SHA-256 `0e0d40e6bd7f9cc010c01f5c605b61935ac66cc9b9f3d969909eac71233ec1a9`) y sincronizar hacia `ventas-cxc`.
