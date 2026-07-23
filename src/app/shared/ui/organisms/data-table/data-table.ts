import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  computed,
  contentChild,
  input,
  output,
  signal,
} from '@angular/core';
import { AlertComponent } from '../../molecules/alert/alert.component';
import {
  StatusBadgeComponent,
  StatusBadgeStatus,
} from '../../atoms/status-badge/status-badge.component';
import { ScrollOverlayComponent } from '../scroll-overlay/scroll-overlay.component';

export type DataTableAlignment = 'start' | 'center' | 'end';
export type DataTableStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error';
export type DataTableSortDirection = 'asc' | 'desc' | null;

export interface DataTableColumn<T extends object = Record<string, unknown>> {
  readonly key: Extract<keyof T, string>;
  readonly header: string;
  readonly sortable?: boolean;
  readonly align?: DataTableAlignment;
  readonly width?: string;
  readonly isBadge?: boolean;
  readonly badgeStatus?: (row: T) => StatusBadgeStatus;
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
  selector: 'prest-data-table',
  imports: [AlertComponent, NgTemplateOutlet, ScrollOverlayComponent, StatusBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss',
})
export class DataTable<T extends object = Record<string, unknown>> {
  readonly columns = input.required<readonly DataTableColumn<T>[]>();
  readonly rows = input.required<readonly T[]>();
  readonly caption = input.required<string>();
  readonly captionVisible = input(false);
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

  // Pagination inputs & outputs
  readonly totalRecords = input<number | null>(null);
  readonly page = input(1);
  readonly pageSize = input(10);
  readonly totalPages = input(1);
  readonly pageSizeOptions = input<readonly number[]>([10, 20, 30, 40, 50]);
  readonly hasPreviousPage = input(false);
  readonly hasNextPage = input(false);

  readonly sortChange = output<DataTableSortChange<T>>();
  readonly retry = output<void>();
  readonly pageChange = output<number>();
  readonly pageSizeChange = output<number>();

  protected readonly actionsTemplate =
    contentChild<TemplateRef<DataTableActionContext<T>>>('actions');

  private readonly activeSort = signal<ActiveSort<T> | null>(null);
  private readonly collator = new Intl.Collator('es-PE', {
    numeric: true,
    sensitivity: 'base',
  });

  protected readonly rangeStart = computed(() => {
    const total = this.totalRecords() ?? 0;
    if (total === 0) return 0;
    return (this.page() - 1) * this.pageSize() + 1;
  });

  protected readonly rangeEnd = computed(() => {
    const total = this.totalRecords() ?? 0;
    if (total === 0) return 0;
    return Math.min(this.page() * this.pageSize(), total);
  });

  protected onPageSizeChange(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLSelectElement) {
      this.pageSizeChange.emit(Number(target.value));
    }
  }

  protected readonly effectiveStatus = computed<DataTableStatus>(() => {
    const requestedStatus = this.status();
    if (requestedStatus === 'success' && this.rows().length === 0) {
      return 'empty';
    }
    return requestedStatus;
  });

  protected readonly columnSpan = computed(() =>
    Math.max(this.columns().length + (this.actionsTemplate() ? 1 : 0), 1),
  );

  protected readonly regionLabel = computed(
    () => `${this.caption()}. Desplace horizontalmente para ver más columnas.`,
  );

  protected readonly displayedRows = computed<readonly T[]>(() => {
    const rows = this.rows();
    const sort = this.activeSort();
    if (!sort) {
      return rows;
    }

    const column = this.columns().find(
      (candidate) => candidate.key === sort.key && candidate.sortable,
    );
    if (!column) {
      return rows;
    }

    return rows
      .map<IndexedRow<T>>((row, originalIndex) => ({ row, originalIndex }))
      .sort((left, right) => {
        const comparison = this.compareRows(column, left.row, right.row, sort.direction);
        return comparison === 0 ? left.originalIndex - right.originalIndex : comparison;
      })
      .map(({ row }) => row);
  });

  protected identifyRow(index: number, row: T): unknown {
    return this.trackBy()(index, row);
  }

  protected getBadgeStatus(column: DataTableColumn<T>, row: T): StatusBadgeStatus {
    if (column.badgeStatus) {
      return column.badgeStatus(row);
    }
    const val = String(this.columnValue(column, row) ?? '').toLowerCase();
    if (
      val === 'activo' ||
      val === 'active' ||
      val === 'vigente' ||
      val === 'true' ||
      val === '1'
    ) {
      return 'active';
    }
    if (
      val === 'inactivo' ||
      val === 'inactive' ||
      val === 'bloqueado' ||
      val === 'false' ||
      val === '0'
    ) {
      return 'inactive';
    }
    if (val.includes('incidencia') || val.includes('degradado') || val.includes('vencido')) {
      return 'degraded';
    }
    return 'unconfigured';
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
}
