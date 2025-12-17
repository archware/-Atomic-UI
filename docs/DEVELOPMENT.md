# 🛠️ Guía de Desarrollo con Hot-Reload

Esta guía explica cómo desarrollar y probar componentes de Atomic UI con cambios en caliente.

## 📋 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev:components` | Storybook para desarrollo de componentes |
| `npm run dev:full` | Storybook + Watch simultáneo |
| `npm run lib:link` | Crear enlace npm global |
| `npm run lib:unlink` | Eliminar enlace npm |
| `npm run docs` | Generar documentación con Compodoc |
| `npm run create:project` | Generar nuevo proyecto |

---

## 🔄 Flujo de Desarrollo con Hot-Reload

### Opción A: Storybook (Recomendado para componentes)

Ideal para desarrollar y probar componentes de forma aislada.

```bash
# Terminal 1 - Storybook
npm run dev:components

# Abre http://localhost:6006
# Los cambios se reflejan automáticamente
```

### Opción B: npm link (Para proyectos consumidores)

Ideal para probar componentes en un proyecto real.

#### Paso 1: Crear enlace global

```bash
# En Atomic-UI
cd F:\Front-dinamic\-Atomic-UI
npm run lib:link

# Verificar enlace
npm ls -g --depth=0 --link=true
```

#### Paso 2: Vincular en proyecto consumidor

```bash
# En tu proyecto
cd mi-proyecto
npm link atomic-ui
```

#### Paso 3: Desarrollo paralelo

```bash
# Terminal 1: Atomic-UI en modo watch
cd F:\Front-dinamic\-Atomic-UI
npm run watch

# Terminal 2: Tu proyecto
cd mi-proyecto
npm start
```

Ahora los cambios en Atomic-UI se reflejan automáticamente en tu proyecto.

---

## 🚀 Generar Nuevo Proyecto

### Uso básico

```bash
npm run create:project my-app
```

### Con plantilla específica

```bash
# Solo login
npm run create:project my-app -- --template=login

# Login + Dashboard
npm run create:project my-app -- --template=login+dashboard

# Todo incluido
npm run create:project my-app -- --template=full
```

### Opciones disponibles

| Opción | Descripción | Default |
|--------|-------------|---------|
| `--template=<name>` | Plantilla a usar | `login+dashboard` |
| `--output=<path>` | Directorio de salida | `../projects` |
| `--skip-install` | Omitir npm install | `false` |

### Plantillas disponibles

| Plantilla | Incluye |
|-----------|---------|
| `login` | Login, Register, Forgot Password |
| `dashboard` | Dashboard con Sidebar y Stats |
| `crud` | Tabla CRUD con paginación |
| `login+dashboard` | Login + Dashboard |
| `full` | Todas las anteriores |

---

## 📁 Estructura del Proyecto Generado

```
my-app/
├── src/
│   ├── app/
│   │   ├── pages/
│   │   │   ├── login-page/
│   │   │   └── dashboard-page/
│   │   └── shared/
│   │       └── ui/           # Componentes Atomic copiados
│   ├── styles/
│   │   └── themes/           # Tokens CSS copiados
│   ├── app.routes.ts         # Rutas pre-configuradas
│   └── styles.css            # Estilos globales
└── tsconfig.json             # Path aliases configurados
```

---

## 🔧 Configuración en Proyecto Generado

### 1. Configurar API URL

En cada componente de página, busca y modifica:

```typescript
// login-page.component.ts
private readonly API_BASE_URL = 'https://tu-api.com/v1';
```

### 2. Personalizar tema

Edita `src/styles/themes/_tokens-brand.css`:

```css
:root {
  --brand-primary-500: #tu-color-primario;
  --brand-secondary-500: #tu-color-secundario;
}
```

### 3. Agregar componentes

Importa desde el alias configurado:

```typescript
import { ButtonComponent, PanelComponent } from '@shared/ui';
```

---

## 🐛 Solución de Problemas

### Error: "Cannot find module 'atomic-ui'"

```bash
# Recrear enlace
cd F:\Front-dinamic\-Atomic-UI
npm run lib:unlink
npm run lib:link

# Volver a vincular
cd mi-proyecto
npm link atomic-ui
```

### Los cambios no se reflejan

1. Verificar que `npm run watch` está corriendo
2. Limpiar caché del navegador
3. Reiniciar `ng serve`

### Error de tipos en proyecto consumidor

Agregar en `tsconfig.json` del consumidor:

```json
{
  "compilerOptions": {
    "paths": {
      "@shared/ui": ["node_modules/atomic-ui/src/app/shared/ui"]
    }
  }
}
```

---

## 📊 Flujo de Trabajo Recomendado

```
┌─────────────────────────────────────────────────────────────┐
│                    DESARROLLO DE COMPONENTES                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Desarrollar en Storybook (npm run dev:components)       │
│     ↓                                                       │
│  2. Probar en proyecto real (npm link)                      │
│     ↓                                                       │
│  3. Corregir defectos → Los cambios se ven al instante      │
│     ↓                                                       │
│  4. Cuando esté estable → Generar proyecto final            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```
