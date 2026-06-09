import { Routes } from '@angular/router';
import { authGuard, guestGuard } from '@shared/ui';

/**
 * Rutas principales de la aplicación con lazy loading y auth guards.
 *
 * Configuración en app.config.ts:
 *   provideRouter(routes, withPreloading(PreloadAllModules), withScrollPositionRestoration('enabled'))
 */
export const routes: Routes = [
  // Redireccion raíz → showcase (landing page de la librería de componentes)
  { path: '', redirectTo: 'showcase', pathMatch: 'full' },

  // ===================================================
  // Showcase — página pública de demostración
  // ===================================================
  {
    path: 'showcase',
    loadComponent: () =>
      import('./pages/showcase/showcase-page.component').then(m => m.ShowcasePageComponent),
  },

  // ===================================================
  // Rutas PÚBLICAS (solo usuarios no autenticados)
  // ===================================================
  {
    path: 'login',
    loadComponent: () =>
      import('../blueprints/login-page/login-page.component').then(m => m.LoginPageComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'register',
    loadComponent: () =>
      import('../blueprints/register-page/register-page.component').then(m => m.RegisterPageComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('../blueprints/forgot-password-page/forgot-password-page.component').then(m => m.ForgotPasswordPageComponent),
    canActivate: [guestGuard],
  },

  // ===================================================
  // Rutas PROTEGIDAS (requieren autenticación)
  // ===================================================
  {
    path: 'dashboard',
    loadComponent: () =>
      import('../blueprints/dashboard-page/dashboard-page.component').then(m => m.DashboardPageComponent),
    // canActivate: [authGuard], // Disabled for UI Demo
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('../blueprints/profile-page/profile-page.component').then(m => m.ProfilePageComponent),
    // canActivate: [authGuard], // Disabled for UI Demo
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('../blueprints/settings-page/settings-page.component').then(m => m.SettingsPageComponent),
    // canActivate: [authGuard], // Disabled for UI Demo
  },
  {
    path: 'crud',
    loadComponent: () =>
      import('../blueprints/crud-table/crud-table.component').then(m => m.CrudTableComponent),
    // canActivate: [authGuard], // Disabled for UI Demo
  },

  // ===================================================
  // Rutas de ERROR
  // ===================================================
  {
    path: '403',
    loadComponent: () =>
      import('../blueprints/error-pages/error-pages.component').then(m => m.ErrorPagesComponent),
    data: { code: 403 },
  },
  {
    path: '404',
    loadComponent: () =>
      import('../blueprints/error-pages/error-pages.component').then(m => m.ErrorPagesComponent),
    data: { code: 404 },
  },
  {
    path: '500',
    loadComponent: () =>
      import('../blueprints/error-pages/error-pages.component').then(m => m.ErrorPagesComponent),
    data: { code: 500 },
  },

  // Catch-all → 404 (lazy, coherente con las demás rutas de error)
  {
    path: '**',
    loadComponent: () =>
      import('../blueprints/error-pages/error-pages.component').then(m => m.ErrorPagesComponent),
    data: { code: 404 },
  },
];

