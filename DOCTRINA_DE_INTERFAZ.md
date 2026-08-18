---
title: 'Doctrina de interfaz de Atomic UI'
document_type: 'doctrine'
version: '5.9.0'
status: 'vigente'
updated: '2026-08-15'
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
en 85 ficheros**.

> **Corrección.** Aquí se afirmó que ninguno estaba en el ADN y que la deuda
> era toda del consumidor. **Era falso.** Una segunda auditoría, esta vez con
> cada hallazgo pasado por un refutador que intentaba tumbarlo, dejó 77 en pie
> y **18 de ellos viven en componentes gobernados**: `button.scss` apaga con
> `opacity`, el paginador de `data-table` también, `status-badge` pinta los ocho
> tonos con el color de relleno, y el `confirm` genérico documenta como ejemplo
> el contraejemplo exacto del capítulo 7.
>
> La frase se conserva tachada en vez de borrarse porque el error es
> instructivo: **se dio por limpio el ADN sin medirlo**, justo en el documento
> que exige medir. La primera auditoría miró donde se veían los síntomas —las
> pantallas— y dedujo el estado del origen. Es el mismo patrón que el propio
> capítulo 8 describe: alguien resuelve el caso que tiene delante y nadie
> generaliza.

> **Cómo se usa.** Antes de construir una pantalla, lee los quince títulos. Antes
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

**Y la regla vive en la compuerta, no en este documento.** Enumerar casos no
cierra una clase de defecto: la comprobación de contraste llevaba una LISTA de
pares, se le añadieron las alertas, y `status-badge` siguió en verde porque su
par no estaba en la lista. Ahora `check-theme-contrast.mjs` busca **patrones**
—texto pintado con `--TONO-color`, y `opacity` dentro de una regla cuyo selector
habla de deshabilitado— sobre todos los ficheros de estilo. Fue la compuerta la
que encontró las píldoras de `kpi-card`, que nadie estaba buscando, y las 49 del
propio ADN.

Cada regla que se convierte en compuerta deja de necesitar vigilancia. Las que
no se pueden automatizar son las que justifican leer este documento.

## 9. Lo que la persona escribió vale tanto como lo que ya estaba guardado

**La regla.** Toda pantalla con un formulario **pregunta antes de abandonarlo si
hay algo escrito sin guardar**, y lo hace por los dos caminos: el guardián de
salida del enrutador —enlaces, botones, Atrás del navegador— y el aviso del
navegador al cerrar la pestaña o recargar. Con uno solo, el agujero sigue abierto
por el otro lado.

**Pregunta por `dirty`, no por «hay un formulario abierto».** Quien solo entró a
mirar no puede tropezarse con un diálogo. Y **los campos de búsqueda quedan
fuera**: teclear un documento para consultar no es trabajo que se pierda.

**Por qué esa segunda mitad importa igual que la primera.** Un aviso que salta de
más enseña a pulsar «Salir sin guardar» sin leer; el día que de verdad haya
trabajo escrito, también lo ignorará. Un guardián que molesta es un guardián que
se desactiva solo.

Lo demás lo fija el capítulo 7: el botón dice el acto —«Salir sin guardar»—, el
de cancelar invita a volver —«Seguir editando»—, y **el foco inicial se pone en
cancelar**, para que un Intro por inercia no sea lo que borre el trabajo.

**El caso que lo ilustra.** Un alta de cliente de tres pasos rellenados que se
perdía entera al pulsar por error un enlace del menú, sin una sola pregunta. La
misma pantalla **sí** pedía confirmación para dar de baja una cuenta: se protegía
el dato ya guardado y no el que la persona acababa de escribir.

## 10. La escala de espaciado es una escala, y un tamaño no es un espacio

**La regla.** Todo margen, relleno y hueco sale de `--space-N`. Un número mayor
es un espacio mayor, **siempre**, y ningún valor entra en la escala por hacer
falta una vez.

