import type { Meta, StoryObj } from '@storybook/angular';
import { DropdownComponent } from '../app/shared/ui/molecules/dropdown/dropdown.component';

const meta: Meta<DropdownComponent> = {
  title: '2. Molecules/Dropdown',
  component: DropdownComponent,
  tags: ['autodocs'],
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
    template: `<app-dropdown [options]="options" placeholder="Seleccionar..."></app-dropdown>`,
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
