---
title: "Orden Atomic: apertura tras render y destino de foco estable"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-11-02"
last_updated: "2026-11-02"
version: "1.0.1"
change_id: "ATOMIC-20261102-006"
document_type: "orden de obra"
status: "vigente"
asignacion: "ATOMIC-20261102-006"
frente: "atomic_apertura_y_foco"
ruta: "completa"
toca_credenciales_o_motores: false
---

# Orden Atomic

El frente corrige el orden de apertura declarativa de FormDialog y añade un resolvedor opcional de foco de retorno. Conserva los cambios previos de ATOMIC-003/005, incluidos fondo, foco de errores, controles y estilos. No cambia InputComponent, su CVA, reconciliación de valores restaurados ni reglas de negocio. El orquestador conserva roadmap, reparto, sondeos, desviaciones y dictamen externo.

## 1. Cota exacta

Rutas relativas a -Atomic-UI; 24 archivos, sin ampliación tácita:

1. src/app/shared/ui/organisms/crud-dialog/crud-dialog.ts.
2. src/app/shared/ui/organisms/crud-dialog/crud-dialog.spec.ts.
3. src/app/shared/ui/organisms/form-dialog/form-dialog.ts.
4. src/app/shared/ui/organisms/form-dialog/form-dialog.html.
5. src/app/shared/ui/organisms/form-dialog/form-dialog.spec.ts.
6. src/app/shared/ui/templates/pagina-crud/pagina-crud.ts.
7. src/app/shared/ui/templates/pagina-crud/pagina-crud.html.
8. src/app/shared/ui/templates/pagina-crud/pagina-crud.spec.ts.
9. src/app/shared/ui/molecules/modal/modal.component.ts.
10. src/app/shared/ui/molecules/modal/modal.component.spec.ts.
11. src/stories/ui-crud-dialog.stories.ts.
12. src/stories/ui-form-dialog.stories.ts.
13. src/stories/pagina-crud.stories.ts.
14. src/stories/ui-modal.stories.ts.
15. catalog/components/crud-dialog.json.
16. catalog/components/form-dialog.json.
17. catalog/components/pagina-crud.json.
18. catalog/components/modal.json.
19. docs/CONTRATO_CATALOGOS_CRUD.md.
20. CHANGELOG.md.
21. LESSONS_LEARNED.md.
22. docs/CONTINUIDAD_AGENTES.md.
23. docs/BITACORA_CONTINUIDAD_CORTES_HISTORICOS.md.
24. distribution/atomic-source-manifest.json, únicamente mediante el generador canónico.

Los hashes previos fijan la base de trabajo real. No se restaura un archivo completo a HEAD, no se sustituye WIP y no se edita governance/consumer, políticas, baseline, versiones, atomicRef ni manifiestos de procedencia de consumidores.

## 2. Apertura declarativa y carrera del CVA

FormDialog actualmente usa effect para llamar showModal antes de que el DOM proyectado refleje writeValue. La reproducción del consumidor muestra un formulario de políticas cuyo modelo debería contener 500 y termina en 0 al abrir; esa reproducción no demuestra por sí sola la causa interna.

Antes de corregir, el constructor añade un host de prueba con ReactiveFormsModule, FormDialog e InputComponent reales: el formulario permanece montado y cerrado con límite inicial 0; en el mismo turno se asigna 500 al FormControl y opened=true. La apertura enfoca el input. La prueba exige FormControl e input.value iguales a 500 después de render/foco y reapertura, y document.activeElement en el control esperado. No inspecciona signals protected, sustituye el CVA, llama métodos privados ni añade API para el ensayo. El ensayo original con effect debe fallar por restitución indebida a 0. También se conserva un campo 35 y se comprueba que no hay cruce de controles. Si ese defecto no se reproduce, se informa orden_incompleta para esta causa y no se modifica Input por conjetura.

La corrección exacta es sustituir el effect del constructor por afterRenderEffect, conservando sus condiciones opened/open y cierre. Se retira el import effect si queda sin uso. La API imperativa showModal/close conserva su comportamiento; no se introduce setTimeout, polling, retardo arbitrario, un segundo formulario ni un bloqueo del foco. Se preservan los tests de Input que acreditan restauración/autocompletado legítimos al enfocar y desenfocar. El mutante aislado vuelve únicamente a effect y debe producir el fallo del host; limpio/defecto/detección/restaurado se conservan en TEMP.

## 3. Contrato aditivo de foco

Las siguientes firmas públicas se añaden sin cambiar las existentes:

```typescript
// CrudDialog, FormDialog, ModalComponent y PaginaCrud:
readonly resolverFocoRetorno = input<(() => HTMLElement | null) | null>(null);
// PaginaCrud:
obtenerDestinoFocoRetorno(): HTMLElement;
```

resolverFocoRetorno se evalúa al restaurar, nunca al abrir. Si entrega un destino conectado, perteneciente al mismo documento, externo al diálogo y capaz de recibir foco, ese destino tiene prioridad. Si devuelve null, falla al enfocar o lanza una excepción, se intenta el origen capturado al abrir; la excepción del callback no impide el cierre ni se imprime. Sin callback se conserva el retorno al origen. No se enfoca body como sustituto ni se modifica el tabindex del destino entregado para fingir éxito.

