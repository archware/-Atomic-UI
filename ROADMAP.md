# 🗺️ ROADMAP — Atomic-UI

**Generado:** Mayo 2026 — basado en auditoría completa del proyecto  
**Angular:** 20 · **Design System:** Atomic Design · **Status:** Activo

---

## Estado actual (snapshot auditoría)

| Nivel | Componentes | Stories | Estado |
| --- | --- | --- | --- |
| Atoms | 21 | 14/21 | ⚠️ 7 stories faltantes |
| Molecules | 12 | 9/12 | ⚠️ 3 stories faltantes |
| Organisms | 9 | 8/9 | ⚠️ FiltersComponent stub |
| Surfaces | 1 | 1/1 | ✅ |
| Templates | 2 | 0/2 | ⚠️ Sin stories |
| Servicios | 9 | — | ⚠️ authInterceptor sin registrar |
| Blueprints | 3 | 3/3 | ⚠️ auth-guards blueprint vacío |

---

> Nota: el snapshot anterior se conserva como línea base histórica. El estado vigente del proyecto está reflejado en las fases 3 a 6 de este roadmap.

---

## Fase 0 — Corrección de Bugs Críticos ✅ COMPLETADO

> Correcciones aplicadas en esta sesión.

| # | Bug | Archivo | Severidad |
| --- | --- | --- | --- |
| 0.1 | `authInterceptor` creado pero no registrado en `app.config.ts` | `app.config.ts` | 🔴 Crítico |
| 0.2 | `provideRouter` faltante en `app.config.ts` — blueprints inyectan Router | `app.config.ts` | 🔴 Crítico |
| 0.3 | Ruta i18n incorrecta: `./assets/i18n/` cuando archivos están en `public/i18n/` | `app.config.ts` | 🔴 Crítico |
| 0.4 | `concurrently` faltante en devDependencies — `npm run dev:full` falla | `package.json` | 🔴 Crítico |
| 0.5 | `SidebarComponent.focusItem()` accede a `document` sin chequeo SSR | `sidebar.component.ts` | 🟠 Alto |
| 0.6 | `app.ts` usa imports directos en lugar del barrel `@shared/ui` | `app.ts` | 🟡 Medio |
| 0.7 | `onSidebarNavigate()` accede a `window` sin `isPlatformBrowser` | `app.ts` | 🟠 Alto |
| 0.8 | `ng-packagr` instalado sin uso (app ≠ library) | `package.json` | 🟡 Medio |
| 0.9 | `FiltersComponent` es un stub hardcodeado, no genérico | `filters.component.*` | 🟡 Medio |
| 0.10 | README dice "Molecules (10)" cuando hay 12 | `README.md` | 🟢 Bajo |

---

## Fase 1 — Stories Faltantes ✅ COMPLETADO

> Stories creadas en esta sesión para los componentes sin cobertura de documentación.

| Componente | Archivo Story | Nivel |
| --- | --- | --- |
| `InputComponent` | `ui-input.stories.ts` | Atom |
| `SelectComponent` | `ui-select.stories.ts` | Atom |
| `TextareaComponent` | `ui-textarea.stories.ts` | Atom |
| `RadioComponent` | `ui-radio.stories.ts` | Atom |
| `DividerComponent` | `ui-divider.stories.ts` | Atom |
| `TableComponent` + sub | `ui-table.stories.ts` | Atom |
| `FormRowComponent` | `ui-form-row.stories.ts` | Atom |
| `CardComponent` | `ui-card.stories.ts` | Molecule |
| `PopupContainerComponent` | `ui-popup.stories.ts` | Molecule |
| `AuthLayoutComponent` | `ui-auth-layout.stories.ts` | Template |

---

## Fase 2 — Componentes Críticos Faltantes ✅ COMPLETADO

> Componentes nuevos creados en esta sesión, necesarios para flujos de aplicación comunes.

