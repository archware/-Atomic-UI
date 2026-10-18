# 🪟 Blueprint: Variantes Canonicas de Cierre y Descarte

Este blueprint proporciona la referencia visual e interactiva de los 7 patrones canonicos de cierre y descarte reconocidos en el sistema de diseno Atomic UI, conforme a las directivas de `AGENTS.md` y `CONTRATO_CATALOGOS_CRUD.md`.

## 🏛️ Invariante Doctrinal: Modal vs Popup

La ubicacion del boton de cierre (`X`) define formalmente la jerarquia y categoria de la ventana:

| Tipo de Superposicion | Destino Funcional | Ubicacion de la Accion de Cierre | Componente Atomic |
| :--- | :--- | :--- | :--- |
| **Modal** | Exclusivo para confirmaciones, advertencias criticas y avisos bloqueantes | **Por DENTRO** del contenedor institucional | `app-icon-button variant="close"` |
| **Popup** | Formularios centrados pequenos y rapidos de edicion o captura | **Flotando por FUERA** del contenedor | `app-icon-button variant="hanging-close"` |
| **Side-Panel** | Formularios extensos o wizards laterales | **Flotando por FUERA** o cabecera dedicada | `app-icon-button variant="hanging-close"` |

---

## 📦 Catalogo de los 7 Patrones Canonicos

1. **Boton Flotante Exterior (`hanging-close`)**:
   - Componente: `<app-icon-button variant="hanging-close" animation="none" />`
   - Uso: Posicionado en la esquina superior derecha (`top: -0.75rem; right: -0.75rem;`) en popups y dialogos de mantenimiento.
2. **Boton Integrado Interior (`close`)**:
   - Componente: `<app-icon-button variant="close" animation="none" />`
   - Uso: Cabeceras de modales del sistema con aspas fisicas de transicion institucional.
3. **Boton Fantasma Contextual (`ghost`)**:
   - Componente: `<app-icon-button variant="ghost" animation="none"><i class="fa-solid fa-xmark"></i></app-icon-button>`
   - Uso: Toasts flotantes, banners y barras de accion contextual.
4. **Accion Compacta de Alerta (`app-table-action`)**:
   - Componente: `<app-table-action action="custom" iconClass="fa-xmark" size="sm" tone="neutral" />`
   - Uso: Descarte en linea dentro de `app-alert [closable]="true"`.
5. **Etiquetas Removibles (`app-chip`)**:
   - Componente: `<app-chip [removable]="true" (remove)="..." />`
   - Uso: Filtros activos de busqueda y seleccion de parametros.
6. **Descarte de Archivos y Rich Dropzone (`app-file-input`)**:
   - Componente: `<app-file-input [multiple]="true" density="compact" />`
   - Uso: Carga con arrastrar y soltar (dropzone) y eliminacion individual de adjuntos.
7. **Boton Secundario Textual (`app-button variant="outline"`)**:
   - Componente: `<app-button variant="outline" (buttonClick)="..." />`
   - Uso: Pie de ventana; salida segura con autofoco y contrato de tecla Escape unificado.

---

## ⌨️ Contratos de Accesibilidad (A11y)

- **Contrato Escape Unificado**: Presionar Escape ejecuta exactamente el mismo comportamiento que el boton secundario Cancelar.
- **Autofoco en Salida Segura**: En dialogos de confirmacion destructiva, el foco inicial se ubica en el boton Cancelar para evitar confirmaciones involuntarias.
- **100% Tokenizado**: Todo color y dimension utiliza tokens semanticos de diseno (`var(--...)`) y unidades relativas (`rem`).
