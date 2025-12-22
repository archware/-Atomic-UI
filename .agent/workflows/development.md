---
description: Cómo desarrollar componentes con hot-reload y generar proyectos
---

# 🛠️ Guía de Desarrollo con Hot-Reload

## 📋 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev:components` | Storybook para desarrollo de componentes |
| `npm run dev:full` | Storybook + Watch simultáneo |
| `npm run lib:link` | Crear enlace npm global |
| `npm run docs` | Generar documentación con Compodoc |
| `npm run create:project` | Generar nuevo proyecto |

---

## 🔄 Flujo de Desarrollo

### Opción A: Storybook (Recomendado)

```bash
npm run dev:components
# Abre http://localhost:6006
```

### Opción B: npm link (Para proyectos consumidores)

```bash
# Terminal 1: Atomic-UI
npm run lib:link
npm run watch

# Terminal 2: Tu proyecto
cd mi-proyecto
npm link atomic-ui
npm start
```

---

## 🚀 Generar Nuevo Proyecto

```bash
# Uso básico
npm run create:project my-app

# Con plantilla
npm run create:project my-app -- --template=login+dashboard
```

### Plantillas

| Plantilla | Incluye |
|-----------|---------|
| `login` | Login, Register, Forgot Password |
| `dashboard` | Dashboard con Sidebar y Stats |
| `crud` | Tabla CRUD con paginación |
| `login+dashboard` | Login + Dashboard |
| `full` | Todas las anteriores |

---

## 🔑 Credenciales de Demo

> **Nota**: Los proyectos generados usan autenticación MOCK para demostración.

### Login (Demo Mode)
| Campo | Valor |
|-------|-------|
| **Email** | Cualquier email válido (ej: `demo@example.com`) |
| **Password** | Cualquier contraseña (mínimo 6 caracteres) |

El login simula una respuesta API con 1.5 segundos de delay y redirige automáticamente a `/dashboard`.

### Configurar API Real

Edita `login.component.ts` línea ~99:
```typescript
private readonly API_BASE_URL = 'https://tu-api.com/v1';
```

Y descomenta la línea ~208:
```typescript
this.api.post<LoginResponse>('/auth/login', { email, password })
```

---

## 🐛 Solución de Problemas

### Error: "NG0908: Angular requires Zone.js"

Este error ocurre con SSR. Asegúrate de que `main.server.ts` tenga el import:

```typescript
import 'zone.js';  // ← Primera línea del archivo
import { BootstrapContext, bootstrapApplication } from '@angular/platform-browser';
```

### Error: "new version of pre-bundle" (Vite Cache)

```bash
# 1. Detener el servidor (Ctrl+C)
# 2. Limpiar caché:
rd /s /q .angular\cache
# 3. Reiniciar:
npm start
```

### Error: "Cannot find module 'atomic-ui'"

```bash
npm run lib:unlink
npm run lib:link
cd mi-proyecto
npm link atomic-ui
```

### Los cambios no se reflejan

1. Verificar que `npm run watch` está corriendo
2. Limpiar caché del navegador (Ctrl+Shift+R)
3. Reiniciar `ng serve`

---

## 📂 Estructura del Proyecto Generado

```
my-app/
├── src/
│   ├── app/
│   │   ├── pages/           # Páginas (login, dashboard)
│   │   ├── shared/ui/       # Componentes Atomic UI copiados
│   │   ├── app.routes.ts    # Configuración de rutas
│   │   └── app.config.ts    # Providers de Angular
│   ├── main.ts              # Entry point cliente
│   └── main.server.ts       # Entry point SSR
└── angular.json             # Configuración del proyecto
```
