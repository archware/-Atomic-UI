import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  viewChild,
} from '@angular/core';
import { CrudDialog } from '../crud-dialog/crud-dialog';

const FORM_FOCUS_SELECTOR = [
  '.form-dialog__body [data-dialog-initial-focus]:not([disabled])',
  '.form-dialog__body [data-control-focus]:not([disabled])',
  '.form-dialog__body input:not([disabled]):not([tabindex="-1"]):not([aria-hidden="true"])',
  '.form-dialog__body select:not([disabled])',
  '.form-dialog__body textarea:not([disabled])',
  '.form-dialog__body button:not([disabled])',
  '[dialog-close] button:not([disabled])',
].join(',');

/**
 * Diálogo de formulario con encabezado, descripción y cuerpo canónicos.
 * El consumidor conserva el formulario y las reglas de negocio, y proyecta
 * únicamente un botón Atomic con `dialog-close` para cerrar.
 */
@Component({
  selector: 'prest-form-dialog',
  imports: [CrudDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './form-dialog.html',
  styleUrl: './form-dialog.scss',
})
export class FormDialog {
  private static nextId = 0;
  private readonly generatedId = `prest-form-dialog-${++FormDialog.nextId}`;
  private readonly dialog = viewChild.required<CrudDialog>('dialog');

  readonly eyebrow = input<string | null>(null);
  readonly title = input.required<string>();
  readonly description = input<string | null>(null);
  readonly size = input<'sm' | 'md' | 'lg' | 'xl'>('md');
  readonly panelClass = input('');
  readonly cancelled = output<Event>();
  readonly closed = output<void>();

  protected readonly titleId = computed(() => `${this.generatedId}-title`);
  protected readonly descriptionId = computed(() => `${this.generatedId}-description`);

  get nativeElement(): HTMLDialogElement {
    return this.dialog().nativeElement;
  }

  get open(): boolean {
    return this.dialog().open;
  }

  showModal(): void {
    this.dialog().showModal(FORM_FOCUS_SELECTOR);
  }

  close(returnValue?: string): void {
    this.dialog().close(returnValue);
  }

  focusInvalid(): void {
    this.dialog().focusInvalid();
  }
}

/** Pie canónico para acciones principales y secundarias de un formulario modal. */
@Component({
  selector: 'prest-form-dialog-actions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<div class="form-dialog-actions"><ng-content /></div>',
  styleUrl: './form-dialog-actions.scss',
})
export class FormDialogActions {}
