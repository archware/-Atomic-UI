---
title: "Escritura de registros anterior a la captura completada"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-11-02"
last_updated: "2026-11-03"
document_type: "desviación"
status: "vigente"
version: "1.0.1"
id: "DESVIACION-ATOMIC-20261102-004-006"
asignacion: "ATOMIC-20261102-004"
repositorio: "-Atomic-UI"
fecha: "2026-11-02"
estado: "corregida"
severidad: "media"
apartado_roto: "§6"
---

# Escritura de registros anterior a la captura completada

## Qué se esperaba

La ampliación del reparto y la captura previa debían terminar antes de crear
los registros 004 y 005, incluso si el comando había devuelto una sesión activa.

## Qué se observó

El orquestador continuó con apply_patch al recibir una sesión en ejecución.
Los registros se crearon a las 22:31:00 y 22:31:02; reparto-final-v3.json se
escribió a las 22:31:17 y su captura terminó a las 22:32:01, America/Lima.
Por tanto, esa captura no es previa a esas dos escrituras y no se presenta
como tal. Se añadieron únicamente esos registros y la referencia del roadmap;
no se editó producto ni trabajo paralelo en esa llamada.

## Evidencia

TEMP/atomic-seguridad-20261102-004 conserva los repartos, capturas, códigos y
salidas originales. El campo marca de colision-final-v3-antes.json y los
tiempos de creación de ambos registros hacen observable la secuencia real.
La sesión 3474 solo se acreditó al terminar con cero; ese cero no corrige
retrospectivamente el orden de operaciones.

## Corrección mínima que preserva la doctrina

Se conserva la desviación y se espera explícitamente la terminación de las
sesiones 98133 y 90937 antes de escribir los registros posteriores. Ambas
capturas terminan con cero y preceden a esta escritura. El cierre compara
también contra los sondeos y capturas iniciales: ninguna captura posterior
sustituye la procedencia real de las escrituras anteriores.

## Lo que NO se debe hacer

No tratar una sesión devuelta como un comando terminado, retroceder marcas
de tiempo, reconstruir una captura previa ni anunciar que el cero posterior
acredita una secuencia que no ocurrió.
