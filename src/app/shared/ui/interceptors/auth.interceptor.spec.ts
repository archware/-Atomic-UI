import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import {
  HttpHandlerFn,
  HttpRequest,
  HttpResponse,
  provideHttpClient,
} from '@angular/common/http';
import { of } from 'rxjs';

import { authInterceptor } from './auth.interceptor';
import { ApiService } from '../services/api.service';
import { TokenService } from '../services/token.service';

/*
A QUIEN SE LE ENTREGA LA CREDENCIAL DEL USUARIO.

Antes se decidia con una lista NEGRA de tres rutas publicas: todo lo demas se
firmaba, incluidas las URL absolutas a terceros. Bastaba con que la aplicacion
pidiera un tipo de cambio, un mapa o un PDF alojado fuera para que el JWT del
usuario acabara en los registros de un host ajeno.

Estas pruebas fijan la postura contraria —lista blanca por origen— y cubren
tambien el caso que una comparacion ingenua por prefijo de cadena dejaria
pasar: un dominio que EMPIEZA por el nuestro.
*/
describe('authInterceptor — a quien se firma', () => {
  const TOKEN = 'jwt-de-prueba';
  let api: ApiService;

  function ejecutar(url: string): HttpRequest<unknown> {
    let vista!: HttpRequest<unknown>;
    const siguiente: HttpHandlerFn = (request) => {
      vista = request;
      return of(new HttpResponse({ status: 200 }));
    };

    TestBed.runInInjectionContext(() => {
      authInterceptor(new HttpRequest('GET', url), siguiente).subscribe();
    });
    return vista;
  }

  function firmada(url: string): boolean {
    return ejecutar(url).headers.has('Authorization');
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideHttpClient()],
    });

    api = TestBed.inject(ApiService);
    api.setBaseUrl('https://api.hra.gob.pe/v1');

    const tokens = TestBed.inject(TokenService);
    spyOn(tokens, 'getTokenApp').and.returnValue(TOKEN);
  });

  it('firma una peticion al origen propio de la API', () => {
    expect(firmada('https://api.hra.gob.pe/v1/creditos')).toBe(true);
  });

  it('firma una ruta relativa, que siempre va al origen del documento', () => {
    expect(firmada('/api/creditos')).toBe(true);
  });

  it('NO firma una peticion a un tercero', () => {
    expect(firmada('https://tipodecambio.example.com/hoy')).toBe(false);
    expect(firmada('https://cdn.example.com/logo.png')).toBe(false);
  });

  it('NO firma un dominio que solo EMPIEZA como el nuestro', () => {
    /*
      Este es el caso que obliga a comparar por ORIGEN y no con `startsWith`, y
      solo discrimina cuando la base NO lleva ruta: con `…/v1` detras, el
      prefijo ya no casa y la comparacion ingenua acierta por accidente. Aqui
      la base es el origen desnudo, que es como muchos consumidores la
      configuran, y entonces `startsWith` deja pasar al atacante.
    */
    api.setBaseUrl('https://api.hra.gob.pe');

    expect(firmada('https://api.hra.gob.pe.atacante.net/robar')).toBe(false);
    expect(firmada('https://api.hra.gob.pe/v1/creditos')).toBe(true);
  });

  it('NO firma el mismo host por un esquema o un puerto distintos', () => {
    expect(firmada('http://api.hra.gob.pe/v1/creditos')).toBe(false);
    expect(firmada('https://api.hra.gob.pe:8443/v1/creditos')).toBe(false);
  });

  it('sigue sin firmar las rutas publicas declaradas', () => {
    expect(firmada('https://api.hra.gob.pe/v1/Authentication/PostLogin')).toBe(false);
  });

  it('sin baseUrl configurada, no entrega la credencial a ninguna URL absoluta', () => {
    api.setBaseUrl('');

    expect(firmada('https://api.hra.gob.pe/v1/creditos')).toBe(false);
    // Lo relativo sigue funcionando: va al propio origen por construccion.
    expect(firmada('/api/creditos')).toBe(true);
  });
});
