---
title: "Gobierno obligatorio para consumidores Atomic"
subtitle: "Procedencia, instalación y compuertas de conformidad"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-08-03"
---

# Gobierno obligatorio para consumidores Atomic

La carpeta `governance/consumer` es la fuente canónica de la política que deben
obedecer todas las aplicaciones. Sus archivos se propagan como copias exactas y
el propio gate rechaza cualquier modificación local.

## Aplicación nueva

```bash
npm run create:project mi-aplicacion -- --template=full
```

El generador copia el ADN, crea `AGENTS.md`, inventaría todos los componentes,
instala la política, el gate y el workflow de CI, y agrega `check:atomic` al
`package.json`. El proyecto no se considera creado si ese bootstrap falla.

## Aplicación existente

```bash
npm run governance:install -- C:\ruta\al\consumidor --ui-root=src/app/shared/ui
```

Cuando Angular se encuentra en una carpeta anidada, el repositorio se mantiene
como raíz de gobierno y se declara la ubicación de `package.json`:

```bash
npm run governance:install -- C:\ruta\al\consumidor \
  --package-root=frontend \
  --ui-root=frontend/src/app/shared/ui
```

Después se ejecuta `npm run check:atomic` en el consumidor. Las adaptaciones
existentes deben declararse manualmente como `adapted`, con `justification` y
`decisionRecord`; el instalador registra como `exact` todo lo que acaba de
comprobarse idéntico a Atomic.

Antes de instalar gobierno sobre un consumidor con trabajo previo se ejecuta una
auditoría de solo lectura:

```bash
npm run governance:install -- C:\ruta\al\consumidor --ui-root=src/app/shared/ui --audit-only
```

El reporte clasifica un componente como `exact` únicamente cuando coinciden el
conjunto de archivos y todos sus hashes SHA-256. Si existe una divergencia, la
instalación normal se detiene antes de copiar políticas o modificar
`package.json`. La adaptación deberá revisarse y asociarse a un registro de
decisión concreto; el instalador no crea justificaciones genéricas.

Después de aprobar una línea base, la instalación exige el registro de decisión
existente y conserva un snapshot SHA-256 de cada archivo adaptado:

```bash
npm run governance:install -- C:\ruta\al\consumidor \
  --adaptation-decision=docs/decisions/ADR-atomic-baseline.md \
  --change-id=ATOMIC-BASELINE-2026-08
```

Una modificación posterior de un archivo adaptado invalida el gate hasta que se
registre una nueva decisión y se renueve deliberadamente el snapshot.

## Controles que convierten la política en ley

- `AGENTS.md` contiene el marcador obligatorio para cualquier agente.
- `atomic-provenance.json` inventaría cada directorio UI y su fuente.
- El gate verifica hashes de componentes exactos y de sus propios artefactos.
- Una adaptación sin justificación o registro de decisión falla.
- Features y páginas no admiten primitivas visuales nativas, estilos inline,
  colores fijos ni selectores hacia el DOM interno de controles.
- El gate canónico inspecciona plantillas HTML y hojas CSS/SCSS externas. Los
  consumidores que mantienen plantillas inline en TypeScript deben conservar su
  validador específico hasta completar la migración hacia archivos externos.
- El workflow `Atomic governance` ejecuta la compuerta en push y pull request.
- La CI de `-Atomic-UI` prueba el bootstrap y cuatro violaciones negativas, y
  rechaza blueprints que incumplan la misma norma.

En GitHub se debe marcar el job `Atomic governance / atomic-governance` como
status check requerido de la rama protegida. Esa configuración del repositorio
es el único cerrojo externo que no puede expresarse dentro del código fuente.
