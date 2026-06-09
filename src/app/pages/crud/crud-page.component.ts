import { Component, signal, inject, PLATFORM_ID, HostListener } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import {
  LayoutShellComponent,
  TopbarComponent,
  SidebarComponent,
  SidebarMenuItem,
  ThemeSwitcherComponent,
} from '@shared/ui';
import { CrudTableComponent } from '../../../blueprints/crud-table/crud-table.component';

@Component({
  selector: 'app-crud-page',
  standalone: true,
  imports: [
    LayoutShellComponent,
    TopbarComponent,
    SidebarComponent,
    ThemeSwitcherComponent,
    CrudTableComponent,
  ],
  template: `
    <app-layout-shell [sidebarVisible]="sidebarVisible()" (closeSidebar)="sidebarVisible.set(false)">
      <app-sidebar slot="sidebar" [menuItems]="menuItems" (navigate)="onNavigate($event)"></app-sidebar>
      <app-topbar slot="topbar" title="CRUD" userInitials="HC" userName="COTAHA"
        userEmail="cotaha@email.com" [notificationCount]="0"
        (toggleSidebar)="onToggleSidebar()" (logout)="onLogout()">
        <app-theme-switcher></app-theme-switcher>
      </app-topbar>
      <app-crud-table></app-crud-table>
    </app-layout-shell>
  `,
  styles: [':host { display: block; width: 100%; height: 100%; }'],
})
export class CrudPageComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private readonly MOBILE_BREAKPOINT = 768;

  sidebarVisible = signal(this.getInitialState());

  menuItems: SidebarMenuItem[] = [
    { label: 'Showcase', icon: 'fa-solid fa-palette', route: '/showcase' , iconColor: 'var(--secondary-color)' },
    { label: 'Dashboard', icon: 'fa-solid fa-chart-pie', route: '/dashboard' , iconColor: 'var(--info-color)' },
    { label: 'CRUD', icon: 'fa-solid fa-table', route: '/crud', active: true, iconColor: 'var(--success-color)' },
    { label: 'Profile', icon: 'fa-solid fa-user', route: '/profile' , iconColor: 'var(--warning-color)' },
    { label: 'Settings', icon: 'fa-solid fa-gear', route: '/settings' , iconColor: 'var(--text-color-secondary)' },
  ];

  private getInitialState(): boolean {
    return isPlatformBrowser(this.platformId)
      ? window.innerWidth > this.MOBILE_BREAKPOINT
      : true;
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const isMobile = window.innerWidth <= this.MOBILE_BREAKPOINT;
    if (isMobile && this.sidebarVisible()) this.sidebarVisible.set(false);
    else if (!isMobile && !this.sidebarVisible()) this.sidebarVisible.set(true);
  }

  onToggleSidebar() {
    this.sidebarVisible.update(v => !v);
  }

  onNavigate(item: SidebarMenuItem) {
    if (item.route) this.router.navigate([item.route]);
    if (isPlatformBrowser(this.platformId) && window.innerWidth <= this.MOBILE_BREAKPOINT) {
      this.sidebarVisible.set(false);
    }
  }

  onLogout() {
    this.router.navigate(['/login']);
  }
}



