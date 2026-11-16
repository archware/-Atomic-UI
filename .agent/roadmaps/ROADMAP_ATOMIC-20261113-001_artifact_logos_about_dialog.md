---
title: "Mejora visual de Acerca de y rediseño de logos e ilustraciones como artefactos de ingeniería (Artifact Mangosta, Artifact Barracuda y Atomic UI)"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-11-13"
last_updated: "2026-11-14"
document_type: "roadmap"
status: "completado"
version: "1.0.0"
change_id: "ATOMIC-20261113-001"
---

# Mejora visual de Acerca de y rediseño de logos e ilustraciones como artefactos de ingeniería (Artifact Mangosta, Artifact Barracuda y Atomic UI)

## Encuadre y decisión

```yaml
asignacion: "ATOMIC-20261113-001"
ruta: "estandar"
justificacion: "Actualización de las imágenes e íconos de Acerca de (eliminando rótulos heredados 'DOCTRINA MANGOSTA' / 'DOCTRINA BARRACUDA' en favor de 'ARTIFACT MANGOSTA' / 'ARTIFACT BARRACUDA' con iconografía de artefactos de ingeniería), ajuste de relación de aspecto 16:9 de banners en AboutDialogComponent para evitar recorte vertical y alineación de textos residuales en ShowcasePageComponent, propagando activos actualizados a consumidores sin romper contratos ni trabajo previo."
objetivo: "Reemplazar los activos gráficos de src/assets/doctrinas/ con emblemas y banners de artefactos cohesivos (Artifact Mangosta, Artifact Barracuda, Atomic UI y @archware), corregir .about-credit-item__banner en about-dialog.component.css para mostrar relación 16:9 íntegra sin recorte vertical, alinear las referencias de ShowcasePageComponent a Artifact Mangosta / Artifact Barracuda y sincronizar los activos y el componente about-dialog en consumidores aplicables (pdf-tool y activos heredados en ventas-cxc)."
base:
  repositorio: "C:/Users/cotaha/source/repos/-Atomic-UI"
  rama: "main"
  oid: "33caab89f4f3619dd46b2aa4752c00d820fd17b8"
  estado: "Árbol de trabajo con cambios previos sin confirmar preservados íntegramente."
ficheros_permitidos:
  - "src/assets/doctrinas/*"
  - "src/app/shared/ui/organisms/about-dialog/about-dialog.component.css"
  - "src/app/shared/ui/organisms/about-dialog/about-dialog.component.spec.ts"
  - "src/app/pages/showcase/showcase-page.component.ts"
  - "src/app/pages/showcase/showcase-page.component.html"
  - "src/blueprints/dialogs-page/*"
  - "src/stories/ui-about-dialog.stories.ts"
  - "distribution/atomic-source-manifest.json"
  - "CHANGELOG.md"
  - "LESSONS_LEARNED.md"
  - "docs/CONTINUIDAD_AGENTES.md"
  - ".agent/roadmaps/ROADMAP_ATOMIC-20261113-001_artifact_logos_about_dialog.md"
no_tocar:
  - "git commit / push / reset / checkout (CONGELAMIENTO DE PUBLICACIÓN vigente)"
  - "Cambios previos en badge, chip, table, alert, select2, data-table, transaction-editor y tokens"
  - "SGP_BE y 10022024-BASE-WEB"
```

## Tareas verticales

1. **T1 — Diseño y generación de logos y banners de artefactos:**
   - Emblema `Artifact Mangosta` (crest hexagonal metalizado en oro imperial con silueta geométrica de mangosta y puerto hexagonal).
   - Emblema `Artifact Barracuda` (anillo reactivo zafiro/cian de 4 nodos con núcleo diamante y silueta geométrica de barracuda).
   - Emblema dual `Atomic UI` y emblema `@archware` cohesivos con diseño de artefactos.
   - Banners `16:9` con rótulos explícitos `ARTIFACT MANGOSTA`, `ARTIFACT BARRACUDA`, `ATOMIC UI` y `@archware`, verificando ausencia total de `DOCTRINA` y márgenes seguros sin recorte.
2. **T2 — Mejora de encuadre de banners en `<app-about-dialog>` y textos en Showcase:**
   - Actualizar `.about-credit-item__banner` en `about-dialog.component.css` a relación `aspect-ratio: 16 / 9;`, reestructurar `.about-credit-item` como tarjeta vertical sin canalón lateral y corregir la flexión de `.about-popup__scroll` y la extracción de modales/popups fuera de `<app-panel variant="elevated">` usando exclusivamente tokens gobernados y manteniendo el CSS bajo `6.00 kB`.
   - Agregar verificación en `about-dialog.component.spec.ts` para el encuadre de banners 16:9 sin desborde ni recorte forzado.
   - Reemplazar etiquetas residuales `Doctrina Mangosta` / `Doctrina Barracuda` en `showcase-page.component.ts` y `.html`.
