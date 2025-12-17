import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

/**
 * Available chip color variants.
 * @remarks Maps to semantic colors from the design system.
 */
export type ChipVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outline';

/** Chip size options */
export type ChipSize = 'sm' | 'md' | 'lg';

/**
 * Chip/Tag component for displaying status, categories, or labels.
 * Supports interactive behavior (clickable) and removal functionality.
 * 
 * @example
 * ```html
 * <!-- Basic status chip -->
 * <app-chip variant="success">Active</app-chip>
 * 
 * <!-- Removable chip -->
 * <app-chip variant="primary" [removable]="true" (remove)="onRemove()">
 *   Tag Name
 * </app-chip>
 * 
 * <!-- Clickable chip -->
 * <app-chip variant="outline" [clickable]="true" (chipClick)="onSelect()">
 *   Filter Option
 * </app-chip>
 * ```
 * 
 * @see {@link ChipVariant} for available color variants
 */
@Component({
  selector: 'app-chip',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span 
      class="chip"
      [class]="'chip-' + variant + ' chip-' + size"
      [class.chip-interactive]="clickable"
      [class.chip-selected]="selected"
      (click)="onClick()"
      (keydown.enter)="onClick()"
      (keydown.space)="onClick()"
      [attr.role]="clickable ? 'button' : null"
      [attr.tabindex]="clickable ? 0 : null"
    >
      @if (icon) {
        <span class="chip-icon">{{ icon }}</span>
      }
      <span class="chip-label"><ng-content></ng-content></span>
      @if (removable) {
        <button type="button"
          class="chip-remove" 
          (click)="onRemove($event)"
          (keydown.enter)="onRemove($event)"
          (keydown.space)="onRemove($event)"
          aria-label="Eliminar"
        >×</button>
      }
    </span>
  `,
  styles: [`
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.25rem 0.625rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
      transition: all 150ms ease;
      border: 1px solid transparent;
    }

    .chip-sm { padding: 0.125rem 0.5rem; font-size: 0.6875rem; }
    .chip-md { padding: 0.25rem 0.625rem; font-size: 0.75rem; }
    .chip-lg { padding: 0.375rem 0.75rem; font-size: 0.8125rem; }

    .chip-default {
      background: var(--surface-elevated);
      color: var(--text-color);
    }

    .chip-primary {
      background: var(--primary-color-lighter);
      color: var(--primary-color);
    }

    .chip-secondary {
      background: var(--secondary-color-lighter);
      color: var(--secondary-color);
    }

    .chip-success {
      background: var(--success-color-lighter);
      color: var(--success-color);
    }

    .chip-warning {
      background: var(--warning-color-lighter);
      color: var(--warning-color);
    }

    .chip-error {
      background: var(--danger-color-lighter);
      color: var(--danger-color);
    }

    .chip-info {
      background: var(--info-color-lighter);
      color: var(--info-color);
    }

    .chip-outline {
      background: transparent;
      border-color: var(--border-color);
      color: var(--text-color);
    }

    .chip-interactive {
      cursor: pointer;
    }

    .chip-interactive:hover {
      filter: brightness(0.95);
    }

    .chip-interactive:focus {
      outline: none;
      box-shadow: var(--focus-ring);
    }

    .chip-selected {
      background: var(--primary-color);
      color: white;
    }

    .chip-icon {
      font-size: 0.875rem;
    }

    .chip-remove {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 1rem;
      height: 1rem;
      margin-left: 0.125rem;
      padding: 0;
      background: none;
      border: none;
      border-radius: 50%;
      font-size: 0.875rem;
      color: currentColor;
      opacity: 0.7;
      cursor: pointer;
      transition: all 100ms ease;
    }

    .chip-remove:hover {
      opacity: 1;
      background: rgba(0, 0, 0, 0.1);
    }

    /* Dark mode overrides handled by semantic tokens */

  `]
})
export class ChipComponent {
  @Input() variant: ChipVariant = 'default';
  @Input() size: ChipSize = 'md';
  @Input() icon?: string;
  @Input() removable = false;
  @Input() clickable = false;
  @Input() selected = false;

  @Output() chipClick = new EventEmitter<void>();
  @Output() remove = new EventEmitter<void>();

  onClick() {
    if (this.clickable) {
      this.chipClick.emit();
    }
  }

  onRemove(event: Event) {
    event.stopPropagation();
    this.remove.emit();
  }
}
