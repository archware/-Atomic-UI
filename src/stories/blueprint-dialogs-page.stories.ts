import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { DialogsPageComponent } from '../blueprints/dialogs-page/dialogs-page.component';

const meta: Meta<DialogsPageComponent> = {
  title: '5. Blueprints/Dialogs Page',
  component: DialogsPageComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [
        provideHttpClient(),
        provideRouter([])
      ],
    }),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
## Blueprint: Variantes Canonicas de Cierre y Descarte

Demostracion exhaustiva de las variantes de cierre y descarte reconocidas en Atomic UI:
- **Invariante Modal vs Popup**: Cierre interior para modales y exterior flotante (hanging-close) para popups.
- **7 Patrones Canonicos**: Demostracion interactiva de hanging-close, close interior, ghost, table-action en alerta, chips removibles, descarte en file-input y boton outline de pie.
- **Accesibilidad y Foco**: Contrato unificado de escape y ciclo de foco.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<DialogsPageComponent>;

export const Default: Story = {
  name: 'Dialogs Page',
  render: () => ({
    template: `<app-dialogs-page></app-dialogs-page>`,
  }),
};
