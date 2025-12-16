# UI Components Library - Migration Guide

## Overview

Esta librería contiene componentes UI reutilizables basados en Atomic Design para Angular 19+ con standalone components.

---

## Quick Start

### 1. Copiar Componentes

```bash
# Copiar toda la carpeta UI
cp -r src/app/shared/ui /tu-proyecto/src/app/shared/
```

### 2. Copiar Variables CSS

Añade las siguientes variables CSS a tu `styles.css`:

```css
:root {
  /* Primary Colors */
  --ui-primary-50: #efe7ef;
  --ui-primary-100: #d8c4d7;
  --ui-primary-200: #bc9abb;
  --ui-primary-300: #a06b9d;
  --ui-primary-400: #8c4e8a;
  --ui-primary-500: #793576;
  --ui-primary-600: #6e306c;
  --ui-primary-700: #5f285f;
  --ui-primary-800: #512252;
  --ui-primary-900: #381738;

  /* Secondary Colors */
  --ui-secondary-50: #e6f7fc;
  --ui-secondary-100: #c2ecf8;
  --ui-secondary-200: #99dff3;
  --ui-secondary-300: #6dd2ee;
  --ui-secondary-400: #4ac7ea;
  --ui-secondary-500: #23a7d4;

  /* Surfaces */
  --ui-surface-bg: #ffffff;
  --ui-surface-elevated: #f3f4f6;
  --ui-surface-section: #f9fafb;
  --ui-border: #e5e7eb;
  --ui-text: #1f2937;
  --ui-text-secondary: #6b7280;
  --ui-text-muted: #9ca3af;

  /* Status Colors */
  --ui-success: #10b981;
  --ui-success-light: #d1fae5;
  --ui-warning: #f59e0b;
  --ui-warning-light: #fef3c7;
  --ui-error: #dc2626;
  --ui-error-light: #fee2e2;
  --ui-info: #0ea5e9;
  --ui-info-light: #e0f2fe;

  /* Spacing & Radius */
  --ui-radius-sm: 0.375rem;
  --ui-radius-md: 0.5rem;
  --ui-radius-lg: 0.75rem;
  --ui-radius-xl: 1rem;

  /* Shadows */
  --ui-shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --ui-shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1);
  --ui-shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1);
  --ui-shadow-xl: 0 20px 25px -5px rgba(0,0,0,0.1);
  --ui-focus-ring: 0 0 0 3px rgba(121,53,118,0.15);
}

/* Dark Mode */
[data-theme="dark"] {
  --ui-surface-bg: #111827;
  --ui-surface-elevated: #1f2937;
  --ui-surface-section: #374151;
  --ui-border: #4b5563;
  --ui-text: #f3f4f6;
  --ui-text-secondary: #9ca3af;
  --ui-text-muted: #6b7280;
}
```

### 3. Dependencias Opcionales

```bash
npm install @fortawesome/fontawesome-free
```

Añade a `angular.json`:
```json
"styles": [
  "node_modules/@fortawesome/fontawesome-free/css/all.min.css",
  "src/styles.css"
]
```

---

## Available Components

### Atoms (Basic building blocks)

| Component | Selector | Description |
|-----------|----------|-------------|
| `InputComponent` | `app-input` | Text input with label, icon, error states |
| `SelectComponent` | `app-select` | Native select with custom styling |
| `CheckboxComponent` | `app-checkbox` | Checkbox with ControlValueAccessor |
| `ToggleComponent` | `app-toggle` | Toggle switch with ControlValueAccessor |
| `ChipComponent` | `app-chip` | Status chips/tags |
| `AvatarComponent` | `app-avatar` | User avatar with fallback |
| `LoaderComponent` | `app-loader` | Loading spinner |
| `SkeletonComponent` | `app-skeleton` | Skeleton loading placeholder |
| `RatingComponent` | `app-rating` | Star rating |
| `IconButtonComponent` | `app-icon-button` | Icon button |

### Molecules (Component combinations)

| Component | Selector | Description |
|-----------|----------|-------------|
| `DropdownComponent` | `app-dropdown` | Custom dropdown/select |
| `PaginationComponent` | `app-pagination` | Pagination controls |
| `ToastComponent` | `app-toast` | Toast notifications |
| `ModalComponent` | `app-modal` | Modal dialog |
| `UserMenuComponent` | `app-user-menu` | User profile menu |

### Organisms (Complex components)

| Component | Selector | Description |
|-----------|----------|-------------|
| `AccordionComponent` | `app-accordion` | Collapsible accordion |
| `TabsComponent` | `app-tabs` | Tab navigation |
| `StepperComponent` | `app-stepper` | Multi-step wizard |
| `ScrollOverlayComponent` | `app-scroll-overlay` | Custom scrollbars |
| `FiltersComponent` | `app-filters` | Filter controls |
| `ThemeSwitcherComponent` | `app-theme-switcher` | Light/dark theme toggle |

---

## Usage Examples

### Input with Reactive Forms

```typescript
import { InputComponent } from './shared/ui/atoms/input/input.component';

@Component({
  imports: [InputComponent, ReactiveFormsModule],
  template: `
    <app-input
      label="Email"
      type="email"
      placeholder="Enter email"
      [formControl]="emailControl"
      [error]="emailControl.invalid ? 'Invalid email' : ''"
    />
  `
})
export class MyComponent {
  emailControl = new FormControl('', [Validators.email]);
}
```

### Dropdown

```typescript
import { DropdownComponent } from './shared/ui/molecules/dropdown/dropdown.component';

@Component({
  imports: [DropdownComponent],
  template: `
    <app-dropdown
      [options]="options"
      [(value)]="selectedValue"
      placeholder="Choose..."
    />
  `
})
export class MyComponent {
  options = [
    { value: 1, label: 'Option 1' },
    { value: 2, label: 'Option 2', icon: '🌟' }
  ];
  selectedValue = 1;
}
```

### Toast Service

```typescript
import { ToastService } from './shared/ui/services/toast.service';

export class MyComponent {
  toast = inject(ToastService);

  showSuccess() {
    this.toast.success('Operation completed!');
  }
}
```

---

## Angular Compatibility

- **Angular**: 19+
- **Standalone Components**: Yes
- **Change Detection**: OnPush
- **ControlValueAccessor**: Input, Select, Checkbox, Toggle, Dropdown
