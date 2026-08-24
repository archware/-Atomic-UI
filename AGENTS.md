---
title: "Reglas obligatorias del repositorio Atomic UI"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-08-23"
last_updated: "2026-08-23"
document_type: "instrucción para agentes"
status: "vigente"
version: "1.0.0"
canonical_doctrine: "C:\\Users\\cotaha\\Documents\\Repos2\\DOCTRINA_MAESTRA_UNIFICADA.md"
document_standard: "C:\\Users\\cotaha\\Documents\\Repos2\\ESTANDAR_DOCUMENTAL_AGENTES.md"
continuity_document: "docs/CONTINUIDAD_AGENTES.md"
---

# Reglas obligatorias del repositorio Atomic UI

> `ATOMIC_GOVERNANCE_REQUIRED`

## Jerarquía documental y continuidad

Antes de cualquier auditoría o modificación se deben leer, en este orden:

1. las restricciones de sistema, seguridad y autorización de la sesión;
2. la [doctrina maestra unificada](C:/Users/cotaha/Documents/Repos2/DOCTRINA_MAESTRA_UNIFICADA.md),
   ubicada en
   `C:\Users\cotaha\Documents\Repos2\DOCTRINA_MAESTRA_UNIFICADA.md`;
3. el [estándar documental para continuidad de agentes](C:/Users/cotaha/Documents/Repos2/ESTANDAR_DOCUMENTAL_AGENTES.md),
   ubicado en
   `C:\Users\cotaha\Documents\Repos2\ESTANDAR_DOCUMENTAL_AGENTES.md`;
4. los `AGENTS.md` de la raíz y del presente repositorio;
5. [Continuidad para agentes](./docs/CONTINUIDAD_AGENTES.md);
6. el gobierno, el flujo del ecosistema, la doctrina de interfaz, la guía o
   habilidad aplicable y el roadmap activo.

La doctrina maestra prevalece y la política Atomic puede añadir compuertas más
estrictas. La línea 6.0.0 permanece en desarrollo: los cortes completados de
Signals y estilos externos no autorizan a declarar cerradas las medidas
rígidas, Tailwind, aliases `prest-*`, colisiones, generador o versión.

Este repositorio es la única fuente de verdad visual del ecosistema. Antes de
trabajar, leer `governance/consumer/ATOMIC_GOVERNANCE.md`,
`ECOSYSTEM_WORKFLOW.md` y la guía aplicable de `.agents/workflows/`.

**Para subir un consumidor a la línea 5.22 y a la política 1.2.2, se empieza por
`governance/consumer/MIGRAR_A_5.22.md`.** No describe cada paso —esos se deducen
leyendo el gate— sino las trampas, que son las que cuestan una tarde cada una:
que el código y la política van soldados, que los `.spec.ts` no pueden ser
`exact` entre Karma y Vitest, y que propagar sin mirar sobrescribe la cobertura
propia del consumidor.

## Ley Atomic-first

- Todo átomo, molécula, organismo, superficie, plantilla, token o patrón visual
  reutilizable se crea, corrige, prueba y documenta aquí antes de propagarse.
- Un hallazgo en un consumidor debe retroalimentar primero esta fuente. Nunca se
  acepta que el consumidor se convierta en origen visual.
- Los componentes usan tokens, API tipada, OnPush, accesibilidad y pruebas.
- Cada cambio propagable actualiza el barrel, pruebas, changelog y documentación.
- La política canónica vive en `governance/consumer`; los consumidores no pueden
  modificar sus copias para eludirla.
- Antes de entregar, ejecutar `npm run governance:check`, pruebas y build.

La lógica de negocio, permisos, DTO, endpoints y estado específico no pertenece
al ADN visual y debe permanecer en cada aplicación consumidora.

## Cómo se hace una pantalla, no solo con qué

**Antes de construir o modificar cualquier pantalla, lee
`DOCTRINA_DE_INTERFAZ.md`.** Son quince reglas con el daño que evita cada una,
sacadas de auditar un producto de cobranzas en producción y contrastadas contra
su código: solo entraron las que ese front ya cumple **en parte**, porque una
regla que nadie cumple suele ser una invención.

El catálogo te dice qué componente usar. Esa doctrina te dice por qué «cargando»
y «vacío» no pueden compartir texto, por qué una negativa no debe moverte de
sitio, por qué rechazar una entrada obliga a borrar la anterior, y por qué
`opacity` está prohibida para comunicar un estado apagado.

## Ejecución eficiente de solicitudes UI

- Para crear o evolucionar un CRUD, formulario, listado, detalle, dashboard o
  flujo transaccional, usar la skill local
  `.agents/skills/atomic-ui-builder/SKILL.md`.
- Consultar primero `npm run agent:context -- --intent <intencion>`; no cargar
  el inventario ni las guías completas si el contexto compacto resuelve la
  decisión.
- Seleccionar únicamente componentes y variantes declarados en `catalog/`.
  Una variante faltante se implementa y valida aquí antes de ser consumida.
- Generar primero con
  `npm run generate:ui -- --spec <archivo> --output <consumidor> --dry-run` y
  revisar el plan antes de escribir.
- El modo integrado exige endpoint, método y contrato explícitos. Si faltan, la
  salida debe ser `ui-only` y no puede simular una integración real.
- La arquitectura, los límites y la definición de terminado están en
  `docs/ATOMIC_UI_AGENT_RUNTIME.md`.

## Ciclo documental obligatorio

1. Antes de editar se crea o actualiza una hoja de ruta bajo
   `.agents/roadmaps/` con identificador, baseline, alcance, exclusiones,
   aceptación, validación y rollback.
2. La unidad se implementa primero en esta fuente, se cataloga, prueba y valida;
   después se propaga con procedencia exacta o adaptación decidida.
3. Al cerrar se actualizan `CHANGELOG.md`,
   [LESSONS_LEARNED.md](./LESSONS_LEARNED.md), el manifiesto y la documentación
   que realmente haya cambiado.
4. Se ejecutan las compuertas de
   [Continuidad para agentes](./docs/CONTINUIDAD_AGENTES.md), se revisa el diff
   completo y se registra el estado Git exacto.

No se declara una versión, publicación o propagación terminada con tareas
abiertas, manifiestos divergentes, compuertas omitidas o consumidores sin
validación.
