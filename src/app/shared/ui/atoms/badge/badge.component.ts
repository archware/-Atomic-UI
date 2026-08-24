import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';

export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';
export type BadgePosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

/**
 * BadgeComponent — Contador numérico o indicador de estado superpuesto a otro elemento.
 * Soporta modo standalone y modo overlay (anclado a un contenedor padre).
 *
 * @example — Standalone
 * ```html
 * <app-badge [count]="5" variant="danger"></app-badge>
 * ```
 *
 * @example — Overlay sobre ícono
 * ```html
 * <div class="badge-anchor">
 *   <i class="fa-solid fa-bell"></i>
 *   <app-badge [count]="12" variant="danger" [overlay]="true"></app-badge>
 * </div>
 * ```
 *
 * @example — Punto indicador (sin número)
 * ```html
 * <app-badge variant="success" [dot]="true"></app-badge>
 * ```
 */
@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule, NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      <span
        class="badge"
        [ngClass]="badgeClasses"
        [attr.aria-label]="ariaLabel() || (count() ? count() + ' notificaciones' : null)"
      >
        @if (!dot()) {
          {{ displayCount }}
        }
      </span>
    }
    @if (!visible() && overlay()) {
      <ng-content></ng-content>
    }
  `,
  styleUrl: './badge.component.css'
})
export class BadgeComponent {
  /** Number to display. Set to 0 to hide. */
  readonly count = input<number | null>(null);

  /** Maximum count to display before showing "max+" */
  readonly max = input(99);

  /** Color variant */
  readonly variant = input<BadgeVariant>('danger');

  /** Size variant */
  readonly size = input<BadgeSize>('md');

  /** Show as a small dot without number */
  readonly dot = input(false);

  /** Position absolute over parent (parent needs position:relative) */
  readonly overlay = input(false);

  /** Corner position when overlay is true */
  readonly position = input<BadgePosition>('top-right');

  /** Show or hide the badge */
  readonly visible = input(true);

  /** Custom aria-label */
  readonly ariaLabel = input('');

  get displayCount(): string {
    const count = this.count();
    if (count === null) return '';
    return count > this.max() ? `${this.max()}+` : `${count}`;
  }

  get badgeClasses(): Record<string, boolean> {
    return {
      [`badge--${this.variant()}`]: true,
      [`badge--${this.size()}`]: true,
      'badge--dot': this.dot(),
      'badge--overlay': this.overlay(),
      [`badge--${this.position()}`]: this.overlay(),
    };
  }
}
