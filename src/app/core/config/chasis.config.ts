import { InjectionToken } from '@angular/core';
import { SidebarMenuItem, SidebarUser } from '../../shared/ui/organisms/sidebar/sidebar.component';

export interface ChasisConfig {
  logoText: string;
  logoIcon: string;
  logoIconColor: string;
  logoTextColor: string;
  headerBgColor: string;
  footerBgColor: string;
  menuItems: SidebarMenuItem[];
  defaultUser: {
    name: string;
    role: string;
    email: string;
    initials: string;
    avatarColor?: string;
    photo?: string;
  };
  showHomeButton: boolean;
  showUserInfo: boolean;
  showSidebarToggle: boolean;
  apiStatus: string;
}

export const defaultChasisConfig: ChasisConfig = {
  logoText: 'CxC Ventas',
  logoIcon: 'fa-solid fa-sack-dollar',
  logoIconColor: 'var(--purple-500)',
  logoTextColor: 'var(--text-color)',
  headerBgColor: 'var(--surface-sunken)',
  footerBgColor: 'var(--surface-sunken)',
  menuItems: [
    { label: 'Showcase', icon: 'fa-solid fa-palette', route: '/showcase' , iconColor: 'var(--secondary-color)' },
    { label: 'Dashboard', icon: 'fa-solid fa-chart-pie', route: '/dashboard' , active: true, iconColor: 'var(--info-color)' },
    { label: 'CRUD', icon: 'fa-solid fa-table', route: '/crud' , iconColor: 'var(--success-color)' },
    { label: 'Profile', icon: 'fa-solid fa-user', route: '/profile' , iconColor: 'var(--warning-color)' },
    { label: 'Settings', icon: 'fa-solid fa-gear', route: '/settings' , iconColor: 'var(--text-color-secondary)' },
  ],
  defaultUser: {
    name: 'Usuario Demo',
    role: 'Administrador',
    email: 'usuario@demo.com',
    initials: 'UD'
  },
  showHomeButton: true,
  showUserInfo: false,
  showSidebarToggle: true,
  apiStatus: 'API en línea'
};

export const CHASIS_CONFIG = new InjectionToken<ChasisConfig>('CHASIS_CONFIG', {
  providedIn: 'root',
  factory: () => defaultChasisConfig
});
