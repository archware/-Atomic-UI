import { NgTemplateOutlet } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  TemplateRef,
  computed,
  contentChild,
  inject,
  input,
  linkedSignal,
  output,
  signal,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Alert } from '../../molecules/alert/alert.component';
import {
  ChipComponent,
  ChipVariant,
} from '../../atoms/chip/chip.component';
import { ScrollOverlayComponent } from '../scroll-overlay/scroll-overlay.component';
import { VariablesCssDirective } from '../../directives/variables-css.directive';
import { Select2Component, Select2Option } from '../../molecules/select2/select2.component';
import { FormsModule } from '@angular/forms';

export type DataTableAlignment = 'start' | 'center' | 'end';
export type DataTableDensity = 'comfortable' | 'compact';
export type DataTablePaginationMode = 'none' | 'client' | 'server';
export type DataTableStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error';
export type DataTableSortDirection = 'asc' | 'desc' | null;

export interface DataTableColumn<T extends object = Record<string, unknown>> {
  readonly key: Extract<keyof T, string>;
  readonly header: string;
  readonly sortable?: boolean;
  readonly align?: DataTableAlignment;
  readonly width?: string;
  readonly isTag?: boolean;
  readonly tagVariant?: (row: T) => ChipVariant;
  readonly value?: (row: T) => unknown;
  readonly format?: (value: unknown, row: T) => string;
  readonly sortValue?: (row: T) => unknown;
  readonly compare?: (left: T, right: T) => number;
}

export interface DataTableSortChange<T extends object = Record<string, unknown>> {
  readonly key: Extract<keyof T, string>;
  readonly direction: DataTableSortDirection;
}

export interface DataTableActionContext<T extends object = Record<string, unknown>> {
  readonly $implicit: T;
  readonly row: T;
  readonly index: number;
}

export type DataTableTrackBy<T extends object = Record<string, unknown>> = (
  index: number,
  row: T,
) => unknown;

interface ActiveSort<T extends object> {
  readonly key: Extract<keyof T, string>;
  readonly direction: Exclude<DataTableSortDirection, null>;
}

interface IndexedRow<T extends object> {
  readonly row: T;
  readonly originalIndex: number;
}

function trackByIdentity<T extends object>(_index: number, row: T): T {
  return row;
}

