import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CrudTableComponent } from '../blueprints/crud-table/crud-table.component';

const meta: Meta<CrudTableComponent> = {
  title: '5. Blueprints/CRUD Table',
  component: CrudTableComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [
        provideHttpClient(),
        provideRouter([]),
        importProvidersFrom(BrowserAnimationsModule)
      ],
    }),
  ],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
## CRUD Table Blueprint

Tabla de datos completa con operaciones CRUD:
- **Listado**: Tabla paginada con datos
- **Búsqueda**: Filtro por texto
- **Filtros**: Por estado y rol
- **Crear/Editar**: Modal con formulario
- **Eliminar**: Confirmación de eliminación
- **Bulk Actions**: Acciones masivas

### Uso
\`\`\`bash
# Copiar a tu proyecto
cp -r src/blueprints/crud-table src/app/pages/
\`\`\`

### Configuración
1. Renombra \`Entity\` a tu modelo (User, Product, etc.)
2. Actualiza \`ENDPOINT\` con tu API
3. Ajusta las columnas de la tabla
4. Personaliza los filtros
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<CrudTableComponent>;

export const Default: Story = {
  name: 'CRUD Table',
  render: () => ({
    template: `
      <div style="padding: 2rem; background: var(--surface-background); min-height: 100vh;">
        <app-crud-table></app-crud-table>
      </div>
    `,
  }),
};

export const DarkMode: Story = {
  name: 'CRUD Table (Dark Mode)',
  render: () => ({
    template: `
      <div style="padding: 2rem; min-height: 100vh;" class="dark-theme" data-theme="dark">
        <app-crud-table></app-crud-table>
      </div>
    `,
  }),
};
