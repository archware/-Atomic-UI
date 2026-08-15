---
title: 'Doctrina de interfaz de Atomic UI'
document_type: 'doctrine'
version: '5.8.3'
status: 'vigente'
updated: '2026-08-14'
owner: 'Hospital Regional de Ayacucho'
---

# Doctrina de interfaz

El catálogo dice **qué** componente usar. Este documento dice **cómo** se hace
una pantalla que no miente, no pierde el trabajo de nadie y se puede usar sin
ratón.

No sale de un libro. Sale de auditar `prestamo_front_atomic` —un producto de
cobranzas en producción— con seis lentes independientes, contrastar cada regla
contra el propio código y quedarse solo con las que el front **ya cumple en
parte**. Esa condición importa: una regla que ningún código cumple suele ser una
invención; una que se cumple en casi todas partes menos en tres sitios es
doctrina con deuda, y es la que enseña.

De esa auditoría salieron 24 reglas y **114 incumplimientos concretos repartidos
en 85 ficheros**. Ninguno en el ADN: la deuda estaba toda en el consumidor, que
es exactamente el motivo de escribir esto aquí.

> **Cómo se usa.** Antes de construir una pantalla, lee los ocho títulos. Antes
> de darla por terminada, léelos otra vez como lista de verificación. Cada regla
> lleva el **daño** que evita y el **contraejemplo**: lo que hace, sin querer,
> quien no la conoce.

---

## 1. Cargando, vacío, error y sin permiso son CUATRO estados

**La regla.** Nunca uses el mismo texto, el mismo hueco o el mismo color para
dos de ellos. El estado inicial de todo dato asíncrono es «cargando», y
«cargando» no puede tomar prestado el vocabulario de un veredicto terminal.

**El daño, medido en un caso real.** En la pantalla de Operaciones, cuando la
consulta de cuotas falla, la aplicación muestra *«No hay cuotas pendientes para
esta cuenta»* y esconde el botón de cobrar. El cajero tiene al cliente delante y
le dice que hoy no debe nada. **El cobro no se hace, y nadie se entera de que
hubo un fallo.** En la misma pantalla, la tabla de abajo sí pinta el error con su
botón de reintentar: la pantalla se contradice a sí misma, y lo que la persona
lee primero es la mentira.

**El contraejemplo.** Escribe `@if (cargando) { … } @else { 'No hay datos' }`.
Con dos ramas para tres estados, el error cae inevitablemente en la de vacío.

**Consecuencias que también son la regla:**

- Un hueco en blanco no representa la ausencia de dato. El cero se escribe.
- «No se pudo comprobar» no es «no tiene permiso». Decir lo segundo manda a la
  persona a pedir un permiso que quizá ya tiene, y deja el fallo real —una ruta
  mal declarada, un backend caído— sin nadie que lo mire.
- Si el error ocurre **recargando** algo que ya estaba en pantalla, el error va
  como aviso **arriba** y los datos se conservan. Solo se sustituye el contenido
  por el panel de error cuando no había nada que conservar.
- Un «Reintentar» reintenta. Si cierra el panel, es un botón que miente.

## 2. La pantalla solo afirma lo que le consta

**La regla.** No cantes éxito hasta leer el resultado confirmado de la
operación: que el `await` haya vuelto no es que haya funcionado. Y no nombres
una causa que no puedes observar; cuando no la conoces, di lo que sí observaste y
qué mirar.

**El daño.** Un «Cobro registrado» emitido porque la promesa se resolvió, sobre
una respuesta que traía un rechazo, es peor que un error: nadie lo va a revisar.

**Consecuencias:**

- El veredicto va en el **título** del aviso, no enterrado en el cuerpo.
- El éxito lo declara la respuesta autoritativa de la mutación y se aplica al
  estado visible de inmediato. La recarga posterior va desacoplada: si falla,
  degrada a advertencia **conservando** el texto de éxito. Jamás convierte un
  éxito en error.
- Un dato que sabes desactualizado o que no pudiste obtener **no se muestra**: se
  omite explícitamente y se bloquea la acción que dependía de él. Nunca lo
  sustituyas por el último valor conocido ni por una aproximación plausible.

## 3. Una negativa no mueve a nadie de sitio

**La regla.** Un permiso denegado, una sesión caducada o cualquier rechazo
devuelven el control **donde la persona está**. El aviso lo emite un canal
aparte, y ese aviso lleva un **identificador incremental propio**, no su texto.