**Lo que la escala publica hoy:** 0,25 · 0,5 · 0,75 · 1 · 1,5 · 2 · 2,5 · 3 · 3,5
· 4 rem, del 1 al 10. Cuatro pasos finos abajo, donde se ajusta el interior de un
control, y saltos de medio rem arriba, donde se separan secciones. Elegir es
elegir un paso, no un número.

**El caso que lo ilustra, y está en el propio ADN.** `--space-11: 2,75rem`. Está
al final de una escala ascendente y es **más pequeño que el 8, el 9 y el 10**.
Quien pide el 11 esperando «más que el 10» recibe menos que el 8, y nada se lo
dice. Su comentario delata cómo llegó ahí: *«44px — tamaños de componente
(botones, elementos de menú)»*. **No es un espacio: es el objetivo táctil mínimo**
de WCAG 2.5.5, una medida de OTRA cosa, metida en la escala de espaciado porque
no había dónde ponerla. Se usa como ancho y alto del círculo del `stepper`, como
`--action-btn-size`, y como relleno derecho para dejar sitio a un icono: tres
cosas que no son «separación entre elementos».

**La consecuencia práctica.** Un tamaño mínimo de toque tiene su propio token y su
propia razón para cambiar —si mañana el listón sube a 48px, sube el objetivo
táctil y no se mueve ni un margen—. Mezclados, cualquier ajuste de uno arrastra al
otro sin que nadie lo prevea.

**Cuándo se puede escribir un número a mano: casi nunca, y se justifica.** Medido
en el consumidor: 673 usos de `var(--space-N)` frente a 29 valores sueltos. De
esos 29, trece son `1rem`, que **es** `--space-4` y no debería estar escrito a
mano. Los que merecen mirarse son los que no existen en ninguna escala —`0.35rem`,
`0.8rem`, `0.625rem`, `0.125rem`—, porque cada uno es alguien afinando a ojo un
caso concreto. Si de verdad hace falta un valor intermedio, el paso es **añadirlo
a la escala en el orden que le toca**, no dejarlo suelto en un fichero ni
apilarlo al final con el número siguiente.

## 11. Una tabla deja de ser una tabla antes de necesitar barra horizontal

**La regla.** Por debajo de **48rem** cada fila se convierte en una tarjeta: la
cabecera desaparece, y cada celda lleva delante su etiqueta —`data-label` pintada
con `::before`—. Nada de desplazamiento horizontal para leer un dato.

**Por qué en `rem` y nunca en `px`.** `rem` sigue el tamaño de letra del
navegador. Quien lo aumenta porque le cuesta leer necesita las tarjetas **antes**,
no en el mismo ancho físico; con un corte en píxeles se queda con una tabla que ya
no le cabe. Medido en el ADN: quince cortes en `768px` conviven con cuatro en
`48rem`, que son el mismo ancho **solo si nadie tocó el tamaño de letra**. Y hay
`769px` y `639px` —los vecinos de un corte escrito dos veces con signo contrario—,
que es como aparece una franja de un píxel en la que no se aplica ninguna de las
dos reglas.

**Qué sobrevive a la conversión.** La etiqueta de cada celda, porque una tarjeta
sin cabecera es una lista de valores sin nombre. Las acciones, que pasan a ocupar
la fila entera. Y el estado —cargando, vacío, error—, que **no** se convierte en
tarjeta: sigue siendo un bloque, porque no es un registro.

**Lo que la conversión no arregla.** Una tabla de doce columnas se vuelve una
tarjeta de doce filas: legible y larguísima. Si al pasar a tarjetas el resultado
no cabe en una pantalla, el problema no era el ancho, era que la tabla enseña más
de lo que hace falta para decidir. Esa decisión es de la pantalla y no de la
tabla.

## 12. Qué actos piden confirmación, y cuáles piden otra cosa

El capítulo 7 dice **cómo** se redacta una confirmación. Este dice **cuándo** hace
falta, y cuándo lo correcto es no ponerla.

**La regla, en tres clases.**

1. **Lo que se deshace desde la misma pantalla no se confirma.** Abrir un diálogo,
   cambiar un filtro, seleccionar una fila. Preguntar aquí es ruido, y el ruido se
   paga en el punto 3: quien lleva cuarenta diálogos al día deja de leerlos.
