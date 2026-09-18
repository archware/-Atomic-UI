import { ChangeDetectionStrategy, Component, input, output, inject } from '@angular/core';

import { IconButtonComponent } from '../../atoms/icon-button/icon-button.component';
import { UserMenuComponent, UserMenuAction } from '../../molecules/user-menu/user-menu.component';
import { LanguageSwitcherComponent } from '../../atoms/language-switcher/language-switcher.component';
import { VariablesCssDirective } from '../../directives/variables-css.directive';
import { CHASIS_CONFIG, defaultChasisConfig } from '../../config/chasis.config';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [IconButtonComponent, UserMenuComponent, LanguageSwitcherComponent, VariablesCssDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css',
})
export class TopbarComponent {
  private readonly config = inject(CHASIS_CONFIG, { optional: true }) ?? defaultChasisConfig;

  /** Page title displayed in the topbar */
  readonly title = input('');
  readonly subtitle = input('');
  readonly apiStatus = input(this.config.apiStatus);
  readonly apiStatusColor = input<'success' | 'warning' | 'danger'>('success');
  readonly showSidebarToggle = input(this.config.showSidebarToggle);
  readonly showHomeButton = input(this.config.showHomeButton);
  readonly showUserInfo = input(this.config.showUserInfo);

  /** Background color for the topbar */
  readonly bgColor = input<string>();

  /** User initials for avatar */
  readonly userInitials = input(this.config.defaultUser.initials);

  /** User display name */
  readonly userName = input(this.config.defaultUser.name);

  /** User email */
  readonly userEmail = input(this.config.defaultUser.email);

  /** User role displayed in the session menu */
  readonly userRole = input(this.config.defaultUser.role);

  /** User avatar color */
  readonly avatarColor = input<string>(this.config.defaultUser.avatarColor ?? '');

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
  readonly homeClick = output<void>();

  onUserAction(action: UserMenuAction): void {
    this.userAction.emit(action);
  }

  onLogout(): void {
    this.logout.emit();
  }
}



