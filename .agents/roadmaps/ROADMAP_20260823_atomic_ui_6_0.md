---
title: "Hoja de ruta de Atomic UI 6.0"
subtitle: "Signals, estilos externos, selector público único y compuertas de doctrina"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-08-23"
last_updated: "2026-08-23"
document_type: "hoja de ruta técnica"
status: "en ejecución"
version: "1.0.0"
change_id: "ATOMIC-20260823-600"
canonical_repository: "C:\\Users\\cotaha\\source\\repos\\-Atomic-UI"
baseline_ref: "00f440bfdfb7fcf660d08d6a55efffc080cc8e57"
target_version: "6.0.0"
---

# Hoja de ruta de Atomic UI 6.0

## Propósito

La unidad establece la línea mayor 6.0 de Atomic UI conforme a la doctrina
maestra unificada. La migración se ejecutará únicamente en la fuente canónica y
mantendrá trazabilidad verificable sobre contratos públicos, estilos, catálogo,
generador, distribución y compuertas. La copia de trabajo situada en
`C:\Users\cotaha\Documents\Repos2\-Atomic-UI` no se modificará.

## Línea base y alcance

- [x] Se leyó `AGENTS.md`, la doctrina maestra, el gobierno de consumidores, el
  flujo del ecosistema, el runtime de agentes y la guía de diseño aplicable.
- [x] Se confirmó la ruta canónica, rama `main`, remoto
  `https://github.com/archware/-Atomic-UI.git` y OID de línea base.
- [x] Se confirmó que el árbol estaba limpio antes de esta hoja de ruta.
- [ ] Se actualizará el gobierno y la documentación normativa a la política 2.0
  y a la versión 6.0.0 sin suprimir la trazabilidad de políticas anteriores.
- [ ] Se incorporarán compuertas cerradas para Signals, estilos externos,
  medidas sin `px`, selector `app-` único y ausencia de Tailwind en Atomic UI.
- [ ] Se corregirá el generador para que produzca exclusivamente selectores
  `app-`, Signals y estilos externos conformes.
- [ ] Se resolverán las colisiones públicas de `app-input` y `app-select` con
  una API canónica inequívoca y pruebas de catálogo/barrel.
- [x] Se migraron todos los contratos públicos `@Input`/`@Output` a
  `input()`/`output()` y se retiró `EventEmitter` del alcance mantenido.
- [x] Se extrajeron todos los bloques `styles` embebidos hacia archivos externos.
- [ ] Se retirarán los alias `prest-*` de código, catálogo, historias,
  generador, fixtures y pruebas canónicas.
- [ ] Se retirará Tailwind del contrato, dependencias, configuración, estilos
  globales y composiciones mantenidas.
- [ ] Se sustituirán medidas rígidas `px` por tokens o unidades relativas y se
  actualizarán los tokens requeridos.
- [ ] Se actualizarán versión, manifiestos, contrato de paquete, documentación
  de distribución, `CHANGELOG.md` y `LESSONS_LEARNED.md`.
- [ ] Se ejecutarán y registrarán las compuertas completas.

## Exclusiones explícitas

- [x] No se modificarán consumidores SaaS ni aplicaciones de Escritorio.
- [x] No se modificará el espejo de `Repos2`.
- [x] No se ejecutarán `commit`, `push`, `merge`, `rebase`, publicación,
  despliegue ni escritura de datos.
- [x] No se ocultarán incumplimientos reduciendo pruebas, exclusiones o
  cobertura; todo bloqueo restante conservará su tarea abierta.

## Secuencia incremental

### Unidad 1: gobierno ejecutable

- [x] Añadir la primera compuerta doctrinal de Atomic UI 6.0: contrato Signals
  sin importaciones de `Input`, `Output` ni `EventEmitter`, con prueba negativa
  que también cubre alias de importación.
- [x] Integrar la compuerta Signals en `governance:check`; `quality:check` la
  ejecuta de forma transitiva mediante esa compuerta integral.
- [x] Añadir la compuerta AST de estilos externos y su prueba negativa para
  metadatos, plantillas internas, plantillas externas y estilos de host.
- [ ] Añadir las compuertas restantes de estilos externos, medidas, selectores y
  Tailwind con sus pruebas negativas.
- [x] Actualizar guías y ejemplos normativos para Signals y estilos externos.

### Unidad 2: API pública y generador

