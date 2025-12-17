import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'tr[app-table-row]',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  template: `<ng-content></ng-content>`,
  styles: [`
    tr[app-table-row] {
      border-bottom: 1px solid var(--border-color);
      transition: background-color 0.15s ease;
    }

    tr[app-table-row]:last-child {
      border-bottom: none;
    }

    tr[app-table-row]:hover {
      background-color: var(--surface-hover);
    }

    tr[app-table-row].selected {
      background-color: var(--primary-50);
    }
  `]
})
export class TableRowComponent {
  @Input() selected = false;
}
