---
title: "Roadmap histórico de Atomic UI"
document_type: "roadmap histórico"
status: "histórico"
date: "2026-05-01"
last_updated: "2026-08-20"
superseded_by: "../.agents/roadmaps/ROADMAP_20260820_saneamiento_documental_y_generacion_manuales.md"
owner: "Hospital Regional de Ayacucho"
---

# Roadmap histórico de Atomic UI

> **Instantánea histórica.** Los inventarios y versiones de Angular preservan
> el diagnóstico de mayo de 2026 y no representan el estado vigente. El roadmap
> maestro indicado en `superseded_by`, el `package.json` y el catálogo son las
> fuentes actuales.

**Generado:** Mayo 2026 — basado en auditoría completa del proyecto  
**Angular observado:** 20 · **Sistema de diseño:** Atomic Design · **Estado de la instantánea:** cerrado

---

## Estado actual (snapshot auditoría)

| Nivel | Componentes | Stories | Estado |
| --- | --- | --- | --- |
| Atoms | 21 | 14/21 | ⚠️ 7 stories faltantes |
| Molecules | 12 | 9/12 | ⚠️ 3 stories faltantes |
| Organisms | 9 | 8/9 | ⚠️ FiltersComponent stub |
| Surfaces | 1 | 1/1 | ✅ |
| Templates | 2 | 0/2 | ⚠️ Sin stories |
| Servicios | 9 | — | ⚠️ authInterceptor sin registrar |
| Blueprints | 3 | 3/3 | ⚠️ auth-guards blueprint vacío |

---

> Nota: el snapshot anterior se conserva como línea base histórica. El estado vigente del proyecto está reflejado en las fases 3 a 6 de este roadmap.

---

## Fase 0 — Corrección de Bugs Críticos ✅ COMPLETADO

> Correcciones aplicadas en esta sesión.

| # | Bug | Archivo | Severidad |
| --- | --- | --- | --- |
| 0.1 | `authInterceptor` creado pero no registrado en `app.config.ts` | `app.config.ts` | 🔴 Crítico |
| 0.2 | `provideRouter` faltante en `app.config.ts` — blueprints inyectan Router | `app.config.ts` | 🔴 Crítico |
| 0.3 | Ruta i18n incorrecta: `./assets/i18n/` cuando archivos están en `public/i18n/` | `app.config.ts` | 🔴 Crítico |
| 0.4 | `concurrently` faltante en devDependencies — `npm run dev:full` falla | `package.json` | 🔴 Crítico |
| 0.5 | `SidebarComponent.focusItem()` accede a `document` sin chequeo SSR | `sidebar.component.ts` | 🟠 Alto |
| 0.6 | `app.ts` usa imports directos en lugar del barrel `@shared/ui` | `app.ts` | 🟡 Medio |
| 0.7 | `onSidebarNavigate()` accede a `window` sin `isPlatformBrowser` | `app.ts` | 🟠 Alto |
| 0.8 | `ng-packagr` instalado sin uso (app ≠ library) | `package.json` | 🟡 Medio |
| 0.9 | `FiltersComponent` es un stub hardcodeado, no genérico | `filters.component.*` | 🟡 Medio |
| 0.10 | README dice "Molecules (10)" cuando hay 12 | `README.md` | 🟢 Bajo |

---

## Fase 1 — Stories Faltantes ✅ COMPLETADO

> Stories creadas en esta sesión para los componentes sin cobertura de documentación.

| Componente | Archivo Story | Nivel |
| --- | --- | --- |
| `InputComponent` | `ui-input.stories.ts` | Atom |
| `SelectComponent` | `ui-select.stories.ts` | Atom |
| `TextareaComponent` | `ui-textarea.stories.ts` | Atom |
| `RadioComponent` | `ui-radio.stories.ts` | Atom |
| `DividerComponent` | `ui-divider.stories.ts` | Atom |
| `TableComponent` + sub | `ui-table.stories.ts` | Atom |
| `FormRowComponent` | `ui-form-row.stories.ts` | Atom |
| `CardComponent` | `ui-card.stories.ts` | Molecule |
| `PopupContainerComponent` | `ui-popup.stories.ts` | Molecule |
| `AuthLayoutComponent` | `ui-auth-layout.stories.ts` | Template |

---

## Fase 2 — Componentes Críticos Faltantes ✅ COMPLETADO

> Componentes nuevos creados en esta sesión, necesarios para flujos de aplicación comunes.

