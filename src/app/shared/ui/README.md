# 📦 UI Component Library

Librería de componentes Angular portables siguiendo **Atomic Design**.

**Última actualización**: Diciembre 2025  
**Versión**: 3.0.0  
**Angular**: 20+

---

## 📋 Índice

1. [Instalación Rápida](#-instalación-rápida)
2. [Proyecto Existente - Migración](#-proyecto-existente---migración)
3. [Clasificación por Dificultad](#-clasificación-por-dificultad)
4. [Estructura de Carpetas](#-estructura)
5. [Uso de Componentes](#-uso-de-componentes)
6. [Sistema de Temas](#-sistema-de-temas)
7. [Paleta de Colores](#-paleta-de-colores)
8. [Dark Mode](#-dark-mode)
9. [Análisis de Componentes](#-análisis-de-componentes)
10. [Problemas Conocidos y Soluciones](#-problemas-conocidos-y-soluciones)

---

## 🚀 Instalación Rápida

### Paso 1: Copiar la librería
```bash
cp -r shared/ui /tu-proyecto/src/app/shared/
```

### Paso 2: Importar estilos
En `styles.scss`:
```scss
@import 'app/shared/ui/styles/tokens.css';
@import 'app/shared/ui/styles/animations.css';
```

### Paso 3: Configurar path alias (opcional)
En `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@shared/ui": ["src/app/shared/ui"],
      "@shared/ui/*": ["src/app/shared/ui/*"]
    }
  }
}
```

### Paso 4: Usar componentes
```typescript
import { AvatarComponent, ChipComponent } from '@shared/ui';
// O sin alias:
import { AvatarComponent } from './shared/ui/atoms/avatar/avatar.component';
```

✅ **Tiempo estimado: 5-10 minutos**

---

## 🔄 PROYECTO EXISTENTE - Migración

### Escenario A: Sin componentes UI existentes (FÁCIL)
Si tu proyecto no tiene componentes similares, sigue los pasos de instalación rápida.

### Escenario B: Con componentes UI que quieres reemplazar (MEDIO)

#### 1. Copiar librería SIN sobrescribir
```bash
cp -r shared/ui /tu-proyecto/src/app/shared/
```

#### 2. Importar estilos (agregar, no reemplazar)
```scss
// styles.scss
/* Tus estilos existentes */
@import 'tu-tema-existente';

/* Agregar al final */
@import 'app/shared/ui/styles/tokens.css';
```

#### 3. Migrar componente por componente
```typescript
// ANTES (tu componente actual)
import { MiBotonComponent } from './components/mi-boton';

// DESPUÉS (nuevo componente)
import { ChipComponent } from '@shared/ui';
```

#### 4. Búsqueda y reemplazo gradual
| Buscar | Reemplazar por |
|--------|----------------|
| `<mi-avatar>` | `<app-avatar>` |
| `<mi-badge>` | `<app-chip>` |
| `<mi-tabs>` | `<app-tabs>` |

### Escenario C: Variables CSS conflictivas (DIFÍCIL)

Si tu proyecto ya usa variables como `--primary-color`:

#### Opción 1: Prefijo único (Recomendado)
Los componentes usan tokens semánticos del sistema.

```css
/* Tu proyecto */
--primary-color: #ff0000;

/* Librería UI (asegúrate de cargar tokens después) */
--primary-color: #793576;
```

#### Opción 2: Mapear tus variables
```css
:root {
  /* Mapear tus variables a las de la librería */
  --primary-color: var(--tu-color-primario);
  --secondary-color: var(--tu-color-secundario);
}
```

---

## 📊 Clasificación por Dificultad

### 🟢 FÁCIL (Copiar y usar)

| Componente | Por qué es fácil |
|------------|------------------|
| `AvatarComponent` | Sin dependencias, standalone |
| `ChipComponent` | Sin dependencias, standalone |
| `SkeletonComponent` | Sin dependencias, standalone |
| `RatingComponent` | Sin dependencias, standalone |
| `LoaderComponent` | Sin dependencias, standalone |
| `PaginationComponent` | Sin dependencias externas |

**Migración:** Solo copiar y usar directamente.

### 🟡 MEDIO (Requiere configuración)

| Componente | Consideraciones |
|------------|-----------------|
| `DropdownComponent` | Verificar que no conflicte con ng-select existente |
| `ToastComponent` | Puede conflictuar con ngx-toastr, SweetAlert, etc. |
| `TabsComponent` | Si usas Angular Material Tabs, decidir cuál mantener |
| `AccordionComponent` | Similar a MatExpansionPanel |
| `StepperComponent` | Similar a MatStepper |

**Migración:** 
1. Decidir si reemplazar o coexistir
2. Actualizar templates gradualmente
3. Eliminar dependencia anterior cuando esté completo

### 🔴 DIFÍCIL (Requiere planificación)

| Componente | Por qué es difícil |
|------------|-------------------|
| `ThemeService` | Si ya tienes sistema de temas, decidir cuál usar |
| `ScrollOverlayComponent` | CSS complejo, puede conflictuar con otros scrollbars |
| `ThemeSwitcherComponent` | Requiere ThemeService |

**Migración:**
1. Evaluar sistema de temas actual
2. Crear plan de transición
3. Migrar por módulos/features

---

## 🔧 Guía de Resolución de Conflictos

### Conflicto: Ya uso ng-select
```typescript
// Mantener ambos temporalmente
import { NgSelectModule } from '@ng-select/ng-select'; // Actual
import { DropdownComponent } from '@shared/ui';         // Nuevo

// Migrar pantalla por pantalla
// Cuando todas usen DropdownComponent, eliminar ng-select
```

### Conflicto: Ya uso Angular Material
```typescript
// Los componentes son standalone, pueden coexistir
import { MatTabsModule } from '@angular/material/tabs';
import { TabsComponent } from '@shared/ui';

// En template, usar uno u otro:
<mat-tab-group>...</mat-tab-group>  // Material
<app-tabs>...</app-tabs>             // UI Library
```

### Conflicto: Variables CSS duplicadas
```css
/* Si tu proyecto usa --primary-color */
:root {
  --primary-color: #ff0000; /* Tu variable */
  
  /* Puedes reasignar si es necesario */
  --primary-color: #793576;
}

/* Para unificar (opcional) */
:root {
  --primary-color: var(--primary-color);
}
```

---

## 📁 Estructura

```
shared/ui/
├── styles/
│   ├── tokens.css           # Variables CSS Semánticas
│   ├── animations.css       # Keyframes compartidos
│   └── responsive-table.css # Tablas → Cards en móvil
│
├── atoms/              # 🟢 Componentes básicos (16)
│   ├── avatar/         # Imagen de usuario con iniciales
│   ├── button/         # Botón con variantes y tamaños
│   ├── checkbox/       # Checkbox con label
│   ├── chip/           # Badge/Tag con variantes
│   ├── floating-input/ # Input con label flotante
│   ├── form-error/     # Mensajes de error de validación
│   ├── icon-button/    # Botón solo icono
│   ├── input/          # Input básico
│   ├── language-switcher/ # Selector de idioma (i18n)
│   ├── loader/         # Spinners y skeleton
│   ├── rating/         # Estrellas de calificación
│   ├── row/            # Layout wrapper
│   ├── select/         # Select básico
│   ├── skeleton/       # Placeholder de carga
│   ├── text/           # Texto con variantes
│   └── toggle/         # Switch on/off
│
├── molecules/          # 🟡 Composiciones (8)
│   ├── datepicker/     # Selector de fecha con calendario
│   ├── dropdown/       # Menú desplegable
│   ├── modal/          # Diálogo modal
│   ├── pagination/     # Paginación de datos
│   ├── select2/        # Select avanzado con búsqueda
│   ├── table-actions/  # Acciones de tabla (ver/editar/eliminar)
│   ├── toast/          # Notificaciones
│   └── user-menu/      # Menú de usuario con dropdown
│
├── organisms/          # 🔴 Componentes complejos (8)
│   ├── accordion/      # Paneles colapsables
│   ├── filters/        # Panel de filtros
│   ├── scroll-overlay/ # Scroll customizado con overlays
│   ├── sidebar/        # Barra lateral de navegación
│   ├── stepper/        # Pasos de formulario
│   ├── tabs/           # Pestañas de navegación
│   ├── theme-switcher/ # Selector light/dark/system
│   └── topbar/         # Barra superior
│
├── surfaces/           # 📦 Contenedores (3)
│   ├── card/           # Tarjeta de contenido
│   ├── panel/          # Panel con header/footer
│   └── section/        # Sección de página
│
├── templates/          # 📄 Layouts (6)
│   ├── auth-layout/    # Layout de autenticación
│   ├── layout-shell/   # Shell principal con sidebar
│   └── ...
│
├── services/           # 🔧 Servicios (3)
│   ├── theme.service.ts      # Gestión de temas light/dark
│   ├── validation.service.ts # Validadores y mensajes de error
│   └── theme.service.spec.ts # Tests de ThemeService
│
└── index.ts            # Barrel exports
```

---

## 📱 Responsive Table → Cards (RTC)

CSS puro que transforma tablas en **tarjetas (cards)** en móvil (< 768px).

### ¿Qué es RTC?

**RTC = "Responsive Table Cards"**

| Desktop | Móvil |
|---------|-------|
| Tabla tradicional (filas/columnas) | Cada fila → una tarjeta (card) |
| Header visible | Header oculto, labels en cada celda |

```
Desktop:              Móvil:
┌──┬──────┬──────┐    ┌────────────────┐
│ID│Nombre│Email │    │ ID: 1          │
├──┼──────┼──────┤    │ Nombre: Juan   │
│1 │Juan  │j@... │    │ Email: j@...   │
└──┴──────┴──────┘    └────────────────┘
```

### Importar
```scss
@import 'app/shared/ui/styles/responsive-table.css';
```

### Uso
```html
<table class="rtc-table">
  <thead class="rtc-header">
    <tr>
      <th>Nombre</th>
      <th>Estado</th>
      <th>Acciones</th>
    </tr>
  </thead>
  <tbody class="rtc-body">
    <tr class="rtc-row">
      <td data-label="Nombre:">Juan Pérez</td>
      <td data-label="Estado:">
        <span class="rtc-status--success">Activo</span>
      </td>
      <td class="rtc-actions">
        <button>Editar</button>
      </td>
    </tr>
  </tbody>
</table>
```

### Clases disponibles
| Clase | Descripción |
|-------|-------------|
| `.rtc-table` | Contenedor tabla |
| `.rtc-header` | Thead (oculto en móvil) |
| `.rtc-body` | Tbody |
| `.rtc-row` | Fila → Card en móvil |
| `.rtc-actions` | Contenedor de botones |
| `.rtc-mobile-only` | Solo visible en móvil |
| `.rtc-desktop-only` | Solo visible en desktop |

---

## 🔄 Tabla Atomic (Componentes Angular)

Componentes Angular que implementan una tabla con Atomic Design.

### Uso
```html
<app-table [striped]="true">
  <app-table-head>
    <tr>
      <th app-table-header-cell>Nombre</th>
      <th app-table-header-cell>Rol</th>
    </tr>
  </app-table-head>
  <tbody>
    <tr app-table-row>
      <td app-table-cell data-label="Nombre:">Juan</td>
      <td app-table-cell data-label="Rol:">Dev</td>
    </tr>
  </tbody>
</app-table>
```

### Componentes
| Componente | Selector | Descripción |
|------------|----------|-------------|
| `TableComponent` | `app-table` | Contenedor con zebra stripes y responsive |
| `TableHeadComponent` | `app-table-head` | Header con sticky |
| `TableRowComponent` | `tr[app-table-row]` | Fila con hover elevado |
| `TableCellComponent` | `td[app-table-cell]` | Celda con estilos |

### Features
- ✅ Cards en móvil (< 768px)
- ✅ Zebra stripes (`[striped]="true"`)
- ✅ Sticky header
- ✅ Hover elevado (lift effect)
- ✅ Tokenización completa

---

## ⚡ Conceptos Técnicos

### ChangeDetectionStrategy.OnPush

Estrategia de Angular para **optimizar rendimiento**.

```typescript
// Sin OnPush (Default):
// Angular revisa el componente en CADA ciclo de detección
// (cada clic, evento, timeout...)

// Con OnPush:
changeDetection: ChangeDetectionStrategy.OnPush
// Angular SOLO revisa cuando:
// 1. Un @Input() cambia
// 2. Se dispara un evento del componente
// 3. Se usa async pipe
```

**Beneficio:** En tablas con 100+ filas = **mejor rendimiento**.

### Sticky Header

El header de la tabla se **"pega" arriba** cuando haces scroll.

```css
.atomic-table-head th {
  position: sticky;  /* Se pega */
  top: 0;            /* Arriba del todo */
  z-index: 10;       /* Por encima del contenido */
}
```

**Sin sticky:** Al scrollear, el header desaparece.
**Con sticky:** El header siempre visible mientras scrolleas.

### Hover Elevado (Lift Effect)

Efecto visual donde la fila se **"eleva"** al hacer hover.

```css
.rtc-row:hover {
  transform: translateY(-2px);  /* Se eleva 2px */
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);  /* Sombra */
}
```

---

## 📊 RTC vs Atomic: ¿Cuál usar?

| Aspecto | RTC (CSS) | Atomic (Componentes) |
|---------|-----------|----------------------|
| **Tipo** | Clases CSS | Componentes Angular |
| **Integración** | Importar CSS | Importar componentes |
| **Responsive** | ✅ Nativo | ✅ Nativo |
| **Sticky Header** | ✅ | ✅ |
| **Hover Elevado** | ✅ | ✅ |
| **Con scroll-overlay** | ✅ Mejor | ⚠️ Compatible |
| **Reusabilidad** | Requiere clases | Encapsulado |

**Recomendación:**
- Usa **RTC** con `scroll-overlay` para tablas con mucho contenido
- Usa **Atomic** para tablas simples o cuando necesites componentes

---

## 📖 Uso de Componentes

### Atoms (Más simples)

```typescript
import { AvatarComponent, ChipComponent, RatingComponent, LoaderComponent } from '@shared/ui';

@Component({
  imports: [AvatarComponent, ChipComponent, RatingComponent, LoaderComponent],
  template: `
    <app-avatar name="Juan" status="online" size="lg"></app-avatar>
    <app-chip variant="success">Activo</app-chip>
    <app-rating [value]="4" [readonly]="true"></app-rating>
    <app-loader variant="spinner" size="md"></app-loader>
  `
})
```

### Molecules

```typescript
import { DropdownComponent, ToastComponent, PaginationComponent } from '@shared/ui';

// Dropdown (compatible con Reactive Forms)
<app-dropdown [options]="options" [(value)]="selected"></app-dropdown>
<app-dropdown [options]="options" formControlName="country"></app-dropdown>

// Toast
@ViewChild(ToastComponent) toast!: ToastComponent;
this.toast.show({ message: 'Éxito!', type: 'success' });

// Pagination
<app-pagination [total]="100" [pageSize]="10" (pageChange)="onPage($event)"></app-pagination>
```

### Organisms

```typescript
import { TabsComponent, TabComponent, StepperComponent, AccordionComponent } from '@shared/ui';

// Tabs
<app-tabs>
  <app-tab label="Tab 1" icon="📋">Contenido 1</app-tab>
  <app-tab label="Tab 2">Contenido 2</app-tab>
</app-tabs>

// Stepper
steps = [
  { label: 'Datos', description: 'Información básica' },
  { label: 'Revisión', icon: '📋' },
  { label: 'Firma', optional: true }
];
<app-stepper [steps]="steps" [activeStep]="currentStep"></app-stepper>

// Accordion
<app-accordion>
  <app-accordion-item title="Pregunta 1">Respuesta 1</app-accordion-item>
</app-accordion>
```

### ScrollOverlay
```html
<app-scroll-overlay [maxBodyHeight]="400">
  <table>...</table>
</app-scroll-overlay>
```

### Skeleton
```html
<app-skeleton variant="card"></app-skeleton>
<app-skeleton variant="text" width="80%"></app-skeleton>
<app-skeleton variant="avatar-text"></app-skeleton>
```

---

## 🎨 Sistema de Temas

### Estructura de Variables CSS

```css
:root {
  /* COLORES PRIMARIOS */
  --primary-color-lighter: #efe7ef;
  --primary-color: #793576;  /* Principal */
  --primary-color-dark: #662863;

  /* COLORES SECUNDARIOS */
  --secondary-color: #23a7d4;

  /* ESTADOS */
  --success-color: #10b981;
  --danger-color: #dc2626;
  --warning-color: #f59e0b;
  --info-color: #0ea5e9;

  /* SUPERFICIES */
  --surface-background: #ffffff;
  --surface-section: #f9fafb;
  --surface-elevated: #f3f4f6;

  /* TEXTO */
  --text-color: #1f2937;
  --text-color-secondary: #6b7280;
  --text-color-muted: #9ca3af;

  /* BORDES */
  --border-color: #e5e7eb;
}
```

### Personalizar colores
```css
:root {
  /* Sobrescribir colores de la librería */
  --primary-color: #tu-color-primario;
  --secondary-color: #tu-color-secundario;
  
  /* O mapear desde tus variables existentes */
  --primary-color: var(--color-brand);
}
```

---

##  Paleta de Colores

### Paleta Primary (Púrpura)
| Tono | Hexadecimal |
|------|-------------|
| 50 | #efe7ef |
| 100 | #d7c2d6 |
| 200 | #bc9abb |
| 300 | #a1729f |
| 400 | #8d538b |
| **500** | **#793576** |
| 600 | #71306e |
| 700 | #662863 |
| 800 | #5c2259 |
| 900 | #491646 |

### Paleta Secondary (Ámbar/Dorado)
| Tono | Hexadecimal |
|------|-------------|
| 50 | #fffbed |
| 200 | #ffe6ad |
| 300 | #ffd275 |
| 400 | #ffc400 |
| **500** | **#FFB800** |
| 600 | #e09600 |
| 700 | #b37000 |

### Colores de Estado
| Color | Hexadecimal | Uso |
|-------|-------------|-----|
| Success | #10b981 | Éxito, confirmado |
| Error | #dc2626 | Error, rechazado |
| Warning | #f59e0b | Advertencia, pendiente |
| Info | #0ea5e9 | Información |

### Herramienta recomendada
Usa [UI Colors](https://uicolors.app) para generar escalas de color automáticamente.

---

## 🌙 Dark Mode

### Activación

#### Método 1: Clase CSS
```html
<html class="dark">
```

#### Método 2: Atributo data-theme
```html
<html data-theme="dark">
```

#### Método 3: ThemeService
```typescript
import { ThemeService } from '@shared/ui';

@Component({...})
export class MyComponent {
  constructor(private themeService: ThemeService) {}

  toggleDark() {
    this.themeService.setTheme('dark');
  }
}
```

#### Método 4: Componente visual
```html
<app-theme-switcher></app-theme-switcher>
```

### Variables en Dark Mode
```css
html.dark, [data-theme="dark"] {
  --surface-background: #1a1a24;
  --surface-section: #1f2937;
  --surface-elevated: #374151;

  --text-color: #f3f4f6;
  --text-color-secondary: #9ca3af;

  --border-color: #374151;
}
```

---

## 🔍 Análisis de Componentes

### Resumen de Optimizaciones Aplicadas

| Componente | Mejoras aplicadas |
|------------|------------------|
| **LoaderComponent** | IDs únicos SVG, OnPush, tipos exportados |
| **DropdownComponent** | ControlValueAccessor, OnChanges, aria-*, OnPush |
| **AvatarComponent** | Computed signals, tokens semánticos, tipos |
| **ChipComponent** | tabindex, role="button", tokens semánticos |
| **ToastComponent** | aria-live, clear(), tokens semánticos |
| **StepperComponent** | aria-current, reset(), tokens semánticos |

### Características técnicas
- ✅ `ChangeDetectionStrategy.OnPush` en todos
- ✅ Tipos exportados (`AvatarSize`, `ChipVariant`, etc.)
- ✅ Uso de Tokens semánticos globales
- ✅ Atributos `aria-*` para screen readers
- ✅ Compatibility con Reactive Forms (Dropdown)

---

## ⚠️ Problemas Conocidos y Soluciones

### 1. `:host-context()` tiene soporte limitado
**Problema:** `:host-context(html.dark)` no funciona en Safari < 15.4

**Solución:** Las variables CSS se definen en tokens.css y cambian con `html.dark`, los componentes heredan automáticamente.

### 2. Toast position:fixed
**Problema:** Toast usa `position: fixed` directamente

**Solución:** Colocar `<app-toast>` como hijo directo de `<body>` o cerca del root del app.

### 3. Múltiples Loaders
**Problema (RESUELTO):** Los IDs de SVG gradient se duplicaban

**Solución:** Ahora cada Loader genera IDs únicos (`spinner-abc123`).

### 4. Dropdown en Reactive Forms
**Problema (RESUELTO):** No funcionaba con `formControlName`

**Solución:** Ahora implementa `ControlValueAccessor`.

---

## 📈 Estrategia de Migración Recomendada

```
Fase 1 (Semana 1): Copiar librería + Tokens CSS
    ↓
Fase 2 (Semana 2): Migrar Atoms (Avatar, Chip, Rating)
    ↓
Fase 3 (Semana 3): Migrar Molecules (Dropdown, Toast)
    ↓
Fase 4 (Semana 4): Migrar Organisms (Tabs, Stepper)
    ↓
Fase 5 (Semana 5): Eliminar dependencias antiguas
```

---

## ⚡ Requisitos

- **Angular 17+** (usa control flow `@if`, `@for`)
- Soporta **SSR** (Angular Universal)
- Componentes **standalone** (no requiere NgModule)

---

## 📋 Mapeo de Clases Tailwind → Variables CSS

| Clase Tailwind | Variable CSS |
|----------------|--------------|
| `text-primary-700` | `var(--primary-color-dark)` |
| `bg-primary-50` | `var(--primary-color-lighter)` |
| `text-gray-900` | `var(--text-color)` |
| `text-gray-500` | `var(--text-color-secondary)` |
| `bg-white` | `var(--surface-background)` |
| `bg-gray-50` | `var(--surface-section)` |
| `border-gray-300` | `var(--border-color)` |
| `text-red-600` | `var(--danger-color)` |
| `text-green-600` | `var(--success-color)` |

---

## 🔨 Crear Nuevos Componentes

### Nomenclatura y Ubicación

| Tipo | Ubicación | Prefijo Selector | Ejemplo |
|------|-----------|------------------|---------|
| Atom | `atoms/[nombre]/` | `app-` | `app-button`, `app-chip` |
| Molecule | `molecules/[nombre]/` | `app-` | `app-datepicker`, `app-toast` |
| Organism | `organisms/[nombre]/` | `app-` | `app-sidebar`, `app-tabs` |
| Surface | `surfaces/[nombre]/` | `app-` | `app-panel`, `app-card` |
| Template | `templates/[nombre]/` | `app-` | `app-layout-shell` |

### Paso 1: Generar el componente

```bash
# Atom (componente simple)
ng g c shared/ui/atoms/mi-componente --standalone --skip-tests

# Molecule (componentes compuestos)
ng g c shared/ui/molecules/mi-componente --standalone --skip-tests

# Organism (componentes complejos)
ng g c shared/ui/organisms/mi-componente --standalone --skip-tests
```

### Paso 2: Estructura base del componente

```typescript
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Tipos exportados para uso externo
 */
export type MiComponenteVariant = 'primary' | 'secondary' | 'outline';
export type MiComponenteSize = 'sm' | 'md' | 'lg';

/**
 * @description Descripción breve del componente
 * @example
 * ```html
 * <app-mi-componente variant="primary" size="md">Contenido</app-mi-componente>
 * ```
 */
@Component({
  selector: 'app-mi-componente',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mi-componente"
         [class]="variantClass()"
         [class.mi-componente--disabled]="disabled">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
    }

    .mi-componente {
      /* Usar SIEMPRE tokens CSS del sistema */
      background: var(--surface-background);
      color: var(--text-color);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md, 0.5rem);
      padding: var(--spacing-md, 1rem);
      transition: all 200ms ease;
    }

    /* Variantes */
    .mi-componente--primary {
      background: var(--primary-color);
      color: var(--text-color-on-primary);
    }

    .mi-componente--secondary {
      background: var(--secondary-color);
      color: var(--text-color-on-secondary);
    }

    /* Estados */
    .mi-componente--disabled {
      opacity: 0.6;
      pointer-events: none;
    }
  `]
})
export class MiComponenteComponent {
  /** Variante visual del componente */
  @Input() variant: MiComponenteVariant = 'primary';
  
  /** Tamaño del componente */
  @Input() size: MiComponenteSize = 'md';
  
  /** Estado deshabilitado */
  @Input() disabled = false;
  
  /** Evento emitido al hacer clic */
  @Output() clicked = new EventEmitter<void>();

  variantClass(): string {
    return `mi-componente--${this.variant} mi-componente--${this.size}`;
  }
}
```

### Paso 3: Exportar en barrel file

Agregar al archivo `src/app/shared/ui/index.ts`:

```typescript
// Atoms
export * from './atoms/mi-componente/mi-componente.component';
```

### Paso 4: Usar tokens CSS (OBLIGATORIO)

**❌ INCORRECTO - Colores hardcodeados:**
```css
.mi-componente {
  background: #793576;  /* NO usar hex directo */
  color: #ffffff;
}
```

**✅ CORRECTO - Usar tokens del sistema:**
```css
.mi-componente {
  background: var(--primary-color);
  color: var(--text-color-on-primary);
}
```

### Tokens CSS Disponibles

| Categoría | Token | Descripción |
|-----------|-------|-------------|
| **Colores** | `--primary-color` | Color primario de marca |
| | `--secondary-color` | Color secundario |
| | `--text-color` | Color de texto principal |
| | `--text-color-secondary` | Texto secundario |
| | `--text-color-on-primary` | Texto sobre color primario |
| **Superficies** | `--surface-background` | Fondo de componentes |
| | `--surface-section` | Fondo de secciones |
| | `--surface-elevated` | Fondo elevado (cards) |
| **Bordes** | `--border-color` | Borde estándar |
| | `--border-color-light` | Borde suave |
| **Estados** | `--success-color` | Color de éxito |
| | `--danger-color` | Color de error |
| | `--warning-color` | Color de advertencia |
| **Efectos** | `--hover-background` | Background al hover |
| | `--focus-ring` | Anillo de foco |
| | `--shadow-md` | Sombra media |

### Checklist de Nuevo Componente

- [ ] Componente standalone (`standalone: true`)
- [ ] ChangeDetectionStrategy.OnPush aplicada
- [ ] Tipos exportados (Variant, Size, etc.)
- [ ] JSDoc con @description y @example
- [ ] Usa SOLO tokens CSS (no colores hex)
- [ ] Exportado en `index.ts`
- [ ] Atributos ARIA si es interactivo
- [ ] Soporte dark mode (automático con tokens)

---

## 📦 Referencia de Componentes

### Atoms

#### `ButtonComponent`
```html
<app-button variant="primary" size="md" [loading]="false">
  Guardar
</app-button>
```
| Input | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'danger'` | `'primary'` | Estilo visual |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamaño |
| `loading` | `boolean` | `false` | Mostrar spinner |
| `disabled` | `boolean` | `false` | Deshabilitar |

#### `ChipComponent`
```html
<app-chip variant="success" [removable]="true" (removed)="onRemove()">
  Activo
</app-chip>
```

#### `AvatarComponent`
```html
<app-avatar name="Juan Pérez" size="lg" status="online" [src]="imageUrl">
</app-avatar>
```

#### `FloatingInputComponent`
```html
<app-floating-input 
  label="Email" 
  type="email"
  [(ngModel)]="email"
  [required]="true">
</app-floating-input>
```

#### `FormErrorComponent`
```html
<app-form-error [control]="form.get('email')"></app-form-error>
```

#### `LanguageSwitcherComponent`
```html
<app-language-switcher></app-language-switcher>
```

### Molecules

#### `Select2Component`
```html
<app-select2 
  [options]="options" 
  label="País"
  [searchable]="true"
  [(ngModel)]="selected">
</app-select2>
```

#### `DatepickerComponent`
```html
<app-datepicker 
  label="Fecha de nacimiento"
  [(ngModel)]="birthDate">
</app-datepicker>
```

#### `PaginationComponent`
```html
<app-pagination 
  [total]="100" 
  [pageSize]="10" 
  [(currentPage)]="page"
  (pageChange)="onPageChange($event)">
</app-pagination>
```

#### `TableActionsComponent`
```html
<app-table-actions 
  (view)="onView(item)" 
  (edit)="onEdit(item)" 
  (delete)="onDelete(item)">
</app-table-actions>
```

### Organisms

#### `ScrollOverlayComponent`
```html
<app-scroll-overlay 
  [maxBodyHeight]="450"
  [minColumnWidth]="40"
  [lockColumnTemplate]="true"
  [columnTemplate]="'70px minmax(120px, 1fr) 100px'">
  <table class="rtc-table">...</table>
</app-scroll-overlay>
```

#### `TabsComponent`
```html
<app-tabs>
  <app-tab label="General" icon="⚙️">Contenido 1</app-tab>
  <app-tab label="Avanzado">Contenido 2</app-tab>
</app-tabs>
```

#### `AccordionComponent`
```html
<app-accordion>
  <app-accordion-item title="Pregunta 1" [expanded]="true">
    Respuesta 1
  </app-accordion-item>
</app-accordion>
```

### Services

#### `ValidationService`
```typescript
import { ValidationService } from '@shared/ui';

@Component({...})
export class MyComponent {
  validationService = inject(ValidationService);

  form = new FormGroup({
    dni: new FormControl('', [ValidationService.dni]),
    phone: new FormControl('', [ValidationService.phone]),
  });

  getError(field: string): string {
    const control = this.form.get(field);
    return this.validationService.getErrorMessage(control);
  }
}
```

**Validadores disponibles:**
- `ValidationService.dni` - DNI peruano (8 dígitos)
- `ValidationService.ruc` - RUC peruano (11 dígitos)
- `ValidationService.phone` - Teléfono (9 dígitos)
- `ValidationService.notFutureDate` - Fecha no futura
- `ValidationService.notPastDate` - Fecha no pasada
- `ValidationService.passwordMatch(field)` - Confirmación de contraseña

---

📅 **Última actualización**: Diciembre 2025  
🏷️ **Versión**: 3.0.0  
⚡ **Angular**: 20+  
🌐 **i18n**: ngx-translate  
📚 **Storybook**: Disponible
