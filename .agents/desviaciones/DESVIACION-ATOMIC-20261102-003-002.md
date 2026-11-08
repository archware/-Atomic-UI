---
title: "Prueba reentrante que inicialmente no detectaba la doble emisión"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-11-02"
last_updated: "2026-11-02"
document_type: "desviación"
status: "corregida"
version: "1.0.0"
id: "DESVIACION-ATOMIC-20261102-003-002"
asignacion: "ATOMIC-20261102-003"
repositorio: "-Atomic-UI"
fecha: "2026-11-02"
estado: "corregida"
severidad: "alta"
apartado_roto: "§7"
---

# Prueba reentrante que inicialmente no detectaba la doble emisión

## Qué se esperaba

El §7 de orquestación exige que una regresión falle al reintroducir el defecto
y vuelva a pasar tras restaurarlo. La orden de accesibilidad exige impedir
la doble emisión reentrante de la confirmación.

## Qué se observó

La primera mutación aislada que emitía antes de consumir la intención terminó
con código cero y ocho pruebas correctas. El click nativo sobre el mismo botón
evitaba su recursión y la expectativa no ejercía la reentrada programática.
El constructor comunicó el hueco y detuvo la candidatura de esa prueba.

Solo se corrigió `pagina-crud-accordion.spec.ts`; el código de ejecución,
historias y catálogo conservaron sus hashes. Esa escritura coincidió con el
primer cálculo del manifiesto: su guarda rechazó el inventario físico que
estaba cambiando. Se repitió ese cálculo tras la señal final de estabilidad,
sin modificar ni debilitar la guarda.

## Evidencia

Los originales `negativa-emision-unica-defecto.*` en
`TEMP/atomic-avisos-20261102-003` conservan el código cero inicial. El refuerzo
usa la salida pública `ButtonComponent.buttonClick` durante el suscriptor:

- `negativa-reentrada-base.*`: código cero, ocho pruebas correctas.
- `negativa-emision-unica-corregida-defecto.*`: código uno, detecta dos
  emisiones durante la reentrada.
- `negativa-emision-unica-corregida-restaurado.*`: código cero, ocho pruebas
  correctas después de restaurar.

El juez recalculó los hashes de las mutaciones y confirmó que las otras
24 rutas de producto y los 14 archivos protegidos permanecían iguales.

## Corrección mínima que preserva la doctrina

Se conserva el click inicial real y se emite el evento público Atomic para
ejercer la reentrada dentro del suscriptor. La prueba negativa ahora falla
por la doble emisión y su restauración pasa. Se repiten lint y la suite
completa sobre el spec final. Se conservan los builds: sus configuraciones
excluyen los specs y sus entradas pertinentes permanecen iguales.

## Lo que NO se debe hacer

No retirar la negativa, aceptar su primer código cero como prueba de
protección, alterar el componente para acomodar el test ni introducir el
defecto en el árbol compartido servido en 4200. No sobrescribir los originales
fallidos ni entregar un manifiesto calculado mientras cambian sus entradas.
