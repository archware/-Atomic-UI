import { Routes } from '@angular/router';
import { authGuard, guestGuard } from '@shared/ui/guards/auth.guard';

/**
 * Ejemplo de app.routes.ts con guards de autenticaciÃ³n.
 *
 * @customize Copia las rutas relevantes a tu app.routes.ts real.
 */
export const routesExample: Routes = [
  // Rutas pÃºblicas â€” solo para usuarios NO autenticados
  {
    path: 'login',
    loadComponent: () => import('../login-page/login-page.component').then(m => m.LoginPageComponent),
    canActivate: [guestGuard],
  },

  // Rutas protegidas â€” solo para usuarios autenticados
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

