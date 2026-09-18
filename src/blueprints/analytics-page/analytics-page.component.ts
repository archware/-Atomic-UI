import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import type { ChartConfiguration } from 'chart.js';
import {
  LayoutShellComponent,
  TopbarComponent,
  SidebarComponent,
  SidebarMenuItem,
  PanelComponent,
  ButtonComponent,
  ChartComponent,
  ThemeSwitcherComponent,
  PaginaDashboardComponent,
  ComparisonChartComponent
} from '@shared/ui';

@Component({
  selector: 'app-analytics-page',
  standalone: true,
  imports: [
    LayoutShellComponent,
    TopbarComponent,
    SidebarComponent,
    PanelComponent,
    ButtonComponent,
    ChartComponent,
    ThemeSwitcherComponent,
    PaginaDashboardComponent,
    ComparisonChartComponent
  ],
  template: `
    <app-layout-shell [sidebarVisible]="sidebarVisible()" (closeSidebar)="sidebarVisible.set(false)">
      <app-sidebar slot="sidebar" [menuItems]="menuItems" logoText="CxC Ventas" logoIcon="fa-solid fa-sack-dollar" logoIconColor="var(--purple-500)" logoTextColor="var(--text-color)" headerBgColor="var(--surface-sunken)" footerBgColor="var(--surface-sunken)" [user]="{ name: 'Usuario Demo', role: 'Administrador', initials: 'UD' }" (navigate)="onNavigate($event)"></app-sidebar>
      <app-topbar [showHomeButton]="true" apiStatus="API en línea" [showUserInfo]="false" [showSidebarToggle]="true" slot="topbar" title="Analíticas" [userName]="'Usuario'" (toggleSidebar)="sidebarVisible.set(!sidebarVisible())">
        <app-theme-switcher></app-theme-switcher>
      </app-topbar>

      <app-pagina-dashboard
        titulo="Centro de Analíticas"
        subtitulo="Explora tus datos en profundidad">
        
        <ng-container dashboard-acciones>
          <app-button variant="outline" iconClass="fa-solid fa-download">Exportar CSV</app-button>
        </ng-container>

        <ng-container dashboard-contenido>
          <app-panel title="Comparativa Financiera">
            <app-comparison-chart [items]="comparisonData"></app-comparison-chart>
          </app-panel>

          <app-panel title="Distribución por Dispositivo">
            <app-chart type="doughnut" [data]="deviceData" [options]="donutOptions" height="300px"></app-chart>
          </app-panel>

          <app-panel title="Tendencia de Conversiones">
             <app-chart type="bar" [data]="conversionData" [options]="chartOptions" height="350px"></app-chart>
          </app-panel>
        </ng-container>
      </app-pagina-dashboard>
    </app-layout-shell>
  `,
  styles: []
})
export class AnalyticsPageComponent {
  sidebarVisible = signal(true);
  router = inject(Router);

  menuItems: SidebarMenuItem[] = [
    { label: 'Showcase', icon: 'fa-solid fa-palette', route: '/showcase' , iconColor: 'var(--secondary-color)' },
    { label: 'Dashboard', icon: 'fa-solid fa-chart-pie', route: '/dashboard' , iconColor: 'var(--info-color)' },
    { label: 'CRUD', icon: 'fa-solid fa-table', route: '/crud' , iconColor: 'var(--success-color)' },
    { label: 'Settings', icon: 'fa-solid fa-gear', route: '/settings' , iconColor: 'var(--text-color-secondary)' },
  ];

  sidebarUser = computed(() => ({ name: 'Usuario', role: 'Admin', initials: 'US', photo: '' }));

  comparisonData = [
    { label: 'Ene', seriesA: 5000, seriesB: 3000, seriesAWidth: 50, seriesBWidth: 30 },
    { label: 'Feb', seriesA: 7000, seriesB: 4000, seriesAWidth: 70, seriesBWidth: 40 },
    { label: 'Mar', seriesA: 6000, seriesB: 6000, seriesAWidth: 60, seriesBWidth: 60 }
  ];

  onNavigate(item: SidebarMenuItem): void {
    if (item.route) this.router.navigate([item.route]);
  }

  // Datos demo exclusivos del blueprint. Las aplicaciones productivas deben enlazar contratos de backend.
  private chartColor(index: number, fallback: string): string {
    if (typeof document === 'undefined') return fallback;
    const value = getComputedStyle(document.documentElement).getPropertyValue(`--chart-color-${index}`).trim();
    return value || fallback;
  }

  private chartGridColor(): string {
    if (typeof document === 'undefined') return 'rgba(15, 23, 42, 0.16)';
    return getComputedStyle(document.documentElement).getPropertyValue('--chart-grid-color').trim() || 'rgba(15, 23, 42, 0.16)';
  }

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    scales: {
      y: { beginAtZero: true, grid: { color: () => this.chartGridColor() } },
      x: { grid: { display: false } }
    }
  };

  donutOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right' }
    }
  };

  deviceData = {
    labels: ['Móvil', 'Desktop', 'Tablet'],
    datasets: [{
      data: [350, 450, 100],
      backgroundColor: [this.chartColor(2, '#3b82f6'), this.chartColor(3, '#8b5cf6'), this.chartColor(4, '#10b981')]
    }]
  };

  conversionData = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    datasets: [
      { data: [12, 19, 3, 5, 2, 3, 10], label: 'Conversion demo', backgroundColor: this.chartColor(3, '#8b5cf6'), borderRadius: 6 }
    ]
  };
}
