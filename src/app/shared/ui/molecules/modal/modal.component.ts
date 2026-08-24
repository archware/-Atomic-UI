import {
  afterNextRender,
  AfterRenderRef,
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  Injector,
  OnDestroy,
  ViewChild,
  input,
  output
} from '@angular/core';

/* orden-dom: es un CONJUNTO de tipos de control equivalentes, no una lista de
   prioridad. Aqui se quiere el primer control del marcado, que es el que la
   persona ve arriba; anteponer `button` a `input` enfocaria «Aceptar» en vez
   del primer campo del formulario. La marca de foco explicita no vive en esta
   lista: se resuelve aparte con [data-modal-initial-focus]. */
const MODAL_FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',');

/* Esta SI es una lista de prioridad, y por eso no se une con comas: el marcador
   explicito `[data-modal-error]` tiene que ganar a un `[role="alert"]` generico
   aunque este aparezca antes en el marcado. Unirlas y entregarlas a un
   `querySelector` singular devolvia orden de DOM y derrotaba esa intencion en
   silencio. Se recorre en orden con `firstMatching`. */
const MODAL_ERROR_SELECTORS = [
  '[data-modal-error]',
  '[data-dialog-error]',
  '[role="alert"]',
  '[aria-invalid="true"]',
] as const;

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="modal-overlay"
      (pointerdown)="onBackdropClick($event)"
    >
      <div #dialogRef class="modal"
        (pointerdown)="$event.stopPropagation()"
        (keydown)="onOverlayKeydown($event)"
        role="dialog"
        aria-modal="true"
        tabindex="-1"
        [attr.aria-labelledby]="titleId"
        [attr.aria-busy]="busy() ? 'true' : null"
        [class.modal-sm]="size() === 'sm'"
        [class.modal-md]="size() === 'md'"
        [class.modal-lg]="size() === 'lg'"
      >
        <!-- Header -->
        <div class="modal-header">
          <h3 class="modal-title" [id]="titleId">{{ title() }}</h3>
          <button
            class="modal-close"
            (click)="requestClose()"
            type="button"
            aria-label="Cerrar"
            [disabled]="busy()"
          >
            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <ng-content></ng-content>
        </div>

        <!-- Footer -->
        @if (hasFooter()) {
        <div class="modal-footer">
          <ng-content select="[slot=footer]"></ng-content>
        </div>
        }
      </div>
    </div>
  `,
  styleUrl: './modal.component.css'
})
export class ModalComponent implements AfterViewInit, OnDestroy {
  private static instanceCounter = 0;
  readonly titleId = `atomic-modal-title-${++ModalComponent.instanceCounter}`;

  @ViewChild('dialogRef', { read: ElementRef })
  private dialogRef?: ElementRef<HTMLElement>;

  private readonly injector = inject(Injector);
  private previouslyFocused: HTMLElement | null = null;
  private pendingErrorFocus?: AfterRenderRef;

  readonly title = input('');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly closeOnBackdrop = input(true);
  readonly hasFooter = input(true);
  readonly busy = input(false);

  readonly closed = output<void>();

  ngAfterViewInit(): void {
    if (typeof document === 'undefined') return;
    const activeElement = document.activeElement;
    this.previouslyFocused = activeElement instanceof HTMLElement ? activeElement : null;
    queueMicrotask(() => this.focusInitialControl());
  }

  ngOnDestroy(): void {
    this.pendingErrorFocus?.destroy();
    this.pendingErrorFocus = undefined;
    if (this.previouslyFocused?.isConnected) {
      this.previouslyFocused.focus({ preventScroll: true });
    }
  }

  onBackdropClick(event?: Event): void {
    if (event && event.target !== event.currentTarget) return;
    if (!this.busy() && this.closeOnBackdrop()) {
      this.requestClose();
    }
  }

  onEscape(): void {
    if (!this.busy() && this.closeOnBackdrop()) {
      this.closed.emit();
    }
  }

  /** Requests closure only when the dialog is not processing an action. */
  requestClose(): void {
    if (!this.busy()) {
      this.closed.emit();
    }
  }

  /**
   * Focuses the first projected operation error after an asynchronous failure.
   * If Angular has not rendered the feedback yet, the component retries once
   * after the pending render so callers do not need timing workarounds.
   */
  focusError(): boolean {
    const focused = this.tryFocusError();
    if (focused) {
      this.pendingErrorFocus?.destroy();
      this.pendingErrorFocus = undefined;
      return true;
    }

    this.pendingErrorFocus?.destroy();
    this.pendingErrorFocus = afterNextRender({
      write: () => {
        this.pendingErrorFocus = undefined;
        this.tryFocusError();
      },
    }, { injector: this.injector });
    return false;
  }

  private tryFocusError(): boolean {
    const dialog = this.dialogRef?.nativeElement;
    const errorRoot = dialog ? firstMatching(dialog, MODAL_ERROR_SELECTORS) : null;
    if (!errorRoot) return false;

    const target = errorRoot.matches(MODAL_FOCUSABLE_SELECTOR)
      ? errorRoot
      : errorRoot.querySelector<HTMLElement>(MODAL_FOCUSABLE_SELECTOR) ?? errorRoot;
    if (!target.hasAttribute('tabindex') && !target.matches(MODAL_FOCUSABLE_SELECTOR)) {
      target.tabIndex = -1;
    }
    target.focus({ preventScroll: true });
    return true;
  }

  onOverlayKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.stopPropagation();
      this.onEscape();
      return;
    }
    if (event.key === 'Tab') this.trapFocus(event);
  }

  private focusInitialControl(): void {
    const dialog = this.dialogRef?.nativeElement;
    if (!dialog) return;
    const preferredRoot = dialog.querySelector<HTMLElement>('[data-modal-initial-focus]');
    const preferred = preferredRoot?.matches(MODAL_FOCUSABLE_SELECTOR)
      ? preferredRoot
      : preferredRoot?.querySelector<HTMLElement>(MODAL_FOCUSABLE_SELECTOR);
    const target = preferred ?? dialog.querySelector<HTMLElement>(MODAL_FOCUSABLE_SELECTOR) ?? dialog;
    target.focus({ preventScroll: true });
  }

  private trapFocus(event: KeyboardEvent): void {
    const dialog = this.dialogRef?.nativeElement;
    if (!dialog) return;
    const controls = Array.from(dialog.querySelectorAll<HTMLElement>(MODAL_FOCUSABLE_SELECTOR))
      .filter(control => !control.hasAttribute('hidden') && control.getAttribute('aria-hidden') !== 'true');

    if (controls.length === 0) {
      event.preventDefault();
      dialog.focus({ preventScroll: true });
      return;
    }

    const first = controls[0];
    const last = controls[controls.length - 1];
    const active = typeof document !== 'undefined' ? document.activeElement : null;
    if (event.shiftKey && (active === first || !dialog.contains(active))) {
      event.preventDefault();
      last.focus({ preventScroll: true });
    } else if (!event.shiftKey && (active === last || !dialog.contains(active))) {
      event.preventDefault();
      first.focus({ preventScroll: true });
    }
  }
}

/** Recorre los selectores EN ORDEN y devuelve el primero que exista.
 *
 * Es la diferencia con `querySelector('a, b, c')`, que devuelve el primer
 * elemento en orden de DOM y por tanto ignora el orden de la lista.
 */
function firstMatching(root: ParentNode, selectors: readonly string[]): HTMLElement | null {
  for (const selector of selectors) {
    const found = root.querySelector<HTMLElement>(selector);
    if (found) {
      return found;
    }
  }
  return null;
}
