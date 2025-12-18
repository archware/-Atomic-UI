import type { Meta, StoryObj } from '@storybook/angular';
import { ToastComponent } from '../app/shared/ui/molecules/toast/toast.component';

const meta: Meta<ToastComponent> = {
  title: '2. Molecules/Toast',
  component: ToastComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<ToastComponent>;

export const Success: Story = {
  render: () => ({
    template: `<app-toast message="¡Operación exitosa!" type="success" [visible]="true"></app-toast>`,
  }),
};

export const Error: Story = {
  render: () => ({
    template: `<app-toast message="Ha ocurrido un error. Por favor, intente nuevamente." type="error" [visible]="true"></app-toast>`,
  }),
};

export const Warning: Story = {
  render: () => ({
    template: `<app-toast message="Atención: Este campo es obligatorio." type="warning" [visible]="true"></app-toast>`,
  }),
};

export const Info: Story = {
  render: () => ({
    template: `<app-toast message="El proceso se ha iniciado correctamente." type="info" [visible]="true"></app-toast>`,
  }),
};

export const TopLeft: Story = {
  render: () => ({
    template: `<app-toast message="Notificación arriba izquierda" type="info" position="top-left" [visible]="true"></app-toast>`,
  }),
};

export const BottomRight: Story = {
  render: () => ({
    template: `<app-toast message="Notificación abajo derecha" type="success" position="bottom-right" [visible]="true"></app-toast>`,
  }),
};

export const TopCenter: Story = {
  render: () => ({
    template: `<app-toast message="Notificación centrada arriba" type="warning" position="top-center" [visible]="true"></app-toast>`,
  }),
};
