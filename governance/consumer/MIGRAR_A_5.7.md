---
title: 'Migrar un consumidor a Atomic 5.7 y a la política 1.2.2'
document_type: 'guide'
version: '5.7.2'
status: 'vigente'
updated: '2026-08-13'
owner: 'Hospital Regional de Ayacucho'
---

# Migrar un consumidor a Atomic 5.7 y a la política 1.2.2

Esta guía no es teoría. Sale de migrar `prestamo_front_atomic` desde 5.5.0 /
política 1.0.0 el 2026-08-13, y su valor está en las trampas, no en los pasos:
los pasos se deducen leyendo el gate, las trampas cuestan una tarde cada una.

Léela entera antes de tocar nada. Hay dos decisiones que conviene tomar antes
de empezar, y una de ellas no es técnica.

---

## 0. Lo primero: código y política van soldados

**No se puede subir de componentes sin subir de política.** No es una
recomendación: está comprobado.

El gate del consumidor compara su propio `scripts/check-atomic-provenance.mjs`
contra `governance/consumer/check-atomic-provenance.mjs` de Atomic, y falla con
«Artefacto de gobierno modificado fuera de Atomic» si difieren. Como el de
Atomic ya es 1.2.2, apuntar a 5.7 conservando el gate 1.0.0 da 32 fallos, ese
incluido.

Si alguien propone «adoptamos los componentes ahora y la política después»,
esa vía no existe.

---

## 1. La decisión que no es técnica: los cinco servicios gobernados

La política 1.2.2 exige **cinco servicios** en `<uiRoots[0]>/services/`:

```
theme.service.ts   app-version.service.ts   modal.service.ts
popup.service.ts   toast.service.ts
```

Faltar uno es un fallo del gate. Y lo normal es que el consumidor tenga dos o
tres, con otros nombres y en otras carpetas.

En `prestamo_front_atomic` había **uno** (`toast`, en `ui/molecules/toast/`, con
28 importadores). El resultado fue:

| Servicio | Qué se hizo | Modo |
| --- | --- | --- |
| `toast` | movido a `ui/services/`, 28 imports reescritos | `adapted` |
| `modal` | era el `PrestDialogService`; movido y renombrado | `adapted` |
| `theme` | **extraído de `app-shell`**, donde no debía estar | `adapted` |
| `popup` | traído del ADN, no existía | `exact` |
| `app-version` | traído del ADN, no existía | `exact` |

**`adapted` es legítimo y es la salida honesta** cuando el consumidor ya tiene
un servicio equivalente con su propia API: se declara con `justification`,
`localSha256` y `atomicSha256`, y la divergencia queda registrada en vez de
escondida. Adoptar el del ADN en modo `exact` reescribiría a todos sus
consumidores por un cambio de nomenclatura.

Lo que **no** se debe hacer es crear envoltorios vacíos para los que no existen:
ficheros que solo están para que una comprobación pase son gobierno decorativo,
y es justo lo contrario de lo que la política persigue.

---

## 2. La segunda trampa: los `.spec.ts` no pueden ser `exact`

Atomic corre **Karma con Jasmine**; los consumidores de este ecosistema corren
**Vitest**. Propagar un spec del ADN tal cual no falla en el gate: **falla en
compilación**, porque `toBeTrue` / `toBeFalse` / `jasmine.createSpy` no existen
en Vitest.

Y hay algo peor, que pasó de verdad: **propagar sobrescribe la cobertura propia
del consumidor**. En la primera pasada se perdieron 119 líneas solo en
`select.spec.ts`, y el gate no dice nada, porque desde su punto de vista el
fichero por fin coincide.

**Regla:** un componente cuyo conjunto de ficheros incluya `.spec.ts` se declara
`adapted`, con esta justificación:

> Implementación propagada del ADN sin cambios; los `.spec.ts` divergen porque
> el ADN corre Karma con Jasmine y este consumidor corre Vitest, de modo que una
> propagación exacta no compila. La divergencia queda acotada a los ficheros de
> prueba y declarada aquí.

Y si la propagación **añade** un spec que el consumidor nunca tuvo, se retira:
no aporta cobertura, solo rompe el build.

---

## 3. El orden que funciona

Cada paso se verifica antes del siguiente. El número de fallos baja de forma
monótona; si sube, el paso anterior estaba mal.

### 3.1 `.gitattributes` primero

Es el que más ruido quita: en `prestamo_front_atomic` bajó los fallos de **276 a
61**. Cópialo de la raíz de Atomic y **comitéalo antes de seguir** — el gate
exige que esté versionado y limpio respecto del índice.

```bash
cp ../-Atomic-UI/.gitattributes .
git add .gitattributes && git commit -m "chore(atomic): canonizacion de finales de linea"
```

### 3.2 Vendorizar los artefactos de gobierno

Siete ficheros, y los siete tienen que ser byte-idénticos a los de Atomic:

```
governance/consumer/ATOMIC_GOVERNANCE.md        -> docs/ATOMIC_GOVERNANCE.md
governance/consumer/check-atomic-provenance.mjs -> scripts/check-atomic-provenance.mjs
governance/consumer/git-clean-eol.cjs           -> scripts/git-clean-eol.cjs
governance/consumer/safe-paths.cjs              -> scripts/safe-paths.cjs
governance/consumer/read-atomic-contract.cjs    -> scripts/read-atomic-contract.cjs
governance/consumer/source-manifest.cjs         -> scripts/source-manifest.cjs
governance/consumer/atomic-governance.yml       -> .github/workflows/atomic-governance.yml
```

