import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="pagination" [class]="'pagination-' + size">
      <button type="button"
        class="page-btn page-prev"
        [disabled]="currentPage() === 1"
        (click)="goToPage(currentPage() - 1)"
        (keydown.enter)="goToPage(currentPage() - 1)"
        (keydown.space)="goToPage(currentPage() - 1)"
      >
        <i class="fa-solid fa-chevron-left"></i>
      </button>

      @for (page of visiblePages(); track page) {
        @if (page === '...') {
          <span class="page-ellipsis">...</span>
        } @else {
          <button type="button"
            class="page-btn page-number"
            [class.active]="page === currentPage()"
            (click)="goToPage(+page)"
            (keydown.enter)="goToPage(+page)"
            (keydown.space)="goToPage(+page)"
          >
            {{ page }}
          </button>
        }
      }

      <button type="button"
        class="page-btn page-next"
        [disabled]="currentPage() === totalPages()"
        (click)="goToPage(currentPage() + 1)"
        (keydown.enter)="goToPage(currentPage() + 1)"
        (keydown.space)="goToPage(currentPage() + 1)"
      >
        <i class="fa-solid fa-chevron-right"></i>
      </button>
    </nav>
  `,
  styles: [`
    .pagination {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .page-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 2rem;
      height: 2rem;
      padding: 0 0.5rem;
      background: var(--surface-background, #ffffff);
      border: 1px solid var(--border-color, #e5e7eb);
      border-radius: 0.375rem;
      font-size: 0.875rem;
      color: var(--text-color, #1f2937);
      cursor: pointer;
      transition: all 150ms ease;
    }

    .pagination-sm .page-btn {
      min-width: 1.75rem;
      height: 1.75rem;
      font-size: 0.75rem;
    }

    .pagination-lg .page-btn {
      min-width: 2.5rem;
      height: 2.5rem;
      font-size: 1rem;
    }

    .page-btn:hover:not(:disabled):not(.active) {
      background: var(--surface-elevated, #f3f4f6);
      border-color: var(--primary-color, #793576);
    }

    .page-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .page-btn.active {
      background: var(--primary-color, #793576);
      border-color: var(--primary-color, #793576);
      color: white;
    }

    .page-ellipsis {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2rem;
      color: var(--text-color-muted, #9ca3af);
      font-size: 0.875rem;
    }

    /* Dark mode */
    :host-context(html.dark) .page-btn,
    :host-context([data-theme="dark"]) .page-btn {
      background: var(--surface-section, #1f2937);
      border-color: var(--border-color, #374151);
    }

    :host-context(html.dark) .page-btn:hover:not(:disabled):not(.active),
    :host-context([data-theme="dark"]) .page-btn:hover:not(:disabled):not(.active) {
      background: var(--surface-elevated, #374151);
      border-color: var(--primary-color-light, #bc9abb);
    }

    :host-context(html.dark) .page-btn.active,
    :host-context([data-theme="dark"]) .page-btn.active {
      background: var(--primary-color-light, #bc9abb);
      border-color: var(--primary-color-light, #bc9abb);
      color: #1f2937;
    }
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
