---
title: "Lectura de la clave vacía del lock de npm"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-11-02"
last_updated: "2026-11-03"
document_type: "desviación"
status: "vigente"
version: "1.0.1"
id: "DESVIACION-ATOMIC-20261102-004-003"
asignacion: "ATOMIC-20261102-004"
repositorio: "-Atomic-UI"
fecha: "2026-11-02"
estado: "corregida"
severidad: "media"
apartado_roto: "§17.0.3"
---

# Lectura de la clave vacía del lock de npm

## Qué se esperaba

La comparación debía leer íntegramente el lock candidato antes de comprobar
las versiones ajenas y antes de ejecutar npm ci.

## Qué se observó

ConvertFrom-Json rechazó la clave vacía de packages al no usar AsHashtable.
La comprobación posterior recibió datos nulos y emitió
VERSION_AJENA_ACTUALIZADA. Ese mensaje no mide una actualización real. El
comando terminó antes de instalar o adoptar el lock.

## Evidencia

La salida original del comando y
TEMP/atomic-seguridad-20261102-004/conservadora-comparacion-llamada-fallida.txt
conservan el fallo. La lectura válida posterior genera
conservadora-versiones-cambiadas-valida.json: únicamente cambia el reemplazo
de deepmerge y el enlace local de minimatch entre las rutas con versión
previa. Las dos versiones transitivas ajenas permanecen en 2.11.34 y 1.5.472.

## Corrección mínima que preserva la doctrina

Se usa AsHashtable, se activa fallo inmediato ante error y se repite la
comparación completa antes de continuar la probeta. La lectura correcta no
acredita todavía instalación, compatibilidad ni adopción del candidato.
Esos criterios conservan sus comandos y originales independientes.

## Lo que NO se debe hacer

No interpretar un resultado derivado de un parseo fallido como defecto del
producto ni editar el lock para eludir una limitación del lector.