- [ ] Definir una única implementación para `app-input` y `app-select`.
- [ ] Actualizar barrel, catálogo, historias y pruebas de resolución.
- [ ] Retirar la generación y aceptación transicional de `prest-*`.
- [ ] Demostrar determinismo y rechazo de contratos obsoletos del generador.

### Unidad 3: componentes conformes

- [x] Migrar átomos y directivas a Signals y estilos externos.
- [x] Migrar moléculas a Signals y estilos externos.
- [x] Migrar organismos, superficies y plantillas a Signals y estilos externos.
- [x] Adaptar setters heredados y controles de formulario sin perder semántica.
- [x] Retirar enlaces `[style.*]` y estilos de host cuando exista
  una representación declarativa mediante clases, propiedades CSS o tokens.
- [ ] Sustituir medidas rígidas por tokens o unidades relativas.

### Unidad 4: Tailwind y distribución

- [ ] Sustituir utilidades Tailwind mantenidas por clases semánticas Atomic.
- [ ] Retirar directivas, configuración y dependencias Tailwind.
- [ ] Elevar la versión a 6.0.0 y regenerar manifiestos canónicos.

### Unidad 5: cierre verificable

- [x] Ejecutar `npm run catalog:check` para el corte Signals.
- [x] Ejecutar `npm run tokens:check` para el corte Signals.
- [x] Ejecutar `npm run tooling:test` para el corte Signals.
- [x] Ejecutar `npm run governance:check` para el corte Signals.
- [x] Ejecutar `npm run lint` para el corte Signals.
- [x] Ejecutar las pruebas Angular sin observación continua para el corte Signals.
- [x] Ejecutar el build de aplicación y el build de biblioteca para el corte Signals.
- [x] Ejecutar el build de Storybook para el corte Signals.
- [x] Ejecutar `npm run package:check` para el corte Signals.
- [x] Ejecutar `git diff --check` y revisar el diff del corte Signals.
- [x] Confirmar mediante búsqueda cerrada que no quedan contratos Angular
  heredados en el alcance mantenido.
- [ ] Confirmar mediante búsquedas cerradas que no quedan estilos, medidas,
  selectores o dependencias prohibidos en el alcance mantenido.
- [ ] Actualizar el estado final de esta hoja de ruta, el changelog y las
  lecciones aprendidas con resultados exactos.

## Corte incremental 1: contratos Signals

El primer corte queda delimitado a la migración completa de contratos Angular
heredados. Se preservaron nombres públicos y comportamiento de formularios; los
setters que normalizan valores se alimentan mediante señales adaptadoras. El
manifiesto de fuentes se sincronizó con el inventario real de este corte sin
elevar todavía la versión: la versión mayor 6.0.0 permanece bloqueada hasta que
las unidades 2, 3 y 4 estén completas.

- [x] Cero importaciones de `Input`, `Output` o `EventEmitter` bajo
  `src/app/shared/ui`.
- [x] Compuerta `check:signals` y prueba `test:signals-gate` operativas.
- [x] Extractor del catálogo actualizado para resolver el alias público de
  `input()`/`model()`, con prueba de señales y decoradores heredados.
- [x] Pruebas Angular: 457 ejecutadas, 457 correctas.
- [x] Lint Angular/TypeScript sin incidencias.
- [x] Build de aplicación de desarrollo completado con 14 rutas prerenderizadas.
- [x] Build de biblioteca Angular Package Format completado después de restaurar
  `node_modules` con `npm ci`; `package-lock.json` permaneció sin cambios.
- [x] Build estático de Storybook completado.
- [x] Gobierno integral y contrato de paquete verificados; el manifiesto registra
  158 fuentes y SHA-256 agregado
  `92e09190815b3d43acc8f3d23d5ef4de6f02945d521712a536f0b1b4eec4bb66`.
- [ ] Resolver el aviso SSR preexistente de `matchMedia` que no altera el código
  de salida del build, pero debe eliminarse antes del cierre 6.0.
- [ ] Completar unidades sin `px`, selector único, retiro de `prest-*`, retiro
  de Tailwind, corrección del generador y versión 6.0.0.

## Corte incremental 2: estilos externos

El segundo corte elimina los estilos definidos dentro de metadatos Angular y
del marcado mantenido. La extracción conservará selectores, orden de cascada,
encapsulación, API y estructura DOM. Las medidas `px`, Tailwind y los alias
`prest-*` quedan fuera del corte para que la revisión no mezcle transformaciones
visuales con el traslado físico del CSS.

