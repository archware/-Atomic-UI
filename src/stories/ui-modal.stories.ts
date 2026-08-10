import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { ModalComponent } from '../app/shared/ui/molecules/modal/modal.component';
import { ButtonComponent } from '../app/shared/ui/atoms/button/button.component';
import { FloatingInputComponent } from '../app/shared/ui/atoms/floating-input/floating-input.component';

const meta: Meta<ModalComponent> = {
  id: 'molecules-modal',
  title: '2. Molecules/Modal',
  component: ModalComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [ButtonComponent, FloatingInputComponent],
    }),
  ],
};

export default meta;
type Story = StoryObj<ModalComponent>;

export const Default: Story = {
  render: () => ({
    template: `
      <app-modal title="Confirmar acción" size="md">
        <p>¿Está seguro de que desea continuar con esta acción?</p>
      </app-modal>
    `,
  }),
};

export const Small: Story = {
  render: () => ({
    template: `
      <app-modal title="Modal pequeño" size="sm">
        <p>Contenido del modal pequeño.</p>
      </app-modal>
    `,
  }),
};

export const Large: Story = {
  render: () => ({
    template: `
      <app-modal title="Modal grande" size="lg">
        <p>Este es un modal grande con más espacio para contenido extenso.</p>
        <p>Puede contener formularios, tablas u otro contenido complejo.</p>
      </app-modal>
    `,
  }),
};

export const WithForm: Story = {
  render: () => ({
    template: `
      <app-modal title="Nuevo usuario" size="md">
        <form class="atomic-form-stack">
          <app-floating-input data-modal-initial-focus label="Nombre" autocomplete="name"></app-floating-input>
          <app-floating-input label="Correo electrónico" type="email" autocomplete="email"></app-floating-input>
        </form>
        <div slot="footer">
          <app-button variant="primary">Guardar</app-button>
        </div>
      </app-modal>
    `,
  }),
};

export const Confirmation: Story = {
  render: () => ({
    template: `
      <app-modal title="¿Eliminar registro?" size="sm">
        <p>Esta acción no se puede deshacer.</p>
        <div slot="footer" style="display:flex; gap:var(--space-2);">
          <app-button variant="outline">Cancelar</app-button>
          <app-button variant="outline" tone="danger">Eliminar</app-button>
        </div>
      </app-modal>
    `,
  }),
};

export const MobileBottomSheet: Story = {
  name: 'Diálogo móvil con área segura',
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  render: () => ({
    template: `
      <app-modal title="Confirmar cambios" size="md">
        <p>Revise los datos antes de continuar. El contenido mantiene separación del borde inferior.</p>
        <div slot="footer" style="width:100%;">
          <app-button variant="primary" [fullWidth]="true">Confirmar</app-button>
        </div>
      </app-modal>
    `,
  }),
};
