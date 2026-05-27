import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from '@shared/ui';

/**
 * Ejemplo de app.config.ts con authInterceptor registrado.
 *
 * @customize Copia el bloque provideHttpClient a tu app.config.ts real.
 */
export const appConfigExample: ApplicationConfig = {
  providers: [
    provideRouter([]),                                    // tus rutas
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])                 // <-- agregar esto
    ),
  ],
};
