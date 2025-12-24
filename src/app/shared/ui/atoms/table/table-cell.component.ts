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
      /* Usando tokens RTC */
      padding: var(--rtc-cell-padding);
      vertical-align: middle;
      color: var(--rtc-color-text);
      font-size: var(--rtc-font-size-base);
    }

    th[app-table-header-cell] {
      text-align: left;
      font-weight: var(--rtc-font-weight-header);
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
