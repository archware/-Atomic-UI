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
  template: `
    <nav class="navbar"
         [class.navbar--sticky]="sticky()"
         [class.navbar--dark]="variant() === 'dark'"
         [class.navbar--primary]="variant() === 'primary'"
         [class.navbar--transparent]="variant() === 'transparent'"
         role="navigation" [attr.aria-label]="ariaLabel()">
      <!-- Brand -->
      @if (brand(); as currentBrand) {
        <div class="navbar__brand">
          @if (currentBrand.logo) {
            <img [src]="currentBrand.logo" [alt]="currentBrand.name" class="navbar__logo" />
          }
          <span class="navbar__brand-name">{{ currentBrand.name }}</span>
        </div>
      }

      <!-- Nav items (desktop) -->
      <ul class="navbar__nav" role="list">
        @for (item of items(); track item.id ?? item.label) {
          <li class="navbar__item" role="listitem">
            <button
              type="button"
              class="navbar__link"
              [class.navbar__link--active]="item.active || activeId() === (item.id ?? item.label)"
              (click)="onItemClick(item)"
              [attr.aria-current]="(item.active || activeId() === (item.id ?? item.label)) ? 'page' : null"
            >
              @if (item.icon) {
                <i [class]="item.icon" class="navbar__icon" aria-hidden="true"></i>
              }
              <span>{{ item.label }}</span>
              @if (item.badge) {
                <app-badge [count]="toBadgeCount(item.badge)" variant="danger" size="sm"></app-badge>
              }
            </button>
          </li>
        }
      </ul>

      <!-- Right slot -->
      <div class="navbar__actions">
        <ng-content select="[slot=actions]"></ng-content>
      </div>

      <!-- Mobile toggle -->
      <button
        type="button"
        class="navbar__mobile-toggle"
        [attr.aria-expanded]="mobileOpen"
        aria-label="Abrir menú"
        (click)="mobileOpen = !mobileOpen"
      >
        <i class="fa-solid" [class.fa-bars]="!mobileOpen" [class.fa-xmark]="mobileOpen"></i>
      </button>
    </nav>

    <!-- Mobile menu -->
    @if (mobileOpen) {
      <div class="navbar__mobile-menu">
        <ul role="list">
          @for (item of items(); track item.id ?? item.label) {
            <li>
              <button
                type="button"
                class="navbar__mobile-link"
                [class.navbar__mobile-link--active]="item.active || activeId() === (item.id ?? item.label)"
                (click)="onItemClick(item); mobileOpen = false"
              >
                @if (item.icon) {
                  <i [class]="item.icon" aria-hidden="true"></i>
                }
                {{ item.label }}
                @if (item.badge) {
                  <app-badge [count]="toBadgeCount(item.badge)" variant="danger" size="sm"></app-badge>
                }
              </button>
            </li>
          }
        </ul>
      </div>
    }
  `,
  styleUrl: './navbar.component.css',
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
