---
title: "Corrección compatible de dependencias y arranque local"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-11-02"
last_updated: "2026-11-02"
document_type: "roadmap"
status: "completado"
version: "1.0.0"
change_id: "ATOMIC-20261102-001"
---

# Corrección compatible de dependencias y arranque local

## Encuadre y decisión

```yaml
asignacion: "ATOMIC-20261102-001"
ruta: "estandar"
justificacion: "Actualizaciones compatibles del entorno Angular 22 y Storybook 10; sin cambios de contratos de componentes, autorización, secretos, datos ni reglas de negocio."
objetivo: "Restablecer una instalación reproducible, reducir las vulnerabilidades corregibles y comprobar ng serve y las herramientas del proyecto."
base:
  repositorio: "C:/Users/cotaha/source/repos/-Atomic-UI"
  rama: "main"
  oid: "7633d4c81384cfda10d6e7108750870ca44b8dc0"
  estado: "package-lock.json modificado por npm install del usuario; copia y diff preservados en TEMP/atomic-deps-20261102."
ficheros_permitidos:
  - "package.json"
  - "package-lock.json"
  - "angular.json"
  - ".agent/roadmaps/ROADMAP_ATOMIC-20261102-001_dependencias.md"
  - "CHANGELOG.md"
  - "LESSONS_LEARNED.md"
  - "docs/CONTINUIDAD_AGENTES.md"
  - "docs/BITACORA_CONTINUIDAD_CORTES_HISTORICOS.md"
  - "distribution/atomic-source-manifest.json"
  - ".agents/desviaciones/DESVIACION-20261102-001.md"
  - ".agents/desviaciones/DESVIACION-20261102-002.md"
trabajo_ajeno: "Se preserva la reconciliación previa del lock: retiro de @fontsource/open-sans y declaración raíz de @eslint/js. Los cambios de otros repositorios y del índice documental raíz son ajenos."
contratos: "Se conservan la versión 5.22.0 del producto, la API de @atomic-ui/core y sus consumidores. Solo se actualizan herramientas y resolución de dependencias compatibles."
roles: "Responsable /root; constructor gpt-6.1-sol, esfuerzo alto; juez gpt-6-astra, esfuerzo máximo. Exploración de solo lectura gpt-6.1-sol."
autorizaciones: "El encargo del usuario autoriza corregir e instalar dependencias locales. No se confirma, publica, despliega ni modifica otro producto."
disparadores_escalado: "Una migración de Angular/Storybook a otra versión mayor, ruptura de API o necesidad de cambiar componentes exige detener ese ajuste. Los avisos sin corrección compatible se informan con evidencia."
rollback: "Restaurar únicamente package.json, package-lock.json y angular.json desde las copias previas de TEMP/atomic-deps-20261102, conservando el diff previo del usuario; reinstalar con npm ci. Revertir solo las adiciones documentales propias."
```

## Diseño y aceptación

Se actualizan Angular dentro de 22.2 y Storybook dentro de 10, con sus paquetes alineados. Se revisan los overrides antiguos contra las dependencias oficiales nuevas; no se fuerzan APIs incompatibles para obtener una auditoría vacía. Se conserva Karma y el contrato visual. El aviso de prebundling se comprueba contra la configuración de desarrollo; cualquier ajuste queda limitado a esa configuración.

