import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
} from '@angular/core';
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
  host: {
    popover: 'manual',
    'aria-label': 'Notificaciones',
  },
  template: `
    @for (toast of toastService.toasts(); track toast.id) {
      <div 
        class="toast" 
        [class]="'toast-' + toast.type"
        [class.toast-exit]="toast.exiting"
        role="alert"
        [attr.aria-live]="toast.type === 'error' ? 'assertive' : 'polite'"
      >
        <span class="toast-icon" aria-hidden="true">
          @switch (toast.type) {
            @case ('success') { <i class="fa-solid fa-circle-check"></i> }
            @case ('error') { <i class="fa-solid fa-circle-xmark"></i> }
            @case ('warning') { <i class="fa-solid fa-triangle-exclamation"></i> }
            @default { <i class="fa-solid fa-circle-info"></i> }
          }
        </span>
        <span class="toast-message">{{ toast.message }}</span>
        @if (toast.dismissible) {
          <button type="button" class="toast-close" (click)="toastService.dismiss(toast.id)" aria-label="Cerrar"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
        }
      </div>
    }
  `,
  styleUrl: './toast.component.css'
})
export class ToastComponent {
  protected readonly toastService = inject(ToastService);
  private readonly host = inject(ElementRef<HTMLElement>);
  private latestToastId = 0;

  private readonly topLayerSync = afterRenderEffect(() => {
    const toasts = this.toastService.toasts();
    const latestToastId = toasts[toasts.length - 1]?.id ?? 0;
    const host = this.host.nativeElement;

    if (
      !host.isConnected ||
      typeof host.showPopover !== 'function' ||
      typeof host.hidePopover !== 'function'
    ) {
      return;
    }

    const isOpen = host.matches(':popover-open');
    if (latestToastId === 0) {
      if (isOpen) {
        host.hidePopover();
      }
      this.latestToastId = 0;
      return;
    }

    if (isOpen && latestToastId === this.latestToastId) {
      return;
    }
    if (isOpen) {
      host.hidePopover();
    }
    host.showPopover();
    this.latestToastId = latestToastId;
  });
}
