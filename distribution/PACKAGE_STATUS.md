---
title: "Estado transicional del paquete Atomic UI"
subtitle: "Contrato verificable previo a la biblioteca Angular distribuible"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-08-03"
---

# Estado transicional del paquete Atomic UI

El artefacto generado por `npm run package:dry-run` contiene únicamente el
contrato, el inventario público planificado y la procedencia SHA-256. No contiene
una biblioteca Angular compilada, no admite importaciones de componentes en
tiempo de ejecución y permanece marcado como privado.

La publicación de `@hra/atomic-ui` se mantendrá bloqueada mientras el repositorio
continúe configurado como aplicación Angular, no declare `ng-packagr` y el barrel
actual exponga responsabilidades de autenticación, transporte HTTP, caché o
permisos. El estado verde del gate transicional acredita la integridad de estos
hechos; no acredita que exista un paquete instalable.

El scaffold conserva sin modificaciones destructivas `src/app/shared/ui`. La
migración posterior deberá crear un proyecto `library` paralelo, definir un
`public-api.ts` exclusivamente visual, compilar formatos Angular Package Format y
comparar su contenido con el manifiesto antes de autorizar una publicación.
