import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { ButtonComponent } from '../app/shared/ui/atoms/button/button.component';

const meta: Meta<ButtonComponent> = {
  id: 'atoms-button',
  title: '1. Atoms/Button',
  component: ButtonComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [ButtonComponent],
    }),
  ],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'warning', 'danger', 'soft', 'outline', 'ghost', 'link'],
      description: 'Visual style variant of the button',
    },
    appearance: {
      control: 'select',
      options: ['flat', 'gradient'],
      description: 'Surface appearance for solid button variants (flat vs diagonal gradient with glow)',
    },
    tone: {
      control: 'select',
      options: ['neutral', 'primary', 'secondary', 'success', 'warning', 'danger', 'info'],
      description: 'Semantic tone for soft, outline, and ghost variants',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the button',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
    loading: {
      control: 'boolean',
      description: 'Expone progreso, deshabilita el control y evita activaciones repetidas',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Expande el host y el botón al ancho disponible',
    },
    type: {
      control: 'select',
      options: ['button', 'submit', 'reset'],
      description: 'HTML button type attribute',
    },
  },
};

export default meta;
type Story = StoryObj<ButtonComponent>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
  },
  render: (args) => ({
    props: args,
    template: `<app-button [variant]="variant" [size]="size" [disabled]="disabled" [loading]="loading">Primary Button</app-button>`,
  }),
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    size: 'md',
  },
  render: (args) => ({
    props: args,
    template: `<app-button [variant]="variant" [size]="size">Secondary Button</app-button>`,
  }),
};

export const Success: Story = {
  args: {
    variant: 'success',
    size: 'md',
  },
  render: (args) => ({
    props: args,
    template: `<app-button [variant]="variant" [size]="size">Success Button</app-button>`,
  }),
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    size: 'md',
  },
  render: (args) => ({
    props: args,
    template: `<app-button [variant]="variant" [size]="size">Warning Button</app-button>`,
  }),
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    size: 'md',
  },
  render: (args) => ({
    props: args,
    template: `<app-button [variant]="variant" [size]="size">Danger Button</app-button>`,
  }),
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    size: 'md',
  },
  render: (args) => ({
    props: args,
    template: `<app-button [variant]="variant" [size]="size">Outline Button</app-button>`,
  }),
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    size: 'md',
  },
  render: (args) => ({
    props: args,
    template: `<app-button [variant]="variant" [size]="size">Ghost Button</app-button>`,
  }),
};

export const Small: Story = {
  args: {
    variant: 'primary',
    size: 'sm',
  },
  render: (args) => ({
    props: args,
    template: `<app-button [variant]="variant" [size]="size">Small Button</app-button>`,
  }),
};

export const Large: Story = {
  args: {
    variant: 'primary',
    size: 'lg',
  },
  render: (args) => ({
    props: args,
    template: `<app-button [variant]="variant" [size]="size">Large Button</app-button>`,
  }),
};

export const Disabled: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    disabled: true,
  },
  render: (args) => ({
    props: args,
    template: `<app-button [variant]="variant" [size]="size" [disabled]="disabled">Disabled Button</app-button>`,
  }),
};

export const WithIcon: Story = {
  args: {
    variant: 'success',
    size: 'md',
    icon: '✓',
  },
  render: (args) => ({
    props: args,
    template: `<app-button [variant]="variant" [size]="size" [icon]="icon" iconPosition="left">With Icon</app-button>`,
  }),
};

export const AllVariants: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
        <app-button variant="primary">Primary</app-button>
        <app-button variant="secondary">Secondary</app-button>
        <app-button variant="success">Success</app-button>
        <app-button variant="warning">Warning</app-button>
        <app-button variant="danger">Danger</app-button>
        <app-button variant="outline">Outline</app-button>
        <app-button variant="ghost">Ghost</app-button>
      </div>
    `,
  }),
};

export const Loading: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    loading: true,
  },
  render: (args) => ({
    props: args,
    template: `<app-button [variant]="variant" [size]="size" [loading]="loading">Guardar cambios</app-button>`,
  }),
};

export const FullWidth: Story = {
  args: {
    variant: 'primary',
    fullWidth: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="width:min(100%, 24rem);">
        <app-button [variant]="variant" [fullWidth]="fullWidth">
          Continuar
        </app-button>
      </div>
    `,
  }),
};

export const GradientVariants: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center;">
          <app-button variant="primary" appearance="gradient" iconClass="fa-solid fa-layer-group">Unir PDFs</app-button>
          <app-button variant="secondary" appearance="gradient" iconClass="fa-solid fa-compress">Comprimir</app-button>
          <app-button variant="success" appearance="gradient" iconClass="fa-solid fa-check">Confirmar</app-button>
          <app-button variant="warning" appearance="gradient" iconClass="fa-solid fa-bolt">Optimizar</app-button>
          <app-button variant="danger" appearance="gradient" iconClass="fa-solid fa-scissors">Eliminar Páginas</app-button>
        </div>
      </div>
    `,
  }),
};

export const ContextualTones: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
          <app-button variant="soft" tone="neutral" size="sm">Soft Neutral</app-button>
          <app-button variant="soft" tone="primary" size="sm">Soft Primary</app-button>
          <app-button variant="soft" tone="secondary" size="sm">Soft Secondary</app-button>
          <app-button variant="soft" tone="success" size="sm">Soft Success</app-button>
          <app-button variant="soft" tone="warning" size="sm">Soft Warning</app-button>
          <app-button variant="soft" tone="danger" size="sm" iconClass="fa-solid fa-trash-can">Vaciar</app-button>
          <app-button variant="soft" tone="info" size="sm">Soft Info</app-button>
        </div>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
          <app-button variant="outline" tone="neutral" size="sm">Outline Neutral</app-button>
          <app-button variant="outline" tone="primary" size="sm">Outline Primary</app-button>
          <app-button variant="outline" tone="secondary" size="sm">Outline Secondary</app-button>
          <app-button variant="outline" tone="success" size="sm">Outline Success</app-button>
          <app-button variant="outline" tone="warning" size="sm">Outline Warning</app-button>
          <app-button variant="outline" tone="danger" size="sm">Outline Danger</app-button>
          <app-button variant="outline" tone="info" size="sm">Outline Info</app-button>
        </div>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
          <app-button variant="ghost" tone="neutral" size="sm">Ghost Neutral</app-button>
          <app-button variant="ghost" tone="primary" size="sm">Ghost Primary</app-button>
          <app-button variant="ghost" tone="secondary" size="sm">Ghost Secondary</app-button>
          <app-button variant="ghost" tone="success" size="sm">Ghost Success</app-button>
          <app-button variant="ghost" tone="warning" size="sm">Ghost Warning</app-button>
          <app-button variant="ghost" tone="danger" size="sm">Ghost Danger</app-button>
          <app-button variant="ghost" tone="info" size="sm">Ghost Info</app-button>
        </div>
      </div>
    `,
  }),
};
