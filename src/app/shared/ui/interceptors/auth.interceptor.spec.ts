import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import {
  HttpHandlerFn,
  HttpErrorResponse,
  HttpHeaders,
  HttpRequest,
  HttpResponse,
  provideHttpClient,
} from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { authInterceptor } from './auth.interceptor';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

/*
La implementación activa utiliza cookies y withCredentials, por lo que las
expectativas de Authorization Bearer se sustituyen por la inclusión de cookies.
HttpOnly lo establece el servidor y no se acredita con withCredentials.
Las pruebas conservan la selección por origen y el rechazo de dominios que
solo comparten un prefijo. El interceptor no borra headers ni atributos que
el llamador haya añadido explícitamente a una solicitud excluida.
*/
describe('authInterceptor — inclusión de cookies por origen', () => {
  let api: ApiService;
  let cerrarSesion: jasmine.Spy;

  function ejecutar(url: string): HttpRequest<unknown> {
    return ejecutarSolicitud(new HttpRequest('GET', url));
  }

  function ejecutarSolicitud(entrada: HttpRequest<unknown>): HttpRequest<unknown> {
    let vista!: HttpRequest<unknown>;
    const siguiente: HttpHandlerFn = (request) => {
      vista = request;
      return of(new HttpResponse({ status: 200 }));
    };

    TestBed.runInInjectionContext(() => {
      authInterceptor(entrada, siguiente).subscribe();
    });
    return vista;
  }

  function conCookies(url: string): boolean {
    return ejecutar(url).withCredentials;
  }

  beforeEach(() => {
    cerrarSesion = jasmine.createSpy('cerrarSesion');
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        { provide: AuthService, useValue: { logout: cerrarSesion } },
      ],
    });

    api = TestBed.inject(ApiService);
    api.setBaseUrl('https://api.ejemplo.com/v1');
  });

  it('habilita cookies para una petición al origen propio de la API', () => {
    expect(conCookies('https://api.ejemplo.com/v1/creditos')).toBe(true);
  });

  it('habilita cookies para una ruta relativa al origen del documento', () => {
    expect(conCookies('/api/creditos')).toBe(true);
  });

  it('no habilita cookies para una petición a un tercero', () => {
    expect(conCookies('https://tipodecambio.example.com/hoy')).toBe(false);
    expect(conCookies('https://cdn.example.com/logo.png')).toBe(false);
  });

  it('no habilita cookies para un dominio que solo empieza como el propio', () => {
    /*
      Este es el caso que obliga a comparar por ORIGEN y no con `startsWith`, y
      solo discrimina cuando la base NO lleva ruta: con `…/v1` detras, el
      prefijo ya no casa y la comparacion ingenua acierta por accidente. Aqui
      la base es el origen desnudo, que es como muchos consumidores la
      configuran, y entonces `startsWith` deja pasar al atacante.
    */
    api.setBaseUrl('https://api.ejemplo.com');

    expect(conCookies('https://api.ejemplo.com.atacante.net/robar')).toBe(false);
    expect(conCookies('https://api.ejemplo.com/v1/creditos')).toBe(true);
  });

  it('no habilita cookies para el mismo host con otro esquema o puerto', () => {
    expect(conCookies('http://api.ejemplo.com/v1/creditos')).toBe(false);
    expect(conCookies('https://api.ejemplo.com:8443/v1/creditos')).toBe(false);
  });

  it('conserva la exclusión de las tres rutas públicas declaradas', () => {
    for (const ruta of ['PostLogin', 'Get_time_server', 'Post_refresh_token']) {
      expect(conCookies(`https://api.ejemplo.com/v1/Authentication/${ruta}`)).toBe(false);
    }
  });

  it('sin baseUrl configurada, no entrega la credencial a ninguna URL absoluta', () => {
    api.setBaseUrl('');

    expect(conCookies('https://api.ejemplo.com/v1/creditos')).toBe(false);
    // Lo relativo sigue funcionando: va al propio origen por construccion.
    expect(conCookies('/api/creditos')).toBe(true);
  });

  it('no añade Authorization a una solicitud de entrada sin ese header', () => {
    const entrada = new HttpRequest('GET', 'https://api.ejemplo.com/v1/creditos');
    const salida = ejecutarSolicitud(entrada);

    expect(entrada.headers.has('Authorization')).toBeFalse();
    expect(salida.headers.has('Authorization')).toBeFalse();
    expect(salida.withCredentials).toBeTrue();
    expect(entrada.withCredentials).toBeFalse();
  });

  it('entrega intactas las solicitudes públicas y de terceros, incluso sus atributos explícitos', () => {
    for (const url of [
      'https://api.ejemplo.com/v1/Authentication/PostLogin',
      'https://cdn.example.com/logo.png',
    ]) {
      const entrada = new HttpRequest('GET', url, {
        headers: new HttpHeaders({ Authorization: 'entrada-del-llamador' }),
        withCredentials: true,
      });

      expect(ejecutarSolicitud(entrada)).toBe(entrada);
    }
  });

  it('entrega intactas las URL absolutas cuando no hay base configurada', () => {
    api.setBaseUrl('');
    const entrada = new HttpRequest('GET', 'https://api.ejemplo.com/v1/creditos');

    expect(ejecutarSolicitud(entrada)).toBe(entrada);
  });

  function ejecutarError(url: string, error: HttpErrorResponse): unknown {
    let recibido: unknown;
    const siguiente: HttpHandlerFn = () => throwError(() => error);
    TestBed.runInInjectionContext(() => {
      authInterceptor(new HttpRequest('GET', url), siguiente).subscribe({
        error: (fallo: unknown) => { recibido = fallo; },
      });
    });
    return recibido;
  }

  it('cierra la sesión por un 401 de la API y propaga el mismo error', () => {
    const error = new HttpErrorResponse({ status: 401 });

    expect(ejecutarError('https://api.ejemplo.com/v1/creditos', error)).toBe(error);
    expect(cerrarSesion).toHaveBeenCalledTimes(1);
  });

  it('propaga un error distinto de 401 sin cerrar la sesión', () => {
    const error = new HttpErrorResponse({ status: 500 });

    expect(ejecutarError('https://api.ejemplo.com/v1/creditos', error)).toBe(error);
    expect(cerrarSesion).not.toHaveBeenCalled();
  });

  it('propaga el 401 de una solicitud excluida sin cerrar la sesión', () => {
    const error = new HttpErrorResponse({ status: 401 });

    expect(ejecutarError('https://cdn.example.com/logo.png', error)).toBe(error);
    expect(ejecutarError('https://api.ejemplo.com/v1/Authentication/PostLogin', error)).toBe(error);
    expect(cerrarSesion).not.toHaveBeenCalled();
  });
});
