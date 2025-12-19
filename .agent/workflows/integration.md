---
description: Cómo integrar librería de componentes en proyecto Angular existente
---

# Guía de Integración Manual

## 1. Prerrequisitos
- Angular 17+ (Recomendado 20+)
- Node.js 18+

## 2. Instalación de Dependencias

```bash
npm install @fontsource/open-sans @fortawesome/fontawesome-free @ngx-translate/core @ngx-translate/http-loader
```

## 3. Copiar Archivos

| Origen | Destino |
|--------|---------|
| `src/app/shared/ui` | `src/app/shared/ui` |
| `src/styles/themes` | `src/styles/themes` |

## 4. Estilos Globales

En `src/styles.css`:

```css
@import "@fontsource/open-sans/400.css";
@import "@fontsource/open-sans/600.css";
@import "@fortawesome/fontawesome-free/css/all.css";
@import './styles/themes/index.css';
```

## 5. Path Alias (tsconfig.json)

```json
"paths": {
  "@shared/ui": ["src/app/shared/ui"]
}
```

## 6. App Config

```typescript
import { provideHttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    importProvidersFrom(TranslateModule.forRoot())
  ]
};
```

## 7. Personalización

Editar `src/styles/themes/_tokens-brand.css` para colores de marca.
