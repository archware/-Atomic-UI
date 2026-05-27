import { Routes } from '@angular/router';
import { authGuard, guestGuard } from '@shared/ui';
import { ErrorPagesComponent } from '../blueprints/error-pages/error-pages.component';

/**
 * Rutas principales de la aplicación con lazy loading y auth guards.
 *
 * Para usar en app.config.ts:
 *   provideRouter(routes, withPreloading(PreloadAllModules))
 */
export const routes: Routes = [
  // Redireccion raíz
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

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
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('../blueprints/profile-page/profile-page.component').then(m => m.ProfilePageComponent),
    canActivate: [authGuard],
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('../blueprints/settings-page/settings-page.component').then(m => m.SettingsPageComponent),
    canActivate: [authGuard],
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

  // Catch-all → 404
  { path: '**', component: ErrorPagesComponent, data: { code: 404 } },
];
