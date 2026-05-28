# Changelog

Todas las modificaciones importantes de este proyecto se documentan en este archivo.  
Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/).

---

## [4.2.0] - 2026-05-28

### Blueprint Responsive Audit — Revisión profunda 1:1 de todos los blueprints

#### Fixed — Crítico

- **`crud-table`**: Añadida clase `.table-wrapper { overflow-x: auto; -webkit-overflow-scrolling: touch; overscroll-behavior-x: contain }`. El HTML usaba `.table-wrapper` pero el CSS solo definía `.table-container`. La tabla ahora tiene scroll horizontal en móvil en lugar de desbordar el viewport.
- **`crud-table`**: Eliminado `min-width: 250px` inline del contenedor de búsqueda. En pantallas de 320px la barra de búsqueda ya no empuja el layout.

#### Fixed — Alto impacto (blueprints)

- **`crud-table`**: Añadido `flex-wrap: wrap; gap: 0.75rem` a `.bulk-actions-bar`. Los botones de acción masiva ya no se salen del viewport cuando hay varios en pantallas estrechas.
- **`crud-table`**: Reemplazado el bloque `@media (max-width: 768px)` (breakpoint no estándar) por dos bloques estandarizados:
  - `@media (max-width: 1024px)`: Oculta columnas `.col-email` y `.col-date` en tablet/móvil para reducir el ancho total de la tabla.
  - `@media (max-width: 639px)`: Apila verticalmente `.crud-header`, `.filters-bar`, `.filter-group` y hace que los select2 ocupen `width: 100%`.
- **`profile-page`**: Breakpoint de `.profile-layout` corregido de `900px` (no estándar) a `1024px` (estándar del sistema). En tablet (768–900px) la barra lateral de 280px ya no aplasta el contenido principal.

#### Fixed — Impacto medio (blueprints)

- **`settings-page`**: Corregido `@media (max-width: 600px)` → `640px` (breakpoint estándar) y eliminado `!important` innecesario en `.responsive-fields`. Nota: `app-row` ya aplica el colapso a `1fr` automáticamente a ≤640px.
- **`settings-page`**: Añadido `flex-wrap: wrap` a `.notif-item`. El toggle de notificaciones cae debajo del texto en pantallas muy estrechas en lugar de solaparse.
- **`settings-page`**: Añadido `width: 100%` a `.password-fields`. El contenedor de contraseña respeta el ancho disponible en móvil.
- **`dashboard-page`**: `minColumnWidth` del `app-row` de paneles de contenido reducido de `320px` a `280px`. En iPhone SE (320px) con padding de 12px el área interna es 296px; con 320px el grid podía generar overflow.

---

## [4.1.0] - 2026-05-28

### Responsive & Accessibility — Auditoría completa de 46 componentes

#### Fixed — Críticos

- **`accordion`**: Reemplazado `max-height: 500px + overflow: hidden` por animación `grid-template-rows: 0fr → 1fr`. El contenido de cualquier altura ahora se expande correctamente sin ser clipado.
- **`layout-shell`**: Añadido `height: 100dvh` (con `100vh` como fallback) para corregir el bug de iOS Safari donde la barra inferior del navegador causaba que el layout sobrepasara el viewport.

#### Fixed — Alto impacto

- **`pagination`**: En `@media (max-width: 639px)` el nav usa `overflow-x: auto` y los botones tienen `flex-shrink: 0`. Los botones ya no se comprimen ni desbordan el viewport con muchas páginas.
- **`timeline`**: Añadido `@media (max-width: 639px)` que colapsa el modo horizontal a vertical, evitando que los ítems se compriman hasta quedar ilegibles en móvil.
- **`floating-input`**: `min-width` reducido de `15rem (240px)` a `8rem (128px)`. El input ya puede usarse en columnas de grid angostas sin desbordarse.
- **`dropdown`**: Cambiado de `display: inline-block; min-width: 180px` a `display: block; width: 100%`. El dropdown ahora ocupa el ancho de su contenedor, adaptándose a cualquier grid.

