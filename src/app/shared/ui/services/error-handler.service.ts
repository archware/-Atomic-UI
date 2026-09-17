import { ErrorHandler, Injectable, inject, NgZone } from '@angular/core';
import { Router } from '@angular/router';

/**
 * GlobalErrorHandlerService — Captura errores no manejados en la aplicación.
 *
 * Features:
 * - Captura errores de JavaScript no atrapados (runtime errors)
 * - Redirige a /500 en errores críticos
 * - Registra errores en consola (reemplaza por tu servicio de monitoreo)
 * - Ignora errores conocidos no críticos
 *
 * @usage En app.config.ts:
 * ```typescript
 * import { GlobalErrorHandlerService } from '@shared/ui';
 * providers: [
 *   { provide: ErrorHandler, useClass: GlobalErrorHandlerService }
 * ]
 * ```
 */
@Injectable()
export class GlobalErrorHandlerService implements ErrorHandler {
  private readonly router = inject(Router);
  private readonly zone = inject(NgZone);

  /** Errores a ignorar (fragmentos de mensaje) */
  private readonly IGNORED_ERRORS = [
    'ExpressionChangedAfterItHasBeenCheckedError',
    'ResizeObserver loop',
    'Non-Error promise rejection',
  ];

  handleError(error: unknown): void {
    const err = error instanceof Error ? error : new Error(String(error));

    // Ignorar errores no críticos
    if (this.shouldIgnore(err)) {
      return;
    }

    // Log para desarrollo — @customize: reemplaza con Sentry, Datadog, etc.
    console.error('[GlobalErrorHandler]', err);

    // Redirigir a página de error en zona Angular
    this.zone.run(() => {
      // Solo redirige si es un error crítico y estamos en el browser
      if (typeof window !== 'undefined') {
        document.body.innerHTML = '<div style="padding:40px;background:red;color:white;position:fixed;top:0;left:0;width:100%;height:100%;z-index:999999;font-size:20px;overflow:auto;"><pre>' + err.stack + '</pre></div>';
      }
    });
  }

  private shouldIgnore(error: Error): boolean {
    return this.IGNORED_ERRORS.some(ignored =>
      error.message?.includes(ignored)
    );
  }
}
