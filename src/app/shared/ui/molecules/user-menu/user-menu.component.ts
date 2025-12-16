import { Component, Input, Output, EventEmitter, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule, AvatarComponent],
  template: `
    <div class="user-menu" [class.open]="isOpen()">
      <!-- Avatar Button -->
      <button type="button" class="user-menu__trigger" (click)="toggle()" (keydown.enter)="toggle()" (keydown.space)="toggle()" [attr.title]="'Menú de usuario'">
        <app-avatar [initials]="initials" [name]="userName" size="md"></app-avatar>
      </button>

      <!-- Dropdown Menu -->
      <div class="user-menu__dropdown">
        <!-- User Info Header -->
        <div class="user-menu__header">
          <app-avatar [initials]="initials" [name]="userName" size="lg"></app-avatar>
          <div class="user-menu__info">
            <span class="user-menu__name">{{ userName }}</span>
            <span class="user-menu__email">{{ userEmail }}</span>
          </div>
        </div>

        <!-- Divider -->
        <div class="user-menu__divider"></div>

        <!-- Menu Items -->
        @for (action of menuActions; track action.id) {
          <button type="button" 
            class="user-menu__item" 
            [class.user-menu__item--danger]="action.danger"
            (click)="onAction(action)"
            (keydown.enter)="onAction(action)"
            (keydown.space)="onAction(action)">
            <span class="user-menu__item-icon"><i [class]="action.icon"></i></span>
            <span class="user-menu__item-label">{{ action.label }}</span>
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
      position: relative;
    }

    .user-menu {
      position: relative;
    }

    /* === Trigger Button === */
    .user-menu__trigger {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      padding: 0;
      background: transparent;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .user-menu__trigger:hover {
      transform: scale(1.05);
    }



    /* === Dropdown === */
    .user-menu__dropdown {
      position: absolute;
      top: calc(100% + 0.5rem);
      right: 0;
      min-width: 220px;
      background: var(--surface-background);
      border: 1px solid var(--border-color);
      border-radius: 0.75rem;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1),
                  0 8px 10px -6px rgba(0, 0, 0, 0.1);
      opacity: 0;
      visibility: hidden;
      transform: translateY(-8px);
      transition: all 200ms ease;
      z-index: 1000;
      overflow: hidden;
    }

    .user-menu.open .user-menu__dropdown {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    /* === Header === */
    .user-menu__header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
    }

    .user-menu__info {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
      min-width: 0;
    }

    .user-menu__name {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-menu__email {
      font-size: 0.75rem;
      color: var(--text-color-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* === Divider === */
    .user-menu__divider {
      height: 1px;
      background: var(--border-color);
      margin: 0;
    }

    /* === Menu Items === */
    .user-menu__item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      width: 100%;
      padding: 0.75rem 1rem;
      background: transparent;
      border: none;
      color: var(--text-color);
      font-size: 0.875rem;
      cursor: pointer;
      transition: background 0.15s ease;
      text-align: left;
    }

    .user-menu__item:hover {
      background: var(--surface-section);
    }

    .user-menu__item--danger {
      color: var(--danger-color);
    }

    .user-menu__item--danger:hover {
      background: var(--danger-color-lighter);
    }

    .user-menu__item-icon {
      font-size: 1rem;
      width: 20px;
      text-align: center;
    }

    .user-menu__item-label {
      flex: 1;
    }

    /* === Dark Mode === */
    :host-context(.dark) .user-menu__trigger,
    :host-context([data-theme="dark"]) .user-menu__trigger {
      background: linear-gradient(135deg, var(--primary-color-light), var(--primary-color));
    }

    :host-context(.dark) .user-menu__trigger:hover,
    :host-context([data-theme="dark"]) .user-menu__trigger:hover {
      box-shadow: 0 2px 8px rgba(188, 154, 187, 0.3);
    }

    :host-context(.dark) .user-menu__dropdown,
    :host-context([data-theme="dark"]) .user-menu__dropdown {
      background: var(--surface-elevated);
      border-color: var(--border-color);
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
    }

    :host-context(.dark) .user-menu__name,
    :host-context([data-theme="dark"]) .user-menu__name {
      color: var(--text-color);
    }

    :host-context(.dark) .user-menu__email,
    :host-context([data-theme="dark"]) .user-menu__email {
      color: var(--text-color-secondary);
    }

    :host-context(.dark) .user-menu__divider,
    :host-context([data-theme="dark"]) .user-menu__divider {
      background: var(--border-color);
    }

    :host-context(.dark) .user-menu__item,
    :host-context([data-theme="dark"]) .user-menu__item {
      color: var(--text-color);
    }

    :host-context(.dark) .user-menu__item:hover,
    :host-context([data-theme="dark"]) .user-menu__item:hover {
      background: var(--surface-section);
    }
  `]
})
export class UserMenuComponent {
  /** User initials for avatar */
  @Input() initials = 'U';

  /** User display name */
  @Input() userName = 'Usuario';

  /** User email */
  @Input() userEmail = 'usuario@email.com';

  /** Menu actions */
  @Input() menuActions: UserMenuAction[] = [
    { id: 'profile', label: 'Mi Perfil', icon: 'fa-solid fa-user' },
    { id: 'settings', label: 'Configuración', icon: 'fa-solid fa-gear' },
    { id: 'password', label: 'Cambiar Contraseña', icon: 'fa-solid fa-key' },
    { id: 'logout', label: 'Cerrar Sesión', icon: 'fa-solid fa-arrow-right-from-bracket', danger: true }
  ];

  /** Action selected event */
  @Output() actionSelected = new EventEmitter<UserMenuAction>();

  /** Logout event (convenience) */
  @Output() logout = new EventEmitter<void>();

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
