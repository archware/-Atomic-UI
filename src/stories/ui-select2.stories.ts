import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { Select2Component } from '../app/shared/ui/molecules/select2/select2.component';

const meta: Meta<Select2Component> = {
  id: 'molecules-select2',
  title: '2. Molecules/Select2',
  component: Select2Component,
  decorators: [
    moduleMetadata({
      imports: [FormsModule],
    }),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<Select2Component>;

const countryOptions = [
  { value: 'pe', label: 'Perú', icon: '🇵🇪' },
  { value: 'mx', label: 'México', icon: '🇲🇽' },
  { value: 'ar', label: 'Argentina', icon: '🇦🇷' },
  { value: 'co', label: 'Colombia', icon: '🇨🇴' },
  { value: 'cl', label: 'Chile', icon: '🇨🇱' },
  { value: 'ec', label: 'Ecuador', icon: '🇪🇨' },
];

const statusOptions = [
  { value: 'active', label: 'Activo' },
  { value: 'inactive', label: 'Inactivo' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'blocked', label: 'Bloqueado', disabled: true },
];

export const Default: Story = {
  args: {
    options: countryOptions,
    label: 'País',
    placeholder: 'Seleccionar país...',
    searchable: true,
  },
};

export const WithoutLabel: Story = {
  args: {
    options: statusOptions,
    placeholder: 'Seleccionar estado...',
    searchable: false,
  },
};

export const Multiple: Story = {
  render: () => ({
    props: {
      options: countryOptions,
      selectedCountries: ['pe', 'co'],
    },
    template: `
      <app-select2
        label="Países"
        placeholder="Seleccionar países..."
        [options]="options"
        [multiple]="true"
        [searchable]="true"
        [(ngModel)]="selectedCountries">
      </app-select2>
    `,
  }),
};

export const NotSearchable: Story = {
  args: {
    options: statusOptions,
    label: 'Estado',
    searchable: false,
  },
};

export const Disabled: Story = {
  render: () => ({
    props: {
      options: countryOptions,
      selectedCountry: 'pe',
    },
    template: `
      <app-select2
        label="País"
        [options]="options"
        [disabled]="true"
        [(ngModel)]="selectedCountry">
      </app-select2>
    `,
  }),
};

export const WithDisabledOption: Story = {
  args: {
    options: statusOptions,
    label: 'Estado',
    placeholder: 'Seleccionar...',
  },
};

export const CustomWidth: Story = {
  args: {
    options: countryOptions,
    label: 'País',
    width: '300px',
    searchable: true,
  },
};

export const AccessibleWithoutVisibleLabel: Story = {
  args: {
    options: statusOptions,
    ariaLabel: 'Estado de la solicitud',
    placeholder: 'Seleccionar estado...',
  },
};
