import {
  Component,
  ChangeDetectionStrategy,
  input,
  output
} from '@angular/core';

import { RouterModule } from '@angular/router';
import { BadgeComponent } from '../../atoms/badge/badge.component';

export interface NavBarItem {
  id?: string;
  label: string;
  icon?: string;
  route?: string;
  active?: boolean;
  badge?: string | number;
  children?: NavBarItem[];
}

export interface NavBarBrand {
  logo?: string;
  name: string;
  route?: string;
}

/**
 * NavBarComponent — Barra de navegación horizontal.
 * Alternativa al Sidebar para aplicaciones con pocas secciones o navegación plana.
 *
 * @example
 * ```html
 * <app-navbar
 *   [brand]="{ name: 'Mi App', logo: '/logo.svg' }"
 *   [items]="menuItems"
 *   [activeId]="activeRoute"
 *   (navigate)="onNavigate($event)"
 * ></app-navbar>
 * ```
 */
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './navbar.component.css',
    templateUrl: './nav-bar-component.component.html'
})
export class NavBarComponent {
  readonly brand = input<NavBarBrand>();
  readonly items = input<NavBarItem[]>([]);
  readonly activeId = input('');
  readonly sticky = input(false);
  readonly variant = input<'light' | 'dark' | 'primary' | 'transparent'>('light');
  readonly ariaLabel = input('Navegación principal');

  readonly navigate = output<NavBarItem>();

  protected mobileOpen = false;

  onItemClick(item: NavBarItem): void {
    this.navigate.emit(item);
  }

  protected toBadgeCount(value?: string | number): number | null {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : null;
    }
    if (typeof value === 'string') {
      const parsed = Number.parseInt(value, 10);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  }
}