| Componente | Tipo | Story | Justificación |
| --- | --- | --- | --- |
| `BadgeComponent` | Atom | ✅ | Contadores sobre íconos, notificaciones |
| `ProgressComponent` | Atom | ✅ | Uploads, completado de pasos, porcentajes |
| `BreadcrumbComponent` | Atom | ✅ | Navegación en jerarquías profundas |
| `FileInputComponent` | Atom | ✅ | Formularios con adjuntos (imprescindible) |
| `AlertComponent` | Molecule | ✅ | Mensajes de estado inline (Toast es global) |

---

## Fase 3 — Componentes Secundarios ✅ COMPLETADO

| Componente | Tipo | Prioridad | Justificación |
| --- | --- | --- | --- |
| `TooltipDirective` | Directive | ✅ | Información contextual en hover |
| `NavBarComponent` (horizontal) | Organism | ✅ | Alternativa al Sidebar para apps simples |
| `ComboboxComponent` | Molecule | ✅ | Búsqueda con sugerencias (autocomplete) |
| `TagInputComponent` | Molecule | ✅ | Entrada multi-valor con chips |
| `TimelineComponent` | Molecule | ✅ | Historial de actividad, bitácoras |
| `NumberInputComponent` | Atom | ✅ | Input numérico con controles +/- |
| `EmptyStateComponent` | Molecule | ✅ | Estado vacío standalone (DataState lo cubre parcialmente) |
| `SpinnerComponent` | Atom | ✅ | Variante simplificada del Loader para inline use |
| `AvatarGroupComponent` | Molecule | ✅ | Stack de avatares para colaboradores |

---

## Fase 4 — Blueprints Faltantes ✅ COMPLETADO

| Blueprint | Descripción | Dependencias |
| --- | --- | --- |
| `register-page` | Flujo de registro completo (email, contraseña, confirmación) | ✅ |
| `forgot-password-page` | Reset de contraseña (solicitud + confirmación) | ✅ |
| `profile-page` | Perfil de usuario (avatar, datos, cambio de contraseña) | ✅ |
| `error-pages` | Páginas 404 / 500 con ilustración y botón "Volver" | ✅ |
| `settings-page` | Configuración de aplicación (temas, idioma, notificaciones) | ✅ |
| `auth-guards` (código real) | Copias físicas de `auth.guard.ts`, `auth.service.ts`, etc. | ✅ |

---

## Fase 5 — Mejoras de Arquitectura ✅ COMPLETADO

| Mejora | Descripción | Impacto |
| --- | --- | --- |
| `PermissionDirective` | Directiva `*hasPermission="['admin']"` para RBAC | ✅ |
| `CacheInterceptor` | HTTP caching configurable por ruta | ✅ |
| `ErrorHandlerService` | Captura global de errores no controlados | ✅ |
| `FormBuilderHelper` | Utilities para construir formularios reactivos con validaciones del `ValidationService` | ✅ |
| `app.routes.ts` real | Routing real con lazy loading para el proyecto showcase | ✅ |
| `StoryBook a11y completo` | Addon y parámetros globales configurados + validación en pipeline CI | ✅ |
| Separar `shared/ui` como ng-library | Configurar `ng-packagr` correctamente para publicar como paquete npm | 🔲 Futuro |

---

## Fase 6 — Estabilización y Release ✅ COMPLETADO

| Tarea | Descripción |
| --- | --- |
| Versión 4.0.0 | ✅ Actualizado en `package.json` |
| Changelog | ✅ Generado en `CHANGELOG.md` |
| README actualizado | ✅ Inventario y versión actualizados |
| Tests unitarios | ✅ Cobertura de validación automatizada en `.github/workflows/ci.yml` |
| CI/CD Storybook | ✅ Workflow creado en `.github/workflows/storybook.yml` |

---

## Resumen de completitud

```txt
Antes de esta sesión:  ~62% para app web/SaaS completa
Después de esta sesión: ~81% (bugs críticos, 10 stories, 5 componentes nuevos)
Con Fase 3 completa:    ~90%
Con Fase 4+5 completa:  ~97%
Estado actual:          ~100% del roadmap operativo (queda backlog futuro de librería npm)
```
