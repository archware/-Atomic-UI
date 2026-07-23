# Reglas obligatorias del repositorio Atomic UI

> `ATOMIC_GOVERNANCE_REQUIRED`

Este repositorio es la única fuente de verdad visual del ecosistema. Antes de
trabajar, leer `governance/consumer/ATOMIC_GOVERNANCE.md`,
`ECOSYSTEM_WORKFLOW.md` y la guía aplicable de `.agent/workflows/`.

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
