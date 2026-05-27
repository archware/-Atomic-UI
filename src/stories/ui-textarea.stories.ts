import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { TextareaComponent } from '../app/shared/ui/atoms/textarea/textarea.component';

const meta: Meta<TextareaComponent> = {
  title: '1. Atoms/Textarea',
  component: TextareaComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [TextareaComponent, FormsModule],
    }),
  ],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outline', 'filled'],
      description: 'Visual variant',
    },
    label: { control: 'text' },
    placeholder: { control: 'text' },
    rows: { control: 'number', description: 'Número de filas visibles' },
    maxLength: { control: 'number', description: 'Máximo de caracteres' },
    showCounter: { control: 'boolean', description: 'Mostrar contador de caracteres' },
    resizable: { control: 'boolean', description: 'Permitir redimensionar' },
    disabled: { control: 'boolean' },
    error: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<TextareaComponent>;

export const Default: Story = {
  args: { label: 'Descripción', placeholder: 'Ingrese una descripción...', rows: 4 },
  render: (args) => ({
    props: args,
    template: `<app-textarea [label]="label" [placeholder]="placeholder" [rows]="rows"></app-textarea>`,
  }),
};

export const WithCounter: Story = {
  args: { label: 'Comentario', placeholder: 'Máximo 200 caracteres...', maxLength: 200, showCounter: true, rows: 4 },
  render: (args) => ({
    props: args,
    template: `<app-textarea [label]="label" [placeholder]="placeholder" [maxLength]="maxLength" [showCounter]="showCounter" [rows]="rows"></app-textarea>`,
  }),
};

export const Outline: Story = {
  args: { label: 'Notas', placeholder: 'Escriba sus notas aquí', variant: 'outline', rows: 5 },
  render: (args) => ({
    props: args,
    template: `<app-textarea [label]="label" [placeholder]="placeholder" [variant]="variant" [rows]="rows"></app-textarea>`,
  }),
};

export const WithError: Story = {
  args: { label: 'Descripción', placeholder: 'Requerida', error: 'La descripción es obligatoria', rows: 3 },
  render: (args) => ({
    props: args,
    template: `<app-textarea [label]="label" [placeholder]="placeholder" [error]="error" [rows]="rows"></app-textarea>`,
  }),
};

export const Disabled: Story = {
  args: { label: 'Comentario (sólo lectura)', placeholder: 'No editable', disabled: true, rows: 3 },
  render: (args) => ({
    props: args,
    template: `<app-textarea [label]="label" [placeholder]="placeholder" [disabled]="disabled" [rows]="rows"></app-textarea>`,
  }),
};
