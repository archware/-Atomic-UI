import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TextComponent } from '../../atoms/text/text.component';
import { IconButtonComponent } from '../../atoms/icon-button/icon-button.component';
import { Select2Component } from '../../molecules/select2/select2.component';

@Component({
  selector: 'app-data-pager',
  standalone: true,
  imports: [FormsModule, TextComponent, IconButtonComponent, Select2Component],
  styleUrl: './data-pager.component.css',
    templateUrl: './data-pager.component.html'
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