#### Fixed — Impacto medio

- **`modal`**: Añadido `@media (max-width: 479px)` que convierte el modal en un bottom-sheet (anclado al borde inferior, ancho 100%). Evita modales de 288px que son demasiado angostos en iPhone SE.
- **`toggle`**: Convertidas todas las dimensiones de `px` a `rem` (`48px→3rem`, `28px→1.75rem`, `24px→1.5rem`, `20px→1.25rem`). El toggle ahora escala correctamente con el zoom de accesibilidad del sistema operativo.
- **`number-input`**: Cambiado de `display: inline-flex` con campo `width: 64px` fijo a `display: flex; width: 100%` con campo `flex: 1; min-width: 3rem`. El control ahora llena el contenedor.
- **`skeleton`**: Convertidos todos los `px` hardcoded de inline styles a `rem` (`140px→8.75rem`, `120px→7.5rem`, `80px→5rem`).
- **`card`**: `overflow: hidden` en la tarjeta raíz cambiado a `overflow: visible`. Se añadió `border-radius` directamente en `.card__image` para mantener el clipping de imágenes. Dropdowns y tooltips dentro de la card ya no quedan cortados.
- **`data-state`**: Añadido `width: 100%` al `.error-container` junto con `max-width: 400px`. En pantallas angostas ya no hay comportamiento extraño.
- **`user-menu`**: `min-width: 220px` cambiado a `min-width: min(220px, calc(100vw - 2rem))`. El dropdown nunca desbordará el viewport, independientemente de dónde esté ubicado el avatar.
- **`avatar-group`**: Convertidas todas las dimensiones del badge de overflow y los márgenes de solapamiento de `px` a `rem`.

#### Added — Sistema global

- **`body { min-width: 320px }`** en `src/styles/themes/index.css`. Por debajo de 320px el navegador muestra scroll horizontal; los componentes no siguen comprimiéndose más allá del ancho mínimo de un móvil (iPhone SE).
- **Breakpoints estandarizados** documentados: Mobile `< 640px` · Tablet `640px–1024px` · Desktop `> 1024px`.

#### Fixed — Stories Storybook (Sesión anterior)

- **42 errores de TypeScript** en 12 story files corregidos para compatibilidad con Storybook 10 (validación estricta de `argTypes`/`args` contra `@Input()` reales).
- Inputs nuevos añadidos a componentes: `DividerComponent` (`label`, `variant`, `orientation`), `ComboboxComponent` (`clearable`), `FileInputComponent` (`hint`), `NumberInputComponent` (`error`), `NavBarComponent` (`sticky`, `variant`), `BadgeComponent` (`visible`), `AvatarComponent` (`color`).

---

### Lecciones Aprendidas

#### CSS

1. **`max-height` para animaciones es un antipatrón.** Cualquier valor fijo (500px, 1000px) eventualmente clipará contenido dinámico. La alternativa correcta es `grid-template-rows: 0fr → 1fr` que soporta cualquier altura sin JavaScript.

2. **`100vh` en iOS Safari incluye la barra inferior del navegador.** Siempre usar `height: 100dvh` con `100vh` como fallback para layouts que deben ocupar exactamente la ventana visible.

3. **`overflow: hidden` en el contenedor raíz de una tarjeta clipa dropdowns y tooltips.** Si la tarjeta puede contener componentes interactivos (selects, combobox, tooltips), mover `overflow: hidden` solo a la zona de imagen y usar `border-radius` explícito en ella.

4. **`px` vs `rem` en componentes de UI.** Los elementos de control (toggle, número, badges) deben usar `rem` para respetar el `font-size` base del usuario y el zoom de accesibilidad del SO. Los elementos estrictamente decorativos (bordes de 1-2px, separadores) pueden mantener `px`.

