# ⚙️ Settings Page Blueprint

Página de configuración de cuenta con 4 secciones: Perfil, Seguridad, Notificaciones y Apariencia.

## Uso rápido

```bash
cp -r blueprints/settings-page src/app/pages/settings
```

```typescript
// app.routes.ts
{
  path: 'settings',
  loadComponent: () => import('./pages/settings/settings-page.component')
    .then(m => m.SettingsPageComponent),
  canActivate: [authGuard]
}
```

## Secciones

| Tab | Funcionalidad |
| --- | --- |
| **Perfil** | Nombre, email, teléfono, bio, foto de avatar |
| **Seguridad** | Cambio de contraseña con validación |
| **Notificaciones** | Toggles para email, push, resumen semanal, sistema |
| **Apariencia** | Theme switcher + selector de idioma |

## Personalización

1. En el componente TS, busca los comentarios `@customize`
2. Reemplaza los métodos `save*()` con llamadas reales a tu `ApiService`
3. Ajusta el formulario de perfil al modelo de tu API
