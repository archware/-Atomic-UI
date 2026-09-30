---
title: "ADN Atomic: preservación visual y catálogos"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-09-28"
last_updated: "2026-09-28"
document_type: "roadmap"
status: "en curso"
asignacion: "ATOMIC-20260928-001"
change_id: "ATOMIC-20260928-001"
version: "1.0.0"
---

# ATOMIC-20260928-001 — ADN Atomic: preservación visual y catálogos

## Encuadre y línea base

main / 98cc215757a03787371fa7cdf2dcd564a2430fef; árbol limpio al abrir (ahead 5 respecto de la referencia local).

Autorización: mejorar doctrina y ADN conservando lo existente. Trabajo serial, sin delegación. Capturas de sondeo y colisión en el temporal de la asignación, anteriores a la implementación. Se ejecutan las fases institucionales manualmente; no se atribuyen al workflow.

## Alcance

Doctrina, contrato de catálogo, detalle semántico, acciones, plantilla CRUD, controles de estilos y preparación de instalación dentro de un monorepo.

Unidades relacionadas: ATOMIC-20260928-001, DOC-20260928-002 y VCXC-20260928-004. Los cambios anteriores, ventas/ventas.pagina.ts, backend, SGP_BE y demás consumidores quedan fuera. No hay commits, push, despliegues, reescritura de historial ni escrituras de datos.

## Tareas

- [x] Precisar promoción no destructiva y patrón visual en la fuente.
- [x] Implementar variantes compatibles y probar contratos de presentación.
- [x] Corregir siete bindings de estilo conservando valores dinámicos.
- [x] Validar auditoría de proyectos bajo raíz Git compartida, con pruebas negativas y sin escrituras.
- [x] Ejecutar compuertas y registrar fallos y límites de cobertura sin publicar.
- [ ] Implementar instalación/CI de monorepos; el modo de auditoría no la sustituye.
- [ ] Hacer que la salida modal-catalog del generador use la plantilla canónica.
- [ ] Completar matriz visual, cerrar deuda global y obtener referencia elegible del Guardián antes de adoptar.

## Aceptación y validación

Preservar contratos públicos y diseño útil. Toda extracción tiene API tipada, estilos externos, tokens y prueba; negocio, HTTP, permisos y DTO permanecen en Ventas. Comparar acciones y ventanas con las referencias del usuario sin volver a formularios deshabilitados. Registrar compuertas omitidas o fallidas, no declarar cobertura global. Comprobar diff, UTF-8, documentación, colisión y sondeo al cierre.

## Publicación y dependencia

Atomic tiene congelamiento de publicación. La propagación exige fuente limpia y OID verificable: no se inventa procedencia ni se altera un hash para instalar trabajo sin confirmar. El Guardián debe revisar y registrar la fuente antes de adoptar el nuevo ADN. Esta dependencia no impide preparar y validar la fuente.

## Rollback

Revertir únicamente los hunks de esta asignación después de revisar su diff; no usar reset, checkout, borrados masivos ni sobrescribir trabajo previo. Antes de una futura propagación, capturar hashes y respaldo recuperable de los destinos, incluyendo pruebas propias. No retirar HTML/CSS local hasta que su sustituto canónico preserve la utilidad y pase las verificaciones.

## Evidencia

Ver [evidencia detallada](../evidencias/ATOMIC-20260928-001.md).
La suite completa termina con 490 pruebas correctas y cuatro fallos de
autenticación reproducidos en archivos sin modificar. Compilación de aplicación,
biblioteca y Storybook correctas; revisión visual de escritorio parcial.
Estilos externos, Signals, selectores y foco pasan. Gobierno global no pasa:
la cadena se detiene en blueprints tras validar gobierno y aplicación generada.
También se registran pendientes de catálogo/API, tokens, tipografía, contraste
y lint. El manifiesto es local, no prueba de publicación.

Estado: fuente candidata revisable; no se declara cierre ni propagación.
