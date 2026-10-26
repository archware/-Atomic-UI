---
title: "Desbloqueo de pruebas focales de accesibilidad"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-10-26"
last_updated: "2026-10-26"
document_type: "roadmap de asignación"
status: "validación focal cerrada; aprobación global no acreditada"
version: "1.0.0"
change_id: "ATOMIC-20261026-001"
---

# Desbloqueo de pruebas focales de accesibilidad

## Autoridad y clasificación

El dueño solicita proceder con los mejores pendientes después de priorizar
la conciliación documental y el arnés Atomic. El diagnóstico previo localiza
seis expectativas TS2345 en cuatro especificaciones limpias. El arreglo solo
estrecha nodos presentes antes de comparar sus identificadores; no modifica
componentes, contratos, estilos, dependencias, controles o manifiestos.

```yaml
asignacion: ATOMIC-20261026-001
ruta: rapida
justificacion: "Corrección de tipado en pruebas existentes con idéntica cobertura y exigencia explícita de presencia del nodo. No altera comportamiento compartido ni acepta ausencia de DOM como éxito."
repositorio: "C:/Users/cotaha/source/repos/-Atomic-UI"
rama: main
oid: dd93734a3eea40b87d46b4990976231fe2d6ca19
```

La ruta se reclasifica antes de escribir si surge un cambio de contrato,
componente, dependencia, control o cobertura. Constructor `gpt-6.1-sol`, alto;
juez independiente `gpt-6-astra`, máximo. El modelo fijado por el registro de
roles mantiene la separación. El responsable conserva las capturas y evidencia
principal bajo `.agent/auditorias/DOC-20261026-001/` de la raíz coordinadora.

## Reparto y protección

El constructor modifica únicamente estas pruebas:

- `src/app/shared/ui/atoms/input/input.component.spec.ts`.
- `src/app/shared/ui/atoms/select/select-variant.spec.ts`.
- `src/app/shared/ui/atoms/textarea/textarea.component.spec.ts`.
- `src/app/shared/ui/molecules/dropdown/dropdown-variant.spec.ts`.

El responsable actualiza este roadmap, registros y continuidad propios solo
mediante fragmentos aditivos; cualquier archivo que aparezca ocupado se
serializa. Se preservan las 45 rutas ajenas descubiertas, incluido el manifiesto,
plantillas, componentes, catálogo y herramientas de blueprints. La fuente es
un repositorio independiente: no se transfiere autoridad a consumidores.
El congelamiento de Git continúa vigente: no se confirma, publica, reinicia
ni cambia de rama; tampoco se instala ni modifica el enlace de dependencias.

## Diseño y aceptación

- [x] Capturar rama, OID, huellas y reparto antes del constructor.
- [x] Preparar copia nueva TEMP del HEAD mediante lectura Git, sin checkout,
  incorporando solo las cuatro pruebas propias cuando se validen sus huellas.
- [x] Confirmar dependencias completas existentes y lockfile idéntico; no
  ejecutar gestores de instalación ni escribir en el destino del enlace.
- [x] Conservar la salida de compilación inicial de los errores afectados.
- [x] Corregir las seis expectativas con presencia obligatoria y estrechamiento
  real del nodo, sin `any`, aserciones no nulas, eliminación de casos ni
  cambios de inclusión/exclusión de TypeScript.
- [x] Ejecutar en la copia aislada las cuatro suites afectadas y las focales
  ActionGroup/PaginaCrud aún no acreditadas, con salida y código íntegros.
- [x] Obtener juicio independiente, conservar diff y comprobar las huellas de
  las dependencias de prueba. No atribuir el resultado al árbol ajeno móvil.
- [x] Actualizar continuidad y evidencia con el corte comprobado; acreditar
  documentos, índice y custodia final sin propagar ni publicar.

Cada nodo esperado debe existir y conservar la relación de accesibilidad. La
comparación `null === null` no puede acreditar un DOM ausente. Las guardas de
presencia mantienen un fallo explícito, no omiten una expectativa. La llamada
Select de la línea 202 no es un séptimo error TS2345 confirmado y no se toca.
Los componentes y la configuración TypeScript permanecen idénticos al HEAD.

Las pruebas se limitan a la obligación afectada. El ensayo no acredita
`governance:check`, el paquete, manifiestos ocupados ni el árbol completo actual.
La evidencia posterior del corte anterior demuestra que `governance:test`
terminó y el comando global falló después por inventario físico cambiante;
no se supone un bucle permanente ni se altera la guarda para aprobarlo.

## Corte comprobado

La ejecución final conserva 70/70 casos y código 0. La copia inicial contiene
806 archivos: solo cambian las cuatro pruebas; los otros 802 conservan sus
bytes. El contraste con blobs Git normaliza CRLF; no se afirma identidad
byte a byte de todos los archivos de node_modules, pues el entorno inicial
registró versiones y lockfile, no una huella completa de ese directorio.

## Incidencia de ejecución

La desviación propia DESVIACION-ATOMIC-20261026-001-001 conserva el primer
ensayo de Angular con acceso denegado y los seis errores TS2345 previstos.
El reintento con permiso suficiente confirma solo los seis errores; el ensayo final pasa 70/70 y el juicio independiente lo aprueba.

## Deuda histórica conservada

La codificación documental global conserva código 1: 150 faltas de tilde ya
presentes en las copias previas. La validación global de desviaciones conserva
código 1 por DESVIACION-20260929-005 y su cita §3.1 inexistente en orquestación.
La unidad propia se verifica de forma focal; estos límites impiden anunciar
aprobación global de Atomic y no se corrigen fuera del reparto.

## Reversión

La reversión retira solo los fragmentos de las cuatro pruebas y la documentación
propia contra sus copias. No se restaura el árbol, se elimina trabajo ajeno,
se modifica el enlace de dependencias ni se recrea una migración.
