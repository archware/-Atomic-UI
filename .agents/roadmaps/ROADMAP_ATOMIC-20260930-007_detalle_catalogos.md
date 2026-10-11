---
title: "Estándar de visualización de catálogos"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-09-30"
last_updated: "2026-09-30"
document_type: "roadmap"
status: "completado"
version: "1.0.0"
change_id: "ATOMIC-20260930-007"
---

# Estándar de visualización de catálogos

## Alcance y línea base

main, OID 7d9c87bec1e20778515c64e532bad6e7a144637b, árbol limpio al abrir.
Autorización: precisar doctrina/regla de consulta semántica y adopción en
ventas-cxc. Sin cambiar componentes, CSS, tokens, versión, manifiesto de
procedencia, generador ni política instalada. No commit ni publicación;
se conserva el congelamiento. Trabajo serial sin agentes adicionales.
Capturas y copias: C:/Users/cotaha/AppData/Local/Temp/tipos-detalle-1790784823870.

## Tareas y aceptación

- [x] Diferenciar detalle semántico, formulario y confirmación en el contrato.
- [x] Incorporar requisito explícito a la regla de diálogos sin afirmar automatización.
- [x] Validar catálogo y coherencia documental.
- [x] Registrar adopción y límites reales de ventas-cxc.

## Evidencia y límites

catalog:check pasa (43 entradas); node tools/test-atomic-catalog.js pasa:
"Atomic catalog tools: query, context and validation tests passed."
Documentación mediante manifiesto temporal explícito/SkipGit retorna 0;
diff --check acotado retorna 0. Colisión de este reparto retorna 0. El sondeo
conserva rama, HEAD y remotos; registra siete rutas propias y trabajo ajeno
concurrente en el consumidor/backend, no modificado desde este frente.

ventas-cxc reutiliza componentes ya instalados: no hay propagación nueva,
versión ni procedencia certificada. Su regresión Familias/Entidades/Tipos pasa
148 pruebas y su build pasa; suite general, reglas/procedencia y matriz visual
completa siguen pendientes allí. Su API dejó de estar disponible durante la
revisión real; no se declara una certificación visual global.

No se ejecutan pruebas Angular, builds de biblioteca o Storybook de Atomic:
no cambió código de componentes, estilos, tokens ni generador. La regla añadida
se declara review y se valida contra el esquema, no se presenta como guarda
automática. Se mantiene el congelamiento y no se confirma ningún cambio.

## Rollback

Retirar solo los bloques nuevos y la regla añadida, comparando las copias
temporales. No revertir componentes ni cambiar referencias publicadas.
