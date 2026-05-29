import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { ForgotPasswordPageComponent } from '../blueprints/forgot-password-page/forgot-password-page.component';

const meta: Meta<ForgotPasswordPageComponent> = {
  title: '4. Blueprints/Forgot Password Page',
  component: ForgotPasswordPageComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
## Forgot Password Blueprint

Flujo completo de recuperación de contraseña en 4 pasos:
1. Solicitar reset (email)
2. Confirmación de envío
3. Ingresar código + nueva contraseña
4. Confirmación de éxito

### Uso
1. Copia \`blueprints/forgot-password-page/\` a tu carpeta \`pages/\`
2. Configura \`FORGOT_ENDPOINT\` y \`RESET_ENDPOINT\`
3. Agrega la ruta en \`app.routes.ts\`

\`\`\`typescript
{ path: 'forgot-password', loadComponent: () => import('./pages/forgot-password-page/forgot-password-page.component')
    .then(m => m.ForgotPasswordPageComponent), canActivate: [guestGuard] }
\`\`\`
        `,
      },
    },
  },
  decorators: [
    applicationConfig({
      providers: [
        provideRouter([]),
        provideHttpClient(),
      ],
    }),
  ],
};

export default meta;
type Story = StoryObj<ForgotPasswordPageComponent>;

export const Default: Story = {};

export const PasoSolicitud: Story = {
  name: 'Paso 1 — Solicitar reset',
};

export const PasoEnviado: Story = {
  name: 'Paso 2 — Email enviado',
  decorators: [
    applicationConfig({ providers: [provideRouter([]), provideHttpClient()] }),
  ],
  play: async ({ canvasElement: _canvasElement }) => {
    // En una prueba real podrías simular el flujo aquí
  },
};
