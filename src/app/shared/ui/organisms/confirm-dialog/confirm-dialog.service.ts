import { Injectable, computed, signal } from '@angular/core';
import { Observable, from } from 'rxjs';
import {
  ConfirmDialogCloseReason,
  ConfirmDialogOptions,
  ConfirmDialogResult,
  ConfirmDialogViewModel,
} from './confirm-dialog.models';

interface PendingConfirmEntry {
  readonly viewModel: ConfirmDialogViewModel;
  readonly resolve: (result: ConfirmDialogResult) => void;
}

/**
 * Servicio de presentación para gestionar una cola de confirmaciones globales.
 */
@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private readonly queue = signal<readonly PendingConfirmEntry[]>([]);
  private sequence = 0;

  readonly active = computed<ConfirmDialogViewModel | null>(() => {
    const entries = this.queue();
    return entries.length > 0 ? entries[0].viewModel : null;
  });

  readonly pendingCount = computed<number>(() => this.queue().length);

  confirm(options: ConfirmDialogOptions): Promise<ConfirmDialogResult> {
    this.sequence += 1;
    const id = options.id ?? `confirm-dialog-${this.sequence}`;
    const viewModel: ConfirmDialogViewModel = {
      id,
      title: options.title,
      subtitle: options.subtitle,
      message: options.message,
      confirmLabel: options.confirmLabel ?? 'Confirmar',
      cancelLabel: options.cancelLabel ?? 'Cancelar',
      tone: options.tone ?? 'danger',
      initialFocus: options.initialFocus ?? 'cancel',
      closeOnEscape: options.closeOnEscape ?? true,
      closeOnBackdrop: options.closeOnBackdrop ?? false,
      headerAlign: options.headerAlign ?? 'center',
    };

    return new Promise<ConfirmDialogResult>((resolve) => {
      this.queue.update((current) => [...current, { viewModel, resolve }]);
    });
  }

  confirm$(options: ConfirmDialogOptions): Observable<ConfirmDialogResult> {
    return from(this.confirm(options));
  }

  settle(id: string, reason: ConfirmDialogCloseReason): void {
    const current = this.queue();
    const target = current.find((entry) => entry.viewModel.id === id);
    if (!target) {
      return;
    }

    this.queue.set(current.filter((entry) => entry.viewModel.id !== id));
    target.resolve({
      id,
      confirmed: reason === 'confirmed',
      reason,
    });
  }

  dismissAll(): void {
    const pending = this.queue();
    if (pending.length === 0) {
      return;
    }

    this.queue.set([]);
    for (const entry of pending) {
      entry.resolve({
        id: entry.viewModel.id,
        confirmed: false,
        reason: 'dismissed',
      });
    }
  }
}
