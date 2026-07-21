# Lecciones Aprendidas (Lessons Learned)

Este documento centraliza el conocimiento adquirido tras solucionar problemas complejos de arquitectura, diseño e integración en el ecosistema de Atomic-UI, sirviendo como guía maestra para que agentes y desarrolladores entiendan el "por qué" de ciertas decisiones técnicas críticas y puedan portar este comportamiento a otros ecosistemas (Wails, Tauri, Web, etc).

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

**Contexto:** En el Orquestador del Acopiador HRA, el boton "Ejecutar Calculo" se mostraba deshabilitado (gris, opacity reducida) cuando faltaban fuentes de datos `[disabled]="!canExecuteIndicador()"`, pero el usuario reporto que al hacer click, el calculo se ejecutaba de todas formas.

**Causa Raiz:** El consumidor enlazo la accion usando el evento nativo del DOM `(click)="ejecutarIndicador()"` directamente sobre la etiqueta `<app-button>`. En Angular, esto enlaza el listener al *Host Element*. Aunque el `<button>` HTML nativo en el interior del componente este `disabled` y no dispare eventos de click, el click del usuario impactaba en el host (padding, wrapper) y disparaba la funcion.

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
>>>>>>> Stashed changes

---

## [2026-07-19] - Tokens de Color Obligatorios en Modales y Overlays Custom

**Contexto:** En la aplicacion base_python_angular (Acopiador HRA), los modales de alerta y confirmacion construidos con `app-card variant="elevated"` + `slot="image"` tenian colores hexadecimales fijos en el header (`#1e293b`, `#f8fafc`, `#334155`). En modo oscuro el texto parecia correcto (porque los colores fijos simulaban el dark mode), pero en modo claro el fondo quedaba negro y el texto blanco, siendo completamente ilegible.

**La leccion:** Los consumidores de Atomic UI (Wails, Tauri, Python/WebView) NO deben usar colores hexadecimales fijos en ningun elemento que forme parte de un modal, overlay o dialogo. El sistema de tokens de Atomic garantiza la paridad automatica entre Light Mode y Dark Mode. Al forzar un color fijo, se rompe esa garantia y el componente queda "atado" a un solo tema.

**Regla de tokens para modales:**
- Header/cabecera del modal: `background: var(--surface-section)` + `border-bottom: 1px solid var(--border-color)`
- Titulo del modal: `color: var(--text-color)`
- Texto del cuerpo: `color: var(--text-color)` explicito (NO usar `text-secondary` ni `text-muted` en modales; esas clases aplican opacidad reducida que resulta ilegible sobre fondos de superficie)
- Iconos de estado: `color: var(--danger-color)`, `var(--warning-color)`, `var(--success-color)` segun el tipo de alerta
- Separadores: `border-color: var(--border-color)`

**Regla de propagacion:** Cualquier modal o elemento HTML flotante (overlay, drawer, tooltip, popover) en cualquier consumidor del ecosistema (Wails, Tauri, Python/WebView) debe heredar exclusivamente tokens semanticos de Atomic UI. Esta regla aplica antes de cualquier decision de layout o color.

---

## [2026-07-16] - Datos demo de graficos y contratos productivos
**Contexto:** Atomic UI contiene showcase, stories y blueprints que necesitan datos de demostracion para exponer el comportamiento de `app-chart`, dashboards y paginas analiticas. Esos datos pueden confundirse con mocks operativos cuando se propagan componentes hacia Wails, Tauri o Python.
**La leccion:** Los datos de showcase, stories y blueprints son demostrativos y no constituyen contrato de negocio. Toda aplicacion productiva debe enlazar sus graficos a contratos backend, SP o vistas versionadas. Cuando un consumidor no tenga datos reales, debe renderizar estado vacio o contrato vacio, no valores inventados.
**Regla de propagacion:** Los ejemplos de graficos en Atomic UI deben estar rotulados como demo y consumir tokens `--chart-color-*`, `--chart-grid-color`, superficie y tooltip. Al copiar componentes a Wails, Tauri o Python, se propaga el componente y los tokens, pero no los arreglos demo de datos.

---

## [2026-07-16] - Reserva inferior en tablas con scroll sincronizado
**Contexto:** La grilla nominal del indicador 11 combinaba `ScrollOverlayComponent`, cuerpo de tabla scrolleable (`tbody[data-so-vertical]`), columnas sincronizadas con grid y barra horizontal superpuesta. En ese escenario, la ultima fila quedaba visualmente demasiado cerca de la barra horizontal y el texto secundario de `Estado TA` podia percibirse incompleto.
**La leccion:** En tablas sincronizadas por grid, no se debe depender de `tbody::after` para crear aire al final del scroll. El `tbody` actua como scroller real y debe recibir `padding-bottom` y `scroll-padding-bottom` condicionados por `so-has-overflow-x`. La reserva debe ser mayor que el grosor visual de la barra; por ello `--so-scroll-end-space` usa `calc(var(--so-track-size) + var(--space-8))`.
**Regla de propagacion:** Cualquier ajuste de `ScrollOverlayComponent`, `TableComponent`, `table-tokens.css` o `responsive-table.css` debe aplicarse primero en Atomic UI y luego copiarse a Wails, Tauri y Python. Los consumidores no deben resolver este problema con estilos locales porque se generaria drift visual entre aplicaciones.
**Regla visual:** Las celdas cuyo unico contenido es `app-chip` pueden centrarse verticalmente mediante `display: flex; align-items: center;`. Las celdas compuestas, como `Estado TA`, deben conservar flujo vertical para mostrar el chip y el detalle secundario sin comprimir el texto.

