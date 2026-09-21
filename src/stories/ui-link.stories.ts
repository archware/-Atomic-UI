import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { LinkComponent } from '../app/shared/ui/atoms/link/link.component';
import { action } from '@storybook/addon-actions';

const meta: Meta<LinkComponent> = {
  title: 'Atoms/Link',
  component: LinkComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [CommonModule, LinkComponent],
    }),
  ],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'muted', 'danger'],
      description: 'Variante semántica del enlace.',
    },
    disabled: {
      control: 'boolean',
      description: 'Estado de deshabilitado del enlace.',
    },
    href: {
      control: 'text',
      description: 'Destino del enlace.',
    },
    target: {
      control: 'select',
      options: ['_self', '_blank', '_parent', '_top'],
      description: 'Objetivo donde se abrirá el enlace.',
    },
    ariaLabel: {
      control: 'text',
      description: 'Etiqueta ARIA para accesibilidad.',
    },
  },
  args: {
    variant: 'primary',
    disabled: false,
    href: '#',
    target: '_self',
    ariaLabel: '',
  },
};

export default meta;
type Story = StoryObj<LinkComponent>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `
      <app-link
        [variant]="variant"
        [disabled]="disabled"
        [href]="href"
        [target]="target"
        [ariaLabel]="ariaLabel"
      >
        Enlace de prueba
      </app-link>
    `,
  }),
};

export const Variants: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; gap: 1rem; align-items: center; padding: 1rem; background: var(--surface-background);">
        <app-link variant="primary" href="#">Primary</app-link>
        <app-link variant="secondary" href="#">Secondary</app-link>
        <app-link variant="muted" href="#">Muted</app-link>
        <app-link variant="danger" href="#">Danger</app-link>
      </div>
    `,
  }),
};

export const Disabled: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; gap: 1rem; align-items: center; padding: 1rem; background: var(--surface-background);">
        <app-link variant="primary" href="#" [disabled]="true">Primary</app-link>
        <app-link variant="secondary" href="#" [disabled]="true">Secondary</app-link>
        <app-link variant="muted" href="#" [disabled]="true">Muted</app-link>
        <app-link variant="danger" href="#" [disabled]="true">Danger</app-link>
      </div>
    `,
  }),
};
