---
title: "Fixture insuficiente en una prueba negativa del matcher"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-11-02"
last_updated: "2026-11-03"
document_type: "desviación"
status: "vigente"
version: "1.0.1"
id: "DESVIACION-ATOMIC-20261102-004-004"
asignacion: "ATOMIC-20261102-004"
repositorio: "-Atomic-UI"
fecha: "2026-11-02"
estado: "corregida"
severidad: "media"
apartado_roto: "§7"
---

# Fixture insuficiente en una prueba negativa del matcher

## Qué se esperaba

Retirar Symbol.match en una copia aislada debía hacer fallar el caso de glob
que depende de ese protocolo, sin modificar el árbol compartido.

## Qué se observó

La primera fixture solo incluía un archivo coincidente y no distinguió el
mutante del comportamiento correcto. El arnés rechazó ese falso verde; la
primera ejecución completa de negativas terminó con uno, sin aprobarse.

## Evidencia

TEMP/atomic-seguridad-20261102-004 conserva negativas-v1.log y su código uno,
la fixture y el arnés originales. negativas-v2 y las negativas definitivas
de FileList conservan la base válida, el mutante detectado y la restauración.
Los originales iniciales no se sustituyen por las repeticiones.

## Corrección mínima que preserva la doctrina

Se añade b.ts como archivo no coincidente. El resultado espurio del mutante
queda observable y la prueba falla al retirar el protocolo; restaurarlo
devuelve cero. La corrección afecta al arnés temporal, sin cambiar fachada,
motor, dependencias ni expectativas legítimas del producto.

## Lo que NO se debe hacer

No contar una negativa como instalada cuando el mutante pasa, ni quitar el
mutante, reducir el corpus o modificar la implementación para acomodar una
fixture que no observa el defecto.