**El daño, en dos mitades.** Redirigir al inicio por pulsar un menú prohibido
saca a la persona de una ficha a medio escribir y le borra el trabajo: un castigo
desproporcionado para un clic equivocado. Y si ya estaba en el destino, el
enrutador ignora la navegación —`onSameUrlNavigation: 'ignore'`—, no se emite
`NavigationEnd`, y **no ocurre absolutamente nada**: unos menús responden y otros
parecen muertos.

**Por qué el identificador.** Dos negativas idénticas producen el mismo texto, y
todo lo que compare textos las colapsa en una. El contador es lo único que
distingue «me lo dijo una vez» de «me lo ha dicho dos».

**Un solo canal.** Si el aviso ya sale por toast, no lo pintes además como cartel
en la página. La misma negativa anunciada dos veces se lee como dos problemas.

**La excepción.** Se redirige únicamente cuando no hay pantalla previa a la que
volver: arranque en frío o enlace pegado desde fuera.

## 4. Rechazar una entrada vacía también la anterior

**La regla.** Cuando un control rechaza lo que le dan, borra la selección que ya
tenía aceptada **y emite el vaciado al padre**. Nunca dejes el valor viejo
visible junto a un mensaje de error sobre el nuevo.

**El invariante que hay detrás, y que es lo que de verdad se enseña:** *lo que se
ve es lo que se envía.*

**El daño, con la secuencia real.** Se adjunta `contrato-v1.pdf`. La persona se
da cuenta del error y arrastra `contrato-firmado.pdf`, que se rechaza por tamaño.
Si el rechazo solo pinta el error y hace `return`, **lo que se archiva de forma
inmutable es el primero** mientras la pantalla enseña un error sobre el segundo.
Y el padre, que no recibió evento, mantiene su botón de guardar habilitado.

**El contraejemplo.** `this.validationError.set(motivo); return;` sin tocar la
selección ni emitir el cambio.

**La excepción legítima.** Se conserva la entrada rechazada cuando **el propio
campo es el valor que se enviaría** y la persona tiene que corregirlo sin
perderlo de vista. Eso no es la misma situación: ahí lo que se ve y lo que se
enviaría siguen coincidiendo.

**La mitad que se olvida.** Un control gobernado debe poder devolver el DOM al
valor del padre **aunque ese valor no cambie**. En Angular un binding que no
cambia no repinta, así que hace falta señal gobernada más `effect`.

## 5. El foco es parte de la funcionalidad, no un adorno

**La regla.** Tras un fallo asíncrono, lleva el foco al aviso del error. Si el
aviso todavía no está en el DOM —porque lo proyecta el consumidor al resolverse
la petición—, **reintenta después del siguiente render** antes de rendirte al
primer control inválido.

**Para elegir a dónde va el foco, recorre una lista ORDENADA de selectores y
quédate con el primero que exista.** Un único `querySelector` con los selectores
unidos por comas devuelve el que aparezca antes **en el documento**, no el más
prioritario: la prioridad se pierde en silencio.

**En formularios largos o seccionados:** al fallar el envío, **abre la sección
plegada** que contiene el primer campo defectuoso, hazle scroll y ponle el foco.
Un error dentro de un acordeón cerrado no existe.

**Y no pintes ningún error de campo hasta que haya habido un primer intento de
envío.** Teñir de rojo lo que la persona aún no ha terminado de escribir es
ruido, no ayuda.

**Otros dos casos que la auditoría encontró rotos:**

- Un control que se **deshabilita bajo los dedos** —un botón de paginación que se
  apaga al llegar a la última página— tira el foco al `body`. Hay que trasladarlo
  antes.
- Un elemento que se vuelve `inert` con el foco dentro hace que el navegador lo
  **descarte en silencio**, y la siguiente tabulación reempieza desde el
  principio del documento.

**Escape se consume donde se atiende.** Si un desplegable abierto dentro de un
diálogo no llama a `preventDefault()`, la misma pulsación cierra el diálogo
entero y se lleva el formulario por delante.

## 6. Una respuesta que llega tarde no puede pintar

**La regla.** Toda respuesta asíncrona que vaya a pintarse en una superficie
reutilizable —diálogo, panel de detalle, visor— captura un número de secuencia
antes de la petición y **se descarta en silencio** si al volver ese número ya
cambió. El contador se incrementa al abrir **y al cerrar**.

**El daño.** La persona selecciona el crédito A, la respuesta tarda, selecciona
el B, y la de A llega después: la pantalla muestra el nombre de B con las cuotas
de A. En un producto de cobranzas eso es cobrarle a alguien lo que debe otro.

