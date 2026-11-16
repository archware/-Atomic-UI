import { type Meta, type StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { FloatingTextareaComponent } from '../app/shared/ui/atoms/floating-textarea/floating-textarea.component';

const meta: Meta<FloatingTextareaComponent> = {
  id: 'atoms-floating-textarea',
  title: '1. Atoms/FloatingTextarea',
  component: FloatingTextareaComponent,
  decorators: [
    moduleMetadata({
      imports: [FormsModule],
    }),
  ],
  tags: ['autodocs'],
  args: {
    label: 'Observaciones técnicas',
    placeholder: 'Describa el detalle operativo...',
    variant: 'floating',
    rows: 4,
    clearable: false,
    disabled: false,
    readonly: false,
    error: '',
  },
};

export default meta;
type Story = StoryObj<FloatingTextareaComponent>;

export const Default: Story = {};

export const WithError: Story = {
  args: {
    error: 'Este campo requiere al menos 10 caracteres.',
  },
};
