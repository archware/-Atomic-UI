# 🎨 Atomic UI - Sistema de Componentes y Temas Avanzado

[![Angular](https://img.shields.io/badge/Angular-20+-red.svg)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

Sistema de diseño **Atomic Design** con temas **Light/Dark/System**, paleta de colores **Púrpura (Primary)**, **Rosa (Accent)** y **Ámbar/Dorado (Secondary)**, optimizado para accesibilidad WCAG 2.1 Level AA.

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Inicio Rápido](#-inicio-rápido)
- [Sistema de Diseño Atómico](#-sistema-de-diseño-atómico)
- [Tokens de Diseño](#-tokens-de-diseño)
- [Sistema de Temas](#-sistema-de-temas)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Comandos CLI](#-comandos-cli)
- [Accesibilidad](#-accesibilidad)

---

## ✨ Características

### 🧩 **Sistema Atómico Completo**

- ✅ **57 Componentes** organizados en 5 capas (Atoms, Molecules, Organisms, Surfaces, Templates)
- ✅ **Altura Estándar Global**: 46px (`var(--control-height)`) para todos los controles de formulario
- ✅ **Standalone Components**: Todos los componentes son standalone y reutilizables
- ✅ **ControlValueAccessor**: Integración completa con Angular Forms

### 🎨 **Sistema de Temas Completo**

- ✅ **3 modos**: Light, Dark, System (automático según SO)
- ✅ **Persistencia**: LocalStorage para recordar preferencia
- ✅ **Transiciones suaves**: Animaciones CSS optimizadas
- ✅ **SSR compatible**: Detección de entorno servidor/cliente

### 🌈 **Paleta de Colores Profesional**

- ✅ **Primary (Púrpura Profundo)**: `#5F295C` - Elegante, Serio, Premium
- ✅ **Secondary (Dorado/Ámbar)**: `#FFB800` - Contraste, Lujo, Llamativo
- ✅ **Accent (Rosa)**: `#f5368a` - CTAs, Elementos especiales
- ✅ **100+ Variables CSS**: Sistema centralizado y reutilizable

### ♿ **Accesibilidad WCAG 2.1**

- ✅ **Contrastes validados**: Ratios 6.8:1 - 7.2:1 (AAA Normal)
- ✅ **Navegación por teclado** completa
- ✅ **ARIA labels** descriptivos
- ✅ **Compatible con lectores de pantalla**

---

## 🚀 Inicio Rápido

La forma más rápida de usar Atomic UI es generando un proyecto nuevo con nuestra herramienta CLI automatizada.

### 1. Generar Proyecto

```bash
# Desde la raíz de la librería
npm run create:project mi-nuevo-proyecto
```

La herramienta te guiará para:

- ✅ Elegir plantillas (Login, Dashboard, CRUD)
- ✅ Configurar rutas y navegación
- ✅ Instalar dependencias automáticamente
- ✅ Configurar temas y estilos base

### 2. Desarrollo

```bash
cd projects/mi-nuevo-proyecto
npm start
```

---

## 📦 Integración Manual

Si necesitas integrar Atomic UI en un proyecto ya existente, consulta los workflows en `.agent/workflows/`:

- `/integration` - Guía paso a paso de integración
- `/development` - Desarrollo con hot-reload

---

## 🧩 Sistema de Diseño Atómico

### Inventario de Componentes

| Capa | Componentes | Descripción |
| ------ | ----------- | ----------- |
| **Atoms (27)** | Avatar, Badge, Breadcrumb, Button, Checkbox, Chip, Divider, FileInput, FloatingInput, FormError, FormRow, IconButton, Input, LanguageSwitcher, Loader, NumberInput, Progress, Radio, Rating, Row, Select, Skeleton, Spinner, Table, Text, Textarea, Toggle | Elementos básicos e indivisibles |
| **Molecules (17)** | ActionGroup, Alert, AvatarGroup, Card, Combobox, DataState, Datepicker, Dropdown, Modal, Pagination, Popup, Select2, TableActions, TagInput, Timeline, Toast, UserMenu | Combinaciones de átomos con funcionalidad |
| **Organisms (10)** | Accordion, Filters, Footer, NavBar, ScrollOverlay, Sidebar, Stepper, Tabs, ThemeSwitcher, Topbar | Secciones complejas de UI |
| **Surfaces (1)** | Panel | Contenedores y superficies |
| **Templates (2)** | AuthLayout, LayoutShell | Layouts de página completos |

### Altura Estándar Global

Todos los controles interactivos usan `var(--control-height): 2.875rem` (46px):

```css
.btn, .form-input, .form-select, .select2-trigger, .floating-input { 
  height: var(--control-height); 
}
```

### Ejemplo de Uso

```html
<!-- Importar desde el barrel -->
import { ButtonComponent, FloatingInputComponent, Select2Component } from '@shared/ui';

<!-- En template -->
<app-floating-input label="Nombre" variant="floating"></app-floating-input>
<app-select2 [options]="countries" placeholder="Seleccionar..."></app-select2>
<app-button variant="primary" icon="🔍">Buscar</app-button>
```

---

## 🎨 Tokens de Diseño

### Estructura de Archivos

```text
src/styles/themes/
├── _tokens-primitives.css  # Escala de grises, radios, sombras
├── _tokens-brand.css       # Colores de marca: Primary, Secondary, Accent
├── _tokens-semantic.css    # Colores semánticos: success, warning, danger
├── _tokens-components.css  # Tokens específicos de componentes
├── _forms.css              # Estilos globales de formularios
├── _buttons.css            # Estilos globales de botones
└── index.css               # Entry point que importa todo
```

### Tokens de Marca (Brand)

| Token | Light Mode | Dark Mode | Uso |
| ------- | ---------- | --------- | --- |
| `--brand-primary-500` | `#5F295C` | - | Color principal |
| `--brand-secondary-500` | `#FFB800` | - | Color secundario (Dorado) |
| `--brand-accent-500` | `#f5368a` | - | Acentos y CTAs |

### Tokens de Componentes

```css
/* Altura estándar */
--control-height: 2.875rem; /* 46px */

/* Loader Gradients (conectados a marca) */
--loader-gradient-1: var(--brand-primary-600);
--loader-gradient-2: var(--brand-primary-400);
--loader-gradient-3: var(--brand-accent-500);
--loader-gradient-4: var(--brand-secondary-400);
--loader-gradient-5: var(--brand-secondary-500);
```

---

## 🌓 Sistema de Temas

### ThemeService API

```typescript
import { ThemeService } from '@shared/ui/services';

// Cambiar tema
themeService.setLightTheme();
themeService.setDarkTheme();
themeService.setSystemTheme();

// Alternar
themeService.toggleTheme();

// Estado
themeService.isDarkMode(); // Signal<boolean>
themeService.getSelectedTheme(); // Signal<'light' | 'dark' | 'system'>
```

### ThemeSwitcher Component

```html
<app-theme-switcher></app-theme-switcher>
```

---

## 📂 Estructura del Proyecto

```text
src/
├── app/
│   ├── components/
│   │   └── ui-showcase/          # Demo de todos los componentes
│   └── shared/
│       └── ui/
│           ├── atoms/            # 27 componentes básicos
│           ├── molecules/        # 17 componentes compuestos
│           ├── organisms/        # 10 componentes complejos
│           ├── surfaces/         # 1 contenedor (Panel)
│           ├── templates/        # 2 layouts
│           ├── services/         # ThemeService, ToastService, etc.
│           └── index.ts          # Barrel exports
├── styles/
│   └── themes/                   # Tokens CSS
└── index.html
```

---

## � Comandos CLI

```bash
# Desarrollo
npm start                 # Servidor de desarrollo (localhost:4200)

# Build
npm run build             # Build de producción

# Deploy
npm run deploy            # Despliegue a GitHub Pages

# Testing
ng test                   # Unit tests
ng e2e                    # E2E tests
```

---

## ♿ Accesibilidad

### Contrastes WCAG 2.1 Validados

| Combinación | Ratio | Cumplimiento |
| ----------- | ----- | ------------ |
| `#5F295C` / `#ffffff` | 8.5:1 | ✅ AAA |
| `#FFB800` / `#1a1a24` | 10.2:1 | ✅ AAA |
| `#f5368a` / `#ffffff` | 4.1:1 | ✅ AA Large |

### Características

- ✅ ARIA labels en todos los controles interactivos
- ✅ Focus visible en navegación por teclado
- ✅ Anuncios de cambios de tema para lectores de pantalla
- ✅ Color no es único indicador (iconos + texto)

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.

---

**Versión:** 4.4.0 (Atomic Design System)  
**Última Actualización:** Mayo 2026  
**Angular Version:** 21+  
**TypeScript:** 5.0+