@Component({
  selector: 'app-data-table, prest-data-table',
  imports: [
    Alert,
    NgTemplateOutlet,
    ScrollOverlayComponent,
    ChipComponent,
    VariablesCssDirective,
    Select2Component,
    FormsModule,
    TranslatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss',
})
export class DataTable<T extends object = Record<string, unknown>> implements AfterViewInit, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  readonly columns = input.required<readonly DataTableColumn<T>[]>();
  readonly rows = input.required<readonly T[]>();
  readonly caption = input.required<string>();
  readonly captionVisible = input(false);
  readonly density = input<DataTableDensity>('comfortable');
  readonly status = input<DataTableStatus>('success');
  readonly loadingMessage = input('Cargando información…');
  readonly idleMessage = input('Aún no se ha cargado información.');
  readonly emptyMessage = input('No hay información para mostrar.');
  readonly errorMessage = input('No fue posible cargar la información.');
  readonly retryLabel = input('Reintentar');
  readonly actionsHeader = input('Acciones');
  readonly actionsWidth = input('12rem');
  readonly emptyValue = input('—');
  readonly trackBy = input<DataTableTrackBy<T>>(trackByIdentity);
  readonly showRowNumber = input(true);
  readonly rowNumberHeader = input('N.º');
  readonly rowNumberWidth = input('4.5rem');

  // Row numbering and local pagination remain the published defaults.
  // Consumers may opt out of pagination explicitly with `none`.
  readonly pagination = input<DataTablePaginationMode>('client');
  readonly totalRecords = input<number | null>(null);
  readonly page = input(1);
  readonly pageSize = input(10);
  readonly totalPages = input(1);
  readonly pageSizeOptions = input<readonly number[]>([10, 20, 50, 100]);
  readonly hasPreviousPage = input(false);
  readonly hasNextPage = input(false);

  readonly sortChange = output<DataTableSortChange<T>>();
  readonly retry = output<void>();
  readonly pageChange = output<number>();
  readonly pageSizeChange = output<number>();

  protected readonly actionsTemplate =
    contentChild<TemplateRef<DataTableActionContext<T>>>('actions');

  private readonly activeSort = signal<ActiveSort<T> | null>(null);
  private readonly internalPage = linkedSignal(() => Math.max(this.page(), 1));
  private readonly internalPageSize = linkedSignal(() => Math.max(this.pageSize(), 1));
  private readonly collator = new Intl.Collator('es-PE', {
    numeric: true,
    sensitivity: 'base',
  });

  protected readonly usesClientPagination = computed(
    () => this.pagination() === 'client' && this.totalRecords() === null,
  );
  protected readonly paginationEnabled = computed(
    () => this.pagination() !== 'none',
  );
  protected readonly effectivePageSize = computed(() => this.internalPageSize());
  /*
    El desplegable «POR PÁGINA» tiene que poder mostrar el tamaño REALMENTE
    vigente, aunque nadie lo haya incluido en la lista de opciones.

    Sin esto, un consumidor que fije `[pageSize]="25"` con las opciones por
    omisión —10, 20, 30, 40, 50— obtiene una tabla que pagina de 25 en 25 y un
    desplegable sin ninguna opción que coincida, que queda en blanco: el
    paginador contradice a su propia tabla y el usuario no puede saber de cuánto
    está paginando.

    Se inserta ordenado, no al final, para que la escala siga leyéndose.
  */
  protected readonly effectivePageSizeOptions = computed<readonly number[]>(() => {
    const options = this.pageSizeOptions();
    const current = this.effectivePageSize();
    return options.includes(current)
      ? options
      : [...options, current].sort((first, second) => first - second);
  });
  protected readonly pageSizeSelectOptions = computed<Select2Option[]>(() => {
    return this.effectivePageSizeOptions().map((size) => ({
      value: size,
      label: String(size),
    }));
  });
  protected readonly effectiveTotalRecords = computed(
    () => this.totalRecords() ?? this.sortedRows().length,
  );
  protected readonly effectiveTotalPages = computed(() => {
    if (!this.paginationEnabled()) {
      return 1;
    }
    if (!this.usesClientPagination()) {
      return Math.max(this.totalPages(), 1);
    }
    return Math.max(
      Math.ceil(this.effectiveTotalRecords() / this.effectivePageSize()),
      1,
    );
  });
  protected readonly effectivePage = computed(() => {
    if (!this.paginationEnabled()) return 1;
    return this.usesClientPagination()
      ? Math.min(this.internalPage(), this.effectiveTotalPages())
      : this.internalPage();
  });
  protected readonly effectiveHasPreviousPage = computed(() =>
    this.usesClientPagination()
      ? this.effectivePage() > 1
      : this.hasPreviousPage(),
  );
  protected readonly effectiveHasNextPage = computed(() =>
    this.usesClientPagination()
      ? this.effectivePage() < this.effectiveTotalPages()
      : this.hasNextPage(),
  );

  protected readonly rangeStart = computed(() => {
    const total = this.effectiveTotalRecords();
    if (total === 0) return 0;
    return (this.effectivePage() - 1) * this.effectivePageSize() + 1;
  });

  protected readonly rangeEnd = computed(() => {
    const total = this.effectiveTotalRecords();
    if (total === 0) return 0;
    return Math.min(this.effectivePage() * this.effectivePageSize(), total);
  });

  protected onPageSizeSelectionChange(value: string | number): void {
    const pageSize = Number(value);
    this.internalPageSize.set(pageSize);
    if (this.usesClientPagination()) {
      this.internalPage.set(1);
      return;
    }
    this.pageSizeChange.emit(pageSize);
  }



  /*
  EL BOTON QUE SE DESHABILITA BAJO LOS DEDOS SE LLEVA EL FOCO AL <body>.

  Los dos botones se deshabilitan al llegar al extremo Y durante cada carga.
  Cuando eso pasa con el foco encima, el navegador lo descarta y quien paginaba
  con el teclado se queda sin punto de partida: el siguiente Tab empieza desde
  el principio del documento. Con tres paginas eso ocurre siempre en la ultima.

  Se traslada ANTES de emitir, porque despues el boton ya no puede recibirlo.
  Va al resumen —la barra que dice cuantos registros hay—, que es lo que la
  persona necesita leer justo despues de cambiar de pagina.
  */
  protected onPageChange(page: number): void {
    this.rescueFocusFromPager();
    const newPage = Math.min(Math.max(page, 1), this.effectiveTotalPages());
    this.internalPage.set(newPage);
    if (this.usesClientPagination()) {
      return;
    }
    this.pageChange.emit(page);
  }

  private rescueFocusFromPager(): void {
    const host = this.host.nativeElement;
    const active = host.ownerDocument.activeElement;
    if (!(active instanceof HTMLElement) || !active.classList.contains('data-table__page-btn')) {
      return;
    }
    const summary = host.querySelector<HTMLElement>('.data-table__summary');
    if (!summary) {
      return;
    }
    if (!summary.hasAttribute('tabindex')) {
      summary.setAttribute('tabindex', '-1');
    }
    summary.focus({ preventScroll: true });
  }

  protected readonly effectiveStatus = computed<DataTableStatus>(() => {
    const requestedStatus = this.status();
    if (requestedStatus === 'success' && this.sortedRows().length === 0) {
      return 'empty';
    }
    return requestedStatus;
  });

  protected readonly columnSpan = computed(() =>
    Math.max(
      this.columns().length +
        (this.showRowNumber() ? 1 : 0) +
        (this.actionsTemplate() ? 1 : 0),
      1,
    ),
  );

  protected readonly regionLabel = computed(
    () => `${this.caption()}. Desplace horizontalmente para ver más columnas.`,
  );

  private readonly sortedRows = computed<readonly T[]>(() => {
    let rows: unknown = this.rows();
    if (typeof rows === 'string') {
      try {
        rows = JSON.parse(rows);
      } catch {
        rows = [];
      }
    }
    
    if (rows && typeof rows === 'object' && !Array.isArray(rows)) {
      const anyRows = rows as any;
      // Extract array from known wrapper properties or fallback to the first array found
      if (Array.isArray(anyRows.$values)) {
        rows = anyRows.$values;
      } else if (Array.isArray(anyRows.data)) {
        rows = anyRows.data;
      } else if (Array.isArray(anyRows.items)) {
        rows = anyRows.items;
      } else if (Array.isArray(anyRows.elementos)) {
        rows = anyRows.elementos;
      } else if (anyRows.value && Array.isArray(anyRows.value.elementos)) {
        rows = anyRows.value.elementos;
      } else if (anyRows.value && Array.isArray(anyRows.value.data)) {
        rows = anyRows.value.data;
      } else {
        const arrayKey = Object.keys(anyRows).find(key => Array.isArray(anyRows[key]));
        if (arrayKey) {
          rows = anyRows[arrayKey];
        } else if (anyRows.value && typeof anyRows.value === 'object') {
          const valArrayKey = Object.keys(anyRows.value).find(key => Array.isArray(anyRows.value[key]));
          if (valArrayKey) rows = anyRows.value[valArrayKey];
        }
      }
    }

    if (!Array.isArray(rows)) {
      rows = [];
    }
    const sort = this.activeSort();
    if (!sort) {
      return rows as readonly T[];
    }

    const column = this.columns().find(
      (candidate) => candidate.key === sort.key && candidate.sortable,
    );
    if (!column) {
      return rows as readonly T[];
    }

    return (rows as readonly T[])
      .map<IndexedRow<T>>((row, originalIndex) => ({ row, originalIndex }))
      .sort((left, right) => {
        const comparison = this.compareRows(column, left.row, right.row, sort.direction);
        return comparison === 0 ? left.originalIndex - right.originalIndex : comparison;
      })
      .map(({ row }) => row);
  });

  protected readonly displayedRows = computed<readonly T[]>(() => {
    const rows = this.sortedRows();
    if (!this.usesClientPagination()) {
      return rows;
    }
    const offset = (this.effectivePage() - 1) * this.effectivePageSize();
    return rows.slice(offset, offset + this.effectivePageSize());
  });

  protected rowNumber(index: number): number {
    return (
      (this.effectivePage() - 1) * this.effectivePageSize() +
      index +
      1
    );
  }

  protected identifyRow(index: number, row: T): unknown {
    const identity = this.trackBy()(index, row);
    if (identity === row && (typeof row !== 'object' || row === null)) {
      return index;
    }
    return identity;
  }

  protected getTagVariant(column: DataTableColumn<T>, row: T): ChipVariant {
    if (column.tagVariant) {
      return column.tagVariant(row);
    }
    const val = String(this.columnValue(column, row) ?? '').toLowerCase();
    if (
      val === 'activo' ||
      val === 'active' ||
      val === 'vigente' ||
      val === 'true' ||
      val === '1'
    ) {
      return 'success';
    }
    if (
      val === 'inactivo' ||
      val === 'inactive' ||
      val === 'bloqueado' ||
      val === 'false' ||
      val === '0'
    ) {
      return 'error';
    }
    if (val.includes('incidencia') || val.includes('degradado') || val.includes('vencido')) {
      return 'warning';
    }
    return 'default';
  }

  protected displayValue(column: DataTableColumn<T>, row: T): string {
    const value = this.columnValue(column, row);
    if (column.format) {
      return column.format(value, row);
    }
    if (value === null || value === undefined || value === '') {
      return this.emptyValue();
    }
    return String(value);
  }

  protected actionContext(row: T, index: number): DataTableActionContext<T> {
    return { $implicit: row, row, index };
  }

  protected onSort(column: DataTableColumn<T>): void {
    if (!column.sortable) {
      return;
    }

    const current = this.activeSort();
    let direction: DataTableSortDirection = 'asc';
    if (current?.key === column.key && current.direction === 'asc') {
      direction = 'desc';
    } else if (current?.key === column.key && current.direction === 'desc') {
      direction = null;
    }

    this.activeSort.set(direction ? { key: column.key, direction } : null);
    if (this.usesClientPagination()) {
      this.internalPage.set(1);
    }
    this.sortChange.emit({ key: column.key, direction });
  }

  protected ariaSort(column: DataTableColumn<T>): 'ascending' | 'descending' | 'none' | null {
    if (!column.sortable) {
      return null;
    }

    const current = this.activeSort();
    if (current?.key !== column.key) {
      return 'none';
    }
    return current.direction === 'asc' ? 'ascending' : 'descending';
  }

  protected sortButtonLabel(column: DataTableColumn<T>): string {
    const current = this.activeSort();
    if (current?.key !== column.key) {
      return `${column.header}: sin orden. Activar para ordenar ascendente.`;
    }
    if (current.direction === 'asc') {
      return `${column.header}: orden ascendente. Activar para ordenar descendente.`;
    }
    return `${column.header}: orden descendente. Activar para quitar el orden.`;
  }

  protected sortIndicatorClass(column: DataTableColumn<T>): string {
    const current = this.activeSort();
    if (current?.key !== column.key) {
      return 'fa-sort';
    }
    return current.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  private columnValue(column: DataTableColumn<T>, row: T): unknown {
    return column.value ? column.value(row) : row[column.key];
  }

  private sortValue(column: DataTableColumn<T>, row: T): unknown {
    return column.sortValue ? column.sortValue(row) : this.columnValue(column, row);
  }

  private compareRows(
    column: DataTableColumn<T>,
    left: T,
    right: T,
    direction: Exclude<DataTableSortDirection, null>,
  ): number {
    if (column.compare) {
      const comparison = column.compare(left, right);
      return direction === 'asc' ? comparison : -comparison;
    }

    const leftValue = this.sortValue(column, left);
    const rightValue = this.sortValue(column, right);
    const leftIsEmpty = leftValue === null || leftValue === undefined;
    const rightIsEmpty = rightValue === null || rightValue === undefined;

    // Los valores ausentes permanecen al final en ambos sentidos de ordenamiento.
    if (leftIsEmpty || rightIsEmpty) {
      if (leftIsEmpty && rightIsEmpty) {
        return 0;
      }
      return leftIsEmpty ? 1 : -1;
    }

    const comparison = this.compareValues(leftValue, rightValue);
    return direction === 'asc' ? comparison : -comparison;
  }

  private compareValues(left: unknown, right: unknown): number {
    if (left === right) {
      return 0;
    }
    if (typeof left === 'number' && typeof right === 'number') {
      if (Number.isNaN(left) || Number.isNaN(right)) {
        return this.collator.compare(String(left), String(right));
      }
      return left < right ? -1 : 1;
    }
    if (typeof left === 'bigint' && typeof right === 'bigint') {
      return left < right ? -1 : 1;
    }
    if (left instanceof Date && right instanceof Date) {
      return left.getTime() - right.getTime();
    }
    if (typeof left === 'boolean' && typeof right === 'boolean') {
      return left ? 1 : -1;
    }
    return this.collator.compare(String(left), String(right));
  }

  protected readonly isScrolledRight = signal(true);
  private scrollObserver?: ResizeObserver;
  private scrollListener?: () => void;

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      const host = this.host.nativeElement;
      const scrollArea = host.querySelector('.so-scroll-area');
      if (!scrollArea) {
        return;
      }

      const checkScroll = () => {
        const { scrollLeft, clientWidth, scrollWidth } = scrollArea;
        // Permite 1px de tolerancia por redondeos en pantallas con escala fraccional
        const atRight = scrollWidth === 0 || (scrollLeft + clientWidth >= scrollWidth - 1);
        if (this.isScrolledRight() !== atRight) {
          this.zone.run(() => this.isScrolledRight.set(atRight));
        }
      };

      this.scrollListener = () => checkScroll();
      scrollArea.addEventListener('scroll', this.scrollListener, { passive: true });

      if (typeof ResizeObserver !== 'undefined') {
        this.scrollObserver = new ResizeObserver(() => checkScroll());
        this.scrollObserver.observe(scrollArea);
        const table = host.querySelector('table');
        if (table) {
          this.scrollObserver.observe(table);
        }
      }

      setTimeout(checkScroll, 0);
    });
  }

  ngOnDestroy(): void {
    if (this.scrollListener) {
      const scrollArea = this.host.nativeElement.querySelector('.so-scroll-area');
      if (scrollArea) {
        scrollArea.removeEventListener('scroll', this.scrollListener);
      }
    }
    if (this.scrollObserver) {
      this.scrollObserver.disconnect();
    }
  }
}
