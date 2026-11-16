import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { BadgeComponent } from '../app/shared/ui/atoms/badge/badge.component';

const meta: Meta<BadgeComponent> = {
  title: '1. Atoms/Badge',
  component: BadgeComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [BadgeComponent],
    }),
  ],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'success', 'warning', 'danger', 'info', 'outline', 'neutral'],
      description: 'Color del badge',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Tamaño del badge',
    },
    position: {
      control: 'select',
      options: ['top-right', 'top-left', 'bottom-right', 'bottom-left'],
      description: 'Posición cuando se usa como overlay (standalone=false)',
    },
    count: { control: 'number', description: 'Número a mostrar (null = solo punto)' },
    max: { control: 'number', description: 'Máximo antes de mostrar N+' },
    dot: { control: 'boolean', description: 'Mostrar solo punto sin número' },
    overlay: { control: 'boolean', description: 'Modo overlay sobre contenido' },
    visible: { control: 'boolean', description: 'Mostrar u ocultar el badge' },
  },
};

export default meta;
type Story = StoryObj<BadgeComponent>;

export const Standalone: Story = {
  args: { count: 5, variant: 'primary', size: 'md', overlay: false },
  render: (args) => ({
    props: args,
    template: `<app-badge [count]="count" [variant]="variant" [size]="size" [overlay]="overlay"></app-badge>`,
  }),
};

export const Overlay: Story = {
  args: { count: 12, variant: 'danger', position: 'top-right', overlay: true },
  render: (args) => ({
    props: args,
    template: `
      <app-badge [count]="count" [variant]="variant" [position]="position" [overlay]="overlay">
        <button style="padding:0.5rem 1rem; background:#e5e7eb; border:none; border-radius:6px; cursor:pointer; font-size:1rem;">
          🔔 Notificaciones
        </button>
      </app-badge>
    `,
  }),
};

export const DotIndicator: Story = {
  args: { dot: true, variant: 'success', position: 'top-right', overlay: true },
  render: (args) => ({
    props: args,
    template: `
      <app-badge [dot]="dot" [variant]="variant" [position]="position" [overlay]="overlay">
        <span style="display:inline-block; width:32px; height:32px; background:#e5e7eb; border-radius:50%; line-height:32px; text-align:center;">👤</span>
      </app-badge>
    `,
  }),
};

export const MaxCount: Story = {
  args: { count: 150, max: 99, variant: 'danger', size: 'md', overlay: false },
  render: (args) => ({
    props: args,
    template: `<app-badge [count]="count" [max]="max" [variant]="variant" [size]="size" [overlay]="overlay"></app-badge>`,
  }),
};

export const AllVariants: Story = {
  render: () => ({
    template: `
      <div style="display:flex; flex-wrap:wrap; gap:0.75rem; padding:1rem; align-items:center;">
        <app-badge variant="default">Default</app-badge>
        <app-badge variant="primary">Primary</app-badge>
        <app-badge variant="secondary">Secondary</app-badge>
        <app-badge variant="success">Success</app-badge>
        <app-badge variant="warning">Warning</app-badge>
        <app-badge variant="danger">Danger</app-badge>
        <app-badge variant="info">Info</app-badge>
        <app-badge variant="outline">Outline</app-badge>
      </div>
    `,
  }),
};

export const AllSizes: Story = {
  render: () => ({
    template: `
      <div style="display:flex; flex-wrap:wrap; gap:1rem; padding:1rem; align-items:center;">
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <span style="font-size:0.75rem; color:#888;">sm:</span>
          <app-badge [count]="9" variant="danger" size="sm"></app-badge>
        </div>
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <span style="font-size:0.75rem; color:#888;">md:</span>
          <app-badge [count]="9" variant="danger" size="md"></app-badge>
        </div>
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <span style="font-size:0.75rem; color:#888;">lg:</span>
          <app-badge [count]="9" variant="danger" size="lg"></app-badge>
        </div>
      </div>
    `,
  }),
};
