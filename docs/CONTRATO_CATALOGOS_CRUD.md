---
title: "Contrato visual de catálogos CRUD y promoción compatible"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-09-28"
last_updated: "2026-11-03"
document_type: "contrato visual"
status: "vigente"
version: "1.6.0"
change_id: "ATOMIC-20261102-006"
---

# Catálogos CRUD: preservar antes de sustituir

Este contrato concreta la regla 3.1 de la doctrina maestra. La evidencia de
entrada son las capturas facilitadas por el dueño: tabla de tipos de entidades
financieras y su ventana de visualización, contrastadas con Familias. Son una
referencia visual, no evidencia de funcionamiento ni autorización para recuperar
formularios deshabilitados. La adopción en un consumidor requiere sus propias
pruebas y una referencia Atomic elegible.

## Responsabilidades y promoción

1. Capturar e inventariar comportamiento y diseño útil, incluidos estados de
   error, carga, vacío, éxito, foco, teclado y tamaños de pantalla.
2. Buscar componentes y plantillas existentes. Extenderlos de forma compatible;
   no construir otra pieza con distinta API para el mismo patrón.
3. Trasladar la estructura y los estilos reutilizables a Atomic. El consumidor
   conserva datos, filtros, validaciones, permisos, HTTP y coordinación asíncrona.
4. Catalogar variantes, probar equivalencia y comparar antes/después. Una
   sustitución por tokens debe conservar medidas comprobadas, no aproximadas.
5. Propagar con procedencia y revisión del diff, sin sobrescribir pruebas ni
   adaptaciones. Retirar diseño local solo después de verificar el reemplazo.

No se copia un formulario de negocio entero al ADN. Tampoco se interpreta
“sin HTML/CSS suelto” como prohibición de HTML semántico dentro de Atomic:
la lista de definiciones, estructura del modal y acciones pertenecen al ADN;
los bindings y campos específicos pertenecen al producto.

## Tipado de PaginaCrud y compatibilidad local (ATOMIC-20261102-003)

La clase declara `PaginaCrud<T extends object = Record<string, unknown>>`.
Se conserva el constraint `object` y el argumento explícito
`PaginaCrud<Entidad>`. El runtime, las entradas, las salidas, los métodos y
los selectores siguen presentes. La referencia desnuda deja de ofrecer las
operaciones arbitrarias de `any`: un acceso propio de una entidad requiere
estrechamiento del valor desconocido o un genérico concreto.

Una interfaz de dominio sin firma de índice continúa admitida mediante
`PaginaCrud<Entidad>`; no se garantiza su asignación al `Record` predeterminado.
Las plantillas pueden inferir la entidad desde entradas tipadas. La fixture
Angular estricta ejecutada acredita entidad explícita e inferida y una
referencia de vista parametrizada. Su caso negativo rechaza con TS2322 asignar
una propiedad `unknown` de una referencia desnuda a `string`. Esta evidencia
local no constituye compilación de todos los consumidores.

El ejemplo de migración de una referencia de vista declara la entidad local:

```typescript
interface EntidadCatalogo {
  id: string;
  nombre: string;
}

readonly chasis = viewChild<PaginaCrud<EntidadCatalogo>>('chasis');
```

El endurecimiento estático local fue autorizado para corregir los avisos.
No constituye equivalencia universal con el tipo anterior y no se propaga ni
publica en esta unidad. Los usos observados en `ventas-cxc`,
`demo-chasis-front`, `cxc-ventas-front` y `cxc-ventas-front_old` fueron revisados
de solo lectura; los consumidores externos no quedaron certificados. La
trazabilidad de compatibilidad y los originales se conservan en el
[roadmap](../.agent/roadmaps/ROADMAP_ATOMIC-20261102-003_avisos_lint.md).

## Invariantes visuales del catálogo

### Comprobación de adopción por consumidor

La misma experiencia visual no implica el mismo contrato ni la misma seguridad.
Aplicar la maestra 2.3.0, apartado 1.10, sin trasladar negocio al ADN.

Antes de conectar un catálogo, dejar una matriz local por operación con:

