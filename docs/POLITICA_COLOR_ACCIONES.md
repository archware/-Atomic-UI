# Política de color para acciones e indicadores

## Objetivo

Evitar que el color de marca pierda significado por repetición. El morado
identifica prioridad, no la existencia de un botón o de un icono.

## Jerarquía obligatoria

1. Cada región de acciones admite como máximo una acción `primary`.
2. Las acciones auxiliares usan `outline` o `ghost`. `outline` conserva una
   superficie neutral visible; `ghost` se reserva para la menor jerarquía.
3. `secondary` se reserva para una acción operativa destacada que no compita con
   una primaria en la misma región.
4. `success`, `warning` y `danger` solo expresan consecuencia o estado.
5. Un icono KPI es `neutral` por defecto. `brand`, `info`, `success`, `warning`
   o `danger` requieren una razón semántica vinculada al indicador.
6. El color no sustituye texto, etiqueta accesible, orden ni agrupación.
7. Una acción contextual dentro de una tarjeta puede usar `soft` con el tono
   semántico de esa tarjeta. El fondo es tenue y no compite con la acción
   primaria de la región.
8. Una tarjeta de dominio puede usar `surface-tone` y un modificador semántico
   para aportar contexto de baja intensidad. La utilidad no comunica por sí
   sola un estado ni reemplaza el título o la etiqueta del dominio.

## Ejemplo de una barra operativa

```html
<app-button variant="primary">Acción principal</app-button>
<app-button variant="outline">Acción auxiliar</app-button>
<app-button variant="soft" tone="success">Acción contextual</app-button>
<app-button variant="ghost">Más información</app-button>
```

## Antipatrones

- cuatro botones primarios en una misma fila;
- iconos de todas las métricas con color de marca;
- usar `danger` para llamar la atención sobre una acción inocua;
- recrear morado con un color fijo dentro de una feature;
- convertir `outline` en una segunda variante primaria.
- usar `soft` sin una relación semántica con su contenedor o consecuencia.

La política se aplica primero en Atomic UI y se propaga a los consumidores con
pruebas, procedencia y registro de decisión.
