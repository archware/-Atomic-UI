import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { IconButtonComponent } from '../../atoms/icon-button/icon-button.component';
import { UserMenuComponent, UserMenuAction } from '../../molecules/user-menu/user-menu.component';
import { LanguageSwitcherComponent } from '../../atoms/language-switcher/language-switcher.component';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [IconButtonComponent, UserMenuComponent, LanguageSwitcherComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css',
})
export class TopbarComponent {
  /** Page title displayed in the topbar */
  readonly title = input('');

  /** User initials for avatar */
  readonly userInitials = input('U');

  /** User display name */
  readonly userName = input('Usuario');

  /** User email */
  readonly userEmail = input('usuario@email.com');

  /** User role displayed in the session menu */
  readonly userRole = input('');

  /** Number of unread notifications */
  readonly notificationCount = input(0);

  /** Whether the language control is rendered */
  readonly showLanguageSwitcher = input(true);

  /** Whether the notifications control is rendered */
  readonly showNotifications = input(true);

  /** Event emitted when sidebar toggle is clicked */
  readonly toggleSidebar = output<void>();

  /** Event emitted when logout is clicked */
  readonly logout = output<void>();

  /** Event emitted when notifications are clicked */
  readonly notificationClick = output<void>();

  /** Event emitted when any user menu action is clicked */
  readonly userAction = output<UserMenuAction>();

  onUserAction(action: UserMenuAction): void {
    this.userAction.emit(action);
  }

  onLogout(): void {
    this.logout.emit();
  }
}
