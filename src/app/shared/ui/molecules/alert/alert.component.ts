import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';


export type AlertVariant = 'info' | 'success' | 'warning' | 'danger';
export type AlertSize = 'sm' | 'md' | 'lg';
export type AlertFlowSpacing = 'default' | 'compact' | 'none';

/**
 * AlertComponent — Mensaje de estado inline.
 * A diferencia del Toast (global/flotante), el Alert se embebe en el flujo del documento.
 *
 * @example
 * ```html
 * <app-alert variant="success" title="Guardado" message="Los cambios fueron guardados."></app-alert>
 * <app-alert variant="danger" [closable]="true" (closed)="onClose()">
 *   Error al procesar la solicitud.
 * </app-alert>
 * ```
 */
@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible) {
      <div
        class="alert"
        [class]="
          'alert--' + variant + ' alert--' + size + ' alert--flow-' + flowSpacing
        "
        [class.alert--dismissible]="closable"
        role="alert"
        [attr.aria-live]="variant === 'danger' ? 'assertive' : 'polite'"
      >
        <!-- Icon -->
        <span class="alert__icon" aria-hidden="true">
          @switch (variant) {
            @case ('info')    { <i class="fa-solid fa-circle-info"></i> }
            @case ('success') { <i class="fa-solid fa-circle-check"></i> }
            @case ('warning') { <i class="fa-solid fa-triangle-exclamation"></i> }
            @case ('danger')  { <i class="fa-solid fa-circle-xmark"></i> }
          }
        </span>

        <!-- Body -->
        <div class="alert__body">
          @if (title) {
            <p class="alert__title">{{ title }}</p>
          }
          @if (message) {
            <p class="alert__message">{{ message }}</p>
          }
          <ng-content></ng-content>
        </div>

        <!-- Close button -->
        @if (closable) {
          <button
            type="button"
            class="alert__close"
            aria-label="Cerrar alerta"
            (click)="dismiss()"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        }
      </div>
    }
  `,
  styles: [`
    .alert {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-md);
      border: 1px solid transparent;
      font-size: var(--text-sm);
      position: relative;
    }

    /* Sizes */
    .alert--sm { padding: var(--space-2) var(--space-3); font-size: var(--text-xs); }
    .alert--md { padding: var(--space-3) var(--space-4); }
    .alert--lg { padding: var(--space-4) var(--space-5); font-size: var(--text-base); }

    /* Flow spacing keeps feedback separate from the next content section. */
    .alert--flow-default { margin-block-end: var(--alert-flow-gap, 2.25rem); }
    .alert--flow-compact { margin-block-end: var(--alert-flow-gap-compact, var(--space-4)); }
    .alert--flow-none { margin-block-end: 0; }

    /* Variants */
    .alert--info {
      background-color: var(--alert-info-bg, var(--info-color-lighter));
      border-color: var(--alert-info-border, var(--info-color));
      color: var(--alert-info-text, var(--info-color-text));
    }
    .alert--success {
      background-color: var(--alert-success-bg, var(--success-color-lighter));
      border-color: var(--alert-success-border, var(--success-color));
      color: var(--alert-success-text, var(--success-color-text));
    }
    .alert--warning {
      background-color: var(--alert-warning-bg, var(--warning-color-lighter));
      border-color: var(--alert-warning-border, var(--warning-color));
      color: var(--alert-warning-text, var(--warning-color-text));
    }
    .alert--danger {
      background-color: var(--alert-danger-bg, var(--danger-color-lighter));
      border-color: var(--alert-danger-border, var(--danger-color));
      color: var(--alert-danger-text, var(--danger-color-text));
    }

    /* Icon */
    .alert__icon {
      flex-shrink: 0;
      font-size: var(--space-4);
      margin-top: 1px;
    }

    /* Body */
    .alert__body {
      flex: 1;
      min-width: 0;
    }

    .alert__title {
      margin: 0 0 var(--space-1);
      font-weight: var(--font-semibold, 600);
      line-height: 1.4;
      text-transform: uppercase;
    }

    .alert__message {
      margin: 0;
      opacity: 0.9;
      line-height: 1.5;
    }

    /* Close button */
    .alert--dismissible { padding-right: var(--space-10, 2.5rem); }

    .alert__close {
      position: absolute;
      top: var(--space-2);
      right: var(--space-2);
      background: none;
      border: none;
      cursor: pointer;
      padding: var(--space-1);
      border-radius: var(--radius-sm);
      opacity: 0.6;
      color: inherit;
      transition: opacity 150ms ease;
      line-height: 1;
    }
    .alert__close:hover { opacity: 1; }
    .alert__close:focus-visible {
      outline: var(--space-1) solid currentColor;
      outline-offset: 1px;
    }
  `],
})
export class AlertComponent {
  @Input() variant: AlertVariant = 'info';
  @Input() size: AlertSize = 'md';
  @Input() title = '';
  @Input() message = '';
  @Input() closable = false;
  @Input() flowSpacing: AlertFlowSpacing = 'default';

  @Output() closed = new EventEmitter<void>();

  protected visible = true;

  dismiss(): void {
    this.visible = false;
    this.closed.emit();
  }
}
