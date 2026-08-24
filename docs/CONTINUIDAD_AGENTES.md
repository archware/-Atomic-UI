---
title: "Continuidad para agentes de Atomic UI"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-08-23"
last_updated: "2026-08-23"
document_type: "manual de continuidad"
status: "vigente"
version: "1.0.0"
change_id: "ECO-20260823-003"
canonical_doctrine: "C:\\Users\\cotaha\\Documents\\Repos2\\DOCTRINA_MAESTRA_UNIFICADA.md"
document_standard: "C:\\Users\\cotaha\\Documents\\Repos2\\ESTANDAR_DOCUMENTAL_AGENTES.md"
---

# Continuidad para agentes de Atomic UI

## Propósito y límites

`-Atomic-UI` es la única fuente visual canónica del ecosistema. Contiene tokens,
componentes, catálogo, generador, política de consumo, biblioteca y contrato de
distribución. Los consumidores conservan navegación, permisos, contratos API o
IPC, estado y reglas de negocio; esas responsabilidades no se trasladan al ADN
visual.

La autoridad superior es la
[Doctrina maestra unificada](C:/Users/cotaha/Documents/Repos2/DOCTRINA_MAESTRA_UNIFICADA.md),
ubicada en
`C:\Users\cotaha\Documents\Repos2\DOCTRINA_MAESTRA_UNIFICADA.md`. El paquete
documental se rige por el
[Estándar documental para continuidad de agentes](C:/Users/cotaha/Documents/Repos2/ESTANDAR_DOCUMENTAL_AGENTES.md),
ubicado en
`C:\Users\cotaha\Documents\Repos2\ESTANDAR_DOCUMENTAL_AGENTES.md`.
El trabajo se asigna mediante el
[Prompt maestro para continuidad de agentes](C:/Users/cotaha/Documents/Repos2/PROMPT_MAESTRO_CONTINUIDAD_AGENTES.md),
ubicado en
`C:\Users\cotaha\Documents\Repos2\PROMPT_MAESTRO_CONTINUIDAD_AGENTES.md`.

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
- La biblioteca `@hra/atomic-ui` es el destino estable de distribución; un
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

La versión 6.0.0 no está completada. Permanecen abiertas estas familias:

1. medidas rígidas: una búsqueda de la instantánea encontró 351 líneas con
   `px` en 79 archivos de `src/app/shared/ui`;
2. Tailwind: dependencias, configuración, directivas globales y documentación
   todavía forman parte del árbol y deben retirarse sin degradar consumidores;
3. aliases: permanecen 16 declaraciones de selector que incluyen `prest-*`;
4. colisiones: `app-input` y `app-select` requieren una implementación pública
   inequívoca y pruebas de resolución de catálogo y barrel;
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