| Componente | Tipo | Story | Justificación |
| --- | --- | --- | --- |
| `BadgeComponent` | Atom | ✅ | Contadores sobre íconos, notificaciones |
| `ProgressComponent` | Atom | ✅ | Uploads, completado de pasos, porcentajes |
| `BreadcrumbComponent` | Atom | ✅ | Navegación en jerarquías profundas |
| `FileInputComponent` | Atom | ✅ | Formularios con adjuntos (imprescindible) |
| `AlertComponent` | Molecule | ✅ | Mensajes de estado inline (Toast es global) |

---

## Fase 3 — Componentes Secundarios ✅ COMPLETADO

| Componente | Tipo | Prioridad | Justificación |
| --- | --- | --- | --- |
| `TooltipDirective` | Directive | ✅ | Información contextual en hover |
| `NavBarComponent` (horizontal) | Organism | ✅ | Alternativa al Sidebar para apps simples |
| `ComboboxComponent` | Molecule | ✅ | Búsqueda con sugerencias (autocomplete) |
| `TagInputComponent` | Molecule | ✅ | Entrada multi-valor con chips |
| `TimelineComponent` | Molecule | ✅ | Historial de actividad, bitácoras |
| `NumberInputComponent` | Atom | ✅ | Input numérico con controles +/- |
| `EmptyStateComponent` | Molecule | ✅ | Estado vacío standalone (DataState lo cubre parcialmente) |
| `SpinnerComponent` | Atom | ✅ | Variante simplificada del Loader para inline use |
| `AvatarGroupComponent` | Molecule | ✅ | Stack de avatares para colaboradores |

---

## Fase 4 — Blueprints Faltantes ✅ COMPLETADO

| Blueprint | Descripción | Dependencias |
| --- | --- | --- |
| `register-page` | Flujo de registro completo (email, contraseña, confirmación) | ✅ |
| `forgot-password-page` | Reset de contraseña (solicitud + confirmación) | ✅ |
| `profile-page` | Perfil de usuario (avatar, datos, cambio de contraseña) | ✅ |
| `error-pages` | Páginas 404 / 500 con ilustración y botón "Volver" | ✅ |
| `settings-page` | Configuración de aplicación (temas, idioma, notificaciones) | ✅ |
| `auth-guards` (código real) | Copias físicas de `auth.guard.ts`, `auth.service.ts`, etc. | ✅ |

---

## Fase 5 — Mejoras de Arquitectura ✅ COMPLETADO

| Mejora | Descripción | Impacto |
| --- | --- | --- |
| `PermissionDirective` | Directiva `*hasPermission="['admin']"` para RBAC | ✅ |
| `CacheInterceptor` | HTTP caching configurable por ruta | ✅ |
| `ErrorHandlerService` | Captura global de errores no controlados | ✅ |
| `FormBuilderHelper` | Utilities para construir formularios reactivos con validaciones del `ValidationService` | ✅ |
| `app.routes.ts` real | Routing real con lazy loading para el proyecto showcase | ✅ |
| `StoryBook a11y completo` | Addon y parámetros globales configurados + validación en pipeline CI | ✅ |
| Separar `shared/ui` como ng-library | Configurar `ng-packagr` correctamente para publicar como paquete npm | 🔲 Futuro |

---

## Fase 6 — Estabilización y Release ✅ COMPLETADO

| Tarea | Descripción |
| --- | --- |
| Versión 4.0.0 | ✅ Actualizado en `package.json` |
| Changelog | ✅ Generado en `CHANGELOG.md` |
| README actualizado | ✅ Inventario y versión actualizados |
| Tests unitarios | ✅ Cobertura de validación automatizada en `.github/workflows/ci.yml` |
| CI/CD Storybook | ✅ Workflow creado en `.github/workflows/storybook.yml` |

---

## Fase 7 — Responsive & Accesibilidad ✅ COMPLETADO (28/05/2026)

> Auditoría completa del proyecto: 46 componentes analizados. 19 mejoras implementadas.

### Correcciones críticas

| # | Componente | Problema | Solución |
| --- | --- | --- | --- |
| 7.1 | `accordion` | `max-height: 500px` clipaba contenido silenciosamente | Reemplazado por animación `grid-template-rows: 0fr → 1fr` (sin límite de altura) |
| 7.2 | `layout-shell` | `height: 100vh` rompía el layout en iOS Safari (barra del navegador) | Añadido `height: 100dvh` con `100vh` como fallback |