1. fuente verificable del contrato, identidad, entrada, salida y validaciones;
2. responsable de autorización y pertenencia, con pruebas negativas previstas;
3. capacidades Atomic realmente instaladas y bindings que las conectan;
4. evidencia separada de presentación, integración y persistencia, o pendiente
   explícito cuando no exista autorización o entorno para comprobarla.

La matriz pertenece al consumidor. Atomic no incorpora endpoints, campos,
longitudes de negocio ni contexto de inquilino. Una prueba de componentes o
procedencia no valida la seguridad de su servidor. No copiar toda una fachada
ni regenerar archivos existentes para uniformar apariencia.

Las reglas siguientes conservan detalle semántico y preservación del diseño. La
adopción exige comprobarlas en la ruta conectada, no solo reconocerlas en la
documentación. La lista es un control de revisión, no una guarda nueva del
generador.

### Referencia visual que se conserva

Paletas disponibles en Atomic UI: Primary, Secondary, Tertiary, Neutral, Slate, Success, Warning, Danger, Base.
Regla estricta: Está prohibido inyectar colores en duro (Hex/RGB/nombres). Todo color debe asignarse exclusivamente utilizando los tokens CSS de Atomic UI.

| Región | Contrato |
| --- | --- |
| Columna de estado | Etiquetas centradas junto con su encabezado por omisión. Una alineación explícita prevalece. En tarjetas móviles se centra el valor en su espacio, no la etiqueta de la celda. |
| Acciones de fila | Grupo compacto de iconos con nombre accesible; sin botones elevados ni saltos de línea que inflen la fila. El estándar físico es Ver, Editar y Más acciones: dos directas y el disparador del menú. `maxVisible` cuenta solo directas. Una cuarta acción física exige una excepción contextual válida y documentada. Las destructivas usan `isMenuOnly: true`. |
| Consulta | Ojo neutro contrastado en el perfil de catálogo; se distingue de Activar verde (revisión aprobada ATOMIC-20260929-005). |
| Edición | Lápiz azul según el perfil de catálogo. |
| Baja | Papelera roja `fa-trash`; confirmación con botón `danger`. No confundir baja lógica con eliminación física. |
| Activación | `activate`, círculo con marca verde (`fa-circle-check`), se conserva en Más acciones junto con Desactivar; la confirmación y el contrato pertenecen al consumidor. |

### Presupuesto de acciones y excepción contextual (ACC-20261022-001)

`PaginaCrud` resuelve el estándar con dos acciones directas, `Ver` y `Editar`,
y deja las demás en el menú. Por tanto, el disparador Más completa el tercer
control físico sin obligar a que la columna crezca ni a reducir objetivos
táctiles. `ActionGroup` sigue siendo genérico: su `maxVisible` limita solo las
acciones directas y `isMenuOnly` siempre prevalece.

Una tercera acción directa del catálogo solo es admisible si el consumidor
declara `accionDirectaContextual` con `idAccion`, `justificacion` y `evidencia`
no vacíos, y el id coincide con una acción de esa fila. No son elegibles Ver,
Editar, una acción ya marcada `isMenuOnly`, Activar/Desactivar (incluidos sus
identificadores operativos), Eliminar/Revertir, las semánticas `delete`,
`deactivate`, `reverse`, el tono `danger` ni un identificador que contradiga la
semántica Ver/Editar. Cuando además existen acciones de
menú, esta promoción genera un cuarto control físico. La declaración acredita
la necesidad de presentación, no el permiso, contrato HTTP, frecuencia real ni
autorización de negocio.

**Antecedente conservado — ATOMIC-20260929-004.** La formulación histórica de
«tres acciones contextuales» y la tercera posición de Activar/Desactivar sirvió
para retirar botones elevados y estados duplicados. ACC-20261022-001 la precisa:
en el catálogo, el tercer control físico es el menú y las mutaciones de estado
no se promocionan por defecto.

### Ventanas y superposiciones

