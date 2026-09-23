const fs = require('fs');
const path = require('path');

const projects = ['-Atomic-UI', 'demo-chasis-front', 'cxc-ventas-front'];
const basePath = 'c:\\Users\\cotaha\\source\\repos';

const topbarTsContent = `import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { IconButtonComponent } from '../../atoms/icon-button/icon-button.component';
import { UserMenuComponent, UserMenuAction } from '../../molecules/user-menu/user-menu.component';
import { LanguageSwitcherComponent } from '../../atoms/language-switcher/language-switcher.component';
import { VariablesCssDirective } from '../../directives/variables-css.directive';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [IconButtonComponent, UserMenuComponent, LanguageSwitcherComponent, VariablesCssDirective],
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
`;

const topbarHtmlContent = `<div class="topbar-container" [appVariablesCss]="{'--surface-background': bgColor() || null}">
  <div class="topbar-left">
    <div class="sidebar-toggle-wrapper">
      @if (showSidebarToggle()) {
        <app-icon-button variant="ghost" [animation]="'none'" tooltip="Menú" (clicked)="toggleSidebar.emit()">
          <i class="fa-solid fa-bars topbar-icon" aria-hidden="true"></i>
        </app-icon-button>
      }
    </div>

    @if (showHomeButton()) {
      <app-icon-button variant="ghost" [animation]="'none'" tooltip="Inicio" (clicked)="homeClick.emit()">
        <i class="fa-solid fa-house topbar-icon" aria-hidden="true"></i>
      </app-icon-button>
    }

    <div class="topbar-title-area">
      <h1 class="page-title">{{ title() }}</h1>
      @if (subtitle() || apiStatus()) {
        <div class="topbar-subtitle-row">
          @if (subtitle()) {
            <span class="page-subtitle">{{ subtitle() }}</span>
          }
          @if (apiStatus()) {
            <span class="api-status-badge" [class]="'badge-' + apiStatusColor()">
              <i class="fa-solid fa-circle status-dot"></i> {{ apiStatus() }}
            </span>
          }
        </div>
      }
    </div>
  </div>

  <div class="topbar-right">
    @if (showLanguageSwitcher()) {
      <app-language-switcher></app-language-switcher>
    }
    <ng-content></ng-content>
    @if (showNotifications()) {
      <app-icon-button variant="ghost" [animation]="'none'" tooltip="Notificaciones" [badge]="notificationCount()" (clicked)="notificationClick.emit()">
        <i class="fa-regular fa-bell topbar-icon" aria-hidden="true"></i>
      </app-icon-button>
    }
    <app-user-menu
      [initials]="userInitials()"
      [userName]="userName()"
      [userEmail]="userEmail()"
      [userRole]="userRole()"
      [avatarColor]="avatarColor()"
      (actionSelected)="onUserAction($event)"
      (logout)="onLogout()"
    ></app-user-menu>
  </div>
</div>
`;

// Copy demo sidebar to Atomic and cxc
const demoSidebarTs = path.join(basePath, 'demo-chasis-front', 'src/app/shared/ui/organisms/sidebar/sidebar.component.ts');
const demoSidebarHtml = path.join(basePath, 'demo-chasis-front', 'src/app/shared/ui/organisms/sidebar/sidebar.component.html');

const sidebarTsContent = fs.readFileSync(demoSidebarTs, 'utf8');
const sidebarHtmlContent = fs.readFileSync(demoSidebarHtml, 'utf8');

for (const project of projects) {
  const topbarDir = path.join(basePath, project, 'src/app/shared/ui/organisms/topbar');
  const sidebarDir = path.join(basePath, project, 'src/app/shared/ui/organisms/sidebar');

  fs.writeFileSync(path.join(topbarDir, 'topbar.component.ts'), topbarTsContent, 'utf8');
  fs.writeFileSync(path.join(topbarDir, 'topbar.component.html'), topbarHtmlContent, 'utf8');

  fs.writeFileSync(path.join(sidebarDir, 'sidebar.component.ts'), sidebarTsContent, 'utf8');
  fs.writeFileSync(path.join(sidebarDir, 'sidebar.component.html'), sidebarHtmlContent, 'utf8');

  // Sync user-menu.component.ts
  const atomicUserMenuTs = path.join(basePath, '-Atomic-UI', 'src/app/shared/ui/molecules/user-menu/user-menu.component.ts');
  const userMenuTsContent = fs.readFileSync(atomicUserMenuTs, 'utf8');
  const userMenuDir = path.join(basePath, project, 'src/app/shared/ui/molecules/user-menu');
  if (fs.existsSync(userMenuDir)) {
    fs.writeFileSync(path.join(userMenuDir, 'user-menu.component.ts'), userMenuTsContent, 'utf8');
  }

  console.log('Synced', project);
}
