---
id: DESV_ATOMIC-20261020-002_ensayo_select2
asignacion: ATOMIC-20261020-002
repositorio: -Atomic-UI
fecha: 2026-10-20
estado: cerrada
severidad: media
apartado_roto: §17
title: "Restricciones del ensayo aislado de Select2"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-10-20"
last_updated: "2026-10-20"
version: "1.0.0"
change_id: "ATOMIC-20261020-002"
document_type: "desviación"
status: "cerrada para la unidad"
---

# Restricciones del ensayo aislado de Select2

## Qué se esperaba

El apartado 17 de la orquestación exige una revisión independiente de la
unidad construida y evidencia estable antes de su aceptación. La orden exige
foco inicial en búsqueda, cierre al ocultar el disparador y limpieza de recursos.

## Qué se observó y evidencia

La instalación de Atomic es un enlace a las dependencias de ventas-cxc. El
ensayo se realiza en una copia temporal con dependencias del lock de Atomic,
sin intervenir ese enlace. El primer intento encontró restricciones de lectura
del sandbox. El reintento autorizado superó esa restricción y encontró seis
errores TS2345 previos en pruebas de Input, Select, Textarea y Dropdown.
El comando `npm test -- --watch=false --browsers=ChromeHeadless
--include=src/app/shared/ui/molecules/select2/*.spec.ts` no llegó a ejecutar
pruebas: el tsconfig global también compila pruebas ajenas al include del runner.
El registro reside en `baseline-tests.log` del temporal de esta unidad.

## Corrección mínima

La comprobación de colisión invocada directamente desde PowerShell 7 devolvió
arnés roto al reinterpretar una fecha ISO de la captura. La misma captura y el
mismo instante de lanzamiento, sin modificarlos, pasan al ejecutar mediante
`powershell.exe -NoProfile -ExecutionPolicy Bypass -Command`, como exige el
mandato: 2 frentes, 14 rutas, 13 tocados, 2 preexistentes, 0 externos. No se
alteró la compuerta ni se recreó retroactivamente la línea base.

Se utiliza exclusivamente en el ensayo un tsconfig derivado que incluye las
pruebas de Select2 y declaraciones. No se alteran pruebas ajenas ni la
configuración del repositorio. La aceptación de Select2 se informa separada
del fallo de la suite global y se conservan los códigos de ambas ejecuciones.

## Rechazo del primer juicio

El juez independiente rechazó la revisión TS `9F0191A4…` y spec `B196A5DA…`:
Chrome ejecutó 43 de 44 pruebas satisfactoriamente en dos repeticiones. La
prueba «conserva abierto cuando Tab deja el foco dentro del panel» perdió el
foco hacia BODY. Tras dos frames, el panel y buscador tienen tamaño y
visibilidad, pero el enfoque inicial no se conserva; un enfoque posterior sí
funciona. Ocultar el disparador con `visibility:hidden` mantiene la lista
abierta después de 300 ms. ResizeObserver no notifica ese cambio de visibilidad.

La corrección se limita al momento del enfoque, la detección de ocultación y
sus pruebas, mediante adenda del arquitecto. El ensayo fue liberado por el
juez; debe repetirse la revisión sobre el paquete estable. No se acredita la
prueba negativa final mientras la suite base falla.

La corrección posterior alcanzó 49/51: las dos pruebas nuevas de ocultación
demostraron que la transición histórica de 200 ms mantiene temporalmente
`getComputedStyle(...).visibility` en `visible` aunque se declare `hidden`.
Se solicita al arquitecto la detección al finalizar esa transición; no se
relajan las aserciones ni se altera la apariencia del control.

## Límites de las compuertas globales

En el segundo juicio se detectó una cobertura insuficiente, no un fallo
productivo del observador de ancestros: las 53 pruebas pasaban al neutralizar
su callback, porque una notificación inicial de posición enmascaraba la
ausencia del observador. Una prueba independiente espera la estabilización de
la apertura antes de desplazar el ancestro: el candidato pasa 54/54 y el
mutante falla exactamente esa prueba (posición 115 frente a 135 esperada).
La corrección mínima debe estabilizar la prueba existente; no se acepta el
verde anterior como evidencia negativa de ese observador.

La prueba independiente de apertura sin buscador confirmó una regresión:
con 45 opciones y valor 44, el destacado era correcto pero scrollTop seguía
en cero y la opción quedaba fuera de la lista visible (bottom 2024 frente a
371). La segunda corrección debe restituir el desplazamiento interno inicial
sin mover el documento ni el foco. Se acumula en la misma adenda acotada.

