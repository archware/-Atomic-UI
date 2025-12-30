import type { Meta, StoryObj } from '@storybook/angular';
import { ModalComponent } from '../app/shared/ui/molecules/modal/modal.component';

const meta: Meta<ModalComponent> = {
  title: '2. Molecules/Modal',
  component: ModalComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<ModalComponent>;

export const Default: Story = {
  render: () => ({
    template: `
      <app-modal title="Confirmar acción" [open]="true" size="md">
        <p>¿Está seguro de que desea continuar con esta acción?</p>
      </app-modal>
    `,
  }),
};

export const Small: Story = {
  render: () => ({
    template: `
      <app-modal title="Modal pequeño" [open]="true" size="sm">
        <p>Contenido del modal pequeño.</p>
      </app-modal>
    `,
  }),
};

export const Large: Story = {
  render: () => ({
    template: `
      <app-modal title="Modal grande" [open]="true" size="lg">
        <p>Este es un modal grande con más espacio para contenido extenso.</p>
        <p>Puede contener formularios, tablas u otro contenido complejo.</p>
      </app-modal>
    `,
  }),
};

export const WithForm: Story = {
  render: () => ({
    template: `
      <app-modal title="Nuevo usuario" [open]="true" size="md">
        <form style="display: flex; flex-direction: column; gap: 1rem;">
          <div>
            <label style="display: block; margin-bottom: 0.5rem;">Nombre:</label>
            <input type="text" style="width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px;">
          </div>
          <div>
            <label style="display: block; margin-bottom: 0.5rem;">Email:</label>
            <input type="email" style="width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px;">
          </div>
        </form>
      </app-modal>
    `,
  }),
};

export const Confirmation: Story = {
  render: () => ({
    template: `
      <app-modal title="¿Eliminar registro?" [open]="true" size="sm">
        <p style="margin-bottom: 1rem;">Esta acción no se puede deshacer.</p>
        <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
          <button style="padding: 0.5rem 1rem; border: 1px solid #ccc; border-radius: 4px; background: white;">Cancelar</button>
          <button style="padding: 0.5rem 1rem; border: none; border-radius: 4px; background: #dc2626; color: white;">Eliminar</button>
        </div>
      </app-modal>
    `,
  }),
};
