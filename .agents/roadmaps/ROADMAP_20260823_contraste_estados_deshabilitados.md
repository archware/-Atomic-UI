---
title: "Contraste accesible de estados deshabilitados"
subtitle: "Corrección canónica de Button, Checkbox y Radio en Atomic UI"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-08-23"
last_updated: "2026-08-23"
document_type: "hoja de ruta técnica"
status: "implementado y validado"
change_id: "ATOMIC-20260823-DISABLED-CONTRAST"
---

# Contraste accesible de estados deshabilitados

## Objetivo

Se corregirán los estados deshabilitados de Button, Checkbox y Radio en la
fuente canónica Atomic UI. La mejora conservará la API pública y utilizará
tokens semánticos que mantengan una señal visual efectiva en fondo, borde,
control y etiqueta, sin comunicar el estado mediante opacidad.

## Tareas

- [x] Auditar los selectores actuales, tokens por tema y compuertas de contraste.
- [x] Definir el estado deshabilitado de todas las variantes de Button.
- [x] Aplicar señal deshabilitada efectiva a control y etiqueta de Checkbox.
- [x] Aplicar señal deshabilitada efectiva a control y etiqueta de Radio.
- [x] Añadir o reforzar pruebas de contrato visual y accesibilidad.
- [x] Ejecutar pruebas focales, contraste, validación CSS, lint y build.
- [x] Actualizar el historial de cambios y las lecciones aprendidas.
- [x] Cerrar la hoja de ruta sin publicar remotamente.

## Límites

No se modificarán consumidores, contratos de dominio ni APIs públicas. No se
utilizarán colores fijos ni opacidad para representar el estado deshabilitado.

## Evidencia de validación

- `npm run check:contrast`: conforme en tres temas alcanzables y diez pares por
  tema.
- `npm run check:css-values`: conforme.
- `npm run check:focus`: conforme.
- `npm run catalog:check`: conforme con 41 entradas.
- `npm run check:catalog-api`: conforme con 29 componentes y 241 entradas.
- `npm run tokens:check`: conforme; 196 archivos y 328 consumos inspeccionados,
  sin tokens faltantes.
- Pruebas focales de Angular: 63 de 63 conformes.
- Suite completa de Angular: 457 de 457 pruebas conformes.
- `npm run lint`: conforme.
- `npm run build`: conforme; se generaron 14 rutas prerenderizadas.
- `npm run lib:build`: conforme.
- `npm run storybook:build`: conforme, con advertencias no bloqueantes sobre
  entradas sin uso y tamaño del paquete.
- `npm run package:test` y `npm run package:dry-run`: conformes; el paquete
  privado contiene 158 fuentes.
- `git diff --check`: conforme.

## Restricción ambiental

La primera ejecución focal de Karma compiló los archivos de prueba, pero Chrome
no inició por un fallo del proceso GPU y bloqueo de su caché persistente. Se
restablecieron las dependencias desde el lock y se repitió la validación con una
configuración temporal de Chrome Headless que deshabilitó GPU y aislamiento. La
configuración temporal se retiró al finalizar; las suites focal y completa,
lint, compilación de aplicación, biblioteca y Storybook concluyeron conformes.
