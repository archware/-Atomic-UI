import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Layout component specifically designed for arranging form fields in a grid.
 * Repalces legacy .form-row CSS class with a robust CSS Grid implementation.
 * 
 * @example
 * ```html
 * <!-- Two columns (default) -->
 * <app-form-row>
 *   <app-floating-input ...></app-floating-input>
 *   <app-floating-input ...></app-floating-input>
 * </app-form-row>
 * 
 * <!-- Three columns -->
 * <app-form-row columns="1fr 1fr 1fr">
 *   ...
 * </app-form-row>
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
      margin-bottom: 1.25rem; /* Standard form group spacing */
    }

    .form-row-grid {
      display: grid;
      width: 100%;
      align-items: start; /* Align fields to top to handle validation message expansion safely */
    }

    /* Responsive: Stack on mobile */
    @media (max-width: 640px) {
      .form-row-grid {
        grid-template-columns: 1fr !important;
        gap: 1.25rem !important;
      }
    }
  `]
})
export class FormRowComponent {
  /** 
   * CSS Grid template columns.
   * @default '1fr 1fr' (Two equal columns)
   */
  @Input() columns: string = '1fr 1fr';

  /** 
   * Gap between fields.
   * Matches standard form spacing (1.25rem = 20px).
   */
  @Input() gap: string = '1.25rem';
}
