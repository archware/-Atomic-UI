import { Component, input, output } from '@angular/core';

export type IconButtonVariant = 'default' | 'ghost' | 'avatar';
export type IconButtonAnimation = 'rotate' | 'grow' | 'none';

@Component({
  selector: 'app-icon-button',
  standalone: true,
  imports: [],
  template: `
    <button 
      class="icon-btn"
      [class.icon-anim-rotate]="animation() === 'rotate'"
      [class.icon-anim-grow]="animation() === 'grow'"
      [class.icon-anim-none]="animation() === 'none'"
      [class.icon-btn--ghost]="variant() === 'ghost'"
      [class.icon-btn--avatar]="variant() === 'avatar'"
      [attr.title]="tooltip()"
      [attr.aria-label]="ariaLabel() || tooltip()"
      [disabled]="disabled()"
      (click)="!disabled() && clicked.emit($event)">
      <ng-content></ng-content>
      @if (badge() && badge() > 0) {
        <span class="icon-btn__badge">{{ badge() > 9 ? '9+' : badge() }}</span>
      }
    </button>
  `,
  styleUrl: './icon-button.component.css'
})
export class IconButtonComponent {
  /** Button variant */
  readonly variant = input<IconButtonVariant>('default');

  /** Hover animation for the icon */
  readonly animation = input<IconButtonAnimation>('rotate');

  /** Tooltip text */
  readonly tooltip = input('');

  /** Accessibility label */
  readonly ariaLabel = input('');

  /** Badge count (for notifications) */
  readonly badge = input(0);

  /** Disabled state */
  readonly disabled = input(false);

  /** Click event */
  readonly clicked = output<MouseEvent>();
}
