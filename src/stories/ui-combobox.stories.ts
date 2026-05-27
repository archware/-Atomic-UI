import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { ComboboxComponent } from '../app/shared/ui/molecules/combobox/combobox.component';

const meta: Meta<ComboboxComponent> = {
  title: '2. Molecules/Combobox',
  component: ComboboxComponent,
  decorators: [
    moduleMetadata({ imports: [FormsModule] }),
  ],
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
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
    placeholder: 'Escribe para buscar...',
    options: FRUITS,
    clearable: true,
  },
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
