import { Component, ChangeDetectionStrategy, signal } from '@angular/core';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastConfig {
  message: string;
  type?: ToastType;
  duration?: number;
  dismissible?: boolean;
}

interface ToastItem extends ToastConfig {
  id: number;
  exiting?: boolean;
}

@Component({
  selector: 'app-toast',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (toast of toasts(); track toast.id) {
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
          <button type="button" class="toast-close" (click)="dismiss(toast.id)" (keydown.enter)="dismiss(toast.id)" (keydown.space)="dismiss(toast.id)" aria-label="Cerrar"><i class="fa-solid fa-xmark"></i></button>
        }
      </div>
    }
  `,
  styles: [`
    :host {
      position: fixed;
      top: 5rem;
      right: var(--space-4);
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      max-width: 360px;
      pointer-events: none;
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

    /* 
     * Dark mode se maneja automáticamente via tokens semánticos.
     * --surface-elevated, --border-color, --*-color-light/dark
     * ya tienen valores apropiados para temas oscuros.
     */
  `]
})
export class ToastComponent {
  private toastId = 0;
  toasts = signal<ToastItem[]>([]);

  show(config: ToastConfig) {
    const id = ++this.toastId;
    const toast: ToastItem = {
      ...config,
      id,
      type: config.type || 'info',
      dismissible: config.dismissible ?? true
    };

    this.toasts.update(t => [...t, toast]);

    if (config.duration !== 0) {
      setTimeout(() => this.dismiss(id), config.duration || 4000);
    }
  }

  dismiss(id: number) {
    this.toasts.update(t =>
      t.map(toast => toast.id === id ? { ...toast, exiting: true } : toast)
    );
    setTimeout(() => {
      this.toasts.update(t => t.filter(toast => toast.id !== id));
    }, 300);
  }

  /** Cerrar todos los toasts */
  clear() {
    this.toasts.set([]);
  }
}
