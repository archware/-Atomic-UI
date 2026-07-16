import { Component, inject, signal, computed, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import {
  LayoutShellComponent, TopbarComponent, SidebarComponent, SidebarUser,
  PanelComponent, RowComponent, AvatarComponent, TextComponent,
  ButtonComponent, SkeletonComponent, MetricsGridComponent, ThemeSwitcherComponent,
  ChartComponent, ApiService, useApi, KpiMetric,
  TableComponent, TableHeadComponent, TableRowComponent, TableCellComponent, ChipComponent
} from '@shared/ui';

interface User { id: string; name: string; email: string; role?: string; avatar?: string; }
interface DashboardStats { totalUsers: number; activeProjects: number; pendingTasks: number; revenue: number; }
interface MenuItem { id?: string; label: string; icon: string; iconColor?: string; route?: string; badge?: number | string; active?: boolean; }

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    LayoutShellComponent, TopbarComponent, SidebarComponent, PanelComponent, RowComponent,
    AvatarComponent, TextComponent, ButtonComponent, SkeletonComponent, MetricsGridComponent,
    ThemeSwitcherComponent, ChartComponent,
    TableComponent, TableHeadComponent, TableRowComponent, TableCellComponent, ChipComponent
  ],
  templateUrl: './dashboard-page.component.html',
  styles: [`
    .mb-6 { margin-bottom: 1.5rem; }
    
    /* Bento Grid System */
    .bento-grid { display: grid; grid-template-columns: repeat(12, 1fr); grid-auto-rows: minmax(min-content, max-content); gap: 1.5rem; }
    .bento-item { display: flex; flex-direction: column; height: 100%; position: relative; }
    .bento-large { grid-column: span 8; }
    .bento-medium { grid-column: span 4; }
    .bento-half { grid-column: span 6; }
    .bento-small { grid-column: span 4; }

    @media (max-width: 1024px) {
      .bento-large { grid-column: span 12; }
      .bento-medium, .bento-half, .bento-small { grid-column: span 6; }
    }
    @media (max-width: 768px) {
      .bento-large, .bento-medium, .bento-half, .bento-small { grid-column: span 12; }
    }

    /* Premium Card Styles */
    .bento-card {
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .bento-card ::ng-deep .panel {
      border: none;
      box-shadow: var(--shadow-md);
    }
    .bento-card:hover {
      transform: translateY(-4px);
      z-index: 2;
    }
    .bento-card:hover ::ng-deep .panel {
      box-shadow: 0 12px 24px -10px rgba(var(--primary-color-rgb), 0.15);
      border: none;
    }
    
    .chart-wrapper { position: relative; height: 100%; min-height: 250px; width: 100%; display: flex; flex-direction: column; justify-content: center; }

    /* Table Container */
    .table-container { width: 100%; overflow-x: auto; }

    /* Radial Progress */
    .radial-progress { width: 180px; height: 180px; margin: 0 auto; }
    .circular-chart { display: block; margin: 0 auto; width: 100%; height: 100%; max-width: 100%; max-height: 250px; }
    .circle-bg { fill: none; stroke: var(--surface-hover); stroke-width: 2.5; }
    .circle { fill: none; stroke-width: 2.5; stroke-linecap: round; animation: progress 1.5s ease-out forwards; }
    .circular-chart.primary .circle { stroke: var(--primary-color); }
    .percentage { fill: var(--text-color); font-family: inherit; font-size: 0.5em; text-anchor: middle; font-weight: bold; }
    @keyframes progress { 0% { stroke-dasharray: 0 100; } }

    /* Timeline */
    .timeline { display: flex; flex-direction: column; gap: 1.5rem; position: relative; padding-left: 1rem; margin-top: 0.5rem; }
    .timeline::before { content: ''; position: absolute; left: 22px; top: 0; bottom: 0; width: 2px; background: var(--border-color); }
    .timeline-item { display: flex; gap: 1rem; position: relative; z-index: 1; align-items: flex-start; }
    .timeline-icon { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 0.75rem; flex-shrink: 0; box-shadow: 0 0 0 4px var(--surface-background); }
    .timeline-content { display: flex; flex-direction: column; gap: 0.25rem; flex: 1; }
    .timeline-time { font-size: 0.75rem; margin-top: 0.25rem; }
  `]
})
export class DashboardPageComponent implements OnInit {
  private api = inject(ApiService);
  router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  sidebarVisible = signal(true);
  activeMenuItem = signal<string>('dashboard');
  currentUser = signal<User | null>(null);
  statsApi = useApi<DashboardStats>();

