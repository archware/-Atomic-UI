import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata, applicationConfig } from '@storybook/angular';
import { Component, inject } from '@angular/core';
import { provideZonelessChangeDetection } from '@angular/core';
import { PopupContainerComponent } from '../app/shared/ui/molecules/popup/popup-container.component';
import { PopupService } from '../app/shared/ui/services/popup.service';
import { ButtonComponent } from '../app/shared/ui/atoms/button/button.component';

@Component({
  selector: 'app-popup-demo',
  standalone: true,
  imports: [PopupContainerComponent, ButtonComponent],
  template: `
    <div style="display:flex; flex-wrap:wrap; gap:1rem; padding:1rem;">
      <app-button variant="primary" (click)="showInfo()">Info</app-button>
      <app-button variant="success" (click)="showSuccess()">Éxito</app-button>
      <app-button variant="warning" (click)="showWarning()">Advertencia</app-button>
      <app-button variant="danger" (click)="showError()">Error</app-button>
      <app-button variant="secondary" (click)="showConfirm()">Confirmar</app-button>
    </div>
    <app-popup-container></app-popup-container>
  `,
})
class PopupDemoComponent {
  private popup = inject(PopupService);

  showInfo() {
    this.popup.info('Información', 'Este es un mensaje informativo para el usuario.');
  }
  showSuccess() {
    this.popup.success('¡Operación exitosa!', 'El registro fue guardado correctamente.');
  }
  showWarning() {
    this.popup.warning('Advertencia', 'Esta acción podría tener consecuencias inesperadas.');
  }
  showError() {
    this.popup.error('Error', 'Ocurrió un error al procesar la solicitud. Intente de nuevo.');
  }
  showConfirm() {
    this.popup.confirm({
      title: '¿Eliminar elemento?',
      message: '¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer.',
      onConfirm: () => this.popup.success('Eliminado', 'El elemento fue eliminado correctamente.'),
      onCancel: () => {},
    });
  }
}

const meta: Meta = {
  title: '3. Organisms/Popup',
  component: PopupDemoComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [provideZonelessChangeDetection(), PopupService],
    }),
    moduleMetadata({
      imports: [PopupDemoComponent],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component: 'Sistema de popups/modales dinámicos gestionado por `PopupService`. El componente `app-popup-container` debe estar en el layout raíz.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const AllTypes: Story = {
  render: () => ({
    template: '<sb-popup-demo></sb-popup-demo>',
    imports: [PopupDemoComponent],
  }),
};