2. **Lo que se juega en una cifra no se confirma: se revisa.** Un cobro, un
   desembolso, un pago parcial. «¿Está seguro?» no aporta nada cuando lo que puede
   estar mal es el importe, la cuenta o la cuota a la que se aplica: lo que hace
   falta es **ver esas cifras** antes del «sí». Medido en el consumidor: las
   dieciocho llamadas a `dialogs.confirm` están en catálogos y bajas, y **ninguna**
   en caja; las operaciones de dinero pasan por un resumen con sus importes.
3. **Lo que no se puede deshacer desde la pantalla sí se confirma**, con el verbo
   del acto en el botón y el foco en cancelar. Y si el acto tendrá que explicarse
   meses después —anular una solicitud, revertir un pago—, la confirmación **pide
   el motivo**, porque será lo único que quede.

**La prueba de si una confirmación sobra.** Pregúntese qué hace la persona si se
equivoca. Si la respuesta es «lo vuelve a pulsar bien», la confirmación sobra. Si
es «llama a alguien», hace falta. Si es «no se entera», entonces lo que falta no
es una confirmación: es que la pantalla diga lo que pasó.

**Y una confirmación no es un permiso.** El capítulo 7 ya lo exige: el permiso se
comprueba otra vez **después** del «sí».

## 13. La tipografía tiene escala de tamaño, y también tiene que tenerla de peso

**La regla.** Los tamaños salen de `--text-*`. Los **pesos salen de una escala de
cuatro** —cuerpo, énfasis, título, destacado— y no de un número escrito a mano.
Cada página tiene **un** `<h1>`, y de ahí para abajo no se salta ningún nivel.

**El caso que lo ilustra.** El tamaño está resuelto: 279 usos de `var(--text-*)`
frente a 8 valores sueltos en el consumidor. El peso no tiene escala **ninguna**,
y por el hueco se colaron seis valores compitiendo: 800 (43 veces), 700 (41), 600
(18), **650 (14)**, **750 (3)** y 400 (2). En el ADN, otros ocho: 600, 500, 700,
800, 400, **650**, **900**, y un `font-weight:600` sin espacio que ninguna
búsqueda por el patrón normal encuentra.

**Y tres de esos valores no se ven.** La familia declarada es
`'Open Sans', system-ui, …`, pero **no hay ningún `@font-face`, ningún fichero de
fuente en el proyecto, y la CSP dice `font-src 'self'`**: Open Sans no se carga
nunca, ni podría cargarse de fuera. Manda `system-ui`, que en Windows es Segoe UI.

Contado en `C:\Windows\Fonts`, esa familia tiene cara propia en 400
(`segoeui`), 600 (`seguisb`), 700 (`segoeuib`) y 900 (`seguibl`) — **cuatro
grados reales**. Lo que no tiene cara es 500, 650 y 750: el navegador los resuelve
a su vecino sin decirlo. Alguien afinó un contraste que no se dibuja.

> **Corrección.** La primera versión de este capítulo afirmaba que «800 y 900 no
> aportan trazo». Era falso: Segoe UI Black existe y se instala con Windows. Lo
> que se colapsa son 500, 650 y 750, no la parte alta. La escala tiene por eso
> cuatro pasos —`body` 400, `emphasis` 600, `title` 700, `display` 800— y no tres.
> Se deja escrito porque la doctrina se sostiene sobre mediciones, y una medición
> mal hecha se corrige donde se hizo.

**Por qué el `<h1>` no es decoración.** Quien navega con lector de pantalla salta
por encabezados, y ese salto es su índice. Medido: `login` y `change-password`
empiezan en `<h2>` y **no tienen `<h1>`** —su índice arranca sin título de
página—; el catálogo de clientes pasa de `<h1>` a `<h3>` sin `<h2>`. Las pantallas
que **sí** están bien son las que usan `page-header`, que emite el `<h1>` por su
cuenta: donde el organismo gobierna, la regla se cumple sola.

