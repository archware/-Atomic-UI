/**
 * Alert unificado.
 */
import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, input, output, signal } from '@angular/core';
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
  private readonly destroyRef = inject(DestroyRef);
  private autoHideTimerId: ReturnType<typeof setTimeout> | null = null;
  private storageRestoredKey = '';
  private lastReopenToken: unknown = undefined;

  readonly kind = input<AlertKind>('info');
  readonly title = input('');
  readonly closable = input(false);
  readonly spacing = input<AlertSpacing>('default');
  readonly compact = input(false);
  readonly collapsible = input(false);
  readonly startCollapsed = input(false);
  readonly autoHideMs = input<number | null>(null);
  readonly rememberClosedKey = input('');
  readonly reopenToken = input<unknown>(null);
  readonly closed = output<void>();
  readonly collapsedChange = output<boolean>();

  protected readonly visible = signal(true);
  protected readonly collapsed = signal(false);
  protected readonly classes = computed(() => {
    const isCollapsed = this.collapsible() && this.collapsed();
    return `alert alert--${this.kind()}${this.compact() ? ' alert--compact' : ''}${isCollapsed ? ' alert--collapsed' : ''}`;
  });
  protected readonly collapsedTitle = computed(() => {
    const explicit = this.title().trim();
    if (explicit) return explicit;
    switch (this.kind()) {
      case 'success':
        return 'Operación exitosa';
      case 'warning':
        return 'Advertencia';
      case 'danger':
        return 'Alerta';
      case 'info':
      default:
        return 'Nota informativa';
    }
  });

  constructor() {
    effect(() => {
      this.collapsed.set(this.collapsible() && this.startCollapsed());
    });

    effect(() => {
      const key = this.rememberClosedKey().trim();
      if (!key || key === this.storageRestoredKey) return;
      this.storageRestoredKey = key;
      this.visible.set(!this.wasClosedInStorage(key));
    });

    effect(() => {
      const token = this.reopenToken();
      if (token === null || token === undefined || token === '') return;
      if (this.lastReopenToken === undefined) {
        this.lastReopenToken = token;
        return;
      }
      if (token === this.lastReopenToken) return;
      this.lastReopenToken = token;
      this.collapsed.set(this.collapsible() && this.startCollapsed());
      this.visible.set(true);
    });

    effect(() => {
      const ms = this.autoHideMs();
      const isVisible = this.visible();
      if (!isVisible || ms === null || ms <= 0) {
        this.clearAutoHideTimer();
        return;
      }

      this.clearAutoHideTimer();
      this.autoHideTimerId = setTimeout(() => this.dismiss(false), ms);
    });

    this.destroyRef.onDestroy(() => this.clearAutoHideTimer());
  }

  protected toggleCollapsed(): void {
    if (!this.collapsible()) return;
    const value = !this.collapsed();
    this.collapsed.set(value);
    this.collapsedChange.emit(value);
  }

  protected close(): void {
    this.dismiss(true);
  }

  private dismiss(persistState: boolean): void {
    if (!this.visible()) return;
    this.visible.set(false);
    this.clearAutoHideTimer();
    if (persistState) this.persistClosedState();
    this.closed.emit();
  }

  private clearAutoHideTimer(): void {
    if (this.autoHideTimerId !== null) {
      clearTimeout(this.autoHideTimerId);
      this.autoHideTimerId = null;
    }
  }

  private persistClosedState(): void {
    const key = this.rememberClosedKey().trim();
    if (!key || typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(key, '1');
  }

  private wasClosedInStorage(key: string): boolean {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    return window.localStorage.getItem(key) === '1';
  }
}
