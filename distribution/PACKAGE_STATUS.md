---
title: "Estado del paquete Atomic UI"
subtitle: "Biblioteca Angular compilable con API pública exclusivamente visual"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-08-06"
---

# Estado del paquete Atomic UI

Desde la versión 5.5.0 el repositorio declara el proyecto Angular de tipo
`library` **atomic-ui** (`projects/atomic-ui`, builder `@angular/build:ng-packagr`,
ng-packagr ^22). Su `entryFile` es el barrel visual canónico
`src/app/shared/ui/index.ts`, de modo que la API pública empaquetada es
exactamente la superficie visual del ADN, sin mover fuentes ni duplicarlas.

- `npx ng build atomic-ui` compila `@hra/atomic-ui` en Angular Package Format
  (fesm2022 + declaraciones, `compilationMode: partial`) hacia `dist/atomic-ui`.
- `npm run lib:build` ejecuta esa compilación y además copia
  `src/styles/themes/*.css` a `dist/atomic-ui/tokens/` (entrada
  `tokens.css`, expuesta como `@hra/atomic-ui/tokens`). La copia externa es
  necesaria porque ng-packagr 22 prohíbe `assets` fuera de `projects/atomic-ui`
  y los tokens canónicos permanecen en `src/styles/themes/`.
- El barrel visual ya no exporta autenticación, transporte HTTP, caché,
  permisos ni manejo global de errores; esas plantillas de aplicación se
  importan por ruta directa (`@shared/ui/services/auth.service`, etc.) y el
  gate `npm run package:check` verifica su ausencia en la API pública.

Los bloqueadores históricos `ANGULAR_PROJECT_IS_APPLICATION`,
`NG_PACKAGR_NOT_DECLARED` y `PUBLIC_API_CONTAINS_APPLICATION_CONCERNS`
quedaron resueltos en 5.5.0 y constan en `resolvedBlockers` del contrato.

La publicación de `@hra/atomic-ui` continúa bloqueada por los bloqueadores
legítimos restantes: `PACKAGE_NOT_PUBLISHED_TO_REGISTRY` (no existe registro
privado con el artefacto) y `RELEASE_PROVENANCE_UNSIGNED` (la liberación no
está firmada ni anclada a una referencia Git inmutable). Por ello el artefacto
de `npm run package:dry-run` sigue siendo únicamente contrato + procedencia
SHA-256, permanece privado y **no** es instalable en runtime. El estado verde
del gate acredita que la biblioteca compila y que la frontera visual se cumple;
no acredita que exista un paquete publicado.
