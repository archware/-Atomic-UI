import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="divider" role="separator">
      @if (text) {
        <span class="divider-text">{{ text }}</span>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      margin: var(--space-6) 0;
    }

    .divider {
      display: flex;
      align-items: center;
      width: 100%;
      color: var(--border-color);
    }

    .divider::before,
    .divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background-color: currentColor;
    }

    .divider-text {
      padding: 0 var(--space-3);
      font-size: var(--text-xs);
      font-weight: 500;
      color: var(--text-color-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
  `]
})
export class DividerComponent {
  /** Optional text to display in the middle of the divider */
  @Input() text = '';
}