- [x] Inventariar cada bloque `styles`, cada `style=` y cada binding `[style.*]`
  bajo `src/app/shared/ui` con ruta y forma de sustitución.
- [x] Extraer los estilos embebidos de átomos y directivas a hojas externas.
- [x] Extraer los estilos embebidos de moléculas a hojas externas.
- [x] Extraer los estilos embebidos de organismos, superficies y plantillas a
  hojas externas.
- [x] Sustituir atributos y bindings de estilo por clases, atributos de estado o
  propiedades CSS gobernadas sin cambiar el DOM observable.
- [x] Añadir una compuerta negativa que rechace `styles`, `style=` y bindings
  `[style.*]`, incluidos literales de plantilla TypeScript.
- [x] Añadir pruebas positivas y negativas para la compuerta de estilos.
- [x] Actualizar la guía de diseño, el registro de cambios y las lecciones
  aprendidas conforme al estilo institucional.
- [x] Regenerar `documentation.json` y el manifiesto de fuentes.
- [x] Ejecutar catálogo, tokens, herramientas, gobierno, lint, pruebas Angular,
  builds de aplicación/biblioteca/Storybook, paquete y `git diff --check`.
- [x] Confirmar cero coincidencias prohibidas y registrar los límites que
  continúan abiertos para `px`, Tailwind, `prest-*` y colisiones de selectores.

### Resultado del corte incremental 2

- [x] Se transformaron 61 archivos TypeScript y se crearon 63 hojas CSS. Los
  archivos con dos componentes conservan una hoja por decorador; `filters`
  mantiene su hoja preexistente y añade una hoja separada para el bloque
  trasladado.
- [x] Se retiraron 33 bindings de estilo de plantillas, dos `HostBinding` de
  estilo y un estilo estático de host. El análisis AST informa cero estilos
  Angular prohibidos dentro de `src/app/shared/ui`.
- [x] `appVariablesCss` se limita a transportar propiedades personalizadas con
  nombres fijados por cada componente. Constituye un adaptador transitorio para
  entradas públicas que todavía aceptan valores CSS arbitrarios; no autoriza
  propiedades visuales equivalentes en plantillas ni metadatos.
- [x] Cada adaptador dinámico deberá retirarse cuando su entrada pública pueda
  modelarse mediante tokens gobernados o un conjunto cerrado de clases tipadas.
  La retirada forma parte de las unidades pendientes de tokens y API 6.0.
- [x] Lint no informó incidencias y las 459 pruebas Angular finalizaron
  correctamente.
- [x] Los builds de aplicación, biblioteca y Storybook finalizaron con código
  cero. El build de aplicación conserva el aviso SSR preexistente porque el DOM
  de prerenderizado no implementa `matchMedia`; Storybook conserva avisos de
  entradas TypeScript no utilizadas y presupuesto de artefactos.
- [x] `governance:check` verificó procedencia, smoke, catálogo, 342 consumos de
  tokens sin faltantes, herramientas, Signals, estilos externos, selectores,
  paquete, contraste y foco. El paquete verificó 222 fuentes.
- [ ] Las medidas `px`, Tailwind, los 16 alias `prest-*`, las colisiones
  `app-input`/`app-select`, la corrección integral del generador y la versión
  6.0.0 continúan abiertas y no forman parte del cumplimiento de este corte.

## Criterios de aceptación

La unidad solo se cerrará cuando el árbol mantenido no contenga `@Input`,
`@Output`, `EventEmitter`, bloques `styles`, enlaces de estilo, medidas `px`,
selectores `prest-*` ni utilidades o dependencias Tailwind dentro del alcance
definido por la compuerta. La API pública `app-input` y `app-select` deberá ser
inequívoca. Catálogo, generador, pruebas, builds y manifiestos deberán describir
la misma versión 6.0.0.

## Estrategia de reversión

No se ejecutará una reversión destructiva. Cada unidad se mantendrá separable en
el diff y podrá restaurarse mediante un parche inverso selectivo sobre los
archivos de la unidad, preservando trabajo ajeno. Si una incompatibilidad no
puede resolverse en el lote, la tarea correspondiente permanecerá abierta, se
registrará el fallo exacto y no se declarará cumplimiento parcial como versión
6.0 terminada.
