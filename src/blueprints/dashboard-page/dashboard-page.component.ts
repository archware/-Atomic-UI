import { Component, inject, signal, computed, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
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
  ChipComponent,
  SkeletonComponent,
  ThemeSwitcherComponent,
  ApiService,
  useApi
} from '@shared/ui';

/**
 * User info interface
 * @customize Adjust to match your API response
 */
interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
}

/**
 * Dashboard stats interface
 * @customize Adjust to match your API response
 */
interface DashboardStats {
  totalUsers: number;
  activeProjects: number;
  pendingTasks: number;
  revenue: number;
}

/**
 * Menu item interface for sidebar navigation
 */
interface MenuItem {
  id?: string;
  label: string;
  icon: string;
  route?: string;
  badge?: number;
  children?: MenuItem[];
}

/**
 * Dashboard Page Blueprint
 * 
 * Features:
 * - LayoutShell with responsive sidebar
 * - Topbar with user menu and notifications
 * - Dynamic sidebar navigation
 * - Stats cards with API integration
 * - Loading states and error handling
 * - Dark mode support
 * 
 * @usage
 * 1. Copy this folder to your project's pages directory
 * 2. Update imports to match your project structure
 * 3. Configure menu items and API endpoints
 * 4. Add route in app.routes.ts with auth guard
 */
@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    LayoutShellComponent,
    TopbarComponent,
    SidebarComponent,
    PanelComponent,
    RowComponent,
    AvatarComponent,
    TextComponent,
    ButtonComponent,
    ChipComponent,
    SkeletonComponent,
    ThemeSwitcherComponent
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.css'
})
export class DashboardPageComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  // ============================================
  // CONFIGURATION - Customize these values
  // ============================================

  /** @customize Set your API base URL */
  private readonly API_BASE_URL = 'https://api.example.com/v1';

  /** @customize Token storage key */
  private readonly TOKEN_KEY = 'auth_token';

  // ============================================
  // STATE
  // ============================================

  /** Sidebar visibility state */
  sidebarVisible = signal(true);

  /** Current active menu item */
  activeMenuItem = signal<string>('dashboard');

  /** User info */
  currentUser = signal<User | null>(null);

  /** Dashboard stats API hook */
  statsApi = useApi<DashboardStats>();

  // ============================================
  // MENU CONFIGURATION
  // ============================================

  /** @customize Configure your menu items */
  menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'fa-solid fa-chart-pie',
      route: '/dashboard'
    },
    {
      id: 'crud',
      label: 'CRUD',
      icon: 'fa-solid fa-users',
      route: '/crud',
      badge: 5
    },
    {
      id: 'projects',
      label: 'Proyectos',
      icon: 'fa-solid fa-folder-open',
      route: '/dashboard/projects'
    },
    {
      id: 'reports',
      label: 'Reportes',
      icon: 'fa-solid fa-chart-bar',
      route: '/dashboard/reports'
    },
    {
      id: 'settings',
      label: 'Configuración',
      icon: 'fa-solid fa-gear',
      route: '/dashboard/settings'
    }
  ];

  // ============================================
  // COMPUTED
  // ============================================

  /** User initials for avatar */
  userInitials = computed(() => {
    const user = this.currentUser();
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  });

  /** Adapted user for sidebar */
  sidebarUser = computed<SidebarUser | null>(() => {
    const u = this.currentUser();
    if (!u) return null;
    return {
      name: u.name,
      role: u.role || 'User',
      initials: this.userInitials(),
      photo: u.avatar
    };
  });

  // ============================================
  // LIFECYCLE
  // ============================================

  constructor() {
    this.api.setBaseUrl(this.API_BASE_URL);
    this.loadUserFromStorage();
    this.setupAuthToken();
  }

  ngOnInit(): void {
    this.loadDashboardStats();
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  private loadUserFromStorage(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const userJson = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userJson) {
      try {
        this.currentUser.set(JSON.parse(userJson));
      } catch {
        console.error('Failed to parse user from storage');
      }
    }
  }

  private setupAuthToken(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const token = localStorage.getItem(this.TOKEN_KEY) || sessionStorage.getItem(this.TOKEN_KEY);
    if (token) {
      this.api.setAuthToken(token);
    } else {
      // No token, redirect to login
      this.router.navigate(['/login']);
    }
  }

  // ============================================
  // API CALLS
  // ============================================

  loadDashboardStats(): void {
    this.statsApi.execute(
      this.api.get<DashboardStats>('/dashboard/stats')
    );
  }

  // ============================================
  // SIDEBAR ACTIONS
  // ============================================

  toggleSidebar(): void {
    this.sidebarVisible.update(v => !v);
  }

  closeSidebar(): void {
    this.sidebarVisible.set(false);
  }

  onMenuItemClick(item: MenuItem): void {
    this.activeMenuItem.set(item.id || item.label);

    if (item.route) {
      this.router.navigate([item.route]);
    }

    // Close sidebar on mobile
    if (isPlatformBrowser(this.platformId) && window.innerWidth <= 768) {
      this.closeSidebar();
    }
  }

  isMenuItemActive(itemId: string): boolean {
    return this.activeMenuItem() === itemId;
  }

  // ============================================
  // USER ACTIONS
  // ============================================

  onUserAction(action: string): void {
    switch (action) {
      case 'profile':
        this.router.navigate(['/dashboard/profile']);
        break;
      case 'settings':
        this.router.navigate(['/dashboard/settings']);
        break;
      case 'change-password':
        this.router.navigate(['/dashboard/change-password']);
        break;
      default:
        // TODO: Implementar logging service para acciones desconocidas
        break;
    }
  }

  onLogout(): void {
    // Clear stored data
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem('user');
      sessionStorage.removeItem(this.TOKEN_KEY);
      sessionStorage.removeItem('user');
    }

    // Clear API auth
    this.api.clearAuthToken();

    // Redirect to login
    this.router.navigate(['/login']);
  }

  // ============================================
  // STATS HELPERS
  // ============================================

  formatNumber(value: number): string {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toString();
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0
    }).format(value);
  }
}
