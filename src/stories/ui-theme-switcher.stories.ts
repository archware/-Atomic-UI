import type { Meta, StoryObj } from '@storybook/angular';
import { ThemeSwitcherComponent } from '../app/shared/ui/organisms/theme-switcher/theme-switcher.component';

const meta: Meta<ThemeSwitcherComponent> = {
  title: 'Organisms/ThemeSwitcher',
  component: ThemeSwitcherComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Componente para cambiar entre tema claro, oscuro y automático (sistema).',
      },
    },
  },
};

export default meta;
type Story = StoryObj<ThemeSwitcherComponent>;

export const Default: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 2rem; align-items: center;">
        <app-theme-switcher></app-theme-switcher>
        <span>Haz clic para cambiar el tema</span>
      </div>
    `,
  }),
};

export const InNavbar: Story = {
  render: () => ({
    template: `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--surface-background); border: 1px solid var(--border-color); border-radius: 0.5rem;">
        <span style="font-weight: 600;">Mi Aplicación</span>
        <div style="display: flex; gap: 1rem; align-items: center;">
          <span>Usuario</span>
          <app-theme-switcher></app-theme-switcher>
        </div>
      </div>
    `,
  }),
};

export const WithLabel: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 0.5rem; align-items: center;">
        <app-theme-switcher></app-theme-switcher>
        <span style="font-size: 0.875rem; color: var(--text-color-secondary);">Cambiar tema</span>
      </div>
    `,
  }),
};
