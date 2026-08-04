import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  output,
  viewChild,
} from '@angular/core';
import { ScrollOverlayComponent } from '../scroll-overlay/scroll-overlay.component';

const DEFAULT_FOCUS_SELECTOR = [
  '[data-dialog-initial-focus]:not([disabled])',
  '[data-control-focus]:not([disabled])',
  'input:not([disabled]):not([tabindex="-1"]):not([aria-hidden="true"])',
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
  imports: [ScrollOverlayComponent],
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
  private readonly scrollSurface = viewChild.required<ElementRef<HTMLElement>>('scrollSurface');
  private returnFocusTarget: HTMLElement | null = null;

  get nativeElement(): HTMLDialogElement {
    return this.dialog().nativeElement;
  }

  get open(): boolean {
    return this.nativeElement.open;
  }

  showModal(focusSelector = DEFAULT_FOCUS_SELECTOR): void {
    const element = this.nativeElement;
    if (!element.open) {
      const activeElement = element.ownerDocument.activeElement;
      this.returnFocusTarget =
        activeElement instanceof HTMLElement &&
        activeElement !== element.ownerDocument.body &&
        !element.contains(activeElement)
          ? activeElement
          : null;
      if (typeof element.showModal === 'function') {
        element.showModal();
      } else {
        element.setAttribute('open', '');
      }
    }
    element.scrollTop = 0;
    this.scrollSurface().nativeElement.scrollTop = 0;
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
      this.handleClosed();
    }
  }

  focusInvalid(): void {
    this.nativeElement
      .querySelector<HTMLElement>(
        '.ng-invalid input:not([disabled]), .ng-invalid select:not([disabled]), .ng-invalid textarea:not([disabled]), input.ng-invalid:not([disabled]), select.ng-invalid:not([disabled]), textarea.ng-invalid:not([disabled])',
      )
      ?.focus({ preventScroll: true });
  }

  protected handleCancel(event: Event): void {
    event.preventDefault();
    this.cancelled.emit(event);
  }

  protected handleClosed(): void {
    this.closed.emit();
    const target = this.returnFocusTarget;
    this.returnFocusTarget = null;
    if (target?.isConnected) {
      queueMicrotask(() => target.focus({ preventScroll: true }));
    }
  }
}
