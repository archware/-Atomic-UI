---
title: "Recuperación del guardado de la orden técnica"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-11-02"
last_updated: "2026-11-03"
document_type: "desviación"
status: "vigente"
version: "1.0.1"
id: "DESVIACION-ATOMIC-20261102-004-002"
asignacion: "ATOMIC-20261102-004"
repositorio: "-Atomic-UI"
fecha: "2026-11-02"
estado: "corregida"
severidad: "media"
apartado_roto: "§17.2"
---

# Recuperación del guardado de la orden técnica

## Qué se esperaba

La orden cerrada del arquitecto debía existir en TEMP, con hash y criterios
exactos, antes de iniciar la construcción.

## Qué se observó

El arquitecto informó un límite de longitud de CreateProcess al intentar
guardar la orden. Después, el proveedor interrumpió su turno por capacidad
del modelo. El barrido inmediato de TEMP no encontró archivos ORDEN. Se
conservan las especificaciones y fuentes propuestas previas, sin sustitución
silenciosa de modelo ni lanzamiento del constructor con una orden incompleta.

## Evidencia

Los mensajes del arquitecto registran el límite de CreateProcess y el error
`Selected model is at capacity`. TEMP/atomic-seguridad-20261102-004 conserva
`parche-storybook-especificacion.json`, los bundles original y propuesto y las
probetas verificadas. La captura del reparto documental ampliado precede a
esta escritura.

## Corrección mínima que preserva la doctrina

Se reanuda al mismo arquitecto para guardar exclusivamente sus dos órdenes
ya cerradas en bloques pequeños mediante apply_patch. Se exige verificar
existencia, contenido y SHA-256 antes de permitir construcción. Los agentes
mantienen sus modelos, esfuerzo y separación de responsabilidades.

El arquitecto recuperó ambas órdenes completas con apply_patch por bloques.
El orquestador comprobó existencia, ausencia de marcadores pendientes y hashes:
construcción `0f283f4810c7c0e1d534573c66c149f64fba93bc62c0e6563808efe44a809a19`
y documentación `99e2df590351c47ac443b5d2b01220c9a008b9ba0aff7da637d55a0d5df20d19`.
La escritura de producto se habilita después de esa comprobación. El usuario
autorizó Terra máximo para arquitectura y revisión; se preserva la orden
recuperada de Astra y se aplica la autorización al juez independiente.

## Lo que NO se debe hacer

No sustituir al arquitecto sin autoridad, inventar una aprobación, lanzar al
constructor con referencias inexistentes ni reconstruir la orden desde una
implementación terminada.
