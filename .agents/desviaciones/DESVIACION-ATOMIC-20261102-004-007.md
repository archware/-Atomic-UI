---
title: "Contención explícita antes de retirar fixtures en Windows"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-11-02"
last_updated: "2026-11-03"
document_type: "desviación"
status: "vigente"
version: "1.0.1"
id: "DESVIACION-ATOMIC-20261102-004-007"
asignacion: "ATOMIC-20261102-004"
repositorio: "-Atomic-UI"
fecha: "2026-11-02"
estado: "corregida"
severidad: "media"
apartado_roto: "ninguno - regla ausente"
---

# Contención explícita antes de retirar fixtures en Windows

## Qué se esperaba

Antes de cada retirada o movimiento recursivo debía comprobarse que el
destino absoluto real permanecía dentro del directorio temporal autorizado.
La comprobación lexical de path.join no basta frente a enlaces o junctions.
La exigencia procede de las instrucciones de ejecución para Windows de esta
sesión. El barrido acotado no localiza un apartado numerado equivalente en
las dos doctrinas canónicas; el campo doctrinal declara esa ausencia, sin
atribuir el hecho al apartado que regula la apertura de desviaciones.

## Qué se observó

El juez informa que su probeta de versión retiró una instalación ficticia
creada por ella misma sin registrar antes la comprobación real de contención.
También se identificaron operaciones equivalentes en los arneses temporales
del constructor. No se reporta eliminación fuera de los fixtures propios;
la desviación consiste en omitir la comprobación previa exigida.

## Evidencia

Los originales permanecen en TEMP/atomic-seguridad-20261102-004 bajo
juez-version-independiente y los arneses de negativas iniciales. Las copias
seguras posteriores conservan la fuente original, el delta y sus hashes.
Los diagnósticos de corrección comprueban raíz, exterior y enlace de escape.

## Corrección mínima que preserva la doctrina

Las repeticiones usan copias nuevas con realpath previo y contención contra
el TEMP autorizado inmediatamente antes de operar. Rechazan la raíz misma,
destinos externos y enlaces que salgan; si el destino no existe, omiten la
operación. La prueba comprueba que rmSync no se alcanza para esos destinos.
Los originales se conservan sin modificarlos ni ejecutarlos de nuevo como
si ya contuvieran la defensa. El lote final identifica las copias seguras
como entradas nuevas y captura sus bytes antes y después.

## Lo que NO se debe hacer

No borrar a partir de una ruta meramente concatenada, ocultar el origen de
la copia segura ni modificar el original para simular que la validación
siempre estuvo instalada.
