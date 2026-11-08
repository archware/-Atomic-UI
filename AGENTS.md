---
title: "Reglas obligatorias del repositorio Atomic UI"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-08-23"
last_updated: "2026-11-04"
document_type: "instrucción para agentes"
status: "vigente"
version: "1.4.2"
change_id: "ATOMIC-20261104-001"
canonical_doctrine: "C:\\Users\\cotaha\\source\\repos\\.agent\\doctrinas\\DOCTRINA_MAESTRA_UNIFICADA.md"
document_standard: "C:\\Users\\cotaha\\source\\repos\\.agent\\doctrinas\\ESTANDAR_DOCUMENTAL_AGENTES.md"
continuity_document: "docs/CONTINUIDAD_AGENTES.md"
---

## Consulta semántica de catálogos

Reutilizar la experiencia no copia contrato ni seguridad: exigir la matriz de operaciones del consumidor conforme a la maestra vigente, apartado 1.10, y al [contrato de catálogos](docs/CONTRATO_CATALOGOS_CRUD.md). Atomic acredita presentación e intenciones; no endpoints, pertenencia ni éxito de negocio. El [contrato de catálogos](docs/CONTRATO_CATALOGOS_CRUD.md) distingue consulta, edición y confirmación. Consultar usa `SummaryList detail` dentro del chasis existente, sin formulario deshabilitado. La regla `readonly-detail-content` requiere revisión y pruebas del consumidor.

## CONGELAMIENTO DE PUBLICACIÓN — vigente desde 2026-08-26

**Ningún agente puede ejecutar `git commit`, `git push`, `git reset` ni `git checkout` sobre este repositorio.** Deja los cambios en el árbol de trabajo y repórtalos; quien confirma y publica es el Guardián del Repositorio, que revisa antes.

POR QUÉ EXISTE ESTA TRABA: El historial de este repositorio se reescribió para erradicar una credencial de administrador publicada en commits históricos, y dos veces agentes concurrentes devolvieron la credencial al remoto al confirmar por su cuenta. Además, dejar cambios sin confirmar en `governance/consumer/` o `src/app/shared/ui/` invalida `atomicRef` en `check:atomic` de los consumidores.

QUÉ SÍ PUEDES HACER: leer, compilar, ejecutar pruebas y escribir en el árbol de trabajo cuando tu asignación lo autorice expresamente. Si tu tarea requiere certificar `atomicRef` con un commit local, solicita autorización explícita del dueño/Guardián.

# Reglas obligatorias del repositorio Atomic UI

> `ATOMIC_GOVERNANCE_REQUIRED`

## Lectura acotada por defecto y jerarquía documental

Para evitar saturación de contexto en rutas `rapida` y `estandar`, aplique lectura acotada por defecto:

1. Lea la [Guía rápida para agentes con contexto reducido](../.agent/guias/GUIA_RAPIDA_AGENTES_BAJO_CONTEXTO.md), el `AGENTS.md` de la raíz y este `AGENTS.md`.
2. Lea [`docs/CONTINUIDAD_AGENTES.md`](./docs/CONTINUIDAD_AGENTES.md) (arquitectura en la parte superior y ventana deslizante de 3 cortes recientes; los cortes anteriores viven en [`docs/BITACORA_CONTINUIDAD_CORTES_HISTORICOS.md`](./docs/BITACORA_CONTINUIDAD_CORTES_HISTORICOS.md)).
3. Lea únicamente el roadmap activo del frente y las primeras 80 líneas de `CHANGELOG.md` y [`LESSONS_LEARNED.md`](./LESSONS_LEARNED.md).
4. Consulte bajo demanda la [doctrina maestra unificada](C:/Users/cotaha/source/repos/.agent/doctrinas/DOCTRINA_MAESTRA_UNIFICADA.md), el [estándar documental para continuidad de agentes](C:/Users/cotaha/source/repos/.agent/doctrinas/ESTANDAR_DOCUMENTAL_AGENTES.md), `governance/consumer/ATOMIC_GOVERNANCE.md`, `ECOSYSTEM_WORKFLOW.md` y `governance/consumer/MIGRAR_A_5.22.md`.

