# Especificación Técnica: ADMIN_GENERAL_FE

> **Objetivo**: Documento para que un agente pueda recrear el frontend usando Arquitectura Atómica

---

## 1. Información General

| Campo | Valor |
|-------|-------|
| **Nombre** | ADMIN_GENERAL_FE |
| **Framework** | Angular 17+ (Standalone) |
| **Propósito** | Panel de administración de aplicaciones, usuarios y roles |
| **id_app** | `2` |

---

## 2. Variables de Environment

```typescript
export const environment = {
  production: boolean;
  url_api: string;      // Backend API base URL
  url_login: string;    // Login redirect URL
  id_app: string;       // Application ID ("2")
};
```

---

## 3. Rutas del Aplicativo

| Ruta | Componente | Descripción | Guard |
|------|------------|-------------|-------|
| `/` | LoginFormComponent | Página de autenticación | ❌ |
| `/home` | DashboardComponent | Panel principal | ✅ authGuard |
| `/apps` | AplicativoComponent | CRUD de aplicaciones | ✅ authGuard |
| `/usuarios` | UsuarioComponent | CRUD de usuarios | ✅ authGuard |
| `/roles` | RolComponent | CRUD de roles | ✅ authGuard |

---

## 4. API Controllers y Endpoints

### 4.1 Authentication Controller

| Endpoint | HTTP | Auth | Request | Response |
|----------|------|------|---------|----------|
| `/Authentication/PostLogin` | POST | ❌ | `{ v_user, v_password, v_ip }` | `ResponseLogin` |
| `/Authentication/Get_user_profile` | GET | ✅ | `?I_ID_USER={id}` | `ResponseProfile` |
| `/Authentication/Get_time_server` | GET | ❌ | - | `{ value: timestamp }` |
| `/Authentication/Post_change_password` | POST | ✅ | `UpdateUser` | `UpdateUser` |
| `/Authentication/Post_refresh_token` | POST | ❌ | `{ v_ACCESS_TOKEN, v_REFRESH_TOKEN }` | `ResponseLogin` |

### 4.2 Application Controller

| Endpoint | HTTP | Auth | Request | Response |
|----------|------|------|---------|----------|
| `/Application/Get_grilla_aplicacion` | GET | ✅ | `?I_PAGE_NUMBER&I_PAGE_SIZE&V_FILTER_TYPE&V_FILTER_VALUE&I_SORT_BY_FIELD&V_SORT_ORDER` | `AppGrillaModel` |
| `/Application/Post_new_aplicacion` | POST | ✅ | `FormData: CreateApp` | - |
| `/Application/Put_update_aplicacion` | PUT | ✅ | `FormData: UpdateApp` | - |
| `/Application/Get_delete_aplicacion` | GET | ✅ | `?I_APLICATION_ID={id}` | - |
| `/Application/Get_aplicacion` | GET | ✅ | `?I_APLICATION_ID={id}` | `ResponseGetAplication` |
| `/Application/Get_listado_nivel_criticidad_app` | GET | ✅ | - | `ResponseGetLevelCriticalityApp` |
| `/Application/Get_lista_app` | GET | ✅ | `?V_ID_USER={id}` | `ResponseListaApp` |
| `/Application/Get_lista_app_menu` | GET | ✅ | - | `ResponseMenuApp` |
| `/Application/Get_menu_app` | GET | ✅ | `?I_APLICATION_ID={id}` | `ResponseMenuApp` |
| `/Application/Post_new_menu` | POST | ✅ | `Menu_app` | - |
| `/Application/Put_update_menu` | PUT | ✅ | `Menu_app` | - |
| `/Application/Get_listado_total_aplicacion` | GET | ✅ | - | `ResponseListadoSelect2` |
| `/Application/Get_listado_roles_app` | GET | ✅ | `?I_ID_APP={id}` | `ResponseListadoSelect2` |

### 4.3 Usuario Controller

| Endpoint | HTTP | Auth | Request | Response |
|----------|------|------|---------|----------|
| `/Usuario/Get_pagina_usuario` | GET | ✅ | `?I_PAGE_NUMBER&I_PAGE_SIZE&V_FILTER_TYPE&V_FILTER_VALUE&I_SORT_BY_FIELD&V_SORT_ORDER` | `UsuariosGrillaModel` |
| `/Usuario/Post_new_usuario` | POST | ✅ | `CreateUser` | - |
| `/Usuario/Put_update_usuario` | PUT | ✅ | `UpdateUser` | - |
| `/Usuario/Get_usuario` | GET | ✅ | `?I_USER_ID={id}` | `ResponseGetUser` |
| `/Usuario/Get_delete_usuario` | GET | ✅ | `?I_USER_ID={id}&I_REASON_TERMINATION={id}` | - |
| `/Usuario/Get_restart_password` | GET | ✅ | `?I_USER_ID={id}` | - |
| `/Usuario/Get_activate_usuario` | GET | ✅ | `?I_USER_ID={id}` | - |

