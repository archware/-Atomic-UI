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

## 🐛 Solución de Problemas

### Error: "Cannot find module 'atomic-ui'"

```bash
npm run lib:unlink
npm run lib:link
cd mi-proyecto
npm link atomic-ui
```

### Los cambios no se reflejan

1. Verificar que `npm run watch` está corriendo
2. Limpiar caché del navegador
3. Reiniciar `ng serve`
