---
title: "Corrección compatible de vulnerabilidades de desarrollo"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-11-02"
last_updated: "2026-11-03"
document_type: "roadmap"
status: "completado"
version: "1.1.0"
change_id: "ATOMIC-20261102-004"
---

# Corrección compatible de vulnerabilidades de desarrollo

## Encuadre y ficha de riesgo

```yaml
asignacion: "ATOMIC-20261102-004"
ruta: "completa"
justificacion: "El encuadre estándar detecta una incompatibilidad transitiva no resuelta: minimatch 11 cambia la exportación CommonJS y los segmentos que consume glob 7. Se eleva antes de editar producto."
objetivo: "Eliminar las 34 entradas actuales de npm audit manteniendo herramientas, API pública, contratos y comandos de Atomic UI."
base:
  repositorio: "C:/Users/cotaha/source/repos/-Atomic-UI"
  rama: "main"
  oid: "7633d4c81384cfda10d6e7108750870ca44b8dc0"
  version: "5.22.0"
  estado: "59 archivos previos respaldados e inventariados en TEMP; pertenecen a las unidades 001, 002 y 003 de este chat."
evidencia: "C:/Users/cotaha/AppData/Local/Temp/atomic-seguridad-20261102-004"
contratos: "No se modifican componentes, biblioteca pública, Angular 22, Storybook 10 ni Karma 6. Se adapta únicamente la resolución transitiva de herramientas."
roles: "Orquestador /root sin edición de producto; explorador gpt-6.1-sol bajo; arquitecto gpt-6-astra máximo; constructor gpt-6.1-sol alto; juez gpt-6.1-terra máximo, distinto del constructor y autorizado expresamente por el usuario ante los fallos de capacidad de gpt-6-astra."
autorizaciones: "El usuario solicita expresamente corregir las 34 vulnerabilidades sin romper compatibilidad. Autoriza resolución e instalación local de dependencias y adaptaciones necesarias. Sin commit, publicación, despliegue, bases reales ni cambios de consumidores."
rollback: "Retirar únicamente los fragmentos de 004 desde respaldo TEMP, conservando las unidades previas y cualquier cambio posterior; reinstalar el lock previo con npm ci. No restaurar masivamente el árbol."
disparadores_escalado: "Una incompatibilidad de producto o herramienta no resuelta detiene la construcción y vuelve al arquitecto. No se oculta mediante filtros de auditoría, versiones ficticias o eliminación de herramientas."
```

El sondeo previo descubre 38 repositorios y termina con cero. El reparto
disjunto y su captura previa terminan con cero antes de editar. Las rutas
exactas constan en `reparto.json`: construcción sobre `package.json`, lock,
`tools/compatibilidad-minimatch/`, prueba de compatibilidad y salida Compodoc;
documentación sobre los cuatro registros de continuidad; orquestación sobre
este roadmap y la desviación 001. Las ampliaciones requieren otra captura
antes de escribir. `documentation.json` solo admite generación automática y
restitución exacta de su copia previa, conservando el generado en TEMP.

## Diagnóstico y diseño

