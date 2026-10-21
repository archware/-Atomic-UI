---
title: "Continuidad para agentes de Atomic UI"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-08-23"
last_updated: "2026-10-20"
document_type: "manual de continuidad"
status: "vigente"
version: "1.4.3"
change_id: "ATOMIC-20261020-002"
canonical_doctrine: "C:\\Users\\cotaha\\source\\repos\\.agent\\doctrinas\\DOCTRINA_MAESTRA_UNIFICADA.md"
document_standard: "C:\\Users\\cotaha\\source\\repos\\.agent\\doctrinas\\ESTANDAR_DOCUMENTAL_AGENTES.md"
---

# Continuidad para agentes de Atomic UI

Se mantiene el contrato documental ECO-20260823-003. Las unidades candidatas
inferiores no equivalen a una nueva publicación del ADN.

## Unidad Select2 ATOMIC-20261020-002

La corrección de Select2 se limita a su capa flotante, pruebas y catálogo.
No se deben modificar los contenedores de formularios para compensar el
recorte ni sincronizar masivamente el ADN del consumidor. El commit local
acotado fue autorizado expresamente, después de revisión, sin publicación.
El estado comprobado, límites del ensayo y rollback viven en el
[roadmap de Select2](../.agent/roadmaps/ROADMAP_ATOMIC-20261020-002_select2_capa_flotante.md).

## Corte previo ATOMIC-20261020-001

`ATOMIC-20261020-001` incorpora la variante `variant="dropzone"` en `FileInputComponent` (`atoms/file-input`) con soporte para título/subtítulo personalizables, insignia (`badgeHint`), cabecera de lista con contador (`showHeader`, `headerTitle`), vaciado total (`allowClearAll`, `clearAllLabel`, `cleared`), acción contextual por fila (`itemActionIcon`, `itemActionLabel`, `fileAction`, `fileRemoved`) y protecciones contra arrastre fantasma en WebView2/escritorio. Asimismo, homologa el input `[required]` (`false` por defecto), el asterisco `.field__required.fl-label__required` (`aria-hidden="true"`) en modos `standard`, `floating` y `floating-value`, y `aria-required="true"` en `FloatingInputComponent`, `DatepickerComponent`, `ComboboxComponent`, `TagInputComponent` y `NumberInputComponent`. Evidencia y rollback en el [roadmap](../.agent/roadmaps/ROADMAP_ATOMIC-20261020-001_dropzone_y_required.md).

## Corte ATOMIC-20261019-002

`ATOMIC-20261019-002` alinea `--field-label-font-weight` a `var(--font-weight-title)` (700) en `src/styles/themes/_tokens-primitives.css` y añade el input `required` (`false` por defecto) a `Select2Component`, mostrando `.field__required` en las tres variantes (`standard`, `floating`, `floating-value`) y `aria-required="true"` en el disparador. Evidencia y rollback en el [roadmap](../.agent/roadmaps/ROADMAP_ATOMIC-20261019-002_select2_etiqueta_obligatoria.md).

## Corte ATOMIC-20261019-001

`ATOMIC-20261019-001` unifica los modos de etiqueta (`variant`: `standard` | `floating` | `floating-value`) y los tokens `--field-label-*` en `InputComponent`, `SelectComponent`, `Select2Component`, `TextareaComponent`, `FloatingInputComponent`, `FloatingTextareaComponent`, `DatepickerComponent`, `ComboboxComponent`, `TagInputComponent`, `NumberInputComponent`, `DropdownComponent` y `.form-label` (`_forms.css`). `InputComponent` y `SelectComponent` quedan como implementaciones únicas de `app-input` y `app-select`, mientras `Input` y `Select` se reexportan como alias de compatibilidad. En modo flotante el `placeholder` se oculta mientras la etiqueta reposa dentro de `.fl-control`.

