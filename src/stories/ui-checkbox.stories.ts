import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { CheckboxComponent } from '../app/shared/ui/atoms/checkbox/checkbox.component';

const meta: Meta<CheckboxComponent> = {
  title: 'Atoms/Checkbox',
  component: CheckboxComponent,
  decorators: [
    moduleMetadata({
      imports: [FormsModule],
    }),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<CheckboxComponent>;

export const Default: Story = {
  render: () => ({
    template: `<app-checkbox label="Acepto los términos y condiciones"></app-checkbox>`,
  }),
};

export const Checked: Story = {
  render: () => ({
    template: `<app-checkbox label="Recordar mi sesión" [checked]="true"></app-checkbox>`,
  }),
};

export const Disabled: Story = {
  render: () => ({
    template: `<app-checkbox label="Opción no disponible" [disabled]="true"></app-checkbox>`,
  }),
};

export const DisabledChecked: Story = {
  render: () => ({
    template: `<app-checkbox label="Opción activa (solo lectura)" [checked]="true" [disabled]="true"></app-checkbox>`,
  }),
};

export const WithoutLabel: Story = {
  render: () => ({
    template: `<app-checkbox [checked]="false"></app-checkbox>`,
  }),
};

export const MultipleCheckboxes: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        <app-checkbox label="Opción 1" [checked]="true"></app-checkbox>
        <app-checkbox label="Opción 2" [checked]="false"></app-checkbox>
        <app-checkbox label="Opción 3" [checked]="true"></app-checkbox>
        <app-checkbox label="Opción 4 (deshabilitada)" [disabled]="true"></app-checkbox>
      </div>
    `,
  }),
};

export const InForm: Story = {
  render: () => ({
    template: `
      <div style="max-width: 400px; padding: 1.5rem; background: var(--surface-background); border: 1px solid var(--border-color); border-radius: 0.5rem;">
        <h3 style="margin-bottom: 1rem; font-weight: 600;">Preferencias</h3>
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          <app-checkbox label="Recibir notificaciones por email" [checked]="true"></app-checkbox>
          <app-checkbox label="Recibir notificaciones push"></app-checkbox>
          <app-checkbox label="Recibir newsletter mensual" [checked]="true"></app-checkbox>
          <app-checkbox label="Compartir datos con terceros"></app-checkbox>
        </div>
      </div>
    `,
  }),
};
