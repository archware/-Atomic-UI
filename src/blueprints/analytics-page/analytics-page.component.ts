import { Component, inject, signal, computed, OnInit, PLATFORM_ID } from '@angular/core';
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
  ChartComponent,
  ThemeSwitcherComponent
} from '@shared/ui';

@Component({
  selector: 'app-analytics-page',
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
    ChartComponent,
    ThemeSwitcherComponent
  ],
  template: `
    <app-layout-shell [sidebarVisible]="sidebarVisible()" (closeSidebar)="sidebarVisible.set(false)">
      <app-sidebar slot="sidebar" [menuItems]="menuItems" [user]="sidebarUser()" (navigate)="onNavigate($event)"></app-sidebar>
      <app-topbar slot="topbar" title="Analíticas" [userName]="'Usuario'" (toggleSidebar)="sidebarVisible.set(!sidebarVisible())">
        <app-theme-switcher></app-theme-switcher>
      </app-topbar>

      <!-- Content -->
      <app-row justify="between" align="center" class="mb-6">
        <div>
          <app-text variant="h2" weight="bold">Centro de Analíticas</app-text>
          <app-text variant="body" color="muted">Explora tus datos en profundidad</app-text>
        </div>
        <app-button variant="outline" iconClass="fa-solid fa-download">Exportar CSV</app-button>
      </app-row>

      <app-row columns="1fr 1fr" gap="1.5rem" class="mb-6" [responsive]="true">
        <app-panel title="Tráfico Mensual">
          <app-chart type="line" [data]="trafficData" [options]="chartOptions" height="300px"></app-chart>
        </app-panel>

        <app-panel title="Distribución por Dispositivo">
          <app-chart type="doughnut" [data]="deviceData" [options]="donutOptions" height="300px"></app-chart>
        </app-panel>
      </app-row>

      <app-panel title="Tendencia de Conversiones">
         <app-chart type="bar" [data]="conversionData" [options]="chartOptions" height="350px"></app-chart>
      </app-panel>
    </app-layout-shell>
  `,
  styles: [`
    .mb-6 { margin-bottom: 1.5rem; }
  `]
})
export class AnalyticsPageComponent {
  sidebarVisible = signal(true);
  router = inject(Router);

  menuItems = [
    { id: 'dashboard', label: 'Resumen', icon: 'fa-solid fa-chart-pie', route: '/dashboard' },
    { id: 'analytics', label: 'Analíticas', icon: 'fa-solid fa-chart-line', route: '/analytics', active: true },
    { id: 'projects', label: 'Proyectos', icon: 'fa-solid fa-folder-open', route: '/crud' },
    { id: 'reports', label: 'Reportes', icon: 'fa-solid fa-file-chart-column', route: '/reports' },
    { id: 'profile', label: 'Mi Perfil', icon: 'fa-solid fa-user', route: '/profile' },
    { id: 'settings', label: 'Configuración', icon: 'fa-solid fa-gear', route: '/settings' }
  ];

  sidebarUser = computed(() => ({ name: 'Usuario', role: 'Admin', initials: 'US', photo: '' }));

  onNavigate(item: any) {
    if (item.route) this.router.navigate([item.route]);
  }

  // Chart data
  chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(150, 150, 150, 0.1)' } },
      x: { grid: { display: false } }
    }
  };

  donutOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'right' } }
  };

  trafficData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul'],
    datasets: [
      { data: [65, 59, 80, 81, 56, 55, 40], label: 'Visitas', borderColor: '#4f46e5', tension: 0.4 },
      { data: [28, 48, 40, 19, 86, 27, 90], label: 'Visitantes Únicos', borderColor: '#0ea5e9', tension: 0.4 }
    ]
  };

  deviceData = {
    labels: ['Móvil', 'Desktop', 'Tablet'],
    datasets: [{
      data: [350, 450, 100],
      backgroundColor: ['#4f46e5', '#0ea5e9', '#10b981']
    }]
  };

  conversionData = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    datasets: [
      { data: [12, 19, 3, 5, 2, 3, 10], label: 'Ventas', backgroundColor: '#8b5cf6', borderRadius: 6 }
    ]
  };
}
