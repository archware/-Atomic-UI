# 🎨 Blueprints - Plantillas Reutilizables

Este directorio contiene **blueprints** (plantillas) listas para copiar a nuevos proyectos Angular.

## 📂 Estructura

```
blueprints/
├── login-page/          # Página de autenticación completa
├── dashboard-page/      # Dashboard con Sidebar + Topbar + API
└── crud-table/          # Tabla CRUD con paginación y filtros
```

## 🚀 Cómo Usar

### 1. Copiar Blueprint

```bash
# Copiar toda la carpeta del blueprint a tu proyecto
cp -r src/blueprints/login-page src/app/pages/login
```

### 2. Actualizar Imports

Editar las rutas de importación según tu estructura:

```typescript
// De:
import { AuthLayoutComponent, ButtonComponent } from '@shared/ui';

// A (ajustar según tu proyecto):
import { AuthLayoutComponent, ButtonComponent } from '@atomic-ui/components';
```

### 3. Configurar API Base URL

En tu `app.config.ts` o en el constructor del componente:

```typescript
import { ApiService } from '@shared/ui';

// En app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: (api: ApiService) => () => {
        api.setBaseUrl('https://api.tu-servidor.com/v1');
      },
      deps: [ApiService],
      multi: true
    }
  ]
};
```

### 4. Agregar a Rutas

```typescript
// app.routes.ts
export const routes: Routes = [
  { 
    path: 'login', 
    loadComponent: () => import('./pages/login/login-page.component')
      .then(m => m.LoginPageComponent) 
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./pages/dashboard/dashboard-page.component')
      .then(m => m.DashboardPageComponent) 
  }
];
```

## 📋 Requisitos

Asegúrate de tener instaladas las dependencias:

```bash
npm install @fontsource/open-sans @fortawesome/fontawesome-free
```

Y configurados los estilos en `styles.css`:

```css
@import './styles/themes/index.css';
@import "@fontsource/open-sans/400.css";
@import "@fortawesome/fontawesome-free/css/all.min.css";
```

## 🎯 Blueprints Disponibles

| Blueprint | Descripción | Componentes Usados |
|-----------|-------------|-------------------|
| **login-page** | Login + Register + Forgot Password con tabs | `AuthLayoutComponent`, `FloatingInputComponent`, `ButtonComponent`, `TabsComponent` |
| **dashboard-page** | Shell + Sidebar + Topbar + contenido dinámico | `LayoutShellComponent`, `TopbarComponent`, `SidebarComponent`, `PanelComponent` |
| **crud-table** | Tabla con paginación, filtros y acciones | `PanelComponent`, `PaginationComponent`, `FiltersComponent`, `ModalComponent` |
