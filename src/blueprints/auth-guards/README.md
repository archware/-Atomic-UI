# 🔐 Auth Guards Blueprint

Este blueprint proporciona un sistema completo de autenticación para proyectos Angular.

## 📦 Contenido

| Archivo | Descripción |
|---------|-------------|
| `token.service.ts` | Manejo de JWT con cookies |
| `auth.service.ts` | Login, logout, refresh token |
| `auth.guard.ts` | Guards para rutas protegidas |
| `auth.interceptor.ts` | Interceptor HTTP automático |

## 🚀 Uso Rápido

### 1. Configurar en `app.config.ts`

```typescript
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from '@shared/ui/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};
```

### 2. Proteger rutas en `app.routes.ts`

```typescript
import { authGuard, guestGuard } from '@shared/ui/guards/auth.guard';

export const routes: Routes = [
  { 
    path: 'login', 
    loadComponent: () => import('./pages/login'),
    canActivate: [guestGuard]  // Solo usuarios no autenticados
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./pages/dashboard'),
    canActivate: [authGuard]   // Solo usuarios autenticados
  }
];
```

### 3. Usar AuthService en componentes

```typescript
import { AuthService, LoginRequest } from '@shared/ui/services/auth.service';

@Component({...})
export class LoginComponent {
  private auth = inject(AuthService);

  onLogin() {
    const credentials: LoginRequest = {
      v_user: 'admin',
      v_password: '123456',
      v_ip: '127.0.0.1'
    };

    this.auth.login(credentials).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => console.error(err)
    });
  }
}
```

## ⚙️ Configuración

### TokenService

```typescript
// Multi-app: cada app tiene su propio token
tokenService.saveTokenApp('jwt-token', '2');  // App ID 2
tokenService.getTokenApp('2');
tokenService.hasValidToken('2');
tokenService.removeTokenApp('2');
```

### AuthService

```typescript
// Configurar app ID
authService.configure('2');

// Estado reactivo
authService.isAuthenticated();  // Signal<boolean>
authService.currentUser();       // Signal<UserProfile | null>
authService.loading();           // Signal<boolean>
authService.error();             // Signal<string | null>
```

## 📝 Endpoints Esperados

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/Authentication/PostLogin` | POST | Login |
| `/Authentication/Get_user_profile` | GET | Perfil de usuario |
| `/Authentication/Post_refresh_token` | POST | Refresh token |

## 🔄 Flujo de Autenticación

```
1. Usuario envía credenciales
   ↓
2. POST /Authentication/PostLogin
   ↓
3. Recibe access_Token + refresh_Token
   ↓
4. TokenService guarda en cookies
   ↓
5. AuthService configura estado
   ↓
6. authInterceptor agrega token a requests
   ↓
7. Si 401 → refresh automático
```