102 pruebas unitarias en 16 suites de controles de formulario, la prueba negativa `tools/test-field-label-gate.mjs` (18 hojas descubiertas, 0 literales) y todas las compuertas de `npm run governance:check` pasan en verde. Sin publicación ni push. Evidencia y rollback en el [roadmap](../.agent/roadmaps/ROADMAP_ATOMIC-20261019-001_modos_etiqueta.md).

## Calendario y selector candidatos

ATOMIC-20261001-002 corrige navegación, bloqueo CVA y submit involuntario del
Datepicker existente; su contrato Date/null no cambia. El catálogo registra las
pruebas. Select2 flexibiliza texto seleccionado y lista con búsqueda. Ventas
consume solo los bloques compatibles, sin perder su posición fija adaptada.
17 pruebas focalizadas y build pasan; no hay certificación global, publicación
ni cambio del manifiesto canónico. El smoke de gobierno falla por inventario.
El popup de calendario conserva 320 px y no ofrece min/max: comprobar móvil y
validar fechas en el consumidor, sin inventar inputs. Evidencia y rollback en
el [roadmap](../.agents/roadmaps/ROADMAP_ATOMIC-20261001-002_calendario_selector.md).

## Presentación de transacciones candidata

ATOMIC-20261001-001 incorpora dos organismos para preservar Ventas sin estilos
en la feature: TransactionDetail (grupos semánticos, tablas, acción, total) y
TransactionEditor (disposición proyectada). El catálogo documenta API candidata;
el consumidor aporta textos formateados y reglas de operación. Sin dependencias
financieras, moneda o acceso HTTP en las piezas. No reemplazar ReceiptPanel ni
PrintDocumentPanel: tienen otras responsabilidades.

Tres pruebas de fuente y build pasan. La adopción local en ventas-cxc tiene
64 pruebas específicas y comprobación visual; no prueba operaciones financieras.
Persisten bloqueos globales de tokens/gobierno/procedencia ajenos a estas piezas.
Sin publicación ni cambio de versión/manifiesto. Véase
[roadmap](../.agents/roadmaps/ROADMAP_ATOMIC-20261001-001_transacciones.md).

## Corte documental ATOMIC-20260930-008

Reutilizar experiencia visual no transfiere contrato ni seguridad. Antes de
conectar otro catálogo, exigir la matriz local del consumidor conforme a la
maestra 2.3.0, apartado 1.10, y al [contrato](CONTRATO_CATALOGOS_CRUD.md).
Mantener tres acciones, detalle semántico y diseño; comprobar su adopción real.

Solo doctrina y documentación. Sin componentes, tokens, reglas ejecutables
del catálogo, política o procedencia nuevos. Proveedores en ventas-cxc sigue
pendiente de implementación; no atribuirle pruebas históricas de otros módulos.
Ver [roadmap](../.agents/roadmaps/ROADMAP_ATOMIC-20260930-008_reutilizacion_segura.md).

## Corte vigente ATOMIC-20260930-007

Se precisa la consulta de catálogos mediante SummaryList detail, conservando
cabecera, cierre y pie Atomic. La regla de diálogos readonly-detail-content
es de revisión, no un control automático del generador. No hay cambios de
componentes, estilos, tokens o política de propagación.

ventas-cxc aplica el patrón a Tipos mediante VCXC-20260930-003 y conserva
Familias/Entidades. Otros módulos siguen pendientes y están inventariados
en el consumidor. Ver [contrato](CONTRATO_CATALOGOS_CRUD.md) y
[roadmap](../.agents/roadmaps/ROADMAP_ATOMIC-20260930-007_detalle_catalogos.md).

## Guardado local ATOMIC-20260930-006

El dueño autoriza commits locales de los cambios acumulados, incluido Atomic;
sin push, despliegue ni operaciones de base de datos. Este guardado conserva
trabajo en curso y no certifica cierre funcional ni procedencia global.
La autorización explícita de esta sesión permite únicamente el commit local;
no levanta el congelamiento general ni permite push o publicación.
Consultar el [roadmap de guardado](../.agents/roadmaps/ROADMAP_ATOMIC-20260930-006_checkpoint.md)
y git log para identificar el commit; las cifras inferiores son antecedentes.

