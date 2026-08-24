import { Component, ChangeDetectionStrategy, computed, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common'; // Important for NgClass
import { VariablesCssDirective } from '../../directives/variables-css.directive';

/** Avatar size options */
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/** Avatar online status indicator */
export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away';

/** Avatar color variants (for icon or background) */
export type AvatarVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule, VariablesCssDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="avatar"
      [ngClass]="['avatar-' + size(), 'avatar-' + variant(), rounded() ? 'avatar-rounded' : '']"
      [appVariablesCss]="{ '--avatar-background-color': colorFondo() }"
    >
      @if (src() && !imageFailed()) {
        <img [src]="src()" [alt]="name()" (error)="onImageError()">
      } @else if (icon()) {
        <i [class]="icon()"></i>
      } @else if (initials() || name()) {
        <span class="avatar-initials">{{ computedInitials() }}</span>
      } @else {
        <span class="avatar-placeholder">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </span>
      }
      @if (status()) {
        <span class="avatar-status" [class]="'status-' + status()" [attr.aria-label]="status()"></span>
      }
    </div>
  `,
  styleUrl: './avatar.component.css'
})
export class AvatarComponent {
  readonly src = input<string>();
  readonly name = input('');
  readonly initials = input<string>();
  readonly color = input<string>();
  readonly size = input<AvatarSize>('md');
  readonly rounded = input(false);
  readonly status = input<AvatarStatus>();
  readonly icon = input<string>(); // New: Icon class support
  readonly variant = input<AvatarVariant>('default'); // New: Color variant
  readonly colorFondo = computed(() =>
    this.color() ?? (!this.src() && !this.icon() && this.variant() === 'default' ? this.colorFromName() : null)
  );

  imageFailed = signal(false);

  computedInitials(): string {
    const initials = this.initials();
    if (initials) return initials.slice(0, 2);
    const name = this.name();
    if (!name) return '';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  private readonly colors = [
    'var(--purple-600)',
    'var(--sky-500)',
    'var(--green-500)',
    'var(--yellow-500)',
    'var(--blue-500)',
    'var(--pink-500)',
    'var(--purple-500)',
    'var(--teal-500)'
  ];

  colorFromName(): string {
    const name = this.name();
    if (!name) return 'var(--gray-500)';
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return this.colors[Math.abs(hash) % this.colors.length];
  }

  onImageError() {
    this.imageFailed.set(true);
  }
}
