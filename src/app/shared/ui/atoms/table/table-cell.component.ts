import { Component, Input, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'td[app-table-cell], th[app-table-header-cell]',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content></ng-content>`,
  styles: [`
    td[app-table-cell], th[app-table-header-cell] {
      padding: var(--space-3) var(--space-4);
      vertical-align: middle;
      color: var(--text-color);
      font-size: 0.875rem;
    }

    th[app-table-header-cell] {
      text-align: left;
      font-weight: 600;
    }
    
    td[app-table-cell].align-center, th[app-table-header-cell].align-center {
      text-align: center;
    }
    
    td[app-table-cell].align-right, th[app-table-header-cell].align-right {
      text-align: right;
    }
  `]
})
export class TableCellComponent {
  @Input() align: 'left' | 'center' | 'right' = 'left';
}
