import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormRowComponent } from '../app/shared/ui/atoms/form-row/form-row.component';
import { InputComponent } from '../app/shared/ui/atoms/input/input.component';
import { FloatingInputComponent } from '../app/shared/ui/atoms/floating-input/floating-input.component';

const meta: Meta<FormRowComponent> = {
  title: '1. Atoms/FormRow',
  component: FormRowComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: '**@deprecated** — Use `app-row` instead. Este componente existe para compatibilidad con proyectos existentes.',
      },
    },
  },
  decorators: [
    moduleMetadata({
      imports: [FormRowComponent, InputComponent, FloatingInputComponent],
    }),
  ],
  argTypes: {
    columns: { control: 'text', description: 'grid-template-columns CSS value' },
    gap: { control: 'text', description: 'CSS gap' },
  },
};

export default meta;
type Story = StoryObj<FormRowComponent>;

export const TwoColumns: Story = {
  args: { columns: '1fr 1fr', gap: '1rem' },
  render: (args) => ({
    props: args,
    template: `
      <app-form-row [columns]="columns" [gap]="gap">
        <app-input label="Nombre" placeholder="Nombre"></app-input>
        <app-input label="Apellido" placeholder="Apellido"></app-input>
      </app-form-row>
    `,
  }),
};

export const ThreeColumns: Story = {
  args: { columns: '1fr 1fr 1fr', gap: '1rem' },
  render: (args) => ({
    props: args,
    template: `
      <app-form-row [columns]="columns" [gap]="gap">
        <app-floating-input label="Nombre" variant="outline"></app-floating-input>
        <app-floating-input label="Email" variant="outline"></app-floating-input>
        <app-floating-input label="Teléfono" variant="outline"></app-floating-input>
      </app-form-row>
    `,
  }),
};

export const AsymmetricColumns: Story = {
  args: { columns: '2fr 1fr', gap: '1rem' },
  render: (args) => ({
    props: args,
    template: `
      <app-form-row [columns]="columns" [gap]="gap">
        <app-input label="Dirección" placeholder="Calle y número"></app-input>
        <app-input label="Código postal" placeholder="00000"></app-input>
      </app-form-row>
    `,
  }),
};