**Y la regla vive en la compuerta.** `check-typography-scale.mjs` llevaba la
cuenta de los pesos escritos a mano —147 al empezar— con una sola condición: que
el número **solo pudiera bajar**. Hoy está en **cero**, así que ha dejado de ser
un trinquete y es una prohibición: cualquier peso escrito a mano falla.

El camino importa tanto como el destino. Primero se migraron los 167 que eran
exactos —400, 600 y 700 son `body`, `emphasis` y `title`, así que no se movió un
píxel—. Los 109 restantes se hicieron después, ya con la medición de las caras
reales delante: 500 va a `body` porque no existe cara de 500 y el navegador ya lo
dibujaba como 400; 650 va a `title` porque ya se dibujaba como 700; y 750, 800 y
900 van a `display` porque los tres aterrizan en la misma cara Black. Ninguno de
los dos pasos cambió lo que se ve, y el segundo no se podría haber justificado sin
haber medido primero.

**Cuatro niveles de encabezado son una pantalla que hay que partir.** Medido:
`account-detail` tiene once `<h3>` colgando de un solo `<h2>`, y `credit-page`
llega a `<h4>`. Cuando hace falta un cuarto nivel para situar un dato, lo que se
ha alcanzado no es un límite tipográfico: es el punto en que la pantalla dejó de
tener un tema.

## 14. Un mensaje dice qué pasó Y qué hacer, y cada cosa tiene un solo nombre

**La regla.** Un mensaje de error termina con **lo que la persona puede hacer a
continuación**. Y el producto llama a cada cosa por **un** nombre, el mismo en
todas las pantallas.

**El caso que lo ilustra.** Medido en el consumidor: 221 mensajes de error, y
**207 se detienen en lo que falló**. Solo 15 añaden una segunda frase. «No fue
posible cargar los préstamos del cliente.» es cierta, es específica, cumple los
capítulos 1 y 2 —y deja a quien la lee sin saber si esperar, reintentar, o
llamar a alguien—. La diferencia entre un error informado y un error útil cabe en
una frase.

**Un nombre, no dos.** Medido: «crédito» aparece 78 veces en las plantillas y
«préstamo» 38, para el mismo objeto. Conviven **«Alta del préstamo»** y **«Alta de
crédito»**, que son el mismo acto; «Iniciar préstamo» junto a «Crear crédito»;
«Historial de préstamos» bajo «Administración de créditos». Nadie se pierde del
todo, y todos pagan un peaje: cada vez que aparece el segundo nombre hay que
decidir si nombra lo mismo. Elegir cuál de los dos es asunto del negocio; tener
uno solo es asunto de esta doctrina.

**Y la forma de tratar también es un nombre.** Aquí se trata de **usted**: 184
usos frente a cero de tuteo en texto visible. No se enuncia porque esté roto —está
impecable—, sino porque es exactamente el tipo de acuerdo que se pierde el día que
entra alguien que no lo sabía, y entonces la mitad de la aplicación tutea.

**Lo que este capítulo NO pide.** Ni disculpas, ni «por favor», ni tono amable. Un
mensaje que se disculpa gasta la única frase que tenía para decir qué hacer.

## 15. Se pliega lo que compite, no lo único que hay

**La regla.** Un contenedor tiene un presupuesto —el alto de la pantalla, el
ancho de una fila— y el contenido tiene que caber dentro. Cuando **varias** cosas
compiten por ese sitio se pliegan o se comprimen; cuando hay **una sola**, no.
Plegar lo único que hay esconde tras un clic la razón por la que alguien entró.

**Acordeón: desde dos secciones, y ni una menos.** El acordeón sirve cuando la
pantalla apila secciones que compiten por el mismo alto y hay que recorrerlas
todas para llegar a la de abajo. Con una sección, un acordeón de un elemento
convierte «lo que buscabas está aquí» en «lo que buscabas está detrás de esto».

**Y no todos los paneles nacen igual.** Se abre lo que se viene a hacer; arranca
plegado lo que se consulta de vez en cuando. Un acordeón que abre todo no plegó
nada; uno que lo cierra todo obliga a abrir para saber qué hay dentro.

