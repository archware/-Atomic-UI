# Contrato obligatorio para agentes

> `ATOMIC_GOVERNANCE_REQUIRED`

Antes de modificar interfaz, leer `docs/ATOMIC_GOVERNANCE.md` y
`docs/atomic-provenance.json`.

`-Atomic-UI` es la única fuente de verdad visual. No crear en esta aplicación
átomos, moléculas, organismos, superficies, plantillas, controles, diálogos,
tablas, tokens o patrones visuales reutilizables. Si falta un objeto, crearlo y
validarlo primero en Atomic; después propagarlo y registrar su procedencia.

Toda página o feature nueva debe componerse exclusivamente con el ADN existente:
- Prohibido usar primitivas HTML nativas (`<button>`, `<input>`, `<select>`, `<textarea>`, `<table>`, `<dialog>`, `<progress>`, `<meter>`) en vistas consumidoras.
- Prohibido usar desplazamiento nativo (`overflow-y: auto|scroll`, `overflow-x: auto|scroll`, `overflow: auto|scroll`) o estilizar `::-webkit-scrollbar` a mano. Todo contenedor o listado desplazable debe envolverse en `<app-scroll-overlay class="so-block" ...>` con `[maxBodyHeight]` o contenedor flex acotado (`min-height: 0`).
- Prohibido inyectar colores literales, estilos inline, `::ng-deep`, animaciones ad-hoc o directivas estructurales legadas (`*ngIf`, `*ngFor`, `*ngSwitch`).

La lógica de negocio permanece en esta aplicación. Antes de entregar cambios se debe ejecutar `npm run check:atomic`; está prohibido omitir, debilitar o eludir esa compuerta.
