import { Injectable, signal } from '@angular/core';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastConfig {
  message: string;
  type?: ToastType;
  duration?: number;
  dismissible?: boolean;
}

export interface ToastItem extends ToastConfig {
  id: number;
  exiting?: boolean;
}

/**
 * Servicio global para mostrar notificaciones toast.
 * Inyectable en root para que sea singleton en toda la aplicación.
 * 
 * @example
 * ```typescript
 * export class MyComponent {
 *   private toast = inject(ToastService);
 * 
 *   onSuccess() {
 *     this.toast.success('Operación completada');
 *   }
 * 
 *   onError() {
 *     this.toast.error('Ocurrió un error');
 *   }
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastId = 0;

  /**
   * Tope de avisos simultáneos.
   *
   * POR QUE HAY UN TOPE. Sin él, un interceptor de errores, un reintento en
   * bucle o una pantalla que dispara N peticiones a la vez producen N avisos
   * que crecen hasta cubrir la ventana y dejan la aplicación sin operar: el
   * usuario no puede pulsar lo que hay debajo. Cuatro caben en pantalla en la
   * resolución más pequeña que se soporta y siguen siendo legibles.
   */
  private static readonly MAX_VISIBLE = 4;

  /** Signal público para que el componente lea los toasts */
  readonly toasts = signal<ToastItem[]>([]);

  /**
   * Muestra un toast con la configuración especificada.
   *
   * Tres defensas, y ninguna es hipotética:
   *
   * 1. UN MENSAJE VACIO NO SE PINTA. La caja se renderiza con `role="alert"`,
   *    así que un mensaje en blanco es una alerta anunciada sin contenido: el
   *    lector de pantalla interrumpe para no decir nada.
   * 2. NO SE DUPLICA UN AVISO YA VISIBLE. Cuarenta «Error de conexión»
   *    idénticos no informan cuarenta veces: informan una y estorban treinta y
   *    nueve. Si ya hay uno vivo con el mismo tipo y el mismo texto, no se
   *    añade otro.
   * 3. LA PILA SE RECORTA a `MAX_VISIBLE` aunque los avisos sean distintos.
   *
   * Nota sobre el recorte: al descartar el más antiguo queda su temporizador
   * pendiente, que llamará a `dismiss` con un identificador que ya no existe.
   * Es inocuo —`dismiss` filtra por identificador— y evita tener que llevar un
   * registro de temporizadores solo para eso.
   */
  show(config: ToastConfig): void {
    const message = config.message?.trim() ?? '';
    if (!message) {
      return;
    }

    const type = config.type ?? 'info';
    const yaVisible = this.toasts().some(
      toast => !toast.exiting && toast.type === type && toast.message === message
    );
    if (yaVisible) {
      return;
    }

    const id = ++this.toastId;
    const toast: ToastItem = {
      ...config,
      message,
      id,
      type,
      dismissible: config.dismissible ?? true
    };

    this.toasts.update(t => [...t, toast].slice(-ToastService.MAX_VISIBLE));

    if (config.duration !== 0) {
      setTimeout(() => this.dismiss(id), config.duration ?? 4000);
    }
  }

  /** Muestra un toast de información */
  info(message: string, duration?: number): void {
    this.show({ message, type: 'info', duration });
  }

  /** Muestra un toast de éxito */
  success(message: string, duration?: number): void {
    this.show({ message, type: 'success', duration });
  }

  /** Muestra un toast de advertencia */
  warning(message: string, duration?: number): void {
    this.show({ message, type: 'warning', duration });
  }

  /** Muestra un toast de error */
  error(message: string, duration?: number): void {
    this.show({ message, type: 'error', duration });
  }

  /**
   * Descarta un toast específico por ID.
   */
  dismiss(id: number): void {
    this.toasts.update(t =>
      t.map(toast => toast.id === id ? { ...toast, exiting: true } : toast)
    );
    setTimeout(() => {
      this.toasts.update(t => t.filter(toast => toast.id !== id));
    }, 300);
  }

  /** Cierra todos los toasts */
  clear(): void {
    this.toasts.set([]);
  }
}
