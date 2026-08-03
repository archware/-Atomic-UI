import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastConfig {
  message: string;
  type?: ToastType;
  duration?: number;
  dismissible?: boolean;
}

/**
 * Componente visual para mostrar toasts.
 * Debe colocarse en el nivel raíz del app (app.component o app.html).
 * Usa ToastService para recibir y mostrar notificaciones.
 * 
 * @example
 * ```html
 * <!-- En app.html o app.component -->
 * <app-toast></app-toast>
 * ```
 * 
 * @example
 * ```typescript
 * // En cualquier componente
 * toast = inject(ToastService);
 * this.toast.success('¡Guardado!');
 * ```
 */
@Component({
  selector: 'app-toast',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (toast of toastService.toasts(); track toast.id) {
      <div 
        class="toast" 
        [class]="'toast-' + toast.type"
        [class.toast-exit]="toast.exiting"
        role="alert"
        [attr.aria-live]="toast.type === 'error' ? 'assertive' : 'polite'"
      >
        <span class="toast-icon">
          @switch (toast.type) {
            @case ('success') { <i class="fa-solid fa-circle-check"></i> }
            @case ('error') { <i class="fa-solid fa-circle-xmark"></i> }
            @case ('warning') { <i class="fa-solid fa-triangle-exclamation"></i> }
            @default { <i class="fa-solid fa-circle-info"></i> }
          }
        </span>
        <span class="toast-message">{{ toast.message }}</span>
        @if (toast.dismissible) {
          <button type="button" class="toast-close" (click)="toastService.dismiss(toast.id)" aria-label="Cerrar"><i class="fa-solid fa-xmark"></i></button>
        }
      </div>
    }
  `,
  styles: [`
    :host {
      position: fixed;
      top: calc(var(--header-height, 64px) + var(--space-4));
      right: var(--space-4);
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      max-width: 360px;
      pointer-events: none;
    }

    /* Responsive: mobile ajuste */
    @media (max-width: 768px) {
      :host {
        top: auto;
        bottom: var(--space-4);
        left: var(--space-4);
        right: var(--space-4);
        max-width: none;
      }
    }

    .toast {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-md);
      background: var(--surface-elevated);
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-lg);
      color: var(--text-color);
      animation: slideIn 300ms ease;
      pointer-events: auto;
    }

    .toast-exit {
      animation: slideOut 300ms ease forwards;
    }

    .toast-icon {
      font-size: var(--text-md);
      font-weight: bold;
      width: var(--icon-md);
      height: var(--icon-md);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      flex-shrink: 0;
    }

    /* Semantic Status Colors */
    .toast-info .toast-icon { background: var(--info-color-light); color: var(--info-color-dark); }
    .toast-success .toast-icon { background: var(--success-color-light); color: var(--success-color-dark); }
    .toast-warning .toast-icon { background: var(--warning-color-light); color: var(--warning-color-dark); }
    .toast-error .toast-icon { background: var(--danger-color-light); color: var(--danger-color-dark); }

    .toast-message {
      flex: 1;
      font-size: var(--text-sm);
    }

    .toast-close {
      background: none;
      border: none;
      font-size: var(--text-xl);
      color: var(--text-color-secondary);
      cursor: pointer;
      padding: 0;
      line-height: 1;
      flex-shrink: 0;
    }

    .toast-close:hover {
      color: var(--text-color);
    }

    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `]
})
export class ToastComponent {
  protected readonly toastService = inject(ToastService);
}
