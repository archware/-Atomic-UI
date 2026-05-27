import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { InputComponent } from '../app/shared/ui/atoms/input/input.component';

const meta: Meta<InputComponent> = {
  title: '1. Atoms/Input',
  component: InputComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [InputComponent, FormsModule],
    }),
  ],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'date'],
      description: 'HTML input type',
    },
    label: { control: 'text', description: 'Label del campo' },
    placeholder: { control: 'text', description: 'Placeholder del input' },
    error: { control: 'text', description: 'Mensaje de error' },
    disabled: { control: 'boolean', description: 'Deshabilitar input' },
  },
};

export default meta;
type Story = StoryObj<InputComponent>;

export const Default: Story = {
  args: { label: 'Nombre completo', placeholder: 'Ingrese su nombre', type: 'text' },
  render: (args) => ({
    props: args,
    template: `<app-input [label]="label" [placeholder]="placeholder" [type]="type" [disabled]="disabled"></app-input>`,
  }),
};

export const WithError: Story = {
  args: { label: 'Email', placeholder: 'email@ejemplo.com', type: 'email', error: 'Este campo es requerido' },
  render: (args) => ({
    props: args,
    template: `<app-input [label]="label" [placeholder]="placeholder" [type]="type" [error]="error"></app-input>`,
  }),
};

export const Password: Story = {
  args: { label: 'Contraseña', placeholder: '••••••••', type: 'password' },
  render: (args) => ({
    props: args,
    template: `<app-input [label]="label" [placeholder]="placeholder" [type]="type"></app-input>`,
  }),
};

export const Disabled: Story = {
  args: { label: 'Campo deshabilitado', placeholder: 'No editable', type: 'text', disabled: true },
  render: (args) => ({
    props: args,
    template: `<app-input [label]="label" [placeholder]="placeholder" [type]="type" [disabled]="disabled"></app-input>`,
  }),
};

export const WithIcon: Story = {
  args: { label: 'Buscar', placeholder: 'Buscar...', type: 'text', iconClass: 'fa-solid fa-magnifying-glass' },
  render: (args) => ({
    props: args,
    template: `<app-input [label]="label" [placeholder]="placeholder" [iconClass]="iconClass"></app-input>`,
  }),
};

export const AllTypes: Story = {
  render: () => ({
    template: `
      <div style="display:flex; flex-direction:column; gap:1rem; max-width:400px;">
        <app-input label="Texto" placeholder="Texto libre" type="text"></app-input>
        <app-input label="Email" placeholder="correo@ejemplo.com" type="email"></app-input>
        <app-input label="Contraseña" placeholder="••••••••" type="password"></app-input>
        <app-input label="Número" placeholder="0" type="number"></app-input>
        <app-input label="Teléfono" placeholder="+52 55 1234 5678" type="tel"></app-input>
        <app-input label="Fecha" type="date"></app-input>
      </div>
    `,
  }),
};