3. **T3 — Gobierno, manifiesto y propagación a consumidores:**
   - Regenerar `distribution/atomic-source-manifest.json` (`npm run package:manifest`).
   - Copiar activos actualizados y cambio de `about-dialog.component.css` / `.spec.ts` a `pdf-tool/frontend` preservando su árbol sucio previo y actualizando su `localSha256` en `docs/atomic-provenance.json` únicamente para el archivo sincronizado de `about-dialog`.
   - Reemplazar las 5 imágenes heredadas de `ventas-cxc/public/assets/doctrinas/` por las versiones `ARTIFACT` sin alterar el resto de archivos de `ventas-cxc`.
4. **T4 — Verificación real y compuertas:**
   - `-Atomic-UI`: `npm run governance:check`, `npm run lint`, `npm test -- --watch=false --browsers=ChromeHeadless`, `npm run build`, `npm run lib:build`, `git diff --check`.
   - `pdf-tool/frontend`: compuertas de ADN, `npm test -- --watch=false`, `npm run build`, `git diff --check`.
   - `ventas-cxc`: `npm run check:atomic`, `npm run check:atomic-rules`.
   - Raíz: `& C:\Users\cotaha\source\repos\.agents\scripts\compuertas.ps1 -SoloRapidas`.
5. **T5 — Cierre de verificación, cascada `brand-dark`, vitrinas corporativas de «Acerca de Unión PDF» y alineación de procedencia (2026-11-14):**
   - `-Atomic-UI`: retirada la línea en blanco al final de `src/app/shared/ui/molecules/alert/alert.component.ts` (`git diff --check` exit 0), migradas las llamadas heredadas `vi.*` a `jasmine.clock()` en `alert.component.spec.ts` y catalogadas en `catalog/components/alert.json` las entradas de `Alert` y en `catalog/components/summary-list.json` la entrada `columns`. Corregida la cascada de `brand-dark` en `_tokens-semantic.css` (`[data-theme="brand-dark"]` en `BASE OSCURA COMPARTIDA`), `_tokens-components.css` (`:not([data-theme="brand-dark"])` sobre `.theme-dark`/`html.dark` y `--field-label-color-floated: var(--blue-400)`), `scripts/lib/atomic-tokens.mjs` (saneamiento de `:not(...)` en `tokensForTheme()`) y `app.spec.ts` / `tooltip.directive.spec.ts` / `showcase-feedback.component.spec.ts` (limpieza DOM `afterEach` y paridad real de clase `dark`). Sincronizados en `src/blueprints/dialogs-page/dialogs-page.component.{ts,html,spec.ts}` y `src/stories/ui-about-dialog.stories.ts` los textos corporativos de **Unión PDF** (`v0.5.3`), la tarjeta `Compilación Multiplataforma CI/CD & Binarios Nativos Autónomos` (`union-pdf-windows-x86_64.exe` PE64 `.exe`, `union-pdf-macos-arm64.app.tar.gz` / `union-pdf-macos-x86_64.app.tar.gz` Application Bundle `union-pdf.app` Mach-O 64-bit en `.app.tar.gz` y `union-pdf-linux-x86_64.tar.gz` ELF 64-bit en `.tar.gz`) y los enlaces a GitHub Releases y GitHub Actions. Regenerados `dart/atomic_tokens/` (`474` colores/tema), `distribution/atomic-source-manifest.json` (`345` fuentes, SHA-256 `cf9af920de0830fa5e98dea5809db2a6195fc546f7140abe9ab65cc7402480f0`) y `documentation.json`; verificados `npm run check:catalog-api` (`49` componentes, `458` entradas), `npm run catalog:check` (`62` entradas), `npm run governance:check` (`26` compuertas), `npm run lint`, `npx ng test --watch=false --browsers=ChromeHeadless` (`874/874 SUCCESS`), `npm run build` y `npm run lib:build`.
   - `pdf-tool/frontend`: agregado el salto de línea final en `src/app/shared/ui/atoms/chip/chip.component.ts`, sincronizada la corrección de cascada `brand-dark` en `frontend/src/styles/themes/_tokens-semantic.css` y `_tokens-components.css`, y actualizados los snapshots `localSha256` en `docs/atomic-provenance.json` para `badge.component.ts` y `chip.component.ts` junto con `about-dialog`, superando `npm run check:atomic:pin` (política `1.2.3`, `66` componentes y `5` servicios, exit 0), `check:types`, `check:angular`, `check:theme`, `check:css`, `npm test -- --watch=false` (`31/31` suites, `325/325` pruebas Vitest), `npm run build` (`0` avisos en `about-dialog.component.css`), `verificar-adn-frontend.ps1` y `git diff --check`.