  metrics = computed<KpiMetric[]>(() => {
    return [
      { title: 'Usuarios Activos', subtitle: 'Base consolidada', value: 10600, format: 'compact', trend: 'up', trendValue: '+12%', iconClass: 'fa-solid fa-users', series: [8, 8.5, 9, 9.4, 9.8, 10.1, 10.6] },
      { title: 'Conversiones', subtitle: 'Pipeline de ventas', value: 342, format: 'number', trend: 'up', trendValue: '+24%', iconClass: 'fa-solid fa-bolt', series: [200, 220, 250, 280, 310, 320, 342] },
      { title: 'Tasa de Rebote', subtitle: 'Tráfico orgánico', value: 42, format: 'number', trend: 'down', trendValue: '-5%', iconClass: 'fa-solid fa-arrow-trend-down', series: [56, 52, 49, 45, 44, 43, 42] },
      { title: 'Ingresos MRR', subtitle: 'Cierre de mes', value: 244000, format: 'currency', currency: 'USD', trend: 'up', trendValue: '+8.5%', iconClass: 'fa-solid fa-sack-dollar', series: [180, 195, 202, 215, 228, 235, 244] },
    ];
  });

  get menuItems(): MenuItem[] {
    return [
      { id: 'showcase', label: 'Volver a Showcase', icon: 'fa-solid fa-palette', route: '/showcase', iconColor: 'var(--secondary-color)' },
      { id: 'dashboard', label: 'Dashboard', icon: 'fa-solid fa-chart-pie', route: '/dashboard', active: true, iconColor: 'var(--info-color)' },
      { id: 'analytics', label: 'Analíticas', icon: 'fa-solid fa-chart-line', route: '/analytics' },
      { id: 'projects', label: 'Proyectos', icon: 'fa-solid fa-table', route: '/crud', badge: 5 },
      { id: 'reports', label: 'Reportes', icon: 'fa-solid fa-file-pdf', route: '/reports' },
      { id: 'profile', label: 'Mi Perfil', icon: 'fa-solid fa-user', route: '/profile' },
      { id: 'settings', label: 'Configuración', icon: 'fa-solid fa-gear', route: '/settings' }
    ];
  }

  userInitials = computed(() => 'US');
  sidebarUser = computed<SidebarUser | null>(() => ({ name: 'Director Ejecutivo', role: 'Administrador', initials: 'DE', photo: '' }));

  ngOnInit() {
    import('rxjs').then(({ of }) => {
      this.statsApi.execute(of({ totalUsers: 10600, activeProjects: 22, pendingTasks: 39, revenue: 244000 }) as any);
    });
  }

  closeSidebar() { this.sidebarVisible.set(false); }
  toggleSidebar() { this.sidebarVisible.update(v => !v); }
  onMenuItemClick(item: any) { if (item.route) this.router.navigate([item.route]); }
  onUserAction(action: any) {}
  onLogout() {}
  loadDashboardStats() {}

  // ============================================
  // Premium Chart Configurations
  // ============================================
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

  private chartSurfaceColor(): string {
    if (typeof document === 'undefined') return '#ffffff';
    return getComputedStyle(document.documentElement).getPropertyValue('--surface-color').trim()
      || getComputedStyle(document.documentElement).getPropertyValue('--surface-background').trim()
      || '#ffffff';
  }

  private chartTooltipBg(): string {
    if (typeof document === 'undefined') return 'rgba(24, 24, 27, 0.9)';
    return getComputedStyle(document.documentElement).getPropertyValue('--chart-tooltip-bg').trim() || 'rgba(24, 24, 27, 0.9)';
  }

  private chartColorAlpha(index: number, fallback: string, alpha: number): string {
    const color = this.chartColor(index, fallback);
    const hex = color.replace('#', '').trim();
    if (/^[0-9a-fA-F]{6}$/.test(hex)) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return color;
  }

