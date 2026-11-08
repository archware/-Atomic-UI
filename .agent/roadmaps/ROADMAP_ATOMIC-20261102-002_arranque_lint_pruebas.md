---
title: "Arranque visible, lint y pruebas de Atomic UI"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-11-02"
last_updated: "2026-11-02"
document_type: "roadmap"
status: "completado"
version: "1.0.0"
change_id: "ATOMIC-20261102-002"
---

# Arranque visible, lint y pruebas de Atomic UI

## Ficha de cambio por riesgo

```yaml
asignacion: "ATOMIC-20261102-002"
ruta: "estandar"
justificacion: "Corrección compatible de bootstrap, código sin uso y asociación accesible de Select2; se conserva íntegra la conducta activa de autenticación. No cambian permisos, secretos, aislamiento, persistencia ni contratos publicados."
objetivo: "Renderizar la aplicación en navegador, eliminar los 11 errores de lint y corregir las cuatro expectativas obsoletas sin reducir cobertura."
base:
  repositorio: "C:/Users/cotaha/source/repos/-Atomic-UI"
  rama: "main"
  oid: "7633d4c81384cfda10d6e7108750870ca44b8dc0"
  estado: "Siete archivos modificados y tres documentos nuevos de ATOMIC-20261102-001; todos atribuidos a la unidad anterior de esta conversación."
trabajo_previo: "Dependencias, lock, angular.json y documentación anteriores preservados; copias y diff previo en TEMP/atomic-calidad-20261102-002."
contratos: "API pública, versión 5.22.0 y comportamiento activo del interceptor conservados. Los nombres accesibles de Select2 mantienen sus IDs y aria-labelledby."
roles: "Responsable /root; exploración gpt-6.1-sol bajo; constructor gpt-6.1-sol alto; juez gpt-6-astra máximo."
autorizaciones: "El usuario autoriza corregir lint, pruebas y pantalla blanca en Atomic UI. No se actualizan dependencias ni consumidores; no se confirma ni publica."
escalado: "Cualquier cambio de conducta activa de credenciales, autorización o contrato incompatible exige detener ese ajuste y reclasificar antes de escribir."
rollback: "Restituir únicamente los fragmentos propios desde respaldo/ de esta asignación, conservando íntegro el trabajo previo de dependencias y documentos."
```

Las rutas exactas permitidas se conservan en `reparto.json`: diez archivos de
producto, este roadmap, registros de cambios/lecciones, continuidad y archivo
histórico, manifiesto de distribución y desviación 003. El índice documental
raíz se actualizará como artefacto derivado obligatorio, respaldando su estado
previo. Las capturas contienen los 38 repositorios y los repartos se verifican
antes y después del trabajo.

La primera suite completa identificó dos selectores dependientes en
`select2-variant.spec.ts` fuera del reparto inicial. Se conserva su respaldo,
se verifica el confinamiento del primer tramo y se amplía antes de editar con
`reparto-final.json`: un tercer frente exclusivo para esa prueba, más los
registros de desviación 004 y 005 y la salida transitoria `documentation.json`.
Este último archivo fue regenerado por Compodoc al construir Storybook; se
preservó en TEMP y se restauró mediante los filtros Git originales. No se
entrega esa regeneración masiva. El primer control acusó ese artefacto; el
control posterior a su restitución pasó sin escrituras externas.

## Diseño acotado

Se sustituye el `require('@angular/compiler')` incompatible con el navegador
por el import ESM que ya existe. Se retiran imports no usados, un método de
ciclo de vida vacío y una isla privada de refresh sin llamadas desde el flujo
exportado. Se conserva `PUBLIC_URLS`, `isPublicUrl`, `belongsToApi`, clonación
con `withCredentials: true`, logout por 401 y propagación del error. El servicio
de autenticación y sus métodos públicos no se modifican.

Las pruebas dejan de esperar Bearer y comprueban cookies, origen exacto,
exclusión de terceros, ruta relativa sin base y ausencia de un Authorization
añadido. Se comprueba que las solicitudes excluidas se conservan intactas;
el interceptor no elimina credenciales que el llamador haya puesto de forma
explícita. `withCredentials` no prueba el atributo HttpOnly de la cookie,
responsabilidad del servidor. El cambio de expectativas se explica en la prueba
para que no se restaure el contrato obsoleto.

La etiqueta estándar de Select2 pasa de `label` no asociado a `span`,
conservando clase, ID, contenido, asterisco y `aria-labelledby`; el control es
un combobox personalizado, no un elemento HTML etiquetable por `for`. Se añade
una prueba de la asociación accesible en variantes estándar y flotante. No se
alteran estilos, API ni manejo del teclado.

## Aceptación y evidencia