Paneles Laterales (Side-panels) son para formularios grandes/complejos. Popups (Formularios centrados) son para formularios pequeños y rápidos. Modales (Alertas centradas) son EXCLUSIVAMENTE para mensajes del sistema y confirmaciones.
Diseño visual de ventanas: Los Modales llevan el botón de cerrar (X) por dentro del contenedor blanco. Los Popups llevan el botón de cerrar flotando por fuera del contenedor.

| Cabecera de ventana | Título centrado y cierre accesible `hanging-close`; conservar los tokens del encabezado. |
| Detalle | Lista semántica de solo lectura; etiquetas en negrita, separación de 24 CSS px mediante `--space-5`, valores multilínea y sin divisores horizontales. |
| Pie | Cerrar/Cancelar neutro (`outline`), alineado al final en escritorio; no usar `secondary` amarillo ni forzar ancho completo. |
| Espaciado | Tokens reales; el espacio entre acciones del pie usa `--form-row-gap` (2.25 rem = 36 CSS px con raíz de 16 px). |

El perfil de catálogo no cambia silenciosamente el aspecto predeterminado de
otros componentes. La compatibilidad existente se mantiene mediante variantes
explícitas. La referencia visual no elimina áreas de interacción, foco visible,
etiquetas accesibles ni adaptación a pantallas pequeñas.

DataTable resuelve el centrado mediante `isTag` y las claves semánticas
heredadas `stateLabel`, `state`, `status`, `estado`; no compara el texto
traducido del encabezado ni el valor Activo/Inactivo para decidir alineación.
`align` explícito conserva prioridad. Las columnas ordinarias no se centran.
La corrección vive en la plantilla y hoja externa del organismo, no en CSS
local del consumidor. No requiere nuevos tokens ni cambios en colores o tamaños.

#### Confirmación nativa del acordeón (ATOMIC-20261102-003)

`CrudDialog` expone `rol: 'dialog' | 'alertdialog'`, con valor predeterminado
`'dialog'`, y `cerrarAlPulsarFondo: boolean`, con valor predeterminado `false`.
El rol se aplica al elemento `dialog` nativo. Con el opt-in de fondo, un
puntero primario fuera de su rectángulo emite el `cancelled` existente; el
consumidor conserva la decisión de cerrar. Un click interior o sobre el
padding no equivale a pulsar el fondo.

`PaginaCrudAccordion` utiliza `alertdialog` con nombre y descripción únicos,
Cancelar como foco inicial, X dentro del cuadro, Escape, fondo optativo,
modalidad nativa y retorno al disparador. Se conserva la intención
`{ clave, datos }`, consumida antes de emitir para impedir duplicación
reentrante. La plantilla no persiste ni anuncia éxito. El modo histórico
automático cierra una intención sin acreditar el resultado de negocio; esta
corrección no incorpora el ciclo asíncrono controlado del catálogo.

