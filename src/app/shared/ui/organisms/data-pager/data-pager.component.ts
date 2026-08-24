import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TextComponent } from '../../atoms/text/text.component';
import { IconButtonComponent } from '../../atoms/icon-button/icon-button.component';
import { Select2Component } from '../../molecules/select2/select2.component';

@Component({
  selector: 'app-data-pager',
  standalone: true,
  imports: [FormsModule, TextComponent, IconButtonComponent, Select2Component],
  template: `
    <div class="data-pager-container">
      <!-- Left: Page size & Total -->
      <div class="pager-group pager-left">
        <div class="pager-page-size-group">
          <app-text variant="body-sm" color="muted" weight="semibold">Registros por página:</app-text>
          <div class="page-size-select-wrapper">
            <app-select2 
              [options]="selectOptions()" 
              [ngModel]="pageSize()"
              (ngModelChange)="onPageSizeChange($event)"
              [searchable]="false">
            </app-select2>
          </div>
        </div>

        <app-text variant="body-sm" color="muted" weight="semibold">Total de registros: {{ total() }}</app-text>
      </div>

      <!-- Right: Pagination Controls -->
      <div class="pager-group pager-right">
        <app-text variant="body-sm" color="muted" weight="semibold">Página {{ page() }} de {{ totalPages() }}</app-text>

        <div class="pager-controls">
          <app-icon-button 
            size="sm" 
            variant="ghost" 
            [disabled]="page() === 1"
            (clicked)="goToPage(1)"
            title="Primera página"
          >
            <i class="fa-solid fa-angles-left"></i>
          </app-icon-button>

          <app-icon-button 
            size="sm" 
            variant="ghost" 
            [disabled]="page() === 1"
            (clicked)="goToPage(page() - 1)"
            title="Página anterior"
          >
            <i class="fa-solid fa-angle-left"></i>
          </app-icon-button>

          <app-icon-button 
            size="sm" 
            variant="ghost" 
            [disabled]="page() === totalPages()"
            (clicked)="goToPage(page() + 1)"
            title="Página siguiente"
          >
            <i class="fa-solid fa-angle-right"></i>
          </app-icon-button>

          <app-icon-button 
            size="sm" 
            variant="ghost" 
            [disabled]="page() === totalPages()"
            (clicked)="goToPage(totalPages())"
            title="Última página"
          >
            <i class="fa-solid fa-angles-right"></i>
          </app-icon-button>
        </div>
      </div>
    </div>
  `,
  styleUrl: './data-pager.component.css'
})
export class DataPagerComponent {
  readonly total = input(0);
  readonly page = input(1);
  readonly pageSize = input(10);
  readonly pageSizeOptions = input([5, 10, 20, 50]);

  readonly pageChange = output<number>();
  readonly pageSizeChange = output<number>();

  selectOptions(): {value: number, label: string}[] {
    return this.pageSizeOptions().map(size => ({
      value: size,
      label: size.toString()
    }));
  }

  totalPages(): number {
    return Math.max(1, Math.ceil(this.total() / this.pageSize()));
  }

  goToPage(p: number): void {
    if (p >= 1 && p <= this.totalPages() && p !== this.page()) {
      this.pageChange.emit(p);
    }
  }

  onPageSizeChange(newSize: number | string): void {
    const size = typeof newSize === 'string' ? parseInt(newSize, 10) : newSize;
    if (size !== this.pageSize()) {
      this.pageSizeChange.emit(size);
    }
  }
}
