# 🔑 Forgot Password Blueprint

Flujo completo de recuperación de contraseña en 4 pasos.

## Pasos del flujo

| Paso | Estado | Descripción |
| --- | --- | --- |
| 1 | `request` | El usuario ingresa su email |
| 2 | `sent` | Confirmación de que el correo fue enviado |
| 3 | `reset` | El usuario ingresa código + nueva contraseña |
| 4 | `done` | Confirmación de contraseña actualizada |

## Uso rápido

### 1. Copiar la carpeta

```bash
cp -r blueprints/forgot-password-page src/app/pages/forgot-password-page
```

### 2. Configurar los endpoints

```typescript
const FORGOT_ENDPOINT = '/Authentication/ForgotPassword'; // ← email
const RESET_ENDPOINT  = '/Authentication/ResetPassword';  // ← código + nueva pass
```

### 3. Agregar la ruta

```typescript
// app.routes.ts
{
  path: 'forgot-password',
  loadComponent: () => import('./pages/forgot-password-page/forgot-password-page.component')
    .then(m => m.ForgotPasswordPageComponent),
  canActivate: [guestGuard]
}
```

## Dependencias

| Componente | Descripción |
| --- | --- |
| `AuthLayoutComponent` | Layout centrado |
| `FloatingInputComponent` | Campos del formulario |
| `AlertComponent` | Errores de API |
| `ButtonComponent` | Acciones |
| `DividerComponent` | Separador visual |
| `useApi` | Estado reactivo de peticiones HTTP |
