import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  OnDestroy,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { ButtonComponent, ButtonVariant } from '../../atoms/button/button.component';
import { IconButtonComponent } from '../../atoms/icon-button/icon-button.component';
import { ScrollOverlayComponent } from '../scroll-overlay/scroll-overlay.component';
import {
  ConfirmDialogCloseReason,
  ConfirmDialogInitialFocus,
  ConfirmDialogResult,
  ConfirmDialogTone,
  ConfirmDialogViewModel,
} from './confirm-dialog.models';
import { ConfirmDialogService } from './confirm-dialog.service';

const CONFIRM_FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

let nextConfirmDialogId = 0;

/**
 * Diálogo nativo de confirmación (`role="alertdialog"`) con soporte declarativo
 * y cola reactiva mediante `ConfirmDialogService`.
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [ButtonComponent, IconButtonComponent, ScrollOverlayComponent],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent implements OnDestroy {
  private readonly confirmService = inject(ConfirmDialogService);
  private readonly injector = inject(Injector);
  private readonly dialogRef = viewChild<ElementRef<HTMLDialogElement>>('nativeDialog');

  private readonly instanceNumber = ++nextConfirmDialogId;
  readonly titleId = `confirm-dialog-title-${this.instanceNumber}`;
  readonly messageId = `confirm-dialog-message-${this.instanceNumber}`;
  private readonly declarativeId = `confirm-dialog-decl-${this.instanceNumber}`;

  private previouslyFocused: HTMLElement | null = null;
  private wasOpen = false;
  private activeRenderedId: string | null = null;

  readonly open = input<boolean>(false);
  readonly useService = input<boolean>(false);
  readonly title = input<string>('Confirmar operación');
  readonly subtitle = input<string | null>(null);
  readonly message = input<string>('');
  readonly confirmLabel = input<string>('Confirmar');
  readonly cancelLabel = input<string>('Cancelar');
  readonly tone = input<ConfirmDialogTone>('danger');
  readonly initialFocus = input<ConfirmDialogInitialFocus>('cancel');
  readonly closeOnEscape = input<boolean>(true);
  readonly closeOnBackdrop = input<boolean>(false);
  readonly loading = input<boolean>(false);
  readonly headerAlign = input<'start' | 'center'>('center');

  readonly confirmed = output<ConfirmDialogResult>();
  readonly cancelled = output<ConfirmDialogResult>();
  readonly closed = output<ConfirmDialogResult>();

  protected readonly resolvedViewModel = computed<ConfirmDialogViewModel>(() => {
    const active = this.useService() ? this.confirmService.active() : null;
    if (active) {
      return active;
    }
    return {
      id: this.declarativeId,
      title: this.title(),
      subtitle: this.subtitle() ?? undefined,
      message: this.message(),
      confirmLabel: this.confirmLabel(),
      cancelLabel: this.cancelLabel(),
      tone: this.tone(),
      initialFocus: this.initialFocus(),
      closeOnEscape: this.closeOnEscape(),
      closeOnBackdrop: this.closeOnBackdrop(),
      headerAlign: this.headerAlign(),
    };
  });

  protected readonly isOpen = computed<boolean>(() => {
    if (this.useService()) {
      return this.confirmService.active() !== null;
    }
    return this.open();
  });

  protected readonly confirmButtonVariant = computed<ButtonVariant>(() => {
    const currentTone = this.resolvedViewModel().tone;
    if (currentTone === 'warning') {
      return 'warning';
    }
    if (currentTone === 'danger') {
      return 'danger';
    }
    return 'primary';
  });

  protected readonly toneIconClass = computed<string>(() => {
    const currentTone = this.resolvedViewModel().tone;
    if (currentTone === 'danger') {
      return 'fa-solid fa-triangle-exclamation';
    }
    if (currentTone === 'warning') {
      return 'fa-solid fa-circle-exclamation';
    }
    return 'fa-solid fa-circle-question';
  });

  constructor() {
    effect(() => {
      const dialog = this.dialogRef()?.nativeElement;
      const shouldOpen = this.isOpen();
      const activeId = shouldOpen ? this.resolvedViewModel().id : null;
      if (!dialog) {
        return;
      }

      if (shouldOpen && !this.wasOpen) {
        this.wasOpen = true;
        this.activeRenderedId = activeId;
        this.previouslyFocused =
          typeof document !== 'undefined' && document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;
        this.openNativeDialog(dialog);
        this.focusInitialControl(dialog);
      } else if (shouldOpen && this.wasOpen && this.activeRenderedId !== activeId) {
        this.activeRenderedId = activeId;
        this.focusInitialControl(dialog);
      } else if (!shouldOpen && this.wasOpen) {
        this.wasOpen = false;
        this.activeRenderedId = null;
        this.closeNativeDialog(dialog);
        this.restoreFocus();
      }
    });
  }

  ngOnDestroy(): void {
    const dialog = this.dialogRef()?.nativeElement;
    if (dialog && this.wasOpen) {
      this.closeNativeDialog(dialog);
    }
    this.wasOpen = false;
  }

  protected onConfirmClick(): void {
    if (this.loading()) {
      return;
    }
    this.settle('confirmed');
  }

  protected onCancelClick(): void {
    if (this.loading()) {
      return;
    }
    this.settle('cancelled');
  }

  protected onCloseButtonClick(): void {
    if (this.loading()) {
      return;
    }
    this.settle('cancelled');
  }

  protected onNativeCancel(event: Event): void {
    event.preventDefault();
    if (!this.resolvedViewModel().closeOnEscape || this.loading()) {
      return;
    }
    this.settle('escape');
  }

  protected onDialogClick(event: MouseEvent): void {
    const dialog = this.dialogRef()?.nativeElement;
    if (!dialog || event.target !== dialog) {
      return;
    }
    if (!this.resolvedViewModel().closeOnBackdrop || this.loading()) {
      return;
    }
    this.settle('backdrop');
  }

  protected onDialogKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      if (this.resolvedViewModel().closeOnEscape && !this.loading()) {
        this.settle('escape');
      }
      return;
    }

    if (event.key !== 'Tab') {
      return;
    }

    const dialog = this.dialogRef()?.nativeElement;
    if (!dialog) {
      return;
    }

    const focusables = Array.from(dialog.querySelectorAll<HTMLElement>(CONFIRM_FOCUSABLE_SELECTOR)).filter(
      (element) => element.offsetParent !== null || element.getClientRects().length > 0,
    );
    if (focusables.length === 0) {
      return;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && (active === first || !dialog.contains(active))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private settle(reason: ConfirmDialogCloseReason): void {
    const vm = this.resolvedViewModel();
    const result: ConfirmDialogResult = {
      id: vm.id,
      confirmed: reason === 'confirmed',
      reason,
    };

    if (this.useService()) {
      this.confirmService.settle(vm.id, reason);
    }

    if (result.confirmed) {
      this.confirmed.emit(result);
    } else {
      this.cancelled.emit(result);
    }
    this.closed.emit(result);
  }

  private openNativeDialog(dialog: HTMLDialogElement): void {
    if (dialog.open) {
      return;
    }
    if (typeof dialog.showModal === 'function') {
      try {
        dialog.showModal();
        return;
      } catch {
        // Respaldo si el entorno de pruebas no permite showModal tras recarga.
      }
    }
    dialog.setAttribute('open', '');
  }

  private closeNativeDialog(dialog: HTMLDialogElement): void {
    if (typeof dialog.close === 'function' && dialog.open) {
      try {
        dialog.close();
        return;
      } catch {
        // Respaldo limpio para entornos sin soporte completo de <dialog>.
      }
    }
    dialog.removeAttribute('open');
  }

  private focusInitialControl(dialog: HTMLDialogElement): void {
    const preferConfirm = this.resolvedViewModel().initialFocus === 'confirm';
    afterNextRender(
      () => {
        const selector = preferConfirm
          ? '.confirm-dialog__confirm-btn button, .confirm-dialog__confirm-btn'
          : '.confirm-dialog__cancel-btn button, .confirm-dialog__cancel-btn';
        const target = dialog.querySelector<HTMLElement>(selector) ?? dialog;
        target.focus();
      },
      { injector: this.injector },
    );
  }

  private restoreFocus(): void {
    const target = this.previouslyFocused;
    this.previouslyFocused = null;
    if (target && target.isConnected) {
      target.focus();
    }
  }
}
