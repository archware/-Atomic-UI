# 🚨 Error Pages Blueprint

Páginas de error reutilizables para 400, 401, 403, **404**, **500** y 503.

## Uso rápido

### 1. Copiar componente

```bash
cp -r blueprints/error-pages src/app/pages/error-pages
```

### 2. Registrar rutas

```typescript
// app.routes.ts
import { ErrorPagesComponent } from './pages/error-pages/error-pages.component';

export const routes: Routes = [
  // ... tus rutas ...
  { path: '404', component: ErrorPagesComponent, data: { code: 404 } },
  { path: '500', component: ErrorPagesComponent, data: { code: 500 } },
  { path: '**', component: ErrorPagesComponent },  // catch-all
];
```

### 3. Usar inline en componentes

```html
<!-- Cuando una petición falla -->
@if (apiError()) {
  <app-error-pages
    [code]="500"
    [showSecondaryAction]="true"
    [showTechnicalInfo]="true"
    [technicalMessage]="apiError()?.message"
  ></app-error-pages>
}
```

## Inputs

| Input | Tipo | Default | Descripción |
| --- | --- | --- | --- |
| `code` | `400\|401\|403\|404\|500\|503` | `404` | Código HTTP a mostrar |
| `title` | `string` | Auto | Override del título |
| `description` | `string` | Auto | Override de la descripción |
| `icon` | `string` | Auto | Override del emoji/icono |
| `primaryActionLabel` | `string` | `'Ir al inicio'` | Label del botón principal |
| `primaryActionRoute` | `string` | `'/'` | Ruta del botón principal |
| `showSecondaryAction` | `boolean` | `false` | Mostrar botón "Reintentar" |
| `showTechnicalInfo` | `boolean` | `false` | Mostrar detalles técnicos |
| `technicalMessage` | `string` | — | Mensaje técnico para devs |

## Personalización

Edita `ERROR_DEFAULTS` en el componente para ajustar los mensajes por defecto a tu proyecto.