---

## [2026-07-01] - Auditoria de Ecosistema: Drift, Dependencias y Seguridad

### 1. El Drift Silencioso en Ecosistemas Multi-Repo
**Contexto**: La auditoria SHA-256 de todos los archivos `shared/ui` revelo que 10 archivos tenian drift y 5 estaban completamente ausentes en Tauri y Wails. En ningun momento hubo errores visibles — el drift se acumula silenciosamente.
**La Leccion**: Los fixes aplicados en un consumidor (Wails, Tauri) deben retroalimentarse SIEMPRE a Atomic-UI (Fuente de la Verdad) antes de propagarse. El flujo correcto es: *Arreglar en Atomic-UI → Propagar a consumidores*. Nunca al reves. Validar con SHA-256 periodicamente es la unica forma de detectar drift oculto.

### 2. Las Dependencias de package.json tambien son parte de la Fuente de la Verdad
**Contexto**: `chartjs-plugin-datalabels` estaba en `package.json` de Tauri y Wails pero faltaba completamente en Atomic-UI, causando errores TS2307 unicamente en la fuente. Los errores eran invisibles en los consumidores porque tenian el paquete.
**La Leccion**: Atomic-UI debe tener instaladas TODAS las dependencias que sus componentes consumen, aunque los consumidores tambien las tengan. El `package.json` de Atomic-UI es tambien la Fuente de la Verdad de dependencias. El script de propagacion deberia incluir una verificacion de paquetes cruzada.

### 3. API Breaking Change en ngx-translate v18 (TranslateModule eliminado)
**Contexto**: Wails tenia `@ngx-translate/core@^18.0.0` mientras Atomic-UI y Tauri usaban `^17.0.0`. Los componentes propagados que usaban `TranslateModule` fallaban con `TS2724` en Wails porque v18 elimino esa exportacion.
**La Leccion**: Al propagar componentes que dependen de librerias con versiones semanticas distintas entre proyectos, el primer paso es alinear TODAS las versiones al semver del proyecto Fuente de la Verdad. Nunca asumir que `^18` incluye la API de `^17` — los breaking changes son reales aunque sean parches mayores.

### 4. Scripts de Desarrollo con Credenciales Hardcodeadas (OWASP A07)
**Contexto**: Se encontraron credenciales SQL Server (`sa:Password123.@10.100.6.11`) hardcodeadas en 14 archivos a lo largo del workspace (3 scripts `.go` raiz, 11 archivos `.js` en `db_test/`, 1 archivo `scratch/test_db.go`).
**La Leccion**: Los scripts de utilidad de desarrollo deben seguir el mismo patron de seguridad que el codigo de produccion. El patron correcto para scripts locales es: centralizar en `config.js` o usar el keyring del sistema (`go-keyring`), gitignorear el archivo de credenciales, y proveer un `config.example.js` como plantilla. Ningun password debe existir en texto plano en el repositorio.

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
**La Lección**: En Rust, `row.get::<T>` hace `unwrap` interno de los tipos SQL exactos. Si SQL manda un FLOAT donde Rust pide un INT, la aplicación colapsa y Angular atrapa el error como "conexión caída". Toda capa Repository en Tauri debe usar estrictamente iteradores `.try_get()` aplanados a defaults: `row.try_get::<i32, _>("col").ok().flatten().unwrap_or(0)`.

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
- **Lección Aprendida:** **NUNCA se debe asumir que una mejora en Wails es análoga a Tauri.** Queda estrictamente prohibido desarrollar mezclando o copiando sintaxis entre ecosistemas. A partir de ahora, cada ecosistema (Python, Wails, Tauri) debe ser desarrollado **de forma individual con su sintaxis nativa** y respetando sus propios paradigmas y librerías. Cualquier nueva característica o corrección requiere una auditoría profunda e independiente en su respectivo entorno para solucionar el problema de raíz, sin asumir paridad automática con los otros frameworks.

## Desbordamiento silencioso en grillas Flexbox
- **Contexto:** Al usar el sistema en aplicaciones como el Acopiador HRA en Python, ciertas tarjetas de consola de texto forzaban el crecimiento vertical de la ventana más allá de `100vh`.
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
