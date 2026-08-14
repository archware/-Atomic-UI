---
title: 'Andamiaje de pruebas para consumidores'
document_type: 'guide'
version: '5.8.0'
status: 'vigente'
updated: '2026-08-13'
owner: 'Hospital Regional de Ayacucho'
---

# Andamiaje de pruebas para consumidores

Esto **no** son artefactos de gobierno obligatorios. El gate no los compara y no
hace falta declararlos en `governanceArtifacts`. Se publican aquí porque
resuelven problemas que el ADN **no puede descubrir desde su propio entorno**, y
que por tanto se cobraban una tarde en cada repositorio por separado.

---

## Por qué existe esta carpeta

Atomic corre **Karma sobre Chrome**. Todos sus consumidores corren **Vitest
sobre jsdom**. Esa diferencia no es un detalle de configuración: crea una clase
entera de defectos que aquí son invisibles y allí son cotidianos.

El caso que originó la carpeta: `HTMLDialogElement.showModal` **siempre** existe
en Chrome y **nunca** en jsdom. La consecuencia es doble y ninguna de las dos se
ve desde aquí:

- El propio `crud-dialog.ts` del ADN tiene una rama de reserva
  —`if (typeof element.showModal === 'function') { … } else { … }`— que su suite
  jamás ejercita.
- Cada consumidor acaba inventando su propio remiendo, normalmente un parche de
  instancia dentro del `.spec.ts` que lo necesita, sin restauración.

---

## `dialog-polyfill.ts`

Instala `showModal` y `close` en `HTMLDialogElement.prototype`, y sabe
deshacerlo. Cópielo a su repositorio —`src/testing/` es el sitio habitual— y
úselo así:

```ts
import { installDialogPolyfill, restoreDialogPolyfill } from '../../testing/dialog-polyfill';

beforeEach(() => installDialogPolyfill());
afterEach(() => restoreDialogPolyfill());
```

**Las dos trampas que cuesta cada una una tarde, y que el fichero documenta en
su cabecera:**

1. **`writable: true` no es opcional.** `Object.defineProperty` aplica
   `writable: false` cuando **crea** la propiedad, y aquí siempre la crea. Sin
   ese indicador, cualquier prueba posterior que haga
   `dialog.showModal = () => …` revienta con
   `TypeError: Cannot assign to read only property 'showModal'` — en modo
   estricto, que es todo módulo ESM, la asignación recorre la cadena de
   prototipos, encuentra un dato no escribible y lanza.

2. **Hay que restaurarlo entre ficheros.** El corredor de Angular usa
   `isolate: false`: un mismo proceso ejecuta varios ficheros de prueba
   **compartiendo el entorno DOM**, y nada deshace un `defineProperty` entre uno
   y otro — `vi.restoreAllMocks()` no lo toca. Sin restaurar, los demás ficheros
   ven un `<dialog>` con `showModal` funcional y **qué rama del código de
   producción se ejercita depende del reparto de trabajadores**: verde en una
   máquina de muchos núcleos, rojo en un CI de dos.

El síntoma de la primera trampa fue una prueba intermitente que costó
localizar precisamente porque el veneno solo alcanza a lo que corre después y en
el mismo proceso.

## `dialog-polyfill.spec.ts`

El contrato del ayudante, escrito con aserciones **absolutas** —no relativas al
estado previo—, que es lo que permite que la prueba de restauración signifique
algo.

**Corre en el consumidor, no aquí**: usa la API de Vitest, y este repositorio
ejecuta Jasmine. Cópielo junto al ayudante.
