# Changelog

Todas las modificaciones importantes de este proyecto se documentan en este archivo.

## [4.0.0] - 2026-05-27

### Added

- Nuevos atoms: `Badge`, `Breadcrumb`, `FileInput`, `NumberInput`, `Progress`, `Spinner`, `TooltipDirective`.
- Nuevos molecules: `Alert`, `AvatarGroup`, `Combobox`, `TagInput`, `Timeline`, `Popup` story/documentacion reforzada.
- Nuevo organism: `NavBar`.
- Nuevos blueprints: `register-page`, `forgot-password-page`, `profile-page`, `settings-page`, `error-pages`.
- Blueprint `auth-guards` completado con archivos concretos de referencia/reexport.
- `PermissionDirective` para control de acceso por roles.
- `CacheInterceptor` con invalidacion por patron y TTL configurable por headers.
- `GlobalErrorHandlerService` para captura global de errores.
- `FormBuilderHelper` para validaciones y helpers reutilizables en formularios reactivos.
- Workflow CI/CD de Storybook en `.github/workflows/storybook.yml`.
- Workflow de validacion de build/lint/test en `.github/workflows/ci.yml`.

### Changed

- `app.config.ts` ahora registra:
  - `provideRouter(routes)` con rutas reales.
  - `authInterceptor` y `cacheInterceptor` en `provideHttpClient`.
  - `GlobalErrorHandlerService` como `ErrorHandler` global.
- `app.routes.ts` migrado a lazy loading sobre blueprints reales del repositorio.
- `README.md` y `src/stories/Configure.mdx` actualizados con inventario real y version 4.0.0.
- `package.json` actualizado a version `4.0.0`.
- `ROADMAP.md` actualizado con estado de fases 3, 4 y 5 como completadas.

### Fixed

- Registro de `authInterceptor` faltante.
- Wiring de rutas que no apuntaban a componentes existentes.
- Compatibilidad i18n en loader (`public/i18n` -> `./i18n/...`).
- Duplicados y faltantes de export en el barrel `src/app/shared/ui/index.ts`.
- Ajustes de runtime en `ErrorPagesComponent` para leer `data.code` de ruta.

### Notes

- La ejecucion local de `npm` no esta disponible en este entorno de agente.
- La validacion tecnica completa queda automatizada en GitHub Actions mediante `ci.yml`.