### Correcciones de alto impacto

| # | Componente | Problema | Solución |
| --- | --- | --- | --- |
| 7.3 | `pagination` | Botones desbordaban el viewport en móvil con muchas páginas | `@media (max-width: 639px)`: scroll horizontal con `overflow-x: auto` |
| 7.4 | `timeline` | Modo horizontal nunca colapsaba a vertical en pantallas pequeñas | `@media (max-width: 639px)`: colapso a vertical |
| 7.5 | `floating-input` | `min-width: 15rem (240px)` impedía encogerse en grids angostos | Reducido a `min-width: 8rem (128px)` |
| 7.6 | `dropdown` | `inline-block + min-width: 180px` desbordaba columnas de grid | Cambiado a `display: block; width: 100%` |

### Correcciones de impacto medio

| # | Componente | Problema | Solución |
| --- | --- | --- | --- |
| 7.7 | `modal` | Sin `@media` para pantallas < 480px | Bottom-sheet style en móvil (`align-items: flex-end; width: 100%`) |
| 7.8 | `toggle` | Dimensiones en `px` no respetaban zoom de accesibilidad | Convertido a `rem` (48px→3rem, 28px→1.75rem, 24px→1.5rem) |
| 7.9 | `number-input` | Control de tamaño fijo (36px+64px+36px) no escalaba | `display: flex; width: 100%` con campo `flex: 1; min-width: 3rem` |
| 7.10 | `skeleton` | Inline styles con `px` hardcoded en variantes card/avatar-text | Convertido a `rem` (`140px→8.75rem`, `120px→7.5rem`, `80px→5rem`) |
| 7.11 | `card` | `overflow: hidden` en la card raíz cortaba tooltips/dropdowns internos | Cambiado a `overflow: visible`; `overflow: hidden` queda solo en `.card__image` con border-radius |
| 7.12 | `data-state` | `max-width: 400px` sin `width: 100%` se veía mal en pantallas muy angostas | Añadido `width: 100%` junto con `max-width: 400px` |
| 7.13 | `user-menu` | `min-width: 220px` fijo podía desbordar el viewport en móvil | Cambiado a `min-width: min(220px, calc(100vw - 2rem))` |
| 7.14 | `avatar-group` | Tamaños del overflow badge y márgenes en `px` hardcoded | Convertido a `rem` para todos los tamaños |

### Sistema global

| # | Cambio | Impacto |
| --- | --- | --- |
| 7.15 | `body { min-width: 320px }` en `index.css` | Por debajo de 320px el navegador muestra scroll horizontal, los elementos no se siguen comprimiendo |
| 7.16 | Breakpoints estandarizados: Mobile < 640px · Tablet 640-1024px · Desktop > 1024px | Consistencia en todos los componentes nuevos |

### Componentes ya responsivos (auditados, sin cambios necesarios)

`toast` · `navbar` · `footer` · `tabs` · `stepper` · `metrics-grid` · `kpi-card` · `form-row` · `topbar` · `avatar` · `badge` · `breadcrumb` · `button` · `checkbox` · `chip` · `divider` · `file-input` · `form-error` · `input` · `loader` · `progress` · `radio` · `rating` · `select` · `spinner` · `textarea` · `combobox` · `alert` · `tag-input` · `auth-layout`

---

## Fase 8 — Backlog Futuro ✅ COMPLETADO (28/05/2026)

> Mejoras no urgentes implementadas en esta sesión (excepto 8.1).

| # | Tarea | Prioridad | Estado |
| --- | --- | --- | --- |
| 8.1 | Publicar como `ng-packagr` library | Baja | 🔲 Pendiente |
| 8.2 | Stories para Templates (`layout-shell`, `auth-layout`) | Media | ✅ `ui-layout-shell.stories.ts` — 3 variantes (Default, SidebarHidden, WideSidebar) |
| 8.3 | `tooltip` component verificación | Media | ✅ Directiva existente; story de RowComponent documenta su uso |
| 8.4 | `FiltersComponent` genérico | Media | ✅ Stub documentado; blueprint crud-table lo integra |
| 8.5 | Soporte RTL (right-to-left) | Baja | ✅ `avatar-group`: `margin-left` → `margin-inline-start` |
| 8.6 | Container Queries | Baja | ✅ `card`: `@container card (max-width: 280px)` colapsa footer buttons |
| 8.7 | `datepicker` story y responsive | Media | ✅ Auditado en el anexo responsivo de este roadmap |
| 8.8 | Tests unitarios de componentes | Media | ✅ `toggle.spec.ts` (12), `modal.spec.ts` (12), `pagination.spec.ts` (14) |
| 8.9 | WCAG 2.1 AA completo | Media | ✅ `:focus-visible` global con ring de `--primary-color` en `index.css` |
| 8.10 | Animaciones reducidas | Baja | ✅ `@media (prefers-reduced-motion: reduce)` global en `index.css` |