## Corte vigente ATOMIC-20260929-005

Alert y la muestra comparten ahora implementación; acento lateral y texto
neutro, sin estilos propios de alerta en consumidores. TableAction catalog:
Ver neutro, Editar azul, Activar verde, Desactivar rojo. La aprobación expresa
del dueño sustituye la antigua excepción de ojo verde; standard no cambia.
DataTable adopta Button neutro para retry, manteniendo su evento.

Adopción candidata en ventas-cxc, documentada allí como VCXC-20260929-006.
No equivale a publicación ni altera la política instalada del consumidor.
54 pruebas específicas pasan; 512/516 en la suite completa, cuatro fallos de
autenticación fuera del corte. Build, biblioteca y Storybook pasan. Referencia
visual aislada: atomic-alert-reference--superficies, con Panel/Alert/DataTable.
Ver [roadmap y límites](../.agents/roadmaps/ROADMAP_ATOMIC-20260929-005_alertas.md).
Las cifras siguientes son antecedentes de cada asignación.

## Corte vigente ATOMIC-20260929-004

Entidades y Tipos adoptaron el candidato local con autorización expresa en
VCXC-20260929-004; Familias continúa en VCXC-20260929-005. Por tanto, las frases
«adopción pendiente» y «editor intacto» de los antecedentes siguientes describen
su fecha, no el estado actual. La publicación y propagación certificada siguen
pendientes; política instalada en Ventas 1.2.2 y fuente 1.2.3 no se falsean.

Se actualizan doctrinas/rutas de lectura y reglas UX. PaginaCrud añade
bloquearCierre; SummaryList detail se consume en Familias. No trasladar al ADN
consultas, DTOs, IDs, permisos ni orquestación. Véanse
[contrato](CONTRATO_CATALOGOS_CRUD.md) y
[roadmap](../.agents/roadmaps/ROADMAP_ATOMIC-20260929-004_lecciones_catalogos.md).

Evidencia actual: 13/13 focalizadas, negativa 1/10 al retirar la guarda y verde
tras restaurarla. Build/lib, catálogo estructural, tooling, paquete y smoke
del generador pasan. Suite global 510/514; lint, API de catálogo, tokens,
tipografía y contraste mantienen deuda en rutas no intervenidas. No es release.

## Continuación ATOMIC-20260929-003

Capacidad candidata: tercera acción contextual de catálogo y
`PaginaCrud.guardarHabilitado`. No se alteran estilos ni valores predeterminados
de otros consumidores. Quince pruebas focalizadas pasan; adopción en Entidades
y Tipos de Ventas pendiente de autorización local expresa o referencia elegible
del Guardián. El editor del consumidor permanece intacto mientras tanto.
Consultar el [roadmap](../.agents/roadmaps/ROADMAP_ATOMIC-20260929-003_accion_contextual.md)
y la [desviación](../.agents/desviaciones/DESVIACION_ATOMIC-20260929-003.md).

## Continuación ATOMIC-20260929-002

Corrección candidata del centrado de estados en DataTable; conserva align
explícito y no altera acciones ni ventanas. Véanse
[roadmap](../.agents/roadmaps/ROADMAP_ATOMIC-20260929-002_alineacion_estados.md),
[contrato](CONTRATO_CATALOGOS_CRUD.md) y
[evidencia](../.agents/evidencias/ATOMIC-20260929-002.md).
La fuente sigue en main / 98cc215757a03787371fa7cdf2dcd564a2430fef, con trabajo
previo preservado. No se modifica ventas-cxc. La adopción necesita referencia
limpia revisada por el Guardián y resolver la instalación de monorepos:
[desviación](../.agents/desviaciones/DESVIACION-20260929-002.md).

