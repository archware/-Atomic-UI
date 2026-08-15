# Reglas obligatorias del repositorio Atomic UI

> `ATOMIC_GOVERNANCE_REQUIRED`

Este repositorio es la única fuente de verdad visual del ecosistema. Antes de
trabajar, leer `governance/consumer/ATOMIC_GOVERNANCE.md`,
`ECOSYSTEM_WORKFLOW.md` y la guía aplicable de `.agent/workflows/`.

**Si vienes a subir un consumidor a 5.7 y a la política 1.2.2, empieza por
`governance/consumer/MIGRAR_A_5.7.md`.** No describe los pasos —esos se deducen
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
`DOCTRINA_DE_INTERFAZ.md`.** Son ocho reglas con el daño que evita cada una,
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
