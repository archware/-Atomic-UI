import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { RadioComponent } from '../app/shared/ui/atoms/radio/radio.component';

const OPTIONS = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Teléfono' },
  { value: 'sms', label: 'SMS' },
];

const meta: Meta<RadioComponent> = {
  title: '1. Atoms/Radio',
  component: RadioComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [RadioComponent, FormsModule],
    }),
  ],
  argTypes: {
    direction: {
      control: 'select',
      options: ['vertical', 'horizontal'],
      description: 'Dirección del grupo',
    },
    label: { control: 'text', description: 'Etiqueta del grupo' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<RadioComponent>;

export const Vertical: Story = {
  args: { label: 'Método de contacto', options: OPTIONS, direction: 'vertical' },
  render: (args) => ({
    props: { ...args, selected: 'email' },
    template: `<app-radio [label]="label" [options]="options" [direction]="direction" [(ngModel)]="selected"></app-radio>`,
  }),
};

export const Horizontal: Story = {
  args: { label: 'Tamaño', options: [{ value: 'sm', label: 'Pequeño' }, { value: 'md', label: 'Mediano' }, { value: 'lg', label: 'Grande' }], direction: 'horizontal' },
  render: (args) => ({
    props: { ...args, selected: 'md' },
    template: `<app-radio [label]="label" [options]="options" [direction]="direction" [(ngModel)]="selected"></app-radio>`,
  }),
};

export const WithDisabledOption: Story = {
  args: {
    label: 'Plan',
    options: [
      { value: 'free', label: 'Gratuito' },
      { value: 'pro', label: 'Pro' },
      { value: 'enterprise', label: 'Enterprise (no disponible)', disabled: true },
    ],
    direction: 'vertical',
  },
  render: (args) => ({
    props: { ...args, selected: 'free' },
    template: `<app-radio [label]="label" [options]="options" [direction]="direction" [(ngModel)]="selected"></app-radio>`,
  }),
};

export const GroupDisabled: Story = {
  args: { label: 'Método de contacto', options: OPTIONS, direction: 'vertical', disabled: true },
  render: (args) => ({
    props: { ...args, selected: 'email' },
    template: `<app-radio [label]="label" [options]="options" [disabled]="disabled" [(ngModel)]="selected"></app-radio>`,
  }),
};
