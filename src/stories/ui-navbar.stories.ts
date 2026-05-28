import type { Meta, StoryObj } from '@storybook/angular';
import { NavBarComponent } from '../app/shared/ui/organisms/navbar/navbar.component';
import { provideRouter } from '@angular/router';

const meta: Meta<NavBarComponent> = {
  title: '3. Organisms/NavBar',
  component: NavBarComponent,
  tags: ['autodocs'],
  parameters: {
    applicationConfig: {
      providers: [provideRouter([])],
    },
    layout: 'fullscreen',
  },
  argTypes: {
    sticky:  { control: 'boolean' },
    variant: { control: 'select', options: ['light', 'dark', 'primary', 'transparent'] },
  },
};

export default meta;
type Story = StoryObj<NavBarComponent>;

export const Default: Story = {
  args: {
    brand: { name: 'Mi App', logo: '' },
    items: [
      { label: 'Inicio',     route: '/' },
      { label: 'Productos',  route: '/productos' },
      { label: 'Servicios',  route: '/servicios' },
      { label: 'Contacto',   route: '/contacto' },
    ],
    sticky:  false,
    variant: 'light',
  },
};

export const Sticky: Story = {
  args: {
    brand: { name: 'Mi App', logo: '' },
    items: [
      { label: 'Dashboard', route: '/' },
      { label: 'Reportes',  route: '/reportes' },
      { label: 'Usuarios',  route: '/usuarios' },
    ],
    sticky: true,
    variant: 'light',
  },
};

export const Oscuro: Story = {
  args: {
    brand: { name: 'Atomic UI', logo: '' },
    items: [
      { label: 'Componentes', route: '/' },
      { label: 'Blueprints',  route: '/blueprints' },
      { label: 'Docs',        route: '/docs' },
    ],
    sticky:  false,
    variant: 'dark',
  },
};

export const ConIconos: Story = {
  args: {
    brand: { name: 'Portal', logo: '' },
    items: [
      { label: 'Inicio',    route: '/', icon: 'fa-solid fa-house' },
      { label: 'Analítica', route: '/analytics', icon: 'fa-solid fa-chart-bar', badge: '3' },
      { label: 'Usuarios',  route: '/usuarios', icon: 'fa-solid fa-users' },
      { label: 'Config',    route: '/config', icon: 'fa-solid fa-gear' },
    ],
    sticky: false,
    variant: 'primary',
  },
};