La revisión de `@storybook/builder-webpack5@10.6.5` permite un override
exclusivamente suyo a `webpack-dev-middleware: 7.4.6`. Aunque cambia la versión
mayor transitiva, la API realmente consumida permanece compatible: creación
con compilador y opciones `publicPath`, `writeToDisk`, `stats`, registro como
middleware, `waitUntilValid(callback)` y `close(callback)`. El peer continúa
en webpack 5. El requisito Node >=18.12 se cumple y Storybook no suministra un
`outputFileSystem` personalizado afectado por el cambio de memfs. La
[alerta oficial](https://github.com/webpack/webpack-dev-middleware/security/advisories/GHSA-g84c-rxfj-3j2c)
exige 7.4.6, más reciente que el mínimo que indicaba npm audit. La compatibilidad
queda condicionada a probar el servidor Storybook y el preview, no solo su
compilación estática. No se aplica este override a otros consumidores.

| Criterio | Comprobación | Resultado esperado | Entradas e invalidación |
|---|---|---|---|
| Instalación reproducible | `npm ci`, `npm ls --depth=0` | Código 0, CLI local disponible y peers coherentes | package.json, lock, Node y npm; repetir tras cambios |
| Vulnerabilidades | `npm audit --json` y `npm audit --omit=dev --json` | Eliminar correcciones compatibles, identificar cualquier remanente por paquete y aviso | Árbol final y respuesta actual del registro; no equivale a análisis de alcanzabilidad |
| Arranque | `npm start -- --host 127.0.0.1 --port 4301`, petición HTTP y cierre del proceso propio | Compilación completa y HTTP 200 | angular.json, fuentes y árbol final |
| Herramientas y biblioteca | `npm run lint`, `npm test -- --watch=false --browsers=ChromeHeadless`, `npm run build`, `npm run lib:build`, `npm run build-storybook` | Builds con código 0; lint y pruebas sin regresiones atribuibles a dependencias. Todo fallo previo exige evidencia y queda informado, sin alterar la cobertura ni declararlo aprobado | Fuentes, configuraciones y dependencias finales; contraste aislado del tooling anterior para lint y lectura causal de las expectativas de autenticación |
| Middleware de Storybook | `npm run storybook -- --ci --host 127.0.0.1 --port 6007 --no-open`, petición al preview y comprobación de recompilación y cierre | HTTP 200, preview compilado y proceso propio cerrado | Override acotado, configuración Storybook y dependencias finales |
| Gobierno local pertinente | `npm run test:external-styles-gate`, `npm run check:external-styles`, `npm run test:ui-generator`, `npm run package:check`, `git diff --check` | Código 0; sin modificar guardas ni sus fuentes | Compilador Angular y compiler-cli actualizados, fixtures del generador, manifiestos y atributos Git |
| Gobierno del ecosistema | `compuertas.ps1 -SoloRapidas`, validación documental, índice, sondeo y colisión de cierre | Confinamiento y diferencias atribuidas; cobertura limitada a controles ejecutados | Capturas originales en TEMP/atomic-deps-20261102 |
| Revisión independiente | Juez contra esta ficha, diff y originales | Aceptación explícita o pendientes identificados | Modelo distinto del constructor |

No se crean ni modifican guardas: la prueba negativa de nuevas guardas no aplica tras comprobar el diff no vacío. No se modifican vistas ni estilos; no se requiere una prueba visual de interacción para este cambio de dependencias.

### Pertinencia de la cadena de gobierno

El `AGENTS.md` local exige `governance:check` «Antes de entregar cambios de
componentes»; la continuidad enumera la cadena para «Una modificación
propagable». Esta unidad no modifica componentes, fuentes inventariadas,
catálogo, contrato de propagación ni herramientas de gobierno. La corrida
general se inició por exceso de alcance del plan inicial y continuó trabajando
en sus fixtures Git; no había emitido un resultado ni un fallo. Tras revisar
los consumidores reales de las dependencias modificadas, el juez independiente
validó sustituirla por cobertura proporcional, conservándola expresamente como
interrumpida y no acreditada. No se cambia la ruta ni ninguna compuerta.

La revisión descubrió que `check-external-angular-styles.mjs` consume
`@angular/compiler` y que `test-ui-generator.js` compila consumidores con
`@angular/compiler-cli`: se ejecutan sus controles positivos, negativos y
compilación de tres fixtures. El resto de la cadena examinado utiliza Node/Git,
TypeScript 6.0.3 y AJV 8.20.0 sin cambios, o literales de pruebas; sus fuentes
permanecen iguales a HEAD. Las pruebas y el build completo del paquete ya se
ejecutaron. El log de gobierno general se conserva y su terminación intencional
figura como código -1, nunca como un aprobado.

## Ejecución

- [x] Leer instrucciones, atribuir el lock previo y capturar los 38 repositorios antes del reparto.
- [x] Conservar copias previas, auditoría inicial y reparto disjunto antes de editar producto.
- [x] Actualizar dependencias compatibles y comprobar instalación.
- [x] Ejecutar validaciones de producto y registrar remanentes o desviaciones.
- [x] Completar revisión independiente, continuidad y cierre comparado; acreditar nuevamente el estado tras la última escritura conforme al protocolo siguiente.

La evidencia original se conserva en `C:/Users/cotaha/AppData/Local/Temp/atomic-deps-20261102/`. La auditoría inicial actual obtuvo 62 vulnerabilidades: 5 bajas, 35 moderadas, 17 altas y 5 críticas. El reporte del usuario había obtenido 60; la cifra inicial de esta asignación corresponde a una nueva consulta al registro, no a una regresión de código.

Se abrió `.agents/desviaciones/DESVIACION-20261102-001.md` al fallar la
regeneración con `EBUSY`; se atribuyó y cerró únicamente el `ng serve` previo
de este proyecto. La primera instalación limpia posterior terminó con código
0 y sin bloqueos; se repetirá después del override acotado final.

La primera corrida rápida obtuvo código 2 al no poder leer Git el ignore global
dentro del sandbox; se conserva su salida sin presentarla como aprobación. La
repetición se realizará con acceso suficiente. La ampliación documental
necesaria se registra antes de escribir `DESVIACION-20261102-002.md`: el primer
tramo de confinamiento pasó y se conservaron `reparto-final.json` y su nueva
captura. El índice documental raíz constituye un artefacto derivado exigido por
las instrucciones del ecosistema; se respaldó su contenido sucio previo y se
capturó un reparto adicional limitado a `.agent/INDICE_DOCUMENTAL.md`. Su
regeneración debe conservar las entradas ajenas existentes.

## Resultado y revisión

| Control | Resultado sobre el árbol final | Original en el directorio de evidencia |
|---|---|---|
| Versiones | Angular core 22.2.4; CLI/build/SSR 22.2.5; Storybook 10.6.5; concurrently 9.2.5; ng-packagr 22.2.5; producto 5.22.0 | package.json y package-lock.json; `npm-ls-depth0.log` |
| Instalación limpia | `npm ci`: 0; 1215 paquetes en 55 segundos; sin binarios bloqueados. `npm ls --depth=0`: 0 | `npm-ci.log`, `npm-ci.exitcode.txt`, `npm-ls-depth0.log` |
| Auditoría completa | Código 1: 34 paquetes señalados, 1 baja y 33 moderadas, 0 altas y 0 críticas. Se conservan 2 avisos originales y sus cadenas: minimatch <11.0.1 y deepmerge >=4.2.0 <=4.3.1 | `audit-final.json`, `audit-final.exitcode.txt` |
| Auditoría producción | Código 0, 0 vulnerabilidades | `audit-final-produccion.json`, `audit-final-produccion.exitcode.txt` |
| Arranque aplicación | Compilación y HTTP 200; prebundling activo; servidor de prueba cerrado | `arranque-http.json`, `arranque-final.log` |
| Aplicación y biblioteca | Ambos builds con código 0. La aplicación conserva un aviso de presupuesto inicial: 1.24 MB frente a 1.20 MB; no se modifican presupuestos | `build.log`, `build.exitcode.txt`, `lib-build.log`, `lib-build.exitcode.txt` |
| Storybook estático | Código 0; avisos de tamaño de bundles | `build-storybook-final.log`, `build-storybook-final.exitcode.txt` |
| Servidor y middleware Storybook | HTTP 200 para manager, iframe, índice y bundle de preview. Fixture aislado: entrega, recompilación, invalidate y close correctos con 7.4.6; código 0. Servidor propio cerrado | `storybook-dev.log`, `storybook-dev-http.json`, `probar-middleware.cjs`, `middleware-smoke-final.log` |
| Lint | Código 1, 11 errores y 22 avisos en 433 archivos; idénticos con el tooling previo aislado, sin hallazgos introducidos ni retirados | `lint-previo.json`, `lint-final.json`, `lint-comparacion.json` |
| Karma | Código 1: 695 éxitos y 4 fallos entre 699; contradicción previa de Authorization frente a cookies, en archivos iguales a HEAD | `karma.log`, `karma.exitcode.txt`; desviación 002 |
| Inspección completa npm | `npm ls --all`: código 1 por binding WASI opcional de otra plataforma; el lock mantiene las versiones distintas y la instalación nativa compila | `npm-ls-all.log`; desviación 002 |
| Documentación de proyecto | Código 0, 1 proyecto aprobado, 0 fallos y 2 avisos; esta compuerta revisa el roadmap documental del manifiesto, no sustituye la revisión de esta ficha | `documentacion-final.txt` |
| Contrato de distribución | Código 0: 337 fuentes con SHA-256 y dry-run privado de 5 archivos; no autoriza publicación | `package-check-final.log`, `package-check-final.exitcode.txt` |
| Angular y estilos externos | Ambos controles con código 0; acepta variables CSS y rechaza estilos embebidos | `external-styles-test.log`, `external-styles-check.log` y sus códigos |
| Generador y compilador | Código 0, `UI_GENERATOR_OK fixtures=3`; fixtures de prueba eliminados por el propio arnés | `ui-generator-final.log`, `ui-generator-final.exitcode.txt` |
| Gobierno general | Corrida interrumpida intencionalmente, código -1; no acreditada. Se ejecutaron los controles pertinentes descritos arriba | `governance-final.log`, `governance-final.exitcode.txt`, `governance-interrupcion.json` |
| Compuertas rápidas | Código 0: «Todas las compuertas ejecutadas pasaron (12)»; 12 controles adicionales saltados según el lanzador. No acredita corrida completa | `compuertas-rapidas-final.txt`, `compuertas-rapidas-final.exitcode.txt` |

El primer ensayo del fixture de middleware invalidaba antes de recibir el
evento del observador y consultaba contenido en caché; su código 1 se conserva
en `middleware-smoke.log`. El ensayo final observa la recompilación real de
un archivo TEMP y después comprueba HTTP, `invalidate` y cierre; no altera
fuentes del repositorio.

Los dos avisos restantes no admiten una actualización compatible general:
minimatch 11 cambia la forma de la API que consumen las versiones antiguas de
ESLint, Karma y otras herramientas, y deepmerge 4.3.1 sigue siendo la versión
publicada más reciente. No se aplica un override global que rompa esas APIs.
El análisis `--omit=dev` no constituye prueba de alcanzabilidad ni ausencia
de vulnerabilidades desconocidas.

El manifiesto canónico de 337 fuentes no requiere regeneración porque no se
modifica ninguna fuente inventariada ni la versión del producto. Se comprueba
mediante `package:check`. Compodoc regeneró su archivo de salida durante las
pruebas; se preservó la generación en TEMP y se restituyó `documentation.json`
al contenido canónico original y la forma de trabajo CRLF que declara
`.gitattributes`, con hash Git idéntico y estado final limpio. La generación
de Compodoc es una entrada temporal diferenciada de ese archivo restaurado;
no se afirma que sus contenidos sean iguales.

`huellas-finales.json` y `originales-sha256.json` registran los manifiestos de
fuentes, dependencias, configuración, herramientas, comandos, alcance y entorno,
junto con los hashes de salidas originales. Se incluyen `.gitattributes`, la
configuración Storybook, su documentación generada y el helper temporal del
ensayo de middleware, además de `test-fixtures/` para el generador. Cualquier
cambio de estas entradas invalida la evidencia
correspondiente y exige repetirla.

El juez `gpt-6-astra`, esfuerzo máximo, aceptó el cambio y sus verificaciones
completas sin hallazgos materiales de implementación, después de leer el diff,
recalcular 746 archivos y las siete huellas y contrastar 96 originales. El
constructor `gpt-6.1-sol`, esfuerzo alto, no juzgó su trabajo. La revisión
confirmó la compatibilidad del override, la preservación del lock previo y la
atribución de las limitaciones de lint, Karma y WASI.

La desviación 001 está cerrada. La 002 permanece abierta con severidad media
por las limitaciones declaradas y los cambios concurrentes de otros proyectos;
no autoriza alterar autenticación ni pruebas. La unidad de dependencias está
completada con esos límites; no se certifican la suite global ni la actividad
paralela del ecosistema.

## Acreditación posterior a la última escritura

El cierre técnico anterior queda sujeto a estas comprobaciones posteriores a
la última escritura documental. Sus códigos y salidas originales se conservan
en TEMP y se informan en la entrega; no se reconstruyen resultados ni se
transforma un fallo en aprobación:

- `documentacion-cierre.txt`: validación del proyecto y coherencia del paquete.
- `codificacion-cierre.txt`, `coherencia-cierre.txt`, `contratos-cierre.txt` y
  `referencias-cierre.txt`: repetición de los controles afectados por la prosa
  final. Las demás entradas de la corrida rápida, sin cambios de código,
  configuración, dependencias o herramientas desde su código 0, conservan su
  evidencia; no se acredita una corrida completa.
- `indice-cierre.txt`: regeneración y verificación del inventario, preservando
  los enlaces previos. Su actualización es derivada, no una edición de los
  productos que aparecen en él.
- `colision-cierre.txt` y `colision-indice-cierre.txt`: confinamiento del
  proyecto y del índice raíz contra sus repartos y capturas previas.
- `sondeo-despues.json` y `sondeo-cierre.txt`: 38 repositorios comparados contra
  la captura inicial; las diferencias propias se vinculan al reparto y las
  concurrentes de `pdf-tool` y `prestamos_back` se conservan enumeradas en la
  salida, sin atribuirles autor individual ni modificarlas.
- `desviaciones-cierre.txt`: inventario y validación final de las dos
  desviaciones nuevas y de las preexistentes. Después de esa acreditación no
  se escribe en los repositorios; solo se actualizan artefactos TEMP.

La fuente final debe conservar `main` y
`7633d4c81384cfda10d6e7108750870ca44b8dc0`; un cambio posterior invalida la
evidencia que corresponda. La aceptación técnica no autoriza confirmar,
publicar, desplegar ni sincronizar consumidores.