## Continuación ATOMIC-20260928-001

Se trabaja sobre `main`, OID inicial
`98cc215757a03787371fa7cdf2dcd564a2430fef`, limpio antes de esta asignación.
Cambios candidatos en árbol, sin commit ni publicación. La política de fuente
es 1.2.3; las copias de consumidores no se han actualizado. Leer el
[roadmap](../.agents/roadmaps/ROADMAP_ATOMIC-20260928-001_preservacion_visual.md),
el [contrato visual](./CONTRATO_CATALOGOS_CRUD.md) y la
[evidencia](../.agents/evidencias/ATOMIC-20260928-001.md).

`PaginaCrud`, `SummaryList layout="detail"` y `TableAction profile="catalog"`
son capacidades candidatas para Familias. No copiar encima de sus pruebas ni
perder filtros, validación, DTO o coordinación asíncrona. El generador todavía
compone su receta por organismos y no acredita el nuevo patrón. La auditoría
acepta proyecto dentro de Git en modo lectura; la instalación del workflow de
monorepo sigue pendiente. Sin compuertas globales y referencia limpia recuperable
no se propaga ni se declara terminado el frente Ventas.

## Propósito y límites

`-Atomic-UI` es la única fuente visual canónica del ecosistema. Contiene tokens,
componentes, catálogo, generador, política de consumo, biblioteca y contrato de
distribución. Los consumidores conservan navegación, permisos, contratos API o
IPC, estado y reglas de negocio; esas responsabilidades no se trasladan al ADN
visual.

La autoridad superior es la
[Doctrina maestra unificada](C:/Users/cotaha/source/repos/.agent/doctrinas/DOCTRINA_MAESTRA_UNIFICADA.md),
ubicada en
`C:\Users\cotaha\source\repos\.agent\doctrinas\DOCTRINA_MAESTRA_UNIFICADA.md`. El paquete
documental se rige por el
[Estándar documental para continuidad de agentes](C:/Users/cotaha/source/repos/.agent/doctrinas/ESTANDAR_DOCUMENTAL_AGENTES.md),
ubicado en
`C:\Users\cotaha\source\repos\.agent\doctrinas\ESTANDAR_DOCUMENTAL_AGENTES.md`.
El trabajo se asigna mediante el
[Prompt maestro para continuidad de agentes](C:/Users/cotaha/source/repos/.agent/guias/PROMPT_MAESTRO_CONTINUIDAD_AGENTES.md),
ubicado en
`C:\Users\cotaha\source\repos\.agent\guias\PROMPT_MAESTRO_CONTINUIDAD_AGENTES.md`.

## Orden obligatorio de lectura

1. Doctrina maestra y estándar documental enlazados en la sección anterior.
2. [`../AGENTS.md`](../AGENTS.md) y el `AGENTS.md` de la raíz
   `C:\Users\cotaha\source\repos`.
3. Este manual.
4. [`governance/consumer/ATOMIC_GOVERNANCE.md`](../governance/consumer/ATOMIC_GOVERNANCE.md)
   y [`ECOSYSTEM_WORKFLOW.md`](../ECOSYSTEM_WORKFLOW.md).
5. [`DOCTRINA_DE_INTERFAZ.md`](../DOCTRINA_DE_INTERFAZ.md) y
   [`docs/ATOMIC_UI_AGENT_RUNTIME.md`](./ATOMIC_UI_AGENT_RUNTIME.md).
6. La guía o habilidad aplicable de [`.agents/`](../.agents/), el catálogo y el
   roadmap activo.
7. [`CHANGELOG.md`](../CHANGELOG.md),
   [`LESSONS_LEARNED.md`](../LESSONS_LEARNED.md) y la documentación de
   distribución para reconstruir decisiones anteriores.

