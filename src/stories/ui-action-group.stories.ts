import type { Meta, StoryObj } from '@storybook/angular';
import { ActionGroupComponent, ActionItem } from '../app/shared/ui/molecules/action-group/action-group.component';
import { moduleMetadata } from '@storybook/angular';

const meta: Meta<ActionGroupComponent> = {
    title: 'Molecules/ActionGroup',
    component: ActionGroupComponent,
    decorators: [
        moduleMetadata({
            imports: [ActionGroupComponent],
        }),
    ],
    tags: ['autodocs'],
    argTypes: {
        maxVisible: {
            control: { type: 'number', min: 1, max: 10 },
            description: 'Número máximo de acciones visibles antes del overflow'
        },
        direction: {
            control: 'radio',
            options: ['vertical', 'horizontal'],
            description: 'Dirección del menú desplegable'
        },
        menuPosition: {
            control: 'select',
            options: ['auto', 'top', 'bottom', 'left', 'right'],
            description: 'Posición del menú (auto = calculado automáticamente)'
        },
        compact: {
            control: 'boolean',
            description: 'Modo compacto: oculta todas las acciones en el menú'
        }
    }
};

export default meta;
type Story = StoryObj<ActionGroupComponent>;

// Acciones de ejemplo
const basicActions: ActionItem[] = [
    { id: 'view', icon: 'fa-solid fa-eye', label: 'Ver', variant: 'secondary' },
    { id: 'edit', icon: 'fa-solid fa-pen', label: 'Editar', variant: 'primary' },
    { id: 'delete', icon: 'fa-solid fa-trash', label: 'Eliminar', variant: 'danger' }
];

const extendedActions: ActionItem[] = [
    { id: 'view', icon: 'fa-solid fa-eye', label: 'Ver detalles', variant: 'secondary' },
    { id: 'edit', icon: 'fa-solid fa-pen', label: 'Editar', variant: 'primary' },
    { id: 'delete', icon: 'fa-solid fa-trash', label: 'Eliminar', variant: 'danger' },
    { id: 'duplicate', icon: 'fa-solid fa-copy', label: 'Duplicar' },
    { id: 'export', icon: 'fa-solid fa-download', label: 'Exportar' },
    { id: 'archive', icon: 'fa-solid fa-box-archive', label: 'Archivar', variant: 'warning' }
];

/**
 * Básico: 3 acciones o menos se muestran directamente
 */
export const Basic: Story = {
    args: {
        actions: basicActions,
        maxVisible: 3
    }
};

/**
 * Con Overflow: más de 3 acciones, las extras aparecen en menú
 */
export const WithOverflow: Story = {
    args: {
        actions: extendedActions,
        maxVisible: 3,
        direction: 'vertical'
    }
};

/**
 * Menú Horizontal: acciones adicionales en layout horizontal
 */
export const HorizontalMenu: Story = {
    args: {
        actions: extendedActions,
        maxVisible: 2,
        direction: 'horizontal'
    }
};

/**
 * Modo Compacto: todas las acciones en un solo botón de menú
 */
export const Compact: Story = {
    args: {
        actions: extendedActions,
        compact: true,
        direction: 'vertical'
    }
};

/**
 * Solo 2 visibles: útil para espacios reducidos
 */
export const TwoVisible: Story = {
    args: {
        actions: extendedActions,
        maxVisible: 2,
        direction: 'vertical'
    }
};

/**
 * Con acciones deshabilitadas
 */
export const WithDisabled: Story = {
    args: {
        actions: [
            { id: 'view', icon: 'fa-solid fa-eye', label: 'Ver', variant: 'secondary' },
            { id: 'edit', icon: 'fa-solid fa-pen', label: 'Editar', variant: 'primary', disabled: true },
            { id: 'delete', icon: 'fa-solid fa-trash', label: 'Eliminar', variant: 'danger' },
            { id: 'duplicate', icon: 'fa-solid fa-copy', label: 'Duplicar', disabled: true }
        ],
        maxVisible: 3
    }
};

/**
 * En una tabla (ejemplo de uso real)
 */
export const InTable: Story = {
    render: () => ({
        template: `
      <table style="width: 100%; border-collapse: collapse; background: var(--surface-background); border-radius: 8px; overflow: hidden;">
        <thead style="background: var(--surface-section);">
          <tr>
            <th style="padding: 12px; text-align: left; font-weight: 600;">Nombre</th>
            <th style="padding: 12px; text-align: left; font-weight: 600;">Email</th>
            <th style="padding: 12px; text-align: left; font-weight: 600;">Estado</th>
            <th style="padding: 12px; text-align: right; font-weight: 600;">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid var(--border-color);">
            <td style="padding: 12px;">Juan Pérez</td>
            <td style="padding: 12px;">juan@email.com</td>
            <td style="padding: 12px;"><span style="color: var(--success-color);">Activo</span></td>
            <td style="padding: 12px; text-align: right;">
              <app-action-group
                [actions]="actions"
                [maxVisible]="3"
                direction="vertical">
              </app-action-group>
            </td>
          </tr>
          <tr style="border-bottom: 1px solid var(--border-color);">
            <td style="padding: 12px;">María García</td>
            <td style="padding: 12px;">maria@email.com</td>
            <td style="padding: 12px;"><span style="color: var(--warning-color);">Pendiente</span></td>
            <td style="padding: 12px; text-align: right;">
              <app-action-group
                [actions]="actions"
                [maxVisible]="3"
                direction="vertical">
              </app-action-group>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px;">Carlos López</td>
            <td style="padding: 12px;">carlos@email.com</td>
            <td style="padding: 12px;"><span style="color: var(--danger-color);">Inactivo</span></td>
            <td style="padding: 12px; text-align: right;">
              <app-action-group
                [actions]="actions"
                [maxVisible]="2"
                [compact]="true">
              </app-action-group>
            </td>
          </tr>
        </tbody>
      </table>
    `,
        props: {
            actions: extendedActions
        }
    })
};
