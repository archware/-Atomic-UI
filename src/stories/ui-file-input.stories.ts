import type { Meta, StoryObj } from '@storybook/angular';
import { FileInputComponent } from '../app/shared/ui/atoms/file-input/file-input.component';

const meta: Meta<FileInputComponent> = {
  title: '1. Atoms/FileInput',
  component: FileInputComponent,
  tags: ['autodocs'],
  argTypes: {
    accept: { control: 'text' },
    multiple: { control: 'boolean' },
    maxSizeMB: { control: 'number' },
    label: { control: 'text' },
    hint: { control: 'text' },
    disabled: { control: 'boolean' },
    error: { control: 'text' },
    variant: { control: 'inline-radio', options: ['standard', 'dropzone'] },
    density: { control: 'inline-radio', options: ['comfortable', 'compact'] },
    dropzoneTitle: { control: 'text' },
    dropzoneSubtitle: { control: 'text' },
    badgeHint: { control: 'text' },
    showHeader: { control: 'boolean' },
    headerTitle: { control: 'text' },
    allowClearAll: { control: 'boolean' },
    clearAllLabel: { control: 'text' },
    itemActionIcon: { control: 'text' },
    itemActionLabel: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<FileInputComponent>;

export const Default: Story = {
  args: {
    label: 'Adjuntar archivo',
    hint: 'PDF, PNG o JPG hasta 5 MB',
    accept: '.pdf,.png,.jpg,.jpeg',
    maxSizeMB: 5,
    multiple: false,
  },
};

export const Dropzone: Story = {
  args: {
    label: 'Expediente PDF',
    variant: 'dropzone',
    dropzoneTitle: 'Arrastra tus archivos PDF aquí',
    dropzoneSubtitle: 'o haz clic para seleccionarlos desde tu equipo',
    badgeHint: 'Soporta múltiples archivos PDF',
    accept: '.pdf,application/pdf',
    multiple: true,
    maxSizeMB: 25,
    showHeader: true,
    headerTitle: 'Documentos cargados',
    allowClearAll: true,
    clearAllLabel: 'Limpiar lista',
    itemActionIcon: 'fa-solid fa-wand-magic-sparkles',
    itemActionLabel: 'Extraer páginas',
  },
};

export const Multiple: Story = {
  args: {
    label: 'Adjuntar imágenes',
    hint: 'PNG, JPG — máx. 10 MB cada uno',
    accept: '.png,.jpg,.jpeg',
    maxSizeMB: 10,
    multiple: true,
  },
};

export const Deshabilitado: Story = {
  args: {
    label: 'Archivo (deshabilitado)',
    disabled: true,
  },
};

export const ConError: Story = {
  args: {
    label: 'Adjuntar documento',
    error: 'El archivo supera el límite de 5 MB',
  },
};

export const CompactoParaDialogos: Story = {
  args: {
    label: 'PDF firmado',
    hint: 'Se archivará como una revisión inmutable.',
    accept: '.pdf,application/pdf',
    maxSizeMB: 15,
    density: 'compact',
  },
};

export const DropzoneCompact: Story = {
  args: {
    label: 'Expediente PDF compacto',
    variant: 'dropzone',
    density: 'compact',
    dropzoneTitle: 'Arrastra tus archivos PDF aquí',
    dropzoneSubtitle: 'o haz clic para seleccionarlos',
    badgeHint: 'Múltiples PDF',
    accept: '.pdf,application/pdf',
    multiple: true,
    maxSizeMB: 25,
    showHeader: true,
    allowClearAll: true,
  },
};

