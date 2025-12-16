import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type IconButtonVariant = 'default' | 'ghost' | 'avatar';

@Component({
  selector: 'app-icon-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      class="icon-btn"
      [class.icon-btn--ghost]="variant === 'ghost'"
      [class.icon-btn--avatar]="variant === 'avatar'"
      [attr.title]="tooltip"
      [attr.aria-label]="ariaLabel || tooltip"
      (click)="clicked.emit($event)">
      <ng-content></ng-content>
      @if (badge && badge > 0) {
        <span class="icon-btn__badge">{{ badge > 9 ? '9+' : badge }}</span>
      }
    </button>
  `,
  styles: [`
    :host {
      display: inline-block;
    }

    .icon-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: var(--control-height);
      height: var(--control-height);
      padding: 0;
      background: transparent;
      border: none;
      border-radius: 0.5rem;
      color: var(--text-color-secondary);
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
    }

    .icon-btn:hover {
      background: var(--surface-section);
      color: var(--primary-color);
    }

    .icon-btn:active {
      transform: scale(0.95);
    }

    /* Ghost variant - más sutil */
    .icon-btn--ghost:hover {
      background: transparent;
      color: var(--primary-color);
    }

    /* Avatar variant - circular con gradiente */
    .icon-btn--avatar {
      background: linear-gradient(135deg, var(--primary-color), var(--primary-color-dark));
      border-radius: 50%;
      color: white;
    }

    .icon-btn--avatar:hover {
      background: linear-gradient(135deg, var(--primary-color-dark), var(--primary-color));
      transform: scale(1.05);
      box-shadow: 0 2px 8px rgba(121, 53, 118, 0.3);
    }

    /* Badge */
    .icon-btn__badge {
      position: absolute;
      top: 2px;
      right: 2px;
      min-width: 16px;
      height: 16px;
      padding: 0 4px;
      font-size: 0.625rem;
      font-weight: 600;
      color: white;
      background: var(--danger-color);
      border-radius: 9999px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* SVG icons inside */
    ::ng-deep svg {
      width: 20px;
      height: 20px;
    }

    :host-context(.dark) .icon-btn,
    :host-context([data-theme="dark"]) .icon-btn {
      color: var(--text-color-secondary);
    }

    :host-context(.dark) .icon-btn:hover,
    :host-context([data-theme="dark"]) .icon-btn:hover {
      background: var(--surface-elevated);
      color: var(--primary-color-light);
    }

    :host-context(.dark) .icon-btn--avatar,
    :host-context([data-theme="dark"]) .icon-btn--avatar {
      background: linear-gradient(135deg, var(--primary-color-light), var(--primary-color));
    }

    :host-context(.dark) .icon-btn--avatar:hover,
    :host-context([data-theme="dark"]) .icon-btn--avatar:hover {
      box-shadow: 0 2px 8px rgba(188, 154, 187, 0.3);
    }
  `]
})
export class IconButtonComponent {
  /** Button variant */
  @Input() variant: IconButtonVariant = 'default';

  /** Tooltip text */
  @Input() tooltip = '';

  /** Accessibility label */
  @Input() ariaLabel = '';

  /** Badge count (for notifications) */
  @Input() badge = 0;

  /** Click event */
  @Output() clicked = new EventEmitter<MouseEvent>();
}
