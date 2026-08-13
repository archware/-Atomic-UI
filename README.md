---
title: "Atomic UI: sistema de componentes y temas"
subtitle: "Fuente visual canónica para aplicaciones de escritorio HRA"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-08-12"
version: "5.7.3"
---

# Atomic UI: sistema de componentes y temas

[![Angular](https://img.shields.io/badge/Angular-22-red.svg)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue.svg)](https://www.typescriptlang.org/)

Sistema de diseño **Atomic Design** con temas **Light/Dark/System**, paleta de colores **Púrpura (Primary)**, **Rosa (Accent)** y **Ámbar/Dorado (Secondary)**, optimizado para accesibilidad WCAG 2.1 Level AA.

---

## Gobierno Atomic-first

Toda aplicación generada recibe política para agentes, manifiesto de procedencia,
gate protegido por hashes y CI obligatoria. Si falta un objeto visual, se crea y
valida primero en este repositorio; el consumidor no puede inventarlo ni
desactivar la compuerta. Véase [governance/README.md](./governance/README.md).

La biblioteca `@hra/atomic-ui` compila localmente desde 5.5.0
(`npx ng build atomic-ui` → `dist/atomic-ui`, formato Angular Package Format;
`npm run lib:build` añade los tokens de tema). El contrato, el manifiesto
SHA-256 y el empaquetado seco reproducible se describen en
[distribution/README.md](./distribution/README.md). La publicación en un
registro npm permanece bloqueada hasta contar con registro privado y
procedencia firmada; un resultado verde del gate no la autoriza.

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

- ✅ **Componentes organizados** en 5 capas (Atoms, Molecules, Organisms, Surfaces, Templates)
- ✅ **Atomic-first**: `TableAction`, `DataTable` y `CrudDialog` son fuentes
  canónicas para acciones, grillas responsive y editores CRUD propagables.
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

La ruta productiva separa el bootstrap de la generación funcional. El shell no
incluye mocks ni páginas demo; cada interfaz nace de requisitos validados.

### 1. Validar Atomic y crear el shell

```bash
npm run catalog:check
npm run create:project -- mi-nuevo-proyecto
```

El bootstrap instala:

- ✅ Componentes, temas y tokens canónicos
- ✅ Angular zoneless y rutas vacías
- ✅ Gobierno Atomic-first y manifiesto de procedencia
- ✅ Instalar dependencias automáticamente

### 2. Consultar la receta y previsualizar la generación

```bash
npm run agent:context -- --intent crud --variant modal-catalog
npm run generate:ui -- --spec test-fixtures/ui-requirements/modal-catalog-ui-only.json --output ../projects/mi-nuevo-proyecto --dry-run
```

Revise el plan y, si es correcto, quite `--dry-run`. El modo `integrated`
requiere endpoint, método y contratos explícitos; de lo contrario use
`ui-only`. Un borrado requiere además acción de fila, permiso y textos de
confirmación explícitos; el puerto generado deniega por defecto.

### 3. Desarrollo

```bash
cd ../projects/mi-nuevo-proyecto
npm start
```

---

## 📦 Integración Manual

Para integrar Atomic UI en un proyecto existente, consulte primero el catálogo
compacto y el runtime de agentes:

- `catalog/README.md` - contratos consultables y extensión de variantes
- `docs/ATOMIC_UI_AGENT_RUNTIME.md` - recetas, límites y definición de terminado
- `.agent/workflows/integration.md` - integración manual
- `.agent/workflows/development.md` - desarrollo con hot-reload

---

## 🧩 Sistema de Diseño Atómico

### Inventario de Componentes

El listado es representativo; el conteo corresponde a los directorios vigentes del catálogo.

| Capa | Ejemplos de componentes | Descripción |
| ------ | ----------- | ----------- |
| **Átomos (34)** | Avatar, Badge, Breadcrumb, Button, Checkbox, Chip, ChoiceControl, Divider, FileInput, FloatingInput, FormError, FormInput, FormRow, FormSelect, IconButton, Input, LanguageSwitcher, Loader, NumberInput, Progress, Radio, Rating, Row, Select, Skeleton, Spinner, StatusBadge, Table, TableAction, Text, Textarea, Toggle, Tooltip y Version | Elementos básicos e indivisibles |
| **Moléculas (18)** | ActionGroup, Alert, AvatarGroup, Card, Combobox, DataState, Datepicker, Dropdown, KpiCard, Modal, Pagination, Popup, Select2, TableActions, TagInput, Timeline, Toast y UserMenu | Combinaciones de átomos con funcionalidad |
| **Organismos (21)** | Accordion, Chart, CrudDialog, DataPager, DataTable, DenominationCounter, Filters, Footer, FormDialog, MetricsGrid, NavBar, PageHeader, PrintDocumentPanel, QueryToolbar, ReceiptPanel, ScrollOverlay, Sidebar, Stepper, Tabs, ThemeSwitcher y Topbar | Secciones completas de interfaz |
| **Superficies (1)** | Panel | Contenedores y superficies |
| **Plantillas (2)** | AuthLayout y LayoutShell | Layouts completos de página |

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
│           ├── atoms/            # 34 directorios de componentes básicos
│           ├── molecules/        # 18 directorios de componentes compuestos
│           ├── organisms/        # 19 directorios de componentes complejos
│           ├── surfaces/         # 1 contenedor (Panel)
│           ├── templates/        # 2 layouts
│           ├── services/         # ThemeService, ToastService, etc.
│           └── index.ts          # Barrel exports
├── styles/
│   └── themes/                   # Tokens CSS
└── index.html
```

---

## Comandos CLI

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

## Contrato de acciones asíncronas

- La acción principal utiliza `<app-button [loading]="pending">`; el estado
  deshabilita el botón nativo, anuncia `aria-busy` y evita un segundo comando.
- El diálogo enlaza `[busy]="pending"`, por lo que X, Escape y backdrop no
  cierran una operación pendiente. Las acciones secundarias enlazan
  `[disabled]="pending"`.
- Una comprobación no persistente conserva el diálogo abierto y comunica el
  resultado mediante `role="status"`. Una operación de guardado cierra solo tras
  éxito y publica un único Toast después de retirar el overlay.
- Un fallo conserva el diálogo, publica un bloque
  `role="alert" data-modal-error tabindex="-1"` y llama `focusError()` justo
  después de actualizar el estado. La primitiva enfoca de inmediato o reintenta
  una vez tras el render; el consumidor no debe envolverla en `queueMicrotask`.
  El cierre efectivo restaura el foco al disparador.
- `PopupService` se reserva para decisiones o avisos interruptivos; no se usa
  como confirmación transaccional detrás de otro overlay.

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
- ✅ Revelado de contraseña con nombre dinámico, estado expuesto y glifo decorativo
- ✅ Anuncios de cambios de tema para lectores de pantalla
- ✅ Color no es único indicador (iconos + texto)

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.

---

**Versión:** 5.7.3
**Última actualización:** 12 de agosto de 2026
**Angular:** 22
**TypeScript:** 6.0
