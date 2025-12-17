# 🔐 Login Page Blueprint

Página de autenticación completa con Login, Registro y Recuperación de contraseña.

## ✨ Características

- ✅ Formulario de Login con validación
- ✅ Formulario de Registro con confirmación de contraseña
- ✅ Flujo de recuperación de contraseña
- ✅ Checkbox "Recordarme" con persistencia
- ✅ Integración con ApiService para llamadas HTTP
- ✅ Estados de carga y error
- ✅ Animaciones suaves entre vistas
- ✅ Soporte Dark Mode
- ✅ Diseño responsive

## 📦 Componentes Usados

| Componente | Uso |
|------------|-----|
| `AuthLayoutComponent` | Template de layout para autenticación |
| `FloatingInputComponent` | Inputs con labels flotantes |
| `ButtonComponent` | Botones con loading state |
| `CheckboxComponent` | Checkbox para "Recordarme" |
| `ApiService` | Cliente HTTP para llamadas al backend |
| `useApi()` | Hook para manejo de estado de API |

## 🚀 Instalación

### 1. Copiar archivos

```bash
cp -r src/blueprints/login-page src/app/pages/login
```

### 2. Agregar ruta

```typescript
// app.routes.ts
export const routes: Routes = [
  { 
    path: 'login', 
    loadComponent: () => import('./pages/login/login-page.component')
      .then(m => m.LoginPageComponent) 
  }
];
```

### 3. Configurar API

Edita las constantes en `login-page.component.ts`:

```typescript
// @customize Set your API base URL
private readonly API_BASE_URL = 'https://tu-api.com/v1';

// @customize Route to redirect after successful login
private readonly REDIRECT_AFTER_LOGIN = '/dashboard';

// @customize Token storage key
private readonly TOKEN_KEY = 'auth_token';
```

## 📡 Endpoints de API Esperados

| Método | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/auth/login` | `{ email, password }` | `{ token, user }` |
| POST | `/auth/register` | `{ name, email, password }` | `{ message, userId }` |
| POST | `/auth/forgot-password` | `{ email }` | `{ message }` |

## 🎨 Personalización

### Cambiar Logo

En `login-page.component.html`, busca el slot `header`:

```html
<div slot="header">
  <div class="auth-logo">
    <!-- Reemplaza con tu logo -->
    <img src="/assets/logo.svg" alt="Mi Logo" class="logo-image">
    <h1 class="logo-text">Mi Empresa</h1>
  </div>
</div>
```

### Cambiar Colores

Los colores se heredan del sistema de tokens CSS:
- Primary: Login button, links
- Success: Mensajes de éxito
- Danger: Mensajes de error

Modifica `src/styles/themes/_tokens-brand.css` para cambiar la paleta.

### Agregar Social Login

Agrega botones después del divider "o":

```html
<div class="social-buttons">
  <app-button variant="outline" (onClick)="loginWithGoogle()">
    <i class="fa-brands fa-google" icon-left></i>
    Google
  </app-button>
</div>
```
