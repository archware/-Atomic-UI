/**
 * Alert unificado.
 */
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { TableAction } from '../../atoms/table-action/table-action';

export type AlertKind = 'info' | 'success' | 'warning' | 'danger';
export type AlertSpacing = 'default' | 'compact' | 'none';

@Component({
  selector: 'app-alert, prest-alert',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './alert.component.html',
  styleUrl: './alert.scss',
  imports: [TableAction],
  host: {
    '[class.alert-flow--default]': "spacing() === 'default'",
    '[class.alert-flow--compact]': "spacing() === 'compact'",
    '[class.alert-flow--none]': "spacing() === 'none'",
  },
})
export class Alert {
  readonly kind = input<AlertKind>('info');
  readonly title = input('');
  readonly closable = input(false);
  readonly spacing = input<AlertSpacing>('default');
  readonly closed = output<void>();

  protected readonly visible = signal(true);
  protected readonly classes = computed(() => `alert alert--${this.kind()}`);

  protected close(): void {
    this.visible.set(false);
    this.closed.emit();
  }
}