### 3.3 No uses `governance:install` a ciegas

`tools/install-consumer-governance.js` asume dos cosas que pueden no cumplirse:

- que la raíz UI del consumidor es `src/app/shared/ui` — se corrige con
  `--ui-root=src/app/ui`;
- que **cada carpeta del consumidor tiene una carpeta homónima en Atomic**. Eso
  falla en cuanto hay divergencia de nombres: `date-picker` frente a
  `datepicker`, `button.ts` frente a `button.component.ts`.

**El gate SÍ admite el mapeo**: lee `component.local` y `component.atomic` por
separado. Es el instalador el que no. Si tus nombres divergen, escribe el
manifiesto a mano y olvídate del instalador.

### 3.4 Los cinco servicios

Ver §1. Muévelos con `git mv` para conservar el historial, y reescribe los
imports calculando la ruta relativa desde cada fichero — no con un `sed` global,
que deja rutas rotas según la profundidad.

Cuidado con dos detalles que costaron tiempo:

- Al mover `toast.service.ts`, su **spec se queda con el componente** si lo que
  prueba es el componente. Mira el `describe` antes de moverlo.
- Si restauras specs con `git checkout --`, **también revierte los imports que
  ya habías reescrito**. Vuelve a pasar la reescritura después.

### 3.5 El manifiesto, con la canonización del propio gate

No calcules los SHA-256 a mano. Usa `scripts/git-clean-eol.cjs`, que es lo que
el gate usa:

```js
const { canonicalFileSha256 } = require('./scripts/git-clean-eol.cjs');
canonicalFileSha256(repositoryRoot, absoluteFilePath);
```

Campos que 1.2.2 añade sobre 1.0.0: `contentCanonicalization`, `packageRoot`,
`uiRoots`, `shellRoot`, `featureRoots`, `layers`, `governedServices` y
`governanceArtifacts`. Copia sus valores de
`governance/consumer/atomic-provenance.template.json` y ajusta las rutas.

**El conjunto de ficheros por componente es la UNIÓN** de lo que hay en los dos
lados. El gate exige igualdad de conjuntos, y hay ficheros exclusivos de cada
uno; declararlos es lo que convierte una divergencia en una decisión.

### 3.6 La superficie gobernada: `shellRoot`

Esto es lo nuevo de 1.2.1/1.2.2 y lo que más sorprende: **el shell pasa a estar
gobernado**, y ahí no se admite ninguna primitiva visual nativa
—`button`, `dialog`, `input`, `select`, `table`, `textarea`—.

Al convertir el botón de menú del shell en `app-button` aparecieron dos huecos
del propio ADN, que **ya están resueltos en 5.7.1** y que conviene conocer:

- `ariaLabel`, `ariaControls` y `ariaExpanded`. Puestos sobre `<app-button>`
  —un elemento sin rol— quedan inertes: el lector anuncia un botón corriente que
  nunca dice si está abierto. `ariaExpanded` admite `null`, y ese es su valor por
  omisión, porque `aria-expanded="false"` sobre algo que no se despliega es una
  promesa falsa.
- `focus()`. Sin él, al pulsar Escape `nativeElement.focus()` sobre
  `<app-button>` manda el foco al `<body>` y la tabulación reempieza desde el
  principio del documento.

Si tu shell tiene un **velo de cajón** implementado como botón, aprovecha para
convertirlo en un `div` con `aria-hidden="true"`: es una superficie de descarte,
no un control, y tenerlo en el orden de tabulación pone una parada sin nombre
entre el cajón y el contenido. El teclado ya lo resuelve Escape.

---

## 4. Trampas sueltas que cuestan una tarde

- **El gate lee la fuente CRUDA para las primitivas nativas.** Un comentario que
  mencione `<button>` hace fallar la comprobación. Escribe «botón nativo».
- **`viewChild<Button>` ya no falla** desde 5.7.2: la comprobación dejó de
  ignorar mayúsculas. Si ves ese falso positivo, estás en una versión anterior.
- **`form-dialog` llama a `crudDialog.focusError()`.** Si tu `crud-dialog` es
  `adapted` y no lo tiene, el build falla con `TS2339`. Pórtalo: recorre los
  selectores de error en orden y **reintenta tras el render**, porque el aviso lo
  proyecta el consumidor y aparece al resolverse la petición.
- **`atomicRef` debe ser el `HEAD` del Atomic vecino.** Durante la migración,
  apunta el gate a un árbol concreto con `ATOMIC_UI_ROOT=/ruta/al/atomic` en vez
  de mover ramas; así el resto de repos no se ponen en rojo mientras trabajas.

---

## 5. Cómo saber que has terminado

```bash
npm run check:atomic     # política 1.2.2, N componentes y 5 servicios, cero violaciones
npm run typecheck
npm test
npm run build
```

Y una comprobación que ninguna herramienta hace por ti: **abre la aplicación**.
El gate mide procedencia y tokens; es ciego a la opacidad, al foco y a lo que
anuncia un lector de pantalla.

---

## 6. Lo que esta guía no cubre

- **La validación con lector de pantalla.** 5.7.0 declara la jerarquía de roles
  de tabla bajo la rejilla de columnas, pero eso verifica los atributos, no lo
  que anuncia NVDA o VoiceOver. Sigue pendiente y requiere una persona.
- **CI.** Si tu repositorio vive en Azure DevOps, el flujo que se vendoriza es de
  GitHub Actions y **no se ejecuta nunca**. Un gate que no corre es gobierno
  decorativo: dale integración real antes de migrar, o al menos a la vez.
