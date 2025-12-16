import { Component, Input, ChangeDetectionStrategy, computed, signal } from '@angular/core';

/** Avatar size options */
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/** Avatar online status indicator */
export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away';

/**
 * Avatar component for displaying user profile images or initials.
 * Automatically generates initials from name and assigns consistent colors.
 * 
 * @example
 * ```html
 * <!-- With image -->
 * <app-avatar src="https://example.com/photo.jpg" name="John Doe" size="lg"></app-avatar>
 * 
 * <!-- With initials (auto-generated) -->
 * <app-avatar name="María García" status="online"></app-avatar>
 * 
 * <!-- With custom initials -->
 * <app-avatar initials="AB" size="xl"></app-avatar>
 * ```
 * 
 * @see {@link AvatarSize} for available sizes
 * @see {@link AvatarStatus} for status indicators
 */
@Component({
  selector: 'app-avatar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div 
      class="avatar" 
      [class]="'avatar-' + size"
      [class.avatar-rounded]="rounded"
      [style.background-color]="!src ? colorFromName() : null"
    >
      @if (src && !imageFailed()) {
        <img [src]="src" [alt]="name" (error)="onImageError()">
      } @else if (initials || name) {
        <span class="avatar-initials">{{ computedInitials() }}</span>
      } @else {
        <span class="avatar-placeholder">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </span>
      }
      @if (status) {
        <span class="avatar-status" [class]="'status-' + status" [attr.aria-label]="status"></span>
      }
    </div>
  `,
  styles: [`
    .avatar {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: var(--surface-elevated);
      color: var(--text-color);
      overflow: hidden;
      flex-shrink: 0;
    }

    .avatar-rounded {
      border-radius: 0.5rem;
    }

    .avatar-xs { width: 1.5rem; height: 1.5rem; font-size: 0.625rem; }
    .avatar-sm { width: 2rem; height: 2rem; font-size: 0.75rem; }
    .avatar-md { width: 2.5rem; height: 2.5rem; font-size: 0.875rem; }
    .avatar-lg { width: 3rem; height: 3rem; font-size: 1rem; }
    .avatar-xl { width: 4rem; height: 4rem; font-size: 1.25rem; }

    .avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-initials {
      font-weight: 600;
      text-transform: uppercase;
      color: white;
    }

    .avatar-placeholder {
      width: 60%;
      height: 60%;
      color: var(--text-color-muted);
    }

    .avatar-placeholder svg {
      width: 100%;
      height: 100%;
    }

    .avatar-status {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 25%;
      height: 25%;
      min-width: 8px;
      min-height: 8px;
      border-radius: 50%;
      border: 2px solid var(--surface-background);
    }

    .status-online { background: var(--success-color); }
    .status-offline { background: var(--text-color-secondary); }
    .status-busy { background: var(--danger-color); }
    .status-away { background: var(--warning-color); }

    /* Dark mode */
    :host-context(html.dark) .avatar,
    :host-context([data-theme="dark"]) .avatar {
      background: var(--surface-section);
    }

    :host-context(html.dark) .avatar-status,
    :host-context([data-theme="dark"]) .avatar-status {
      border-color: var(--surface-section);
    }
  `]
})
export class AvatarComponent {
  @Input() src?: string;
  @Input() name = '';
  @Input() initials?: string;
  @Input() size: AvatarSize = 'md';
  @Input() rounded = false;
  @Input() status?: AvatarStatus;

  imageFailed = signal(false);

  // Memoized computed values
  computedInitials = computed(() => {
    if (this.initials) return this.initials.slice(0, 2);
    if (!this.name) return '';
    return this.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  });

  private readonly colors = [
    '#793576', '#23a7d4', '#10b981', '#f59e0b',
    '#6366f1', '#ec4899', '#8b5cf6', '#14b8a6'
  ];

  colorFromName = computed(() => {
    if (!this.name) return '#6b7280';
    let hash = 0;
    for (let i = 0; i < this.name.length; i++) {
      hash = this.name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return this.colors[Math.abs(hash) % this.colors.length];
  });

  onImageError() {
    this.imageFailed.set(true);
  }
}
