import { Component, ChangeDetectionStrategy, input } from '@angular/core';


/**
 * A divider component to separate content.
 * Supports optional text in the center.
 *
 * @example
 * ```html
 * <!-- Simple line -->
 * <app-divider></app-divider>
 *
 * <!-- With text -->
 * <app-divider text="OR"></app-divider>
 * ```
 */
@Component({
  selector: 'app-divider',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="divider"
         [class.divider--vertical]="orientation() === 'vertical'"
         [class.divider--light]="variant() === 'light'"
         [class.divider--strong]="variant() === 'strong'"
         [class.divider--dashed]="variant() === 'dashed'"
         role="separator">
      @if (label() || text()) {
        <span class="divider-text">{{ label() || text() }}</span>
      }
    </div>
  `,
  styleUrl: './divider.component.css'
})
export class DividerComponent {
  /** Optional text to display in the middle of the divider */
  readonly text = input('');
  /** Label text to display in the middle (alias for text) */
  readonly label = input('');
  /** Visual style of the divider */
  readonly variant = input<'default' | 'light' | 'strong' | 'dashed'>('default');
  /** Orientation of the divider */
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
}
