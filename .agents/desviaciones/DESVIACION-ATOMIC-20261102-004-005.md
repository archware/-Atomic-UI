---
title: "Primera devolución de guardas e integridad de evidencia"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-11-02"
last_updated: "2026-11-03"
document_type: "desviación"
status: "vigente"
version: "1.0.12"
id: "DESVIACION-ATOMIC-20261102-004-005"
asignacion: "ATOMIC-20261102-004"
repositorio: "-Atomic-UI"
fecha: "2026-11-02"
estado: "abierta"
severidad: "media"
apartado_roto: "§17.0.3"
---

# Primera devolución de guardas e integridad de evidencia

## Qué se esperaba

Las guardas debían cubrir los consumidores y formas de acceso descubiertos,
la instalación sin desarrollo y la integridad del backport, clasificando
correctamente una medición incompleta. Las huellas debían incluir los bytes
realmente ejecutados por el corpus y sus negativas.

## Qué se observó

El juez independiente descubre siete obligaciones incumplidas: falta la
omisión de Storybook en postinstall con dev excluido; falta releer el archivo
tras escribir; se omiten enlaces dentro de dist; el scanner excluye raíz y
destructuración; acepta 11.0.0+build.1 bajo un umbral 11.0.1; no ejerce Glob
por eventos en nonull; y clasifica una lectura EIO como diferencia funcional
en vez de arnés incompleto. Además, la captura de dependencias omite archivos
efectivos del motor y del reemplazo de deepmerge.

La revisión de la primera corrección acredita el corpus 66/66 y las ramas
corregidas de instalación y backport, pero conserva dos defectos de la guarda:
el listado manual de API omite `matcher.make()` y `parseNegate`; retirar
`filter` en memoria clasifica un defecto de API como arnés incompleto. La
negativa de eventos nonull presenta la misma clasificación incorrecta.
El orquestador descubre además que la captura de fuentes no incluye
`governance/` y `test-fixtures/`, aunque sus archivos son entradas de controles.
No se reconstruyen huellas anteriores para suplir esa omisión.

La segunda y última corrección queda rechazada con el SHA-256
`f31635b484e746198494b693959342a3eaf510a6e0eca39f80187971b3ffabaf`.
Una función fábrica devuelve un Minimatch y su resultado llama a `make()`:
la guarda inspecciona la fuente pero acepta base, mutante y restauración.
La ejecución real funciona con v3 y falla con la fachada. No demuestra que
Karma instalado use esa llamada: demuestra que la guarda no cierra ante una
necesidad nueva. Las negativas directas no certifican exhaustividad.

## Evidencia

Los originales del juez quedan en TEMP/atomic-seguridad-20261102-004 bajo
juez-parche-independiente, juez-enlace-bundle, juez-raiz-independiente,
juez-api-independiente, juez-version-independiente, juez-glob-eventos y
juez-clasificacion-error. Cada carpeta conserva probar.cjs y resultado.json.
La devolución es agrupada y corresponde a la primera corrección; no hay
dictamen final aprobado. El juez no modifica archivos del repositorio.

Los originales adicionales son `juez-ronda1-superficies/resultado.json` y
`juez-ronda1-tipoerror/resultado.json`. La cadena `governance-correccion1`
termina con código cero y huellas coincidentes sobre el conjunto capturado;
su alcance incompleto no acredita las entradas omitidas. La segunda y última
corrección conserva ese resultado y repite los controles afectados con un
barrido completo previo y posterior.

En el cierre operativo de navegador, una consulta de puertos sin elevación
ocultó un error de acceso con `-ErrorAction SilentlyContinue`. Su lista vacía
no acredita ausencia de servicios. El archivo inicial se conserva sin valor
de aceptación. La consulta posterior con elevación y `-ErrorAction Stop`,
en `servicios-navegador-final-cierre-acreditado.json`, termina con código cero:
solo escucha 4200, PID 32244; los dos servidores propios de Storybook están
cerrados. Esa corrección no modifica fuentes ni resultados de navegador.

El último dictamen y el contraste real quedan en `juez-ronda2-fabrica/`
(`probar.cjs`, `resultado.json`, `probar-runtime.cjs` y
`resultado-runtime.json`). `ESTADO_DETENCION_CORRECCION2.json` registra
la detención del constructor. No se ejecuta una tercera edición ni se
presenta el arnés V3 preparado como una validación realizada.

En la probeta del replanteo, el primer comparador TEMP intenta resolver un
`package.json` no exportado por un paquete y termina con
`ERR_PACKAGE_PATH_NOT_EXPORTED`. Se conservan el script
`generar-propuesta-candidatura2-fallo-export.cjs` y el log
`candidatura2-generacion.log`. El comparador corregido asciende desde el
entrypoint al manifiesto físico; su log separado
`candidatura2-generacion-v2.log` y código cero acreditan dos propuestas JSON
idénticas y 856 archivos de nueve propietarios npm iguales a la referencia.
Ese fallo del arnés inicial no acredita un defecto de esos paquetes ni se
utiliza como resultado aceptado. La revisión de la nueva guarda sigue abierta.

