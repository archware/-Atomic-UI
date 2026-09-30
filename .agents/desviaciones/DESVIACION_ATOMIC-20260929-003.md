---
id: DESVIACION_ATOMIC-20260929-003
asignacion: ATOMIC-20260929-003
repositorio: -Atomic-UI
fecha: 2026-09-29
estado: abierta
severidad: alta
apartado_roto: §13
---

## Qué se esperaba

Las compuertas de la asignación (§13) y las reglas Atomic exigen tokens existentes y una referencia elegible antes de propagar.

## Qué se observó

Catálogo válido; tokens globales inválidos por referencias ajenas a la unidad. Fuente Atomic con cambios sin confirmar y publicación congelada. No se declara cobertura global ni adopción publicada.

## Evidencia

Comando: npm run tokens:check (2026-09-29).
Salida: valid=false; scannedFiles=366; missing: --color-border (pagina-crud-accordion.scss:23,46,70,87), --color-surface (mismo archivo:60,71), --surface-card (layout-shell.component.css:144).
Estos archivos no están en el reparto ni fueron modificados por esta asignación.

La primera ejecución focalizada tuvo 14 SUCCESS y 1 FAILED: TypeError en la prueba nueva al buscar Guardar por texto después de activar loading (el texto cambia). Se corrigió el selector reteniendo la instancia antes de loading; no se debilitó la aserción de bloqueo.
La repetición focalizada terminó con TOTAL: 15 SUCCESS. La suite global terminó
con TOTAL: 4 FAILED, 509 SUCCESS; los cuatro fallos son authInterceptor y se
reprodujeron aisladamente (TOTAL: 4 FAILED, 3 SUCCESS). No dependen de PaginaCrud.
check:catalog-api detectó nueve entradas preexistentes no catalogadas en Input
y Topbar, ninguna en las APIs modificadas. package:check inicialmente detectó
el inventario desactualizado por el cambio; se regenera con la herramienta
oficial, sin modificar referencia ni procedencia del consumidor.
La repetición de package:check pasó: 319 fuentes con SHA-256. La revisión de
codificación en 18 archivos detectó 150 faltas de tildes preexistentes en
CHANGELOG y LESSONS_LEARNED históricos; no errores UTF-8. Se conservan las
entradas antiguas en lugar de ampliar el alcance a su reescritura.

El dry-run del generador rechazó sobrescribir tipos-entidades-financieras: "No se sobrescribirá el feature existente". Resultado esperado del control de preservación; no se ejecutó generación con escritura.

## Corrección mínima que preserva la doctrina

Una asignación posterior deberá verificar los tokens canónicos equivalentes en esos dos componentes. El Guardián debe validar y publicar una referencia limpia antes de adopción certificada. La excepción local solicitada requiere respuesta expresa; no se presupone.

## Lo que NO se debe hacer

No inventar fallbacks ni ampliar exclusiones del verificador. No tocar el trabajo concurrente en Ventas o Select2. No modificar hashes u OID para que parezca publicada una fuente candidata. No hacer commits durante el congelamiento.

## Escalado

Storybook recompuso documentation.json, artefacto generado rastreado y limpio
en la captura inicial. La colisión lo detectó fuera del reparto. Es un efecto
de esta validación, no trabajo ajeno. Al terminar ambas compilaciones se
restauró mecánicamente solo ese artefacto y se verificó git diff --exit-code=0;
se conserva la salida generada en el temporal. No se amplió el reparto para
ocultarlo ni se descartaron fuentes del usuario.

Build de aplicación, biblioteca y Storybook pasan. Lint acotado: cero errores;
global: diez errores preexistentes. governance:check se detiene en blueprints
(wizard con estilo/tipo imperativo, sin OnPush, roots forgot-password/register
ausentes). La corrida completa de compuertas del ecosistema ejecutó 14: diez
pasan y cuatro fallan (documentación, canalizaciones, autoverificación y
secretos). No se rebaja ninguna compuerta; sus salidas están en el temporal.

Pendiente de autorización de adopción local o de una referencia validada por el Guardián. Se continúa con pruebas de la unidad canónica, no con propagación silenciosa.
