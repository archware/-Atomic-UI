---
title: "Contrato visual de catálogos CRUD y promoción compatible"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-09-28"
last_updated: "2026-09-29"
document_type: "contrato visual"
status: "vigente"
version: "1.3.0"
change_id: "ATOMIC-20260929-004"
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

## Invariantes visuales del catálogo

| Región | Contrato |
| --- | --- |
| Columna de estado | Etiquetas centradas junto con su encabezado por omisión. Una alineación explícita prevalece. En tarjetas móviles se centra el valor en su espacio, no la etiqueta de la celda. |
| Acciones de fila | Grupo compacto de iconos con nombre accesible; sin botones elevados ni saltos de línea que inflen la fila. |
| Consulta | Ojo neutro contrastado en el perfil de catálogo; se distingue de Activar verde (revisión aprobada ATOMIC-20260929-005). |
| Edición | Lápiz azul según el perfil de catálogo. |
| Baja | Papelera roja `fa-trash`; confirmación con botón `danger`. No confundir baja lógica con eliminación física. |
| Activación | En catálogos con baja lógica ocupa la misma tercera posición que Desactivar: `activate`, círculo con marca verde (`fa-circle-check`). No añade un cuarto botón ni forma parte de Guardar. |
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

## Coordinación asíncrona

El consumidor declara por fila Ver, Editar y una única acción de estado. Para
activos usa `deactivate` y etiqueta Desactivar; para inactivos `activate` y
etiqueta Activar. Atomic resuelve icono y tono mediante el perfil `catalog`;
no lee propiedades de dominio, decide permisos ni ejecuta HTTP. El icono
describe la próxima operación, no el estado actual. Cambia solo después de una
respuesta confirmada por el servidor.

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

Atomic no declara éxito ni cierra una confirmación al emitir una intención.
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
contenido y acción explícitos. El input `detalle` usa SummaryList en modo
`detail`; la proyección histórica con null es compatibilidad, no patrón nuevo.

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