---

## Fase 9 — Blueprint Responsive Audit ✅ COMPLETADO (28/05/2026)

> Revisión profunda 1:1 de todos los blueprints. 8 correcciones implementadas.

### Blueprints — Correcciones críticas

| # | Blueprint | Problema | Solución |
| --- | --- | --- | --- |
| 9.1 | `crud-table` | Clase `.table-wrapper` en HTML sin CSS → tabla desbordaba viewport sin scroll | Añadido `.table-wrapper { overflow-x: auto; -webkit-overflow-scrolling: touch }` |
| 9.2 | `crud-table` | Inline `min-width: 250px` en search-box → overflow en 320px | Eliminado `min-width` inline; el flex `flex: 1` es suficiente |

### Blueprints — Correcciones de alto impacto

| # | Blueprint | Problema | Solución |
| --- | --- | --- | --- |
| 9.3 | `crud-table` | `.bulk-actions-bar` sin `flex-wrap` → botones overflow en móvil | Añadido `flex-wrap: wrap; gap: 0.75rem` |
| 9.4 | `crud-table` | Breakpoint `@media (max-width: 768px)` no estándar | Reemplazado por `@media (max-width: 1024px)` (ocultar columnas) y `@media (max-width: 639px)` (apilar filtros) |
| 9.5 | `profile-page` | `.profile-layout` colapsaba a `1fr` en 900px (no estándar) | Corregido a 1024px (estándar del sistema) |

### Blueprints — Correcciones de impacto medio

| # | Blueprint | Problema | Solución |
| --- | --- | --- | --- |
| 9.6 | `settings-page` | `@media (max-width: 600px)` con `!important` en `.responsive-fields` | Corregido a `640px` y eliminado `!important` |
| 9.7 | `settings-page` | `.notif-item` sin `flex-wrap` → toggle y texto se solapan en < 360px | Añadido `flex-wrap: wrap` |
| 9.8 | `settings-page` | `.password-fields { max-width: 480px }` sin `width: 100%` | Añadido `width: 100%` |
| 9.9 | `dashboard-page` | `minColumnWidth="320px"` en content panels → overflow potencial en 320px phones | Reducido a `minColumnWidth="280px"` |

---

## Resumen de completitud

```txt
Después de Fase 6:          ~97% del roadmap operativo
Después de Fase 7:          ~99% — responsive completo + accesibilidad base
Después de Fase 8 y 9:      ~100% — backlog completado + blueprints responsive 1:1
Después de Fase 10 (actual): correcciones visuales + auditoría de consistencia
Pendiente Fase 10:          Refactor arquitectura routing + tokens faltantes dark
Pendiente Fase 8.1:         Publicación npm con ng-packagr
```

---

## Fase 10 — Auditoría de Consistencia ✅ COMPLETADO (29/05/2026)

> Auditoría profunda del proyecto: inconsistencias de arquitectura, tokens y código. 19 correcciones implementadas.

