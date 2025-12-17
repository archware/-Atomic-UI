# 🏠 Dashboard Page Blueprint

Dashboard principal con sidebar navegable, topbar con usuario, y estadísticas dinámicas.

## ✨ Características

- ✅ Layout responsive con LayoutShell
- ✅ Sidebar colapsable con navegación
- ✅ Topbar con menú de usuario y notificaciones
- ✅ Cards de estadísticas con API
- ✅ Panel de actividad reciente
- ✅ Acciones rápidas
- ✅ Loading skeletons
- ✅ Manejo de errores de API
- ✅ Soporte Dark Mode

## 📦 Componentes Usados

| Componente | Uso |
|------------|-----|
| `LayoutShellComponent` | Template principal con sidebar/content |
| `TopbarComponent` | Barra superior con toggle y usuario |
| `SidebarComponent` | Navegación lateral |
| `PanelComponent` | Contenedores de contenido |
| `ButtonComponent` | Botones de acción |
| `ChipComponent` | Badges de estado |
| `ApiService` | Cliente HTTP |
| `useApi()` | Hook para estado de API |

## 🚀 Instalación

### 1. Copiar archivos

```bash
cp -r src/blueprints/dashboard-page src/app/pages/dashboard
```

### 2. Agregar ruta con guard

```typescript
// app.routes.ts
import { inject } from '@angular/core';
import { Router } from '@angular/router';

const authGuard = () => {
  const router = inject(Router);
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  
  if (!token) {
    router.navigate(['/login']);
    return false;
  }
  return true;
};

export const routes: Routes = [
  { 
    path: 'dashboard', 
    loadComponent: () => import('./pages/dashboard/dashboard-page.component')
      .then(m => m.DashboardPageComponent),
    canActivate: [authGuard]
  }
];
```

### 3. Configurar API

Edita las constantes en `dashboard-page.component.ts`:

```typescript
private readonly API_BASE_URL = 'https://tu-api.com/v1';
private readonly TOKEN_KEY = 'auth_token';
```

### 4. Configurar menú

Modifica el array `menuItems` según tus rutas:

```typescript
menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'fa-solid fa-home', route: '/dashboard' },
  { id: 'users', label: 'Usuarios', icon: 'fa-solid fa-users', route: '/dashboard/users' },
  // ... más items
];
```

## 📡 Endpoint de API Esperado

| Método | Endpoint | Response |
|--------|----------|----------|
| GET | `/dashboard/stats` | `{ totalUsers, activeProjects, pendingTasks, revenue }` |

## 🎨 Personalización

### Cambiar Logo

En el template, busca `.sidebar-logo`:

```html
<div class="sidebar-logo">
  <img src="/assets/logo.svg" alt="Logo" class="logo-image" />
  <span class="logo-text">Mi App</span>
</div>
```

### Agregar más Stats Cards

```html
<app-panel class="stat-card">
  <div class="stat-content">
    <div class="stat-icon stat-icon--custom">
      <i class="fa-solid fa-chart-line"></i>
    </div>
    <div class="stat-info">
      <span class="stat-label">Nueva Métrica</span>
      <span class="stat-value">{{ value }}</span>
    </div>
  </div>
</app-panel>
```

### Cambiar Colores de Stats

Agrega nuevas clases en el CSS:

```css
.stat-icon--custom {
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
}
```

## 📱 Responsive Behavior

| Breakpoint | Comportamiento |
|------------|----------------|
| Desktop (> 768px) | Sidebar visible, grid 2 columnas |
| Tablet/Mobile (≤ 768px) | Sidebar oculto (overlay), grid 1 columna |

El sidebar se cierra automáticamente en mobile al hacer clic en un item del menú.
