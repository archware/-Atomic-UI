# Glosario de Términos UI/UX y Desarrollo (Atomic UI)

Este documento recopila los términos profesionales, técnicos y de diseño que hemos estado utilizando durante la resolución de problemas y la mejora de la interfaz del proyecto **Atomic UI**.

## 🎨 Términos de Diseño Visual (UI/UX)

*   **Breathing Room (Respiro visual / Espacio negativo):** 
    Es el espacio vacío alrededor de los elementos de la interfaz. Un buen "breathing room" evita que el diseño se vea apretado ("tight"), mejora la legibilidad y hace que la interfaz luzca más limpia y profesional.
*   **Gutter (Canaleta / Margen de separación):** 
    Espacio reservado específicamente para separar elementos o para un propósito funcional, como el "track" por donde se desliza un scrollbar, o el espacio entre columnas en una cuadrícula.
*   **Responsive Design (Diseño Adaptable):** 
    Filosofía de diseño que asegura que la interfaz se adapte y fluya correctamente sin importar el tamaño de la pantalla (ej. usar barras de desplazamiento horizontales en móviles cuando una tabla es muy ancha).
*   **Design Tokens (Tokens de diseño):** 
    Son las variables elementales del diseño (colores, tipografías, espaciados, tamaños) almacenadas de forma centralizada (ej. `var(--so-track-size)`). Permiten mantener la consistencia en todo el sistema.
*   **Action Group (Grupo de Acciones):** 
    Un patrón de UI que agrupa múltiples acciones relacionadas (como Ver, Editar, Eliminar). Si hay falta de espacio, suele colapsar las acciones menos importantes en un menú desplegable (overflow menu).

## 💻 Términos Técnicos y CSS

*   **Scroll Overlay (Scroll superpuesto / flotante):** 
    Un tipo de barra de desplazamiento personalizada (custom scrollbar) que flota por encima del contenido en lugar de empujarlo o consumir espacio nativo del navegador.
*   **Overflow (Desbordamiento):** 
    Ocurre cuando el contenido de un elemento excede las dimensiones de su contenedor. En CSS, manejamos esto con propiedades como `overflow-x: auto` o aplicando rellenos dinámicos.
*   **Box-Sizing (border-box):** 
    Propiedad de CSS vital que asegura que el relleno (`padding`) y los bordes se calculen *dentro* del ancho total del elemento, evitando que el contenedor crezca inesperadamente y rompa el layout.
*   **Fr Unit (Unidad fraccional):** 
    Una unidad flexible en CSS Grid (`1fr`) que representa una fracción del espacio libre disponible en el contenedor. Útil para distribuir anchos dinámicamente.
*   **Max-Content:** 
    Palabra clave en CSS que le indica a un elemento que adquiera el ancho exacto necesario para mostrar su contenido interno sin envolverlo (hacer wrap) en múltiples líneas.

## 🏗️ Términos de Arquitectura y Angular

*   **Atomic Design (Diseño Atómico):** 
    Metodología de arquitectura de componentes que divide la interfaz en elementos modulares: **Átomos** (botones, inputs), **Moléculas** (grupos de acciones, barras de búsqueda) y **Organismos** (tablas complejas, cabeceras, overlays).
*   **Zoneless Change Detection:** 
    Una técnica moderna en Angular (utilizada en tus pruebas unitarias con `provideZonelessChangeDetection()`) que gestiona las actualizaciones de la vista sin depender de la librería `zone.js`, optimizando el rendimiento.
*   **Walkthrough / Implementation Plan:** 
    Artefactos de documentación utilizados para trazar, planificar y explicar de forma estructurada los cambios arquitectónicos y visuales que se aplican al código fuente.
