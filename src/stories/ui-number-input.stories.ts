import type { Meta, StoryObj } from '@storybook/angular';
import { NumberInputComponent } from '../app/shared/ui/atoms/number-input/number-input.component';
import { FormsModule } from '@angular/forms';

const meta: Meta<NumberInputComponent> = {
  title: '1. Atoms/NumberInput',
  component: NumberInputComponent,
  tags: ['autodocs'],
  argTypes: {
    label:    { control: 'text' },
    min:      { control: 'number' },
    max:      { control: 'number' },
    step:     { control: 'number' },
    disabled: { control: 'boolean' },
    error:    { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<NumberInputComponent>;

export const Default: Story = {
  args: { label: 'Cantidad', min: 0, max: 100, step: 1 },
  decorators: [
    (story) => ({
      props: { value: 5 },
      moduleMetadata: { imports: [FormsModule] },
      template: `<app-number-input label="Cantidad" [min]="0" [max]="100" [step]="1" [(ngModel)]="value"></app-number-input><p style="margin-top:.5rem;font-size:.85rem;color:var(--text-color-secondary)">Valor: {{ value }}</p>`,
      imports: [NumberInputComponent, FormsModule],
    }),
  ],
};

export const ConLimites: Story = {
  decorators: [
    () => ({
      props: { value: 50 },
      template: `<app-number-input label="Porcentaje (0-100)" [min]="0" [max]="100" [step]="5" [(ngModel)]="value"></app-number-input>`,
      imports: [NumberInputComponent, FormsModule],
    }),
  ],
};

export const Deshabilitado: Story = {
  args: { label: 'Valor fijo', disabled: true },
};
