# Política obligatoria Atomic-first

> Marcador normativo: `ATOMIC_GOVERNANCE_REQUIRED`
>
> Versión de política: `1.0.0`

Este documento es un contrato, no una recomendación. `-Atomic-UI` es la única
fuente de verdad para átomos, moléculas, organismos, superficies, plantillas,
tokens y patrones visuales reutilizables de todas las aplicaciones consumidoras.

## Invariantes

1. Ningún objeto visual reutilizable nace en una aplicación consumidora.
2. Si un objeto no existe, el trabajo visual se detiene en el consumidor: se
   crea, prueba, documenta y valida primero en `-Atomic-UI`.
3. Solo después de quedar verde en Atomic puede propagarse al consumidor.
4. Cada componente local debe figurar en `docs/atomic-provenance.json` con su
   ruta fuente.
5. Una copia `exact` debe conservar hashes idénticos. Una copia `adapted` exige
   una justificación concreta y un registro de decisión versionado.
6. Las features no pueden recrear botones, diálogos, tablas ni controles de
   formulario nativos, ni aplicar CSS sobre su estructura interna.
7. Los estilos visuales deben usar tokens Atomic; quedan prohibidos estilos
   inline y colores fijos en features o componentes UI consumidores.
8. `npm run check:atomic` es obligatorio antes de pruebas y build, y en CI.

## Lo que sí pertenece al consumidor

Las páginas, navegación, permisos, contratos API, estado, validación y reglas de
negocio se implementan en la aplicación. Su interfaz se compone con objetos del
ADN Atomic. Un layout específico puede existir en una feature siempre que no se
convierta en un segundo sistema visual ni duplique un componente reutilizable.

## Flujo obligatorio

1. Buscar el objeto en `-Atomic-UI/src/app/shared/ui` y en su barrel `index.ts`.
2. Si falta, crearlo en la capa Atomic correcta y agregar sus tokens.
3. Añadir pruebas de contrato, accesibilidad y responsive en Atomic.
4. Ejecutar pruebas, auditoría de tokens, gate de gobierno y build de Atomic.
5. Propagar el objeto; registrar procedencia, modo y archivos exactos.
6. Ejecutar `npm run check:atomic`, pruebas, build y E2E del consumidor.
7. Actualizar changelogs de fuente y consumidor con el mismo identificador.

## Excepciones

No existen excepciones silenciosas. Toda adaptación debe conservar la fuente
Atomic, declarar `justification` y enlazar un `decisionRecord`. Modificar o
desactivar el gate desde un consumidor constituye una violación: cualquier
cambio de política se realiza primero en `-Atomic-UI` y se propaga como una
nueva versión normativa.
