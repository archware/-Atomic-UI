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
      right: 1rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-width: 360px;
      pointer-events: none;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      border-radius: var(--radius-md, 0.5rem);
      background: var(--surface-elevated, #ffffff);
      border: 1px solid var(--border-color, #e5e7eb);
      box-shadow: var(--shadow-lg);
      color: var(--text-color, #1f2937);
      animation: slideIn 300ms ease;
      pointer-events: auto;
    }

    .toast-exit {
      animation: slideOut 300ms ease forwards;
    }

    .toast-icon {
      font-size: 1rem;
      font-weight: bold;
      width: 1.5rem;
      height: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      flex-shrink: 0;
    }

    /* Semantic Status Colors */
    .toast-info .toast-icon { background: var(--info-color-light, #dbeafe); color: var(--info-color-dark, #2563eb); }
    .toast-success .toast-icon { background: var(--success-color-light, #d1fae5); color: var(--success-color-dark, #059669); }
    .toast-warning .toast-icon { background: var(--warning-color-light, #fef3c7); color: var(--warning-color-dark, #d97706); }
    .toast-error .toast-icon { background: var(--danger-color-light, #fee2e2); color: var(--danger-color-dark, #dc2626); }

    .toast-message {
      flex: 1;
      font-size: 0.875rem;
    }

    .toast-close {
      background: none;
      border: none;
      font-size: 1.25rem;
      color: var(--text-color-secondary, #9ca3af);
      cursor: pointer;
      padding: 0;
      line-height: 1;
      flex-shrink: 0;
    }

    .toast-close:hover {
      color: var(--text-color, #1f2937);
    }

    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }

    /* Dark mode overrides (minimal needed due to semantic vars) */
    :host-context(html.dark) .toast,
    :host-context([data-theme="dark"]) .toast {
      background: var(--surface-elevated, #1f2937);
      border-color: var(--border-color, #374151);
    }
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
