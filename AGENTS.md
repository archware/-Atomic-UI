---
title: "Reglas obligatorias del repositorio Atomic UI"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-08-23"
last_updated: "2026-09-29"
document_type: "instrucción para agentes"
status: "vigente"
version: "1.0.0"
canonical_doctrine: "C:\\Users\\cotaha\\Documents\\Repos2\\DOCTRINA_MAESTRA_UNIFICADA.md"
document_standard: "C:\\Users\\cotaha\\Documents\\Repos2\\ESTANDAR_DOCUMENTAL_AGENTES.md"
continuity_document: "docs/CONTINUIDAD_AGENTES.md"
---

## CONGELAMIENTO DE PUBLICACIÓN — vigente desde 2026-08-26

**Ningún agente puede ejecutar `git commit`, `git push`, `git reset` ni
`git checkout` sobre este repositorio.** Deja los cambios en el árbol de
trabajo y repórtalos; quien confirma y publica es el Guardián del Repositorio,
que revisa antes.

POR QUÉ EXISTE ESTA TRABA, con nombres y fechas. El historial de este repositorio
se reescribió para erradicar la credencial de administrador de un servidor Azure
SQL que vivía en 48 commits ya publicados. **Dos veces** un agente confirmó y
publicó por su cuenta mientras la reescritura estaba en curso, y **las dos veces
devolvió la credencial al remoto**: el recuento pasó de 146 commits limpios a
226 con la fuga viva. También se confirmaron 110 026 líneas de artefactos `obj/`
y `bin/`, y un bloque entero de código de producción que nadie había encargado.

Ninguno de esos agentes actuó de mala fe. El problema no es el criterio, es la
concurrencia: varios agentes escribiendo y publicando sobre la misma rama
mientras se reescribe el historial debajo produce un estado que nadie eligió y
que solo se detecta clonando el remoto y contando secretos a mano.

QUÉ SÍ PUEDES HACER: leer, compilar, ejecutar pruebas, y escribir en el árbol de
trabajo. Si tu tarea parece exigir un commit, no lo hagas: describe en tu informe
qué confirmarías y por qué, y deja los ficheros donde están.

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

**Para preparar un consumidor para la línea 5.22 y la política 1.2.3, se empieza por
`governance/consumer/MIGRAR_A_5.22.md`.** No describe cada paso —esos se deducen
leyendo el gate— sino las trampas, que son las que cuestan una tarde cada una:
que el código y la política van soldados, que los `.spec.ts` no pueden ser
`exact` entre Karma y Vitest, y que propagar sin mirar sobrescribe la cobertura
propia del consumidor.

## Ley Atomic-first

El corte ATOMIC-20260929-004 concreta las lecciones de Familias en el contrato
canónico: tres acciones, un flujo por intención, Guardar por cambios reales y
recarga independiente. La adopción local expresamente autorizada en ventas-cxc
no acredita publicación ni elimina las compuertas de fuente/consumidor.

Leer también [Contrato de catálogos y promoción compatible](./docs/CONTRATO_CATALOGOS_CRUD.md).
Antes de retirar HTML/CSS visual de una feature, trasladar su diseño útil al
ADN y demostrar equivalencia. No sustituir una plantilla canónica por una
composición libre ni confundir mejora funcional con rediseño autorizado.

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
`DOCTRINA_DE_INTERFAZ.md`.** Contiene reglas con el daño que evita cada una,
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
