# 📝 Register Page Blueprint

Página de registro completa lista para usar en tu proyecto Angular.

## Características

- Formulario reactivo con validaciones en tiempo real
- Campos: nombre, apellido, email, contraseña, confirmar contraseña, aceptar T&C
- Validación de contraseñas coincidentes
- `AlertComponent` para errores de API
- Estado de éxito con confirmación visual
- Redirige al login tras registro exitoso

## Uso rápido

### 1. Copiar la carpeta

```bash
cp -r blueprints/register-page src/app/pages/register-page
```

### 2. Configurar el endpoint

```typescript
// register-page.component.ts
const REGISTER_ENDPOINT = '/Authentication/Register'; // ← cambia aquí
```

### 3. Ajustar la interface de respuesta

```typescript
interface RegisterResponse {
  message: string;
  userId?: string; // ← ajusta a tu API
}
```

### 4. Agregar la ruta

```typescript
// app.routes.ts
import { guestGuard } from '@shared/ui';

export const routes: Routes = [
  {
    path: 'register',
    loadComponent: () => import('./pages/register-page/register-page.component')
      .then(m => m.RegisterPageComponent),
    canActivate: [guestGuard]
  }
];
```

## Dependencias

| Componente | Descripción |
| --- | --- |
| `AuthLayoutComponent` | Layout centrado para páginas de autenticación |
| `FloatingInputComponent` | Inputs con label flotante |
| `ButtonComponent` | Botones de acción |
| `AlertComponent` | Mensajes de error/éxito inline |
| `CheckboxComponent` | Aceptación de términos |
| `ApiService` + `useApi` | Consumo de API con estado reactivo |
