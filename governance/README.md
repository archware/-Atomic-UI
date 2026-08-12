---
title: "Gobierno obligatorio para consumidores Atomic"
subtitle: "Procedencia, instalación y compuertas de conformidad"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-08-12"
---

# Gobierno obligatorio para consumidores Atomic

La carpeta `governance/consumer` es la fuente canónica de la política que deben
obedecer todas las aplicaciones. Sus archivos se propagan como copias exactas y
el propio gate rechaza cualquier modificación local. Desde la política 1.2.2,
las huellas usan `git-clean-eol-v1`: texto declarado con atributos versionados
en LF y binarios `-text` byte a byte. Los atributos externos se neutralizan y
cualquier filtro, conversión de codificación, enlace o transformación `clean`
adicional bloquea la verificación.

## Aplicación nueva

```bash
npm run create:project -- mi-aplicacion --template=shell
```

El generador copia el ADN, crea `AGENTS.md`, genera un inventario de todos los componentes,
instala la política, el gate y el workflow de CI, y agrega `check:atomic` al
`package.json`. No copia blueprints demo ni datos simulados. La primera UI se
incorpora después con un contrato validado y `generate:ui --dry-run`. El
proyecto no se considera creado si ese bootstrap falla.

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

El instalador agrega al inicio la regla canónica de `.gitattributes` sin borrar
reglas locales, pero esa política debe confirmarse en Git antes de ejecutar el
gate. Después se ejecuta `npm run check:atomic` en el consumidor. Las adaptaciones
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
- El gate verifica hashes canónicos de componentes exactos y de sus propios
  artefactos, independientemente de si el checkout materializa LF o CRLF.
- Una adaptación sin justificación o registro de decisión falla.
- Features y páginas no admiten primitivas visuales nativas, estilos inline,
  colores fijos ni selectores hacia el DOM interno de controles.
- El gate canónico inspecciona plantillas HTML y hojas CSS/SCSS externas. Los
  consumidores que mantienen plantillas inline en TypeScript deben conservar su
  validador específico hasta completar la migración hacia archivos externos.
- El workflow `Atomic governance` ejecuta primero el gate del checkout Atomic
  fijado, antes de instalar o ejecutar dependencias del consumidor.
- `atomicRef` fija un OID Git completo (40 caracteres para SHA-1 o 64 para
  SHA-256) que debe coincidir con el checkout `archware/-Atomic-UI`;
  la CI conserva esa ruta durante `check:atomic` y cualquier repetición del
  gate dentro de `npm run check`, con permisos de contenido de solo lectura y
  sin credenciales persistentes.
- La CI de `-Atomic-UI` prueba el bootstrap y cuatro violaciones negativas,
  rechaza blueprints productivos que incumplan la norma y mantiene los demos
  históricos explícitamente aislados mediante su manifiesto.

En GitHub se debe marcar el job `Atomic governance / atomic-governance` como
status check requerido de la rama protegida. Esa configuración del repositorio
es el único cerrojo externo que no puede expresarse dentro del código fuente;
el ruleset debe revisar o fijar por separado el workflow y el OID verificador.
