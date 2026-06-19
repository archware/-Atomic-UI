# Lecciones Aprendidas (Lessons Learned)

Este documento centraliza el conocimiento adquirido tras solucionar problemas complejos de arquitectura, diseño e integración en el ecosistema de Atomic-UI, sirviendo como guía maestra para que agentes y desarrolladores entiendan el "por qué" de ciertas decisiones técnicas críticas y puedan portar este comportamiento a otros ecosistemas (Wails, Tauri, Web, etc).

---

## [2026-06-19] - Paginación, Scrollbars Nativos vs Custom y Sticky Headers

### 1. Paginación y Comportamiento del "Remanente" (Falso Bug)
**Contexto**: Los usuarios reportaron que al navegar a la última página de una tabla, "por defecto se regresaba a 10 registros pero el combo seguía marcando 50".
**La Lección**: Matemáticamente, la última página rara vez completa el `pageSize` exacto. Si el total es 110 registros y el tamaño es 50, la página 3 mostrará exactamente los 10 registros restantes. 
**Resolución de UX**: Se confirmó que esto no es un error de estado (el combo box `pageSize` mantiene su estado correctamente en 50 porque sigue siendo el tope máximo), sino una confusión natural del usuario. La solución real es instruir al usuario (o manejar estados vacíos "ghost rows" si el negocio lo demanda explícitamente), manteniendo la arquitectura fiel al remanente real del Stored Procedure.

### 2. El desafío de los "Sticky Headers" en Tablas con CSS Grid
**Contexto**: Para habilitar un ScrollOverlay con capacidad de redimensionamiento de columnas, se inyecta la tabla dentro de una estructura `display: block` o `display: grid`, y se le aplica `overflow: hidden` a las áreas inyectadas para evitar barras dobles.
**La Lección**: Cualquier elemento (`th`) que tenga `position: sticky` **perderá su efecto automáticamente** si cualquiera de sus padres tiene `overflow: hidden`. 
**Solución Arquitectónica**: Para volver a hacer la cabecera pegajosa dentro del contenedor, el `position: sticky; top: 0; z-index: 20;` debe declararse **directamente en el thead** (`.rtc-header` / `.atomic-thead`) y no solo en las celdas `<th>`. De este modo, la capa principal del header se ancla en el contenedor scrollable (`.so-scroll-area`) sin importar los bloqueos de overflow que tenga debajo.

### 3. Solapamiento (Overlap) de Custom Scrollbars sobre Componentes Sticky
**Contexto**: El componente `ScrollOverlay` inyecta barras de desplazamiento estéticas (`.so-scrollbar-y`) que se posicionan de manera absoluta dentro de la caja visible (`top: 0`).
**La Lección**: Si la caja contiene un elemento `sticky` anclado a `top: 0` (como un header), el track del scrollbar virtual se renderizará cruzando o pisando visualmente esa cabecera.
**Solución Arquitectónica**: En el cálculo de geometría (`syncGeometry`), el componente debe leer dinámicamente la altura reservada del header (`this.tableHead.offsetHeight`) y utilizar ese valor como un offset tanto para el inicio del recorrido (`top = offset`) como para recortar la altura de la vía (`barHeight = containerHeight - offset`). A nivel de motor lógico (`updateVerticalThumb`), la matemática que calcula la altura del thumb de scroll también debe iterar sobre el nuevo tamaño neto de la vía y no sobre todo el viewport general del contenedor.

---
