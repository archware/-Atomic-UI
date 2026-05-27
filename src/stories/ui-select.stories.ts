import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { SelectComponent } from '../app/shared/ui/atoms/select/select.component';

const SAMPLE_OPTIONS = [
  { value: 'active', label: 'Activo' },
  { value: 'inactive', label: 'Inactivo' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'suspended', label: 'Suspendido' },
];

const meta: Meta<SelectComponent> = {
  title: '1. Atoms/Select',
  component: SelectComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [SelectComponent, FormsModule],
    }),
  ],
  argTypes: {
    label: { control: 'text', description: 'Label del select' },
    placeholder: { control: 'text', description: 'Opción vacía inicial' },
    error: { control: 'text', description: 'Mensaje de error' },
    disabled: { control: 'boolean', description: 'Deshabilitar select' },
  },
};

export default meta;
type Story = StoryObj<SelectComponent>;

export const Default: Story = {
  args: { label: 'Estado', placeholder: 'Seleccione un estado', options: SAMPLE_OPTIONS },
  render: (args) => ({
    props: args,
    template: `<app-select [label]="label" [placeholder]="placeholder" [options]="options"></app-select>`,
  }),
};

export const WithError: Story = {
  args: {
    label: 'Estado',
    placeholder: 'Seleccione',
    options: SAMPLE_OPTIONS,
    error: 'Debe seleccionar una opción',
  },
  render: (args) => ({
    props: args,
    template: `<app-select [label]="label" [placeholder]="placeholder" [options]="options" [error]="error"></app-select>`,
  }),
};

export const Disabled: Story = {
  args: { label: 'Estado', options: SAMPLE_OPTIONS, disabled: true },
  render: (args) => ({
    props: args,
    template: `<app-select [label]="label" [options]="options" [disabled]="disabled"></app-select>`,
  }),
};

export const WithManyOptions: Story = {
  args: {
    label: 'País',
    placeholder: 'Seleccione un país',
    options: [
      { value: 'mx', label: 'México' },
      { value: 'ar', label: 'Argentina' },
      { value: 'co', label: 'Colombia' },
      { value: 'pe', label: 'Perú' },
      { value: 'cl', label: 'Chile' },
      { value: 'br', label: 'Brasil' },
      { value: 'uy', label: 'Uruguay' },
      { value: 'py', label: 'Paraguay' },
    ],
  },
  render: (args) => ({
    props: args,
    template: `<app-select [label]="label" [placeholder]="placeholder" [options]="options"></app-select>`,
  }),
};
