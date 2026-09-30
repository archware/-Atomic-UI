---
title: "Acción contextual de estado y guardado con cambios"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-09-29"
last_updated: "2026-09-29"
document_type: "roadmap"
version: "1.0.0"
status: "en curso"
change_id: "ATOMIC-20260929-003"
---

# ATOMIC-20260929-003: acción contextual de estado

## Alcance y línea base

- Rama main; HEAD 98cc215757a03787371fa7cdf2dcd564a2430fef. Árbol con trabajo previo conservado.
- Captura inicial y reparto serial: C:/Users/cotaha/AppData/Local/Temp/acciones-contextuales-1790731773939. Sin delegación.
- Raíz Git C:/Users/cotaha/source/repos/-Atomic-UI. Extensión compatible de TableAction y PaginaCrud; sin CSS nuevo ni dominio dentro del ADN.
- No commits, publicación, cambios de dependencias ni escrituras en bases reales.

## Plan y aceptación

1. Reutilizar la tercera acción: Desactivar (papelera roja) / Activar (círculo con marca verde); conservar Ver y Editar.
2. Resolver estado y permisos en consumidor, presentación en Atomic. Una confirmación; no abrir editor ni guardar campos con ella.
3. Guardar solo si hay datos válidos y cambios reales; impedir envío programático sin cambios. Compatibilidad por defecto en Atomic.
4. Probar selección por fila, inactivos reactivables, cancelar, error, carga, doble envío y reversión de campos. Retirar el toggle de edición después de comprobar la vía en grilla.
5. Validar catálogo, pruebas, builds, compuertas, diff, codificación, documentación y cierre de sondeo. Separar deuda previa.

## Procedencia y límites

Fuente Atomic candidata sin confirmar y congelada para publicación. Solicitada autorización para adopción local acotada; pendiente de respuesta. No propagar hasta resolverla. No modificar manifiestos, hashes ni verificadores para fingir publicación o compuertas verdes.

## Evidencia

Capacidad canónica candidata implementada: mapeo explícito de Activar en perfil
catalog; input guardarHabilitado, bloqueo de evento y botón; catálogo, pruebas
y contrato actualizados. Sin CSS nuevo. La selección por estado y comparación
de campos permanecen pendientes en el consumidor, no se introdujeron al ADN.

| Comprobación | Resultado de esta corrida |
| --- | --- |
| Pruebas focalizadas TableAction/PaginaCrud | TOTAL: 15 SUCCESS |
| Prueba negativa de Guardar | Sin guarda: TOTAL: 1 FAILED, 8 SUCCESS; Expected spy guardar not to have been called. Guarda restaurada; suite posterior confirma los componentes. |
| Suite Angular completa | TOTAL: 4 FAILED, 509 SUCCESS; cuatro fallos authInterceptor preexistentes. Aislados: 4 FAILED, 3 SUCCESS. |
| catalog:check / tooling:test | Catálogo Atomic v1 válido: entries=43; tooling termina en 0. |
| check:catalog-api | Rechaza nueve entradas no documentadas de Input y Topbar; fuera del cambio. |
| tokens:check | valid=false; tres tokens ausentes en accordion/layout-shell, ajenos al cambio. |
| build / lib:build | Correctos. Build advierte presupuesto inicial 1.20 MB frente a 1.25 MB. |
| lint global | 33 problems (10 errors, 23 warnings), errores ajenos a esta unidad. |
| lint del alcance | 0 errors, 1 warning; any predeterminado de PaginaCrud ya existente. |
| build-storybook | Storybook build completed successfully. Artefacto documentation.json restituido al contenido inicial limpio, sin cambios en fuentes. |
| governance:check | Pruebas de gobierno y generador pasan; la cadena se detiene en blueprints: wizard sin OnPush, estilos/tipos imperativos y roots forgot-password/register ausentes. Deuda ajena preservada. |
| compuertas.ps1 completo | 14 ejecutadas: 10 pasan; fallan documentación, canalizaciones, autoverificación de compuertas y secretos en el ecosistema. No se declara cobertura global verde. |
| package:manifest / package:check | Inventario regenerado; 319 fuentes verificadas. No constituye publicación ni procedencia del consumidor. |
| Documentación temporal explícita | Atomic aprobado, cero fallos; Ventas seis fallos preexistentes de espacios. No acredita cobertura central ni cierre de este roadmap. |
| Codificación acotada | 150 faltas de tildes en entradas históricas existentes de CHANGELOG/LESSONS; sin errores UTF-8. |
| git diff --check del alcance | Correcto; preserva deuda fuera del alcance. |
| Colisión Atomic | Reparto disjunto y nadie se salió del suyo. |

Evidencia literal en los logs del temporal indicado. Generador --dry-run rechaza
sobrescribir Tipos, como corresponde; no se realizó generación. Contrato
documenta la matriz visual, que no se certifica por pruebas DOM ni builds.
Pendientes: resolver deuda de gobierno en su asignación correspondiente,
revisión visual y adopción expresa en Ventas. Desviación abierta:
[ATOMIC-20260929-003](../desviaciones/DESVIACION_ATOMIC-20260929-003.md).

El sondeo descubre cambios concurrentes fuera del alcance en ventas.facade.ts,
DTO de Ventas backend y archivos de diagnóstico; registrados en la desviación
006 del consumidor, con los detalles de las capturas inicial y final.
No cambiaron ramas, HEAD ni remotos. No se declara cierre global.

## Rollback

Revertir únicamente los hunks de esta asignación, comparados con la captura inicial y el diff revisado. Nunca descartar el árbol completo ni trabajo previo. Mantener la reactivación accesible si se revierte el editor.

El reparto se amplía antes de regenerar distribution/atomic-source-manifest.json mediante package:manifest. Es el inventario real de fuentes candidatas, no la procedencia publicada del consumidor. No se toca atomicRef ni su verificador.
