import { Component, Input, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'tr[app-table-row]',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content></ng-content>`,
  styles: [`
    tr[app-table-row] {
      border-bottom: 1px solid var(--rtc-color-border-light);
      transition: 
        background-color var(--rtc-transition-duration) var(--rtc-transition-timing),
        box-shadow var(--rtc-transition-duration) var(--rtc-transition-timing),
        transform var(--rtc-transition-duration) var(--rtc-transition-timing);
      position: relative;
    }

    tr[app-table-row]:last-child {
      border-bottom: none;
    }

    /* Hover elevado - tokens RTC */
    tr[app-table-row]:hover {
      background-color: var(--rtc-color-row-hover);
      box-shadow: var(--rtc-row-hover-shadow);
      transform: var(--rtc-row-hover-transform);
      z-index: 1;
    }

    tr[app-table-row].selected {
      background-color: var(--primary-50);
    }

    /* Asegurar que las celdas mantengan el efecto visual */
    tr[app-table-row]:hover td {
      position: relative;
    }
  `]
})
export class TableRowComponent {
  @Input() selected = false;
}
