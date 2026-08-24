import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { VariablesCssDirective } from '../../directives/variables-css.directive';

/**
 * @deprecated Use `<app-row variant="form">` instead.
 * This component will be removed in a future version.
 * 
 * Migration:
 * ```html
 * <!-- Before -->
 * <app-form-row columns="1fr 1fr 1fr">...</app-form-row>
 * 
 * <!-- After -->
 * <app-row variant="form" columns="1fr 1fr 1fr">...</app-row>
 * ```
 */
@Component({
  selector: 'app-form-row',
  standalone: true,
  imports: [VariablesCssDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div 
      class="form-row-grid"
      [appVariablesCss]="{
        '--form-row-columns': columns(),
        '--form-row-gap': gap()
      }"
    >
      <ng-content></ng-content>
    </div>
  `,
  styleUrl: './form-row.component.css'
})
export class FormRowComponent {
  /** @deprecated Use app-row variant="form" instead */
  readonly columns = input('1fr 1fr');

  /** @deprecated Use app-row variant="form" instead */
  readonly gap = input('var(--space-7)'); /* 3var(--space-2) horizontal */
}
