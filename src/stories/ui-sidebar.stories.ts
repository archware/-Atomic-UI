import type { Meta, StoryObj } from '@storybook/angular';
import { SidebarComponent } from '../app/shared/ui/organisms/sidebar/sidebar.component';

const meta: Meta<SidebarComponent> = {
  title: '3. Organisms/Sidebar',
  component: SidebarComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<SidebarComponent>;

export const Expanded: Story = {
  render: () => ({
    template: `
      <div style="display: flex; height: 400px;">
        <app-sidebar [collapsed]="false"></app-sidebar>
        <div style="flex: 1; padding: 1rem; background: var(--surface-section);">
          <h2>Contenido Principal</h2>
          <p>El sidebar está expandido.</p>
        </div>
      </div>
    `,
  }),
};

export const Collapsed: Story = {
  render: () => ({
    template: `
      <div style="display: flex; height: 400px;">
        <app-sidebar [collapsed]="true"></app-sidebar>
        <div style="flex: 1; padding: 1rem; background: var(--surface-section);">
          <h2>Contenido Principal</h2>
          <p>El sidebar está colapsado (solo iconos).</p>
        </div>
      </div>
    `,
  }),
};

export const WithContent: Story = {
  render: () => ({
    template: `
      <div style="display: flex; height: 500px;">
        <app-sidebar [collapsed]="false"></app-sidebar>
        <div style="flex: 1; padding: 2rem; background: var(--surface-section); overflow: auto;">
          <h1 style="margin-bottom: 1rem;">Dashboard</h1>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
            <div style="padding: 1.5rem; background: var(--surface-background); border-radius: 0.5rem; box-shadow: var(--shadow-md);">
              <h3>Usuarios</h3>
              <p style="font-size: 2rem; font-weight: bold; color: var(--primary-color);">1,234</p>
            </div>
            <div style="padding: 1.5rem; background: var(--surface-background); border-radius: 0.5rem; box-shadow: var(--shadow-md);">
              <h3>Ventas</h3>
              <p style="font-size: 2rem; font-weight: bold; color: var(--secondary-color);">$45,678</p>
            </div>
            <div style="padding: 1.5rem; background: var(--surface-background); border-radius: 0.5rem; box-shadow: var(--shadow-md);">
              <h3>Pedidos</h3>
              <p style="font-size: 2rem; font-weight: bold; color: var(--success-color);">89</p>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
};
