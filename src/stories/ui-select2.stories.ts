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
  argTypes: {
    required: {
      control: 'boolean',
      description: 'Campo obligatorio: asterisco en la etiqueta y aria-required en el disparador',
    },
    variant: {
      control: 'select',
      options: ['standard', 'floating', 'floating-value'],
      description: 'Modo de etiqueta: superior fija, flotante al enfocar/abrir o con valor, o flotante solo con valor',
    },
  },
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
    variant: 'standard',
    placeholder: 'Seleccionar país...',
    searchable: true,
  },
};

export const LabelModes: Story = {
  render: () => ({
    props: { options: countryOptions },
    template: `
      <div style="display:flex; flex-direction:column; gap:1rem; max-width:360px;">
        <app-select2 label="País (standard)" variant="standard" placeholder="Seleccionar país..." [options]="options"></app-select2>
        <app-select2 label="País (floating)" variant="floating" placeholder="Seleccionar país..." [options]="options"></app-select2>
        <app-select2 label="País (floating-value)" variant="floating-value" placeholder="Seleccionar país..." [options]="options"></app-select2>
      </div>
    `,
  }),
};

export const Required: Story = {
  render: () => ({
    props: { options: countryOptions },
    template: `
      <div style="display:flex; flex-direction:column; gap:1rem; max-width:360px;">
        <app-select2 label="Pais (standard, requerido)" variant="standard" [required]="true" [options]="options"></app-select2>
        <app-select2 label="Pais (floating, requerido)" variant="floating" [required]="true" [options]="options"></app-select2>
        <app-select2 label="Pais (floating-value, requerido)" variant="floating-value" [required]="true" [options]="options"></app-select2>
      </div>
    `,
  }),
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
