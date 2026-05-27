import type { Meta, StoryObj } from '@storybook/angular';
import { FileInputComponent } from '../app/shared/ui/atoms/file-input/file-input.component';

const meta: Meta<FileInputComponent> = {
  title: '1. Atoms/FileInput',
  component: FileInputComponent,
  tags: ['autodocs'],
  argTypes: {
    accept:    { control: 'text' },
    multiple:  { control: 'boolean' },
    maxSizeMB: { control: 'number' },
    label:     { control: 'text' },
    hint:      { control: 'text' },
    disabled:  { control: 'boolean' },
    error:     { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<FileInputComponent>;

export const Default: Story = {
  args: {
    label: 'Adjuntar archivo',
    hint:  'PDF, PNG o JPG hasta 5 MB',
    accept: '.pdf,.png,.jpg,.jpeg',
    maxSizeMB: 5,
    multiple: false,
  },
};

export const Multiple: Story = {
  args: {
    label:    'Adjuntar imágenes',
    hint:     'PNG, JPG — máx. 10 MB cada uno',
    accept:   '.png,.jpg,.jpeg',
    maxSizeMB: 10,
    multiple:  true,
  },
};

export const Deshabilitado: Story = {
  args: {
    label:    'Archivo (deshabilitado)',
    disabled: true,
  },
};

export const ConError: Story = {
  args: {
    label: 'Adjuntar documento',
    error: 'El archivo supera el límite de 5 MB',
  },
};
