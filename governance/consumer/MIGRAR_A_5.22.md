---
title: "Migración de un consumidor a Atomic UI 5.22"
document_type: "guía técnica"
status: "vigente"
date: "2026-08-23"
updated: "2026-08-23"
version: "5.22.0"
policy_version: "1.2.2"
owner: "Hospital Regional de Ayacucho"
---

# Migración de un consumidor a Atomic UI 5.22

La adopción 5.22 reúne código visual, tokens, política, manifiesto de fuentes y
decisiones del consumidor. El instalador actualiza gobierno y procedencia, pero
no sustituye componentes existentes ni determina por sí mismo si una adaptación
debe conservarse. Por tanto, cada migración empieza en modo de solo lectura y
termina con pruebas del consumidor real.

## 1. Condiciones previas de procedencia

La fuente Atomic debe cumplir simultáneamente estas condiciones:

1. el `origin` corresponde a `archware/-Atomic-UI`;
2. el `HEAD` es un OID completo, inmutable y recuperable desde una referencia
   remota destinada a CI;
3. `package.json`, `distribution/package-contract.json` y
   `distribution/atomic-source-manifest.json` describen la misma versión;
4. las 158 fuentes publicadas coinciden con la huella agregada del manifiesto;
5. ninguna ruta propagable presenta cambios, archivos ignorados o archivos sin
   seguimiento.

Una etiqueta semántica no sustituye estas comprobaciones. Si la rama local y la
remota divergen, primero se reconcilia y valida Atomic; ningún consumidor se fija
a un commit que CI no pueda obtener.

## 2. Cambio incompatible desde 5.9

Atomic UI 5.9 separó el color de relleno del color de texto y retiró `opacity`
como señal de estado deshabilitado. La migración no puede copiar únicamente el
componente que utiliza un token nuevo. Debe revisar conjuntamente:

- `_tokens-primitives.css`, `_tokens-components.css`, `_forms.css`,
  `_buttons.css` y `_utilities.css`;
- los tokens `--*-color-text`, `--input-disabled-*`, la escala tipográfica y
  `--touch-target-min`;
- las listas `tokens.required` ya declaradas por el consumidor;
- contraste en tema claro y oscuro, foco y estados deshabilitados.

Los tokens obligatorios locales se preservan. El instalador no debe utilizarse
como justificación para vaciar esa lista o para presentar un componente
adaptado como copia exacta.

## 3. Cambios funcionales acumulados

La revisión de cada componente consumido debe considerar, como mínimo:

- cancelación de `Escape` y conservación de fechas civiles en `Datepicker`;
- errores accesibles de `ChoiceControl`;
- foco observable en modal, cuadro combinado y componentes interactivos;
- distinción entre ausencia de respuesta y cero filas en `DataTable`;
- modo `iconOnly` de botón y nombres accesibles;
- limpieza de valores rechazados en entradas y selectores;
- encabezados navegables y tipografía no invasiva en `Accordion`;
- espaciado simétrico de `Alert` y geometría cerrada de `Toggle`;
- cortes adaptables en `rem` y escala tipográfica gobernada.

Un componente ausente y no utilizado no se agrega para completar inventario.
Un componente previamente exacto que cambió en Atomic se propaga solo después
de comprobar imports, contratos públicos, tokens y pruebas. Una adaptación
deliberada conserva un ADR y una instantánea criptográfica nueva.

## 4. Auditoría sin escritura

Desde el checkout Atomic fijado se ejecuta:

```powershell
npm run governance:install -- D:\ruta\consumidor `
  --package-root=frontend `
  --ui-root=frontend/src/app/shared/ui `
  --audit-only
```

En consumidores cuyo `package.json` está en la raíz se omite `--package-root`.
El reporte se contrasta con la procedencia anterior para distinguir tres casos:

1. una copia exacta que debe recibir el delta upstream;
2. una adaptación estable cuyo snapshot no cambió;
3. una divergencia nueva que exige decisión o corrección antes de instalar.

## 5. Preservación previa

`docs/ATOMIC_GOVERNANCE.md`, los scripts de gate y el workflow son copias
canónicas. Si un consumidor agregó frontmatter, anexos o notas en esas rutas,
la información se traslada primero a un documento histórico no gobernado. La
copia canónica no se edita y el traslado no puede eliminar evidencia.

También se registran antes de instalar:

- `tokens.required`;
- `decisionRecord` y justificación de cada adaptación;
- scripts adicionales de `package.json`;
- pruebas propias que utilizan Vitest u otro runner distinto de Jasmine.

## 6. Instalación gobernada

Cada consumidor crea un ADR de adopción y ejecuta:

```powershell
npm run governance:install -- D:\ruta\consumidor `
  --package-root=frontend `
  --ui-root=frontend/src/app/shared/ui `
  --adaptation-decision=docs/decisions/ADR-adopcion-atomic-5-22.md `
  --change-id=ATOMIC-5-22-ADOPTION
```

La procedencia, referencias y hashes se generan mediante el instalador. Después
se comprueba que los tokens obligatorios y la trazabilidad histórica continúan
representados; no se corrigen manualmente OID ni huellas para superar el gate.

## 7. Cierre verificable

La adopción se considera completa únicamente cuando aprueban:

```powershell
npm run check:atomic
npm run typecheck
npm test
npm run build
git diff --check
```

Los nombres concretos pueden variar por consumidor, pero no se omiten pruebas
de accesibilidad, contraste, temas, comportamiento adaptable y componentes
propagados. La CI debe obtener exactamente el OID declarado y ejecutar primero
el gate confiable de Atomic.

## 8. Límites

La migración no mueve rutas, DTO, endpoints, permisos, credenciales, SQL, HTTP,
IPC ni estado de dominio hacia Atomic. Tampoco inicia aplicaciones de escritorio,
genera ejecutables, publica paquetes o modifica almacenes de credenciales. Esas
acciones requieren su propio alcance y evidencia.