La validación CUA de ese segundo candidato encontró un destino nativo de Tab
no representado por las pruebas unitarias: Chromium enfoca automáticamente
el contenedor desplazable listbox. Tab del buscador llega a ese nodo; el
siguiente Tab llega al pie sin cerrar la lista, y Escape desde el listbox
alcanza el formulario. El juez inspeccionó las capturas crudas nativo-01 a
nativo-06 en ui-final. La revisión no se cierra mientras ese recorrido no
respete el patrón de foco del combobox y Escape no quede aislado.

El atributo literal tabindex=-1 corrigió el recorrido secuencial (CUA
final-simple-01 a 09): Tab llega al pie y Escape conserva el formulario. La
comprobación adicional del scrollbar mostró que el ratón todavía puede
enfocar ese listbox, por lo que Escape aún alcanza el formulario desde ese
destino (final-scrollbar-01 y 02). Se requiere una precisión local de la
frontera de teclado, no una guarda global ni un rediseño de la capa.

La corrida global finalizó con tres compuertas en defecto (coherencia,
verificador de compuertas y secretos) y una sin medida válida (índice
documental). Incluye referencias documentales ajenas, restricciones del arnés
y hallazgos de credenciales fuera de esta unidad. No se reproducen secretos ni
se corrigen árboles ajenos. El registro completo permanece en el temporal de
la asignación; este resultado no se presenta como aprobación global.

## Incidencias de coordinación y atribución

El minirreparto de generación de manifiesto detectó la modificación de este
registro como una ruta externa a ese minirreparto. La escritura corresponde
al orquestador y ya estaba autorizada en el frente de custodia del reparto
principal; no corresponde al constructor ni a cambios de producto ajenos.
Se conserva el resultado de salida 1, con atribución explícita, sin modificar
la captura previa.

Una precisión de arquitectura sobre la transición del buscador llegó después
de liberar un candidato. Se pausó la revisión antes de resincronizar el ensayo.
El generador canónico, iniciado sobre ese candidato, rechazó la variación del
inventario físico durante su cálculo. No se utiliza esa huella: la generación
debe repetirse después de congelar el producto definitivo.

El reparto principal corrige la ruta de manifiesto inicialmente declarada como
`governance/consumer/atomic-source-manifest.json`: el generador canónico escribe
`distribution/atomic-source-manifest.json`, ya autorizada y medida mediante el
minirreparto antes de su generación. La captura inicial permanece intacta.

La compuerta específica de desviaciones reconoce la atribución §17 de este
registro. Su salida global es 1 por la referencia previa §3.1 en
`DESVIACION-20260929-005.md`; no se modifica ese registro ajeno.

La copia de la corrección Tab al ensayo coincidió con una compilación Storybook
del juez. El aviso de detener la sincronización llegó después de la copia.
El juez recibió la incidencia y debe repetir la medición final sobre hashes
estables; la ejecución concurrente no acredita qué revisión compiló. No se
perdieron cambios en repositorios. La copia de ensayo se reserva al juez hasta
su liberación explícita; no se ejecutan negativas o sincronizaciones en paralelo.

En la última prueba negativa del juez, un parche inverso sin contexto volvió
a insertar el binding al inicio del HTML temporal y provocó tres fallos al
restaurar. Se detuvo la cadena, se restituyó con contexto explícito y se
comprobaron las huellas exactas contra la fuente. Esa ejecución no acredita
el candidato; únicamente su restauración verde posterior puede cerrarlo.
El incidente quedó limitado al ensayo: la fuente y Ventas no se alteraron.

## Lo que NO se debe hacer

## Resolución verificada

El juez independiente aprueba las ocho rutas de producto del candidato final.
Ejecutó 63/63 en Chrome, compilación de aplicación, librería y Storybook con
salida 0. Las seis negativas fallan: activación 11, foco 5, observador 1,
desplazamiento inicial 2, tabindex 5 y puente del listbox 3. La restauración
final pasa 63/63 y ocho huellas coinciden con fuente. Las capturas CUA crudas
de geometría y teclado fueron inspeccionadas por el juez. No quedan mutantes
ni incidencias bloqueantes de Select2. Permanecen los límites globales ajenos
descritos; esta resolución no certifica ni modifica esos proyectos.

## Restricciones que permanecen

No reinstalar dependencias sobre el enlace, debilitar tipado, modificar las
pruebas de otros controles ni declarar aprobada la suite completa a partir del
resultado acotado.
No debilitar la prueba de foco ni sustituir la capa superior por z-index.