5. **`min-width` fijo en inputs y dropdowns bloquea layouts flexibles.** Los componentes deben aceptar el ancho de su contenedor padre (`width: 100%`) y dejar que el diseño exterior decida el espacio disponible. El `min-width` solo debe ser el mínimo absoluto de usabilidad.

6. **`display: inline-block` en controles de formulario es incorrecto.** Los controles de formulario (`input`, `select`, `dropdown`) deben ser `display: block; width: 100%` para comportarse como el resto de elementos de formulario HTML nativo.

#### Storybook

- **Storybook 10 valida `argTypes` y `args` contra los `@Input()` reales del componente.** Cualquier propiedad en el story que no exista en el componente produce un error de TypeScript en tiempo de compilación. La estrategia correcta: si la story necesita una propiedad, agregarla como `@Input()` genuino al componente; no usar propiedades ficticias.
- **`render: () => ({ component: MyComponent })` no es válido en Storybook 10.** Usar `render: () => ({ template: '<app-my-comp></app-my-comp>', imports: [MyComponent] })` para componentes que no son el sujeto directo de la story.

#### Angular

- **Los componentes de layout (`layout-shell`, `sidebar`) no deben encapsular su propio responsive.** Es correcto que el sidebar delegue el comportamiento mobile al layout-shell. Sin embargo, hay que documentarlo claramente para que quien use el sidebar standalone sepa que necesita el shell.
- **`@Input()` con nombre igual al atributo HTML nativo puede causar conflictos.** Ej: `maxlength` (minúscula) en `textarea` es el atributo HTML nativo; `maxLength` (camelCase) es el `@Input()` de Angular. Storybook y los templates necesitan usar el nombre correcto del binding Angular.

---

### Added

- Nuevos atoms: `Badge`, `Breadcrumb`, `FileInput`, `NumberInput`, `Progress`, `Spinner`, `TooltipDirective`.
- Nuevos molecules: `Alert`, `AvatarGroup`, `Combobox`, `TagInput`, `Timeline`, `Popup` story/documentacion reforzada.
- Nuevo organism: `NavBar`.
- Nuevos blueprints: `register-page`, `forgot-password-page`, `profile-page`, `settings-page`, `error-pages`.
- Blueprint `auth-guards` completado con archivos concretos de referencia/reexport.
- `PermissionDirective` para control de acceso por roles.
- `CacheInterceptor` con invalidacion por patron y TTL configurable por headers.
- `GlobalErrorHandlerService` para captura global de errores.
- `FormBuilderHelper` para validaciones y helpers reutilizables en formularios reactivos.
- Workflow CI/CD de Storybook en `.github/workflows/storybook.yml`.
- Workflow de validacion de build/lint/test en `.github/workflows/ci.yml`.

### Changed

- `app.config.ts` ahora registra:
  - `provideRouter(routes)` con rutas reales.
  - `authInterceptor` y `cacheInterceptor` en `provideHttpClient`.
  - `GlobalErrorHandlerService` como `ErrorHandler` global.
- `app.routes.ts` migrado a lazy loading sobre blueprints reales del repositorio.
- `README.md` y `src/stories/Configure.mdx` actualizados con inventario real y version 4.0.0.
- `package.json` actualizado a version `4.0.0`.
- `ROADMAP.md` actualizado con estado de fases 3, 4 y 5 como completadas.

### Fixed

- Registro de `authInterceptor` faltante.
- Wiring de rutas que no apuntaban a componentes existentes.
- Compatibilidad i18n en loader (`public/i18n` -> `./i18n/...`).
- Duplicados y faltantes de export en el barrel `src/app/shared/ui/index.ts`.
- Ajustes de runtime en `ErrorPagesComponent` para leer `data.code` de ruta.

### Notes

- La ejecucion local de `npm` no esta disponible en este entorno de agente.
- La validacion tecnica completa queda automatizada en GitHub Actions mediante `ci.yml`.