El primer arnés independiente de negativas de la segunda candidatura también
se interrumpe por un error propio: `ReferenceError: restaurado is not defined`,
en `juez-candidata2/negativas.cjs:67:59`, después de restaurar la negativa de
consumidor nuevo con código cero. El script y las evaluaciones parciales se
conservan en `juez-candidata2/observaciones/`; la última es
`14-consumidor-nuevo-restaurado.resultado.json`. La excepción del padre quedó
en la llamada original de herramienta del juez, sin redirección a un archivo;
no existe un log retroactivo ni se reconstruye como si hubiera sido capturado.
El juez continúa los pendientes en un segundo arnés de nombre distinto y no
modifica el producto ni la probeta original fijada.

El primer pre-juicio de la segunda candidatura rechaza la propuesta
`17e77d931a91fb69b990b77b583ca9ef82248f5e0ec5ead4eefaacf159bdc6f8`
y su JSON `e1d7ba20f4f6e0e4261d36eeb5fec96fc8e56e941528e0ed0f3372d0382867de`.
Faltar `karma-chrome-launcher`, requerido por la raíz, o alterar solo su
identidad mantiene indebidamente el código cero de la CLI. La función
exportada `probarCompatibilidad` también acepta una salida preexistente fuera
del temporal del proceso y sobrescribe una centinela. El juez simula el
temporal dentro de su propio TEMP y restaura las copias; no hay daño a archivos
del usuario. Los originales están en `juez-candidata2/`, con
`probar-grafo-cli.resultado.json`, `negativas-grafo.resultado.json` y
`probar-contencion-cuatro-pasos.resultado.json`.

La devolución agrupada inicia la primera corrección de la segunda candidatura,
solo en nuevos artefactos TEMP. El producto conserva la guarda rechazada
anterior y aún no se adopta ninguna propuesta nueva. Los preflight verdes no
sustituyen estos tres casos. La captura siguiente de 17e se interrumpe y se
conserva como parcial; su código de proceso uno no se acredita como resultado
de producto. Los objetos fijados 17e/e1 permanecen inmutables.

La primera corrección de la segunda candidatura, guarda `8a8d906c…` y
línea base `4338689c…`, corrige las tres reproducciones anteriores. El juez
encuentra dos nuevos falsos verdes: se retira solo el `main` ejecutable de
un paquete requerido y se trata como datos, o una nueva declaración
obligatoria queda oculta por un peer opcional del mismo nombre. La CLI pasa
incorrectamente el corpus en ambos mutantes. Los originales son
`juez-candidata2-c1/probar-entrada-ausente.resultado.json` y
`juez-candidata2-c1/probar-obligatoria-en-peer-opcional.resultado.json`.
Se restauran ambas probetas. La propuesta no se adopta y se devuelve el
grupo completo para la segunda y última corrección de esta candidatura.

El lote V5 de esa propuesta conserva sus 18 comandos y termina con código
dos en el cotejo de trazas: nueve sondeos de npm a `.npmrc`,
`npm-shrinkwrap.json` y `yarn.lock` se registraron al intentar la lectura,
sin distinguir su resultado. El suplemento conserva la ausencia observable
sin acreditar un éxito pasado. Se preserva el código dos de `lote-yLddCX`.
La nueva traza prueba explícitamente el resultado del sistema de archivos
antes de clasificar una ruta como entrada leída o sondeo ausente; la última
candidata requiere sus propios originales, sin reutilizar esa aceptación.

El segundo y último pre-juicio de la candidatura física rechaza
`3c0aa2365354bc656ffff508c4700d5802bd86f28fad36b3f2d0d6d0ebee2ae9`
y el JSON `4f8da3df2e0f3b563fe4be0510d9a6f605e6521a1f5e0436f1c5c47caac0fe5b`.
La medición de subrutas se limita indebidamente a paquetes con main ausente.
Karma usa el literal `@colors/colors/safe`; al retirar solamente `safe.js`
en una copia TEMP, falla la resolución y la carga real del reporter, pero
el inventario y la CLI aprueban. Se restaura el archivo con SHA idéntico.
En la instalación del proyecto el archivo sí existe y el reporter carga:
el hallazgo es de la garantía de la guarda, no una rotura instalada.

Se preservan `juez-candidata2-c2/probar-subruta-real.resultado.json`, los
originales de la CLI y `ESTADO_DETENCION_CANDIDATURA2_CORRECCION2.json`.
No se adopta el JSON ni se ejecuta una tercera corrección de esta candidatura.
El nuevo escalado pide replantear el alcance de la guarda para acreditar la
corrección de seguridad acotada, sin prometer certificación general de los
consumidores ni ocultar estos resultados.