**El caso que lo ilustra.** Seis pantallas de catálogo, medidas: una agrupaba en
acordeón porque presenta **seis** catálogos distintos, y otra apila **tres**
secciones —el gasto administrativo, las tasas de crédito y las de ahorro— que
había que recorrer enteras para llegar a la última. Esas dos lo piden. Las otras
cuatro tienen **una sola tabla** cada una: darles el mismo acordeón «por
uniformidad» habría escondido tras un clic lo único que esas pantallas muestran.
La uniformidad que faltaba estaba en la cabecera, no en el plegado.

**El mismo presupuesto, en horizontal: la fila.** Las acciones de una fila
comparten ancho con las columnas de datos, así que van como iconos con nombre
accesible, no como botones con etiqueta. Medido: tres botones etiquetados
—«Abrir y evaluar», «Generar crédito», «Anular»— ocupaban más que las seis
columnas de datos juntas, se montaban unos sobre otros **y tapaban la columna de
estado**, que es justo lo que hay que leer para decidir qué hacer con esa fila.

**El mismo acto lleva el mismo icono en toda la aplicación.** Un boton que abre
un alta —«Nuevo», «Agregar», «Autorizar»— lleva su verbo Y su icono: el texto se
lee, el icono se reconoce, y es lo que hace que ese botón se encuentre igual de
rápido en una pantalla que nunca se ha visto. Medido antes de corregirlo: de 19
botones de alta, **uno solo** llevaba icono. Alguien lo hizo bien una vez y nadie
lo generalizó, que es el patrón del que advierte el cierre de este documento.

**Cuando ni así cabe, la fila necesita un menú, no letra más pequeña.** Por
encima de tres o cuatro acciones se agrupan en un desplegable con las frecuentes
a la vista. Reducir el tamaño para que quepan es empujar el problema al objetivo
táctil, que tiene su propio mínimo y no se negocia.

**El contenedor pone el hueco; el contenido pone su tipografía.** El cuerpo de un
panel fijaba color y tamaño de letra, y eso lo hereda todo lo que se meta dentro.
La misma tabla se dibujaba más pequeña y más apagada por el solo hecho de estar
dentro de un acordeon, y quien la comparaba con la de otra pantalla veia dos
tablas distintas sin que nada lo explicara. Un contenedor de disposición decide
dónde van las cosas, no de qué color son.

**Y lo que se pliega sigue existiendo para quien no lo ve.** Cada panel se
anuncia como encabezado, con el nivel que le toque en la pantalla: si no, quien
recorre saltando por títulos pasa del título de la página al contenido del primer
panel abierto sin enterarse de que los demás existen. Eso era un defecto real del
acordeón del ADN, y está contado en el capítulo 13.

---

---

## Lo que esta doctrina no cubre

**Esta sección ya no declara ningún hueco pendiente.** Los cinco que llegó a
tener —espaciado, tabla-a-tarjetas, cuándo confirmar, jerarquía tipográfica e
idioma— se cerraron en los capítulos 10 a 14, cada uno midiendo el código en vez
de proponer un criterio. El 15 llegó después, de mirar la aplicación en marcha.

Lo que queda fuera, y seguirá fuera:

- **Qué componente elegir.** Eso es el catálogo, y es obligatorio: solo se usan
  componentes y variantes declarados en `catalog/`.
- **Lo que anuncia un lector de pantalla.** Ninguna regla de aquí lo sustituye.
  El árbol de accesibilidad **sí** es medible sin una persona; lo que la persona
  oye, no. Ver `LESSONS_LEARNED.md`, entrada del 2026-08-13.
- **Qué palabra elegir cuando hay dos.** El capítulo 14 exige que haya una sola;
  cuál sea es decisión del negocio.

Y una advertencia sobre esta lista: que hoy no tenga huecos no significa que esté
terminada. **Cada capítulo nació de un daño medido**, no de una previsión. El
siguiente aparecerá igual: alguien encontrará una pantalla que engaña de una
forma que aquí no está escrita.

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
