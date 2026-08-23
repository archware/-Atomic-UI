---
title: "Sincronización gobernada de Atomic UI 5.22.0"
subtitle: "Reconciliación de la fuente canónica y adopción verificable en los consumidores HRA"
document_type: "hoja de ruta técnica"
status: "Finalizada"
date: "2026-08-23"
last_updated: "2026-08-23"
completion_date: "2026-08-23"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
owner: "Hospital Regional de Ayacucho"
change_id: "ATOMIC-5-22-0-SYNC-20260823"
---

# Sincronización gobernada de Atomic UI 5.22.0

## Objetivo

Se reconcilió la rama local de Atomic UI con el commit canónico publicado
`2b87262ef6d9efb9e839b6073a607739d7357e15`, correspondiente a la versión
`5.22.0`, sin perder las tres mejoras locales de gobierno posteriores al punto
de divergencia `673f69b4b81a624e2a24d4b009672ccc6643e0d6`. Después se adoptó la
fuente reconciliada y la política `1.2.2` en los cinco consumidores mediante el
instalador oficial. No se editaron referencias ni huellas de procedencia a mano.

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
- [x] Preservar anexos y metadatos locales que ocupan rutas de gobierno canónicas en los consumidores.
- [x] Ejecutar `governance:install --audit-only` contra la referencia reconciliada.
- [x] Clasificar cambios exactos, adaptaciones, servicios, tokens y cambios incompatibles desde 5.5/5.8.
- [x] Crear una decisión de adopción por consumidor sin eliminar el historial ADR anterior.
- [x] Propagar solo componentes y tokens autorizados, con pruebas compatibles con el runner real.
- [x] Instalar la política y recalcular snapshots mediante el instalador canónico.
- [x] Restaurar y comprobar los tokens obligatorios específicos de cada consumidor.
- [x] Ejecutar `check:atomic`, pruebas, typecheck y build aplicables por consumidor.
- [x] Inspeccionar foco, contraste, estados, tablas adaptables y ausencia de primitivas visuales nativas.
- [x] Actualizar `CHANGELOG.md` y `LESSONS_LEARNED.md` de Atomic UI y de cada consumidor.
- [x] Ejecutar `git diff --check`, revisar secretos y retirar únicamente salidas regenerables creadas por esta tarea.
- [x] Registrar resultados, limitaciones y referencias Git finales.
- [x] Cerrar la hoja de ruta con todas las tareas completadas.

## Resultado final

La fuente reproducible quedó publicada en `origin/main` mediante el commit
`67297145e2cb4bfe9ab349c471da5c3719fd1207`. Los cinco consumidores fijaron
esa referencia, la huella de fuentes
`ebd294d5e4b05bf771d96e6941a2d854faa9c28912b5c4c97c61cb45e5d28872`,
la política `1.2.2` y el identificador de cambio
`ATOMIC-5-22-0-SYNC-20260823`.

| Consumidor | Commit local | Componentes | Servicios | Violaciones | Tokens obligatorios | Pruebas |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| Python + Angular | `a53b6544aa75411a40847601e4fded12232d006d` | 65 | 5 | 0 | 4 | 222/222 |
| Tauri + Angular | `3eacbb8d0da70223fad180a642090c13e1f9c0b1` | 65 | 5 | 0 | 0 | 265/265 |
| Wails + Angular | `d140653cfa725a0e7b5f0276a2c63eeffe62eaf4` | 65 | 5 | 0 | 0 | 250/250 |
| Extractor BCP PDF | `c3d3a1853b748d764f7e2d72198866b68f3591c1` | 64 | 5 | 0 | 0 | 124/124 |
| Panel de resultados HRA | `63f2647dbcc918dbd04761d3ace8cb664f66f7eb` | 68 | 5 | 0 | 15 | 302/302 |

El panel de resultados también superó 31 de 31 pruebas de seguridad. Se
comprobaron las compilaciones, los tipos, los temas, los contratos aplicables,
la ausencia de errores de formato del parche y el escaneo focal de secretos.
Las salidas regenerables creadas durante la validación se retiraron al finalizar.

## Limitaciones y trabajo posterior

- Los commits de los cinco consumidores permanecen locales porque su publicación
  requiere una autorización separada por repositorio.
- Las advertencias no bloqueantes de presupuesto CSS y de paquete deberán
  reducirse en una iteración de rendimiento sin elevar los límites como atajo.
- El paquete portátil `hra-desktop-contracts` 0.3.1 está desactualizado respecto
  de sus fuentes documentales. Corresponde publicar una versión nueva; no se
  deberá modificar retrospectivamente la versión 0.3.1.
- La generación de ejecutables beta queda fuera de esta sincronización y deberá
  ejecutarse después de decidir si los commits consumidores se publican.

## Límites de seguridad

La sincronización no moverá DTO, endpoints, permisos, credenciales, lógica SQL
ni estado específico hacia Atomic UI. No se ejecutarán aplicaciones de
escritorio, no se accederá a SQL Server o WinVault y no se sobrescribirán
adaptaciones sin decisión. La migración 5.9 de tokens se tratará como cambio
incompatible y no se aplicará parcialmente. Cualquier archivo documental local
ubicado sobre una ruta gobernada se preservará antes de instalar la copia
canónica.
