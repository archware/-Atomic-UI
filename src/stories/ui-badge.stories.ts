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
      options: ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral'],
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
        <app-badge [count]="1" variant="primary" [standalone]="true"></app-badge>
        <app-badge [count]="2" variant="secondary" [standalone]="true"></app-badge>
        <app-badge [count]="3" variant="success" [standalone]="true"></app-badge>
        <app-badge [count]="4" variant="warning" [standalone]="true"></app-badge>
        <app-badge [count]="5" variant="danger" [standalone]="true"></app-badge>
        <app-badge [count]="6" variant="info" [standalone]="true"></app-badge>
        <app-badge [count]="7" variant="neutral" [standalone]="true"></app-badge>
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
          <app-badge [count]="9" variant="danger" size="sm" [standalone]="true"></app-badge>
        </div>
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <span style="font-size:0.75rem; color:#888;">md:</span>
          <app-badge [count]="9" variant="danger" size="md" [standalone]="true"></app-badge>
        </div>
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <span style="font-size:0.75rem; color:#888;">lg:</span>
          <app-badge [count]="9" variant="danger" size="lg" [standalone]="true"></app-badge>
        </div>
      </div>
    `,
  }),
};
