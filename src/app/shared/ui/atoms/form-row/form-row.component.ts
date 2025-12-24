import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div 
      class="form-row-grid"
      [style.grid-template-columns]="columns"
      [style.gap]="gap"
    >
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      margin-bottom: 1.25rem;
    }

    .form-row-grid {
      display: grid;
      width: 100%;
      align-items: start;
    }

    @media (max-width: 640px) {
      .form-row-grid {
        grid-template-columns: 1fr !important;
        gap: 1.25rem !important;
      }
    }
  `]
})
export class FormRowComponent {
  /** @deprecated Use app-row variant="form" instead */
  @Input() columns = '1fr 1fr';

  /** @deprecated Use app-row variant="form" instead */
  @Input() gap = '1.25rem';
}
