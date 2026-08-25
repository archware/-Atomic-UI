---
title: "Elevación del objetivo táctil mínimo de 2.75rem a 3rem"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-08-25"
last_updated: "2026-08-25"
document_type: "registro de decisión de arquitectura"
status: "aceptado"
version: "1.0.0"
change_id: "F3-ATOMIC-ADR-20260825"
related_change_id: "ECO-20260825-001"
---

# Elevación del objetivo táctil mínimo de 2.75rem a 3rem

## Estado

Aceptado. Autorizado de forma expresa por el propietario dentro de la fase F3 de
`ECO-20260825-001`, con identificador propio `F3-ATOMIC-ADR-20260825`.

## Contexto

`--touch-target-min` vale hoy `2.75rem`, es decir 44 píxeles CSS. Ese valor
proviene del criterio 2.5.5 de WCAG 2.1, cuyo mínimo es 44 por 44 píxeles CSS, y
coincide con el mínimo de 44 puntos que recomiendan las directrices de interfaz
humana de Apple. Para un consumidor web el valor es correcto y no hay defecto
que reparar.

La incorporación de la **Ley E: Ecosistema móvil y Flutter** (sección 8 de la
doctrina maestra `1.4.0`, apartado 8.6) cambia la situación. El apartado
resuelve que los objetivos táctiles son un piso físico que nunca se escala con
la preferencia de tamaño de texto y que jamás queda por debajo de
`kMinInteractiveDimension`, la constante de Flutter cuyo valor es `48.0` píxeles
lógicos. Ese número no es una elección de Flutter: es el mínimo de 48 por 48
píxeles independientes de densidad que exige Material Design en Android.

De ahí nace la contradicción que este registro resuelve. Un píxel lógico de
Flutter equivale al píxel CSS, de modo que `2.75rem` emitido hacia Dart produce
44 píxeles lógicos, cuatro por debajo del piso de Android. El emisor de tokens
tendría que elegir entre dos comportamientos, y los dos son inaceptables:

1. **Emitir el valor tal cual.** El cliente móvil nacería incumpliendo el
   apartado 8.6 desde su primera pantalla, y la compuerta
   `meetsGuideline(androidTapTargetGuideline)` fallaría sobre cada widget.
2. **Elevar el valor solo en el emisor.** El objetivo táctil pasaría a valer una
   cosa en Angular y otra en Flutter. Eso es exactamente la bifurcación visual
   que el apartado 6.1 prohíbe: una corrección visual nacida en el consumidor y
   no en la fuente canónica.

El capítulo 10 del propio sistema de diseño dejó escrito el procedimiento para
este caso: «si mañana el listón sube a 48px, sube el objetivo táctil y no se
mueve ni un margen». Ese día ha llegado, y llega por la vía prevista.

## Decisión

Se eleva `--touch-target-min` de `2.75rem` a `3rem` —48 píxeles CSS— en
`src/styles/themes/_tokens-primitives.css`, que es la fuente canónica.

El cambio se aplica **únicamente** a ese token. No se mueve ningún espaciado,
ningún margen, ningún relleno y ninguna otra medida. `--space-11`, que conserva
`2.75rem` por compatibilidad histórica y que el propio archivo documenta como un
valor fuera de escala, **no se toca**: quien dependa del antiguo 44 seguirá
teniéndolo bajo ese nombre.

El valor resultante satisface los tres listones a la vez: 48 supera los 44 de
WCAG 2.5.5, supera los 44 puntos de la guía de Apple, y alcanza exactamente los
48 de Material Design y de `kMinInteractiveDimension`. Subir es siempre
conforme; bajar nunca lo es.

## Consecuencias

### Para los consumidores Angular

Cuatro declaraciones consumen el token y todas crecen 4 píxeles:

| Archivo | Uso |
|---|---|
| `src/app/shared/ui/molecules/action-group/action-group.component.css` | `--action-btn-size` en la variante grande |
| `src/app/shared/ui/organisms/stepper/stepper.component.css` | `width` del paso |
| `src/app/shared/ui/organisms/stepper/stepper.component.css` | `height` del paso |
| `src/app/shared/ui/organisms/stepper/stepper.component.css` | `min-height` del contenedor |

Los cuatro consumidores del ecosistema —`saas-erp-front`, `saas-pos-front`,
`saas-admin-front` y `prestamo_front_atomic`— reciben el cambio al propagar el
sistema de diseño. El efecto es un botón de grupo y un paso de asistente cuatro
píxeles más grandes. No hay reflujo de maquetación porque el token no participa
en ninguna escala de espaciado ni en ningún punto de corte.

### Para el cliente móvil

El emisor de tokens puede transportar el valor canónico sin corregirlo, que es
la condición que el apartado 8.6 exige. El puente no inventa un piso propio: lo
hereda.

### Riesgo asumido

Un objetivo táctil mayor consume más espacio vertical en pantallas densas. Se
acepta de forma deliberada: un control que no se puede pulsar con fiabilidad es
un defecto de accesibilidad, y la densidad visual no es razón para conservarlo.

### Reversibilidad

El cambio es una sola línea. Revertirlo consiste en restituir `2.75rem` y
regenerar el tema Dart. Hacerlo devolvería al cliente móvil al incumplimiento
del apartado 8.6, de modo que la reversión exigiría enmendar antes la doctrina.

## Alternativas descartadas

**Crear un token móvil separado, `--touch-target-min-movil`.** Descartada: dos
tokens para el mismo concepto son dos verdades, y la primera vez que alguien
corrija uno solo aparece la bifurcación. El apartado 6.1 lo prohíbe.

**Elevar el valor dentro del emisor de Dart.** Descartada por la misma razón, y
además porque haría que la fuente canónica dejara de describir el sistema real.

**Dejar 2.75rem y declarar el incumplimiento como deuda.** Descartada: la
doctrina prohíbe expresamente degradar una compuerta, y aquí el coste de
cumplir es de cuatro píxeles.

## Verificación

- `npm run check:contrast`, `npm run check:typography`, `npm run check:focus` y
  `npm run check:css-values` sobre la fuente canónica. **Ejecutadas: las cuatro
  en verde.**
- **Regeneración obligatoria del manifiesto de procedencia.**
  `src/styles/themes/_tokens-primitives.css` es una de las 222 fuentes
  inventariadas en `distribution/atomic-source-manifest.json`, de modo que este
  cambio lo invalida y el instalador de gobierno del consumidor deja de correr.
  Se completa con `node tools/check-package-distribution.js manifest` y se
  verifica con `check`. Las compuertas de estilo no lo detectan porque miran
  significado y el manifiesto mira bytes.
- `npm run governance:check` completo, incluido el generador de proyectos.
  **Ejecutado: código de salida 0.**
- El emisor de tokens reproduce `48.0` píxeles lógicos en el archivo Dart
  generado, y su manifiesto de procedencia registra la huella del CSS de origen.
  **Verificado.**
- Revisión visual de los dos componentes afectados en Storybook. **Pendiente:
  requiere ejecución interactiva y queda como tarea del propietario.**
