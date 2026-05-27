import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
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
 * <div style="position:relative; display:inline-block;">
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
    <span
      class="badge"
      [ngClass]="badgeClasses"
      [attr.aria-label]="ariaLabel || (count ? count + ' notificaciones' : null)"
    >
      @if (!dot) {
        {{ displayCount }}
      }
    </span>
  `,
  styles: [`
    :host { display: inline-flex; }

    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      line-height: 1;
      border-radius: var(--radius-full, 9999px);
      white-space: nowrap;
      font-size: var(--text-xs);
      min-width: 1.25rem;
      height: 1.25rem;
      padding: 0 var(--space-1-5, 0.375rem);
    }

    /* Sizes */
    .badge--sm { font-size: 0.625rem; min-width: 1rem; height: 1rem; padding: 0 var(--space-1); }
    .badge--md { font-size: var(--text-xs); min-width: 1.25rem; height: 1.25rem; }
    .badge--lg { font-size: var(--text-sm); min-width: 1.5rem; height: 1.5rem; padding: 0 var(--space-2); }

    /* Dot variant */
    .badge--dot { min-width: 0.5rem; height: 0.5rem; padding: 0; border-radius: 50%; }
    .badge--dot.badge--sm { min-width: 0.375rem; height: 0.375rem; }
    .badge--dot.badge--lg { min-width: 0.75rem; height: 0.75rem; }

    /* Overlay positioning */
    .badge--overlay {
      position: absolute;
      z-index: 1;
      border: 2px solid var(--surface-background, white);
    }
    .badge--top-right  { top: -0.25rem; right: -0.25rem; transform: translate(25%, -25%); }
    .badge--top-left   { top: -0.25rem; left: -0.25rem;  transform: translate(-25%, -25%); }
    .badge--bottom-right { bottom: -0.25rem; right: -0.25rem; transform: translate(25%, 25%); }
    .badge--bottom-left  { bottom: -0.25rem; left: -0.25rem;  transform: translate(-25%, 25%); }

    /* Variants */
    .badge--default   { background: var(--surface-section); color: var(--text-color-secondary); }
    .badge--primary   { background: var(--primary-color); color: white; }
    .badge--secondary { background: var(--secondary-color); color: white; }
    .badge--success   { background: var(--success-color); color: white; }
    .badge--warning   { background: var(--warning-color); color: white; }
    .badge--danger    { background: var(--danger-color); color: white; }
    .badge--info      { background: var(--info-color, #3b82f6); color: white; }
  `]
})
export class BadgeComponent {
  /** Number to display. Set to 0 to hide. */
  @Input() count: number | null = null;

  /** Maximum count to display before showing "max+" */
  @Input() max = 99;

  /** Color variant */
  @Input() variant: BadgeVariant = 'danger';

  /** Size variant */
  @Input() size: BadgeSize = 'md';

  /** Show as a small dot without number */
  @Input() dot = false;

  /** Position absolute over parent (parent needs position:relative) */
  @Input() overlay = false;

  /** Corner position when overlay is true */
  @Input() position: BadgePosition = 'top-right';

  /** Custom aria-label */
  @Input() ariaLabel = '';

  get displayCount(): string {
    if (this.count === null) return '';
    return this.count > this.max ? `${this.max}+` : `${this.count}`;
  }

  get badgeClasses(): Record<string, boolean> {
    return {
      [`badge--${this.variant}`]: true,
      [`badge--${this.size}`]: true,
      'badge--dot': this.dot,
      'badge--overlay': this.overlay,
      [`badge--${this.position}`]: this.overlay,
    };
  }
}
