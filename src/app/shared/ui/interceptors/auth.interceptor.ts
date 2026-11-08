import { inject } from '@angular/core';
import {
    HttpInterceptorFn,
    HttpRequest,
    HttpHandlerFn,
    HttpEvent,
    HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';

/**
 * URLs that should skip authentication
 */
const PUBLIC_URLS = [
    '/Authentication/PostLogin',
    '/Authentication/Get_time_server',
    '/Authentication/Post_refresh_token'
];

/**
 * Interceptor de autenticación mediante cookies.
 *
 * Habilita withCredentials en rutas relativas y solicitudes al origen de la API,
 * salvo los endpoints públicos. HttpOnly se configura en el servidor; este
 * interceptor no añade Authorization ni renueva tokens. Ante un 401 de una
 * solicitud incluida cierra la sesión y propaga el mismo error.
 * Las solicitudes excluidas conservan los atributos definidos por el llamador.
 * 
 * @usage
 * ```typescript
 * // In app.config.ts
 * import { provideHttpClient, withInterceptors } from '@angular/common/http';
 * import { authInterceptor } from '@shared/ui/interceptors/auth.interceptor';
 * 
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideHttpClient(withInterceptors([authInterceptor]))
 *   ]
 * };
 * ```
 */
export const authInterceptor: HttpInterceptorFn = (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
    const authService = inject(AuthService);
    const apiService = inject(ApiService);

    // Skip public URLs
    if (isPublicUrl(req.url)) {
        return next(req);
    }

    /*
      withCredentials SOLO SE AÑADE PARA EL ORIGEN PROPIO DE LA API.

      La comparación por origen evita habilitar cookies en solicitudes a
      terceros o a dominios que solo comparten un prefijo con la API.
      Sin baseUrl configurada se conserva la inclusión de rutas relativas,
      que se resuelven contra el origen del documento, y se excluyen las URL
      absolutas. Esta selección no elimina headers ni atributos de credenciales
      que el llamador haya establecido previamente.
    */
    if (!belongsToApi(req.url, apiService.getBaseUrl())) {
        return next(req);
    }

    // Habilita cookies; su atributo HttpOnly corresponde al servidor.
    req = req.clone({
        withCredentials: true
    });

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            // Handle 401 Unauthorized
            if (error.status === 401) {
                authService.logout();
            }

            return throwError(() => error);
        })
    );
};

/**
 * Check if URL is public (no auth required)
 */
function isPublicUrl(url: string): boolean {
    return PUBLIC_URLS.some(publicUrl => url.includes(publicUrl));
}

/**
 * Decide si el interceptor habilita cookies para una petición.
 *
 * Una ruta RELATIVA se resuelve contra el origen del documento.
 * Una ABSOLUTA solo se incluye si comparte origen con la base
 * declarada; comparar por origen y no por prefijo de cadena evita que
 * `https://api.ejemplo.com.atacante.net` pase por ser `https://api.ejemplo.com`.
 */
function belongsToApi(url: string, baseUrl: string): boolean {
    const esAbsoluta = /^[a-z][a-z0-9+.-]*:\/\//i.test(url) || url.startsWith('//');
    if (!esAbsoluta) {
        return true;
    }
    if (!baseUrl) {
        return false;
    }
    try {
        const destino = new URL(url, globalThis.location?.href);
        const base = new URL(baseUrl, globalThis.location?.href);
        return destino.origin === base.origin;
    } catch {
        // Una URL que no se puede analizar no recibe withCredentials del interceptor.
        return false;
    }
}
