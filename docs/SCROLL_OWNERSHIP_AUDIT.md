# Propietarios canónicos de scroll

> Auditoría `PREST-20260802-188` del ADN Atomic UI.

## Regla

Cada región desplazable tiene un solo propietario. Un `ScrollOverlay` oculta
el scrollbar nativo de todos los scrollers que administra; sus contenedores
padre usan `overflow: hidden` y no compiten. Los scrolls nativos se conservan
únicamente en listas breves, acotadas y orientadas a interacción táctil o de
teclado.

`TableComponent.unifiedScroll` determina el propietario único, mientras que
`scrollbarMode` determina exclusivamente su presentación. El valor `overlay`
conserva los rieles y thumbs canónicos; `native` constituye una alternativa
explícita y tokenizada que no crea un segundo propietario.

## Matriz auditada

| Región o componente                                                     | Propietario                                               | Decisión                                                                 |
| ----------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------ |
| `LayoutShell` contenido principal                                       | `ScrollOverlay`                                           | Overlay canónico; `.layout-content` solo recorta.                        |
| `AuthLayout` contenido                                                  | `ScrollOverlay`                                           | Overlay canónico para viewport completo.                                 |
| `Sidebar` navegación extensa                                            | `ScrollOverlay` sobre `[data-sidebar-scroll-surface]`     | El aside del shell y el host no desplazan.                               |
| `DataTable`                                                             | `ScrollOverlay` de `.data-table__viewport`                | Único propietario horizontal/vertical; región y tabla no crean barras.   |
| `CrudDialog` / `FormDialog`                                             | `ScrollOverlay` sobre `[data-crud-dialog-scroll-surface]` | El `dialog` usa `overflow: hidden`; header y acciones permanecen sticky. |
| `Combobox`, `Dropdown`, `Select2`                                       | Scroll nativo localizado                                  | Listas acotadas; preserva teclado, rueda y tacto sin anidar overlays.    |
| `Datepicker`                                                            | Sin scroll interno                                        | La cuadrícula cabe en su popup; no debe introducir un scroller.          |
| `Tabs` y `Pagination` en móvil                                          | Scroll horizontal nativo                                  | Interacción táctil acotada; no es scroll de página.                      |
| `ModalComponent`, `ModalContainer`, `PopupContainer` heredados          | Scroll nativo localizado                                  | Compatibilidad heredada. Nuevos formularios deben usar `FormDialog`.     |
| `overflow: hidden` en avatar, imagen, badge, accordion o clips visuales | No aplica                                                 | Es recorte visual, no un propietario de scroll.                          |

## Invariantes verificables

1. Ningún ancestro de `ScrollOverlay` usa `overflow: auto` para el mismo eje.
2. Todo scroller custom recibe `data-so-managed-scrollbar` y oculta la barra
   nativa en Chromium, Firefox y motores MS heredados.
3. Un overlay exterior ignora candidatos pertenecientes a overlays anidados.
4. Abrir o reutilizar `CrudDialog` reinicia el `scrollTop` de su superficie.
5. El scroll nativo localizado nunca se promueve a dueño de shell o página.
6. La rueda funciona sobre toda la superficie de contenido. Un scroller anidado
   conserva prioridad mientras puede desplazarse y, al llegar a su borde, el
   gesto puede continuar en el `ScrollOverlay` exterior.

## Criterio para consumidores

Una pantalla no debe agregar `overflow-y: auto` al `main`, al panel exterior de
un modal o al wrapper de una tabla. Debe componer el `ScrollOverlay` canónico o
consumir un organismo que ya lo incluya. Los controles de lista breve no se
envuelven en overlays adicionales.
