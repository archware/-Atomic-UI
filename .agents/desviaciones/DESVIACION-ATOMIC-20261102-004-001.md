---
title: "Instalación temporal incompleta del adaptador"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-11-02"
last_updated: "2026-11-03"
document_type: "desviación"
status: "vigente"
version: "1.0.1"
id: "DESVIACION-ATOMIC-20261102-004-001"
asignacion: "ATOMIC-20261102-004"
repositorio: "-Atomic-UI"
fecha: "2026-11-02"
estado: "corregida"
severidad: "media"
apartado_roto: "§17.0.3"
---

# Instalación temporal incompleta del adaptador

## Qué se esperaba

La probeta debía resolver el adaptador local y el motor corregido con
instalación reproducible y árbol completo antes de modificar el proyecto.

## Qué se observó

Un override directo a `file:./tools/compatibilidad-minimatch`, sin dependencia
raíz declarada, terminó npm install y npm ci con cero y audit vacío. Sin
embargo, npm ls terminó con uno y ELSPROBLEMS: faltaba el motor declarado
por el adaptador. El lock resolvió el enlace relativo desde glob y no desde
la raíz esperada. No se modificaron las dependencias del producto.

## Evidencia

Los originales `probeta-overrides-install.log`, `probeta-overrides-ci.log`,
`probeta-overrides-ls.json` y el lock de `probeta-overrides/` se conservan en
TEMP/atomic-seguridad-20261102-004. La instalación aislada usa npm 11.16.0 y
Node 24.18.0. La auditoría vacía no acredita resolución ni compatibilidad.

## Corrección mínima que preserva la doctrina

Se contrasta una dependencia raíz local explícita con override referenciado,
manteniendo visible el motor bajo alias. La prueba se repite en otra carpeta
temporal y se exige npm ci, npm ls y resolución real correctos antes de
aprobar el diseño. El arquitecto recibe el fallo y cierra la orden a partir
de la medición válida.

Las probetas 2 y 3 declaran la dependencia raíz local y referencian su spec
mediante `$minimatch`. Install, ci y ls terminan con cero. La probeta 3 valida
además los overrides por rango y repite ci y ls con npm 11.12.1, también con
cero; el entorno principal usa npm 11.16.0. El motor corregido permanece
declarado y resuelto bajo alias. El aviso adicional de glob 11.1.0 de esa
probeta corresponde a un consumidor moderno de prueba que no se incorpora al
producto. Se preservan el primer fallo y todas las repeticiones.

## Lo que NO se debe hacer

No instalar este lock incompleto en Atomic UI, ocultar ELSPROBLEMS, retirar
dependencias del manifiesto ni anunciar ausencia de vulnerabilidades a partir
de una instalación que no contiene el motor requerido.
