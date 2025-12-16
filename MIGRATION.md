# Guía de Migración de Atomic UI

Esta guía detalla los pasos para integrar la librería de componentes `shared/ui` en un nuevo proyecto Angular.

## 1. Prerrequisitos

Asegúrate de que tu nuevo proyecto tenga las siguientes versiones mínimas:
- Angula 17+ (Recomendado 18/19)
- Node.js 18+

## 2. Instalación de Dependencias

Ejecuta el siguiente comando en la raíz de tu **nuevo proyecto** para instalar las librerías necesarias:

```bash
npm install @fontsource/open-sans @fortawesome/fontawesome-free @ngx-translate/core @ngx-translate/http-loader tailwindcss postcss autoprefixer
```

## 3. Copiar Archivos

Copia las siguientes carpetas completas desde este proyecto al nuevo:

| Origen | Destino | Descripción |
|--------|---------|-------------|
| `src/app/shared/ui` | `src/app/shared/ui` | Librería de componentes completa |
| `src/styles/themes` | `src/styles/themes` | Sistema de tokens CSS y temas |

> **Nota:** Si tu estructura de carpetas es diferente, asegúrate de actualizar las rutas de importación en `src/app/shared/ui/index.ts` si es necesario, aunque la librería está diseñada para ser autocontenida.

## 4. Configuración de Estilos Globales

Edita tu archivo `src/styles.css` (o `.scss`) en el nuevo proyecto y agrega lo siguiente al principio:

```css
/* Fuentes e Iconos */
@import "@fontsource/open-sans/400.css";
@import "@fontsource/open-sans/500.css";
@import "@fontsource/open-sans/600.css";
@import "@fontsource/open-sans/700.css";
@import "@fortawesome/fontawesome-free/css/all.css";

/* Sistema de Temas UI */
@import './styles/themes/index.css';

/* Tailwind (Si usas Tailwind) */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## 5. Configuración de Tailwind (Opcional pero Recomendado)

Si usas Tailwind CSS, asegúrate de que tu `tailwind.config.js` incluya las rutas de los componentes UI para que el purgado de CSS no elimine estilos necesarios:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "./src/app/shared/ui/**/*.{html,ts}" // <-- IMPORTANTE
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## 6. Configuración de TypeScript (Path Alias)

Para facilitar las importaciones, agrega esto a tu `tsconfig.json` (dentro de `compilerOptions` -> `paths`):

```json
"paths": {
  "@shared/ui": ["src/app/shared/ui"]
}
```

## 7. Uso de Componentes

Ahora puedes importar cualquier componente directamente:

```typescript
import { Component } from '@angular/core';
import { ButtonComponent, CardComponent, ThemeSwitcherComponent } from '@shared/ui';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ButtonComponent, CardComponent, ThemeSwitcherComponent],
  template: `
    <app-theme-switcher></app-theme-switcher>
    <app-card>
      <app-button label="Hola Mundo"></app-button>
    </app-card>
  `
})
export class AppComponent {}
```

## 8. Personalización de Marca

Para cambiar los colores a los de tu nuevo proyecto:
1. Abre `src/styles/themes/_tokens-brand.css`
2. Modifica los valores de `--brand-primary-*` y `--brand-secondary-*`

¡Listo! Tu sistema de diseño está migrado.