La consulta actual confirma 33 entradas moderadas propagadas por
`minimatch <11.0.1` y una baja por `deepmerge 4.3.1`. Se conservan los dos
avisos completos, sus rutas y las versiones del registro. El
[aviso de minimatch](https://github.com/isaacs/minimatch/security/advisories/GHSA-g3hv-75wg-m249)
publica la corrección en 11.0.1; la última versión consultada es 11.0.4. El
[aviso de deepmerge](https://github.com/advisories/GHSA-gcqx-w48m-w2h4)
no registra una versión corregida del paquete original.

La orden del arquitecto fijará la adaptación local explícita, el motor oficial
corregido y la sustitución acotada de deepmerge antes de construir. Se revisa
el código publicado de cada reemplazo. No se aceptan cambios directos de
versión que rompan la función CommonJS, el matcher de segmentos de glob o las
opciones existentes. Tampoco se considera suficiente un audit vacío: la
primera probeta temporal obtiene audit cero pero `npm ls` denuncia una
dependencia ausente; se registra de inmediato en la desviación 001.

El barrido descubre además la misma ruta vulnerable embebida en el bundle
de Storybook 10.6.5, que los overrides externos no sustituyen. El registro
confirma que sigue siendo la versión publicada más reciente. El reparto
ampliado se captura antes de construir y reserva el script de corrección y
el artefacto instalado exacto. La orden incorpora la corrección mínima del
[commit oficial](https://github.com/isaacs/minimatch/commit/77a0f5c4b80bdc641c3c930a1d9edf5ad2db57f8)
mediante postinstall reproducible, versión y hashes reconocidos,
idempotencia y modo de verificación que falla ante ausencia o deriva. No se
anuncia eliminación del problema únicamente a partir de audit cero.

## Aceptación y evidencia prevista

| Criterio | Comprobación observable | Resultado esperado | Entradas e invalidación |
|---|---|---|---|
| Instalación | npm install de resolución, npm ci, npm ls | Cero y árbol completo reproducible | Manifiestos, lock, adaptador, Node y npm; cualquier cambio exige repetir |
| Seguridad | npm audit completo y omit=dev; inventario físico descubierto | Cero, sin minimatch vulnerable ni deepmerge original | Árbol instalado y registro actual; sin exclusiones |
| Compatibilidad transitiva | Corpus glob síncrono y asíncrono, callbacks, exclusiones, dotfiles, llaves, extglobs, globstar, nonull, Windows y prioridad Karma | Coincidencia de resultados válidos y API consumida | Motor, adaptador, consumidores reales y fixtures; repetir ante cambios relevantes |
| Ataques | Payload de amplificación y envenenamiento; negativas aisladas con base, mutación, fallo y restauración | Defecto detectado y restauración correcta | Fuentes finales y manifiestos de prueba; nunca mutar el árbol compartido |
| Producto | Lint, Karma con cobertura, build de aplicación y biblioteca, Storybook | Cero errores y avisos; al menos 762 pruebas correctas; tres builds cero | Fuentes, configuraciones y dependencias finales |
| Desarrollo | Servidores propios de aplicación y Storybook, preview compilado y cierre de procesos propios | Contenido visible y funciones de desarrollo correctas | Configuración, árbol final y pruebas de navegador pertinentes |
| Gobierno | Cadena Atomic pertinente, compuertas completas, documentación, índice y diff | Cobertura ejecutada con códigos originales; fallos externos atribuidos | Fuentes de controles y árboles realmente examinados; no se hereda el verde de 003 |
| Juicio | Juez independiente contra orden, diff y originales | Aprobación expresa de cada criterio | Sin informe del constructor como prueba |
| Confinamiento | Colisión y sondeo comparado después del último agente | Ninguna escritura propia fuera del reparto ni cambio de referencias | Capturas previas y finales; actividad paralela atribuida por ruta |

No se introducen filtros de auditoría. Las pruebas nuevas de seguridad y
compatibilidad se justifican por el cambio de dependencias críticas del
tooling. Se conservan los originales de todas las vueltas, con siete huellas
de entradas y resultados. La orden cerrada y su SHA-256 se incorporan a la
evidencia antes del lanzamiento del constructor. El índice raíz es un
derivado requerido, con respaldo y reparto independiente antes de generarlo.

## Ejecución

- [x] Capturar estado, auditoría, respaldo y APIs de los consumidores.
- [x] Clasificar y elevar el riesgo antes de editar producto.
- [x] Cerrar las dos órdenes y acreditar instalación en probeta antes de construir.
- [x] Construir la resolución compatible y el backport reproducible.
- [x] Ejecutar regresiones, negativas y controles sobre el árbol final.
- [x] Completar juicio independiente y continuidad documental.
- [x] Acreditar inventario de desviaciones, confinamiento y sondeo final.

La desviación `DESVIACION-ATOMIC-20261102-004-001` registra la primera
probeta de resolución incompleta y se corrige con las probetas 2 y 3.
La desviación `DESVIACION-ATOMIC-20261102-004-002` registra el límite de
guardado y la interrupción por capacidad del arquitecto; la orden se recupera
antes de construir. Sus archivos originales permanecen en TEMP; aquel corte
previo a la implementación no acreditaba una instalación de producto.

El usuario autoriza expresamente gpt-6.1-terra con esfuerzo máximo para
arquitectura y revisión, manteniendo gpt-6.1-sol como constructor. La orden
de arquitectura de gpt-6-astra se recupera sin reemplazar su trabajo; la
autorización se aplica al juez de esta asignación. No cambia el archivo de
roles global ni los permisos de otras asignaciones.

Las órdenes recuperadas y comprobadas quedan fijadas por SHA-256:
construcción `0f283f4810c7c0e1d534573c66c149f64fba93bc62c0e6563808efe44a809a19`
y documentación `99e2df590351c47ac443b5d2b01220c9a008b9ba0aff7da637d55a0d5df20d19`.
El lanzamiento de implementación se registra en `lanzado-construccion.txt`
después de esa fijación. La desviación 002 queda corregida antes de construir.

La adenda de resolución del arquitecto Terra queda fijada por SHA-256
`77b8f1eacbf97d5e355774a6968c88e6cb5b1342afc604bbc88219f68bf7b388`.
Autoriza únicamente dos restricciones de versiones en la generación TEMP,
seguidas de restitución exacta del manifiesto final y todas las comprobaciones
previas a adoptar el lock. No añade overrides ajenos al producto ni permite
editar el lock a mano. La desviación 003 registra y corrige el lector JSON del
arnés; sus salidas fallidas permanecen originales y no acreditan el candidato.

Durante la resolución aparecen cambios externos en componentes y en el
manifiesto de fuentes. El usuario confirma expresamente que son trabajo
paralelo autorizado. Se conservan íntegros y fuera de la unidad de dependencias;
`atribucion-concurrente-atomic.json` registra las rutas observadas. La captura
del reparto ampliado para la desviación 003 precede a su escritura y no
sustituye el control del primer tramo contra su captura original.

La adenda documental concurrente queda fijada por SHA-256
`4c145b5e09bdc975a05cc9372dcc4f2a94b46f129a9cf46e4a6db9c08bb55ed2`.
Conserva la unidad 005 y establece ventana 005/004/003, con 002 íntegro en
bitácora y 001 ya archivado. El escribano vuelve a tomar los bytes vivos;
sus borradores anteriores no se escriben sobre el trabajo paralelo.

La desviación 004 conserva el falso verde rechazado de una negativa y su
fixture corregida. La desviación 005 registra la primera devolución agrupada
del juez y la insuficiencia de huellas de dependencias ejecutables. El
constructor corrige dentro de la orden y repite lo afectado; no existe aún
dictamen final aprobado. La primera corrida de governance se conserva como
interrumpida al quedar supersedida su guarda por esa corrección.

La desviación 006 registra una secuencia incorrecta de dos escrituras de
gobierno; la captura v3 no se acredita como previa a esos archivos. Se
conservan las marcas reales y se esperan las capturas v4 y v5 completadas
antes de añadir los registros siguientes. La desviación 007 registra la
contención omitida en fixtures temporales del juez y arneses; las nuevas
copias validan realpath y rechazo de raíz, exterior y enlaces de escape.
Los siete registros pertenecen a 004; los originales de todos los intentos
y las correcciones permanecen disponibles para el juicio.

La resolución final adopta el lock generado por npm con SHA-256
`24104729a04261dbf0112a143478d1e4047c07a9f9ae4c3671650d59f121609d`.
La instalación real con postinstall pasa y conserva el lock. Las auditorías
completa y con desarrollo omitido tienen cero vulnerabilidades. La consulta
de dependencias objetivo y de primer nivel pasa; `npm ls --all` conserva
código uno por el binding WASI opcional de OXC, con el mismo defecto en la
referencia previa. No se anuncia un árbol completo sin advertencias.

El lote de la primera corrección acredita 66 casos diferenciales, lint sin
errores ni avisos y las construcciones de aplicación, biblioteca y Storybook.
Karma registra primero 764 aprobadas de 765, con un fallo de posicionamiento
de Select2; la única repetición completa, sin editar fuentes ni filtrar casos,
aprueba 765 de 765 con cobertura. Se conservan ambos originales y no se
atribuye una causa no demostrada al fallo inicial.

`governance-correccion1` termina con código cero, pero la captura omite entradas
de `governance/` y `test-fixtures/`. Esa limitación impide reutilizarla como
acreditación completa. La última corrección de la guarda y un barrido completo
repiten lo afectado. La devolución agrupada conserva dos defectos concretos:
superficies heredadas omitidas y errores de API clasificados como arnés roto.

Las compuertas completas del ecosistema terminan con código uno por tres
controles: documentación, índice y secretos. El defecto documental observado
es un delimitador EOF del roadmap paralelo 005; se conserva ajeno. El índice
se regenera al cerrar las escrituras. El control de secretos registra 34 REAL
y 10 DEBIL fuera del frente de dependencias; no se reproduce ningún valor.
El resultado global no se convierte en aprobado por atribuir sus causas.

La pasada de navegador acredita contenido de aplicación en 4200, diálogo
numérico en Storybook de desarrollo, foco inicial y restituido, control de
tabla con una instancia antes, durante y después del cambio, y preview
estático renderizado, sin errores de consola. Los bytes instalados y los 346
artefactos estáticos coinciden antes y después. La única diferencia de fuentes
es una prueba de FormDialog del trabajo paralelo 006, excluida explícitamente
del compilador de aplicación y de Storybook: la equivalencia es únicamente
para navegador, no para certificar Karma sobre esa prueba nueva.

La segunda y última corrección de la primera candidatura se rechaza: una
instancia de Minimatch devuelta por una función fábrica usa `make()` y la
guarda vuelve a aceptar un uso no cubierto. El contraste real funciona con
v3 y falla con la fachada; no se atribuye ese uso al Karma instalado. El
constructor detiene las mutaciones y los controles largos. Se devuelve el
criterio a arquitectura; no se ejecuta una tercera edición bajo la orden
agotada ni se declara aprobada 004. La desviación 005 conserva originales,
dictamen y escalado.

Después de la pasada de navegador, el frente paralelo 006 modifica además
fuentes de ejecución, historias y catálogos. Esos cambios pertinentes
invalidan la equivalencia de navegador y las regresiones previas para el
árbol posterior. Los originales permanecen válidos para su corte identificado,
y se repiten los controles afectados cuando se estabilicen las fuentes.
El escribano detecta también ventana documental 006/005/003 y 002 ya archivado;
aborta antes de escribir. Arquitectura reconcilia las nuevas premisas sin
sobrescribir 005 ni 006.

Arquitectura cierra una segunda candidatura de diseño distinto en
`ORDEN_ATOMIC-20261102-004_candidatura2_inventario_fisico.md`, SHA-256
`016c78cb201acfcc0cdcc46e195e5f94c6c0bbc9cfee7251f9c8c96cccb67e4e`.
La guarda compara un inventario físico descubierto con una línea base
revisada en `tools/huellas-consumidores-compatibilidad.json`. Cualquier
deriva de fuentes, archivos, identidad o resolución exige revisión; la
validación ordinaria no aprende ni actualiza su línea base. El AST queda
como diagnóstico auxiliar y no certifica exhaustividad de JavaScript.
El reparto v6 y su captura completada con código cero preceden al nuevo
lanzamiento, sin sustituir los controles de los tramos anteriores.

La adenda documental que reconcilia 006 tiene SHA-256
`044e15e519b67124b2466e6c65b812415a94a2dacee9869d151cdf822a4424f5`:
fija ventana 006/005/004, mueve 003 íntegro y conserva 006, 005, 002 y 001.
El escribano prepara únicamente TEMP hasta disponer de resultados definitivos
y vuelve a capturar los bytes vivos inmediatamente antes de escribir.

El sondeo intermedio identifica diferencias en trabajo paralelo, incluido un
avance de la referencia local de `pdf-tool` y ocho rutas compartidas fuera
de la correlación automática. La desviación 008 conserva las rutas, los
originales y el límite de atribución; no modifica otros proyectos ni sus
referencias. La captura v7 completa precede al registro nuevo. Se mantiene
la obligación de repetir el sondeo después del último agente.

Sobre las fuentes de 006 se repiten las cinco regresiones de UI. El lote
`ui-corte-006` pasa lint, 800 pruebas completas con cobertura y las tres
compilaciones, con siete huellas iguales antes y después. `navegador-006`
acredita aplicación, Storybook de desarrollo y preview estático con las
mismas fuentes y bytes instalados. Después se añade una prueba de Modal en
el trabajo paralelo. `ui-006-delta-spec` repite únicamente lint y la suite
completa: 801 de 801, con cobertura, y siete huellas iguales. La prueba está
excluida de las tres compilaciones y del navegador. Se preservan los cortes
anteriores; la equivalencia final se limita a los insumos realmente usados.

Las dos primeras propuestas físicas de la segunda candidatura quedan en
TEMP y no se incorporan al producto. La primera revisión detecta ausencia
de paquetes requeridos, identidad no comprobada y contención incompleta de
la API exportada. La siguiente corrección resuelve esos tres casos, pero
deja dos falsos verdes en resolución de entradas ejecutables y precedencia
de un peer opcional. La desviación 005 enlaza los originales y la devolución
agrupada para la última corrección. Las auditorías y regresiones aprobadas
no sustituyen la revisión de la guarda ni autorizan adopción anticipada.

La precisión de arquitectura de aristas tiene SHA-256
`c417abcb091aee65ccc4b660768d199da065c51a6c18576cb93b48742fea1c52`.
Conserva por separado las declaraciones solapadas y la precedencia de npm.
La resolución diferencia paquete instalado y entrada efectiva. Dos paquetes
ya declaran una entrada raíz ausente en la referencia; sus nueve aristas se
identifican como estados previos no resueltos, sujetos a huellas y revisión,
sin tolerar una ausencia nueva. El contraste documenta subrutas observadas
y el límite de los usos literales, sin excluir paquetes por nombre. Rige en
la última corrección de esta candidatura y no reinicia el contador.

La última propuesta física tampoco se adopta: retirar `@colors/colors/safe.js`
en una copia impidió cargar el reporter de Karma y el inventario devolvió
éxito. En la instalación de trabajo la subruta existe y el reporter carga.
La desviación 005 conserva la reproducción y el límite de esa verificación.

La orden de verificación acotada, SHA-256
`74046cee4bbb25fd981f7acf8ab72c797e8fe277fd03c000408fa5864742605b`,
mantiene la ruta completa y limita la guarda a las familias `minimatch`,
`motor-minimatch` y `deepmerge`. No se instala la línea base de la propuesta
física. La comprobación del backport de Storybook permanece separada, al
igual que el corpus de compatibilidad y la carga real del reporter. El
reparto v8 precede a la construcción del verificador y del ajuste de su
README; la resolución de dependencias y los scripts se mantienen.

El 3 de noviembre las dos auditorías de la instalación de trabajo, con y
sin dependencias de desarrollo, devolvieron código 0 y total 0 sobre el lock
`24104729a04261dbf0112a143478d1e4047c07a9f9ae4c3671650d59f121609d`.
El juez aprobó la adopción acotada después de verificar 1.198 paquetes y
12 consumos, repetir las negativas y ejecutar el corpus de 66 casos como
ensayo separado. Se adoptaron únicamente la guarda `c6e7a14448622680a3244cf7bd4b2e7a108ccd84ddc08a09616d4bb9d59cecfe`
y el párrafo del README `d26a6f2d7cb1153ca65afe2ed1a03c9351383bfc7746111159c9bae25a785c62`.
La constancia `verificacion-acotada-adopcion-uWtv9C/resultado.json` prueba
que el manifiesto npm, el lock, la fachada y el helper permanecieron
iguales. Las instalaciones limpias con npm 11.12.1 y 11.16.0 pasaron con
scripts activos y el mismo lock; la prueba de omisión de desarrollo se
conserva por identidad de sus entradas.

La captura `identidad-ui-pre-adopcion` detectó cambios concurrentes en
14 archivos de interfaz y pruebas, sin cambio de dependencias instaladas.
No se reutilizan las cinco regresiones anteriores como evidencia del nuevo
corte. Se preservan las fuentes concurrentes y se repiten las verificaciones
afectadas. Las compuertas y la documentación de cierre siguen pendientes.

El lote `ui-acotada-arbol-vivo` aprobó lint sin avisos, 802 de 802 pruebas
de Karma con cobertura y las compilaciones de aplicación, biblioteca y
Storybook. Las cinco obligaciones conservaron sus siete huellas. La
aplicación renderizó el catálogo sin el error del compilador y el artefacto
estático de Storybook mostró la tabla. En desarrollo, el diálogo conservó
el foco de entrada y retorno, y la tabla mantuvo una instancia al alternar
densidad. Las salidas directas `navegador-acotado-cua-*.stdout.json`
conservan la evidencia de DOM y consola. La verificación ADN aprobó en su
alcance canónico.

`audit-acotado-entorno-explicito` registra los dos comandos, configuración
efectiva sin exclusiones predeterminadas, siete huellas iguales y total
cero tanto en la auditoría completa como con `--omit=dev`. El resultado
original previo a 004 fue 34 (33 moderadas y una baja). El nuevo manifiesto
de distribución llegó del trabajo paralelo; el contraste de 759 entradas
de regresión encontró solo ese cambio. El manifiesto anterior no pasó su
verificador canónico; ese código se conserva separado de la comprobación
pendiente de empaquetado con el manifiesto regenerado.

El último frente concurrente incorporó `about-dialog`. El lote
`ui-acotada-ultimo-corte` aprobó lint, 807 de 807 casos y las tres
compilaciones; su arnés conservó código dos por el cambio de una hoja de
estilo. `ui-acotada-css-final` repitió Karma, aplicación y biblioteca con
esa hoja fija y los tres comandos terminaron en cero. Solo cambió una ficha
de catálogo que esos tres comandos no consumen, por lo que se conserva su
segundo código dos de captura sin interpretarlo como fallo de producto.
Storybook compiló después del cambio de la hoja, y el catálogo en 4200
volvió a renderizar sin errores de consola.

La corrida íntegra del ecosistema registró 15 compuertas aprobadas, dos
defectos y siete controles de encargo fuera de su invocación. Los defectos
fueron el índice documental pendiente de regenerar y el escáner global de
credenciales, sin referencias a Atomic UI en su bloque de hallazgos. Se
conserva el código uno original; el índice se verifica de nuevo tras el
cierre documental.

En la corrida de gobierno, la comprobación de dependencias y las pruebas
de consumidor pasaron. La cadena se detuvo por la limpieza del enlace
temporal del generador. El arnés corregido en TEMP ejecutó el smoke y otras
22 obligaciones pendientes con código cero. Los dos intentos iniciales de
`package:check` quedan separados: inventario en movimiento y, en el intento
siguiente, limpieza de un archivo temporal de la caché de npm tras llegar
a `npm pack --dry-run`. La desviación 005 registra el alcance de la
corrección del arnés. El intento definitivo `verificacion-acotada-package-v4c`
pasó con las siete huellas iguales, 347 entradas efectivas y ninguna lectura
fuera de lo previsto. Validó 340 fuentes y un dry-run privado de cinco
archivos, sin publicación. Se repite únicamente el smoke que había leído
insumos antes del corte final.

## Recuperación después de la reversión

El 3 de noviembre a las 12:33, una reversión del árbol retiró la corrección
y el lock reaparecido registró 62 vulnerabilidades. Tras la indicación del
usuario de continuar, el sondeo comprobó el nuevo OID
`d89492fdf865e1aaf48029b59960f37891ea9de3`, que incorpora About Dialog.
Durante el preflight reaparecieron los manifiestos, los dos scripts y la
corrección de arranque. Sus huellas coincidieron con las copias verificadas.
El constructor recuperó por copia exclusiva los tres archivos ausentes de
la fachada y comprobó las siete huellas. El enlace local de npm recuperó su
destino.

En el árbol recuperado, `check:dependencias` pasó y las dos auditorías npm
devolvieron cero. También pasaron lint, las 808 pruebas de Karma y la
compilación de la aplicación. El catálogo renderizó en el puerto 4200 y la
consola observada no registró errores. Los originales de recuperación se
guardan en `reaplicacion-004-cierre-0faa8518` y `reaplicacion-qa-*.log`
bajo el directorio de evidencias. Las compuertas globales anteriores
conservan sus resultados y alcances originales.