Para migrar un consumidor a la línea vigente se lee además
[`MIGRAR_A_5.22.md`](../governance/consumer/MIGRAR_A_5.22.md). Una guía histórica
no autoriza copia manual ni sustitución de una adaptación local.

## Arquitectura y fronteras

```text
Requisito visual
  -> catalog/: recetas, componentes y variantes declaradas
    -> src/app/shared/ui/: átomos, moléculas, organismos, superficies y plantillas
      -> src/styles/: tokens y temas
        -> projects/atomic-ui/: biblioteca Angular compilable
          -> distribution/: contrato, manifiesto y paquete reproducible
            -> governance/consumer/: política, instalador y gate
              -> consumidores con procedencia exacta o adaptada

tools/ y scripts/
  -> consulta, generación, auditoría, pruebas negativas y manifiestos
```

- Una feature de consumidor nunca se convierte en origen visual. Un hallazgo
  útil vuelve primero a esta fuente, queda catalogado y supera sus compuertas.
- La biblioteca `@atomic-ui/core` es el destino estable de distribución; un
  paquete local verde no autoriza publicación en un registro.
- `generate:ui` compone únicamente contratos declarados. El modo integrado se
  rechaza si faltan endpoint, método o contrato real.
- El instalador fija remoto, OID, política, versión y SHA-256. Una adaptación
  exige justificación y registro de decisión; una copia exacta debe conservar
  identidad canónica.

## Estado doctrinal comprobado

La instantánea del 23 de agosto de 2026 corresponde a la rama `main` y al OID
`00f440bfdfb7fcf660d08d6a55efffc080cc8e57`. El árbol contiene un refactor
Atomic amplio que se considera preexistente a este paquete documental.

El paquete continúa en la versión `5.22.0`. La hoja
[`ROADMAP_20260823_atomic_ui_6_0.md`](../.agents/roadmaps/ROADMAP_20260823_atomic_ui_6_0.md)
permanece en ejecución. Dos cortes están validados: contratos públicos mediante
Signals y estilos Angular externos en el alcance mantenido. La directiva
`appVariablesCss` es un adaptador transitorio para propiedades personalizadas;
se retira cuando cada entrada pueda expresarse mediante tokens o clases cerradas.

La versión 6.0.0 no está completada. Estado de las seis familias frente a la instantánea inicial:

1. medidas rígidas: una búsqueda de la instantánea encontró 351 líneas con
   `px` en 79 archivos de `src/app/shared/ui`;
2. Tailwind: `[x]` `tailwind.config.js`, directivas `@tailwind` y dependencias
   fueron retirados en `6be5a57`; permanece pendiente sustituir utilidades
   residuales en historias y demostraciones sin degradar consumidores;
3. aliases: permanecen 16 declaraciones de selector que incluyen `prest-*`;
4. colisiones: `[x]` resueltas en `ATOMIC-20261019-001` (`InputComponent` y
   `SelectComponent` como implementaciones canónicas únicas de `app-input` y
   `app-select`, con pruebas de catálogo y barrel);
5. generador: debe producir exclusivamente Signals, estilos externos, tokens y
   selectores `app-`, con pruebas negativas deterministas;
6. cambio de versión: faltan el salto a 6.0.0, política, manifiestos, contrato de
   paquete, documentación de distribución y propagación verificada.

Estos conteos orientan el siguiente lote y deben repetirse antes de editar. No
constituyen una autorización para una sustitución mecánica general.

## Fuentes locales y rutas operativas

