import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { ToggleComponent } from '../app/shared/ui/atoms/toggle/toggle.component';

const meta: Meta<ToggleComponent> = {
  title: 'Atoms/Toggle',
  component: ToggleComponent,
  decorators: [
    moduleMetadata({
      imports: [FormsModule],
    }),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<ToggleComponent>;

export const Default: Story = {
  render: () => ({
    template: `<app-toggle label="Activar notificaciones" [checked]="false"></app-toggle>`,
  }),
};

export const Checked: Story = {
  render: () => ({
    template: `<app-toggle label="Modo oscuro" [checked]="true"></app-toggle>`,
  }),
};

export const Disabled: Story = {
  render: () => ({
    template: `<app-toggle label="Opción deshabilitada" [checked]="false" [disabled]="true"></app-toggle>`,
  }),
};

export const DisabledChecked: Story = {
  render: () => ({
    template: `<app-toggle label="Opción activa deshabilitada" [checked]="true" [disabled]="true"></app-toggle>`,
  }),
};

export const Small: Story = {
  render: () => ({
    template: `<app-toggle label="Toggle pequeño" [checked]="true" size="sm"></app-toggle>`,
  }),
};

export const Large: Story = {
  render: () => ({
    template: `<app-toggle label="Toggle grande" [checked]="true" size="lg"></app-toggle>`,
  }),
};

export const WithoutLabel: Story = {
  render: () => ({
    template: `<app-toggle [checked]="false"></app-toggle>`,
  }),
};
