import type { Meta, StoryObj } from '@storybook/angular';
import { LanguageSwitcherComponent } from '../app/shared/ui/atoms/language-switcher/language-switcher.component';

const meta: Meta<LanguageSwitcherComponent> = {
  title: 'Atoms/LanguageSwitcher',
  component: LanguageSwitcherComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Selector de idioma para internacionalización (i18n). Soporta español e inglés.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<LanguageSwitcherComponent>;

export const Default: Story = {
  render: () => ({
    template: `<app-language-switcher></app-language-switcher>`,
  }),
};

export const InNavbar: Story = {
  render: () => ({
    template: `
      <div style="display: flex; justify-content: flex-end; padding: 1rem; background: var(--surface-background); border: 1px solid var(--border-color); border-radius: 0.5rem;">
        <app-language-switcher></app-language-switcher>
      </div>
    `,
  }),
};

export const WithOtherElements: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 1rem; align-items: center; padding: 1rem; background: var(--surface-background); border: 1px solid var(--border-color); border-radius: 0.5rem;">
        <span style="flex: 1; font-weight: 600;">Mi Aplicación</span>
        <app-language-switcher></app-language-switcher>
        <span>👤</span>
      </div>
    `,
  }),
};
