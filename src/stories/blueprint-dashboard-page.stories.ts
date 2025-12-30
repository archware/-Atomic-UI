import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DashboardPageComponent } from '../blueprints/dashboard-page/dashboard-page.component';

const meta: Meta<DashboardPageComponent> = {
  title: '5. Blueprints/Dashboard Page',
  component: DashboardPageComponent,
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
## Dashboard Page Blueprint

Layout completo de dashboard con:
- **LayoutShell**: Contenedor responsive
- **Sidebar**: Navegación lateral con menú
- **Topbar**: Barra superior con usuario
- **Stats Cards**: Tarjetas de estadísticas
- **Dark Mode**: Soporte para tema oscuro

### Uso
\`\`\`bash
# Copiar a tu proyecto
cp -r src/blueprints/dashboard-page src/app/pages/
\`\`\`

### Configuración
1. Actualiza \`menuItems\` con tu navegación
2. Configura \`API_BASE_URL\` para cargar stats
3. Personaliza las tarjetas de stats
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<DashboardPageComponent>;

// Set mock user in storage before rendering
const setupMockUser = () => {
  const mockUser = {
    id: '1',
    name: 'Demo User',
    email: 'demo@example.com',
    role: 'Admin'
  };
  sessionStorage.setItem('user', JSON.stringify(mockUser));
  sessionStorage.setItem('auth_token', 'mock-token-12345');
};

export const Default: Story = {
  name: 'Dashboard Layout',
  render: () => {
    setupMockUser();
    return {
      template: `
        <div style="height: 100vh;">
          <app-dashboard-page></app-dashboard-page>
        </div>
      `,
    };
  },
};

export const DarkMode: Story = {
  name: 'Dashboard (Dark Mode)',
  render: () => {
    setupMockUser();
    return {
      template: `
        <div style="height: 100vh;" class="dark-theme" data-theme="dark">
          <app-dashboard-page></app-dashboard-page>
        </div>
      `,
    };
  },
};
