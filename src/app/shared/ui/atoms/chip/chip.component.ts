import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';

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
      [class]="'chip-' + variant() + ' chip-' + size()"
      [class.chip-interactive]="clickable()"
      [class.chip-selected]="selected()"
      (click)="onClick()"
      (keydown.enter)="onClick()"
      (keydown.space)="onClick()"
      [attr.role]="clickable() ? 'button' : null"
      [attr.tabindex]="clickable() ? 0 : null"
    >
      @if (icon()) {
        <span class="chip-icon">{{ icon() }}</span>
      }
      <span class="chip-label"><ng-content></ng-content></span>
      @if (removable()) {
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
  styleUrl: './chip.component.css'
})
export class ChipComponent {
  readonly variant = input<ChipVariant>('default');
  readonly size = input<ChipSize>('md');
  readonly icon = input<string>();
  readonly removable = input(false);
  readonly clickable = input(false);
  readonly selected = input(false);

  readonly chipClick = output<void>();
  readonly remove = output<void>();

  onClick() {
    if (this.clickable()) {
      this.chipClick.emit();
    }
  }

  onRemove(event: Event) {
    event.stopPropagation();
    this.remove.emit();
  }
}
