import type { Meta, StoryObj } from '@storybook/angular';
import { UserMenuComponent } from '../app/shared/ui/molecules/user-menu/user-menu.component';

const meta: Meta<UserMenuComponent> = {
  title: 'Molecules/UserMenu',
  component: UserMenuComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<UserMenuComponent>;

export const Default: Story = {
  render: () => ({
    template: `<app-user-menu userName="Juan Pérez" userEmail="juan@ejemplo.com"></app-user-menu>`,
  }),
};

export const WithAvatar: Story = {
  render: () => ({
    template: `<app-user-menu userName="María García" userEmail="maria@ejemplo.com" avatarUrl="https://i.pravatar.cc/150?img=5"></app-user-menu>`,
  }),
};

export const ShortName: Story = {
  render: () => ({
    template: `<app-user-menu userName="Ana" userEmail="ana@ejemplo.com"></app-user-menu>`,
  }),
};

export const LongName: Story = {
  render: () => ({
    template: `<app-user-menu userName="Carlos Alberto Rodríguez Mendoza" userEmail="carlos.rodriguez@empresa.com"></app-user-menu>`,
  }),
};

export const InNavbar: Story = {
  render: () => ({
    template: `
      <div style="display: flex; justify-content: flex-end; padding: 1rem; background: var(--surface-background); border: 1px solid var(--border-color); border-radius: 0.5rem;">
        <app-user-menu userName="Usuario Demo" userEmail="demo@ejemplo.com"></app-user-menu>
      </div>
    `,
  }),
};
