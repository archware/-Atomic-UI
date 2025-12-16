import type { Meta, StoryObj } from '@storybook/angular';
import { TabsComponent, TabComponent } from '../app/shared/ui/organisms/tabs/tabs.component';

const meta: Meta<TabsComponent> = {
  title: 'Organisms/Tabs',
  component: TabsComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<TabsComponent>;

export const Default: Story = {
  render: () => ({
    template: `
      <app-tabs>
        <app-tab label="General">
          <p>Contenido de la pestaña General</p>
        </app-tab>
        <app-tab label="Configuración">
          <p>Contenido de la pestaña Configuración</p>
        </app-tab>
        <app-tab label="Usuarios">
          <p>Contenido de la pestaña Usuarios</p>
        </app-tab>
      </app-tabs>
    `,
  }),
};

export const WithIcons: Story = {
  render: () => ({
    template: `
      <app-tabs>
        <app-tab label="Inicio" icon="🏠">
          <p>Bienvenido a la página de inicio</p>
        </app-tab>
        <app-tab label="Perfil" icon="👤">
          <p>Información del perfil de usuario</p>
        </app-tab>
        <app-tab label="Configuración" icon="⚙️">
          <p>Opciones de configuración</p>
        </app-tab>
        <app-tab label="Notificaciones" icon="🔔">
          <p>Lista de notificaciones</p>
        </app-tab>
      </app-tabs>
    `,
  }),
};

export const DisabledTab: Story = {
  render: () => ({
    template: `
      <app-tabs>
        <app-tab label="Activa">
          <p>Esta pestaña está activa</p>
        </app-tab>
        <app-tab label="Deshabilitada" [disabled]="true">
          <p>No deberías ver este contenido</p>
        </app-tab>
        <app-tab label="Otra activa">
          <p>Otra pestaña que sí funciona</p>
        </app-tab>
      </app-tabs>
    `,
  }),
};

export const ManyTabs: Story = {
  render: () => ({
    template: `
      <app-tabs>
        <app-tab label="Tab 1">Contenido 1</app-tab>
        <app-tab label="Tab 2">Contenido 2</app-tab>
        <app-tab label="Tab 3">Contenido 3</app-tab>
        <app-tab label="Tab 4">Contenido 4</app-tab>
        <app-tab label="Tab 5">Contenido 5</app-tab>
        <app-tab label="Tab 6">Contenido 6</app-tab>
        <app-tab label="Tab 7">Contenido 7</app-tab>
      </app-tabs>
    `,
  }),
};

export const WithContent: Story = {
  render: () => ({
    template: `
      <app-tabs>
        <app-tab label="Datos personales" icon="📋">
          <div style="padding: 1rem;">
            <h3 style="margin-bottom: 1rem;">Información Personal</h3>
            <p><strong>Nombre:</strong> Juan Pérez</p>
            <p><strong>Email:</strong> juan@ejemplo.com</p>
            <p><strong>Teléfono:</strong> +51 999 888 777</p>
          </div>
        </app-tab>
        <app-tab label="Preferencias" icon="⚙️">
          <div style="padding: 1rem;">
            <h3 style="margin-bottom: 1rem;">Configuración</h3>
            <p>Personaliza tu experiencia aquí.</p>
          </div>
        </app-tab>
      </app-tabs>
    `,
  }),
};