  revenueOptions: any = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false, backgroundColor: this.chartTooltipBg(), padding: 12, titleFont: { size: 14 }, bodyFont: { size: 14 } } },
    interaction: { mode: 'nearest', axis: 'x', intersect: false },
    scales: { y: { beginAtZero: true, grid: { color: () => this.chartGridColor(), drawBorder: false } }, x: { grid: { display: false, drawBorder: false } } }
  };
  donutOptions: any = { 
    responsive: true, maintainAspectRatio: false, 
    plugins: { legend: { position: 'right', labels: { usePointStyle: true, padding: 20 } } }, 
    cutout: '75%', elements: { arc: { borderWidth: 0 } } 
  };
  performanceOptions: any = { 
    responsive: true, maintainAspectRatio: false, 
    plugins: { legend: { position: 'top', labels: { usePointStyle: true } } }, 
    scales: { y: { stacked: true, grid: { display: false } }, x: { stacked: true, grid: { display: false } } } 
  };

  revenueData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago'],
    datasets: [{ 
      data: [180, 195, 185, 215, 240, 230, 260, 290], 
      label: 'Ingresos (USD)', 
      borderColor: this.chartColor(2, '#3b82f6'),
      backgroundColor: (context: any) => {
        const chart = context.chart;
        if (!chart || !chart.chartArea) {
          return this.chartColorAlpha(2, '#3b82f6', 0.2);
        }
        const {ctx, chartArea} = chart;
        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, this.chartColorAlpha(2, '#3b82f6', 0.4));
        gradient.addColorStop(1, this.chartColorAlpha(2, '#3b82f6', 0.0));
        return gradient;
      },
      fill: true, 
      tension: 0.4,
      pointBackgroundColor: this.chartSurfaceColor(),
      pointBorderColor: this.chartColor(2, '#3b82f6'),
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6
    }]
  };
  roleData = {
    labels: ['Administradores', 'Editores', 'Lectores', 'Invitados'],
    datasets: [{ data: [15, 45, 120, 30], backgroundColor: [this.chartColor(3, '#8b5cf6'), this.chartColor(2, '#3b82f6'), this.chartColor(4, '#10b981'), this.chartColor(5, '#f59e0b')] }]
  };
  performanceData = {
    labels: ['Ventas', 'Marketing', 'Soporte', 'Ingeniería'],
    datasets: [
      { data: [85, 92, 78, 95], label: 'Objetivo alcanzado demo', backgroundColor: this.chartColor(4, '#10b981'), borderRadius: 6, barPercentage: 0.6 },
      { data: [15, 8, 22, 5], label: 'Brecha demo', backgroundColor: this.chartColorAlpha(10, '#64748b', 0.16), borderRadius: 6, barPercentage: 0.6 }
    ]
  };

  // ============================================
  // Premium Widgets Data
  // ============================================
  recentTransactions = [
    { id: 1, client: 'Acme Corp', amount: '$4,500.00', status: 'Completado', date: 'Hoy, 10:42 AM' },
    { id: 2, client: 'Global Tech', amount: '$12,350.00', status: 'Pendiente', date: 'Ayer, 04:15 PM' },
    { id: 3, client: 'Wayne Ent.', amount: '$8,900.00', status: 'Completado', date: '12 Jun, 09:30 AM' },
    { id: 4, client: 'Stark Ind.', amount: '$45,000.00', status: 'Rechazado', date: '11 Jun, 11:20 AM' },
    { id: 5, client: 'Oscorp', amount: '$1,200.00', status: 'Completado', date: '10 Jun, 02:00 PM' }
  ];

  activityFeed = [
    { id: 1, title: 'Nuevo contrato firmado', desc: 'Acme Corp cerró el trato Q3.', time: 'Hace 10 min', icon: 'fa-solid fa-file-signature', color: '#10b981' },
    { id: 2, title: 'Pago rechazado', desc: 'Stark Ind. falló verificación 3DS.', time: 'Hace 2 horas', icon: 'fa-solid fa-triangle-exclamation', color: '#ef4444' },
    { id: 3, title: 'Reunión agendada', desc: 'Sync semanal con Marketing.', time: 'Hace 4 horas', icon: 'fa-solid fa-calendar', color: '#3b82f6' },
    { id: 4, title: 'Meta superada', desc: 'El equipo de ventas llegó al 85%.', time: 'Ayer', icon: 'fa-solid fa-trophy', color: '#f59e0b' },
    { id: 5, title: 'Actualización de sistema', desc: 'Alpha UI v4.4 desplegado.', time: 'Ayer', icon: 'fa-solid fa-rocket', color: '#8b5cf6' }
  ];
}
