import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginPageComponent } from '../blueprints/login-page/login-page.component';

const meta: Meta<LoginPageComponent> = {
  title: '5. Blueprints/Login Page',
  component: LoginPageComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [
        provideHttpClient(),
        provideRouter([]),
        importProvidersFrom(BrowserAnimationsModule)
      ],
    }),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
## Login Page Blueprint

Página de autenticación completa con:
- **Login**: Formulario con email/password
- **Registro**: Formulario con validaciones
- **Recuperar contraseña**: Flujo de recuperación
- **Remember me**: Checkbox para recordar sesión

### Uso
\`\`\`bash
# Copiar a tu proyecto
cp -r src/blueprints/login-page src/app/pages/
\`\`\`

### Configuración
1. Actualiza \`API_BASE_URL\` con tu backend
2. Configura \`REDIRECT_AFTER_LOGIN\` para la redirección
3. Ajusta los campos del formulario según tus necesidades
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<LoginPageComponent>;

export const Default: Story = {
  name: 'Login View',
  render: () => ({
    template: `
      <div style="height: 100vh;">
        <app-login-page></app-login-page>
      </div>
    `,
  }),
};

export const DarkMode: Story = {
  name: 'Login (Dark Mode)',
  render: () => ({
    template: `
      <div style="height: 100vh;" class="dark-theme" data-theme="dark">
        <app-login-page></app-login-page>
      </div>
    `,
  }),
};
