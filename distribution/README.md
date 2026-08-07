---
title: "Contrato de distribución de Atomic UI"
subtitle: "Procedencia, exportaciones y gate de empaquetado de la biblioteca"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-08-06"
---

# Contrato de distribución de Atomic UI

## Propósito

La carpeta `distribution` define el paso verificable entre la copia gobernada de
fuentes y la biblioteca Angular `@hra/atomic-ui`. Desde 5.5.0 la biblioteca
compila localmente (`npx ng build atomic-ui`, proyecto `projects/atomic-ui`
con entryFile en el barrel visual); la implementación no traslada ni elimina
componentes existentes y la publicación en registro sigue bloqueada.

## Artefactos controlados

- `package-contract.json` declara el nombre objetivo, el estado
  `library-buildable`, los bloqueadores resueltos y vigentes, las fuentes
  inventariadas y los criterios obligatorios de liberación.
- `public-exports.json` delimita las capas visuales y registra las
  responsabilidades de aplicación que deben excluirse del paquete público.
- `atomic-source-manifest.json` registra tamaño y SHA-256 de cada fuente
  distribuible, además de un digest agregado independiente del orden del sistema
  de archivos.
- `PACKAGE_STATUS.md` acompaña el empaquetado seco y evita interpretar el
  contrato como un artefacto ejecutable.

## Comandos reproducibles

```text
npm run package:manifest
npm run package:check
npm run package:dry-run
```

`package:manifest` se ejecuta únicamente cuando una modificación intencional de
Atomic cambia el inventario. `package:check` no altera el manifiesto: recalcula
los hashes, valida los bloqueos reales y ejecuta `npm pack --dry-run` sobre una
carpeta temporal ignorada. `package:dry-run` repite la inspección sin crear un
archivo `.tgz` ni acceder a un registro de paquetes.

## Estado de publicación

La publicación permanece prohibida hasta que se cumplan todos los requisitos de
`releaseRequirements` (bloqueadores vigentes: `PACKAGE_NOT_PUBLISHED_TO_REGISTRY`
y `RELEASE_PROVENANCE_UNSIGNED`). La biblioteca compila en Angular Package
Format hacia `dist/atomic-ui` (`npm run lib:build` añade los tokens de tema),
pero el artefacto del dry-run sigue siendo contrato + procedencia, conserva
`private: true` y no es instalable en runtime.

## Procedencia de consumidores

Los consumidores existentes se auditarán con
`npm run governance:install -- <ruta> --audit-only`. Una copia se clasificará
como `exact` solamente cuando el conjunto de archivos y todos sus hashes sean
idénticos. Una divergencia detendrá la instalación y exigirá un registro de
decisión concreto antes de declararse `adapted`; el instalador no generará una
justificación genérica ni modificará el consumidor durante la auditoría.

La línea base de solo lectura del 3 de agosto de 2026 produjo los siguientes
resultados por directorio de componente:

| Consumidor | Copias exactas | Adaptaciones requeridas |
| --- | ---: | ---: |
| Python Angular | 22 | 41 |
| Tauri Angular | 21 | 42 |
| Wails Angular | 21 | 42 |

Todos los directorios auditados poseen una fuente Atomic. Las adaptaciones
requeridas corresponden a archivos ausentes, adicionales o con contenido
divergente; no corresponden a componentes sin origen. Esta línea base no altera
los repositorios consumidores y deberá regenerarse después de cada consolidación
intencional.
