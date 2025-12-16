import type { Meta, StoryObj } from '@storybook/angular';
import { IconButtonComponent } from '../app/shared/ui/atoms/icon-button/icon-button.component';

const meta: Meta<IconButtonComponent> = {
  title: 'Atoms/IconButton',
  component: IconButtonComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<IconButtonComponent>;

export const Default: Story = {
  render: () => ({
    template: `<app-icon-button ariaLabel="Configuración">⚙️</app-icon-button>`,
  }),
};

export const Ghost: Story = {
  render: () => ({
    template: `<app-icon-button variant="ghost" ariaLabel="Notificaciones">🔔</app-icon-button>`,
  }),
};

export const Disabled: Story = {
  render: () => ({
    template: `<app-icon-button [disabled]="true" ariaLabel="Deshabilitado">🚫</app-icon-button>`,
  }),
};

export const AllVariants: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 1rem; align-items: center;">
        <app-icon-button variant="default" ariaLabel="Default">⚙️</app-icon-button>
        <app-icon-button variant="ghost" ariaLabel="Ghost">🔔</app-icon-button>
        <app-icon-button [disabled]="true" ariaLabel="Disabled">🚫</app-icon-button>
      </div>
    `,
  }),
};

export const InNavbar: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 0.5rem; padding: 0.5rem; background: var(--surface-background); border: 1px solid var(--border-color); border-radius: 0.5rem;">
        <app-icon-button variant="ghost" ariaLabel="Buscar">🔍</app-icon-button>
        <app-icon-button variant="ghost" ariaLabel="Notificaciones">🔔</app-icon-button>
        <app-icon-button variant="ghost" ariaLabel="Usuario">👤</app-icon-button>
      </div>
    `,
  }),
};
