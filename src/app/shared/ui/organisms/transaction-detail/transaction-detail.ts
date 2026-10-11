import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface TransactionDetailGroup {
  readonly label: string;
  readonly values: readonly string[];
}
export interface TransactionDetailTable {
  readonly title: string;
  readonly columns: readonly { readonly key: string; readonly label: string; readonly align?: 'start' | 'end' }[];
  readonly rows: readonly Readonly<Record<string, string>>[];
}
/** Presentación solamente: el consumidor entrega valores ya formateados. */
@Component({
  selector: 'app-transaction-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './transaction-detail.html',
  styleUrl: './transaction-detail.scss',
})
export class TransactionDetail {
  readonly title = input('');
  readonly groups = input<readonly TransactionDetailGroup[]>([]);
  readonly tables = input<readonly TransactionDetailTable[]>([]);
  readonly total = input('');
}