| Criterio | Verificación | Resultado esperado e invalidación |
|---|---|---|
| Pantalla blanca | Navegador limpio, recarga y consola nueva; captura final | Interfaz renderizada y sin error de bootstrap; HTTP 200 solo no acredita este criterio. Repetir si cambia bootstrap, configuración o dependencias |
| Lint | `npm run lint` | Código 0, cero errores; los avisos se informan sin silenciarlos |
| Pruebas | `npm test -- --watch=false --browsers=ChromeHeadless` | Suite completa sin fallos; preservar escenarios de exclusión y añadir regresiones pertinentes |
| Bootstrap y distribución | `npm run build`, `npm run lib:build`, `npm run package:check` | Código 0 y manifiesto regenerado para las fuentes realmente modificadas |
| Componentes compartidos | `npm run governance:check`, `npm run build-storybook` | Corridas completas acreditadas; no se rebaja cobertura por duración |
| UI | `verificar-adn-frontend.ps1 -RaizAAuditar <proyecto>` y verificación de catálogo | Sin defectos introducidos; `check:atomic` no existe en la fuente, solo en consumidores |
| Gobierno y revisión | Compuertas rápidas, índice, documentación, desviaciones, confinamiento y sondeo; juez independiente | Salidas/códigos originales, diferencias atribuidas y revisión de criterios sobre el árbol final |

La primera prueba de `governance:check` puede iniciarse en paralelo con la
implementación: la inspección de todos sus accesos a `atomicRoot` identifica
únicamente maquinaria de gobierno, ChoiceControl, tokens de componentes,
archivos de versión Node y la versión del paquete, ninguno modificado por esta
unidad. Se conservan huellas de esas entradas; el resto de la cadena se ejecuta
después de estabilizar las fuentes y el manifiesto. Si cambia una entrada real
de la prueba inicial, se invalida y repite únicamente su evidencia afectada.

Los originales de esta asignación se conservan en
`C:/Users/cotaha/AppData/Local/Temp/atomic-calidad-20261102-002/`. La consola de
una pestaña limpia reprodujo únicamente `Dynamic require of
"@angular/compiler" is not supported` en el bootstrap y una página sin contenido.
El síntoma y la insuficiencia de la comprobación HTTP anterior quedan en
`DESVIACION-20261102-003.md`.

## Tareas

- [x] Atribuir trabajo previo, reproducir la pantalla blanca y capturar el sondeo.
- [x] Diseñar corrección sin cambio de política y verificar reparto previo.
- [x] Corregir producto y preservar las dependencias anteriores.
- [x] Verificar lint, suite completa, builds, gobierno y renderizado.
- [x] Revisar independientemente, actualizar continuidad y preparar la acreditación posterior a la última escritura según el protocolo de cierre.

## Resultado

| Criterio | Resultado observado | Originales en el directorio de evidencia |
|---|---|---|
| Bootstrap | Encabezado y tabla visibles en `/showcase`, cero errores posteriores a recarga, apertura/cierre y foco Select2 estándar y flotante comprobados | `navegador-final.json`, `atomic-ui-corregido.png`, `select2-navegador.json`, `select2-flotante-navegador.json` |
| Lint | Código 0, cero errores y 22 avisos; sin cambios de reglas ni silencios | `lint-final.log`, `lint-final.exit.txt` |
| Karma completo | Código 0, `TOTAL: 708 SUCCESS`; nueve casos adicionales, sin eliminación de escenarios | `karma-final.log`, `karma-final.exit.txt` |
| Builds aplicación/biblioteca | Ambos con código 0; la aplicación informa un total inicial de 1.10 MB, sin advertencia de presupuesto en ese original. La única edición posterior fue una prueba excluida explícitamente de ambas compilaciones; 16 entradas permanecen iguales | `build-app.log`, `build-lib.log`, sus códigos, `constructor-reutilizacion-builds.json` |
| Storybook | Código 0, compilación completa; advertencias de tamaño conservadas | `storybook-build.log`, `storybook-build.exitcode.txt` |
| Manifiesto | 337 archivos; SHA-256 del árbol `b0672c297a694c13d8cc19041dbd15da0f4e16d403a2e643aa66dc43e8865c5f` | `manifiesto.log`, `distribution/atomic-source-manifest.json` |
| Gobierno completo local | Código 0, cadena completa hasta `check:focus`, incluidos catálogo/API, tokens, pruebas negativas, generador y `package:check` | `governance.log`, `governance.exitcode.txt` |
| Inicio paralelo de gobierno | Node v24.18.0 antes/después; 25 entradas reales descubiertas y conservadas, ninguna diferencia. La primera prueba usa esos archivos y fixtures; las siguientes se ejecutaron tras estabilizar fuente/manifiesto | `gobierno-entradas-antes.json`, `gobierno-entradas-comparacion.json` |
| ADN frontend | Código 0: `PASA`; el verificador informa 10 archivos bajo `src/app` | `adn-frontend.txt`, `adn-frontend.exitcode.txt` |
| Compuertas rápidas | Código 0, las 12 ejecutadas pasaron; 12 controles saltados según el lanzador y la cobertura proporcional declarada | `compuertas-rapidas.txt`, `compuertas-rapidas.exitcode.txt` |
| Documentación del proyecto | Código 0, 1 proyecto aprobado, cero fallos y 2 avisos; el manifiesto documental verifica su roadmap canónico, no reemplaza la lectura de esta ficha | `documentacion.txt`, `documentacion.exitcode.txt` |