La doctrina maestra prevalece y la política Atomic puede añadir compuertas más estrictas. La línea 6.0.0 permanece en desarrollo.

## Ley Atomic-first y presupuesto de acciones

- **Presupuesto de acciones de catálogo (`ACC-20261022-001`):** El estándar físico de `PaginaCrud` es Ver, Editar y Más acciones. `ActionGroup` conserva `maxVisible` genérico para acciones directas, pero `PaginaCrud` deja en el menú toda acción que no sea Ver o Editar. Una tercera directa contextual requiere `accionDirectaContextual` con `idAccion`, `justificacion` y `evidencia` no vacíos; nunca promueve `isMenuOnly`, `delete`, `deactivate`, `reverse` ni `danger`. Leer [Contrato de catálogos y promoción compatible](./docs/CONTRATO_CATALOGOS_CRUD.md).
- Todo átomo, molécula, organismo, superficie, plantilla, token o patrón visual reutilizable se crea, corrige, prueba y documenta aquí antes de propagarse.
- Los componentes usan tokens, API tipada (`input()`/`output()`), `OnPush`, hojas de estilo externas, accesibilidad y pruebas.
- **Desplazamiento gobernado por `<app-scroll-overlay>` y prohibición de controles nativos crudos:** Todo contenedor, diálogo (`ModalComponent`, `ModalContainerComponent`, `PopupContainerComponent`), listado de archivos (`FileInputComponent`), desplegable de notificaciones o región desplazable en componentes, blueprints y vistas consumidoras debe envolverse en `<app-scroll-overlay class="so-block" ...>` (con `[maxBodyHeight]` o contenedor flex acotado con `min-height: 0`). Queda terminantemente prohibido declarar desplazamiento nativo (`overflow-y: auto|scroll`, `overflow-x: auto|scroll`, `overflow: auto|scroll`, `::-webkit-scrollbar`) o utilizar controles HTML crudos (`<button>`, `<input>`, `<select>`, `<textarea>`, `<table>`, `<dialog>`, `<progress>`, `<meter>`) en vistas, blueprints o features.
- Cada cambio propagable actualiza el barrel, pruebas, changelog y documentación.
- Antes de entregar cambios de componentes, ejecutar `npm run governance:check`, pruebas y build.
- La lógica de negocio, permisos, DTO, endpoints y estado específico no pertenecen al ADN visual y permanecen en cada aplicación consumidora.

## Cómo se hace una pantalla y ejecución eficiente

- Antes de construir o modificar una pantalla, consulte `DOCTRINA_DE_INTERFAZ.md`.
- Para crear o evolucionar vistas, use `.agents/skills/atomic-ui-builder/SKILL.md` y consulte primero `npm run agent:context -- --intent <intencion>`.
- Seleccione únicamente componentes y variantes declarados en `catalog/`.
- Genere primero con `npm run generate:ui -- --spec <archivo> --output <consumidor> --dry-run`. La arquitectura y definición de terminado están en `docs/ATOMIC_UI_AGENT_RUNTIME.md`.

## Ciclo documental obligatorio

1. Antes de editar se crea o actualiza una hoja de ruta bajo `.agent/roadmaps/` o `.agents/roadmaps/` con identificador, baseline, alcance, exclusiones, aceptación, validación y rollback.
2. La unidad se implementa primero en esta fuente, se cataloga, prueba y valida; después se propaga con procedencia exacta o adaptación decidida.
3. Al cerrar se actualizan `CHANGELOG.md`, [`LESSONS_LEARNED.md`](./LESSONS_LEARNED.md), el manifiesto y [`docs/CONTINUIDAD_AGENTES.md`](./docs/CONTINUIDAD_AGENTES.md) (manteniendo la ventana deslizante de 3 cortes).
4. Se ejecutan las compuertas de [`docs/CONTINUIDAD_AGENTES.md`](./docs/CONTINUIDAD_AGENTES.md), se revisa el diff completo y se registra el estado Git exacto.
