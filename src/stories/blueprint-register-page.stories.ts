import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { RegisterPageComponent } from '../blueprints/register-page/register-page.component';

const meta: Meta<RegisterPageComponent> = {
  title: '4. Blueprints/Register Page',
  component: RegisterPageComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
## Register Page Blueprint

Página de registro completa lista para copiar a tu proyecto.

### Uso
1. Copia \`blueprints/register-page/\` a tu carpeta \`pages/\`
2. Ajusta \`REGISTER_ENDPOINT\` y la interface \`RegisterResponse\`
3. Agrega la ruta en \`app.routes.ts\`

\`\`\`typescript
{ path: 'register', loadComponent: () => import('./pages/register-page/register-page.component')
    .then(m => m.RegisterPageComponent), canActivate: [guestGuard] }
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
type Story = StoryObj<RegisterPageComponent>;

export const Default: Story = {};
