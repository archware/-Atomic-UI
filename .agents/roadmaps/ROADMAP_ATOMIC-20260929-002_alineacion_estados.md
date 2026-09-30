---
title: "Centrado canónico de estados en las tablas"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-09-29"
last_updated: "2026-09-29"
document_type: "roadmap"
status: "en curso"
version: "1.0.0"
change_id: "ATOMIC-20260929-002"
---

# Alineación de etiquetas desde Atomic

## Alcance y baseline

El dueño aporta una captura de Familias: encabezado de estado centrado y
etiquetas desplazadas al inicio. Atomic y su copia consumida usan align
explícito sin un valor semántico por omisión para las columnas de etiquetas.
Corregir DataTable, sin estilos locales en features ni cambios de colores,
densidad, acciones, diálogos, filtros o negocio. Trabajo serial sin delegación.

Git: main, HEAD 98cc215757a03787371fa7cdf2dcd564a2430fef, ahead 5 local.
56 sucios previos preservados. Capturas de 25 repositorios y colisión en
C:/Users/cotaha/AppData/Local/Temp/atomic-badges-1790682048890.
Inicio posterior: 2026-09-29T06:40:58.8465366-05:00.

## Plan y aceptación

- [x] Reproducir con prueba de regresión: isTag y claves de estado existentes.
- [x] Centralizar detección de etiqueta y alineación efectiva del encabezado/celda.
- [x] Centrar por omisión etiquetas; respetar align explícito y texto ordinario.
- [x] Preservar etiquetas responsive y centrar solo su valor en la tarjeta.
- [x] Ejecutar pruebas, builds y compuertas; separar deuda anterior.
- [x] Actualizar contrato, catálogo, manifiesto, historial y lecciones.
- [x] Verificar custodia y documentar el bloqueo de propagación.
- [ ] Propagar a ventas-cxc únicamente con fuente elegible y revisión del Guardián.

## Dependencia vigente

Los invariantes 14/15 exigen procedencia limpia en un OID recuperable. La fuente
está sucia y el instalador de monorepos sigue siendo solo de auditoría.
El congelamiento impide que este agente confirme/publique para eludirlo.
La preparación en fuente es posible; no se declara adopción ni se cambian
hashes del consumidor para simular procedencia válida.

La preparación en fuente está validada: 40 pruebas de tabla, mediciones en
cuatro anchos y dos temas, prueba negativa y tres builds. Los gates globales
conservan deuda ajena; no se presentan como aprobados. Véanse la
[evidencia](../evidencias/ATOMIC-20260929-002.md) y la
[desviación abierta](../desviaciones/DESVIACION-20260929-002.md).

El dueño confirmó otra sesión trabajando en otro módulo del frontend. Sus
cambios observados en ventas.pagina.ts e icon-button quedan intactos; no se
realizó ninguna escritura en ventas-cxc durante esta unidad.

## Validación y rollback

Contexto compacto: modal-catalog; variante column-alignment existente. No se
genera una pantalla nueva. Pruebas de tabla y geometría, temas, responsive,
regresión negativa, build y gobierno. Registrar límites reales.
Rollback por hunks propios y manifiesto regenerado, sin reset/checkout,
sin sobrescribir las 56 modificaciones previas ni tocar datos.
