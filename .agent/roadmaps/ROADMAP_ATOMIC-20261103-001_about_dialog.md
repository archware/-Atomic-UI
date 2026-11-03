---
title: "Creación del organismo canónico Acerca de y Créditos del Sistema (app-about-dialog)"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-11-03"
last_updated: "2026-11-03"
document_type: "roadmap de implementación"
status: "completado"
version: "1.0.0"
change_id: "ATOMIC-20261103-001"
---

# Creación del organismo canónico Acerca de y Créditos del Sistema (`<app-about-dialog>`)

## Ficha de cambio por riesgo

- **Ruta clasificada:** Estándar (creación aditiva upstream-first de organismo de presentación en `-Atomic-UI` y propagación hacia consumidor `pdf-tool`).
- **Raíz Git origen:** `C:/Users/cotaha/source/repos/-Atomic-UI`, rama `main`, OID base `7633d4c81384cfda10d6e7108750870ca44b8dc0`.
- **Protección del trabajo preexistente:** Se preservan íntegramente las modificaciones en curso del árbol local sin sobrescribir ni descartar trabajo ajeno.

## Tareas y criterios de aceptación

- [x] Crear el organismo standalone `<app-about-dialog>` (`src/app/shared/ui/organisms/about-dialog/about-dialog.component.{ts,html,css,spec.ts}`) con `ChangeDetectionStrategy.OnPush`, Signals (`input()`, `output()`), control flow nativo (`@if`, `@for`, `@switch`) y 100% tokens CSS semánticos.
- [x] Soportar las tres variantes de presentación (`variant = 'modal' | 'popup' | 'card'`), exponiendo `AboutDialogComponent`, `AboutDialogVariant`, `AboutCreditItem`, `AboutTechBadge` y `AboutLinkItem` en `src/app/shared/ui/index.ts`.
- [x] Registrar el contrato completo de 22 entradas y 1 salida en `catalog/components/about-dialog.json`, crear historias en `src/stories/ui-about-dialog.stories.ts` y exponer la Sección 5 en el Blueprint `src/blueprints/dialogs-page/dialogs-page.component.{ts,html,css}`.
- [x] Ejecutar compuertas de gobierno (`catalog:generate`, `check-atomic-blueprints.js`, `check-css-units.mjs`, `audit-tokens.ps1`, `package:manifest`, `package:check`), pruebas unitarias Karma en ChromeHeadless (`5/5` casos en verde) y compilación de aplicación y biblioteca (`npm run build` y `npm run lib:build`).

## Rollback

Revertir exclusivamente el commit de la unidad `ATOMIC-20261103-001` y regenerar `distribution/atomic-source-manifest.json` con `npm run package:manifest`.
