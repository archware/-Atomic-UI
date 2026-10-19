import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { ComboboxComponent } from '../app/shared/ui/molecules/combobox/combobox.component';

const meta: Meta<ComboboxComponent> = {
  id: 'molecules-combobox',
  title: '2. Molecules/Combobox',
  component: ComboboxComponent,
  decorators: [
    moduleMetadata({ imports: [FormsModule] }),
  ],
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    variant: {
      control: 'select',
      options: ['standard', 'floating', 'floating-value'],
      description: 'Modo de etiqueta: superior fija, flotante al enfocar o con valor, o flotante solo con valor',
    },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    clearable: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<ComboboxComponent>;

const FRUITS = [
  { value: 'apple', label: 'Manzana' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cereza' },
  { value: 'grape', label: 'Uva' },
  { value: 'kiwi', label: 'Kiwi' },
  { value: 'mango', label: 'Mango' },
  { value: 'orange', label: 'Naranja' },
  { value: 'peach', label: 'Durazno' },
  { value: 'pear', label: 'Pera' },
  { value: 'strawberry', label: 'Frutilla' },
];

export const Default: Story = {
  args: {
    label: 'Selecciona una fruta',
    variant: 'standard',
    placeholder: 'Escribe para buscar...',
    options: FRUITS,
    clearable: true,
  },
};

export const LabelModes: Story = {
  render: () => ({
    props: { options: FRUITS },
    template: `
      <div style="display:flex; flex-direction:column; gap:1rem; max-width:360px;">
        <app-combobox label="Fruta (standard)" variant="standard" placeholder="Buscar fruta..." [options]="options"></app-combobox>
        <app-combobox label="Fruta (floating)" variant="floating" placeholder="Buscar fruta..." [options]="options"></app-combobox>
        <app-combobox label="Fruta (floating-value)" variant="floating-value" placeholder="Buscar fruta..." [options]="options"></app-combobox>
      </div>
    `,
  }),
};

export const WithGroupedOptions: Story = {
  args: {
    label: 'Categoría de producto',
    placeholder: 'Buscar categoría...',
    options: [
      { value: 'electronics', label: 'Electrónica', group: 'Tecnología' },
      { value: 'phones', label: 'Teléfonos', group: 'Tecnología' },
      { value: 'laptops', label: 'Laptops', group: 'Tecnología' },
      { value: 'shirts', label: 'Camisas', group: 'Ropa' },
      { value: 'shoes', label: 'Zapatos', group: 'Ropa' },
      { value: 'books', label: 'Libros', group: 'Educación' },
    ],
    clearable: true,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Campo deshabilitado',
    options: FRUITS,
    disabled: true,
    value: 'apple',
  },
};

export const WithError: Story = {
  args: {
    label: 'País',
    placeholder: 'Buscar país...',
    options: [
      { value: 'ar', label: 'Argentina' },
      { value: 'bo', label: 'Bolivia' },
      { value: 'cl', label: 'Chile' },
      { value: 'co', label: 'Colombia' },
      { value: 'pe', label: 'Perú' },
    ],
    error: 'Debes seleccionar un país',
  },
};

export const NoClear: Story = {
  args: {
    label: 'Sin botón limpiar',
    placeholder: 'Buscar...',
    options: FRUITS,
    clearable: false,
  },
};

export const WithDisabledOption: Story = {
  args: {
    label: 'Sede de atención',
    placeholder: 'Buscar sede...',
    options: [
      { value: 'central', label: 'Sede central' },
      { value: 'maintenance', label: 'Sede en mantenimiento', disabled: true },
      { value: 'emergency', label: 'Emergencia' },
    ],
  },
};

export const AccessibleWithoutVisibleLabel: Story = {
  args: {
    ariaLabel: 'Buscar distrito',
    placeholder: 'Distrito...',
    options: FRUITS,
  },
};
