---
title: "Corrección del presupuesto de altura y texto del selector, calendario sin submit implícito y navegación estable"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-10-01"
last_updated: "2026-10-01"
document_type: "roadmap de implementación"
status: "en revisión"
version: "1.0.0"
change_id: "ATOMIC-20261001-002"
---

# ATOMIC-20261001-002: calendario selector

## Alcance y línea base

Corrección del presupuesto de altura y texto del selector, calendario sin submit implícito y navegación estable. Sin reglas financieras en ADN. Adopción candidata local en Ventas por el encargo del dueño; no publicación ni certificación global.

OID inicial 7d9c87bec1e20778515c64e532bad6e7a144637b. Rama main.
Sondeo: 25 repositorios, cero avisos; repartos disjuntos capturados antes de editar.
Raíz Git de Ventas: C:/Users/cotaha/source/repos, prefijo ventas-cxc/;
Atomic y backend tienen raíz propia. Capturas, repartos exactos y copias iniciales:
C:/Users/cotaha/AppData/Local/Temp/ventas-credito-3b9541ca-9e40-4945-9ca1-369de30d510b.
445 archivos sucios en raíz, 21 en Atomic y 28 en backend, preservados.
Sin delegación, commits, reinicios del servidor del dueño o escrituras reales.

## Tareas y aceptación

- [x] Reproducir tres defectos de calendario antes de corregir: mes, bloqueo y submit.
- [x] Corregir desde el ADN y validar 17 pruebas de Datepicker/Select2.
- [x] Compilar y actualizar catálogo, continuidad y lecciones.
- [x] Sondeo, revisión de diff y rollback documentado.
- [ ] Validar visualmente etiquetas largas y calendario en consumidor, ambos temas y móvil.
- [ ] Resolver gobierno global antes de publicar una versión del ADN.

## Evidencia de entrega

Build pasa con aviso de presupuesto inicial (1,25 MB frente a 1,20 MB).
governance:test pasa; governance:smoke falla porque inventario y manifiesto no
coinciden. No se reescriben hashes para ocultarlo. No hay publicación ni commit.
La adopción local de Ventas conserva su posición fixed de Select2 y solo toma
bloques compatibles. El navegador no permitió completar la comprobación visual.
Sondeo conserva ramas/OID/remotos. Colisión señala tres logs desaparecidos fuera
del reparto (build-angular21.log, ng-serve.err.log, ng-serve.out.log); no fueron
eliminados por este corte y no se restauran. Diff --check de nueve rutas pasa.

## Rollback

Retirar solo bloques de este corte comparados con las copias previas. No
restaurar archivos completos desde HEAD ni sobrescribir cambios posteriores.
No hay cambios de esquema ni datos reales que revertir. No falsificar hashes
de procedencia para ocultar deuda global; registrar adopción candidata.
