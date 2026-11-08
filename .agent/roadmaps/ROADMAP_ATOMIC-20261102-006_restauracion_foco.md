---
title: "Restauración del foco al sustituir el disparador"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-11-02"
last_updated: "2026-11-03"
document_type: "roadmap de implementación"
status: "completado"
version: "1.2.0"
change_id: "ATOMIC-20261102-006"
---

# Restauración del foco al sustituir el disparador

## Ficha de cambio por riesgo

El propietario autorizó resolver los pendientes de Productos, incluida la
corrección upstream del foco. Se conserva la ruta `completa` del conjunto por
sus dependencias de seguridad y persistencia. La mejora Atomic es aditiva:
un destino público de restauración permite devolver el foco cuando una
recarga sustituye la fila que abrió el editor. Sin resolvedor se conserva
el retorno al disparador; cuando el consumidor aporta un destino explícito
válido, este tiene prioridad conforme a la orden cerrada. No se buscarán
descendientes privados desde la feature.

La raíz Git es `C:/Users/cotaha/source/repos/-Atomic-UI`, rama `main`, OID
`7633d4c81384cfda10d6e7108750870ca44b8dc0`. El sondeo válido de 38 repositorios
del 2026-11-02 a las 23:13:11 -05:00 está custodiado en
`C:/Users/cotaha/AppData/Local/Temp/codex-cierre-pendientes-cxc-20261102-c57b27b4/sondeo-antes.json`.
Los 106 cambios previos, en particular las unidades 003 y 005 sobre diálogos,
tipado y controles, quedan protegidos. La orden cerrada y el reparto exacto
precederán a las escrituras de producto.

El congelamiento de publicación sigue vigente: no se realizarán commits,
push, reset ni checkout. La autorización de código local no certifica un
atomicRef publicado. El instalador tampoco permite hoy instalar sobre una
raíz Git compartida sin modo de auditoría; no se modificará esa restricción
ni se falsearán hashes para cerrar el consumidor.

## Diseño y aceptación

- [x] Explorar contratos y confirmar ausencia de destino alternativo público.
- [x] Fijar firmas, orden, reparto, copias previas y captura de colisión.
- [x] Implementar destino aditivo y restauración verificable en CrudDialog y Modal.
- [x] Probar foco real, disparador desmontado, destino inválido y reapertura.
- [x] Actualizar pruebas, Storybook, catálogo y documentación pública.
- [x] Propagar el candidato compatible bajo custodia y declarar su procedencia pendiente.
- [x] Ejecutar controles Atomic, construcción y revisión independiente.
- [x] Acreditar confinamiento, sondeo comparado y desviaciones finales.

La [verificación temporal en Productos](C:/Users/cotaha/AppData/Local/Temp/codex-cierre-pendientes-cxc-20261102-c57b27b4/productos-foco-candidato.json)
acreditó el foco estable durante y después de la recarga y el retorno a
«Editar» al cancelar. Con la adenda 1.0.3 de `VCXC-20261102-004` se propagó
el candidato revisable de 17 rutas al consumidor `ventas-cxc` bajo custodia
([adopcion-atomic-revisable.patch](C:/Users/cotaha/AppData/Local/Temp/codex-cxc-integracion-20261103/adopcion-atomic-revisable.patch)),
aprobando las **132 suites y 1.762 pruebas unitarias** (`0` fallos) y `npm run build`
con `docs/atomic-provenance.json` intacto (procedencia pendiente de publicación del
OID canónico por el Guardián).

## Evidencia y reversión

Construcción `gpt-6.1-sol` y revisión `gpt-6-astra` serán independientes.
Los comandos y siete categorías de huellas se conservarán en el temporal
del sondeo. El rollback retirará únicamente el delta de esta asignación
frente a sus copias previas, sin sobrescribir el WIP de otros frentes.

## Resultado y revisión

La [orden 1.0.1](ORDEN_ATOMIC-20261102-006_restauracion_foco.md) fija las 24
rutas del constructor. La fuente añade el resolvedor opcional de foco,
el destino accesible estable de PaginaCrud y la apertura declarativa de
FormDialog tras renderizar. Se preservan la API imperativa y la reconciliación
del Input. La publicación y certificación de procedencia siguen condicionadas
a la autoridad del Guardián y al flujo soportado.

La caracterización temprana conserva `carrera-original.log`: el primer intento
bajo sandbox no pudo resolver directorios de esbuild por acceso denegado y no
acredita un defecto funcional. La repetición autorizada fuera de esa restricción
sí ejecutó ChromeHeadless: `carrera-effect.log` obtuvo un caso fallido y seis
correctos, con el modelo y el DOM restituidos indebidamente a cero. La corrección
de apertura tras render obtuvo siete casos correctos; la validación final del
frente contiene 801 pruebas correctas, 108 específicas y 34 de Modal.
La prueba adicional de aria-disabled detecta la regresión que había sobrevivido
en la suite histórica de 800. Las siete negativas finales se ejecutaron en
TEMP y acreditaron detección funcional y restauración con siete categorías
originales. El inventario runtime por AST contiene cuatro fuentes, 259 sitios
y 70 relevantes en siete métodos modificados; no se declara cobertura
exhaustiva por ese recuento.

Lint, construcción, biblioteca, catálogo, foco y Storybook obtuvieron 0.
El manifiesto canónico conserva 337 fuentes, con el árbol propagable
`386c85a20877b07389978c225d2eb3d492656d219d4481375c788007dbe9f5c6`.
El caso de prueba añadido no pertenece a ese inventario. La reutilización
del Storybook se contrastó sobre 539 entradas de fuentes y configuración.
La corrida completa de gobierno ejecutada por el responsable terminó en 0
en la sesión 60660, con stdout, stderr y código originales conservados.
Ese resultado corresponde al origen y no certifica atomicRef del consumidor.

## Precisión de custodia y corrección editorial relacionada

La desviación de codificación 007 conserva la recuperación de cinco rutas;
el cotejo independiente del delta sigue siendo condición de cierre. La
desviación del 2026-11-03 registra un proceso de gobierno sin código final
recuperable y la repetición completa a cargo del responsable.

La corrida completa de compuertas encontró una línea blanca sobrante al final
del roadmap de la unidad 005. El orquestador corrigió únicamente esa cola bajo
reparto de gobierno separado: se conservaron idénticos sus 12.884 bytes previos
al salto final y se retiró un byte LF adicional. No se modificó el contenido,
metadatos ni autoría de aquella unidad. La copia previa y la comparación de
bytes se conservan en el temporal de la asignación.
