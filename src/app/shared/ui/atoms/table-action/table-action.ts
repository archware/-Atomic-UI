import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

export type TableActionName =
  | 'view'
  | 'edit'
  | 'activate'
  | 'deactivate'
  | 'renew'
  | 'select'
  | 'late-fee'
  | 'delete'
  | 'custom';

export type TableActionTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';
export type TableActionSize = 'sm' | 'md' | 'lg';

const ICONS: Readonly<Record<TableActionName, string>> = {
  view: 'fa-eye',
  edit: 'fa-pen-to-square',
  activate: 'fa-circle-check',
  deactivate: 'fa-circle-xmark',
  renew: 'fa-clock-rotate-left',
  select: 'fa-hand-pointer',
  'late-fee': 'fa-file-invoice-dollar',
  delete: 'fa-trash-can',
  custom: 'fa-ellipsis',
};

const TONES: Readonly<Record<TableActionName, TableActionTone>> = {
  view: 'neutral',
  edit: 'primary',
  activate: 'success',
  deactivate: 'danger',
  renew: 'warning',
  select: 'primary',
  'late-fee': 'warning',
  delete: 'danger',
  custom: 'neutral',
};

/** Acción iconográfica individual para grillas y listas compactas. */
@Component({
  selector: 'prest-table-action',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './table-action.html',
  styleUrl: './table-action.scss',
})
export class TableAction {
  readonly action = input<TableActionName>('view');
  readonly label = input.required<string>();
  readonly icon = input<string | null>(null);
  readonly tone = input<TableActionTone | null>(null);
  readonly size = input<TableActionSize>('md');
  readonly disabled = input(false);
  readonly loading = input(false);
  readonly selected = input<boolean | null>(null);
  readonly triggered = output<MouseEvent>();

  protected readonly iconClass = computed(() => this.icon() ?? ICONS[this.action()]);
  protected readonly toneClass = computed(
    () => `table-action table-action--${this.tone() ?? TONES[this.action()]} table-action--${this.size()}`,
  );

  protected onClick(event: MouseEvent): void {
    if (!this.disabled() && !this.loading()) {
      this.triggered.emit(event);
    }
  }
}
