import {
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  SimpleChanges,
  signal,
  computed,
  input,
  output
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Select2Component } from '../select2/select2.component';


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
  imports: [FormsModule, Select2Component],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pagination-wrapper">
      <div class="pagination-info">
        <span class="info-text">
          Mostrando <strong>{{ ((currentPage() - 1) * _pageSize()) + 1 }}</strong> - <strong>{{ min(currentPage() * _pageSize(), _total()) }}</strong> de <strong>{{ _total() }}</strong> registros
        </span>
        <div class="page-size-selector">
          <label [for]="'pageSize' + variant()">Mostrar:</label>
          <app-select2
            class="page-size-control"
            [options]="pageSizeOptions()"
            [ngModel]="_pageSize()"
            (ngModelChange)="onPageSizeChange($event)"
            [searchable]="false">
          </app-select2>
        </div>
      </div>
      <nav class="pagination" [class]="'pagination-' + size() + ' pagination-' + variant()" aria-label="Paginación">
        @if (variant() === 'minimal') {
          <button type="button"
            class="page-btn page-text-btn"
            [disabled]="currentPage() === 1"
            (click)="goToPage(currentPage() - 1)"
            aria-label="Página anterior"
          >
            <i class="fa-solid fa-arrow-left page-icon page-icon--start" aria-hidden="true"></i> Anterior
          </button>

          <span class="page-minimal-text">
            Página <strong>{{ currentPage() }}</strong> de <strong>{{ totalPages() }}</strong>
          </span>

          <button type="button"
            class="page-btn page-text-btn"
            [disabled]="currentPage() === totalPages()"
            (click)="goToPage(currentPage() + 1)"
            aria-label="Página siguiente"
          >
            Siguiente <i class="fa-solid fa-arrow-right page-icon page-icon--end" aria-hidden="true"></i>
          </button>
        } @else {
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
        }
      </nav>
    </div>
  `,
  styleUrl: './pagination.component.css'
})
export class PaginationComponent implements OnChanges {
  readonly variant = input<'standard' | 'minimal' | 'rounded' | 'cards'>('standard');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly maxVisible = input(5);

  _total = signal(0);
  readonly total = input(0);

  _pageSize = signal(10);
  readonly pageSize = input(10);

  readonly page = input(1);
  readonly pageChange = output<number>();
  readonly pageSizeChange = output<number>();

  currentPage = signal(1);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['total']) {
      this._total.set(this.total());
    }
    if (changes['pageSize']) {
      this._pageSize.set(this.pageSize());
    }
    if (changes['page']) {
      this.currentPage.set(this.page());
    }
  }

  totalPages = computed(() => Math.ceil(this._total() / this._pageSize()) || 1);

  visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const max = this.maxVisible();
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

  pageSizeOptions = computed(() => [
    { value: 10, label: '10' },
    { value: 20, label: '20' },
    { value: 50, label: '50' },
    { value: 100, label: '100' },
    { value: 500, label: '500' }
  ]);

  onPageSizeChange(newSize: number | string) {
    const size = typeof newSize === 'string' ? parseInt(newSize, 10) : newSize;
    this._pageSize.set(size);
    this.pageSizeChange.emit(size);
  }

  min(a: number, b: number): number {
    return Math.min(a, b);
  }
}
