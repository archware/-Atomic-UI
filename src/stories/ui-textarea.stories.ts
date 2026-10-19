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
      options: ['standard', 'floating', 'floating-value', 'outline', 'material'],
      description: 'Modo de etiqueta: standard (superior), floating, floating-value',
    },
    label: { control: 'text' },
    placeholder: { control: 'text' },
    rows: { control: 'number', description: 'Número de filas visibles' },
    maxlength: { control: 'number', description: 'Máximo de caracteres' },
    showCounter: { control: 'boolean', description: 'Mostrar contador de caracteres' },
    disabled: { control: 'boolean' },
    error: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<TextareaComponent>;

export const Default: Story = {
  args: { label: 'Descripción', variant: 'standard', placeholder: 'Ingrese una descripción...', rows: 4 },
  render: (args) => ({
    props: args,
    template: `<app-textarea [label]="label" [variant]="variant" [placeholder]="placeholder" [rows]="rows"></app-textarea>`,
  }),
};

export const LabelModes: Story = {
  render: () => ({
    template: `
      <div style="display:flex; flex-direction:column; gap:1rem; max-width:420px;">
        <app-textarea label="Descripción (standard)" variant="standard" placeholder="Siempre visible" [rows]="3"></app-textarea>
        <app-textarea label="Descripción (floating)" variant="floating" placeholder="Aparece al enfocar" [rows]="3"></app-textarea>
        <app-textarea label="Descripción (floating-value)" variant="floating-value" placeholder="Aparece al escribir" [rows]="3"></app-textarea>
      </div>
    `,
  }),
};

export const WithCounter: Story = {
  args: { label: 'Comentario', placeholder: 'Máximo 200 caracteres...', maxlength: 200, showCounter: true, rows: 4 },
  render: (args) => ({
    props: args,
    template: `<app-textarea [label]="label" [placeholder]="placeholder" [maxlength]="maxlength" [showCounter]="showCounter" [rows]="rows"></app-textarea>`,
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
