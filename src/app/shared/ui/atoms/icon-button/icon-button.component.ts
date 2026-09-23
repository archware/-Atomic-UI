import { Component, input, output } from '@angular/core';

export type IconButtonVariant = 'default' | 'ghost' | 'avatar' | 'close';
export type IconButtonAnimation = 'rotate' | 'grow' | 'none' | 'custom';

@Component({
  selector: 'app-icon-button',
  standalone: true,
  imports: [],
  templateUrl: './icon-button.component.html',
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
