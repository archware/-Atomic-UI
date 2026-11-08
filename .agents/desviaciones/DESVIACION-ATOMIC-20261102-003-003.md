---
title: "Diferencias de ejecución y presentación detectadas en Storybook"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-11-02"
last_updated: "2026-11-02"
document_type: "desviación"
status: "corregida"
version: "1.0.0"
id: "DESVIACION-ATOMIC-20261102-003-003"
asignacion: "ATOMIC-20261102-003"
repositorio: "-Atomic-UI"
fecha: "2026-11-02"
estado: "corregida"
severidad: "alta"
apartado_roto: "§17.0.2"
---

# Diferencias de ejecución y presentación detectadas en Storybook

## Qué se esperaba

La orden exige comprobar el componente real, sus tonos y su geometría en
navegador. El §17.0.2 distingue esa prueba de una compilación correcta.

## Qué se observó

La historia nueva del acordeón se ejecuta, pero las historias históricas cuyos
IDs comienzan por número fallan al crear su elemento raíz. El renderer de
Angular intenta usar el ID como nombre de etiqueta y el navegador emite
`InvalidCharacterError`. La construcción de Storybook había terminado con
código cero. Se descubrió al comprobar los tonos de Chip.

Además, el juez detectó en las capturas de 1280 y 375 que los fondos de la
cabecera y el pie sobresalen en las esquinas redondeadas de la confirmación.
El chasis conserva su radio y overflow visible; las superficies proyectadas
carecen del recorte que aportaba la caja anterior.

## Evidencia

`TEMP/atomic-avisos-20261102-003/storybook-id-invalido.json` conserva DOM,
consola y URL reales; su PNG muestra el fallo. La URL de reproducción es la
historia `3-organisms-datatable--listado-con-importes` del Storybook construido.
El diagnóstico es `Failed to execute 'createElement' on 'Document'` por el
nombre de etiqueta que empieza por número.

`confirmacion-1280.png`, `confirmacion-375.png` y
`navegador-confirmacion-final.json` conservan la primera presentación revisada.
La fuente previa se conserva en `respaldo/`.

## Corrección mínima que preserva la doctrina

El arquitecto cerró dos adendas y se verificó el reparto antes de construir.
El hook público `renderToCanvas` delega al renderer instalado con una copia
tipada del contexto cuyo ID de montaje tiene prefijo válido. No se mutan los
IDs públicos. El índice completo conserva sus 623 entradas; las cuatro URLs
exigidas y Docs se ejecutan, y un control actualiza solo su instancia.

Se añaden únicamente cuatro radios lógicos interiores calculados mediante
los tokens existentes. Las capturas definitivas muestran radio exterior de
12px, borde de 1px e interiores de 11px, sin puntas ni cambios de tamaño. Las
nuevas capturas se conservan con sufijo `definitiva`; las originales siguen
disponibles. X y Cancelar continúan operables y restauran el foco.

TypeScript y ESLint de las dos configuraciones, lint de aplicación, las
762 pruebas, los tres builds y el gobierno Atomic completo terminan con
código cero. El manifiesto final conserva 337 fuentes y huella
`72ade64e0804d6687d2c1afbeac57c5c9362232fb1950518298417df0735c0fe`.

## Lo que NO se debe hacer

No modificar node_modules, renombrar masivamente historias, actualizar
versiones sin encuadre, aceptar el build como prueba de ejecución, ocultar el
error ni aplicar overflow al host de CrudDialog. No alterar el chasis global
para resolver las esquinas de una composición ni introducir un rediseño.
