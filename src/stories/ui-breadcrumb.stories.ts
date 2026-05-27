import type { Meta, StoryObj } from '@storybook/angular';
import { BreadcrumbComponent } from '../app/shared/ui/atoms/breadcrumb/breadcrumb.component';

const meta: Meta<BreadcrumbComponent> = {
  title: '1. Atoms/Breadcrumb',
  component: BreadcrumbComponent,
  tags: ['autodocs'],
  argTypes: {
    separator: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<BreadcrumbComponent>;

export const Default: Story = {
  args: {
    items: [
      { label: 'Inicio', route: '/' },
      { label: 'Usuarios', route: '/usuarios' },
      { label: 'Perfil' },
    ],
    separator: '/',
  },
};

export const ConIconos: Story = {
  args: {
    items: [
      { label: 'Inicio', route: '/', icon: 'fa-solid fa-house' },
      { label: 'Configuración', route: '/config', icon: 'fa-solid fa-gear' },
      { label: 'Perfil', icon: 'fa-solid fa-user' },
    ],
    separator: '›',
  },
};

export const NivelUnico: Story = {
  args: {
    items: [{ label: 'Dashboard' }],
  },
};

export const SeparadorPersonalizado: Story = {
  args: {
    items: [
      { label: 'Productos', route: '/productos' },
      { label: 'Categorías', route: '/productos/categorias' },
      { label: 'Electrónica' },
    ],
    separator: '»',
  },
};
