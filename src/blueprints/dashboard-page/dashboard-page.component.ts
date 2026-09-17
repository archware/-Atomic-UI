import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  LayoutShellComponent, TopbarComponent, SidebarComponent, SidebarMenuItem, SidebarUser,
  PanelComponent, RowComponent,
  ButtonComponent, ThemeSwitcherComponent,
  KpiMetric,
  PaginaDashboardComponent, SummaryListComponent, SummaryListItem
} from '@shared/ui';
import { ApiService } from '@shared/ui/services/api.service';
import { useApi } from '@shared/ui/services/use-api.service';

interface User { id: string; name: string; email: string; role?: string; avatar?: string; }
interface DashboardStats { totalUsers: number; activeProjects: number; pendingTasks: number; revenue: number; }

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    LayoutShellComponent, TopbarComponent, SidebarComponent, ThemeSwitcherComponent,
    PaginaDashboardComponent, PanelComponent, SummaryListComponent,
    ButtonComponent, RowComponent
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.css']
})
export class DashboardPageComponent implements OnInit {
  private api = inject(ApiService);
  router = inject(Router);

  sidebarVisible = signal(true);
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

  get menuItems(): SidebarMenuItem[] {
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
      this.statsApi.execute(of({ totalUsers: 10600, activeProjects: 22, pendingTasks: 39, revenue: 244000 }));
    });
  }

  closeSidebar() { this.sidebarVisible.set(false); }
  toggleSidebar() { this.sidebarVisible.update(v => !v); }
  onMenuItemClick(item: SidebarMenuItem): void { if (item.route) this.router.navigate([item.route]); }
  onUserAction(_action: unknown) {}
  onLogout() {}

  recentTransactions: SummaryListItem[] = [
    { label: 'Acme Corp', value: '$4,500.00', icon: 'fa-solid fa-building', valueColor: 'var(--success-500)' },
    { label: 'Global Tech', value: '$12,350.00', icon: 'fa-solid fa-globe', valueColor: 'var(--warning-500)' },
    { label: 'Wayne Ent.', value: '$8,900.00', icon: 'fa-solid fa-industry', valueColor: 'var(--success-500)' }
  ];

  activityFeed: SummaryListItem[] = [
    { label: 'Nuevo contrato firmado', value: 'Hace 10 min', icon: 'fa-solid fa-file-signature', valueColor: 'var(--text-color-secondary)' },
    { label: 'Pago rechazado', value: 'Hace 2 horas', icon: 'fa-solid fa-triangle-exclamation', valueColor: 'var(--text-color-secondary)' },
    { label: 'Reunión agendada', value: 'Hace 4 horas', icon: 'fa-solid fa-calendar', valueColor: 'var(--text-color-secondary)' }
  ];
}
