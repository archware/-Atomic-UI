import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';

import { IconButtonComponent } from '../../atoms/icon-button/icon-button.component';
import { UserMenuComponent, UserMenuAction } from '../../molecules/user-menu/user-menu.component';
import { LanguageSwitcherComponent } from '../../atoms/language-switcher/language-switcher.component';
import { VariablesCssDirective } from '../../directives/variables-css.directive';
import { ScrollOverlayComponent } from '../scroll-overlay/scroll-overlay.component';

export interface TopbarNotification {
  id: string;
  title: string;
  message?: string;
  time: string;
  isRead?: boolean;
  icon?: string;
}

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [
    IconButtonComponent,
    UserMenuComponent,
    LanguageSwitcherComponent,
    VariablesCssDirective,
    ScrollOverlayComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css',
})
export class TopbarComponent {
  /** Page title displayed in the topbar */
  readonly title = input('');
  readonly subtitle = input('');
  readonly apiStatus = input('');
  readonly apiStatusColor = input<'success' | 'warning' | 'danger'>('success');
  readonly showSidebarToggle = input(true);
  readonly showHomeButton = input(false);
  readonly showUserInfo = input(false);


  /** Background color for the topbar */
  readonly bgColor = input<string>();

  /** User initials for avatar */
  readonly userInitials = input('U');

  /** User display name */
  readonly userName = input('Usuario');

  /** User email */
  readonly userEmail = input('usuario@email.com');

  /** User role displayed in the session menu */
  readonly userRole = input('');

  /** User avatar color */
  readonly avatarColor = input<string>('');

  /** Number of unread notifications */
  readonly notificationCount = input(0);

  /** Optional list of notifications rendered inside the dropdown */
  readonly notifications = input<TopbarNotification[]>([]);

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
  readonly homeClick = output<void>();

  readonly isNotificationsOpen = signal(false);

  onNotificationsTrigger(): void {
    this.notificationClick.emit();
    if (this.notifications().length > 0) {
      this.isNotificationsOpen.update((open) => !open);
    }
  }

  onUserAction(action: UserMenuAction): void {
    this.userAction.emit(action);
  }

  onLogout(): void {
    this.logout.emit();
  }
}