### 4.4 RolUsuario Controller

| Endpoint | HTTP | Auth | Request | Response |
|----------|------|------|---------|----------|
| `/RolUsuario/Get_grilla_rol_usuario` | GET | ✅ | `?I_PAGE_NUMBER&I_PAGE_SIZE&V_FILTER_TYPE&V_FILTER_VALUE&I_SORT_BY_FIELD&V_SORT_ORDER` | `RolUsuarioGrillaModel` |
| `/RolUsuario/Get_listado_permiso` | GET | ✅ | - | `ResponseListadoSelect2` |
| `/RolUsuario/Post_new_rol_usuario` | POST | ✅ | `CreateRolUser` | - |
| `/RolUsuario/Put_update_rol_usuario` | PUT | ✅ | `UpdateRolUser` | - |
| `/RolUsuario/Get_rol_usuario` | GET | ✅ | `?I_ROLE_ID={id}` | `ResponseGetRolUser` |
| `/RolUsuario/Get_delete_rol_usuario` | GET | ✅ | `?I_ROLE_ID={id}` | - |

### 4.5 Otros Controllers

| Endpoint | HTTP | Auth | Response |
|----------|------|------|----------|
| `/Staff/Get_listado_total_persona` | GET | ✅ | `ResponseListadoSelect2` |
| `/MotivoTerminoContrato/Get_lista_total_motivos_termino` | GET | ✅ | `ResponseListTerminoContrato` |

---

## 5. Modelos de Datos

### 5.1 Respuesta API Genérica
```typescript
interface ApiResponse<T> {
  value: T;
  statusCode: number;
  hasSucceeded: boolean;
}
```

### 5.2 Paginación (Grillas)
```typescript
interface PaginatedValue<T> {
  total_paginas: number;
  total_registros: number;
  data: T[];
}
```

### 5.3 Application
```typescript
interface AppDatos {
  i_ID_APLICATION: number;
  v_APLICATION: string;
  v_ACRONYM: string;
  v_LEVEL_CRITICALITY: string;
  d_DATE_CREATE: Date;
  b_STATE: string;
}

interface CreateApp {
  v_APLICATION: string;
  v_ACRONYM: string;
  v_DESCRIPTION: string;
  i_LEVEL_CRITICAL: number;
  fILE_IMAGE: File;
  v_RUTA: string;
  v_URL: string;
}
```

### 5.4 Usuario
```typescript
interface UsuariosDatos {
  i_USER_ID: number;
  v_USER: string;
  v_NAMES: string;
  d_DATE_CREATE: string;
  b_STATE: string;
}

interface CreateUser {
  i_PERSON_ID: number | null;
  List_app_role: List_app_role[] | null;
}

interface List_app_role {
  i_APP_ID: number;
  i_ROLE_ID: number;
  d_START_DATE: string;
  d_ENDING_DATE: string;
  v_APP_NAME: string | null;
  v_ROLE_NAME: string | null;
}
```

### 5.5 Rol
```typescript
interface RolUsuarioDatos {
  i_ROLE_ID: number;
  v_ROLE: string;
  v_APLICATION: string;
  v_ACRONYM: string;
  d_DATE_CREATE: Date;
  b_STATE: string;
}

interface CreateRolUser {
  v_ROLE: string;
  v_DESCRIPTION: string;
  i_APLICATION_ID: number;
  v_List_menu_permission: List_menu[];
}

interface List_menu {
  i_MENU_ID: number;
  v_NAME_MENU: string;
  permiso: {
    b_ACTIVE_VIEW: number;
    b_ACTIVE_CREATE: number;
    b_ACTIVE_EDIT: number;
    b_ACTIVE_DELETE: number;
  };
  v_List_submenu: List_submenu[];
}
```

### 5.6 Menu y Permisos
```typescript
interface MenuApp {
  id_menu: number;
  nameMenu?: string;
  icon?: string;
  ruta: string;
  permiso: {
    create: number;
    read: number;
    update: number;
    delete: number;
  };
  sub_menu: SubMenu[];
}
```

### 5.7 Select2 (Dropdowns)
```typescript
interface ListadoSelect2 {
  label: string;
  value: number;
}
```

---

## 6. Autenticación

### 6.1 Flujo
1. POST `/Authentication/PostLogin` → recibe `access_Token`
2. Token se guarda en cookie: `setCookie(id_app, token)`
3. Todas las peticiones posteriores incluyen: `Authorization: Bearer {token}`