| Necesidad | Fuente |
|---|---|
| Política de consumidor | [`governance/consumer/ATOMIC_GOVERNANCE.md`](../governance/consumer/ATOMIC_GOVERNANCE.md) |
| Flujo de propagación | [`ECOSYSTEM_WORKFLOW.md`](../ECOSYSTEM_WORKFLOW.md) |
| Reglas derivadas de uso | [`DOCTRINA_DE_INTERFAZ.md`](../DOCTRINA_DE_INTERFAZ.md) |
| Runtime para agentes | [`docs/ATOMIC_UI_AGENT_RUNTIME.md`](./ATOMIC_UI_AGENT_RUNTIME.md) |
| Catálogo | [`catalog/`](../catalog/) |
| Fuente UI | [`src/app/shared/ui/`](../src/app/shared/ui/) |
| Tokens y temas | [`src/styles/`](../src/styles/) |
| Biblioteca | [`projects/atomic-ui/`](../projects/atomic-ui/) |
| Distribución | [`distribution/`](../distribution/) |
| Roadmaps | [`.agents/roadmaps/`](../.agents/roadmaps/) |
| Roadmap de este paquete | [`ROADMAP_20260823_continuidad_documental_agentes.md`](../.agents/roadmaps/ROADMAP_20260823_continuidad_documental_agentes.md) |

## Compuertas

Una modificación propagable ejecuta, como mínimo, desde la raíz:

```powershell
npm ci
npm run governance:check
npm run lint
npm test -- --watch=false
npm run build
npm run lib:build
npm run build-storybook
npm run package:check
git diff --check
git diff --stat
git status --short --branch
```

`governance:check` incluye catálogo, tokens, herramientas, Signals, estilos
externos, selectores, CSS, contraste, foco, paquete y pruebas del gobierno. La
ejecución verde de un corte parcial certifica ese corte; no borra tareas abiertas
del roadmap 6.0. Un cambio solo documental valida enlaces, YAML, terminología y
que el diff no incluya código, manifiestos, dependencias o archivos de bloqueo.

## Protocolo de cambio

### Inicio

1. Se registra ruta, rama, OID, remoto y árbol sucio.
2. Se crea el roadmap antes de editar y se delimita una familia de deuda o una
   capacidad visual concreta.
3. Se consulta `agent:context` y catálogo; el generador se ejecuta primero con
   `--dry-run` cuando corresponde.
4. Se declaran contratos públicos, accesibilidad, responsive, compatibilidad,
   consumidores, validaciones y rollback.

### Implementación

1. Se modifica la capa Atomic correcta y se añaden tokens antes de consumirlos.
2. Las entradas y salidas usan `input()` y `output()`; la presentación se aloja
   en hojas externas; los selectores públicos nuevos usan `app-`.
3. Se actualizan catálogo, barrel, pruebas y herramientas en la misma unidad.
4. Se ejecutan compuertas de fuente antes de propagar. Ningún consumidor se
   sobrescribe para hacer coincidir una huella.

### Propagación y cierre

1. Se fija un OID recuperable y se registra procedencia exacta o adaptación con
   decisión real.
2. Se ejecutan las compuertas del consumidor afectado.
3. Se actualizan changelog, lecciones, distribución, manifiestos y roadmap solo
   cuando hayan cambiado realmente.
4. No se publica paquete, versión ni despliegue sin autorización explícita y
   todas las compuertas de release.

## Definición de terminado

Una capacidad visual queda terminada cuando está en la capa correcta, usa
tokens, Signals, estilos externos y `app-`, dispone de catálogo, barrel,
accesibilidad, pruebas y responsive, supera las compuertas de fuente y queda
propagada con procedencia verificable a cada consumidor del alcance. Atomic UI
6.0.0 solo puede declararse terminado cuando las seis familias pendientes son
cero, la versión y distribución se actualizan y los consumidores acordados
quedan validados.

## Riesgos y rollback

Los riesgos principales son romper la API pública durante la retirada de alias,
alterar geometría con sustituciones de medidas, sobrescribir adaptaciones y
publicar un OID no recuperable. Cada lote conserva compatibilidad o declara su
versión mayor y su secuencia de consumidores. El rollback restaura únicamente
la unidad, el catálogo y los manifiestos correspondientes; no usa operaciones
Git destructivas ni borra trabajo preexistente.
