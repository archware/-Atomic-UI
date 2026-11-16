---
title: "Roadmap ATOMIC-20261115-001: Efecto hover cromático en Stepper y cierre de versión 5.23.0"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-11-15"
last_updated: "2026-11-15"
version: "1.0.0"
change_id: "ATOMIC-20261115-001"
document_type: "roadmap de mejora"
status: "completado"
---

# Roadmap ATOMIC-20261115-001: Efecto hover cromático en Stepper y cierre de versión 5.23.0

## Ficha de cambio por riesgo

- **Identificador de cambio:** `ATOMIC-20261115-001`
- **Ruta de ejecución:** `estandar` (§17.0 ORQ-20261022-001 — evolución visual gobernada por tokens en `StepperComponent`, promoción semántica a versión `5.23.0`, propagación a 7 consumidores no fijados y cierre autorizado en Git bajo identidad `archware`).
- **Línea base Git de `-Atomic-UI`:** rama `main`, `HEAD` `33caab89f4f3619dd46b2aa4752c00d820fd17b8` + árbol consolidado de `ATOMIC-20261114-001`.
- **Alcance autorizado:**
  - Origen canónico: `c:\Users\cotaha\source\repos\-Atomic-UI`.
  - Consumidores activos de sincronización: `ventas-cxc`, `demo-chasis-front`, `saas-admin-front`, `saas-erp-front`, `saas-pos-front`, `citas-medicas-web` y `prestamo_front_atomic` (preservando sus 5 archivos WIP de `PREST-20261103-241`).
- **Exclusiones estrictas:** Conservar fijado `pdf-tool/frontend` en `b76f432976d6c1e47de57ee4b4be5821a5195dd8`, no tocar `SGP_BE`, y no confirmar archivos WIP ajenos (`ventas-cxc/debug.log`, features WIP en `ventas-cxc` o documentos `PREST-20261103-241`).

## Objetivos técnicos

1. **Efecto mouse-over (hover) basado en tokens en `StepperComponent`:**
   - Definir familia `--stepper-*` en `src/styles/themes/_tokens-components.css` para los tres temas alcanzables (`light`, `dark`, `brand-dark`): estado disponible (`--stepper-hover-*`), activo (`--stepper-active-hover-indicator-*`) y completado (`--stepper-completed-hover-*`).
   - Aplicar fondo de realce, contorno interior `--border-width-thin`, contraste accesible `>= 4.5:1` y espaciado simétrico en horizontal, vertical y móvil (`<= 38rem`), conservando alineación exacta de conectores y soporte de `prefers-reduced-motion: reduce`.
   - Agregar `src/app/shared/ui/organisms/stepper/stepper.component.spec.ts` y actualizar `catalog/components/stepper.json` y `scripts/check-theme-contrast.mjs` (`42` pares por tema).
2. **Cierre de versión `5.23.0` y confirmación en Git (`-Atomic-UI`):**
   - Actualizar `@atomic-ui/core` y `atomic-ui` a `5.23.0` en manifiestos, documentación viva y pruebas; regenerar `dart/atomic_tokens`, `documentation.json` y `distribution/atomic-source-manifest.json`.
   - Confirmar en `origin/main` bajo identidad `archware` (`havel363@gmail.com`).
3. **Propagación a 7 consumidores y cierre autorizado:**
   - Sincronizar `_tokens-components.css`, `stepper` y `atomicRef` hacia el `HEAD` confirmado de `-Atomic-UI`, validar `check:atomic`, `check:atomic-rules`, `ng build` y pruebas de cada consumidor, y confirmar/subir donde exista remoto configurado.

## Plan de reversión (rollback)

- Revertir el commit de cierre en `-Atomic-UI` o restaurar los archivos de tema, `stepper` y versión hacia `33caab8` / `5.22.0` antes de actualizar `atomicRef` en los consumidores.

## Registro de tareas

- [x] `T1`: Definir tokens `--stepper-*` en `light`, `dark` y `brand-dark` + auditoría en `check-theme-contrast.mjs`.
- [x] `T2`: Implementar efecto hover en `stepper.component.css`, interactividad en `showcase-navigation.component.ts`, ficha `catalog/components/stepper.json` y pruebas `stepper.component.spec.ts`.
- [x] `T3`: Cerrar versión `5.23.0`, validar suite completa (`governance:check`, `lint`, `ChromeHeadless` `894/894`, `build`, `lib:build`, `build-storybook`, `git diff --check`) y preparar confirmación en `-Atomic-UI`.
- [x] `T4`: Fijar publicación en `main` (`5.23.0`, SHA-256 `6380fdbf5acfe0b5b0163371157893049bed0b8343627024f295a96b141e2430`) para propagación inmediata de `_tokens-components.css`, `stepper` y `atomicRef` hacia los 7 consumidores no fijados (sin alterar `HEAD` posterior para preservar `atomicRef === HEAD` en `check:atomic`).
