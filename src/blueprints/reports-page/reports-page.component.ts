import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import {
  LayoutShellComponent,
  TopbarComponent,
  SidebarComponent,
  SidebarUser,
  PanelComponent,
  RowComponent,
  AvatarComponent,
  TextComponent,
  ButtonComponent,
  ThemeSwitcherComponent
} from '@shared/ui';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [
    LayoutShellComponent,
    TopbarComponent,
    SidebarComponent,
    PanelComponent,
    RowComponent,
    AvatarComponent,
    TextComponent,
    ButtonComponent,
    ThemeSwitcherComponent
  ],
  template: `
    <app-layout-shell [sidebarVisible]="sidebarVisible()" (closeSidebar)="sidebarVisible.set(false)">
      <app-sidebar slot="sidebar" [menuItems]="menuItems" [user]="sidebarUser()" (navigate)="onNavigate($event)"></app-sidebar>
      <app-topbar slot="topbar" title="Reportes" [userName]="'Usuario'" (toggleSidebar)="sidebarVisible.set(!sidebarVisible())">
        <app-theme-switcher></app-theme-switcher>
      </app-topbar>

      <app-row justify="between" align="center" class="mb-6">
        <div>
          <app-text variant="h2" weight="bold">Generación de Reportes</app-text>
          <app-text variant="body" color="muted">Descarga y analiza información histórica</app-text>
        </div>
        <app-button variant="primary" iconClass="fa-solid fa-file-circle-plus">Nuevo Reporte</app-button>
      </app-row>

      <app-row columns="1fr" gap="1.5rem">
        <app-panel title="Reportes Generados Recientemente">
          <app-row columns="1fr" gap="1rem">
            @for (report of reports; track report.id) {
              <div style="padding: 1rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center; background: var(--surface-background);">
                <div style="display: flex; align-items: center; gap: 1rem;">
                  <div style="width: 48px; height: 48px; border-radius: 8px; background: var(--surface-hover); display: flex; justify-content: center; align-items: center; color: var(--primary-color);">
                    <i class="fa-solid fa-file-pdf" style="font-size: 1.5rem;"></i>
                  </div>
                  <div>
                    <app-text variant="body" weight="semibold">{{ report.name }}</app-text>
                    <app-text variant="body-sm" color="muted">{{ report.date }} • {{ report.size }}</app-text>
                  </div>
                </div>
                <app-button variant="ghost" iconClass="fa-solid fa-download">Descargar</app-button>
              </div>
            }
          </app-row>
        </app-panel>
      </app-row>
    </app-layout-shell>
  `,
  styles: [`
    .mb-6 { margin-bottom: 1.5rem; }
  `]
})
export class ReportsPageComponent {
  sidebarVisible = signal(true);
  router = inject(Router);

  reports = [
    { id: 1, name: 'Cierre Financiero Q2', date: 'Ayer, 14:30', size: '2.4 MB' },
    { id: 2, name: 'Métricas de Adquisición Mensual', date: '10 Jun 2026', size: '1.1 MB' },
    { id: 3, name: 'Auditoría de Personal', date: '05 Jun 2026', size: '4.8 MB' }
  ];

  menuItems = [
    { id: 'dashboard', label: 'Resumen', icon: 'fa-solid fa-chart-pie', route: '/dashboard' },
    { id: 'analytics', label: 'Analíticas', icon: 'fa-solid fa-chart-line', route: '/analytics' },
    { id: 'projects', label: 'Proyectos', icon: 'fa-solid fa-folder-open', route: '/crud' },
    { id: 'reports', label: 'Reportes', icon: 'fa-solid fa-file-chart-column', route: '/reports', active: true },
    { id: 'profile', label: 'Mi Perfil', icon: 'fa-solid fa-user', route: '/profile' },
    { id: 'settings', label: 'Configuración', icon: 'fa-solid fa-gear', route: '/settings' }
  ];

  sidebarUser = computed(() => ({ name: 'Usuario', role: 'Admin', initials: 'US', photo: '' }));

  onNavigate(item: any) {
    if (item.route) this.router.navigate([item.route]);
  }
}
