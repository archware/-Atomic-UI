---
description: Cómo desarrollar componentes con hot-reload y generar proyectos
---

# 🛠️ Guía de Desarrollo con Hot-Reload

## 📋 Prerequisitos

| Herramienta | Versión Mínima | Verificar |
|-------------|----------------|-----------|
| Node.js | 18+ | `node -v` |
| npm | 9+ | `npm -v` |
| Angular CLI | 17+ | `ng version` |

---

## 🚀 Setup Inicial (Primera vez)

> Solo necesario la primera vez que clonas el proyecto

// turbo
1. **Instalar dependencias**
```bash
npm install
```

2. **Verificar instalación**
```bash
npm run storybook -- --help
```

---

## 📋 Scripts Disponibles

| Script | Descripción | Puerto |
|--------|-------------|--------|
| `npm start` | App de demostración | :4200 |
| `npm run storybook` | Storybook completo | :6006 |
| `npm run dev:components` | Alias de Storybook | :6006 |
| `npm run dev:full` | Storybook + Watch simultáneo | :6006 |
| `npm run watch` | Build en modo watch | - |
| `npm run lib:link` | Crear enlace npm global | - |
| `npm run lib:unlink` | Eliminar enlace npm global | - |
| `npm run docs` | Documentación Compodoc | :8080 |
| `npm run create:project` | Generar nuevo proyecto | - |
| `npm run lint` | Verificar código con ESLint | - |
| `npm run test` | Ejecutar tests unitarios | - |

---

## 🔄 Flujos de Desarrollo

### Opción A: Storybook (Recomendado para componentes)

// turbo
1. **Iniciar Storybook**
```bash
npm run dev:components
```

2. **Abrir navegador** → http://localhost:6006

3. **Verificar**: Debes ver la interfaz de Storybook con los componentes disponibles

---

### Opción B: App de Demostración

// turbo
1. **Iniciar app**
```bash
npm start
```

2. **Abrir navegador** → http://localhost:4200

---

### Opción C: npm link (Para proyectos consumidores)

1. **Terminal 1 - Atomic-UI**: Crear enlace y watch
```bash
npm run lib:link
npm run watch
```

2. **Terminal 2 - Tu proyecto**: Vincular y ejecutar
```bash
cd mi-proyecto
npm link atomic-ui
npm start
```

3. **Verificar**: Los cambios en Atomic-UI se reflejan automáticamente

---

## 🚀 Generar Nuevo Proyecto

// turbo
1. **Uso básico**
```bash
npm run create:project my-app
```

2. **Con plantilla específica**
```bash
npm run create:project my-app -- --template=login+dashboard
```

### Plantillas Disponibles

| Plantilla | Incluye |
|-----------|---------|
| `login` | Login, Register, Forgot Password |
| `dashboard` | Dashboard con Sidebar y Stats |
| `crud` | Tabla CRUD con paginación |
| `login+dashboard` | Login + Dashboard combinado |
| `full` | Todas las plantillas anteriores |

---

## 📚 Documentación

// turbo
1. **Generar y servir documentación**
```bash
npm run docs
```

2. **Abrir navegador** → http://localhost:8080

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

### ❌ Error: "Cannot find module 'atomic-ui'"

```bash
npm run lib:unlink
npm run lib:link
cd mi-proyecto
npm link atomic-ui
```

### ❌ Los cambios no se reflejan

1. ✅ Verificar que `npm run watch` está corriendo
2. ✅ Limpiar caché del navegador (Ctrl+Shift+R)
3. ✅ Reiniciar `ng serve` en el proyecto consumidor

### ❌ Storybook no inicia

```bash
# Limpiar caché de Storybook
rm -rf node_modules/.cache/storybook
npm run storybook
```

### ❌ Error en dependencias

```bash
# Reinstalar todo limpio
rm -rf node_modules package-lock.json
npm install
```

---

## 🔗 Enlaces Útiles

- **Storybook Local**: http://localhost:6006
- **App Demo Local**: http://localhost:4200
- **Documentación Local**: http://localhost:8080
