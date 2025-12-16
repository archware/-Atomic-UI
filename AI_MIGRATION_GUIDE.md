# 🤖 Protocolo Universal de Migración Angular para Agentes IA

> **Versión**: 2.0  
> **Última Actualización**: Diciembre 2025  
> **Proyecto de Referencia**: Atomic-UI (Angular 20+, Standalone Components, CSS Tokens)

Este documento define el estándar y flujo de trabajo que un Agente de IA debe seguir para migrar, auditar y mantener aplicaciones Angular modernas, minimizando errores y corrupción de código.

---

## 📋 Tabla de Contenidos

1. [Fase de Reconocimiento](#1-fase-de-reconocimiento-context-awareness)
2. [Estrategia de Actualización](#2-estrategia-de-actualización-update-strategy)
3. [Protocolo de Conversión a Standalone](#3-protocolo-de-conversión-a-standalone)
4. [Sistema de Diseño Atómico](#4-sistema-de-diseño-atómico-atomic-design)
5. [Auditoría de CSS y Tokens](#5-auditoría-de-css-y-tokens)
6. [Reglas de Manipulación de Archivos](#6-reglas-de-manipulación-de-archivos-anti-corruption)
7. [Protocolo de Verificación](#7-protocolo-de-verificación-e-iteración)
8. [Checklist de Migración](#8-checklist-de-migración)

---

## 1. Fase de Reconocimiento (Context Awareness)

Antes de modificar código, el agente debe ejecutar las siguientes acciones:

### 1.1 Analizar Dependencias
```bash
# Leer package.json
cat package.json
```
- Identificar versión actual de Angular (`@angular/core`).
- Identificar librería de UI (Angular Material, PrimeNG, **Custom/Atomic**).
- Identificar herramientas de build (`@angular-devkit/build-angular`).

### 1.2 Mapeo de Arquitectura
- **NgModule vs Standalone**: Verificar presencia de `app.module.ts`.
- **Librería de componentes**: Ubicar en `src/app/shared/ui`.
- **Sistema de tokens CSS**: Verificar `src/styles/themes/`.

### 1.3 Estado de Salud Inicial
```bash
ng build
```
> Si falla, **priorizar reparación antes de migrar**.

---

## 2. Estrategia de Actualización (Update Strategy)

### 2.1 Limpieza de Entorno
```bash
rm -rf node_modules package-lock.json
npm install
```

### 2.2 Actualización Incremental
```bash
ng update @angular/cli @angular/core
```
Consultar [update.angular.io](https://update.angular.io) para Breaking Changes.

### 2.3 Dependencias de Terceros
Actualizar librerías críticas a versiones compatibles:
- `ngx-toastr`
- `@fortawesome/angular-fontawesome`
- Otras según proyecto.

---

## 3. Protocolo de Conversión a Standalone

Para cada componente objetivo, seguir estrictamente este orden:

### 3.1 Conversión del Archivo `.ts`

1. **Backup/Safety**: Leer el contenido completo del archivo antes de editar.
2. **Decorador**: Agregar `standalone: true` al decorador `@Component`.
3. **Imports**:
   - Eliminar el componente de `declarations` en cualquier NgModule.
   - Agregar propiedad `imports: []` al decorador.
   - **CRÍTICO**: Importar `CommonModule` (o `NgIf`, `NgFor` si Angular <17).
   - Importar módulos necesarios (`ReactiveFormsModule`, `RouterLink`).
4. **UI Kit**: Importar componentes atómicos necesarios.
5. **Verificación de Inputs**: Asegurar que propiedades usadas en template tengan `@Input()`.

### 3.2 Limpieza de Templates `.html`

- **Sintaxis de Control**: Si Angular >= 17, preferir `@if`, `@for` sobre `*ngIf`, `*ngFor`.
- **Bindings**: Verificar que no se usen inputs inexistentes (Error `NG8002`).

---

## 4. Sistema de Diseño Atómico (Atomic Design)

### 4.1 Estructura de Carpetas

```
src/app/shared/ui/
├── atoms/          # Elementos básicos (Button, Input, Loader, etc.)
├── molecules/      # Combinaciones (Datepicker, Modal, Select2, etc.)
├── organisms/      # Secciones complejas (Stepper, Tabs, Footer, etc.)
├── surfaces/       # Contenedores (Panel)
├── templates/      # Layouts (AuthLayout, LayoutShell)
├── services/       # ThemeService, ToastService
└── index.ts        # Barrel exports
```

### 4.2 Inventario de Componentes

| Capa | Componentes |
|------|-------------|
| **Atoms** | Avatar, Button, Checkbox, Chip, FloatingInput, FormError, IconButton, Input, LanguageSwitcher, Loader, Rating, Row, Select, Skeleton, Text, Toggle |
| **Molecules** | DataState, Datepicker, Dropdown, Modal, Pagination, Select2, TableActions, Toast, UserMenu |
| **Organisms** | Accordion, Filters, Footer, ScrollOverlay, Sidebar, Stepper, Tabs, ThemeSwitcher, Topbar |
| **Surfaces** | Panel |
| **Templates** | AuthLayout, LayoutShell |

### 4.3 Altura Estándar Global

**REGLA CRÍTICA**: Todos los controles interactivos deben usar `var(--control-height)`.

```css
:root {
  --control-height: 2.875rem; /* 46px */
}

.btn, .form-input, .form-select, .select2-trigger, .floating-input {
  height: var(--control-height);
}
```

---

## 5. Auditoría de CSS y Tokens

### 5.1 Estructura de Tokens

```
src/styles/themes/
├── _tokens-primitives.css  # Grises, radios, sombras
├── _tokens-brand.css       # Primary, Secondary, Accent
├── _tokens-semantic.css    # Success, Warning, Danger
├── _tokens-components.css  # Tokens específicos de componentes
├── _forms.css              # Estilos globales de formularios
├── _buttons.css            # Estilos globales de botones
└── index.css               # Entry point
```

### 5.2 Tokens de Marca (Brand)

| Token | Valor | Descripción |
|-------|-------|-------------|
| `--brand-primary-500` | `#5F295C` | Púrpura Profundo (Principal) |
| `--brand-secondary-500` | `#FFB800` | Ámbar/Dorado (Contraste) |
| `--brand-accent-500` | `#f5368a` | Rosa (CTAs, Acentos) |

### 5.3 Reglas de Auditoría CSS

1. **No hardcodear colores**: Usar siempre `var(--token-name)`.
2. **Verificar Dark Mode**: Cada token debe tener variante dark en `[data-theme="dark"]`.
3. **Alineación Vertical**:
   - Inputs de texto: `line-height: calc(var(--control-height) - 2px)`
   - Selects nativos: Usar padding explícito (`0.625rem`)
   - Flexbox: Usar `align-items: flex-start` + `min-height` para contenedores con texto variable.

### 5.4 Ejemplo de Token Correcto (Loader)

```css
/* En _tokens-components.css */
--loader-gradient-1: var(--brand-primary-600);
--loader-gradient-2: var(--brand-primary-400);
--loader-gradient-3: var(--brand-accent-500);
--loader-gradient-4: var(--brand-secondary-400);
--loader-gradient-5: var(--brand-secondary-500);

/* En loader.component.ts */
.loader-container {
  --gradient-1: var(--loader-gradient-1);
  /* NO: rgba(121, 53, 118, 0.7) */
}
```

---

## 6. Reglas de Manipulación de Archivos (Anti-Corruption)

### 6.1 Reglas Mandatorias

| Regla | Descripción |
|-------|-------------|
| **No ediciones parciales ciegas** | No usar search/replace en bloques grandes con riesgo de ambigüedad |
| **Verificar sintaxis** | Al editar arrays de imports, asegurar cierre correcto `]` |
| **No inventar rutas** | Verificar existencia de archivos con `list_dir` antes de añadir import |
| **Leer antes de editar** | Siempre leer el archivo completo antes de modificar |

### 6.2 Patrón Seguro de Edición

```typescript
// 1. Leer archivo completo
// 2. Identificar líneas exactas a modificar
// 3. Usar StartLine/EndLine precisos
// 4. Verificar compilación tras cambio
```

---

## 7. Protocolo de Verificación e Iteración

### 7.1 Ciclo de Feedback

Tras cada bloque de cambios (máximo 3-5 archivos):

```bash
ng build  # Más rápido que ng serve
```

### 7.2 Resolución de Errores Comunes

| Error | Acción |
|-------|--------|
| `Component X is not standalone` | Convertir componente X a standalone |
| `Can't bind to 'Y' since it isn't a known property` | Revisar `@Input()` o importar módulo correcto |
| `NG8002: Unknown element` | Importar el componente en el array `imports` |
| `TS2339: Property 'X' does not exist` | Agregar `@Input() X: type;` a la clase |

### 7.3 Regla de Persistencia

> Si un error persiste tras **2 intentos**, revertir a un estado seguro o pedir intervención humana.

---

## 8. Checklist de Migración

### Pre-Migración
- [ ] Leer `package.json` y verificar versión de Angular
- [ ] Ejecutar `ng build` para establecer línea base
- [ ] Identificar estructura de carpetas UI (`src/app/shared/ui`)
- [ ] Verificar presencia de sistema de tokens (`src/styles/themes`)

### Durante Migración
- [ ] Convertir componentes a standalone uno por uno
- [ ] Verificar imports de cada componente
- [ ] Actualizar sintaxis de control flow (`@if`, `@for`)
- [ ] Verificar altura estándar (46px / `var(--control-height)`)

### Post-Migración
- [ ] Ejecutar `ng build` sin errores
- [ ] Verificar Dark Mode funcional
- [ ] Auditar colores (no hardcoded)
- [ ] Actualizar README.md con inventario de componentes

---

## 📁 Archivos de Referencia

Para facilitar la portabilidad, el agente debe buscar estos archivos:

| Archivo | Propósito |
|---------|-----------|
| `src/styles/themes/_tokens-brand.css` | Colores de marca |
| `src/styles/themes/_tokens-components.css` | Tokens de componentes |
| `src/app/shared/ui/index.ts` | Barrel exports de componentes |
| `README.md` | Documentación del proyecto |

---

**Instrucción para el Usuario**: Copie este protocolo en un archivo `AI_MIGRATION_GUIDE.md` en la raíz de su proyecto para guiar futuras interacciones con asistentes de IA.
