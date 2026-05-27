import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { ProfilePageComponent } from '../blueprints/profile-page/profile-page.component';

const meta: Meta<ProfilePageComponent> = {
  title: '4. Blueprints/Profile Page',
  component: ProfilePageComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
## Profile Page Blueprint

Página de perfil de usuario completa con:
- Resumen de cuenta en columna lateral (avatar, nombre, rol, email)
- Formulario de datos personales (nombre, apellido, teléfono)
- Formulario de cambio de contraseña
- Manejo de estados loading / success / error con AlertComponent
- Layout responsivo (2 columnas en desktop, 1 en móvil)

### Uso
1. Copia \`blueprints/profile-page/\` a tu carpeta \`pages/\`
2. Ajusta interfaces \`UserProfile\` y los endpoints
3. Agrega la ruta en \`app.routes.ts\`

\`\`\`typescript
{ path: 'profile', loadComponent: () => import('./pages/profile-page/profile-page.component')
    .then(m => m.ProfilePageComponent), canActivate: [authGuard] }
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
type Story = StoryObj<ProfilePageComponent>;

export const Default: Story = {};
