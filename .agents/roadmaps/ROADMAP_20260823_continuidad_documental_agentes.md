---
title: "Continuidad documental para agentes de Atomic UI"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-08-23"
last_updated: "2026-08-23"
document_type: "hoja de ruta"
status: "completado"
version: "1.0.0"
change_id: "ECO-20260823-003"
repository: "C:\\Users\\cotaha\\source\\repos\\-Atomic-UI"
baseline_branch: "main"
baseline_oid: "00f440bfdfb7fcf660d08d6a55efffc080cc8e57"
canonical_doctrine: "C:\\Users\\cotaha\\Documents\\Repos2\\DOCTRINA_MAESTRA_UNIFICADA.md"
---

# Continuidad documental para agentes de Atomic UI

## Resultado esperado

La fuente visual canónica dispondrá de una entrada documental que conecte la
doctrina maestra con su gobierno, catálogo, flujo de propagación y deuda real.
El paquete no declarará la versión 6.0.0 como concluida ni reducirá los
controles existentes.

## Baseline y protección del trabajo existente

El cambio se inició en la rama `main`, OID
`00f440bfdfb7fcf660d08d6a55efffc080cc8e57`, con un refactor Atomic amplio ya
presente en el árbol. Todos sus archivos modificados y no rastreados se
consideran preexistentes y quedan fuera de esta intervención documental.

## Alcance

- [x] Ampliar `AGENTS.md` y conservar íntegramente el gobierno Atomic-first.
- [x] Crear `docs/CONTINUIDAD_AGENTES.md` con arquitectura, lectura, deuda,
      compuertas, propagación, terminado y rollback.
- [x] Actualizar `LESSONS_LEARNED.md` como índice superior sin borrar lecciones.
- [x] Registrar `ECO-20260823-003` en `CHANGELOG.md`.
- [x] Documentar como deuda pendiente medidas rígidas, Tailwind, 16 aliases
      `prest-*`, colisiones de selectores, generador y cambio de versión.
- [x] Verificar enlaces, metadatos, terminología y `git diff --check`.
- [x] Cerrar esta hoja de ruta con evidencia verificable.

## Exclusiones

No se modificará código, catálogo, distribución, manifiestos, configuración,
dependencias, archivos de bloqueo, pruebas ni versión del paquete. No se
propagará contenido a consumidores ni se ejecutarán publicaciones.

## Criterios de aceptación

1. El manual declara que la versión 6.0.0 permanece pendiente.
2. La deuda enumera sin ambigüedad las seis familias exigidas por la doctrina.
3. La definición de terminado exige catálogo, compuertas, pruebas, build,
   manifiesto y propagación controlada antes de declarar cumplimiento.
4. Todos los enlaces documentales creados resuelven.

## Rollback

La reversión retirará solo los documentos y secciones identificados por
`ECO-20260823-003`, sin tocar el refactor Atomic preexistente.

## Evidencia de cierre

- La compuerta central de documentación aprobó los cinco archivos obligatorios,
  `ECO-20260823-003`, referencias normativas y estado del roadmap.
- Se resolvieron 35 enlaces Markdown del paquete sin destinos faltantes.
- La revisión confirmó frontmatter completo, cero usos del término institucional
  prohibido y redacción impersonal en el contenido incorporado.
- `git diff --check` finalizó con código 0. El árbol conserva el refactor Atomic
  preexistente; este paquete modificó únicamente Markdown.
- No se repitieron compuertas Angular por tratarse de documentación sin cambios
  de código, catálogo, distribución, manifiestos, dependencias o locks.
- La versión permanece en 5.22.0 y la hoja 6.0.0 continúa abierta por las seis
  familias de deuda declaradas. No se publicó ni propagó contenido.
