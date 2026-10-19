import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { DatepickerComponent } from '../app/shared/ui/molecules/datepicker/datepicker.component';

const meta: Meta<DatepickerComponent> = {
  title: '2. Molecules/Datepicker',
  component: DatepickerComponent,
  decorators: [
    moduleMetadata({
      imports: [FormsModule],
    }),
  ],
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['standard', 'floating', 'floating-value', 'outline', 'material', 'underline'],
      description: 'Modo de etiqueta: standard (superior), floating o floating-value',
    },
  },
};

export default meta;
type Story = StoryObj<DatepickerComponent>;

export const Default: Story = {
  render: () => ({
    template: `<app-datepicker label="Fecha"></app-datepicker>`,
  }),
};

export const LabelModes: Story = {
  render: () => ({
    template: `
      <div style="max-width: 320px; display: flex; flex-direction: column; gap: 1rem;">
        <app-datepicker label="Fecha (standard)" variant="standard"></app-datepicker>
        <app-datepicker label="Fecha (floating)" variant="floating"></app-datepicker>
        <app-datepicker label="Fecha (floating-value)" variant="floating-value"></app-datepicker>
      </div>
    `,
  }),
};

export const WithLabel: Story = {
  render: () => ({
    template: `<app-datepicker label="Fecha de nacimiento"></app-datepicker>`,
  }),
};

export const Disabled: Story = {
  render: () => ({
    template: `<app-datepicker label="Fecha bloqueada" [disabled]="true"></app-datepicker>`,
  }),
};

export const InForm: Story = {
  render: () => ({
    template: `
      <div style="max-width: 300px; display: flex; flex-direction: column; gap: 1rem;">
        <app-datepicker label="Fecha de inicio"></app-datepicker>
        <app-datepicker label="Fecha de fin"></app-datepicker>
      </div>
    `,
  }),
};
