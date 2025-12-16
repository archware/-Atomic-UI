import type { Meta, StoryObj } from '@storybook/angular';
import { TableActionsComponent } from '../app/shared/ui/molecules/table-actions/table-actions.component';

const meta: Meta<TableActionsComponent> = {
  title: 'Molecules/TableActions',
  component: TableActionsComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Componente con botones de acción para tablas: ver, editar, eliminar.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<TableActionsComponent>;

export const Default: Story = {
  args: {},
};

export const InTableRow: Story = {
  render: () => ({
    template: `
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: var(--surface-section);">
            <th style="padding: 0.75rem; text-align: left; border-bottom: 1px solid var(--border-color);">Nombre</th>
            <th style="padding: 0.75rem; text-align: left; border-bottom: 1px solid var(--border-color);">Email</th>
            <th style="padding: 0.75rem; text-align: center; border-bottom: 1px solid var(--border-color);">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 0.75rem; border-bottom: 1px solid var(--border-color);">Juan Pérez</td>
            <td style="padding: 0.75rem; border-bottom: 1px solid var(--border-color);">juan@ejemplo.com</td>
            <td style="padding: 0.75rem; border-bottom: 1px solid var(--border-color); text-align: center;">
              <app-table-actions></app-table-actions>
            </td>
          </tr>
          <tr>
            <td style="padding: 0.75rem; border-bottom: 1px solid var(--border-color);">María García</td>
            <td style="padding: 0.75rem; border-bottom: 1px solid var(--border-color);">maria@ejemplo.com</td>
            <td style="padding: 0.75rem; border-bottom: 1px solid var(--border-color); text-align: center;">
              <app-table-actions></app-table-actions>
            </td>
          </tr>
        </tbody>
      </table>
    `,
  }),
};

export const Multiple: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; background: var(--surface-background); border: 1px solid var(--border-color); border-radius: 0.5rem;">
          <span>Registro 1</span>
          <app-table-actions></app-table-actions>
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; background: var(--surface-background); border: 1px solid var(--border-color); border-radius: 0.5rem;">
          <span>Registro 2</span>
          <app-table-actions></app-table-actions>
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; background: var(--surface-background); border: 1px solid var(--border-color); border-radius: 0.5rem;">
          <span>Registro 3</span>
          <app-table-actions></app-table-actions>
        </div>
      </div>
    `,
  }),
};