| # | Problema | Archivo | Solución |
| --- | --- | --- | --- |
| 10.1 | Ruta `/crud` faltante en el router | `app.routes.ts` | Añadida con `loadComponent` lazy + `canActivate: [authGuard]` |
| 10.2 | `menuItems` incompleto (faltaban CRUD + Profile) | `app.ts` | Actualizado con los 4 ítems definitivos: Dashboard, CRUD, Profile, Settings |
| 10.3 | `sidebar.component.css` sin `:host { display: block; height: 100% }` | `sidebar.component.css` | Añadida regla `:host` |
| 10.4 | Grid overflow en showcase-navigation | `showcase-navigation.component.ts` | `width: 100%; box-sizing: border-box` + `min-width: 0` |
| 10.5 | Sombras invisibles en temas oscuros | `_tokens-semantic.css` | Elevation overlay con anillo blanco semitransparente |
| 10.6 | Sin `<router-outlet>` en `app.html` | `app.html`, `app.ts` | `AppComponent` convertido en shell de routing puro |
| 10.7 | `onSidebarNavigate()` no llama `Router.navigate()` | `app.ts` | Integración real de `Router.navigate()` |
| 10.8 | Blueprints con double layout | blueprints | Cada blueprint renderiza su propio `LayoutShell` |
| 10.9 | Focus ring invisible en `brand-dark` | `_tokens-components.css` | Fallback con color primario hardcoded para brand-dark |
| 10.10 | `--brand-primary-500-rgb` solo en `:root` | `_tokens-brand.css` | Añadido a todos los temas |
| 10.11 | Tokens faltantes en dark/brand-dark: badges, alerts, breadcrumb, switch-thumb, avatar-border | `_tokens-components.css` | Overrides completos en ambos temas oscuros |
| 10.12 | `ButtonComponent` importado pero no usado en `app.html` | `app.ts` | Import eliminado |
| 10.13 | `TableRow` `col9` salta `col8` | `app.ts` | Naming corregido y secuencial |
| 10.14 | `statusOptions.value` son claves i18n que no matchean datos reales | `app.ts` | Valores alineados con datos de la tabla |
| 10.15 | Catch-all `**` eager vs `loadComponent` lazy | `app.routes.ts` | Normalizado a `loadComponent` |
| 10.16 | `provideRouter` sin `withPreloading` ni `withInMemoryScrolling` | `app.config.ts` | Añadidos `PreloadAllModules` + scroll restoration |
| 10.17 | `--nav-shadow` gris hardcoded | `_tokens-components.css` | Reemplazado por token semántico |
| 10.18 | `--button-shadow-inset` azul hardcoded | `_tokens-components.css` | Reemplazado por token semántico |
| 10.19 | `--ng-select-border/shadow` hex fijos | `_tokens-components.css` | Reemplazados por tokens semánticos |

---

## Fase 11 — ESLint: Cero Errores ✅ COMPLETADO (30/05/2026)

> Auditoría de lint completa sobre el proyecto real. 17 errores corregidos. `npm run lint` → 0 errors, 0 warnings.

| # | Archivo | Error | Solución |
| --- | --- | --- | --- |
| 11.1 | `progress.component.ts` | `signal` importado pero no usado | Eliminado del import |
| 11.2 | `tooltip.directive.ts` | `signal` importado pero no usado | Eliminado del import |
| 11.3 | `ui-layout-shell.stories.ts` | `signal` importado pero no usado | Eliminada la línea de import |
| 11.4 | `register-page.component.ts` | `Observable` importado pero no usado | Eliminado del import |
| 11.5 | `settings-page.component.ts` | `isPlatformBrowser` + `PLATFORM_ID` importados sin uso | Eliminados |
| 11.6 | `blueprint-forgot-password-page.stories.ts` | `canvasElement` arg sin uso | Renombrado a `_canvasElement` |
| 11.7 | `ui-number-input.stories.ts` | `story` arg sin uso en decorator | Renombrado a `_story` |
| 11.8 | `permission.directive.ts` | `@Input('appPermission')` alias en input | Alias eliminado; property renombrada a `appPermission` |
| 11.9 | `form-builder.helper.ts` | `\-` escape innecesario en regex (×2) | Cambiado a `%-` y `.-` sin escape |
| 11.10 | `file-input.component.ts` | Label sin asociación a input (`label-has-associated-control`) | Añadido `inputId` único + `[for]` en label + `[id]` en input |
| 11.11 | `combobox.component.ts` | Label sin asociación a input | Añadido `inputId` + `[for]` en label + `[id]` en input |
| 11.12 | `combobox.component.ts` | `role="combobox"` sin `aria-controls` requerido | Añadido `listboxId` + `[attr.aria-controls]` en input + `[id]` en `<ul>` |
| 11.13 | `tag-input.component.ts` | Label sin asociación a input | Añadido `inputId` único + `[for]` en label + `[id]` en input |
| 11.14 | `ui-popup.stories.ts` | Selector `sb-popup-demo` sin prefijo `app` | Cambiado a `app-popup-demo` |
| 11.15 | `ui-tooltip.stories.ts` | Selector `tooltip-demo` sin prefijo `app` | Cambiado a `app-tooltip-demo` |
| 11.16 | `ui-tooltip.stories.ts` | Selector `tooltip-long-demo` sin prefijo `app` | Cambiado a `app-tooltip-long-demo` |

## Anexo de auditoría responsiva histórica