**La otra mitad:** al cambiar la entidad seleccionada, **vacía de inmediato** los
datos dependientes. No esperes a que llegue la respuesta nueva para dejar de
mostrar la vieja.

## 7. Una confirmación dice qué va a pasar, no «¿está seguro?»

**La regla.** El mensaje enumera **qué va a cambiar**, con las cifras y los
nombres concretos del caso, **incluido lo que no cambia**. El botón de confirmar
lleva el verbo del acto —«Desactivar», «Refinanciar sin desembolso»—, el de
cancelar invita a volver —«Revisar»—, el **foco inicial se pone en cancelar**, y
el tono es `danger` solo si la acción destruye algo.

**Y comprueba el permiso otra vez después de que la confirmación devuelva «sí»**,
no solo antes de abrirla. Entre una cosa y la otra ha pasado tiempo. Si esa
segunda comprobación falla, escribe un aviso visible: un `return` mudo deja a la
persona pulsando un botón que no hace nada.

**El caso que lo ilustra.** Un botón «Confirmar corrección» que no responde
porque falta marcar una casilla que no se pinta en rojo, no recibe el foco y no
tiene mensaje asociado. Silencio absoluto, y la única pista es adivinarlo.

## 8. El color se calcula, no se atenúa

**La regla.** Comunica los estados apagados y los tonos semánticos con **tokens
de contraste verificado**. Nunca con `opacity`, y nunca pintando el texto con el
color de **relleno** del tono.

**Por qué `opacity` está prohibida.** Atenúa texto y fondo a la vez contra la
página, así que **anula el contraste que el token ya traía calculado**. Medido:
un campo deshabilitado se quedaba en 4,09:1; sin la transparencia, 6,99:1. Y el
icono que acompaña al control recibe la atenuación por partida doble, con lo que
queda más apagado que su propio texto.

**Por qué el relleno no sirve de color de texto.** Medido sobre los tonos de
alerta en tema claro: info 3,69 · success 2,12 · warning 2,13 · danger 3,24.
Todos por debajo de 4,5:1 —mientras los tokens de texto correctos existían y no
los consumía ningún fichero—. Corregidos: 9,52 · 4,79 · 4,76 · 7,60.

**El veto cubre botones e iconos, no solo campos de texto**, que es justo por
donde se escapó en la auditoría. Y para iconos y contenido no textual el listón
es el **3:1** de WCAG 1.4.11: success y warning como color de icono sobre
superficie clara fallan (2,22:1 y 2,20:1) aunque no haya texto de por medio.

**El color codifica un ESTADO frente a un umbral, nunca la categoría del dato.**
Y antes de fijar el umbral de un indicador, comprueba qué está afirmando
cualquier otro elemento visible sobre el mismo hecho: **dos indicadores del mismo
hecho no pueden pintarse con colores opuestos en la misma pantalla.**

**El estado deshabilitado lo comunican los tokens y el cursor**, no una
transparencia que falsea lo calculado.

---

## Lo que esta doctrina no cubre

- **Qué componente elegir.** Eso es el catálogo, y es obligatorio: solo se usan
  componentes y variantes declarados en `catalog/`.
- **Lo que anuncia un lector de pantalla.** Ninguna regla de aquí lo sustituye.
  El árbol de accesibilidad **sí** es medible sin una persona; lo que la persona
  oye, no. Ver `LESSONS_LEARNED.md`, entrada del 2026-08-13.
- **La escala de espaciado, el criterio de tabla-a-tarjetas en móvil y cuándo una
  acción necesita confirmación.** La auditoría los señaló como huecos: hoy cada
  pantalla los resuelve a su manera. Fijarlos es trabajo pendiente de este mismo
  documento.

## Una advertencia sobre cómo se aplicó hasta ahora

El patrón de incumplimiento que encontró la auditoría es siempre el mismo, y
conviene reconocerlo: **alguien resolvió bien el caso que tenía delante y nadie
generalizó**. La prohibición de `opacity` se documentó en los tres campos de
formulario y no llegó a botones ni al paginador. El arreglo de «relleno como
texto» se hizo en un fichero y quedó intacto en otros cuatro.

Y el remate: en una pantalla alguien **copió el arreglo de tokens y le volvió a
poner `opacity: 0.7` encima**. Sin la regla enunciada, el remiendo se replica y
la razón se pierde.

Por eso esto vive aquí y no en un comentario.
