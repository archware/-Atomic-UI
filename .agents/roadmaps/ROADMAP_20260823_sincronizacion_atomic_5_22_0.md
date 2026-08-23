---
title: "Sincronización gobernada de Atomic UI 5.22.0"
subtitle: "Reconciliación de la fuente canónica y adopción verificable en los consumidores HRA"
document_type: "hoja de ruta técnica"
status: "En ejecución"
date: "2026-08-23"
last_updated: "2026-08-23"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
owner: "Hospital Regional de Ayacucho"
change_id: "ATOMIC-5-22-0-SYNC-20260823"
---

# Sincronización gobernada de Atomic UI 5.22.0

## Objetivo

Se reconciliará la rama local de Atomic UI con el commit canónico publicado
`2b87262ef6d9efb9e839b6073a607739d7357e15`, correspondiente a la versión
`5.22.0`, sin perder las tres mejoras locales de gobierno posteriores al punto
de divergencia `673f69b4b81a624e2a24d4b009672ccc6643e0d6`. Después se adoptará la
fuente reconciliada y la política `1.2.2` en los cinco consumidores mediante el
instalador oficial. No se editarán referencias ni huellas de procedencia a mano.

## Motivo del cambio de objetivo

La auditoría inicial evaluó el `HEAD` local `e37d09e`, versión `5.8.4`. Después
de actualizar únicamente las referencias remotas se comprobó que ese commit no
estaba publicado, que la rama local estaba tres commits por delante y dieciocho
por detrás de `origin/main`, y que la fuente recuperable por CI ya correspondía
a Atomic UI `5.22.0`. Fijar consumidores a `e37d09e` habría creado una adopción
no reproducible. Por ello la línea 5.8.4 queda como diagnóstico histórico y no
como destino de instalación.

## Consumidores incluidos

- `base_python_angular`;
- `base_tauri_angular`;
- `base_wails_angular`;
- `bcp_pdf_extractor`;
- `hra_dashboard_resultados`.

## Tareas

- [x] Ejecutar la auditoría inicial de Atomic UI 5.8.4 y de los cinco consumidores sin escritura.
- [x] Actualizar las referencias remotas y detectar la divergencia 3/18 de la rama local.
- [x] Reconciliar Atomic UI 5.22.0 con las mejoras locales de gobierno sin recuperar `.agent` ni degradar la guía 5.8.
- [x] Regenerar y verificar el manifiesto de fuentes sobre la referencia reconciliada.
- [x] Ejecutar las compuertas, pruebas y compilaciones de Atomic UI antes de propagar.
- [x] Corregir el instalador para conservar tokens y decisiones de adaptaciones sin deriva.
- [ ] Preservar anexos y metadatos locales que ocupan rutas de gobierno canónicas en los consumidores.
- [x] Ejecutar `governance:install --audit-only` contra la referencia reconciliada.
- [x] Clasificar cambios exactos, adaptaciones, servicios, tokens y cambios incompatibles desde 5.5/5.8.
- [ ] Crear una decisión de adopción por consumidor sin eliminar el historial ADR anterior.
- [ ] Propagar solo componentes y tokens autorizados, con pruebas compatibles con el runner real.
- [ ] Instalar la política y recalcular snapshots mediante el instalador canónico.
- [ ] Restaurar y comprobar los tokens obligatorios específicos de cada consumidor.
- [ ] Ejecutar `check:atomic`, pruebas, typecheck y build aplicables por consumidor.
- [ ] Inspeccionar foco, contraste, estados, tablas adaptables y ausencia de primitivas visuales nativas.
- [ ] Actualizar `CHANGELOG.md` y `LESSONS_LEARNED.md` de Atomic UI y de cada consumidor.
- [ ] Ejecutar `git diff --check`, revisar secretos y retirar únicamente salidas regenerables creadas por esta tarea.
- [ ] Registrar resultados, limitaciones y referencias Git finales.
- [ ] Cerrar la hoja de ruta con todas las tareas completadas.

## Límites de seguridad

La sincronización no moverá DTO, endpoints, permisos, credenciales, lógica SQL
ni estado específico hacia Atomic UI. No se ejecutarán aplicaciones de
escritorio, no se accederá a SQL Server o WinVault y no se sobrescribirán
adaptaciones sin decisión. La migración 5.9 de tokens se tratará como cambio
incompatible y no se aplicará parcialmente. Cualquier archivo documental local
ubicado sobre una ruta gobernada se preservará antes de instalar la copia
canónica.
