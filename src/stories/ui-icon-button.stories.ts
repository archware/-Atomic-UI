import type { Meta, StoryObj } from '@storybook/angular';
import { IconButtonComponent } from '../app/shared/ui/atoms/icon-button/icon-button.component';

const meta: Meta<IconButtonComponent> = {
  title: '1. Atoms/IconButton',
  component: IconButtonComponent,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'ghost', 'avatar', 'close', 'close-soft', 'hanging-close'],
      description: 'Visual variant of the icon button',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size scale of the icon button',
    },
    animation: {
      control: 'select',
      options: ['none', 'grow', 'rotate', 'custom'],
      description: 'Hover animation behavior for the icon',
    },
    icon: {
      control: 'text',
      description: 'Font Awesome icon class or shorthand',
    },
    tooltip: {
      control: 'text',
      description: 'Tooltip / title attribute',
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible label for the button',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the icon button is disabled',
    },
  },
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

export const CloseSoft: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 1rem; align-items: center;">
        <app-icon-button variant="close-soft" size="sm" tooltip="Quitar (sm)" ariaLabel="Quitar compacto" />
        <app-icon-button variant="close-soft" size="md" tooltip="Quitar (md)" ariaLabel="Quitar estándar" />
        <app-icon-button variant="close-soft" size="lg" tooltip="Quitar (lg)" ariaLabel="Quitar grande" />
      </div>
    `,
  }),
};

export const AllVariants: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
          <app-icon-button variant="default" icon="fa-solid fa-gear" ariaLabel="Default" />
          <app-icon-button variant="ghost" icon="fa-solid fa-magnifying-glass-plus" ariaLabel="Ghost" />
          <app-icon-button variant="avatar" icon="fa-solid fa-user" ariaLabel="Avatar" />
          <app-icon-button variant="close" ariaLabel="Close neutro" />
          <app-icon-button variant="close-soft" ariaLabel="Close-soft peligro suave" />
          <div style="position: relative; display: inline-flex; padding: 0.75rem 1.25rem; border: 1px solid var(--border-color); border-radius: var(--radius-sm);">
            <span>Popup</span>
            <app-icon-button variant="hanging-close" ariaLabel="Hanging-close exterior" />
          </div>
          <app-icon-button [disabled]="true" icon="fa-solid fa-ban" ariaLabel="Disabled" />
        </div>
        <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
          <app-icon-button variant="default" size="sm" animation="none" icon="fa-solid fa-sliders" ariaLabel="Animación none (sm)" />
          <app-icon-button variant="default" size="md" animation="grow" icon="fa-solid fa-expand" ariaLabel="Animación grow (md)" />
          <app-icon-button variant="default" size="lg" animation="rotate" icon="fa-solid fa-arrows-rotate" ariaLabel="Animación rotate (lg)" />
        </div>
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
