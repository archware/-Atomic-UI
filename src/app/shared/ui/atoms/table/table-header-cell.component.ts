import { Component, HostBinding, HostListener, ChangeDetectionStrategy, ViewEncapsulation, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SortDirection = 'asc' | 'desc' | null;

@Component({
  selector: 'th[app-table-header-cell]',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="th-content" [class.sortable]="sortable()">
      <ng-content></ng-content>
      @if (sortable()) {
        <span class="sort-indicator" [class.active]="sortDirection() !== null">
          @if (sortDirection() === 'asc') {
            <i class="fa-solid fa-sort-up"></i>
          } @else if (sortDirection() === 'desc') {
            <i class="fa-solid fa-sort-down"></i>
          } @else {
            <i class="fa-solid fa-sort"></i>
          }
        </span>
      }
    </div>
  `,
  styleUrl: './table-header-cell.component.css'
})
export class TableHeaderCellComponent {
  readonly sortable = input(false);
  readonly sortDirection = input<SortDirection>(null);
  readonly sortChange = output<SortDirection>();

  @HostBinding('class.sortable-cell') get isSortable() {
    return this.sortable();
  }

  @HostListener('click')
  onClick() {
    if (!this.sortable()) return;

    let newDirection: SortDirection = 'asc';
    const sortDirection = this.sortDirection();
    if (sortDirection === 'asc') {
      newDirection = 'desc';
    } else if (sortDirection === 'desc') {
      newDirection = null; // Toggle off or loop back to asc? Usually asc -> desc -> null
    }

    this.sortChange.emit(newDirection);
  }
}
