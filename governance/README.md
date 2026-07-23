# Gobierno obligatorio para consumidores Atomic

La carpeta `governance/consumer` es la fuente canónica de la política que deben
obedecer todas las aplicaciones. Sus archivos se propagan como copias exactas y
el propio gate rechaza cualquier modificación local.

## Aplicación nueva

```bash
npm run create:project mi-aplicacion -- --template=full
```

El generador copia el ADN, crea `AGENTS.md`, inventaría todos los componentes,
instala la política, el gate y el workflow de CI, y agrega `check:atomic` al
`package.json`. El proyecto no se considera creado si ese bootstrap falla.

## Aplicación existente

```bash
npm run governance:install -- C:\ruta\al\consumidor --ui-root=src/app/shared/ui
```

Después se ejecuta `npm run check:atomic` en el consumidor. Las adaptaciones
existentes deben declararse manualmente como `adapted`, con `justification` y
`decisionRecord`; el instalador registra como `exact` todo lo que acaba de
copiarse desde Atomic.

## Controles que convierten la política en ley

- `AGENTS.md` contiene el marcador obligatorio para cualquier agente.
- `atomic-provenance.json` inventaría cada directorio UI y su fuente.
- El gate verifica hashes de componentes exactos y de sus propios artefactos.
- Una adaptación sin justificación o registro de decisión falla.
- Features y páginas no admiten primitivas visuales nativas, estilos inline,
  colores fijos ni selectores hacia el DOM interno de controles.
- El workflow `Atomic governance` ejecuta la compuerta en push y pull request.
- La CI de `-Atomic-UI` prueba el bootstrap y cuatro violaciones negativas, y
  rechaza blueprints que incumplan la misma norma.

En GitHub se debe marcar el job `Atomic governance / atomic-governance` como
status check requerido de la rama protegida. Esa configuración del repositorio
es el único cerrojo externo que no puede expresarse dentro del código fuente.