### 6.2 TokenService
- `saveToken(value)` → cookie `value-token`
- `saveTokenApp(value, idApp)` → cookie `{idApp}`
- `getTokenApp(idApp)` → obtiene token de app
- `removeTokenApp(idApp)` → logout

---

## 7. Componentes por Diseño Atómico

### 7.1 ÁTOMOS (Elementos básicos)
```
atoms/
├── button/           # Botones: primary, secondary, danger
├── input/            # Inputs: text, password, email, number
├── select/           # Select con opciones (ListadoSelect2)
├── icon/             # Iconos (Font Awesome o similar)
├── badge/            # Estado: activo/inactivo
├── spinner/          # Loading indicator
├── avatar/           # Imagen de usuario/app
└── checkbox/         # Checkbox para permisos
```

### 7.2 MOLÉCULAS (Combinaciones de átomos)
```
molecules/
├── form-field/       # Label + Input + Error
├── search-box/       # Input + Button buscar
├── pagination/       # Controles paginación
├── table-header/     # Header con ordenamiento
├── action-buttons/   # Grupo: Editar, Eliminar, Ver
├── permission-row/   # Checkbox CRUD para menú
└── app-role-row/     # App + Rol + Fechas
```

### 7.3 ORGANISMOS (Secciones completas)
```
organisms/
├── data-table/       # Tabla paginada con acciones
├── crud-form/        # Formulario crear/editar
├── sidebar-menu/     # Menú lateral dinámico
├── header-bar/       # Header con usuario y logout
├── permission-tree/  # Árbol de menús con permisos
├── app-card/         # Tarjeta de aplicación
└── modal/            # Modal genérico
```

### 7.4 TEMPLATES (Layouts)
```
templates/
├── auth-layout/      # Layout para login (sin menú)
├── admin-layout/     # Layout principal (sidebar + header + content)
└── modal-layout/     # Layout para modales
```

### 7.5 PÁGINAS
```
pages/
├── login/            # Autenticación
├── dashboard/        # Panel principal con apps
├── apps/             # CRUD aplicaciones
├── users/            # CRUD usuarios
└── roles/            # CRUD roles
```

---

## 8. Funcionalidades por Página

### 8.1 Login
- [ ] Form: usuario, contraseña
- [ ] Llamar `/Authentication/PostLogin`
- [ ] Guardar token
- [ ] Redirigir a `/home`

### 8.2 Dashboard
- [ ] Mostrar lista de apps del usuario
- [ ] Llamar `/Application/Get_lista_app`
- [ ] Cards de aplicaciones con imagen
- [ ] Click → cambiar de app o navegar

### 8.3 Aplicaciones
- [ ] Grilla paginada con filtros
- [ ] Crear: Form con imagen (FormData)
- [ ] Editar: Precargar datos
- [ ] Configurar menús anidados
- [ ] Eliminar con confirmación

### 8.4 Usuarios
- [ ] Grilla paginada
- [ ] Crear: Seleccionar persona → asignar apps+roles
- [ ] Editar: Modificar apps+roles
- [ ] Eliminar: Motivo de terminación
- [ ] Reiniciar contraseña
- [ ] Activar usuario

### 8.5 Roles
- [ ] Grilla paginada
- [ ] Crear: Nombre + App → configurar permisos por menú
- [ ] Árbol de menús con checkbox CRUD
- [ ] Editar: Precargar permisos
- [ ] Eliminar

---

## 9. Servicios a Implementar

```
services/
├── auth.service.ts       # login, logout, refresh
├── token.service.ts      # manejo de cookies JWT
├── app.service.ts        # CRUD aplicaciones
├── user.service.ts       # CRUD usuarios
├── role.service.ts       # CRUD roles
├── staff.service.ts      # listado personas
└── http-error.service.ts # manejo errores HTTP
```

---

## 10. Stack Tecnológico Recomendado

| Categoría | Tecnología |
|-----------|------------|
| Framework | Angular 17+ o React 18+ |
| Estilos | TailwindCSS o CSS Modules |
| Estado | Signals (Angular) o Zustand (React) |
| HTTP | HttpClient (Angular) o Axios (React) |
| Formularios | ReactiveFormsModule o React Hook Form |
| Tablas | Angular Material Table o TanStack Table |
| Cookies | typescript-cookie |
| JWT | @auth0/angular-jwt o jwt-decode |

---

## 11. Árbol de Carpetas Atómico

```
src/
├── components/
│   ├── atoms/
│   ├── molecules/
│   ├── organisms/
│   └── templates/
├── pages/
├── services/
├── models/
├── guards/
├── hooks/ (si React)
├── utils/
└── styles/
```
