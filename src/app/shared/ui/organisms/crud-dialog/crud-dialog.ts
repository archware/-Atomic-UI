import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  output,
  viewChild,
} from '@angular/core';

const DEFAULT_FOCUS_SELECTOR = [
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  '[href]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Organismo modal canónico para altas y ediciones CRUD.
 * Conserva el foco, la semántica nativa de dialog y permite proyectar formularios completos.
 */
@Component({
  selector: 'prest-crud-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './crud-dialog.html',
  styleUrl: './crud-dialog.scss',
})
export class CrudDialog {
  readonly panelClass = input('');
  readonly size = input<'sm' | 'md' | 'lg' | 'xl'>('md');
  readonly labelledBy = input.required<string>();
  readonly describedBy = input<string | null>(null);
  readonly cancelled = output<Event>();
  readonly closed = output<void>();

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('nativeDialog');

  get nativeElement(): HTMLDialogElement {
    return this.dialog().nativeElement;
  }

  get open(): boolean {
    return this.nativeElement.open;
  }

  showModal(focusSelector = DEFAULT_FOCUS_SELECTOR): void {
    const element = this.nativeElement;
    if (!element.open) {
      if (typeof element.showModal === 'function') {
        element.showModal();
      } else {
        element.setAttribute('open', '');
      }
    }
    element.querySelector<HTMLElement>(focusSelector)?.focus({ preventScroll: true });
  }

  close(returnValue?: string): void {
    const element = this.nativeElement;
    if (!element.open) {
      return;
    }
    if (typeof element.close === 'function') {
      element.close(returnValue);
    } else {
      element.removeAttribute('open');
      this.closed.emit();
    }
  }

  focusInvalid(): void {
    this.nativeElement.querySelector<HTMLElement>('.ng-invalid')?.focus({ preventScroll: true });
  }

  protected handleCancel(event: Event): void {
    event.preventDefault();
    this.cancelled.emit(event);
  }
}
