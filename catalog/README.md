# Catálogo ejecutable de Atomic UI

Este directorio traduce el ADN visual y UX de Atomic a contratos pequeños que
una persona, un agente o una compuerta pueden consultar sin leer todo el
repositorio.

## Fuentes de verdad

- `components/`: API real, variantes, estados, accesibilidad, tokens y evidencia
  de cada componente canónico.
- `recipes/`: composiciones permitidas para intenciones frecuentes de página.
- `ux-rules/`: comportamiento obligatorio que no cabe en la API aislada de un
  componente.
- `schemas/`: forma versionada de los requisitos y documentos anteriores.

El código fuente sigue siendo la autoridad de ejecución. El gate del catálogo
impide publicar contratos rotos, referencias ausentes y variantes inválidas.

## Consulta compacta

```powershell
npm run catalog:query -- --component button --variant soft
npm run catalog:query -- --intent crud --format json --pretty
npm run agent:context -- --intent crud --variant modal-catalog
```

Los filtros se combinan con `AND`; varios valores separados por coma son
alternativas. No cargue todo el catálogo cuando una consulta dirigida basta.

## Extender Atomic

1. Implemente primero el componente o la variante con API tipada, tokens,
   OnPush, accesibilidad, pruebas y una historia que muestre sus estados.
2. Actualice o cree su contrato en `components/` usando únicamente valores que
   existan en el código.
3. Actualice una receta solo si la nueva composición es reutilizable.
4. Añada una regla UX solo si aplica a más de una pantalla o componente.
5. Ejecute `npm run catalog:check` y las pruebas del componente.

No cree variantes cosméticas duplicadas. Cada eje debe expresar una decisión
independiente —por ejemplo `density`, `tone`, `size` o `layout`— y cada valor
debe tener un significado de uso.
