---
title: "Diferencias externas en el sondeo de dependencias"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-11-03"
last_updated: "2026-11-03"
document_type: "desviación"
status: "vigente"
version: "1.0.3"
id: "DESVIACION-ATOMIC-20261102-004-008"
asignacion: "ATOMIC-20261102-004"
repositorio: "-Atomic-UI"
fecha: "2026-11-03"
estado: "abierta"
severidad: "media"
apartado_roto: "§3"
---

# Diferencias externas en el sondeo de dependencias

## Qué se esperaba

El sondeo del §3 debe contrastar ramas, referencias y árbol de trabajo
contra la apertura y atribuir las diferencias antes del cierre. El reparto
004 no autoriza mutaciones de referencias ni cambios en otros productos.

## Qué se observó

La captura intermedia descubre 80 rutas diferentes de Atomic UI, todas
cubiertas por el reparto de la unidad o por los frentes 005 y 006 declarados.
En la raíz compartida quedan ocho rutas fuera de esa correlación automática:
una guía de continuidad, el registro de la unidad externa ECO-20261102-001
y seis rutas de Métodos de pago de `ventas-cxc`. Se observan también cambios
en otros proyectos. No se infiere un autor individual de estos archivos.

En `pdf-tool` se mueve únicamente `refs/heads/master`, de
`1b16950d2fa10fc1043fec919e8ed44bcb2f7e77` a
`e0e11cb06d0dbcfc433472dd82516c9502f77353`; la rama y los remotos coinciden.
El usuario confirmó el trabajo paralelo en ese proyecto anteriormente. La
confirmación se conserva como contexto, sin atribuirle la autoría del avance
de la referencia. No cambian las referencias de Atomic UI ni de la raíz.

Una captura posterior identifica 14 archivos de interfaz y pruebas que
cambiaron después del corte de 801 casos. El lock y las huellas físicas de
las dependencias permanecieron iguales. Diez rutas corresponden al reparto
de 005; otras cuatro quedan como actividad externa observada, sin atribuir
autoría: `scripts/check-theme-contrast.mjs`, el ejemplo `showcase-forms` y
los tokens `_tokens-components.css` y `_tokens-primitives.css`. Los archivos
permanecen intactos. Tres hojas de estilo del nuevo corte tienen huellas
distintas a las de la última versión observada del manifiesto de distribución.
El verificador canónico devolvió código uno para esa versión. Se observó
después una regeneración externa a las 11:47:16, hora local, de
`fa3a8656…` a `ead6b7c3…`. El fallo previo se conserva para su versión;
la comprobación de empaquetado del nuevo manifiesto se mide aparte.

Durante `package:check` se observaron nuevas fuentes de `about-dialog` y
cambios del barrel de componentes y del blueprint de diálogos. Los archivos
del componente tienen marcas entre las 12:06:34 y las 12:06:39. La prueba
aislada de distribución pasó; el verificador del inventario real detuvo el
dry-run porque cambió el inventario físico mientras lo calculaba. No se
regenera el manifiesto ni se editan esas fuentes desde 004. Esta última
variación no se atribuye a una persona ni se da por probada con el lote de
interfaz anterior.

## Evidencia

`sondeo-intermedio-candidatura2.json` y su código cero conservan la captura.
El contraste auxiliar `atribucion-intermedia-candidatura2.json` termina con
código uno y enumera las rutas y metadatos. El contraste de referencias
queda en `pdf-tool-cambio-referencias-observado.json`; la lectura de Git
identifica el cambio del 2 de noviembre a las 22:36:55, hora local. La
desviación externa `DESVIACION-ECO-20261103-001` se identifica por su propio
frontmatter, fuera de 004. Los originales se conservan en TEMP de la unidad.
`identidad-ui-pre-adopcion.entradas-despues.json` conserva el nuevo corte y
`ui-acotada-arbol-vivo.resultado.json` acredita las cinco regresiones repetidas
en él, con 802 casos aprobados y las siete huellas iguales antes y después.
La captura `sondeo-acotado-intermedio.json` identifica también seis rutas de
catálogo y procedencia Dart sin declaración individual en el reparto 004.
No se editan ni se asigna autor a esas rutas. Se conservan
`atribucion-acotada-intermedia.json` y `preflight-manifiesto-paralelo-1128.log`.

## Corrección mínima que preserva la doctrina

Se dejan intactas las rutas y referencias externas. Se distingue el cambio
observado de una acción del equipo y se repite la captura al cerrar. El acta
conserva el código y las diferencias reales; la atribución no transforma el
sondeo en verde. Esta observación media no autoriza a reparar otro frente.

## Lo que NO se debe hacer

No restaurar el HEAD de `pdf-tool`, editar la guía ni sobrescribir Métodos
de pago para limpiar el resultado. No atribuir cambios al usuario o a un
agente concreto a partir de una coincidencia temporal. No ocultar cambios de
referencias con una captura nueva que sustituya la apertura.
