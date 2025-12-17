import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

/** 
 * Available button color variants.
 * @remarks Each variant applies different colors from the design system.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline' | 'ghost' | 'link';

/** Button size options */
export type ButtonSize = 'sm' | 'md' | 'lg';

/** Icon position relative to button text */
export type IconPosition = 'left' | 'right' | 'none';

/**
 * Reusable button component with multiple variants, sizes, and icon support.
 * 
 * @example
 * ```html
 * <!-- Basic usage -->
 * <app-button variant="primary" (onClick)="handleClick()">
 *   Save
 * </app-button>
 * 
 * <!-- With emoji icon -->
 * <app-button variant="success" icon="✓" iconPosition="left">
 *   Confirm
 * </app-button>
 * 
 * <!-- With custom SVG icon -->
 * <app-button variant="danger">
 *   <svg icon-left>...</svg>
 *   Delete
 * </app-button>
 * ```
 * 
 * @see {@link ButtonVariant} for available color variants
 * @see {@link ButtonSize} for available sizes
 */
@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      [type]="type"
      [disabled]="disabled"
      [class]="buttonClasses"
      (click)="onClick.emit($event)"
    >
      <!-- Custom Icon Link (Left) -->
      <span class="btn-icon-wrapper btn-icon-wrapper--left">
        <ng-content select="[icon-left]"></ng-content>
      </span>
      
      <!-- Configurable Icon (Left) -->
      @if (iconPosition === 'left') {
        @if (icon) {
          <span class="btn-icon-wrapper btn-icon-wrapper--left btn-icon--emoji">{{ icon }}</span>
        } @else if (iconClass) {
          <span class="btn-icon-wrapper btn-icon-wrapper--left"><i [class]="iconClass"></i></span>
        }
      }
      
      <!-- Button Content -->
      <ng-content></ng-content>
      
      <!-- Configurable Icon (Right) -->
      @if (iconPosition === 'right') {
        @if (icon) {
          <span class="btn-icon-wrapper btn-icon-wrapper--right btn-icon--emoji">{{ icon }}</span>
        } @else if (iconClass) {
          <span class="btn-icon-wrapper btn-icon-wrapper--right"><i [class]="iconClass"></i></span>
        }
      }
      
      <!-- Custom Icon Link (Right) -->
      <span class="btn-icon-wrapper btn-icon-wrapper--right">
        <ng-content select="[icon-right]"></ng-content>
      </span>
    </button>
  `,
  styles: [`
    :host {
      display: block;
    }

    /* Use inline-block when explicitly needed */
    :host(.inline) {
      display: inline-block;
    }

    /* Allow button to control its own dimensions when in grid */
    :host(.auto-size) {
      display: contents;
    }

    .btn-icon-wrapper {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: var(--icon-sm); /* 16px */
    }

    /* Hide empty slot containers */
    .btn-icon-wrapper:not(:has(*)) {
      display: none;
    }

    /* Apply margin only when slot has content */
    .btn-icon-wrapper--left:has(*) {
      margin-right: 0.5rem;
    }

    .btn-icon-wrapper--right:has(*) {
      margin-left: 0.5rem;
    }

    /* Size-specific icon adjustments */
    :host-context(.btn-sm) .btn-icon-wrapper {
      font-size: var(--icon-xs); /* 12px */
    }

    :host-context(.btn-lg) .btn-icon-wrapper {
      font-size: var(--icon-md); /* 24px */
    }
  `]
})
export class ButtonComponent {
  /** 
   * HTML button type attribute.
   * @default 'button'
   */
  @Input() type: 'button' | 'submit' | 'reset' = 'button';

  /** 
   * Visual style variant of the button.
   * @default 'primary'
   */
  @Input() variant: ButtonVariant = 'primary';

  /** 
   * Size of the button.
   * @default 'md'
   */
  @Input() size: ButtonSize = 'md';

  /** 
   * Emoji or text icon to display.
   * For custom icons (SVG, FontAwesome), use content projection with `icon-left` or `icon-right` attribute.
   */
  @Input() icon: string = '';

  /** 
   * CSS class for font icons (e.g. 'fa-solid fa-save').
   * Use this for font icons instead of content projection.
   */
  @Input() iconClass: string = '';

  /** 
   * Position of the emoji/text icon.
   * @default 'left'
   */
  @Input() iconPosition: IconPosition = 'left';

  /** 
   * Whether the button is disabled.
   * @default false
   */
  @Input() disabled: boolean = false;

  /** 
   * Emits when the button is clicked.
   * Does not emit when disabled.
   */
  @Output() onClick = new EventEmitter<MouseEvent>();

  /** @internal */
  get buttonClasses(): string {
    const classes = ['btn', `btn-${this.variant}`];

    if (this.size !== 'md') {
      classes.push(`btn-${this.size}`);
    }

    return classes.join(' ');
  }
}
