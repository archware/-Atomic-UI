---
title: "Migración de un consumidor a Atomic UI 5.8"
document_type: "guía técnica"
status: "histórica"
date: "2026-08-20"
updated: "2026-08-21"
version: "5.8.4"
policy_version: "1.2.2"
superseded_by: "MIGRAR_A_5.22.md"
owner: "Hospital Regional de Ayacucho"
---

# Migración de un consumidor a Atomic UI 5.8

> Esta guía conserva la evidencia de la línea 5.8. Las nuevas adopciones se
> rigen por `MIGRAR_A_5.22.md`, que incorpora el cambio incompatible de tokens
> introducido en 5.9 y las correcciones acumuladas hasta 5.22.

La migración adopta conjuntamente el código visual y la política 1.2.2. No se
copian directorios, tokens, gates ni hashes a mano.

## Estado conocido de adopción

La procedencia de cada consumidor se evalúa por separado. Al 21 de agosto de
2026, Acopiador BCP (`bcp_pdf_extractor`) declara Atomic UI `5.5.8` en
`docs/atomic-provenance.json`, con `atomicRef`
`93f090aef95c30dac3ccb00a7832fa7bdc22fbaa`, mientras que el árbol institucional
local disponible corresponde a `5.8.4`. Si su compuerta apunta a ese árbol local,
el bloqueo por divergencia es el resultado esperado. La línea vigente 5.5.8 se
verifica con un checkout fijado exactamente al `atomicRef` declarado. Una
migración a 5.8.4 constituye un cambio posterior que requiere autorización y la
auditoría descrita en esta guía; la versión, la referencia y las huellas no se
editan de forma aislada para silenciar el resultado.

En un entorno aislado, Git también puede rechazar la comprobación por propiedad
del repositorio (`dubious ownership`). Ese diagnóstico ambiental es distinto de
la divergencia de versión y no la corrige. La verificación definitiva se ejecuta
en un checkout controlado por su propietario o en CI, sin convertir una excepción
global de `safe.directory` en paso de adopción. Esta guía no autoriza cambios en
el consumidor ni una sobrescritura automática de sus adaptaciones.

## 1. Auditoría de solo lectura

Desde Atomic UI:

```powershell
npm ci
npm run governance:install -- D:\ruta\consumidor `
  --ui-root=src/app/shared/ui `
  --audit-only
```

Si Angular está bajo `frontend`, se agrega `--package-root=frontend` y se ajusta
`--ui-root`. El reporte debe revisarse antes de autorizar cualquier escritura.

## 2. Adaptaciones declaradas

Una divergencia funcional se conserva solo con un ADR existente, una
justificación concreta y snapshots de cada archivo adaptado. Las diferencias de
runner entre pruebas no convierten automáticamente un archivo en copia exacta.

```powershell
npm run governance:install -- D:\ruta\consumidor `
  --ui-root=src/app/shared/ui `
  --adaptation-decision=docs/decisions/ADR-adopcion-atomic-5-8.md `
  --change-id=ATOMIC-5-8-20260820
```

El instalador se detiene antes de sobrescribir una adaptación no declarada.

## 3. Comprobaciones

En el consumidor:

```powershell
npm ci
npm run check:atomic
npm test -- --watch=false
npm run build
git diff --check
```

También se realiza una inspección funcional de foco, contraste, temas y estados.
La compuerta de procedencia no sustituye la validación perceptible.

## 4. Cierre de CI

El workflow fija un OID completo del checkout Atomic y ejecuta el gate antes de
las dependencias del consumidor. El job `Atomic governance / atomic-governance`
se configura como comprobación requerida de la rama. Un flujo de GitHub Actions
vendorizado en otro proveedor no se considera activo hasta integrarlo con ese
proveedor.

## 5. Límites

La adopción no mueve a Atomic rutas, DTO, endpoints, permisos, credenciales,
HTTP o IPC ni reglas de negocio. Esas responsabilidades permanecen en el
consumidor y se validan con sus propias pruebas.

## 6. Lecciones de compatibilidad verificadas desde 5.7

La migración de un consumidor actual conserva las siguientes restricciones
demostradas durante la línea 5.7. Se trasladaron a esta guía porque continúan
afectando a la política 1.2.2; los números de versión antiguos no constituyen un
objetivo de adopción.

### 6.1 Código visual y política forman una unidad

El gate compara sus artefactos vendorizados con la fuente Atomic. No se adopta
una versión de componentes manteniendo una política anterior. Los servicios
gobernados `theme`, `app-version`, `modal`, `popup` y `toast` deben existir en la
raíz declarada. Un servicio equivalente con API local se registra como
`adapted`, con decisión y huellas; no se crean envoltorios vacíos para satisfacer
la comprobación.

### 6.2 Las pruebas pueden requerir adaptación

Atomic utiliza Karma/Jasmine y algunos consumidores utilizan Vitest. Un archivo
`.spec.ts` que use aserciones o spies incompatibles no se declara `exact`. La
implementación puede coincidir mientras la prueba permanece `adapted`, con una
justificación acotada al runner. La adopción no sobrescribe cobertura local ni
incorpora una prueba que no ejecute el consumidor.

### 6.3 Orden de adopción

1. Se incorpora y versiona `.gitattributes` antes de calcular huellas.
2. Se vendorizan la política, gate, canonización de fin de línea, rutas seguras,
   lectura de contrato, manifiesto de fuente y workflow.
3. Se ejecuta `governance:install --audit-only` con `--package-root` y
   `--ui-root` reales.
4. Se revisan los cinco servicios y se conservan movimientos mediante el
   historial Git.
5. Se genera `atomic-provenance.json` con `git-clean-eol-v1`; no se calculan
   SHA-256 manualmente.
6. Se revisan `shellRoot`, `featureRoots`, capas, archivos exclusivos de cada
   lado y adaptaciones.

El instalador no puede deducir todos los renombres históricos. Cuando una ruta
local y una ruta Atomic divergen, el manifiesto declara ambos lados y la
decisión; no se fuerza una copia homónima.

### 6.4 Superficie gobernada y accesibilidad

El shell y las features no incorporan primitivas visuales nativas para eludir
Atomic. Los atributos de accesibilidad se aplican al control interactivo real;
el botón compuesto debe proyectar `ariaLabel`, `ariaControls`, `ariaExpanded` y
foco cuando corresponda. Una superficie de descarte visual no entra en el orden
de tabulación.

La búsqueda de primitivas examina fuente cruda, por lo que un comentario no debe
contener marcado nativo que active un falso contrato. La verificación automática
no reemplaza una inspección de foco, opacidad, contraste ni lector de pantalla.

### 6.5 Cierre verificable

```powershell
npm run check:atomic
npm run typecheck
npm test
npm run build
```

La CI debe integrar el gate en el proveedor real. Un workflow de GitHub
vendorizado dentro de un repositorio ejecutado exclusivamente en otro proveedor
no constituye una compuerta activa.
