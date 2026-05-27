import type { Meta, StoryObj } from '@storybook/angular';
import { AlertComponent } from '../app/shared/ui/molecules/alert/alert.component';

const meta: Meta<AlertComponent> = {
  title: '2. Molecules/Alert',
  component: AlertComponent,
  tags: ['autodocs'],
  argTypes: {
    variant:    { control: 'select', options: ['info', 'success', 'warning', 'danger'] },
    size:       { control: 'select', options: ['sm', 'md', 'lg'] },
    title:      { control: 'text' },
    message:    { control: 'text' },
    closable:   { control: 'boolean' },
    icon:       { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<AlertComponent>;

export const Info: Story = {
  args: {
    variant: 'info',
    title:   'Información',
    message: 'Tu sesión expirará en 5 minutos.',
    closable: true,
  },
};

export const Exito: Story = {
  args: {
    variant: 'success',
    title:   '¡Operación exitosa!',
    message: 'Los cambios han sido guardados correctamente.',
    closable: true,
  },
};

export const Advertencia: Story = {
  args: {
    variant: 'warning',
    title:   'Atención',
    message: 'Este proceso no se puede deshacer.',
    closable: false,
  },
};

export const Error: Story = {
  args: {
    variant: 'danger',
    title:   'Error al guardar',
    message: 'No se pudo conectar con el servidor. Intente nuevamente.',
    closable: true,
  },
};

export const SinTitulo: Story = {
  args: {
    variant: 'info',
    message: 'Recuerda completar tu perfil para acceder a todas las funciones.',
    closable: false,
  },
};

export const Tamaños: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:1rem;padding:1rem">
        <app-alert variant="primary" size="sm" message="Alert pequeño (sm)"></app-alert>
        <app-alert variant="primary" size="md" message="Alert mediano (md)"></app-alert>
        <app-alert variant="primary" size="lg" message="Alert grande (lg)"></app-alert>
      </div>
    `,
    imports: [AlertComponent],
  }),
};