El primer intento de Karma bajo sandbox no accedió a directorios superiores y
no constituye una ejecución de las pruebas; se conserva en `karma-sandbox.log`.
La siguiente ejecución expuso los dos selectores dependientes y se conserva
en `karma.log`; solo `karma-final.log` acredita el estado final. Los resultados
no se reconstruyen ni se convierten fallos en éxitos.

Las desviaciones 003, 004 y 005 están cerradas con sus originales: bootstrap
visible, pruebas de variantes completas y Compodoc restituido. La salida
generada de Compodoc permanece como entrada temporal del build de Storybook;
`documentation.json` conserva su contenido canónico y estado original en el
árbol de trabajo. La documentación histórica anterior se conserva, y el corte
de tipografía se trasladó íntegro a la bitácora para mantener tres cortes.

El juez `gpt-6-astra`, esfuerzo máximo, contrastó el diff y la documentación
sustantiva sin hallazgos de implementación. Su comprobación por AST confirma
que `PUBLIC_URLS`, `isPublicUrl`, `belongsToApi` y el flujo exportado conservan
sus ramas activas; solo se retiró la inyección sin uso. También recalculó las
entradas de producto, configuración y gobierno, las siete huellas y el
manifiesto canónico, e inspeccionó la captura del navegador. El constructor
`gpt-6.1-sol`, esfuerzo alto, no juzgó su propio trabajo. El original de esa
verificación independiente está en `juez-verificacion-producto.json`.

Las entradas reales de evidencia se conservan en `huellas-finales.json` y
`originales-sha256.json`: fuentes y fixtures, dependencias, configuraciones,
herramientas, comandos, alcance, entorno, documentación generada de Storybook
y capturas. Las salidas generadas y el archivo canónico restaurado son
entradas distintas. Un cambio pertinente invalida la evidencia que dependa
de él y exige repetir esa comprobación.

## Acreditación posterior a la última escritura

Después de esta última escritura documental se regenerará y verificará el
índice; se repetirán los controles afectados de codificación, coherencia,
contratos, referencias y documentación. Los controles de fuente y gobierno
mantienen su evidencia porque sus entradas permanecen idénticas. Se conservarán
las salidas y códigos en los archivos `*-cierre.txt` del directorio TEMP.

El confinamiento del producto y del índice se ejecutará contra los repartos y
capturas previos; `sondeo-despues.json` y `sondeo-cierre.txt` compararán los 38
repositorios contra la captura inicial, distinguiendo trabajo propio de
actividad concurrente y sin atribuir autoría ajena sin evidencia. La revisión
global leerá esos originales. Se acreditarán al final las desviaciones 003,
004 y 005, junto con las preexistentes, sin escribir después en repositorios.
El resultado de esta acreditación se informa en la entrega y sus originales
TEMP; ningún fallo se interpreta como aprobación.

La fuente conserva `main` y `7633d4c81384cfda10d6e7108750870ca44b8dc0`. La unidad
de producto queda completada con cero errores de lint, 708 pruebas correctas y
arranque visible. Se mantienen los 22 avisos de lint; no son errores ni se
silencian. No se propagan estos cambios a consumidores ni se certifica un nuevo
atomicRef: la publicación continúa bajo el congelamiento del Guardián.

## Atribución del contexto concurrente

El sondeo de las 17:37:08 observó 52 diferencias en dos repositorios, con los
mismos 38 repositorios y sin movimientos de ramas, HEAD, remotos o referencias.
Los 20 archivos propios de Atomic y su recuento se vinculan al reparto; el
índice raíz es el artefacto derivado declarado. Las otras 29 rutas están bajo
`ventas-cxc/` y pertenecen al alcance documentado de `VCXC-20261102-001`.

La atribución no descansa en el nombre del directorio: se leyeron su roadmap y
los repartos original, final y de cierre, se preservaron copias con SHA-256 en
TEMP y se cotejó cada ruta descubierta. `sondeo-atribucion.json` acredita 29/29
rutas cubiertas por esos repartos, cero rutas sin cobertura. Los tres registros
de desviación observados declaran la misma asignación. No se atribuye autoría
individual ni se certifica la implementación externa, y este equipo no
escribió esas rutas.

La incidencia de contexto se conserva como desviación 006, declarada en
`reparto-cierre.json` antes de escribirla; el tramo anterior del producto pasó
confinamiento con código 0. La captura del índice ya contenía buena parte de
ese trabajo y cualquier diferencia posterior se contrasta con el mismo
alcance externo. Los códigos 1 del sondeo o del confinamiento de la raíz se
conservan literalmente y se explican por ruta, sin convertirlos en un aprobado
global. El confinamiento propio de Atomic se acredita por separado.
