# Guía de Integración Manual

Esta guía detalla los pasos para integrar la librería de componentes `shared/ui` en un proyecto Angular existente **sin usar el generador automático**.

> **Nota:** Para proyectos nuevos, recomendamos usar `npm run create:project`.

## 1. Prerrequisitos

Asegúrate de que tu proyecto tenga las siguientes versiones mínimas:
- Angular 17+ (Recomendado 20+)
- Node.js 18+

## 2. Instalación de Dependencias

Ejecuta el siguiente comando en la raíz de tu proyecto para instalar las librerías necesarias:

```bash
npm install @fontsource/open-sans @fortawesome/fontawesome-free @ngx-translate/core @ngx-translate/http-loader tailwindcss postcss autoprefixer zone.js
```

## 3. Copiar Archivos

Copia las siguientes carpetas completas desde Atomic UI a tu proyecto:

| Origen | Destino | Descripción |
|--------|---------|-------------|
| `src/app/shared/ui` | `src/app/shared/ui` | Librería de componentes completa |
| `src/styles/themes` | `src/styles/themes` | Sistema de tokens CSS y temas |

> **Nota:** Si tu estructura de carpetas es diferente, asegúrate de actualizar las rutas de importación en `src/app/shared/ui/index.ts`.

## 4. Configuración de Estilos Globales

Edita tu archivo `src/styles.css` (o `.scss`) y agrega lo siguiente al principio:

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

Asegúrate de definir la fuente base en `:root` (si no lo hace `_tokens-primitives.css`):
```css
:root {
  --font-family-base: 'Open Sans', system-ui, sans-serif;
}
```

## 5. Configuración de Tailwind

Asegúrate de que tu `tailwind.config.js` incluya las rutas de los componentes UI:

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

Agrega esto a tu `tsconfig.json` (dentro de `compilerOptions` -> `paths`):

```json
"paths": {
  "@shared/ui": ["src/app/shared/ui"]
}
```

## 7. Configuración de App (Providers)

En `app.config.ts`, asegúrate de incluir `HttpClient` y `TranslateModule`:

```typescript
import { provideHttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    importProvidersFrom(TranslateModule.forRoot())
  ]
};
```

## 8. Personalización de Marca

Para cambiar los colores:
1. Abre `src/styles/themes/_tokens-brand.css`
2. Modifica los valores de `--brand-primary-*` y `--brand-secondary-*`
