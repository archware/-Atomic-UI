# Blueprints del showcase

Los directorios de esta carpeta son demostraciones históricas usadas por la
aplicación y Storybook de Atomic. Pueden contener datos de ejemplo, APIs
anteriores o patrones imperativos y por eso no son artefactos de producción.

`blueprints.manifest.json` registra esa clasificación de forma explícita. El
bootstrap de proyectos no copia estos directorios y la compuerta debe rechazar
cualquier blueprint nuevo no clasificado que incumpla la ley Atomic-first.

Para generar UI consumible use el contrato `ui-requirement` y las recetas de
`catalog/recipes/` mediante `npm run generate:ui`. El reemplazo canónico del
antiguo `crud-table` es `atomic.recipe.modal-catalog.v1`.