## Corrección mínima que preserva la doctrina

Se devuelve el conjunto completo al constructor dentro de las rutas y firmas
ya autorizadas. Se corrigen las ramas y la detección, se capturan físicamente
las entradas efectivas de forma independiente de la guarda y se repiten los
criterios afectados y sus negativas. No se reconstruyen hashes pasados.
Se coordina el cierre de servidores antes de repetir la instalación real y
se conserva el máximo de dos vueltas de corrección de la orden.

## Escalado

Agotadas las dos vueltas, se devuelve el criterio a arquitectura para un
replanteo cerrado, con descubrimiento y rechazo verificable de necesidades
nuevas. No se reinicia el contador de la candidatura rechazada ni se
presenta un tercer parche como la misma orden aprobada. Se conserva la
resolución de dependencias funcional y se revisa la guarda dentro del alcance
de seguridad. La documentación también requiere reconciliar el corte 006
paralelo antes de escribir sus cuatro archivos compartidos.

## Corrección aplicada y comprobada

La orden de verificación acotada `74046cee4bbb25fd981f7acf8ab72c797e8fe277fd03c000408fa5864742605b`
retira la garantía general que no pudo acreditarse. El juez aprobó el
inventario limitado a las tres familias objetivo y el ajuste de su README.
Se adoptaron los dos archivos revisados, sin instalar la línea base
rechazada ni alterar el lock o el backport.

Los originales `verificacion-acotada-adopcion-uWtv9C/resultado.json`,
`juez-verificacion-acotada/revisar-inventario-fisico-v2.resultado.json` y
`verificacion-acotada-negativas-vwWpYd/resultados.json` conservan la
adopción, el contraste y los fallos controlados. El corpus separado pasó
66 casos y el reporter real cargó. La guarda de dependencias pasó en el
árbol de trabajo. Este cierre corrige la afirmación de cobertura; no
presenta las propuestas rechazadas como verificadores generales válidos.

## Incidencia del arnés de gobierno en el corte final

La ejecución completa de `governance:check` del corte acotado conserva
código uno en `verificacion-acotada-gobernanza-lote-odWWpu`: el control de
dependencias y `governance:test` pasaron, pero `governance:smoke` chocó con
la contención del arnés. El generador crea un enlace de directorio temporal
llamado `node_modules` hacia la instalación del proyecto. El arnés rechazó
la limpieza por `ENLACE_FUERA_DE_ALCANCE` antes de ejecutar el resto de la
cadena. El evento no demuestra un fallo del manifiesto o de la aplicación.

La corrección mínima se limita al arnés en TEMP. Se registra el enlace
exacto creado por el proceso y se valida su destino; se elimina el enlace
sin recorrerlo ni borrar el directorio al que apunta. Se conserva el
rechazo de todo enlace ajeno y la inspección del directorio real antes de
una eliminación recursiva. Se exige una prueba aislada con centinela y se
repiten las obligaciones que quedaron pendientes, sin reetiquetar la
ejecución fallida ni volver a medir por rutina las que ya pasaron.

El segundo `package:check`, sobre el manifiesto regenerado, pasó su
validación canónica y llegó a `npm pack --dry-run`. Se conserva código uno
porque la protección del arnés rechazó una ruta temporal de caché bajo
`dist/npm-cache/_cacache/tmp`. La traza identificó un archivo regular que
npm crea en exclusiva, sin un directorio temporal por archivo. V4c registra
esa creación y comprueba identidad y padre real; retira solo el archivo
con una operación no recursiva. La raíz, enlaces y archivos ajenos siguen
fuera de alcance. No se cambia el empaquetador del producto.

`verificacion-acotada-contencion-v3-probeta/resultado.json` prueba la
limpieza de la unión y conserva los centinelas. El lote V3 ejecutó el
smoke con código cero. La probeta V4c ejecutó `npm pack` y rechazó tres
casos no autorizados; los centinelas conservaron sus huellas. Finalmente
`verificacion-acotada-package-v4c-lote-lsktVV/package-check.resultado.json`
registró `package:check` con código cero. Los dos fallos previos no se
reescriben. La repetición del smoke en el corte final responde a cambios
concurrentes de insumos, no a otra modificación del arnés.

El primer intento puntual del smoke final se detuvo por `Filename too long`
al crear en su fixture un archivo de `nested-scroll-overlay-host-component`.
Se preserva ese original. El mismo comando se repite con un directorio
TEMP más corto; no se cambia Git, la fuente del proyecto ni las guardas.

## Lo que NO se debe hacer

No ocultar la primera devolución, inventar equivalencia de archivos que no
se capturaron, sustituir códigos dos por uno ni confundir audit cero con el
cumplimiento de las guardas. No ampliar versiones o contratos ni reparar el
trabajo UI paralelo para obtener un aprobado.
