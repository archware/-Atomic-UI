import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Pagination component for navigating through pages of data.
 * 
 * @example
 * ```html
 * <app-pagination 
 *   [total]="100" 
 *   [pageSize]="10" 
 *   [page]="currentPage"
 *   (pageChange)="onPageChange($event)">
 * </app-pagination>
 * ```
 */
@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="pagination" [class]="'pagination-' + size" aria-label="Paginación">
      <button type="button"
        class="page-btn page-prev"
        [disabled]="currentPage() === 1"
        (click)="goToPage(currentPage() - 1)"
        aria-label="Página anterior"
      >
        <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
      </button>

      @for (page of visiblePages(); track page) {
        @if (page === '...') {
          <span class="page-ellipsis" aria-hidden="true">...</span>
        } @else {
          <button type="button"
            class="page-btn page-number"
            [class.active]="page === currentPage()"
            [attr.aria-current]="page === currentPage() ? 'page' : null"
            [attr.aria-label]="'Página ' + page"
            (click)="goToPage(+page)"
          >
            {{ page }}
          </button>
        }
      }

      <button type="button"
        class="page-btn page-next"
        [disabled]="currentPage() === totalPages()"
        (click)="goToPage(currentPage() + 1)"
        aria-label="Página siguiente"
      >
        <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
      </button>
    </nav>
  `,
  styles: [`
    .pagination {
      display: flex;
      align-items: center;
      gap: var(--space-1);
    }

    .page-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: var(--control-height-sm);
      height: var(--control-height-sm);
      padding: 0 var(--space-2);
      background: var(--surface-background);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      font-size: var(--text-sm);
      color: var(--text-color);
      cursor: pointer;
      transition: all 150ms ease;
    }

    .pagination-sm .page-btn {
      min-width: 1.75rem;
      height: 1.75rem;
      font-size: var(--text-xs);
    }

    .pagination-lg .page-btn {
      min-width: 2.5rem;
      height: 2.5rem;
      font-size: var(--text-md);
    }

    .page-btn:hover:not(:disabled):not(.active) {
      background: var(--surface-hover);
      border-color: var(--primary-color);
    }

    .page-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .page-btn.active {
      background: var(--primary-color);
      border-color: var(--primary-color);
      color: var(--text-color-on-primary);
    }

    .page-ellipsis {
      display: flex;
      align-items: center;
      justify-content: center;
      width: var(--control-height-sm);
      color: var(--text-color-muted);
      font-size: var(--text-sm);
    }

    /* 
     * Dark mode se maneja automáticamente via tokens semánticos.
     * --surface-background, --border-color, --primary-color, --surface-hover
     * ya tienen valores apropiados para temas oscuros.
     */
  `]
})
export class PaginationComponent {
  @Input() total = 0;
  @Input() pageSize = 10;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() maxVisible = 5;
  @Input() set page(value: number) {
    this.currentPage.set(value);
  }
  @Output() pageChange = new EventEmitter<number>();

  currentPage = signal(1);

  totalPages = computed(() => Math.ceil(this.total / this.pageSize) || 1);

  visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const max = this.maxVisible;
    const pages: (number | string)[] = [];

    if (total <= max) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      const half = Math.floor(max / 2);
      let start = Math.max(1, current - half);
      const end = Math.min(total, start + max - 1);

      if (end - start < max - 1) {
        start = Math.max(1, end - max + 1);
      }

      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push('...');
      }

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== total) pages.push(i);
      }

      if (end < total) {
        if (end < total - 1) pages.push('...');
        pages.push(total);
      }
    }

    return pages;
  });

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
      this.currentPage.set(page);
      this.pageChange.emit(page);
    }
  }
}