Se descartan destinos desconectados, ocultos, aria-hidden, aria-disabled, disabled o dentro de un ancestro inert/hidden. Después de focus({ preventScroll: true }) se verifica activeElement; encontrar un nodo no equivale a enfocarlo. Un destino eliminado entre resolución y uso no se considera éxito. No se restaurará el foco sobre otra ventana abierta ni se robará el foco de una reapertura posterior.

CrudDialog conserva closed como cierre efectivo y ejecuta la restauración una sola vez después del siguiente render, con referencia cancelable y generación de apertura. Abrir de nuevo o destruir invalida la restauración pendiente. No se cambia el contrato de cancelled ni el bloqueo del consumidor. FormDialog pasa el callback al CrudDialog en su plantilla, manteniendo busy, opened y outputs.

ModalComponent conserva su cierre por destrucción: captura callback y origen, cancela foco de error pendiente y restaura en una microtarea posterior a retirar su DOM. La microtarea comprueba que no exista otra ventana modal abierta que recibiría un robo de foco. Su foco inicial pendiente se invalida al destruir. No se programa afterNextRender usando un injector ya destruido, no se emite closed desde ngOnDestroy y no se duplica el éxito del consumidor.

PaginaCrud transmite resolverFocoRetorno a sus diálogos CRUD y de confirmación. obtenerDestinoFocoRetorno devuelve su propio HTMLElement de host, estable mientras se recargan las filas. El host se declara region con nombre accesible derivado de titulo y tabindex=-1, sin estilo nuevo ni entrada al orden normal de tabulación. Este destino público permite al consumidor devolver foco al catálogo tras una escritura sin consultar la estructura privada de botones o filas. La elección de usarlo pertenece al consumidor; el callback por defecto continúa siendo null.

Las clases ya exportadas conservan sus barrels; no nace un tipo o servicio nuevo que requiera otra exportación. Catálogo y contrato documentan callback, prioridad, fallbacks, destino de catálogo, momento de apertura y límites. Las historias usan componentes reales y muestran origen retirado al recargar, callback estable, cierre/cancelación y el host 0→500; no simulan reglas financieras.

## 4. Pruebas y criterios

Se exige cobertura de: retorno tradicional sin callback; destino explícito aunque desaparezca la fila; callback evaluado después del cierre; null, excepción, destino desconectado/oculto/disabled/inert y destino no enfocable; origen retirado; reapertura antes de restaurar; destrucción; ausencia de robo de foco hacia otra ventana; propagación por FormDialog/PaginaCrud; Modal destruido por confirmación. La comprobación utiliza document.activeElement real y no solo spies de focus. El host de carrera se ejecuta también después de cerrar y reabrir y preserva el modelo durante foco/blur.

Las guardas nuevas se descubren desde diff/no rastreados con AST o barrido no vacío y se agrupan por responsabilidad. En copia TEMP se verifica una variante que omite el callback/usa el origen retirado y otra que permite restauración de una generación anterior; deben fallar sus casos concretos. La carrera effect es otra familia. No se insertan defectos en el árbol compartido ni se acepta timeout/compilación como detección. Los cuatro pasos conservan código, fuentes, huellas y resultados originales.

Con dependencias existentes se ejecutan npm.cmd run agent:context -- --intent crud --variant modal-catalog, pruebas de los cuatro componentes y de Input, npm.cmd run catalog:check, npm.cmd run check:catalog-api, npm.cmd run check:focus, npm.cmd run lint, npm.cmd test -- --watch=false, npm.cmd run build, npm.cmd run lib:build y npm.cmd run build-storybook. Se regenera el manifiesto únicamente mediante npm.cmd run package:manifest y se ejecuta npm.cmd run governance:check. No se instala ni publica paquete. Cada fallo externo se conserva con su atribución; no se debilita una compuerta para presentar verde.

La revisión visual utiliza Storybook local con escenarios sintéticos y teclado. El juez compara el delta contra las copias previas, reproduce las pruebas sin servicios reales y lee originales del constructor. Se ejecutan diff --check, codificación y controles documentales; scripts PowerShell usan -NoProfile -ExecutionPolicy Bypass -Command con propagación de LASTEXITCODE. La corrida global pertenece al orquestador.

## 5. Entrega, procedencia y rollback

La evidencia conserva WIP previo, entradas/entorno, fallo original de la carrera, fuentes finales, catálogo, pruebas, build/Storybook, negativas y observaciones de foco. Cambios de código, template, fixture, dependencias o API invalidan las comprobaciones relacionadas. Continuidad conserva máximo tres cortes y traslada íntegros los excedentes; el contrato distingue implementación de adopción.

La publicación permanece congelada: no commit, push, reset ni checkout. La fuente gobernada sucia impide acreditar atomicRef; un build correcto no levanta ese bloqueo. La integración candidata solo puede ensayarse en una copia del consumidor aislada en TEMP. shared/ui, código de adopción y procedencia del consumidor actual permanecen intactos hasta una propagación íntegra autorizada por el Guardián y verificable por CI, conforme a governance/consumer/MIGRAR_A_5.22.md y los invariantes 14/15 de ATOMIC_GOVERNANCE.md. No se modifican políticas ni hashes a mano. El rollback es el parche inverso del delta propio sobre las copias previas y conserva todo cambio anterior. No se aplica automáticamente ni se borra evidencia.
