import { Routes } from '@angular/router';
import { authGuard, guestGuard } from '@shared/ui';

/**
 * Ejemplo de app.routes.ts con guards de autenticación.
 *
 * @customize Copia las rutas relevantes a tu app.routes.ts real.
 */
export const routesExample: Routes = [
  // Rutas públicas — solo para usuarios NO autenticados
  {
    path: 'login',
    loadComponent: () => import('../login-page/login-page.component').then(m => m.LoginPageComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'register',
    loadComponent: () => import('../register-page/register-page.component').then(m => m.RegisterPageComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('../forgot-password-page/forgot-password-page.component').then(m => m.ForgotPasswordPageComponent),
    canActivate: [guestGuard],
  },

  // Rutas protegidas — solo para usuarios autenticados
  {
    path: 'dashboard',
    loadComponent: () => import('../dashboard-page/dashboard-page.component').then(m => m.DashboardPageComponent),
    canActivate: [authGuard],
  },
  {
    path: 'settings',
    loadComponent: () => import('../settings-page/settings-page.component').then(m => m.SettingsPageComponent),
    canActivate: [authGuard],
  },

  // Rutas de error
  { path: '404', loadComponent: () => import('../error-pages/error-pages.component').then(m => m.ErrorPagesComponent) },
  { path: '500', loadComponent: () => import('../error-pages/error-pages.component').then(m => m.ErrorPagesComponent), data: { code: 500 } },

  // Catch-all
  { path: '**', redirectTo: '404' },
];
