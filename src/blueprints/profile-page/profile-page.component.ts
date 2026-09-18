import { of, delay } from 'rxjs';
import { Component, inject, signal, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import {
  LayoutShellComponent,
  TopbarComponent,
  SidebarComponent,
  SidebarMenuItem,
  PanelComponent,
  RowComponent,
  AvatarComponent,
  TextComponent,
  ButtonComponent,
  DividerComponent,
  Alert,
  ChipComponent,
  SkeletonComponent,
  ProfileCoverComponent,
  ThemeSwitcherComponent,
} from '@shared/ui';
import { AuthService } from '@shared/ui/services/auth.service';
import { useApi } from '@shared/ui/services/use-api.service';

/** Perfil del usuario */
interface UserProfile {
  id:        string;
  firstName: string;
  lastName:  string;
  email:     string;
  role?:     string;
  phone?:    string;
  avatar?:   string;
}

@Component({
  selector: 'app-profile-page',
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
    DividerComponent,
    Alert,
    ChipComponent,
    SkeletonComponent,
    ProfileCoverComponent,
    ThemeSwitcherComponent
  ],
  templateUrl: './profile-page.component.html',
  styleUrl:    './profile-page.component.css',
})
export class ProfilePageComponent implements OnInit {
  private readonly router     = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly auth       = inject(AuthService);

  protected sidebarVisible = signal(true);
  protected profileApi     = useApi<UserProfile>();

  protected readonly menuItems: SidebarMenuItem[] = [
    { label: 'Showcase', icon: 'fa-solid fa-palette', route: '/showcase' , iconColor: 'var(--secondary-color)' },
    { label: 'Dashboard', icon: 'fa-solid fa-chart-pie', route: '/dashboard' , iconColor: 'var(--info-color)' },
    { label: 'CRUD', icon: 'fa-solid fa-table', route: '/crud' , iconColor: 'var(--success-color)' },
    { label: 'Profile', icon: 'fa-solid fa-user', route: '/profile' , iconColor: 'var(--warning-color)' },
    { label: 'Settings', icon: 'fa-solid fa-gear', route: '/settings' , iconColor: 'var(--text-color-secondary)' },
  ];

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.sidebarVisible.set(window.innerWidth >= 768);
    }
    this.loadProfile();
  }

  private loadProfile(): void {
    this.profileApi.execute(of({ id: '1', firstName: 'Havel', lastName: 'Contreras', email: 'havel.contreras@example.com', phone: '555-1234', role: 'Administrador' } as UserProfile).pipe(delay(800)));
  }

  protected goToSettings(): void {
    this.router.navigate(['/settings']);
  }

  protected logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  protected onNavigate(item: SidebarMenuItem): void {
    if (item.route) {
      this.router.navigate([item.route]);
    } else if (item.label === 'Cerrar sesión') {
      this.logout();
    }
  }

  protected onToggleSidebar(): void {
    this.sidebarVisible.update(v => !v);
  }

  get currentUser() { return this.auth.currentUser(); }
}
