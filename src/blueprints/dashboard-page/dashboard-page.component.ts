import { Component, inject, signal, computed, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
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
  SkeletonComponent,
  MetricsGridComponent,
  ThemeSwitcherComponent,
  ChartComponent,
  ApiService,
  useApi,
  KpiMetric
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
    ThemeSwitcherComponent, ChartComponent
  ],
  templateUrl: './dashboard-page.component.html',
  styles: [`
    .mb-6 { margin-bottom: 1.5rem; }
    
    /* Bento Grid System */
    .bento-grid {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      grid-auto-rows: minmax(min-content, max-content);
      gap: 1.5rem;
    }
    
    .bento-item {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .bento-large { grid-column: span 8; }
    .bento-medium { grid-column: span 4; }
    .bento-small { grid-column: span 4; }

    @media (max-width: 1024px) {
      .bento-large { grid-column: span 12; }
      .bento-medium { grid-column: span 6; }
      .bento-small { grid-column: span 6; }
    }
    @media (max-width: 768px) {
      .bento-large, .bento-medium, .bento-small { grid-column: span 12; }
    }
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
      { title: 'Total Usuarios', subtitle: 'Base acumulada', value: 10600, format: 'compact', trend: 'up', trendValue: '+12%', iconClass: 'fa-solid fa-users', series: [8.4, 8.7, 9.1, 9.4, 9.8, 10.1, 10.6] },
      { title: 'Proyectos Activos', subtitle: 'Sprint vigente', value: 22, format: 'number', trend: 'up', trendValue: '+4', iconClass: 'fa-solid fa-folder-open', series: [17, 18, 19, 19, 20, 21, 22] },
      { title: 'Tareas Pendientes', subtitle: 'Backlog operativo', value: 39, format: 'number', trend: 'down', trendValue: '-9%', iconClass: 'fa-solid fa-clock', series: [56, 52, 49, 45, 44, 41, 39] },
      { title: 'Ingresos', subtitle: 'Facturación mensual', value: 244000, format: 'currency', currency: 'PEN', trend: 'up', trendValue: '+8.5%', iconClass: 'fa-solid fa-sack-dollar', series: [180, 195, 202, 215, 228, 235, 244] },
    ];
  });

  get menuItems(): MenuItem[] {
    return [
      { id: 'showcase', label: 'Volver a Showcase', icon: 'fa-solid fa-arrow-left', route: '/showcase', iconColor: 'var(--primary-color)' },
      { id: 'dashboard', label: 'Resumen', icon: 'fa-solid fa-chart-pie', route: '/dashboard', active: true, iconColor: 'var(--secondary-color)' },
      { id: 'analytics', label: 'Analíticas', icon: 'fa-solid fa-chart-line', route: '/analytics' },
      { id: 'projects', label: 'Proyectos', icon: 'fa-solid fa-folder-open', route: '/crud', badge: 5 },
      { id: 'reports', label: 'Reportes', icon: 'fa-solid fa-file-chart-column', route: '/reports' },
      { id: 'profile', label: 'Mi Perfil', icon: 'fa-solid fa-user', route: '/profile' },
      { id: 'settings', label: 'Configuración', icon: 'fa-solid fa-gear', route: '/settings', iconColor: 'var(--text-color-secondary)' }
    ];
  }

  userInitials = computed(() => 'US');
  sidebarUser = computed<SidebarUser | null>(() => ({ name: 'Usuario Admin', role: 'Administrador', initials: 'US', photo: '' }));

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

  // Chart configs
  revenueOptions: any = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true }, x: { grid: { display: false } } } };
  donutOptions: any = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } }, cutout: '75%' };
  performanceOptions: any = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { y: { stacked: true }, x: { stacked: true, grid: { display: false } } } };

  revenueData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [{ data: [180, 195, 202, 215, 228, 244], label: 'Ingresos', borderColor: '#4f46e5', backgroundColor: 'rgba(79, 70, 229, 0.1)', fill: true, tension: 0.4 }]
  };
  roleData = {
    labels: ['Admin', 'Editores', 'Lectores'],
    datasets: [{ data: [15, 45, 120], backgroundColor: ['#8b5cf6', '#0ea5e9', '#10b981'], borderWidth: 0 }]
  };
  performanceData = {
    labels: ['Alpha UI', 'Backend', 'Security', 'Mobile App'],
    datasets: [
      { data: [85, 60, 30, 15], label: 'Completado', backgroundColor: '#10b981', borderRadius: 4 },
      { data: [15, 40, 70, 85], label: 'Pendiente', backgroundColor: '#e2e8f0', borderRadius: 4 }
    ]
  };
}
