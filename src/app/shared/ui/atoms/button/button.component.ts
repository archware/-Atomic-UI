import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

/**
 * Available button color variants.
 * @remarks Each variant applies different colors from the design system.
 */
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'soft'
  | 'outline'
  | 'ghost'
  | 'link';

/** Semantic tone used by subtle and outlined actions. */
export type ButtonTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

/** Button size options */
export type ButtonSize = 'sm' | 'md' | 'lg';

/** Icon position relative to button text */
export type IconPosition = 'left' | 'right' | 'none';

/**
 * Reusable button component with multiple variants, sizes, and icon support.
 */
@Component({
  selector: 'app-button',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [type]="type"
      [disabled]="disabled"
      [class]="buttonClasses"
      (click)="onButtonClick($event)"
    >
      <!-- Custom Icon Link (Left) -->
      <span class="btn-icon-wrapper btn-icon-wrapper--left">
        <ng-content select="[icon-left]"></ng-content>
      </span>

      <!-- Configurable Icon (Left) -->
      @if (iconPosition === 'left') {
        @if (icon) {
          <span class="btn-icon-wrapper btn-icon-wrapper--left btn-icon--emoji">{{ icon }}</span>
        } @else if (resolvedIconClass) {
          <span class="btn-icon-wrapper btn-icon-wrapper--left"
            ><i [class]="resolvedIconClass"></i
          ></span>
        }
      }

      <!-- Button Content -->
      <ng-content></ng-content>

      <!-- Configurable Icon (Right) -->
      @if (iconPosition === 'right') {
        @if (icon) {
          <span class="btn-icon-wrapper btn-icon-wrapper--right btn-icon--emoji">{{ icon }}</span>
        } @else if (resolvedIconClass) {
          <span class="btn-icon-wrapper btn-icon-wrapper--right"
            ><i [class]="resolvedIconClass"></i
          ></span>
        }
      }

      <!-- Custom Icon Link (Right) -->
      <span class="btn-icon-wrapper btn-icon-wrapper--right">
        <ng-content select="[icon-right]"></ng-content>
      </span>
    </button>
  `,
  styles: [
    `
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

      /* Canonical FormDialog close: square, centered and icon-only. */
      :host([dialog-close]) {
        display: inline-flex;
        width: var(--control-height);
        height: var(--control-height);
      }

      :host([dialog-close]) .btn {
        width: 100%;
        min-width: 100%;
        height: 100%;
        min-height: 100%;
        padding: 0;
      }

      .btn-icon-wrapper {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: var(--icon-sm); /* 1var(--space-2) */
      }

      /* Hide empty slot containers */
      .btn-icon-wrapper:not(:has(*)) {
        display: none;
      }

      /* Apply margin only when slot has content */
      .btn-icon-wrapper--left:has(*) {
        margin-right: var(--space-2);
      }

      .btn-icon-wrapper--right:has(*) {
        margin-left: var(--space-2);
      }

      /* Size-specific icon adjustments */
      :host-context(.btn-sm) .btn-icon-wrapper {
        font-size: var(--icon-xs); /* 1var(--space-1) */
      }

      :host-context(.btn-lg) .btn-icon-wrapper {
        font-size: var(--icon-md); /* 24px */
      }
    `,
  ],
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
   * Semantic emphasis for subtle and outlined actions.
   * It does not replace the variant or communicate meaning without a label.
   * @default 'neutral'
   */
  @Input() tone: ButtonTone = 'neutral';

  /**
   * Size of the button.
   * @default 'md'
   */
  @Input() size: ButtonSize = 'md';

  /**
   * Emoji or text icon to display.
   * For custom icons (SVG, FontAwesome), use content projection with `icon-left` or `icon-right` attribute.
   */
  @Input() icon = '';

  /**
   * Font Awesome icon token or complete CSS class.
   * Accepts `save`, `fa-save` and `fa-solid fa-save` without producing
   * duplicated classes such as `fa-fa-save`.
   */
  @Input() iconClass = '';

  /** Normalized Font Awesome classes used by the template. */
  get resolvedIconClass(): string {
    return normalizeFontAwesomeIconClass(this.iconClass);
  }

  /**
   * Position of the emoji/text icon.
   * @default 'left'
   */
  @Input() iconPosition: IconPosition = 'left';

  /**
   * Whether the button is disabled.
   * @default false
   */
  @Input() disabled = false;

  /**
   * Emits when the button is clicked.
   * Does not emit when disabled.
   */
  @Output() buttonClick = new EventEmitter<MouseEvent>();

  onButtonClick(event: MouseEvent): void {
    event.stopPropagation();
    if (!this.disabled) {
      this.buttonClick.emit(event);
    }
  }

  /** @internal */
  get buttonClasses(): string {
    const classes = ['btn', `btn-${this.variant}`, `btn-tone-${this.tone}`];

    if (this.size !== 'md') {
      classes.push(`btn-${this.size}`);
    }

    return classes.join(' ');
  }
}

export function normalizeFontAwesomeIconClass(value: string | null | undefined): string {
  const normalized = value?.trim().replace(/\s+/g, ' ') ?? '';
  if (!normalized) {
    return '';
  }

  if (normalized.includes(' ')) {
    return normalized;
  }

  return normalized.startsWith('fa-') ? `fa-solid ${normalized}` : `fa-solid fa-${normalized}`;
}
