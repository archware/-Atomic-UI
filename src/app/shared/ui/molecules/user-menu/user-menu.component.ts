import { Component, signal, HostListener, input, output } from '@angular/core';


export interface UserMenuAction {
  id: string;
  label: string;
  icon: string;
  danger?: boolean;
}

import { AvatarComponent } from '../../atoms/avatar/avatar.component';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [AvatarComponent],
  template: `
    <div class="user-menu" [class.open]="isOpen()">
      <!-- Avatar Button -->
      <button type="button" class="user-menu__trigger" (click)="toggle()"
        [attr.aria-expanded]="isOpen()" aria-haspopup="menu" [attr.title]="'Menú de usuario'">
        <app-avatar [initials]="initials()" [name]="userName()" size="md"></app-avatar>
      </button>

      <!-- Dropdown Menu -->
      <div class="user-menu__dropdown" role="menu">
        <!-- User Info Header -->
        <div class="user-menu__header">
          <app-avatar [initials]="initials()" [name]="userName()" size="lg"></app-avatar>
          <div class="user-menu__info">
            <span class="user-menu__name">{{ userName() }}</span>
            @if (userRole()) {
              <span class="user-menu__role">{{ userRole() }}</span>
            }
            @if (userEmail()) {
              <span class="user-menu__email">{{ userEmail() }}</span>
            }
          </div>
        </div>

        <!-- Divider -->
        <div class="user-menu__divider"></div>

        <!-- Menu Items -->
        @for (action of menuActions(); track action.id) {
          <button type="button"
            class="user-menu__item"
            [class.user-menu__item--danger]="action.danger"
            role="menuitem"
            (click)="onAction(action)">
            <span class="user-menu__item-icon"><i [class]="action.icon"></i></span>
            <span class="user-menu__item-label">{{ action.label }}</span>
          </button>
        }
      </div>
    </div>
  `,
  styleUrl: './user-menu.component.css'
})
export class UserMenuComponent {
  /** User initials for avatar */
  readonly initials = input('U');

  /** User display name */
  readonly userName = input('Usuario');

  /** User email */
  readonly userEmail = input('usuario@email.com');

  /** User role displayed as session metadata */
  readonly userRole = input('');

  /** Menu actions */
  readonly menuActions = input<UserMenuAction[]>([
    { id: 'profile', label: 'Mi Perfil', icon: 'fa-solid fa-user' },
    { id: 'settings', label: 'Configuración', icon: 'fa-solid fa-gear' },
    { id: 'password', label: 'Cambiar Contraseña', icon: 'fa-solid fa-key' },
    { id: 'logout', label: 'Cerrar Sesión', icon: 'fa-solid fa-arrow-right-from-bracket', danger: true }
]);

  /** Action selected event */
  readonly actionSelected = output<UserMenuAction>();

  /** Logout event (convenience) */
  readonly logout = output<void>();

  isOpen = signal(false);

  toggle(): void {
    this.isOpen.update(v => !v);
  }

  onAction(action: UserMenuAction): void {
    this.actionSelected.emit(action);
    if (action.id === 'logout') {
      this.logout.emit();
    }
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('app-user-menu')) {
      this.isOpen.set(false);
    }
  }
}
