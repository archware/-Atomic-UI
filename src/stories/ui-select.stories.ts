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
    variant: {
      control: 'select',
      options: ['standard', 'floating', 'floating-value'],
      description: 'Modo de etiqueta: superior fija, flotante al enfocar o con valor, o flotante solo con valor',
    },
    placeholder: { control: 'text', description: 'Opción vacía inicial' },
    error: { control: 'text', description: 'Mensaje de error' },
    disabled: { control: 'boolean', description: 'Deshabilitar select' },
  },
};

export default meta;
type Story = StoryObj<SelectComponent>;

export const Default: Story = {
  args: { label: 'Estado', variant: 'standard', placeholder: 'Seleccione un estado', options: SAMPLE_OPTIONS },
  render: (args) => ({
    props: args,
    template: `<app-select [label]="label" [variant]="variant" [placeholder]="placeholder" [options]="options"></app-select>`,
  }),
};

export const LabelModes: Story = {
  render: () => ({
    props: { options: SAMPLE_OPTIONS },
    template: `
      <div style="display:flex; flex-direction:column; gap:1rem; max-width:360px;">
        <app-select label="Estado (standard)" variant="standard" placeholder="Seleccione un estado" [options]="options"></app-select>
        <app-select label="Estado (floating)" variant="floating" placeholder="Seleccione un estado" [options]="options"></app-select>
        <app-select label="Estado (floating-value)" variant="floating-value" placeholder="Seleccione un estado" [options]="options"></app-select>
      </div>
    `,
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