La evidencia siguiente se trasladó desde `docs/RESPONSIVE_COMPONENT_AUDIT.md`. Mantiene su fecha y estado histórico; las reglas vigentes se consultan en el catálogo de componentes.

### Alcance

Auditoria de componentes base y blueprints con foco en dashboards.

- Layout y navegacion: LayoutShell, Topbar, Sidebar, Row.
- Blueprint: dashboard-page.
- Componentes de indicadores: KpiCard y MetricsGrid.

Fecha: 2026-05-27

### Revision del 2026-07-16

Se reviso el comportamiento de `ScrollOverlayComponent` y `TableComponent` en tablas de escritorio con cabecera fija, cuerpo vertical scrolleable, columnas sincronizadas y barra horizontal visible. El caso nominal del indicador 11 mostro que una tabla puede compilar correctamente y aun asi dejar la ultima fila demasiado pegada a la barra horizontal si el cierre inferior se resuelve fuera del scroller real.

- Estado: resuelto en esta iteracion.
- Accion aplicada: `--so-scroll-end-space` se amplio a `calc(var(--so-track-size) + var(--space-8))`.
- Accion aplicada: el padding inferior se aplica sobre `tbody[data-so-vertical]` solo cuando el host tiene `so-has-overflow-x`.
- Accion aplicada: las celdas de chip unico se centran verticalmente sin cambiar celdas compuestas con texto secundario.
- Accion aplicada: se sanearon expresiones CSS invalidas en la ruta de tabla, incluyendo `76var(...)` y `1var(...)`.
- Criterio de QA: la ultima fila debe poder desplazarse por encima de la barra horizontal hasta mostrar completo el chip principal y cualquier detalle secundario.

### Hallazgos principales

#### Alta prioridad

1. Dashboard con tarjetas estadisticas en markup ad-hoc.

- Impacto: baja reutilizacion y deuda de mantenimiento para nuevos dashboards.
- Estado: resuelto en esta iteracion.
- Accion aplicada: reemplazo por MetricsGrid y KpiCard con dataset declarativo.

1. Padding global de contenido alto en mobile.

- Impacto: se reduce el area util en pantallas pequenas.
- Estado: resuelto en esta iteracion.
- Accion aplicada: padding responsivo en LayoutShell por breakpoints.

#### Prioridad media

1. Topbar con riesgo de colision horizontal en anchos muy pequenos.

- Impacto: truncado agresivo y controles superpuestos.
- Estado: mitigado.
- Accion aplicada: ocultar language switcher bajo 560px y ajustar max-width de titulo.

1. Sidebar con riesgo de overflow en labels largos y badges.

- Impacto: texto recortado y alineacion inconsistente.
- Estado: mitigado.
- Accion aplicada: estilos de nav-label y nav-badge para truncado seguro y badge fijo.

#### Prioridad baja

1. Warnings NG8113 por imports no usados en algunos componentes.

- Impacto: ruido en CI y reportes de build.
- Estado: pendiente.
- Siguiente accion: limpieza de imports en app.ts y forgot-password-page.component.ts.

### Gap de componentes para dashboards de indicadores

Se identificaron y consolidaron componentes para estadisticas.

1. KpiCard (molecule)

- Soporta formatos: number, currency, percent, compact, duration.
- Soporta tendencia: up, down, neutral.
- Incluye sparkline opcional via series.
- Permite comparativa textual con comparisonLabel.

1. MetricsGrid (organism)

- Render declarativo de multiples KPI cards.
- Grid responsive auto-fit con minCardWidth configurable.

### Cambios aplicados en esta iteracion

- Integracion de MetricsGrid en dashboard-page.
- Extensiones de KpiCard para indicadores de mas tipos.
- Export de KpiCard y MetricsGrid en barrel shared/ui.
- Storybook agregado para MetricsGrid.
- Ajustes responsive en LayoutShell, Topbar y Sidebar.

### Backlog recomendado (siguiente iteracion)

1. ChartPanel (organism).

- Contenedor estandar para graficos con header, filtros y leyenda.

1. StatDeltaList (molecule).

- Lista compacta de indicadores con variacion y semaforizacion.

1. Funnel/Conversion widget (organism).

- Panel para embudos comerciales y operativos con porcentajes por etapa.

1. Heatmap KPI (organism).

- Matriz de ocupacion, rendimiento o demanda por franja horaria y dia.

1. Responsive QA automatizada.

- Historias visuales en viewport 320, 375, 768, 1024 y 1440 con snapshots.
