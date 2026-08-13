---
title: 'Registro de cambios de Atomic UI'
document_type: 'changelog'
version: '5.7.1'
status: 'vigente'
updated: '2026-08-13'
owner: 'Hospital Regional de Ayacucho'
---

# Registro de cambios

Todas las modificaciones importantes de este proyecto se documentan en este
archivo. El formato se basa en
[Keep a Changelog](https://keepachangelog.com/es/1.0.0/).

## [Sin publicar]

## [5.7.1] - 2026-08-13

### Agregado

- **`app-button` acepta `ariaLabel`, `ariaControls` y `ariaExpanded`.** Sin
  ellas, un boton de divulgacion —el que abre un cajon o un menu— solo podia
  declarar `aria-expanded` sobre `<app-button>`, que es un elemento sin rol: el
  atributo quedaba inerte y el lector anunciaba un boton corriente que nunca
  decia si estaba abierto o cerrado. Se veia bien, se pulsaba bien, y no
  informaba.
  `ariaExpanded` admite `null` a proposito, y es el valor por omision: un boton
  que no despliega nada NO debe declarar el atributo, porque
  `aria-expanded="false"` sobre algo que no se abre es una promesa falsa.

  Lo destapo migrar el consumidor a la politica 1.2.2, que prohibe primitivas
  visuales nativas en la superficie gobernada: al convertir el boton de menu de
  su shell en `app-button`, su `aria-expanded` se quedaba sin sitio donde vivir.

## [5.7.0] - 2026-08-13

Cierra el rescate abierto en 5.6.0 y resuelve lo que aquella dejo anotado como
conocido y sin resolver.

### Agregado

- **`check:catalog-api`**, cableada en `governance:check`: compara las entradas
  declaradas en `catalog/components/*.json` con las que el componente declara de
  verdad (`@Input()`, `input()`, `input.required()` y `model()`).
  Nace de que la ruptura de `alert` en 5.6.0 dejo atras el catalogo, el
  generador y su test, y `governance:check` los encontro DE UNO EN UNO porque la
  cadena se detiene en el primer paso rojo. El catalogo es la peor superficie de
  tener desactualizada precisamente porque no rompe nada: ningun compilador lo
  lee, lo leen las herramientas y quien pide un componente sin abrir su codigo.
  En su primera ejecucion encontro deriva real: `data-table.pagination`,
  `file-input.maxPreviewSizeMB` y `file-input.maxPreviewFiles`, ya documentadas.
- **Roles de tabla declarados bajo la rejilla de columnas.** Con
  `syncTableColumns` —activo por omision en cuanto hay `<thead>`— las filas
  pasan a `display: grid` y el cuerpo a `display: block`. Se declara ahora la
  jerarquia completa: `table`, `rowgroup`, `row`, `columnheader`/`rowheader` y
  `cell`. Se aplica en `syncGeometry`, de modo que una fila que llega con datos
  nuevos nace con su rol, y solo se escribe cuando el valor difiere.
- **Cobertura de maquetacion de columnas** para `app-table`, rescatada de la
  rama y reescrita contra el DOM de main: que la plantilla llegue verbatim y al
  nodo correcto, que cabecera y celda queden alineadas, que sin plantilla mande
  el contenido y que sin `<thead>` no haya rejilla.

### Nota sobre los roles de tabla

Cambiar el `display` de los elementos de tabla ha retirado historicamente su rol
implicito; Chrome y Firefox lo corrigieron y Safari con VoiceOver ha sido el
rezagado. **No se ha medido en este repositorio**: la suite corre en Chrome
Headless, `Element.computedRole` no esta disponible y no se logro instrumentar
el arbol de accesibilidad. La decision no se apoya en un defecto demostrado sino
en una asimetria: declarar el rol cuesta unas pocas escrituras condicionales, es
inocuo donde el navegador ya lo conserva, y es la diferencia entre una tabla
navegable y una lista de textos donde no. **Queda pendiente validarlo con NVDA o
VoiceOver.**

## [5.6.0] - 2026-08-13

**Numero nuevo a proposito.** Durante agosto dos historias paralelas de este
repositorio publicaron un 5.4.0 y un 5.5.0 con el mismo numero y contenido
distinto, de modo que «la version 5.5.0» dejo de identificar nada. No se
reutiliza ningun 5.5.x: 5.6.0 es el primer numero que vuelve a designar un solo
arbol. `main` es el tronco unico desde aqui.

Esta version RESCATA sobre `main` el trabajo que se habia quedado en la rama
`PREST-20260805-194-contraste-y-531`, rehaciendolo en vez de fusionarlo: la
fusion producia 13 conflictos y ninguna de las dos resoluciones compilaba.

### Cambios que rompen

- **`alert` unifica su API con la que ya habla el consumidor.** `variant` pasa
  a `kind` y `flowSpacing` a `spacing` —renombrado puro, mismo conjunto de
  valores—. Se retiran `size`, que competia con el sistema de espaciado sin uso
  legitimo, y `message`, que duplicaba la proyeccion de contenido: el cuerpo va
  ahora siempre como contenido proyectado.
  Los tipos `AlertVariant`, `AlertSize` y `AlertFlowSpacing` desaparecen; los
  sustituyen `AlertKind` y `AlertSpacing`. El barrel conserva el alias
  `AlertComponent` junto al nombre nuevo `Alert`.
  **El generador de UI y el catalogo tambien se actualizan**: `generate-ui`
  emitia plantillas con la API vieja, de modo que los proyectos generados no
  compilaban, y `catalog/components/alert.json` declaraba entradas que ya no
  existen. Quien genere un proyecto nuevo desde 5.6.0 obtiene `kind` y cuerpo
  proyectado.

### Agregado

- **Dos compuertas nuevas en `governance:check`:** `check:contrast`, que
  replica la cascada de `:root` y detecta que un tema herede tokens del bloque
  claro, y `check:focus`, que impide degradar una lista de PRIORIDAD de
  selectores a un `querySelector` singular.
  `check:focus` admite declarar `/* orden-dom: <motivo> */` cuando la lista es
  un conjunto y no una prioridad, **exigiendo motivo escrito**: un silenciador
  mudo convierte una compuerta en decoracion.

### Corregido

- **Contraste de los controles deshabilitados.** El bloque oscuro no declaraba
  `--input-disabled-bg` ni `--input-disabled-text` y heredaba los del bloque
  claro, anclado a `:root`: un campo casi blanco sobre pagina oscura con el
  texto a 2.05:1. brand-dark estaba en 1.68:1 y el propio tema claro en 2.31:1.
  Ademas once controles dividian su contraste con `opacity` DESPUES de
  resolverlo por token, lo que dejaba el resultado en 4.09:1 aun con los tokens
  corregidos; en `form-select` la flecha se atenuaba dos veces.
- **Contraste del texto de las alertas oscuras**, que apuntaba al color base del
  tono en vez de a su variante clara: 3.74:1 y 4.06:1, ahora 7.57:1 y 7.29:1.
- **Siete referencias a `--surface-card` y `--surface-input`**, tokens que no
  existen en ningun tema, en cuatro paginas del escaparate.
- **`file-input`: un archivo rechazado descarta la seleccion anterior.** Antes
  se ponia el mensaje de error y se salia sin tocar `files`, asi que el
  componente seguia mostrando el fichero viejo y el formulario no recibia
  cambio alguno: lo que se enviaba no era lo que la pantalla senalaba con el
  error.
- **`modal`: la lista de selectores de error vuelve a ser una prioridad.**
  Unida con comas y entregada a un `querySelector` singular devolvia orden de
  DOM, de modo que el marcador explicito `[data-modal-error]` perdia frente a
  cualquier `[role="alert"]` que apareciera antes en el marcado.
- **El gate dejaba de ver los comentarios de linea** y denunciaba como «color
  fijo» un color que estaba dentro de un `//`, tipicamente el que justifica el
  valor de un token.

### Conocido y sin resolver

- Con la rejilla de columnas activa, `scroll-overlay` cambia el `display` de
  `thead tr`, `tbody tr` y `tbody` **sin restituir ningun rol**, de modo que un
  lector de pantalla deja de anunciar filas y celdas. Afecta a los dos linajes
  y no se parchea aqui: un `role="table"` suelto, con los hijos ya sin rol,
  produce un arbol de accesibilidad invalido. Requiere decidirse entero y
  validarse con un lector de pantalla.

## [5.5.8] - 2026-08-12

### Corregido

- La identidad `git-clean-eol-v1` deja de depender de los finales de línea
  físicos, de `core.autocrlf` y de atributos globales o de sistema. El texto
  declarado con `text=auto|set` y `eol=crlf` se representa con LF; las rutas
  `-text` conservan bytes exactos. Los filtros, `ident`, codificaciones de
  árbol de trabajo y atributos no versionados se rechazan de forma cerrada.
- El gate y el instalador validan OID completos SHA-1 o SHA-256, remoto
  canónico, raíz Git exacta y coincidencia de `HEAD`. Cada ruta protegida
  compara además el modo y OID del commit con el OID calculado desde sus bytes
  físicos canónicos; `assume-unchanged`, `skip-worktree` y enlaces modo
  `120000` no pueden ocultar una divergencia.
- El manifiesto de fuentes se recalcula mediante un único verificador
  compartido que confina rutas, rechaza enlaces y comprueba inventario, bytes,
  hashes individuales y huella agregada. Los componentes exactos y adaptados
  exigen igualdad del conjunto de archivos, incluidos casos exclusivos del
  consumidor o ausentes en este.
- El instalador prevalida fuente, consumidor y destinos antes de aplicar
  cambios. Las escrituras se preparan en archivos temporales del mismo
  directorio y se confirman con respaldo y renombrado; un fallo parcial revierte
  el conjunto sin dejar modificaciones ni escribir fuera del repositorio.
- El workflow instalado obtiene el contrato como datos no confiables, fija la
  fuente `archware/-Atomic-UI`, ejecuta el gate canónico antes de dependencias,
  limita permisos a lectura y no persiste credenciales. El ruleset externo
  continúa siendo obligatorio para impedir que una solicitud degrade su propio
  workflow o referencia verificadora.

### Verificación

- Las pruebas cubren LF/CRLF, binarios, cambio semántico, filtros y codificación,
  atributos globales y `.git/info/attributes`, repositorios SHA-1/SHA-256,
  enlaces físicos y Git, rutas de escape y batching seguro para Windows.
- Los fixtures del consumidor cubren snapshots exactos y adaptados, archivos
  agregados/eliminados, `consumer-only`, `missing-in-consumer`, remotos
  alternos, raíces anidadas, `assume-unchanged`, `skip-worktree` y rollback
  exacto ante una escritura parcial inyectada.
- El manifiesto reproducible registra 157 fuentes y la huella SHA-256
  `60b7ecf42ab6324664e42116273eea91c55da10dc7b323b1e6bdf3ac48ed3848`.
- Identificador de cambio: `ATOMIC-20260812-PROVENANCE-PORTABILITY`.

## [5.5.7] - 2026-08-11

### Añadido

- `ScrollOverlayComponent` incorpora el modo `nativeScrollbars`, con barras
  nativas estilizadas mediante tokens, gutter estable, contención horizontal y
  supresión de los dos rieles overlay decorativos.
- `scrollAreaAriaLabel` nombra y vuelve enfocable el área interna cuando esta es
  el propietario real. `resetKey` restablece `scrollTop` y `scrollLeft` de todos
  los propietarios resueltos cuando cambia la identidad del conjunto de datos.
- `TableComponent` incorpora `unifiedScroll`, `scrollbarMode`, `scrollResetKey`,
  `ariaLabel` y `cellOverflow`. `TableCellComponent.wrap` permite envolver
  celdas descriptivas concretas cuando el resto de la tabla usa truncado con
  elipsis. El modo `overlay` es el valor predeterminado y `native` permanece
  disponible como alternativa explícita.

### Corregido

- En escritorio, la variante unificada concentra ambos ejes en un único
  viewport sin imponer la representación de sus barras. Los rieles Atomic y las
  barras nativas tokenizadas se seleccionan sin desactivar los ejes ni cambiar
  su propietario. A 768 px o menos elimina el scroll interno, devuelve el
  desplazamiento vertical a la página y retira `role`, `aria-label` y
  `tabindex` del elemento que deja de ser propietario.
- Los encabezados de las tarjetas responsive permanecen en el árbol accesible
  mediante ocultamiento exclusivamente visual; no se utiliza `display: none`.
- El recorrido utilizado al arrastrar cada thumb coincide con la longitud
  visible de su riel, incluso cuando ambos ejes están activos. El extremo del
  thumb alcanza ahora exactamente la última fila y la última columna.
- Los estilos de barras, truncado y envoltura residen en los componentes
  canónicos, por lo que el consumidor no necesita `::ng-deep` ni selectores de
  implementación de `ScrollOverlay`.

### Verificación

- Las pruebas focales cubren escritorio, cambio a layout móvil, región
  accesible, modo overlay predeterminado, barras nativas opcionales, cambio de
  representación, wheel no interceptado en modo nativo, limpieza de marcadores,
  reinicio de ambos ejes, arrastre hasta el máximo vertical y horizontal,
  truncado y excepción de envoltura.
- El catálogo registra los contratos de Table, TableCell y ScrollOverlay, y
  Storybook publica el viewport unificado verificable.
- El manifiesto reproducible registra 157 fuentes y la huella SHA-256
  `bfa959021cdc60202c700e95d6c5bc0da86928274a13e0c18b7cf1a4a12665d1`.
- Identificador de cambio: `ATOMIC-20260811-UNIFIED-TABLE-SCROLL`.

## [5.5.6] - 2026-08-10

### Corregido

- El manifiesto de fuentes calcula la identidad SHA-256 sobre una
  representación canónica independiente del final de línea materializado por
  cada checkout. Los archivos que Git trata como texto se representan con LF,
  mientras que los binarios conservan sus bytes exactos.
- El gate compara la transformación canónica con la representación `clean`
  calculada por Git. Cualquier filtro o codificación que altere contenido más
  allá de CRLF a LF se rechaza, por lo que no se relaja la detección de cambios
  semánticos.
- El contrato de distribución declara el esquema `git-clean-eol-v1` y el
  manifiesto registra dicha política junto con la huella del árbol.

### Verificación

- Una prueba automatizada comprueba que LF y CRLF producen la misma identidad,
  que un cambio de contenido modifica la huella y que una diferencia binaria
  permanece observable.
- La verificación independiente se ejecuta en el árbol de trabajo y en un
  checkout limpio con CRLF. Ambos entornos deben producir 157 fuentes y la
  misma huella SHA-256
  `faaf94f6d3d7faf5066c96001fcc8846b9e44ccdd776fe6b4d248fde297d5641`.
- La funcionalidad del menú contextual publicada en 5.5.5 permanece intacta;
  5.5.6 modifica exclusivamente la identidad reproducible, su contrato, sus
  pruebas y los metadatos de versión.
- Identificador de cambio: `ATOMIC-20260810-MANIFEST-EOL`.

## [5.5.5] - 2026-08-10

### Añadido

- `ContextMenuComponent` incorpora un menú contextual accesible de edición de
  texto con las acciones Cortar, Copiar, Pegar y Seleccionar todo para inputs,
  áreas de texto y regiones `contenteditable` que declaran el opt-in
  `data-context-menu-policy="text-edit"` en navegadores embebidos que desactivan
  el menú nativo.
- La aplicación monta una única instancia vacía como hermana del shell. La
  molécula observa el documento sin exigir envolturas, proyección de contenido
  ni cambios en la jerarquía visual del consumidor.
- Los controles que ya administran un popup mediante `role="combobox"`,
  `aria-controls` o `aria-haspopup` conservan su menú propio por defecto. La
  política `data-context-menu-policy="native"` permite excluir cualquier otro
  control sin modificar su contrato ARIA.
- Un registro cooperativo limita el procesamiento de eventos a una instancia
  propietaria por `Document`. Las instancias adicionales conservan
  suscripciones inertes y la propiedad se reasigna de forma determinista al
  destruir la propietaria.
- El componente admite apertura mediante clic secundario, `Shift+F10` y la
  tecla de menú contextual. La navegación utiliza flechas, `Home`, `End` y
  `Escape`, omite acciones deshabilitadas, conserva la selección y limita la
  superficie al viewport.
- El barrel público, el catálogo y Storybook registran la molécula, sus estados,
  contratos observables, tokens, comportamiento responsive y escenarios para
  campos editables, contraseña protegida y sustitución desactivada.

### Seguridad

- Los inputs de contraseña canónicos exponen
  `data-clipboard-policy="paste-only"` a partir de su tipo lógico. La política
  permanece activa cuando el valor se revela como texto y bloquea las
  interacciones DOM de Copiar, Cortar, `deleteByCut` y `dragstart` gestionadas
  por el componente, mientras conserva Pegar y Seleccionar todo.
- La entrada `[disabled]` suprime el menú visual sin desactivar los resguardos
  `paste-only` registrados sobre el `Document`.
- La política `paste-only` se documenta como resguardo de interacción y no como
  solución DLP. No impide la extracción mediante scripts con acceso al DOM,
  XSS, extensiones del navegador ni un host comprometido.
- Las operaciones permanecen dentro de las APIs del navegador. No se incorpora
  IPC de portapapeles, persistencia del contenido ni transferencia de datos al
  backend; las salidas públicas informan únicamente la acción o un error
  normalizado mediante una razón tipada, sin propagar excepciones del navegador.

### Verificación

- Identificador de cambio: `ATOMIC-20260810-CONTEXT-MENU`.

## [5.5.4] - 2026-08-10

### Mejorado

- `FloatingInputComponent` sustituye el toggle de contraseña excluido del
  recorrido de teclado por un `button` nativo enfocable. La acción conserva la
  API existente, cambia su nombre entre `Mostrar contraseña` y
  `Ocultar contraseña`, expone el estado mediante `aria-pressed`, referencia el
  input mediante `aria-controls`, se deshabilita junto con el campo y excluye
  el glifo Font Awesome del nombre accesible mediante `aria-hidden`.
- El toggle presenta el anillo de foco definido por
  `--shadow-focus-primary` y conserva el foco después de alternar entre
  `password` y `text`. La fuente suprime de forma scoped `::-ms-reveal` y
  `::-ms-clear` para impedir un segundo control nativo en WebView2 aunque la
  hoja global de formularios no esté disponible.
- El catálogo incorpora el contrato estable `floating-input`, incluidas sus
  variantes, entradas compatibles, estados accesibles, tokens y evidencias.

### Verificación

- Las pruebas unitarias verifican control nativo, orden de tabulación,
  asociación con el input, nombre dinámico, `aria-pressed`, glifo decorativo,
  conservación del foco, deshabilitación conjunta y supresión scoped de los
  controles heredados de WebView2.
- Storybook incorpora una prueba de interacción del toggle con Tab, Enter y
  Espacio, además de escenarios visuales en tema claro, tema oscuro y viewport
  móvil.
- La historia `Acción asíncrona segura` automatiza `busy`, bloqueo de Escape,
  cierre antes del Toast en éxito y permanencia con foco de alerta en error.
  Una prueba Angular independiente valida el mismo ciclo sin transporte ni
  reglas de dominio.
- La suite completa finaliza con 336 pruebas correctas; la aplicación, la
  biblioteca Angular y Storybook compilan sin errores.
- El manifiesto registra 156 fuentes y la huella SHA-256 del árbol
  `e1241929d3fa93c097566ff897d86c95c4edf4350a76de208622a76bacbe328c`.
- Identificador de cambio: `ATOMIC-20260810-554-FLOATING-PASSWORD-A11Y`.

## [5.5.3] - 2026-08-10

### Mejorado

- `ButtonComponent` incorpora el estado `loading`: aplica `disabled` nativo,
  expone `aria-busy`, conserva la etiqueta accesible, presenta el spinner
  Atomic como decorativo y suprime activaciones repetidas mientras la operación
  permanece pendiente.
- `ModalComponent` incorpora `busy`, bloquea el botón X, Escape y backdrop
  durante una acción asíncrona, y expone `focusError()` para enfocar feedback
  proyectado mediante `data-modal-error`, `data-dialog-error`, `role=alert` o
  `aria-invalid`. El método intenta de inmediato y, si Angular todavía no
  renderizó el mensaje, reintenta una vez después del render. `CrudDialog` y
  `FormDialog` publican el mismo contrato de foco.
- El contrato transaccional distingue las comprobaciones no persistentes de
  las operaciones de guardado: una prueba puede conservar el diálogo abierto y
  mostrar un estado inline; guardar o conectar cierra solo tras éxito y crea un
  único Toast global después de retirar el overlay; un fallo mantiene el
  diálogo abierto y mueve el foco a su alerta.
- Los iconos del Toast se excluyen del nombre accesible. `PopupService` conserva
  su función interruptiva y no sustituye el feedback global poscierre.

### Verificación

- Las pruebas reproducen el doble envío, el cierre durante una operación
  pendiente y la pérdida de foco del error. Las nuevas expectativas comprueban
  `disabled`, `aria-busy`, spinner decorativo, bloqueo de cierre, foco de alerta
  y permanencia del Toast en top layer. Una prueba host crea la alerta después
  de invocar `focusError()` y verifica el foco post-render.
- Storybook incorpora `Acción asíncrona segura`, con recorridos controlados de
  éxito y error sin integrar reglas de dominio ni transporte.
- La suite completa finaliza con 332 pruebas correctas. El QA interactivo
  valida escritorio y 390 × 844: bloqueo durante carga, foco post-render,
  restauración de foco y un único Toast visible después del cierre.
- El manifiesto registra 156 fuentes y la huella SHA-256 del árbol
  `e1752a598e78aed4033b33683ce2ce970ce021eb0c64a693360d1995480ca4cf`.
- Identificador de cambio: `ATOMIC-20260810-553-ASYNC-ACTIONS`.

## [5.5.2] - 2026-08-10

### Mejorado

- Se amplió el contrato accesible de `combobox` y `select2`: ambos exponen un
  nombre cuando no existe etiqueta visible, anuncian opciones deshabilitadas,
  omiten esas opciones durante la navegación por teclado y rehidratan las
  etiquetas seleccionadas cuando cambia un catálogo asíncrono. `select2`
  identifica además cada acción de retiro en selecciones múltiples.
- Las tarjetas clicables muestran foco para todas sus variantes y ya no activan
  su evento cuando la interacción pertenece a un control proyectado. La tarjeta
  enfocada conserva la elevación de capa requerida por listas desplegables.
- El pie separa la información de soporte de la declaración legal, incorpora
  etiquetas legibles para redes sociales, respeta movimiento reducido y usa el
  año corriente como valor predeterminado.
- `ButtonComponent` incorpora `fullWidth`, un contrato tipado que expande tanto
  el host como el botón nativo. El blueprint de acceso lo utiliza en sus
  acciones primarias y declara propósitos de autocompletado. Los iconos
  decorativos quedan fuera del nombre accesible para que los lectores de
  pantalla anuncien solamente la etiqueta de la acción.
- El diálogo mantiene el overlay como superficie pasiva, mueve el foco inicial
  al contenido, encierra el recorrido con Tab, restaura el disparador al
  cerrarse y reserva separación inferior segura en pantallas reducidas.
- Los errores remotos entregados a `FormErrorComponent` se presentan aunque no
  exista un control de formulario asociado. El blueprint de acceso evita
  efectos creados fuera del contexto de inyección y recupera sus estados de
  confirmación visibles.

### Verificación

- Se añadieron pruebas de foco, apilamiento, ancho adaptable, estados
  deshabilitados, ARIA, selección asíncrona, retiro de etiquetas, pie y
  recuperación del foco del diálogo. Storybook incorpora escenarios de capa,
  pantalla reducida, modo oscuro y controles de ancho completo.
- Las historias modificadas declaran identificadores HTML válidos y estables,
  de modo que Storybook puede renderizarlas aunque su título visual conserve la
  numeración de la jerarquía Atomic Design.
- La versión de fuente y biblioteca avanza a `5.5.2`. El manifiesto registra
  156 fuentes y la huella de árbol
  `59d53f85b43a27817d094062a0568c58ba6fc8e8baf6ecd3c7e85900420536f0`;
  las 325 pruebas unitarias completan sin fallos.

## [5.5.1] - 2026-08-10

### Seguridad

- Se alinearon Angular y sus herramientas dentro de la versión mayor 22 y se
  fijaron versiones corregidas de PostCSS, Less, `@modelcontextprotocol/sdk` y
  `@hono/node-server`. La auditoría de npm pasó de diez alertas altas a cero
  vulnerabilidades.
- Las acciones externas de los workflows se fijaron por SHA de commit para
  impedir que una etiqueta mutable cambie el código ejecutado por CI. Los jobs
  de validación conservan permisos de solo lectura y únicamente el despliegue
  manual recibe escritura sobre el contenido del repositorio.
- La publicación automática de Storybook en GitHub Pages se sustituyó por una
  autorización manual explícita mediante `workflow_dispatch`.

### Corregido

- Se resolvió la superposición de `app-select2` y `app-combobox` entre tarjetas.
  `container-type: inline-size` crea contextos de apilamiento independientes;
  por ello, la tarjeta con foco se eleva mediante `:focus-within` y cada control
  abierto eleva su contenedor dentro de esa tarjeta.
- El pie prioriza el entorno entregado por `AppVersionService` sobre el valor
  visual de respaldo. De este modo, una aplicación productiva no puede quedar
  rotulada como `BETA` por un valor predeterminado del componente.
- El blueprint de acceso utiliza la identidad institucional predeterminada del
  pie en lugar de sobrescribirla con texto de ejemplo.

### Procedencia y verificación

- La versión de fuente y biblioteca avanza a `5.5.1`. El manifiesto registra
  156 fuentes y la huella de árbol
  `14311483c1f5eb4c159facae5565d7c98b94f5b5978fe145c0640ed3a43a3f4d`.
- Las 303 pruebas unitarias cubren también el apilamiento de tarjeta, `select2`,
  `combobox` y la precedencia del entorno del pie. El gobierno integral, lint,
  la aplicación, la biblioteca Angular y Storybook completaron sus compuertas.

## [Gobernanza 1.2.1] - 2026-08-07

Cambio normativo sin cambio de paquete (mismo criterio que 1.2.0): la identidad
`5.5.0` (`atomicSourceTreeSha256`) permanece intacta.

### Agregado

- **El shell es superficie gobernada (invariante 13):** el manifiesto del
  consumidor debe declarar `shellRoot` (p. ej. `"src/app"`); el gate escanea
  los archivos directos de ese directorio (`.ts`/`.html`/`.css`/`.scss`, no
  recursivo, `*.spec.ts` exentos) con las mismas reglas de features: sin
  primitivas visuales nativas, sin `style=` inline (también en plantillas TS),
  sin colores fijos y sin fragmentos `NNvar(`/`-var(`. La ausencia de
  `shellRoot` bloquea el gate. Motivación: `app.component.ts` del tablero no
  pertenecía a ningún `featureRoot` y un estilo inline con token fantasma
  `var(--surface-base, #f8fafc)` (más un `app.component.css` residual con hex
  fijos) rompió el modo oscuro sin detección.
- **Instalador conforme:** `tools/install-consumer-governance.js` deriva
  `shellRoot` del `uiRoot` (`X/shared/ui` → `X`; en otros casos, el directorio
  padre) y lo escribe en el manifiesto; los proyectos de
  `tools/create-project.js` nacen con `shellRoot: "src/app"` y shell limpio.
- **Pruebas:** casos nuevos en `tools/test-consumer-governance.js` (`style=`
  inline en plantilla TS del shell, color fijo en el shell y manifiesto sin
  `shellRoot` → fallan; shell limpio → pasa) y aserciones de política `1.2.1`
  con `shellRoot` en `tools/test-project-generator.js`.

## [Gobernanza 1.2.0] - 2026-08-06

Cambio normativo sin cambio de paquete: `governance/` y `tools/` no forman parte
del manifiesto de fuentes, por lo que la identidad `5.5.0`
(`atomicSourceTreeSha256`) permanece intacta; solo la política de gobernanza de
consumidores sube de `1.1.0` a `1.2.0`.

### Agregado

- **Servicios de presentación gobernados (invariante 12):** el gate
  `governance/consumer/check-atomic-provenance.mjs` exige ahora que el
  manifiesto declare `governedServices` con `theme.service.ts`,
  `app-version.service.ts`, `modal.service.ts`, `popup.service.ts` y
  `toast.service.ts` (cada uno exactamente una vez), en modo `exact` (hash
  idéntico consumidor↔Atomic) o `adapted` (snapshot `localSha256`/`atomicSha256`
  que debe coincidir con ambos archivos reales). Motivación: `theme.service.ts`
  desactualizado rompió el modo oscuro del dashboard y `modal.service.ts`/
  `popup.service.ts` conservaban un linaje viejo con bug sin que ningún gate lo
  detectara.
- **Instalador y generador conformes:** `tools/install-consumer-governance.js`
  audita los cinco servicios, copia desde Atomic los ausentes, bloquea
  divergencias sin registro de decisión (mismo flujo `exit 2` que los
  componentes) y emite `governedServices` en el manifiesto; los proyectos de
  `tools/create-project.js` nacen con los cinco servicios en modo `exact`.
- **Pruebas:** `tools/test-consumer-governance.js` cubre servicio no declarado,
  copia `exact` alterada, `adapted` con snapshot válido y cambio de la fuente
  Atomic bajo `adapted`; `tools/test-project-generator.js` verifica que el
  proyecto generado declare los servicios gobernados con política `1.2.0`.

## [5.5.0] - 2026-08-06

### Agregado

- **Biblioteca `@hra/atomic-ui` compilable:** nuevo proyecto Angular de tipo `library` (`projects/atomic-ui`, builder `@angular/build:ng-packagr`, ng-packagr ^22 declarado como devDependency). El `entryFile` es el barrel visual canónico `src/app/shared/ui/index.ts`, de modo que la API pública empaquetada coincide exactamente con la superficie visual sin mover fuentes (ng-packagr fija `rootDir` en el directorio del entryFile, lo que descarta un `public-api.ts` intermedio en `projects/`). `npx ng build atomic-ui` produce Angular Package Format (fesm2022 + declaraciones, `compilationMode: partial`) en `dist/atomic-ui`.
- **Tokens de tema distribuidos:** `src/styles/themes/tokens.css` como punto de entrada distribuible y `npm run lib:build` (build + `tools/copy-lib-tokens.cjs`) que copia `src/styles/themes/*.css` a `dist/atomic-ui/tokens/`, expuestos como `@hra/atomic-ui/tokens`. La copia es externa porque ng-packagr 22 prohíbe `assets` fuera de `projects/atomic-ui`.
- **`projects/atomic-ui/package.json`:** paquete `@hra/atomic-ui` 5.5.0 con `"sideEffects": false`, dependencias Angular/rxjs/ngx-translate/chart.js/ng2-charts como `peerDependencies` y `tslib` como única dependencia runtime.

### Cambiado

- **Barrel visual puro:** `src/app/shared/ui/index.ts` ya no exporta preocupaciones de aplicación — `ApiService`, `useApi`/`UseApiService`, `AuthService`, `TokenService`, `authGuard`/`guestGuard`/`passwordChangeGuard`, `authInterceptor`, `cacheInterceptor`/`invalidateCache`, `PermissionDirective` ni `GlobalErrorHandlerService` (con sus tipos). Esas plantillas siguen en el repositorio y se importan por ruta directa (`@shared/ui/services/auth.service`, `@shared/ui/guards/auth.guard`, etc.); los blueprints (`login`, `register`, `forgot-password`, `profile`, `settings`, `dashboard`, `crud-table`, `auth-guards`) y su documentación quedaron redirigidos. La línea divisoria está documentada en el propio barrel.
- **Contrato de distribución honesto:** `distribution/package-contract.json` pasa de `blocked-scaffold` a `library-buildable`; los bloqueadores `ANGULAR_PROJECT_IS_APPLICATION`, `NG_PACKAGR_NOT_DECLARED` y `PUBLIC_API_CONTAINS_APPLICATION_CONCERNS` constan como resueltos y permanecen vigentes `PACKAGE_NOT_PUBLISHED_TO_REGISTRY` y `RELEASE_PROVENANCE_UNSIGNED`. `tools/check-package-distribution.js` verifica ahora el estado real: proyecto library con ng-packagr declarado, entryFile y versión de la biblioteca sincronizados, ausencia de símbolos de aplicación en el barrel y el inventario SHA-256 ampliado a `projects/atomic-ui`.

## [5.4.2] - 2026-08-06

### Arreglado

- **`text.component.ts`:** corregida la declaración inválida `color: var(--white, var(--gray-0)fff)` (residuo `fff` de una sustitución mecánica que hacía descartar la declaración) → `var(--white, var(--gray-0))`.
- **`tools/check-invalid-css-values.js`:** nuevo patrón que detecta residuos alfanuméricos pegados tras `var(...)` (p. ej. `var(--gray-0)fff`), cerrando la tercera variante de la familia de sustituciones mecánicas (junto a `NNvar(` y `-var(`).

## [5.4.1] - 2026-08-06

### Arreglado

- **Supresión global de `::-ms-reveal`/`::-ms-clear`:** en WebView2 (Edge) el "ojo" nativo de los inputs de contraseña reaparecía junto al toggle propio de `floating-input` (regresión detectada al retirarse el guard `validate-webview-password-controls.js` de los consumidores). `_forms.css` oculta ahora ambos pseudo-elementos de forma global: el control de visibilidad es custodiado y lo provee `floating-input`.
- **Datalabels de Chart.js con color irresoluble:** el canvas no interpreta variables CSS, por lo que `Chart.defaults.plugins.datalabels.color = 'var(--gray-0)'` caía al color por defecto. El token `--gray-0` se resuelve ahora con `getComputedStyle` dentro de `applyChartTheme`, de modo que se reevalúa junto al resto del tema al cambiar entre claro y oscuro.

## [5.4.0] - 2026-08-06

La linea `5.4.0-beta.1` (2026-08-05) se consolida como `5.4.0` estable: los
cambios no eran experimentales y esta version es el ADN oficial de los
consumidores Python, Wails, Tauri y el tablero de resultados.

### Agregado

- Añadida la clase utilitaria estructural .atomic-form-stack a _forms.css para estandarizar la separación vertical de 24px (gap: 24px / var(--space-5)) en modales de configuración y formularios. Esta mejora garantiza uniformidad visual en todo el ecosistema (Python, Wails, Tauri).

### Arreglado

- **Erradicacion de la familia `-var(...)`:** corregidas 20 declaraciones CSS invalidas (el parser descartaba la declaracion completa) en `badge` (posicionamiento de las 4 esquinas), `floating-input` (label flotante), `avatar-group` (solapamiento de avatares), `table`/`table-tokens` (hover-lift de filas), `card`, `panel`, `stepper`, `user-menu` y los keyframes de `select2`, `dropdown` y `language-switcher`. La forma canonica de negar un token es `calc(-1 * var(--token))`.
- `tools/check-invalid-css-values.js` detecta ahora tambien el patron `-var(` (antes solo `NNvar(`), cerrando el hueco que dejo pasar la familia anterior.

### Gobernanza

- **Politica Atomic-first 1.1.0:** el gate de consumidores (`governance/consumer/check-atomic-provenance.mjs`) escanea ahora tambien los archivos `.ts` de las raices de features — primitivas visuales nativas en plantillas embebidas, `style=` inline en el marcado, colores fijos y negaciones invalidas de tokens (`*.spec.ts` exentos). Los consumidores deben copiar el gate actualizado y declarar `policyVersion: "1.1.0"`.

## [5.3.0] - 2026-08-03

### Integrado

- Se integra la línea ascendente `5.2.1`, que incorpora el catálogo ejecutable,
  el generador declarativo de interfaces y el control de un único propietario
  de desplazamiento, con la línea local `5.1.40`, que incorpora el contrato de
  distribución transicional, el gobierno de consumidores HRA y el saneamiento
  de contratos TypeScript.
- La resolución conserva los cambios de ambas líneas de desarrollo y explicita
  los puntos en que el historial utilizó el mismo número de versión para
  entregas distintas. Las entradas históricas se mantienen en sus secciones y
  no se reinterpretan como resultados de la integración actual.

### Estado de verificación

- La integración supera lint, compilación Angular, construcción de Storybook y
  299/299 pruebas en `ChromeHeadlessNoSandbox`.
- El gobierno integral valida catálogo, blueprints, tokens, selectores, valores
  CSS, generador declarativo y contrato transicional de distribución. El smoke
  test crea sin red un shell gobernado con 76 componentes y verifica cero
  violaciones de procedencia.
- El manifiesto de cada consumidor fija de forma conjunta la referencia Git,
  la versión y la huella SHA-256 de Atomic. El gate rechaza versiones o huellas
  que no correspondan a la fuente disponible.
- El manifiesto registra 151 fuentes con SHA-256 del árbol
  `9e50ba997303dbf1cd5c11b505cad2bc18e383b0dc2326d92bd3d4442ccc423d`.
  La biblioteca Angular compilada continúa bloqueada por contrato; estas
  verificaciones no autorizan su publicación.

## [5.2.1] - 2026-08-02

### Mejorado

- `PREST-20260802-188`: auditoría integral de propietarios de scroll. Los
  diálogos CRUD altos y la navegación extensa usan un único `ScrollOverlay`;
  el `dialog` y el contenedor del sidebar recortan en lugar de competir con el
  viewport interno. Se documentaron los scrolls nativos localizados que deben
  conservarse en selectores, menús, tabs y paginación táctil.
- `PREST-20260802-185`: `FormDialog` mantiene visible su encabezado durante el
  desplazamiento. El cierre canónico se presenta como una única X superior,
  cuadrada y centrada respecto del encabezado; los pies quedan reservados para
  acciones reales o `Cancelar` en formularios.

### Corregido

- `PREST-20260802-193`: `Accordion` devuelve el foco al encabezado antes de
  colapsar un panel que contiene el control activo. De este modo `inert` y
  `aria-hidden` nunca ocultan el foco durante cierres programáticos posteriores
  a una operación exitosa.
- `PREST-20260802-192`: `ScrollOverlay` captura la rueda desde cualquier punto
  de su contenido y la dirige al viewport propietario. Los scrolls nativos o
  anidados conservan prioridad mientras pueden avanzar; al llegar al límite,
  el gesto continúa en el overlay exterior. Se mantiene el desplazamiento
  horizontal con `Shift` y se cubre el comportamiento con pruebas focales.
  Los gestos `Ctrl/Meta + rueda` permanecen bajo control del navegador para
  conservar el zoom y el pinch-zoom accesibles.
- `PREST-20260802-191`: `Input` y `Select` identifican visualmente los campos
  obligatorios con un marcador accesible, y `CrudDialog.focusInvalid()` dirige
  el foco al `input`, `select` o `textarea` nativo dentro del componente
  inválido en vez de dejarlo en el host no interactivo.
- `PREST-20260802-187`: `ScrollOverlay` mantiene un marcador estable para ocultar el scrollbar nativo
  en ambos ejes. La medición de tablas ya no produce destellos ni cambios de
  ancho del scrollbar del navegador.
- Un overlay exterior ya no limpia los atributos temporales de overlays
  anidados; cada instancia conserva sus propios scrollers y thumbs.

### Verificación

- Pruebas de contrato de propietario único en `CrudDialog`, `Sidebar`,
  `LayoutShell`, `FormDialog`, `DataTable` y `ScrollOverlay`.
- Prueba focal del encabezado fijo, suite Angular y propagación al frontend de
  préstamos.
- Pruebas focales de scroll horizontal/vertical administrado y aislamiento de
  overlays anidados.

## [5.2.0] - 2026-08-02

### Añadido

- `PREST-20260802-183`: catálogo ejecutable y versionado de componentes,
  variantes, recetas y reglas UX. Los agentes pueden consultar contexto por
  intención, componente o variante sin cargar la documentación completa.
- Generador declarativo para `modal-catalog`, `route-form` y `master-detail`,
  con contratos `ui-only` e `integrated`, validación estricta, `--dry-run`,
  salida determinista, escritura transaccional y rechazo de sobrescritura. El
  borrado exige acción, permiso y confirmación explícitos y deniega por defecto.
- `PageHeader` y `QueryToolbar` convierten en ADN Atomic los patrones repetidos
  de Front Atomic y publican variantes tipadas de densidad y disposición.
- Skill local `atomic-ui-builder`, fixtures y suites de tooling para que una
  solicitud UI siga el mismo flujo y las mismas compuertas.

### Mejorado

- `FormDialog` admite control declarativo con `[(opened)]`, estado `busy`, foco
  seguro y compatibilidad con su API imperativa.
- `ModalService` y `PopupService` conservan el identificador de la superficie
  que originó cada acción; una confirmación ya no cierra otra instancia cuando
  existen varias abiertas.
- El bootstrap genera un shell Angular 22 zoneless y gobernado. Los blueprints
  históricos quedan clasificados como demos y ya no se copian a consumidores.
- La app de referencia deja de importar su shell desde el barrel completo: el
  bundle inicial baja de 1,17 MB a 608,36 kB y Chart.js queda en carga diferida,
  sin ampliar el presupuesto de calidad.
- El gobierno valida catálogo, referencias, blueprints, tokens, generador y
  bootstrap, además de las pruebas y el build de la aplicación.

### Verificación

- Catálogo estricto, suites de tooling, smoke del bootstrap, lint sin
  advertencias, pruebas Angular, build de producción y build de Storybook.

## [5.1.42] - 2026-08-01

### Corregido

- `PREST-20260801-182`: `Toggle` adopta la inyección funcional exigida por el
  lint de Angular. `Select2` elimina el evento `click` redundante de una
  superficie no interactiva y `Sidebar` concentra la navegación por teclado en
  los botones de menú realmente enfocables.

### Verificación

- Lint sin errores ni advertencias de accesibilidad y prueba focal de navegación
  con flechas sobre los controles del menú.

## [5.1.41] - 2026-08-01

### Mejorado

- `PREST-20260801-181`: `KpiCard` refuerza el contenedor de iconos con un
  borde semántico tenue y conserva el tono explícito del indicador. El color
  informa contexto o estado; no convierte todos los KPI en acciones de marca.

### Verificación

- Pruebas focalizadas de `KpiCard` y `MetricsGrid` antes de propagar la
  adaptación al frontend de préstamos.

## [5.1.40] - 2026-08-01

### Mejorado

- `PREST-20260801-176`: `Button` incorpora la variante `soft` y tonos
  semánticos para acciones contextuales dentro de tarjetas, sin volver a
  saturar la interfaz con botones primarios.
- `outline` recupera una superficie neutral sutil para distinguir una acción
  disponible de un control deshabilitado sobre fondos oscuros.
- Las utilidades `surface-tone` aportan contexto cromático de baja intensidad a
  tarjetas de dominio y exponen un acento legible sin fijar colores en features.

### Corregido

- La actualización local del 3 de agosto elimina 29 advertencias de lint
  mediante contratos TypeScript explícitos, observables tipados y controles de
  teclado y foco verificables.
- `Chart` conserva el comportamiento de sombras y etiquetas sin recurrir a
  tipos `any`; `Select2` evita manejadores redundantes porque la detección de
  clic externo ya comprueba la pertenencia al elemento anfitrión.
- Los blueprints de analítica, CRUD, tablero, perfil y reportes publican tipos
  de navegación, formularios y opciones de gráficos coherentes con sus API.

### Gobierno

- El umbral preventivo del paquete inicial se alinea con el tamaño real de la
  aplicación SSR en 1,2 MB y conserva el límite de error en 1,5 MB. El ajuste
  evita una advertencia permanente sin ampliar el límite que bloquea el build.

### Verificación

- Contrato de variantes y tonos, gobierno Atomic, pruebas y build antes de la
  propagación al frontend de préstamos.
- En la revisión local del 3 de agosto se ejecutaron lint, 249/249 pruebas en
  `ChromeHeadlessNoSandbox`, build Angular y gobierno Atomic sin advertencias de
  código o presupuesto.
- El manifiesto local de 145 fuentes se regeneró con SHA-256
  `f8a6ac04d396bb08bce0777d4413409b8f00aef12c038b718f7ad8961e1ef9f5`
  antes de distribuir esa revisión a los consumidores gobernados.

## [5.1.39] - 2026-07-31

### Mejorado

- `PREST-20260731-173`: establece una jerarquía cromática de acciones. Las
  variantes `outline` y `ghost` son neutrales; el color primario queda reservado
  para la acción dominante de cada región.
- `KpiCard` incorpora tonos semánticos con `neutral` como valor predeterminado,
  evitando que todos los iconos compitan con las acciones de marca.
- Se publica `docs/POLITICA_COLOR_ACCIONES.md` como regla del ADN para nuevos
  diseños y propagaciones.

### Corregido

- La actualización local del 3 de agosto utiliza en la prueba canónica de
  `Accordion` un matcher booleano compatible con Jasmine y Vitest. La
  corrección permite conservar una copia exacta del componente y su prueba en
  consumidores Angular con ejecutores distintos.

### Verificación

- Pruebas de botón, KPI, grilla de métricas, gobierno y build antes de propagar
  el cambio al frontend.
- El manifiesto de fuentes se regeneró después de la corrección local y la
  adopción se validó nuevamente en los cuatro consumidores gobernados.

## PREST-20260731-168

- `Toggle` incorpora el selector compatible `prest-toggle`, semántica accesible
  de switch y notificación explícita de cambios para formularios zoneless.
- El contrato queda preparado para seleccionar configuraciones financieras sin
  trasladar reglas de cálculo al componente visual.

## Registros PREST anteriores a la versión 5.1.38

- `PREST-20260731-167`: `ActionGroup` formaliza el contrato de tres acciones
  visibles y desplaza desde la cuarta a un menú identificado por caret. El
  portal incorpora semántica de menú, navegación por teclado, retorno de foco y
  estados disabled/loading. `TableAction` agrega acciones semánticas de
  impresión, reversión, canales y contraseña, y normaliza `iconClass` para que
  un icono válido no se degrade al fallback de tres puntos.

- `PREST-20260731-162`: `FileInput` incorpora la densidad `compact` para
  formularios modales. Mantiene selección, arrastre, validación y accesibilidad,
  pero organiza el icono y la ayuda en una fila tokenizada que evita comprimir
  los demás campos del flujo de carga.

- `PREST-20260731-155`: `DenominationCounter` distingue los estados vacío,
  sugerido y confirmado, y permite confirmar en un clic una sugerencia
  controlada sin convertirla automáticamente en evidencia física. `Button`
  normaliza tokens y clases Font Awesome (`save`, `fa-save` o
  `fa-solid fa-save`) para impedir prefijos duplicados.

## [5.1.38] - 2026-07-31, actualizada el 2026-08-03

### Añadido

- `PREST-20260729-137`: fortalece el átomo `FileInput` como fuente canónica
  para carga documental: identificador estable, validación visible de
  extensiones/MIME y tamaño, estado touched, ARIA y estilos basados únicamente
  en tokens semánticos. El componente permanece agnóstico a créditos, contratos
  y almacenamiento.
- `PREST-20260729-133`: incorpora `PrintDocumentPanel`, organismo tipado para
  previsualizar y enviar paquetes A4 a un documento aislado. Admite páginas,
  campos, secciones, tablas y firmas sin conocer contratos financieros; todos
  los valores se insertan con `textContent`, y el consumidor decide contenido
  y permisos. Validación: gobierno Atomic, 227/227 pruebas y build.
- `ATOMIC-DIST-20260803-001`: se incorpora un contrato transicional para el
  futuro paquete `@hra/atomic-ui`, con inventario de exportaciones, manifiesto
  SHA-256 determinista y `npm pack --dry-run` privado, sin red y sin archivo
  `.tgz`.
- El gate de distribución documenta y comprueba que el repositorio continúa
  siendo una aplicación Angular, que `ng-packagr` no está disponible y que el
  barrel todavía expone responsabilidades propias de los consumidores. Un gate
  verde no se presenta como biblioteca compilada ni autoriza publicación.

### Gobierno

- El instalador clasifica una copia como `exact` solamente cuando coinciden el
  conjunto de archivos y sus hashes. `--audit-only` produce un reporte de solo
  lectura; una divergencia detiene la instalación antes de modificar el
  consumidor y exige un registro de decisión concreto.
- ESLint reserva `app-*` como prefijo canónico. La compatibilidad `prest-*` se
  limita a cuatro archivos heredados y un gate rechaza aliases sin su selector
  `app-*` equivalente, aliases fuera de la excepción o aliases declarados como
  selector principal.
- La guía del ecosistema elimina el fallback productivo a datos simulados y la
  recomendación de almacenar `.env` con credenciales junto al ejecutable.
- La versión canónica se alinea en `5.1.38` para el paquete, el lock, la
  documentación y el manifiesto de distribución.

### Corregido

- La fusión conserva el comportamiento responsive de máximo 4/2/1 columnas de
  `MetricsGrid` sin reservar columnas vacías.
- Los componentes incorporados publican `app-*` como namespace canónico y
  conservan `prest-*` únicamente como alias transitorio de compatibilidad.
- `DataTable`, `FileInput`, `ReceiptPanel`, `DenominationCounter` y
  `FormDialog` preservan la compatibilidad anterior y corrigen los defectos
  detectados durante la integración.
- `DataTable` conserva los valores predeterminados publicados en `5.1.37`:
  `showRowNumber=true` y paginación local. `pagination='none'` permanece como
  desactivación explícita y opt-in; no se redefine el modo predeterminado.
- El barrel público exporta `DataTableDensity` junto con el resto del contrato
  tipado de `DataTable`. Los inventarios documentales quedan alineados con los
  34 directorios de átomos, 18 de moléculas y 19 de organismos verificados.

### Verificación

- El manifiesto transicional avanza de 134 a 145 fuentes y conserva el
  empaquetado seco limitado a los archivos contractuales. El árbol resuelto
  declara el SHA-256
  `0d391bd3b16c2e0c3f30f226eca6473a038a0af1678173bdd9bfd1721a698684`.
- Gobierno Atomic, lint sin errores, 249/249 pruebas en
  `ChromeHeadlessNoSandbox` y build Angular aprobados antes de actualizar la
  procedencia de los consumidores.

### Mejorado

- El contador de denominaciones expone el estado de la información y una
  acción explícita para aceptar sugerencias proporcionadas por el consumidor.
- Los botones aceptan formas abreviadas o completas de Font Awesome mediante
  un único normalizador compatible.

### Verificación de la revisión original

- Pruebas unitarias de los tres estados del contador, confirmación de una
  sugerencia y normalización de iconos antes de propagar al consumidor.

## [5.1.37] - 2026-07-29

### Mejorado

- `FileInput` informa por qué rechaza un archivo y conserva el mismo contrato
  para selección, teclado y arrastre. Se elimina el ID aleatorio y cualquier
  color o radio de respaldo ajeno al sistema de tokens.

### Verificación

- Pruebas del átomo, gobierno Atomic, lint y build antes de propagar la
  adaptación al frontend.

## [5.1.36] - 2026-07-29

### Corregido

- `PREST-20260729-136`: `ScrollOverlay` agrupa señales consecutivas de
  `ResizeObserver` y `MutationObserver` en una sola sincronización de geometría
  por frame. El render progresivo de filas deja de provocar una lectura de
  layout por cada mutación del DOM.

### Verificación

- La regresión combina eventos de tamaño y mutación y exige una única
  sincronización programada; gobierno Atomic, lint sin errores, 229/229 pruebas
  y build correctos antes de propagar la adaptación al consumidor.
- Rollback: restaurar las llamadas inmediatas de los observadores. No cambia
  HTML, CSS, accesibilidad, API pública ni reglas de negocio.

## [5.1.35] - 2026-07-29

### Corregido

- `PREST-20260729-135`: `DataTable` deja el desplazamiento horizontal
  exclusivamente en el viewport interno de `ScrollOverlay`. El host recorta el
  contenido y ya no dibuja una segunda barra nativa.

### Añadido

- `DataTable` publica la densidad tipada `compact` para grillas operativas con
  muchas columnas. La variante reduce el espaciado de celdas con tokens sin
  alterar la densidad cómoda predeterminada ni la presentación móvil en
  tarjetas.

### Verificación

- Prueba de regresión que exige un único propietario del scroll y contrato de
  densidad compacta; gobierno Atomic, 228/228 pruebas y build correctos antes
  de propagar al consumidor.
- Rollback: retirar `density` y restaurar el overflow del host. No modifica
  datos, contratos HTTP ni reglas de negocio.

## [5.1.34] - 2026-07-28

### Corregido

- `PREST-20260728-123`: se recuperan las puertas CI de Atomic. ESLint reconoce
  los selectores canónicos `app-*` y `prest-*`, se eliminan imports y variables
  obsoletos, y Storybook usa la versión Node declarada por el repositorio.
- La publicación de Storybook carga el directorio real generado por el builder
  Angular en lugar de buscar `storybook-static`.
- Karma usa en CI el lanzador `ChromeHeadlessNoSandbox` provisto por Angular 22
  para ejecutar Chrome de forma estable en Linux.

### Verificación

- Lint sin errores, gobierno Atomic, pruebas, build de aplicación y build de
  Storybook antes de publicar el checkpoint.
- Rollback: revertir este incremento restaura la configuración anterior; no
  modifica contratos ni componentes consumidos por las aplicaciones.

## [5.1.33] - 2026-07-28

### Corregido

- `PREST-20260728-122`: `Toast` usa un popover manual para compartir la capa
  superior del navegador con los diálogos nativos. Cada notificación nueva se
  eleva sobre el popup activo y la región se retira cuando ya no quedan
  mensajes.

### Verificación

- Contrato de visibilidad sobre `<dialog>`, gobierno Atomic, pruebas y build
  antes de propagar al consumidor.
- Rollback: retirar el host `popover` y la sincronización de capa superior; el
  servicio y su API pública permanecen compatibles.

## [5.1.32] - 2026-07-28

### Corregido

- `PREST-20260728-117`: `TableAction` incorpora el tono semántico `info` y lo
  asigna a `view`. El ojo habilitado conserva una señal cromática clara en azul
  informativo sin competir con el morado primario reservado para acciones
  principales. El estado deshabilitado mantiene su semántica y opacidad.

### Verificación

- Contrato de tono informativo, gobierno Atomic, 222/222 pruebas y build antes
  de propagar al consumidor.

## [5.1.31] - 2026-07-28

### Corregido

- `PREST-20260728-116`: `TableAction` presenta la acción semántica `view`
  con el color primario cuando está habilitada. El estado deshabilitado
  conserva su atributo nativo, cursor y opacidad diferenciada, por lo que un
  icono de consulta disponible ya no parece inactivo.

### Verificación

- Prueba de contrato para el tono activo, gobierno Atomic, suite completa y
  build antes de propagar al consumidor.

## [5.1.30] - 2026-07-28

### Corregido

- `PREST-20260728-114`: `MetricsGrid` distribuye únicamente las métricas
  presentes en columnas fluidas del mismo ancho. Un resumen de tres tarjetas
  deja de reservar una cuarta columna vacía y continúa apilándose en móvil.

### Verificación

- Gobierno Atomic, 221/221 pruebas y build.

## [5.1.29] - 2026-07-28

### Corregido

- `PREST-20260728-113`: `DenominationCounter` incorpora el valor controlado
  `value` además de su contrato CVA. Los consumidores pueden actualizar
  sugerencias programáticas de denominaciones y el resumen plegado recalcula
  el total sin simular una edición del operador.

### Verificación

- Prueba focalizada de actualización programática, gobierno Atomic, suite
  completa y build antes de propagar al consumidor.
- Rollback: retirar el `@Input() value`; el contrato CVA anterior permanece
  intacto.

## [5.1.28] - 2026-07-28

### Cambiado

- `PREST-20260728-110`: `DenominationCounter` puede comunicar explícitamente
  que el desglose es opcional y referencial para auditoría. La historia
  principal queda plegada por defecto para mantener el monto de la operación
  como dato primario. En ese modo opcional, sus once controles se crean al
  expandir el acordeón, reduciendo el trabajo inicial de los diálogos sin
  alterar los contadores obligatorios de recaudación.
- `Card` permite que su host, contenedor y cuerpo flexible se reduzcan con
  `min-width: 0`, evitando desbordes cuando aloja tablas responsive.

### Verificación

- Gobierno Atomic, build y 219/219 pruebas, incluida la carga diferida
  accesible del modo opcional.
- Rollback: retirar la entrada `optional`; el CVA y el cálculo no cambian.

## [5.1.27] - 2026-07-28

### Añadido

- `PREST-20260728-109`: nuevo organismo `DenominationCounter`, compuesto
  dentro del `Accordion` canónico. Recibe del consumidor códigos, valores y
  etiquetas de denominaciones; normaliza cantidades enteras y publica el
  desglose y total sin incorporar reglas de caja ni un catálogo PEN.
- Contrato CVA, estados vacío/deshabilitado, diseño responsive, subtotales
  accesibles y export público para propagación controlada.

### Verificación

- Pruebas focalizadas para composición, cálculo y normalización; la suite
  completa y el gobierno Atomic se ejecutan antes de propagar al consumidor.
- Rollback: retirar el organismo y su export. No cambia contratos existentes.

## [5.1.26] - 2026-07-28

### Corregido

- `PREST-20260728-105`: `CrudDialog` reinicia su desplazamiento vertical cada
  vez que se abre. Un mismo `FormDialog` puede reutilizarse para varios
  formularios sin conservar la posición del flujo anterior ni presentar el
  encabezado recortado.

### Verificación

- Prueba focalizada de reapertura, gobierno Atomic, 214/214 pruebas y build.
- Rollback: retirar la asignación de `scrollTop`; no cambia la API pública ni
  los tokens del organismo.

## [5.1.25] - 2026-07-28

### Corregido

- `PREST-20260728-104`: el pie de acciones de `FormDialog` permanece visible
  dentro de formularios modales extensos, incluso al desplazarse en pantallas
  estrechas. Conserva el orden del documento, los tokens de superficie y la
  composición de botones existente.

### Verificación

- Prueba focalizada de `FormDialog`, gobierno Atomic, suite completa y build.
- Rollback: retirar el posicionamiento adherente del host de
  `FormDialogActions`; no cambia su API.

## [5.1.24] - 2026-07-27

### Cambiado

- `PREST-20260727-099`: el sistema de tokens publica
  `--action-bar-gap` con la separación canónica de 36 px para grupos de
  acciones primarias distribuidas proporcionalmente. La composición y los
  permisos continúan perteneciendo a cada consumidor.

### Verificación

- Gobierno y blueprints conformes, suite completa 213/213 y build Angular
  correctos.
- Rollback: retirar `--action-bar-gap`; no modifica contratos de componentes.

## [5.1.23] - 2026-07-27

### Cambiado

- `PREST-20260727-096`: el organismo `Accordion` incorpora modo de apertura
  única, encabezados con descripción y estado deshabilitado, relaciones ARIA
  completas, contenido colapsado `inert`, navegación por flechas/Home/End,
  foco visible y respeto a movimiento reducido. Conserva la API `open` y el
  modo múltiple por defecto para consumidores existentes.

### Verificación

- Prueba focalizada del organismo: 3/3; gobierno y blueprints conformes,
  suite completa 213/213 y build Angular correctos.
- Rollback: restaurar el organismo anterior; los consumidores que no usan
  `single`, `description` o `disabled` conservan el contrato previo.

## [5.1.22] - 2026-07-25

### Añadido

- `PREST-20260725-070`: nuevo organismo `FormDialog` con encabezado, descripción,
  cuerpo y grupo de acciones canónicos. Usa exclusivamente tokens, conserva
  contraste por tema y adapta el espaciado en pantallas estrechas.
- `CrudDialog` mantiene su API y ahora prioriza controles Atomic marcados al
  abrir, omite entradas auxiliares no navegables y restaura el foco en el
  invocador al cerrar.

### Verificación

- Pruebas focalizadas de `CrudDialog` y `FormDialog`: 5/5.
- Suite completa: 210/210; gobierno Atomic y build correctos.
- Rollback: retirar `FormDialog` y conservar el contrato anterior de
  `CrudDialog`; ningún consumidor existente requiere cambiar.

## [5.1.21] - 2026-07-25

### Añadido

- `PREST-20260725-068`: `StatusBadge` incorpora la variante semántica `info`
  con los tokens informativos canónicos. Permite representar estados
  intermedios, como un pago parcial, sin confundirlos con advertencias
  pendientes ni depender solo del color.

### Verificación

- Gobierno Atomic y blueprints conformes; suite completa 206/206 y build
  Angular correctos. La prueba focalizada cubre estilo `info`, nombre accesible
  y etiqueta explícita.

## [5.1.20] - 2026-07-25

### Corregido

- `PREST-20260725-064`: `DataTable` publica de forma canónica la columna
  correlativa `N.º` y calcula el número como desplazamiento de página más
  posición visible, sin reutilizar identificadores técnicos.
- Toda colección sin metadatos de servidor recibe paginación local automática;
  las grillas con backend conservan sus eventos y muestran el correlativo
  continuo entre páginas. Ordenar una colección local regresa a la página 1.
- La columna de acciones y el modo responsive mantienen el contrato anterior;
  el consumidor no necesita recrear paginadores ni columnas de numeración.

### Verificación

- Prueba focalizada de `DataTable`: 15/15.
- Contrato de gobernanza Atomic y blueprints: conforme.
- Suite completa: 205/205 pruebas.
- Compilación Angular: correcta; conserva únicamente advertencias preexistentes
  de imports sin uso y presupuesto del bundle.

## [5.1.19] - 2026-07-25

### Añadido

- `PREST-20260725-062`: nuevo organismo `ReceiptPanel` para comprobantes
  responsive e impresión térmica aislada de 58 mm. Proyecta acciones del
  consumidor, recibe campos y texto ya formateados y no incorpora reglas
  financieras ni acceso directo a dispositivos.
- Tokens de superficie y papel térmico, export público, prueba zoneless y
  escenario Storybook con datos sintéticos.
- La impresión ya no intenta ocultar la aplicación ni imprimir el organismo
  dentro de un diálogo. Crea un documento temporal con solo el ticket, copia
  los tokens canónicos, espera dos ciclos de render y lo cierra en
  `afterprint`, evitando la vista previa blanca de Chrome. Los datos se
  insertan con `textContent` y el texto usa negro/blanco puros con peso 700
  para salida monocroma nítida a 203 dpi.
- El documento térmico centra el área real de 48 mm en el papel de 58 mm con
  márgenes laterales simétricos. La fuente pasa a 7 pt para contener 32
  columnas completas en 384 puntos. La página CSS conserva el tamaño automático
  del controlador: una altura CSS menor no se fuerza porque Edge la centra
  dentro de la hoja física configurada. El espaciado vertical baja a 1 mm.

### Compatibilidad

- `print()` usa el diálogo nativo del navegador y la cola configurada por el
  sistema operativo. No emite corte automático ni comandos ESC/POS.

### Verificación

- Gobierno Atomic, 204/204 pruebas y build aprobados. La copia propagada al
  consumidor mantiene hashes idénticos en TS/HTML/SCSS.

## [5.1.18] - 2026-07-24

### Corregido

- `PREST-20260724-060`: el ADN incorpora las variantes semánticas
  `success`, `warning` y `danger` de `StatusBadge`, con texto accesible además
  del color.
- KPI y `MetricsGrid` adoptan la geometría ejecutiva compacta de cuatro
  columnas; la tabla elimina su límite vertical rígido y delega el scroll
  vertical al layout.

### Verificación

- 200/200 pruebas Atomic aprobadas. El consumidor solo puede actualizar su
  procedencia después de validar y consolidar este cambio en la fuente.

## [5.1.17] - 2026-07-22

### Gobierno obligatorio

- `PREST-20260722-031`: la política Atomic-first deja de ser recomendación. Se
  incorpora un kit canónico con contrato para agentes, manifiesto, gate exacto,
  instalador y workflow de CI para todo consumidor nuevo o existente.
- `create:project` instala automáticamente esos cerrojos; las adaptaciones
  requieren justificación y registro de decisión, y el gate se protege a sí
  mismo mediante comparación de hashes contra `-Atomic-UI`.
- Los blueprints eliminan primitivas visuales nativas, estilos inline y colores
  fijos para que una aplicación nueva nazca cumpliendo la misma ley.

### Verificación

- El contrato prueba un bootstrap real y bloquea cuatro violaciones: control
  nativo, componente desconocido, copia divergente y adaptación injustificada.
- Gate normativo y build completo de Atomic aprobados.

## [5.1.16] - 2026-07-22

### Añadido

- `PREST-20260722-030`: nuevos átomos canónicos `Input`, `Select` y
  `ChoiceControl`, con CVA zoneless, accesibilidad, estados de ayuda/error y
  contratos reutilizables. `Select` conserva el tipo real de opciones numéricas
  y `ChoiceControl` publica los estados marcado/deshabilitado en el host.

### Corregido

- La suite histórica OnPush usa `componentRef.setInput`; `Avatar` deja de
  memoizar propiedades `@Input` no reactivas y `ThemeService` consume de forma
  segura los rechazos de View Transitions.
- La prueba del shell incorpora sus proveedores reales y valida la composición
  vigente en lugar de un título obsoleto.

### Verificación

- Suite completa: 197/197 pruebas aprobadas. Build Angular correcto. La deuda de
  68 fallos históricos documentada en versiones anteriores queda cerrada.

## [5.1.15] - 2026-07-22

### Añadido

- `PREST-20260722-029`: `TableAction`, `DataTable` y `CrudDialog` pasan a existir
  realmente en Atomic UI. El átomo cubre tres tamaños sin ocultar acciones, la
  tabla integra estados, orden, paginación y tarjetas móviles, y el diálogo
  encapsula el elemento nativo para altas y ediciones accesibles.
- Se incorporan tokens específicos del diálogo CRUD y exports públicos para que
  los consumidores propaguen los componentes sin recrear estilos o contratos.
- Validación del incremento: build correcto, auditoría npm de producción sin
  vulnerabilidades y 16/16 pruebas focalizadas aprobadas.

### Regla de propagación

- Todo objeto visual nuevo se implementa y valida en `-Atomic-UI` antes de
  copiarse o adaptarse en una aplicación. La lógica de dominio permanece fuera
  del ADN.

## [5.1.14] - 2026-07-21

### Añadido

- **Paginación integrada en `DataTable`:** Se integró el footer de paginación y resumen de registros (`Mostrando X - Y de Z registros`) dentro del Organismo `<prest-data-table>`.
- **Propiedad `size` en `TableAction`:** Soporte para tamaños `sm` (28px), `md` (36px) y `lg` (44px) en el componente de acciones de grilla.

### Corregido

- **Aislamiento de tokens de layout:** Se documentó la regla de paridad para evitar que los scripts de sincronización de temas sobreescriban variables locales de maquetación (`--sidebar-width`, `--header-height`) en aplicaciones consumidoras.
- **Grids de métricas en Angular:** Se validó la regla de maquetación con `:host { height: 100% }` para asegurar alineación estricta de bordes en tarjetas KPI.

---

## [5.1.13] - 2026-07-20

### Añadido

- **Estado semántico independiente:** `StatusBadgeComponent` representa `active`, `inactive`, `degraded` y `unconfigured` con texto visible además del color. Puede mostrar identidad WEB, TELEGRAM o SMS mediante FontAwesome sin aceptar ni exponer credenciales.
- **Identidad estable de indicadores:** `MetricsGridComponent` admite `KpiMetric.id` para conservar cada tarjeta al reordenar datos y expone un nombre accesible para la sección.
- **Pruebas y catálogo:** KPI, MetricsGrid y StatusBadge incorporan specs zoneless y stories coherentes, incluidas composiciones estrechas, títulos repetidos e importes preformateados.

### Corregido

- **KPI financiero:** se restauraron dimensiones CSS válidas, la moneda conserva dos decimales por defecto y `displayValue` permite presentar exactamente el importe autoritativo recibido por el consumidor.
- **Comparaciones honestas:** una KPI no muestra tendencia, icono ni texto comparativo por defecto; la tendencia solo aparece cuando el consumidor la entrega explícitamente.
- **Responsive sin desborde:** MetricsGrid usa `minmax(min(100%, var(--min-col-width)), 1fr)` y sus hosts permiten encogimiento desde 320 px.
- **Sparkline liviano:** las series finitas generan un SVG decorativo sin Chart.js, animaciones ni valores `NaN`/`Infinity`.
- **Cadena Angular 22 alineada:** Angular y DevKit pasan a `22.0.7`; Storybook, ESLint, Compodoc y la herramienta de publicación se actualizan a líneas compatibles, sin usar `npm audit fix --force` ni degradar el framework.
- **Entorno reproducible:** `.node-version`, `.nvmrc`, `engines` y `packageManager` fijan Node `24.15.0` y npm `11.12.1`; Vite queda sobreescrito a una revisión corregida para Windows.
- **Dependencias transitivas de desarrollo:** `webpack-dev-server` queda fijado en `5.2.6` y el `uuid` interno de `sockjs` en `11.1.1`, ambos dentro del contrato usado y comprobado por Angular/Storybook, para cerrar los avisos moderados sin degradar Angular.

### Verificación

- Incremento de diseño `PREST-20260720-014`, limitado al ADN Atomic UI. La propagación a consumidores queda separada y exige sus propias pruebas de contrato y responsive.
- Con Node 24.15.0: 24/24 pruebas dirigidas, build Angular y build Storybook correctos. Tanto `npm audit --omit=dev` como la auditoría completa reportan 0 vulnerabilidades.
- La suite histórica completa deja 106 pruebas correctas y 68 fallos en componentes no modificados por el incremento —principalmente specs que mutan `input()` sin `setInput`—. No se oculta como gate aprobado; la fuente propagada por PREST-014 queda cubierta por la suite dirigida y el saneamiento global se mantiene como deuda independiente.

---

## [5.1.12] - 2026-07-20

### Añadido

- **Navegación jerárquica:** `SidebarComponent` admite árboles mediante `children`, expansión declarativa con `expanded`, apertura automática del ancestro activo e iconos FontAwesome en padres e hijos sin alterar el contrato de los elementos planos.
- **Sesión completa en Topbar:** idioma y notificaciones pueden ocultarse independientemente; el menú de usuario muestra `userRole` y las acciones de sesión se presentan en mayúsculas.
- **Espaciado de feedback:** `AlertComponent` incorpora `flowSpacing="default|compact|none"`; el valor predeterminado reserva 36 px después del mensaje mediante tokens y conserva la capitalización del cuerpo.

### Corregido

- **Responsive recuperado:** se restauraron a `768px` los breakpoints dañados de LayoutShell, Panel, Card, Toast, Stepper, Topbar, Footer, Tabs y Navbar. El logo y el botón móvil de Navbar recuperan 28 px y 36 px respectivamente.
- **Alertas semánticas:** las cuatro variantes consumen `--alert-*-bg|border|text`; la advertencia deja de depender de un fallback CSS inválido.
- **Acciones de icono accesibles:** `ActionGroup` y `TableActions` exponen `aria-label` y delegan Enter/Espacio al comportamiento nativo del botón para emitir una sola acción. `ActionGroup size="sm"` conserva 28 px.
- **Fuga de clicks en app-button deshabilitados:** Se registro una directriz critica sobre el uso de eventos en componentes encapsulados de Atomic UI. Al utilizar <app-button>, los consumidores deben enlazar la accion a la salida nativa del componente (buttonClick)=... en lugar del evento DOM directo (click)=.... El uso de (click) se adhiere al elemento host de Angular, permitiendo que eventos de click se filtren aunque el boton interno este en estado [disabled]=true.

### Verificación

- Incremento de diseño `PREST-20260720-013`, limitado a la fuente Atomic UI y sin propagación automática a consumidores.

---

## [5.1.11] - 2026-07-19

### Corregido

- **Tokens de color obligatorios en overlays y modales custom:** Al construir un dialog/modal personalizado sobre `app-card variant="elevated"` con un `slot="image"` como cabecera, queda prohibido usar colores hexadecimales fijos (e.g. `#1e293b`, `#f8fafc`). Toda cabecera de modal debe consumir `background: var(--surface-section)` y `color: var(--text-color)` para respetar el Dark/Light Mode automatico del ecosistema. Los iconos de estado deben usar `color: var(--danger-color)`, `var(--warning-color)` etc., nunca hexadecimales sueltos.
- **Texto de cuerpo en modales:** El parrafo de contenido de un modal custom debe llevar `color: var(--text-color)` explicito en lugar de clases de utilidad como `text-secondary` o `text-muted`, ya que estas clases aplican opacidad reducida y en fondos oscuros resultan ilegibles.

### Directriz

- **Plantilla canonica de modal para consumidores (Wails/Tauri/Python):** El header del modal usa `slot="image"` con fondo `var(--surface-section)`, separador `var(--border-color)` y texto `var(--text-color)`. El cuerpo del modal usa `color: var(--text-color)` explicito en el parrafo. Esta plantilla garantiza compatibilidad automatica con Light Mode y Dark Mode sin estilos adicionales.

---

## [5.1.10] - 2026-07-16

### Corregido

- **Graficos demo alineados al ADN**: Los ejemplos de showcase y blueprints quedan marcados como datos demo y consumen tokens `--chart-color-*`, `--chart-grid-color`, superficie y tooltip, evitando hexadecimales sueltos que luego puedan propagarse a aplicaciones productivas.
- **Frontera entre demo y produccion**: Se documenta que los datos de stories, showcase y blueprints no deben copiarse a Wails, Tauri ni Python como fuente de negocio.

---

## [5.1.9] - 2026-07-16

### Corregido

- **Cierre inferior de tablas con scroll sincronizado**: `ScrollOverlayComponent` amplia `--so-scroll-end-space` a `calc(var(--so-track-size) + var(--space-8))` para que la ultima fila quede visible por encima de la barra horizontal cuando existe scroll vertical y horizontal simultaneo.
- **Chips de metodo mas sobrios**: `chip-primary` mezcla el color primario con `surface-elevated`, reduce la saturacion visual en tema oscuro y mantiene coherencia con los chips semanticos.
- **Centrado vertical de celdas compactas**: `TableComponent` centra verticalmente las celdas cuyo unico contenido es `app-chip`, sin alterar celdas compuestas como `Estado TA` con detalle secundario.
- **Saneamiento CSS en tablas**: Se corrigieron expresiones invalidas como `76var(...)` y `1var(...)` en tokens y responsive table para evitar reglas descartadas por el navegador.

---

## [v1.3.4] - 2026-07-16

### Documentación

- **Layouts y desbordamiento en `app-card`:** Se agregó documentación formal en las lecciones aprendidas sobre cómo manejar grillas flexbox complejas con `.card__body` usando `::ng-deep` para no romper el comportamiento natural de bloque de otras tarjetas y evitar desbordamientos de `100vh`.
- **Modales custom:** Se reiteró la regla estricta de heredar `var(--surface-section)` y `var(--text-color)` en cualquier modal personalizado de los consumidores Wails, Tauri y Python para garantizar el funcionamiento del modo oscuro.

## [5.1.8] - 2026-07-15

### Corregido

- **Cajas internas de grafico definidas**: `chart-panel--center` fija 260 px para tortas/donas y `chart-panel--fill` fija 320 px para barras. `chart-panel` usa `box-sizing: border-box` para evitar que el canvas desborde la tarjeta cuando el padre tiene altura fija de 430 px.

---

## [5.1.7] - 2026-07-15

### Corregido

- **Altura padre controlada para filas de grafico**: Se agrego `chart-grid-compact` con filas de 430 px para evitar crecimiento excesivo en pantalla completa. `chart-panel` baja su alto minimo a 240 px para trabajar dentro de la altura fija del padre sin recortar controles.

---

## [5.1.6] - 2026-07-15

### Corregido

- **Altura simetrica de paneles de grafico**: `chart-panel` reduce su alto minimo a 320 px para evitar espacios vacios excesivos en tarjetas de graficos. Se agrega `chart-panel--center` para centrar verticalmente graficos compactos como tortas/donas.

---

## [5.1.5] - 2026-07-15

### Aniadido

- **Panel uniforme para graficos**: Se agrego la utilidad `chart-panel` para que los contenedores de graficos mantengan un alto minimo estable, llenen el alto disponible de tarjetas estiradas en grid y deleguen el redimensionamiento final al componente `app-chart`.

---

## [5.1.4] - 2026-07-15

### Corregido

- **Grafico con resize propio**: `app-chart` ahora usa host flexible, observa cambios reales del contenedor con `ResizeObserver` y fuerza `resize/update` de Chart.js. Esto permite que el canvas se adapte al espacio disponible sin mover la responsabilidad al contenedor padre.

---

## [5.1.3] - 2026-07-15

### Aniadido

- **Alto compacto para graficos**: Se agrego la utilidad `h-300` para que los consumidores puedan reducir paneles de grafico puntuales sin tocar el comportamiento global de `app-card` ni afectar tarjetas hermanas en grillas.

---

## [5.1.2] - 2026-07-15

### Corregido

- **Alto natural de tarjetas con graficos**: Se retiro el alto flexible global de `app-card` porque hacia crecer las tarjetas hermanas dentro de grillas, especialmente la tarjeta del grafico de torta. El control de alto queda localizado en el consumidor mediante `h-380` y `height="100%"`.
- **Limpieza de utilidad de alto minimo**: Se retiro `min-h-380` porque ya no se requiere para el grafico mensual y podia inducir crecimiento vertical no deseado.

---

## [5.1.1] - 2026-07-15

### Corregido

- **Grafico reactivo de alto completo**: Se ajusto `app-chart` para que el host y el contenedor interno puedan ocupar el 100% del alto disponible cuando el consumidor declara `height="100%"`. Esta correccion permite que los graficos embebidos en tarjetas altas no queden limitados por el valor por defecto de 300 px.
- **Contraste de grilla en tema claro**: Se convirtio `chart-tokens.css` a tokens dependientes de tema. El modo claro usa una grilla con mayor contraste y los temas oscuros conservan una grilla visible sin saturar el panel.

---

## [5.1.0] - 2026-07-02

### Uniformizacion UI y Chart reactivo a temas

#### Fixed

- **Input shadows uniformes con `select2`**: `--input-shadow` y `--input-shadow-hover` ahora usan `var(--shadow-sm)` y `var(--shadow-md)` — la misma escala semantica que `select2`. Los inputs `floating` y `outline` tienen la misma elevacion visual en los 3 temas.
- **Focus ring de `floating-input` alineado**: El estado focused usaba `0 0 0 3px var(--hover-background)` produciendo un ring diferente al de `select2`. Ahora usa `var(--input-shadow-focus)` = `var(--shadow-focus-primary)`, uniformizando el comportamiento de todos los inputs del sistema.
- **`chart.component.ts` reactivo a cambios de tema**: Se anadio `MutationObserver` en `data-theme`/`class` de `<html>` y `<body>`. Al cambiar de tema se re-leen los tokens CSS via `getComputedStyle` y se fuerza la recreacion del canvas. Metodo `applyChartTheme()` extraido como privado reutilizable. `ngOnDestroy` desconecta el observer.
- **`.gitignore` completado**: Anadido `.history/` en `wails-angular-app` y `src-tauri`, y `.env`/`.env.local` en `db_test`.

---

## [5.0.0] - 2026-07-01

### Auditoria Profunda del Ecosistema — Sincronizacion Total y Limpieza

#### Fixed (Ecosistema — CRITICO)

- **114/114 archivos `shared/ui` sincronizados**: Auditoria SHA-256 completa detecto 10 archivos con drift y 5 MISSING en Tauri y Wails. Todos corregidos. El ecosistema queda en estado 100% sincronizado.
- **WebView2 canvas fix retroalimentado**: La correccion `ctx.save()`/`ctx.restore()` incondicional para todos los tipos de chart (documentada en v4.9.0 y en `ECOSYSTEM_WORKFLOW.md`) existia unicamente en Wails. Se retroalimento a Atomic-UI (Fuente de la Verdad) y se propago a Tauri.
- **`propagate-tokens.ps1` extendido**: El script solo propagaba `_tokens-components.css` (1 de 7 archivos). Ahora cubre los 7 archivos CSS del directorio `src/styles/themes/` con verificacion SHA-256 individual por archivo.
- **Selector `table-cell` extendido**: `selector: '[app-table-cell]'` ampliado a `td[app-table-cell], th[app-table-header-cell]` para soportar uso en `<th>`. Mejora llevada desde Tauri/Wails a Atomic-UI.
- **`z-index: 10` en `table-head`**: Propiedad que existia en consumidores retroalimentada a Atomic-UI.

#### Added

- **5 componentes nuevos propagados a Tauri y Wails**: `language-switcher`, `table-actions` (`.ts`, `.html`, `.css`) y `footer` ahora existen en los tres proyectos.
- **`chartjs-plugin-datalabels@^2.2.0`**: Dependencia que estaba en Tauri y Wails pero faltaba en Atomic-UI. Instalada para alinear el ecosistema y eliminar errores `TS2307` en `chart.component.ts`.

#### Changed

- **Blueprint `crud-table`**: Integrado `app-data-pager` superior, tabla envuelta en `app-scroll-overlay`, paginacion inferior con tres variantes (minimal, rounded, cards). Script `fix.py` aplicado y eliminado.
- **`topbar` y `layout-shell`**: Actualizados en los tres proyectos para incluir `LanguageSwitcherComponent` y `FooterComponent` respectivamente.

---

## [4.9.0] - 2026-07-01

### Auditoría Profunda de Tokens — Fix Crítico de Tabla y Chart + Guía de Migración

#### Fixed (Tokens — CRÍTICO)

- **25 tokens de tabla ausentes detectados y definidos**: Los componentes `table.component.ts`, `table-head.component.ts` y `table-row.component.ts` consumían un nuevo namespace `--table-color-*`, `--table-font-*`, `--table-header-*`, `--table-card-*` y `--table-transition-*` que **nunca fue definido** en `_tokens-components.css`. Esto causaba que todas las tablas renderizaran sin estilos (sin zebra/striping, sin header estilado, sin hover visible, sin responsive cards). Se definieron los 25+ tokens faltantes en los tres temas (light, dark, brand-dark) con aliases legados para no romper módulos existentes (gerencial, operativo).
- **6 tokens de chart ausentes definidos**: `--chart-text-color`, `--chart-tooltip-bg`, `--chart-tooltip-text`, `--chart-tooltip-border`, `--chart-grid-color` y `--surface-color` que `chart.component.ts` leía via `getComputedStyle` nunca estuvieron en `_tokens-components.css`. Se definieron en los tres temas.
- **Fix shadowPlugin WebView2 (Wails)**: `ctx.save()`/`ctx.restore()` ahora son incondicionales para todos los tipos de chart. Evita corrupción del estado del canvas en WebView2.

#### Added (Developer Experience)

- **`CONTRIBUTING_TOKENS.md`**: Guía oficial de token-first development con checklist, convenciones de nomenclatura, plantilla de bloque CSS, regla de tokens legado y flujo completo.
- **`scripts/audit-tokens.ps1`**: Detecta tokens consumidos por cualquier componente que no están definidos. Exit code 1 si hay faltantes.
- **`scripts/propagate-tokens.ps1`**: Propaga `_tokens-components.css` a Wails y Tauri con verificación SHA-256.

#### Changed

- `_tokens-components.css`: Bloque `=== TABLAS ===` expandido de 16 a 60+ tokens. Documentado con comentarios por grupo.

---

## [4.8.0] - 2026-06-26

### Refactorización de Tablas, Hover Effects y Contrastes en Modo Oscuro

#### Fixed (Frontend - UI Core)

- **Mejora del Resaltado en el Thead**: Se cambió la técnica de resaltado en hover para los encabezados de tabla ordenables (`th[app-table-header-cell]`). En lugar de utilizar un overlay fijo o translúcido que ocultaba el color del fondo (perdiendo saturación en temas oscuros o vibrantes), se implementó `filter: brightness(1.2)`. Esta solución ilumina los píxeles originales respetando la paleta de colores nativa sin importar si se usa modo claro u oscuro.
- **Corrección Typo en Tbody Hover**: En el CSS del `table.component.ts` de Atomic-UI, las filas intentaban hacer referencia a la variable `--table-color-hover` para su efecto de hover, pero el nombre correcto en el design system es `--table-row-hover`. Al fallar, usaban el color por defecto (2% negro), haciéndolo casi imperceptible. Se corrigió la variable para que herede correctamente el hover diseñado (`var(--table-row-hover)`).
- **Contraste de Componentes Chip en Modo Oscuro**: Se reemplazó el uso duro de variables base (`--primary-color-lighter`) en el componente `app-chip` por el uso de tokens semánticos adaptativos para fondos y textos en los chips (`var(--primary-color-light, var(--primary-color-lighter))` y `var(--primary-color-text, var(--primary-color))`). Esto resuelve la ilegibilidad de los chips en modo oscuro debido a la falta de contraste.

#### Added (Frontend - Wails & Tauri DataGrids)

- **Columna de Fecha de Inicio Histórica**: En respuesta a peticiones funcionales, las tablas del CRM (Operativo) en Wails y Tauri ahora muestran 3 columnas de fechas de seguimiento del paciente: _F. Inicio_, _F. Última_, y _F. Próxima_. Esto incluyó la adición de la propiedad `fecha_inicio` en las estructuras del modelo.

---

## [4.7.0] - 2026-06-23

### Dropdown Click Propagation Isolation

#### Fixed (Frontend - Select2Component)

- **Aislamiento de Clicks en Opciones**: Se corrigió el cierre inmediato y pérdida de foco del dropdown al hacer click en una opción. Reemplazamos la lógica destructiva asíncrona de `setTimeout` de 150ms por un control síncrono nativo usando `(click)="$event.stopPropagation(); !option.disabled && selectOption(option)"` en la opción. Esto detiene el evento `click` antes de que alcance el listener global del documento (`document:click`), impidiendo falsos cierres externos por desvinculación de nodos DOM.
- **Mantener foco de busqueda**: Se mantuvo `(mousedown)="$event.preventDefault()"` para evitar la pérdida no deseada del foco del input de búsqueda.

## [4.6.0] - 2026-06-23

### Select2Component y DB-First Robustness

#### Fixed (Frontend - Wails & Tauri)

- **Robo de Foco en WebView2 (Wails)**: El cierre destructivo del dropdown colapsaba el Event Loop de Angular al dispararse junto al evento `click`. Se inyectó un `setTimeout(..., 0)` en `selectOption` retrasando la destrucción del DOM y garantizando el flujo de datos.
- **Tipado Fuerte de Select2**: Al descartar el uso de elementos nativos de Windows, el componente recuperó su capacidad de emitir valores reales (`number` o objetos) en lugar de strings literales, solucionando fallas de carga en la Grilla de Wails.

#### Fixed (Backend - Tauri)

- **Tiberius TLS Handshake**: El servidor SQL antiguo 10.100.6.11 rechaza certificados TLS modernos (Error de algoritmo común -2146893007). Se ha regresado a la cadena de conexión con `encrypt=DANGER_PLAINTEXT` para saltar el handshake.
  **Antecedente supersedido, inseguro y no reutilizable:** esta decisión histórica no constituye una recomendación vigente. `DANGER_PLAINTEXT` desactiva la protección del canal y no debe reutilizarse en ningún proyecto, entorno o fallback. La compatibilidad heredada actual debe conservar cifrado y quedar restringida por los contratos de seguridad aprobados.
- **Anti-Panic Data Extraction**: El puente de datos en `tiberius_repository.rs` se refactorizó para usar `.try_get::<T, _>().ok().flatten().unwrap_or(0)` en todas las columnas. El backend ahora es inmune a inconsistencias de tipos y retornos nulos desde SQL Server, impidiendo crasheos silentes que forzaban la activación de Mock Data.

---

## [4.5.0] - 2026-06-19

### Refactorización del Indicador 11 y DB-First

#### Fixed (Base de Datos & Arquitectura)

- **Filtros Estrictos en Vistas**: Se corrigió la vista `ind.VW_NOMINAL_ID11` para excluir correctamente a las gestantes y filtrar población de 15 a 49 años, según la Ficha Técnica 11.
- **Sincronización SP-Vista**: Se eliminó la lógica duplicada de tablas de origen en el SP de paginación `ind.USP_SEL_GRILLA_NOMINAL_ID11`, haciendo que consuma directamente la vista `VW_NOMINAL_ID11`. Esto corrigió el bug de los "62856 registros basura" persistentes.
- **Views de Dashboards**: Se crearon las vistas de datos `VW_DASHBOARD_STATS_ID11` (para métricas macro) y `VW_DASHBOARD_MONTHLY_ID11` (para avance en barras) centralizando todo cálculo matemático en SQL Server (DB-First).

#### Added (Frontend - Wails & Tauri)

- **Dashboards Temáticos**: Reorganización de las tarjetas del nivel gerencial mostrando la "Población Denominador", el "Logro Indicador 11" (%) y la alerta de "Próximos a Vencer".
- **Gráficos Dinámicos**: Integración del doughnut chart "Métodos Modernos" comparando Preservativos vs Otros, y el Bar chart "Avance Mensual 2026".

---

## [4.4.0] - 2026-06-08

### Refactorización de Tablas, Scrolling Avanzado y Pulido Visual UI

#### Added

- **`app-table` & `ScrollOverlayComponent`**: Se completó la integración del contenedor inteligente de scroll (`app-scroll-overlay`) dentro del componente nativo `<app-table>`. Ahora las tablas admiten scroll horizontal y vertical perfecto con sincronización de columnas (`lockColumnTemplate`), evitando el desbordamiento sin romper la estructura HTML semántica.
- **`table.component.ts`**: Nuevo `@Input() columnTemplate: string` para permitir definir anchos estrictos en grid (ej. `minmax(200px, 1fr) 120px...`), evitando que el navegador autoajuste y aplaste columnas cuando hay contenido largo.
- **`SidebarMenuItem`**: Se añadió la propiedad `iconColor?: string` para permitir colores temáticos/personalizados en los iconos de la barra de navegación lateral, mejorando drásticamente el peso visual de la interfaz.

#### Fixed (Visual & Arquitectura)

- **Alineación de Tarjetas (Dashboard)**: Se detectó que las tarjetas (`app-card`) del tablero gerencial no mantenían una altura uniforme debido a la ausencia de subtítulos en el indicador "Total Pacientes". Se insertó un espaciador fantasma (`&nbsp;`) transparente y no seleccionable (`user-select: none`) en dicho bloque, equilibrando la grilla CSS y logrando una uniformidad absoluta sin alterar semántica HTML.
- **`ScrollOverlayComponent` y Scrollbars superpuestos**: Se detectó y solucionó una colisión visual en donde la barra de scroll vertical custom (`.so-scrollbar-y`) se dibujaba sobre la cabecera de la tabla (`thead`). Ahora el componente detecta dinámicamente la altura del header (`this.tableHead.offsetHeight`) y aplica un _offset_ automático al inicio de la barra y su altura, manteniéndola perfectamente confinada en la zona de datos (tbody).

#### Fixed (Visual & CSS)

- **Modo Claro (Tablas)**: El `thead` ahora se renderiza como un bloque de color primario sólido con texto en blanco, reemplazando la débil línea inferior que lo hacía ilegible sobre fondos blancos.
- **Modo Oscuro (Tablas)**: Se han corregido las variables de zebra (`--rtc-color-stripe`) para utilizar `rgba(255, 255, 255, 0.03)`, logrando un contraste limpio y solucionando el efecto visual de "bloque cuadrado oscuro".
- **Bordes Perimetrales (Tablas)**: El contenedor inteligente exterior (`ScrollOverlay`) asume ahora la responsabilidad del `border` y `border-radius` cortando dinámicamente (`overflow: hidden`) las filas internas. Esto restaura las preciadas esquinas redondeadas en todas las vistas de escritorio al colapsar las tablas.
- **Alineación y Espaciado de Acciones**:
  - Se añadieron las utilidades `.rtc-text-center` y `.rtc-text-right` al core CSS para alinear estrictamente flex-containers internos (como los menús de botones y `app-action-group`).
  - Se implementó un margen de seguridad nativo (`padding-right: var(--space-6)`) en la última celda de todas las tablas para erradicar definitivamente las colisiones visuales entre el contenido y el _scrollbar_ nativo de la UI.
- **Sombras Premium (Paneles / Modo Claro)**: Se incrementaron sustancialmente las opacidades (canales alpha) de todas las elevaciones en modo claro (tokens `--shadow-sm` a `--shadow-xl`), logrando que las transiciones interactivas (_mouse move / hover effects_) en los _Cards_ y _Panels_ luzcan realmente elevadas.

## [4.3.0] - 2026-05-29

### Auditoría de Consistencia — Correcciones visuales, routing y tokens

#### Added

- **`app.routes.ts`**: Ruta `/crud` registrada con `loadComponent` lazy y `canActivate: [authGuard]`, completando el conjunto de rutas de blueprints navegables desde el sidebar.
- **`app.ts`**: `menuItems` actualizado con cuatro ítems definitivos — Dashboard, CRUD, Profile, Settings — con iconos Font Awesome y rutas correctas.

#### Fixed — Visual / UI

- **`sidebar.component.css`**: Añadida regla `:host { display: block; height: 100%; }` — sin ella, `.sidebar-container { height: 100% }` no podía heredar la altura del contenedor padre (500px en el preview de Storybook), haciendo que el sidebar quedara sin altura visible.
- **`showcase-navigation.component.ts`**: Grid wrapper con `width: 100%; box-sizing: border-box` y cada preview con `min-width: 0` — corrige el desbordamiento del grid cuando los items exceden el ancho disponible (CSS Grid tiene `min-width: auto` por defecto, que ignora el ancho del contenedor).
- **`showcase-navigation.component.ts`**: Labels de preview con `backdrop-filter: blur(4px)` y `border-radius: 0.75rem` — mejoran la legibilidad sobre fondos con mucho contraste.

#### Fixed — Temas oscuros (elevación / sombras)

- **`_tokens-semantic.css`** `[data-theme="dark"]`: Reemplazadas sombras `rgba(0,0,0,0.7)` puras por técnica de **elevation overlay** — anillo blanco semitransparente `0 0 0 1px rgba(255,255,255,0.04–0.11)` + sombra profunda. Las sombras eran completamente invisibles sobre fondos `#1e1e1e` (negro sobre negro).
- **`_tokens-semantic.css`** `[data-theme="brand-dark"]`: Misma técnica de elevation overlay con anillo blanco `rgba(255,255,255,0.05–0.12)` + shadow con `--shadow-color: 220 40% 2%` adaptado al fondo azul profundo del tema.

---

### Auditoría técnica — Inconsistencias identificadas (pendientes de Fase 10)

> Hallazgos documentados para implementación en la siguiente fase.

#### 🔴 Críticos — Routing completamente inoperativo

| #   | Problema                                                                                                                                          | Archivo                |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| A1  | Sin `<router-outlet>` en `app.html` ni `RouterOutlet` importado en `app.ts` — las rutas definidas no renderizan nada                              | `app.html`, `app.ts`   |
| A2  | `onSidebarNavigate()` solo cierra el sidebar en móvil; nunca llama `Router.navigate()` — los clicks del sidebar no navegan                        | `app.ts`               |
| A3  | Los blueprints tienen su propio `<app-layout-shell>` — si se añade `router-outlet` sin refactorizar `app.html`, se producirá doble layout anidado | `app.html`, blueprints |

#### 🟡 Altos — CSS / Tokens

| #   | Problema                                                                                                                                                                                  | Archivo                  | Línea   |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | ------- |
| A4  | `rgba(var(--brand-primary-500-rgb), 0.3)` sin valor de fallback en `brand-dark` — si la variable no está en scope, el focus ring desaparece silenciosamente                               | `_tokens-components.css` | 458     |
| A5  | `--brand-primary-500-rgb` definido solo en `:root` — temas oscuros usan el color del tema claro para el anillo de focus de inputs                                                         | `_tokens-brand.css`      | 31      |
| A6  | Tokens faltantes en `[data-theme="dark"]` y `[data-theme="brand-dark"]`: todas las variantes de `--badge-*`, todos los `--alert-*`, `--breadcrumb-*`, `--switch-thumb`, `--avatar-border` | `_tokens-components.css` | variado |

#### 🟠 Medios — Calidad de código

| #   | Problema                                                                                                                                                        | Archivo         |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| A7  | `ButtonComponent` importado en `app.ts` pero ausente en `app.html` — import sin uso                                                                             | `app.ts`        |
| A8  | `TableRow` tiene `col9` pero salta `col8` — inconsistencia en naming de columnas                                                                                | `app.ts`        |
| A9  | `statusOptions` values son claves i18n (`'data.status.active'`) — el filtro por value nunca coincide con los datos reales de la tabla                           | `app.ts`        |
| A10 | Catch-all `{ path: '**', component: ErrorPagesComponent }` usa carga eager mientras todas las demás rutas de error usan `loadComponent` (lazy)                  | `app.routes.ts` |
| A11 | `provideRouter(routes)` sin `withPreloading(PreloadAllModules)` ni `withScrollPositionRestoration` — el propio comentario del archivo indica que debería usarse | `app.config.ts` |

#### 🔵 Bajos — Valores hardcoded en tokens

| #   | Problema                                                                                                                                     | Archivo                  |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| A12 | `--nav-shadow: rgba(122,120,120,0.2)` — gris hardcoded, debería usar variable semántica de sombra                                            | `_tokens-components.css` |
| A13 | `--button-shadow-inset: inset 0 1px 0 hsl(224,84%,74%)` — azul hardcoded, no sigue el sistema de tokens                                      | `_tokens-components.css` |
| A14 | `--ng-select-border: #999999` y `--ng-select-shadow: 0 0 4px #9fa1a3` en light theme — hex fijos que no respetan el sistema de design tokens | `_tokens-components.css` |

---

### Lecciones Aprendidas

#### Arquitectura Angular

- **Una aplicación Angular con routing real debe tener `<router-outlet>` como elemento raíz de `app.html`.** Si `app.html` contiene un layout estático (showcase, tabla de demo, etc.), ese contenido debe moverse a un componente con su propia ruta — por ejemplo `/showcase`. El componente raíz `AppComponent` solo debe orquestar el router outlet más los contenedores globales fuera del flujo de routing (toast, modal, popup).

- **Los blueprint pages diseñados para routing deben ser páginas completas independientes**, con su propio `<app-layout-shell>`. Nunca deben diseñarse para ser embebidos dentro del layout del `AppComponent`. Si se embeben, se produce doble shell (sidebar + topbar duplicados).

- **El evento `(navigate)` del sidebar debe llamar a `Router.navigate([item.route])`.** Emitir el evento y manejarlo solo para cerrar el sidebar en móvil es insuficiente; el guard de autenticación y el historial del navegador solo funcionan si la navegación pasa por el Router de Angular.

#### CSS / Design Tokens

- **`rgba(var(--mi-variable), 0.3)` funciona solo si la variable contiene exclusivamente los valores RGB sin paréntesis** (`95, 41, 92`). Si la variable no tiene fallback y no está definida en el scope del tema oscuro, el resultado es `rgba(, 0.3)` — inválido, sin error visible. Siempre incluir fallback: `rgba(var(--mi-var, 95, 41, 92), 0.3)`.

- **Los tokens de color de foco (`:focus-visible`, input shadow focus) deben redefinirse en cada bloque de tema.** Un `--brand-primary-500-rgb` definido solo en `:root` hace que todos los temas usen el mismo color de acento del tema claro. Cada tema oscuro necesita su propia redefinición de los tokens RGB.

- **La técnica de "elevation overlay" es la correcta para sombras en temas oscuros.** Una sombra `rgba(0,0,0,N)` sobre fondo oscuro tiene contraste cero. La solución: `box-shadow: 0 0 0 1px rgba(255,255,255,0.06), 0 Xpx Ypx rgba(0,0,0,0.85)` — el anillo blanco semitransparente define el borde del elemento y la sombra oscura crea la profundidad.

- **Los tokens de componente (`_tokens-components.css`) deben definir explícitamente TODOS los valores en cada bloque de tema**, incluso si el valor es idéntico al tema claro. La herencia CSS de `:root` a `[data-theme="dark"]` no es garantizada cuando el tema se aplica a un elemento antecesor distinto. Tokens faltantes = componentes con colores del tema equivocado en modo oscuro.

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

### Fixed

- Corrección visual en cuadros de mando (Gerencial y Operativo) asegurando el uso de variant="elevated" para mantener jerarquías de color consistentes.
- Alineación vertical perfecta mediante Flexbox en todas las tarjetas de estadísticas.
