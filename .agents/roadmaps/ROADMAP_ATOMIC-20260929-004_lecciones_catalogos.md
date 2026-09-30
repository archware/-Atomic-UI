---
title: "Lecciones de catálogos y cierre explícito"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-09-29"
last_updated: "2026-09-29"
document_type: "roadmap"
status: "en revisión"
change_id: "ATOMIC-20260929-004"
version: "1.0.0"
---

# Lecciones de catálogos

## Alcance y baseline

Solicitud expresa del dueño: actualizar doctrinas Atomic y aplicar mejoras a Familias. Serial, sin delegación. Rama main, OID 98cc215757a03787371fa7cdf2dcd564a2430fef; cambios candidatos previos preservados. Capturas y reparto: C:/Users/cotaha/AppData/Local/Temp/familias-mejoras-1790735418484.

## Plan y aceptación

- [x] Alinear contrato, doctrina de interfaz, instrucciones, runtime, guía, skill, flujo, reglas UX, continuidad y lecciones: tercera acción contextual; editor sin estado; Guardar por cambios reales; recarga independiente; adopción no equivale a publicación.
- [x] Añadir entrada bloquearCierre a PaginaCrud como guarda visual adicional, sin reglas de dominio. Probarla y catalogarla antes de consumir.
- [x] Comprobar catálogo, herramientas, pruebas focalizadas, build y documentación; registrar deuda previa separada.
- [x] Registrar adopción local autorizada en Entidades/Tipos y ahora Familias, sin declarar propagación general certificada.

## Exclusiones

No reescribir política de consumo instalada, versiones, dependencias, diseño, generador ni módulos ajenos. No confirmar/publicar: congelamiento vigente. Las reglas UX declaran revisión/pruebas, no se presentan como nuevas guardas universales del generador.

## Rollback y evidencia

Implementación local candidata a revisión. Restaurar solo el delta propio desde
respaldos revisados. No revertir candidatos previos. La entrada adicional no
cambia el comportamiento predeterminado; la fuente conserva su protección busy.
Manifiesto regenerado mediante package:manifest (319 fuentes); no se toca
procedencia del consumidor para ocultar deuda.

## Evidencia de cierre y deuda

El reparto añade pagina-crud.html, respaldado antes de editar, para enlazar la
guarda a disabled de X y Cancelar en la fuente. Sin cambio de estructura o CSS;
las pruebas comprueban ambos atributos además de Escape/cierre programático.

- PaginaCrud/SummaryList: 13/13. Negativa: retirar la guarda bloquearCierre
  provoca 1 fallo de 10; restaurarla recupera 13/13.
- Build de aplicación y biblioteca pasan; catálogo estructural y tooling pasan.
  Package:check verifica 319 fuentes. Signals, estilos externos, selectores,
  valores CSS, tokens Dart y foco pasan.
- Governance:test pasa. Governance:smoke inicial falla por manifiesto anterior;
  tras regeneración oficial se repite sin esa divergencia. Las compuertas
  siguientes se ejecutan también por separado, sin ocultar el corte de la cadena.
- Suite global: 510 pasan, 4 fallan en autenticación. Lint: 10 errores, 23 avisos.
  Catálogo/API: nueve entradas sin documentar en Input/Topbar; tokens: tres
  ausentes; tipografía: un peso; contraste: tres fallos. Ninguno en el input nuevo.
- Dry-run del fixture modal-catalog pasa sin escribir. Enumera composición
  heredada de relationship; no se usa para sobrescribir Familias ni se afirma
  soporte automático de todo el flujo contextual.
- Skill validada con quick_validate.py; reglas UX nuevas declaran review, no
  una guarda universal automatizada. Documentos locales: 20 revisados entre
  fuente/consumidor, sin enlaces rotos. Diff --check propio pasa.
- No se vuelve a construir Storybook: no hay cambios de estilos, slots o
  historias en la fuente de esta unidad; la nueva guarda se verifica en Chrome
  Headless y consumidor. No acreditar matriz visual completa ni release.
- Sin npm ci por sesiones activas. No publicar ni confirmar; política instalada
  sigue 1.2.2, fuente 1.2.3. El ADN tiene una adopción local autorizada y parcial,
  no propagación certificada ni cierre de Atomic 6.0.
