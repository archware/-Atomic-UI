# 📊 CRUD Table Blueprint

Tabla de datos completa con paginación, filtros, búsqueda y operaciones CRUD.

## ✨ Características

- ✅ Tabla de datos responsive
- ✅ Paginación con navegación
- ✅ Búsqueda con debounce
- ✅ Filtros múltiples (status, role)
- ✅ Selección múltiple
- ✅ Acciones en lote (bulk delete, export)
- ✅ Modal para crear/editar
- ✅ Confirmación de eliminación
- ✅ Estados de carga y error
- ✅ Soporte Dark Mode

## 📦 Componentes Usados

| Componente | Uso |
|------------|-----|
| `PanelComponent` | Contenedor principal |
| `FloatingInputComponent` | Campos del formulario |
| `Select2Component` | Filtros selectores |
| `PaginationComponent` | Navegación de páginas |
| `ModalComponent` | Diálogos modales |
| `ChipComponent` | Estados/badges |
| `ButtonComponent` | Acciones |
| `IconButtonComponent` | Botones de tabla |
| `LoaderComponent` | Estado de carga |
| `ApiService` + `useApi` | Integración API |

## 🚀 Instalación

### 1. Copiar archivos

```bash
cp -r src/blueprints/crud-table src/app/components/users-table
```

### 2. Renombrar según tu entidad

```bash
# Renombrar archivos
mv users-table.component.ts users-table.component.ts
```

Buscar y reemplazar en el código:
- `Entity` → `User` (o tu modelo)
- `ENDPOINT = '/users'` → tu endpoint
- `TABLE_TITLE = 'Usuarios'` → tu título
- `ENTITY_NAME = 'Usuario'` → nombre singular

### 3. Agregar al módulo/rutas

```typescript
// En tu componente padre o rutas
import { CrudTableComponent } from './components/users-table/crud-table.component';

// Usar en template
<app-crud-table></app-crud-table>
```

## 📡 Endpoints de API Esperados

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/users?page=1&perPage=10&search=...` | Listar con paginación y filtros |
| POST | `/users` | Crear nuevo |
| PUT | `/users/:id` | Actualizar |
| DELETE | `/users/:id` | Eliminar |

### Response esperada de GET

```json
{
  "data": [
    {
      "id": "1",
      "name": "Juan Pérez",
      "email": "juan@email.com",
      "status": "active",
      "role": "admin",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "perPage": 10,
    "totalPages": 15
  }
}
```

## 🎨 Personalización

### Cambiar columnas de la tabla

En el template HTML, modifica el `<thead>` y `<tbody>`:

```html
<!-- Agregar nueva columna -->
<th class="col-phone">Teléfono</th>

<!-- En tbody -->
<td class="col-phone">{{ item.phone }}</td>
```

### Columnas numéricas e importes

Una columna de cifras solo se compara de un vistazo si todos los dígitos ocupan
lo mismo. Marca la celda con la clase `numeric` —la que este blueprint declara
con `font-variant-numeric: tabular-nums`— y no la pongas en la fila entera: en
`Nombre` o `Email` las cifras tabulares no aportan y estropean el espaciado.

Cuando el contenido es un **importe**, alinéalo además al final con el `align`
que ya publica `app-table-cell`. Un número se compara por su última cifra, y
alineado a la derecha las unidades, las decenas y las centenas caen en la misma
columna; la cabecera se alinea igual que su columna, o el título deja de señalar
a lo que nombra.

```html
<th app-table-cell align="right">Importe</th>
...
<td app-table-cell [dataLabel]="'Importe:'" align="right" class="numeric">
  {{ item.amount }}
</td>
```

### Agregar más filtros

1. En el componente, agregar opciones:

```typescript
departmentOptions = [
  { value: '', label: 'Todos los departamentos' },
  { value: 'sales', label: 'Ventas' },
  { value: 'support', label: 'Soporte' }
];
```

2. En el template, agregar select:

```html
<app-select2
  [options]="departmentOptions"
  [value]="filters().department"
  placeholder="Departamento"
  (valueChange)="onDepartmentFilter($event)">
</app-select2>
```

3. Actualizar la interfaz `FilterOptions` y el método del filtro.

### Agregar más acciones por fila

```html
<app-icon-button 
  icon="fa-solid fa-eye"
  size="sm"
  title="Ver detalles"
  (clicked)="viewDetails(item)">
</app-icon-button>
```

### Cambiar diseño de status

Modifica el método `getStatusVariant()` para mapear tus estados a variantes de chip.

## 📱 Comportamiento Responsive

| Breakpoint | Comportamiento |
|------------|----------------|
| Desktop | Todas las columnas visibles |
| Mobile (≤768px) | Oculta email y fecha, stack vertical de filtros |

## 🔧 Funciones Útiles Incluidas

| Función | Descripción |
|---------|-------------|
| `loadData()` | Recargar datos con filtros actuales |
| `clearFilters()` | Limpiar todos los filtros |
| `toggleSelectAll()` | Seleccionar/deseleccionar todos |
| `openCreateModal()` | Abrir modal de creación |
| `openEditModal(item)` | Abrir modal de edición |
| `confirmDelete()` | Ejecutar eliminación |
| `bulkDelete()` | Eliminar seleccionados |
| `bulkExport()` | Exportar datos |
