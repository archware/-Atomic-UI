import { InjectionToken } from '@angular/core';
import { SidebarMenuItem } from '../organisms/sidebar/sidebar.component';

export interface ChasisConfig {
  logoText: string;
  logoSubtitle?: string;
  logoImageUrl?: string;
  logoBadgeImages?: string[];
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
  logoText: 'Atomic UI',
  logoSubtitle: 'SSIT CONSULTING',
  logoImageUrl: 'assets/doctrinas/ssit-emblem.jpg',
  logoBadgeImages: [
    'assets/doctrinas/doctrina-barracuda-icon.jpg',
    'assets/doctrinas/doctrina-mangosta-icon.jpg',
  ],
  logoIcon: 'fa-solid fa-layer-group',
  logoIconColor: 'var(--primary-color)',
  logoTextColor: 'var(--text-color)',
  headerBgColor: 'var(--surface-sunken)',
  footerBgColor: 'var(--surface-sunken)',
  menuItems: [
    { label: 'Showcase', icon: 'fa-solid fa-palette', route: '/showcase' , iconColor: 'var(--secondary-color)' },
    { label: 'Dashboard', icon: 'fa-solid fa-chart-pie', route: '/dashboard' , active: true, iconColor: 'var(--info-color)' },
    { label: 'CRUD', icon: 'fa-solid fa-table', route: '/crud' , iconColor: 'var(--success-color)' },
    { label: 'Wizard', icon: 'fa-solid fa-wand-magic-sparkles', route: '/wizard' , iconColor: 'var(--warning-color)' },
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
