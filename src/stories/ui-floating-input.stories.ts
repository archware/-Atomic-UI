import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { FloatingInputComponent } from '../app/shared/ui/atoms/floating-input/floating-input.component';

const meta: Meta<FloatingInputComponent> = {
  title: 'Atoms/FloatingInput',
  component: FloatingInputComponent,
  decorators: [
    moduleMetadata({
      imports: [FormsModule],
    }),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<FloatingInputComponent>;

export const Default: Story = {
  render: () => ({
    template: `<app-floating-input label="Email" type="email"></app-floating-input>`,
  }),
};

export const Password: Story = {
  render: () => ({
    template: `<app-floating-input label="Contraseña" type="password"></app-floating-input>`,
  }),
};

export const WithIcon: Story = {
  render: () => ({
    template: `<app-floating-input label="Buscar" type="text" icon="🔍"></app-floating-input>`,
  }),
};

export const Underline: Story = {
  render: () => ({
    template: `<app-floating-input label="Nombre completo" type="text" variant="underline"></app-floating-input>`,
  }),
};

export const Material: Story = {
  render: () => ({
    template: `<app-floating-input label="Teléfono" type="tel" variant="material"></app-floating-input>`,
  }),
};

export const DateInput: Story = {
  render: () => ({
    template: `<app-floating-input label="Fecha de nacimiento" type="date"></app-floating-input>`,
  }),
};

export const Disabled: Story = {
  render: () => ({
    template: `<app-floating-input label="Campo deshabilitado" type="text" [disabled]="true"></app-floating-input>`,
  }),
};

export const AllVariants: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 1.5rem; max-width: 400px;">
        <app-floating-input label="Floating (default)" type="text" variant="floating"></app-floating-input>
        <app-floating-input label="Underline" type="text" variant="underline"></app-floating-input>
        <app-floating-input label="Material" type="text" variant="material"></app-floating-input>
      </div>
    `,
  }),
};
