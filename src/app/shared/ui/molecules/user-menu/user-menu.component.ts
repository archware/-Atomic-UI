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
      <button type="button" class="user-menu__trigger" [class.user-menu__trigger--extended]="showUserInfo()" (click)="toggle()"
        [attr.aria-expanded]="isOpen()" aria-haspopup="menu" title="Menú de usuario">
        <app-avatar [initials]="initials()" [name]="userName()" size="md" [color]="avatarColor()"></app-avatar>
        @if (showUserInfo()) {
          <div class="user-menu__trigger-info">
            <span class="user-menu__trigger-name">{{ userName() }}</span>
            @if (userRole()) {
              <span class="user-menu__trigger-role">{{ userRole() }}</span>
            }
          </div>
          <i class="fa-solid fa-chevron-down user-menu__trigger-chevron"></i>
        }
      </button>

      <!-- Dropdown Menu -->
      <div class="user-menu__dropdown" role="menu">
        <div class="user-menu__header">
          <app-avatar [initials]="initials()" [name]="userName()" size="lg" [color]="avatarColor()"></app-avatar>
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
        <div class="user-menu__divider"></div>
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

  /** Color of the avatar */
  readonly avatarColor = input<string>();

  /** Show full user info (name, role) in the trigger */
  readonly showUserInfo = input(false);

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