La modalidad nativa mantiene inoperable el fondo de la página y no permite
enfocar sus controles mientras la confirmación permanece abierta. El recorrido
de foco puede alcanzar los controles propios del navegador, como su barra de
direcciones, según la [técnica H102 de W3C](https://www.w3.org/WAI/WCAG22/Techniques/html/H102).
La modalidad se conserva mediante el diálogo nativo, sin añadir una trampa
JavaScript de foco que impida acceder a esos controles del navegador.

La geometría mantiene el límite de 28rem mediante el token del chasis
`--crud-dialog-max-width-sm` y utiliza sus márgenes nativos. Los cuatro radios
interiores de cabecera y pie se ajustan mediante
`calc(var(--radius-lg) - var(--border-width-thin))`. Las capturas definitivas
de 375 y 1280 CSS px muestran la geometría corregida con radios interiores
sin puntas; no se afirma identidad píxel a píxel con la caja anterior.
La historia funcional
[`ConfirmacionAccesible`](../src/stories/pagina-crud-accordion.stories.ts)
(`templates-pagina-crud-accordion--confirmacion-accesible`) presenta datos de
demostración y el rastro de la intención emitida, sin persistencia. El
navegador definitivo acredita la confirmación con X, Cancelar y foco. Los
originales de navegador, las capturas y la revisión independiente se
conservan en el roadmap; una historia compilada no acredita por sí sola el
teclado real.

## Coordinación asíncrona

### Consulta no es edición bloqueada

La referencia aprobada el 30 de septiembre es el detalle de Entidades con
etiquetas y valores (imagen 1), no el formulario deshabilitado de Tipos
(imagen 2). Ambas ventanas comparten el chasis; el cambio corresponde al
contenido, no a un segundo diseño ni a una variante nueva de modal.

- Consultar: SummaryList con layout detail, dl/dt/dd, sin input, select,
  textarea, toggle, asteriscos de obligatoriedad ni acción Guardar.
- Crear/editar: formulario tipado con sus validaciones y controles Atomic.
- Activar/desactivar: confirmación independiente desde Más acciones; no se
  incorpora a la consulta ni al guardado.

Conservar cabecera centrada, cierre colgante, espaciado, temas y pie neutro.
Usar el contrato instalado: si la copia compatible no expone el input detalle
de PaginaCrud, proyectar SummaryList en el slot existente; no copiar otro modal.
Sincronizar la apertura después de renderizar el nuevo contenido para que
el foco no permanezca en un control retirado. Probar Ver, Cerrar, Editar,
Cancelar y Ver nuevamente, con registros activos e inactivos.

La prevención debe probar el DOM de la ruta real: la consulta contiene la
lista semántica y ningún control de captura. No prohibir indiscriminadamente
form.disable(): bloquear temporalmente la edición durante un envío es legítimo.
La regla readonly-detail-content es de revisión, no una guarda del generador;
cada consumidor acredita sus pruebas y su inventario de pendientes.

El consumidor declara por fila Ver, Editar y las acciones adicionales. Para
activos usa `deactivate` y etiqueta Desactivar; para inactivos `activate` y
etiqueta Activar. Ambas operaciones de estado llevan `isMenuOnly: true`, salvo
que una variante futura, explícitamente aprobada, cambie la regla canónica.
Atomic resuelve icono y tono mediante el perfil `catalog`; no lee propiedades de
dominio, decide permisos ni ejecuta HTTP. El icono describe la próxima
operación, no el estado actual. Cambia solo después de una respuesta confirmada
por el servidor.

El flujo es grilla → una confirmación → resultado en grilla. No se abre el
editor ni se deja otro Guardar pendiente después del cambio de estado. Retirar
el interruptor de edición únicamente cuando ambas acciones de grilla estén
alcanzables y probadas. El detalle muestra estado sin permitir modificarlo.

`guardarHabilitado` de PaginaCrud recibe del consumidor la validez y existencia
de cambios reales. Su valor por defecto es true por compatibilidad; los nuevos
consumos deben declararlo. Editar y luego restituir los valores iniciales deja
Guardar deshabilitado, aunque el formulario siga dirty. La fachada mantiene
también esta protección contra envíos por teclado o programáticos. Atomic no
compara DTO, nombres o formularios de negocio.

En el flujo controlado, Atomic no declara éxito ni cierra una confirmación al
emitir una intención.
El consumidor mantiene la ventana mientras espera la respuesta, presenta el
error conservando el contexto y comunica cuándo cerrar tras éxito. Durante
el envío se bloquean confirmación repetida, X, Cancelar y Escape. La edición
solo modifica los campos declarados; activar y dar de baja tienen confirmación
y resultado propios. No se resetean filtros ni tamaño de página por un cierre.

## Evidencia mínima y límites

### Lecciones incorporadas desde el consumidor

- La mutación confirmada actualiza la fila antes de una recarga independiente.
  Si el GET falla, conservar el resultado confirmado, avisar y ofrecer reintento
  de lectura. Nunca repetir automáticamente la escritura por un timeout.
- Conservar filtro, página y tamaño; ajustar solo una página fuera de rango.
  Un inactivo permanece en la grilla administrativa sin filtro de estado.
  Desaparecer con filtro explícito de activos es correcto y debe explicarse.
- Los códigos de búsqueda, booleanos, IDs en URL/body y adaptación de respuestas
  pertenecen al consumidor. Atomic no compara etiquetas traducidas ni conoce DTOs.
- `bloquearCierre` es una guarda explícita adicional, false por omisión.
  Permite adoptar protección en una copia parcial sin cambiar el cierre de otros
  módulos: X, Escape, Cancelar y cierre programático siguen el mismo bloqueo.
  Liberar el bloqueo y renderizar antes de cerrar tras éxito.
- Una plantilla HTML sin referencias no demuestra qué ejecuta la pantalla.
  Probar la ruta/componente activo y su API real mediante HTTP simulado; conservar
  escenarios anteriores y adaptar expectativas que afirmaban el defecto.

En `PaginaCrud`, las integraciones nuevas usan `confirmacionControlada=true`
y llaman `resolverConfirmacion(exito)` después de la respuesta. La modalidad
histórica automática se conserva para no romper consumidores y no acredita
el ciclo asíncrono nuevo. `accionesPorFila` y `alAccionFila` permiten declarar
la activación sin inferir el estado del registro; `abrirConfirmacion` recibe
contenido y acción explícitos. `accionDirectaContextual` controla únicamente la
excepción de presentación y no habilita una operación. El input `detalle` usa
SummaryList en modo `detail`; la proyección histórica con null es compatibilidad,
no patrón nuevo.

El modo histórico automático de `PaginaCrud` y `PaginaCrudAccordion` conserva
el cierre de una intención sin acreditar el resultado de negocio. La
corrección nativa del acordeón no incorpora el ciclo asíncrono controlado ni
autoriza describirlo como implementado. Las integraciones nuevas mantienen
la regla de confirmación controlada anterior; permisos, confirmación del
servidor y contratos de negocio siguen perteneciendo al consumidor.

- Pruebas del componente, de integración de slots y de estados asíncronos.
- Catálogo/API, estilos externos, tokens, lint y builds aplicables.
- Comparación visual a 320, 375, 768 y 1366 CSS px, temas claro/oscuro, texto
  largo y zoom; revisar teclado, foco inicial y retorno de foco.
- Prueba negativa de toda guarda nueva; no afirmar cobertura visual por tener
  un test DOM o un build exitoso.
- Registrar deuda del generador y del instalador separadamente: una receta
  documentada no demuestra que toda salida generada ya la cumpla.

El roadmap [ATOMIC-20260929-004](../.agents/roadmaps/ROADMAP_ATOMIC-20260929-004_lecciones_catalogos.md)
registra la continuación. Entidades/Tipos adoptaron localmente el candidato
mediante VCXC-20260929-004; Familias lo amplía en VCXC-20260929-005, con autorización
expresa y ADR del consumidor. Es evidencia local, no referencia publicada elegible
ni propagación certificada. Los invariantes de procedencia y revisión del Guardián
siguen vigentes: no cambiar hashes, política instalada o versión para aparentar
cumplimiento. El generador no acredita automáticamente este flujo.


## Apertura tras render y retorno estable de foco — ATOMIC-20261102-006

`FormDialog` sincroniza `opened` mediante `afterRenderEffect`: la apertura declarativa se ejecuta después de que los controles proyectados hayan renderizado el valor entregado por su CVA. Se preservan `showModal()` y `close()` imperativos. La modificación no altera `InputComponent`, la restauración legítima de valores al enfocar o desenfocar, ni el modelo de negocio. La regresión mantiene un formulario cerrado con valor inicial 0, asigna 500 y abre en el mismo turno; verifica modelo, valor nativo, foco real, desenfoque, reapertura y conservación de un segundo campo 35.

`CrudDialog`, `FormDialog`, `ModalComponent` y `PaginaCrud` añaden `resolverFocoRetorno = input<(() => HTMLElement | null) | null>(null)`. El callback se evalúa al restaurar, después del cierre efectivo; no se evalúa al abrir. Un destino válido tiene prioridad sobre el origen capturado. Si devuelve `null`, lanza una excepción o no recibe realmente el foco, se intenta el origen. La excepción del callback no se imprime ni bloquea el cierre. Sin callback se conserva el retorno tradicional al origen.

Se admiten únicamente destinos conectados, visibles, del mismo documento y externos a la ventana que se cierra. Se descartan nodos desconectados, ocultos, `disabled`, `aria-disabled`, `aria-hidden` o dentro de un ancestro `inert`/`hidden`. Se verifica `document.activeElement` después de `focus({ preventScroll: true })`, incluida la conexión posterior al evento de foco. El retorno no añade `tabindex` a un destino que no puede enfocarse ni utiliza `body` como sustituto.

`CrudDialog` conserva `closed` como cierre efectivo y programa una única restauración después del siguiente render. La referencia cancelable y la generación de apertura invalidan el retorno pendiente al reabrir o destruir. `cancelled` sigue siendo una intención cuyo cierre decide el consumidor; no cambia el bloqueo de una escritura. `FormDialog` transmite el resolvedor al `CrudDialog` interno y conserva `busy`, `opened` y sus salidas.

`ModalComponent` conserva el cierre por destrucción. Captura el callback y el origen, cancela el foco de error pendiente e invalida el foco inicial pendiente. Una microtarea posterior a retirar su DOM intenta restaurar el foco; no utiliza un injector destruido, no emite `closed` desde `ngOnDestroy` y no duplica la confirmación del consumidor. Ambos componentes evitan restaurar sobre otra ventana modal abierta.

`PaginaCrud.obtenerDestinoFocoRetorno(): HTMLElement` devuelve su propio host, estable durante la recarga de filas. El host declara `role="region"`, nombre accesible derivado de `titulo` y `tabindex="-1"`, sin introducir una parada en la tabulación normal ni estilos nuevos. El callback se transmite a los diálogos CRUD y de confirmación. La decisión de devolverlo al cerrar pertenece al consumidor; el valor predeterminado sigue siendo `null`.

Las historias `AperturaTrasRenderYRetorno`, `RetornoConOrigenRetirado`, `RetornoTrasDestruccion` y `RetornoAlCatalogoTrasRecarga` utilizan componentes reales y datos sintéticos. La capacidad permanece local bajo el congelamiento de publicación. La compilación y las pruebas de la fuente no acreditan su adopción por los consumidores ni autorizan un `atomicRef` nuevo. La integración candidata solo se ensaya en una copia aislada; la propagación requiere la procedencia íntegra autorizada por el Guardián.


### Caracterización y cobertura final de las guardas al 2026-11-03

La implementación conserva la exclusión de `aria-disabled` en ambos resolvedores. En la caracterización histórica anterior, la mutación aislada que retiraba exclusivamente esa exclusión en `ModalComponent.restaurarFoco` pasaba las 33 pruebas de Modal (`0/0/0` en limpio/defecto/restaurado). Ese ensayo registró una brecha de cobertura del contrato; en aquella fase no se modificó la fuente ni se añadió una prueba para cerrar la devolución del juez. La misma mutación en `CrudDialog`, y la omisión de la guarda de otra ventana abierta en cada componente, sí producen detección funcional (`0/1/0`). La acreditación se agrupa por responsabilidad y conserva siete categorías de entradas por fase, además de las fuentes, comandos y resultados originales. El roadmap mantiene el estado de revisión y los límites de publicación.


La corrección acotada posterior añade únicamente un caso público que acredita el retorno al origen conectado frente a un candidato visible, conectado y nativamente habilitado con `aria-disabled="true"`. Modal pasa 34/34 y la suite completa 801/801. Al retirar exclusivamente esa cláusula en TEMP, el caso falla por foco real en el candidato indebido y vuelve a pasar al restaurar (`0/1/0`). Las siete familias nuevas se repiten con el spec final, conservando las siete categorías de entradas antes y después de cada fase y entre limpio y restaurado, sin reatribuir la evidencia histórica. El código de producción, las historias, el catálogo, los estilos y la API pública permanecen intactos por esta corrección de cobertura; el responsable acreditó el gobierno del origen con código nativo 0 en la sesión 60660. El roadmap registra el dictamen independiente y la procedencia del consumidor continúa sujeta al Guardián y a CI.
