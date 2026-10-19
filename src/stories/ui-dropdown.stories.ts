import type { Meta, StoryObj } from '@storybook/angular';
import { DropdownComponent } from '../app/shared/ui/molecules/dropdown/dropdown.component';

const meta: Meta<DropdownComponent> = {
  title: '2. Molecules/Dropdown',
  component: DropdownComponent,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    variant: { control: 'select', options: ['standard', 'floating', 'floating-value'] },
  },
};

export default meta;
type Story = StoryObj<DropdownComponent>;

export const Default: Story = {
  render: () => ({
    props: {
      options: [
        { value: '1', label: 'Opción 1' },
        { value: '2', label: 'Opción 2' },
        { value: '3', label: 'Opción 3' },
      ],
    },
    template: `<app-dropdown label="Opción" [options]="options" placeholder="Seleccionar..."></app-dropdown>`,
  }),
};

export const LabelModes: Story = {
  render: () => ({
    props: {
      options: [
        { value: 'pe', label: 'Perú' },
        { value: 'mx', label: 'México' },
        { value: 'co', label: 'Colombia' },
      ],
    },
    template: `
      <div style="display:flex; flex-direction:column; gap:1rem; max-width:320px;">
        <app-dropdown label="País (standard)" variant="standard" [options]="options" placeholder="Seleccionar..."></app-dropdown>
        <app-dropdown label="País (floating)" variant="floating" [options]="options" placeholder="Seleccionar..."></app-dropdown>
        <app-dropdown label="País (floating-value)" variant="floating-value" [options]="options" placeholder="Seleccionar..."></app-dropdown>
      </div>
    `,
  }),
};

export const Countries: Story = {
  render: () => ({
    props: {
      options: [
        { value: 'pe', label: 'Perú' },
        { value: 'mx', label: 'México' },
        { value: 'ar', label: 'Argentina' },
        { value: 'co', label: 'Colombia' },
      ],
    },
    template: `<app-dropdown [options]="options" placeholder="Seleccionar país..."></app-dropdown>`,
  }),
};

export const Status: Story = {
  render: () => ({
    props: {
      options: [
        { value: 'active', label: 'Activo' },
        { value: 'inactive', label: 'Inactivo' },
        { value: 'pending', label: 'Pendiente' },
      ],
    },
    template: `<app-dropdown [options]="options" placeholder="Seleccionar estado..."></app-dropdown>`,
  }),
};

export const Disabled: Story = {
  render: () => ({
    props: {
      options: [
        { value: '1', label: 'Opción 1' },
        { value: '2', label: 'Opción 2' },
      ],
    },
    template: `<app-dropdown [options]="options" [disabled]="true" placeholder="Deshabilitado"></app-dropdown>`,
  }),
};
