# 👤 Profile Page Blueprint

Página de perfil de usuario completa con formularios de edición.

## Secciones

1. **Columna lateral** — Avatar, nombre completo, rol, email, teléfono
2. **Información personal** — Formulario para editar nombre, apellido, teléfono
3. **Cambiar contraseña** — Contraseña actual + nueva contraseña con confirmación

## Uso rápido

### 1. Copiar la carpeta

```bash
cp -r blueprints/profile-page src/app/pages/profile-page
```

### 2. Configurar los endpoints

```typescript
// profile-page.component.ts
const PROFILE_ENDPOINT         = '/Users/GetProfile';
const SAVE_PROFILE_ENDPOINT    = '/Users/UpdateProfile';
const CHANGE_PASSWORD_ENDPOINT = '/Authentication/ChangePassword';
```

### 3. Ajustar la interface de usuario

```typescript
interface UserProfile {
  id:        string;
  firstName: string;
  lastName:  string;
  email:     string;
  role?:     string;
  phone?:    string;
  avatar?:   string;
}
```

### 4. Agregar la ruta

```typescript
// app.routes.ts
{
  path: 'profile',
  loadComponent: () => import('./pages/profile-page/profile-page.component')
    .then(m => m.ProfilePageComponent),
  canActivate: [authGuard]
}
```

## Dependencias

| Componente | Descripción |
|---|---|
| `LayoutShellComponent` | Shell principal con sidebar + topbar |
| `AvatarComponent` | Avatar del usuario |
| `FloatingInputComponent` | Campos del formulario |
| `AlertComponent` | Mensajes de éxito/error |
| `SkeletonComponent` | Estado de carga |
| `ApiService` + `useApi` | Peticiones HTTP con estado reactivo |
| `AuthService` | Datos del usuario autenticado |
