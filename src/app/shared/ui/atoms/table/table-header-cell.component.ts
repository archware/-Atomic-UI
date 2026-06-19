import { Component, Input, Output, EventEmitter, HostBinding, HostListener, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SortDirection = 'asc' | 'desc' | null;

@Component({
  selector: 'th[app-table-header-cell]',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="th-content" [class.sortable]="sortable">
      <ng-content></ng-content>
      @if (sortable) {
        <span class="sort-indicator" [class.active]="sortDirection !== null">
          @if (sortDirection === 'asc') {
            <i class="fa-solid fa-sort-up"></i>
          } @else if (sortDirection === 'desc') {
            <i class="fa-solid fa-sort-down"></i>
          } @else {
            <i class="fa-solid fa-sort"></i>
          }
        </span>
      }
    </div>
  `,
  styles: [`
    th[app-table-header-cell] {
      /* Estilos base heredados de table-head.component.ts */
    }

    th[app-table-header-cell].sortable-cell {
      cursor: pointer;
      user-select: none;
      transition: background-color 0.2s ease, color 0.2s ease;
    }

    th[app-table-header-cell].sortable-cell:hover {
      background-color: var(--hover-background-subtle, rgba(255, 255, 255, 0.05));
    }

    .th-content {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .sort-indicator {
      font-size: 0.85em;
      opacity: 0.3;
      transition: opacity 0.2s ease, transform 0.2s ease, color 0.2s ease;
      color: var(--text-color-muted, #9ca3af);
    }

    .sort-indicator.active {
      opacity: 1;
      color: var(--primary-color, #3b82f6);
    }

    th[app-table-header-cell].sortable-cell:hover .sort-indicator {
      opacity: 0.8;
      transform: scale(1.1);
    }
    
    th[app-table-header-cell].sortable-cell:hover .sort-indicator.active {
      opacity: 1;
    }
  `]
})
export class TableHeaderCellComponent {
  @Input() sortable = false;
  @Input() sortDirection: SortDirection = null;
  @Output() sortChange = new EventEmitter<SortDirection>();

  @HostBinding('class.sortable-cell') get isSortable() {
    return this.sortable;
  }

  @HostListener('click')
  onClick() {
    if (!this.sortable) return;
    
    let newDirection: SortDirection = 'asc';
    if (this.sortDirection === 'asc') {
      newDirection = 'desc';
    } else if (this.sortDirection === 'desc') {
      newDirection = null; // Toggle off or loop back to asc? Usually asc -> desc -> null
    }

    this.sortChange.emit(newDirection);
  }
}
