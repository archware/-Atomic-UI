import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ToastService } from './toast.service';

/*
Estas pruebas cubren las tres defensas de `show()`, que existen por casos
vividos y no por precaución teórica: una tormenta de avisos idénticos tapando
la ventana, y una caja con `role="alert"` anunciada sin texto dentro.

Se usa `duration: 0` en casi todas para que el aviso no se auto-descarte a
mitad de la comprobación: lo que se mide es la pila, no el temporizador.
*/
describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), ToastService],
    });
    service = TestBed.inject(ToastService);
  });

  it('no pinta un aviso sin texto', () => {
    service.show({ message: '', duration: 0 });
    service.show({ message: '   ', duration: 0 });

    expect(service.toasts().length).toBe(0);
  });

  it('recorta el mensaje antes de guardarlo', () => {
    service.show({ message: '  hola  ', duration: 0 });

    expect(service.toasts()[0].message).toBe('hola');
  });

  it('no duplica un aviso vivo con el mismo tipo y el mismo texto', () => {
    for (let i = 0; i < 40; i += 1) {
      service.error('Error de conexión', 0);
    }

    expect(service.toasts().length).toBe(1);
  });

  it('distingue el mismo texto con distinto tipo', () => {
    service.show({ message: 'Guardado', type: 'success', duration: 0 });
    service.show({ message: 'Guardado', type: 'warning', duration: 0 });

    expect(service.toasts().length).toBe(2);
  });

  it('un aviso saliente no bloquea que se vuelva a anunciar lo mismo', () => {
    service.show({ message: 'Reintentando', duration: 0 });
    const [primero] = service.toasts();

    service.dismiss(primero.id);
    service.show({ message: 'Reintentando', duration: 0 });

    // El saliente sigue en la pila durante su animación de salida, pero ya no
    // cuenta como visible: si contara, el usuario se quedaria sin el segundo
    // aviso justo cuando el primero se esta yendo.
    expect(service.toasts().filter(t => !t.exiting).length).toBe(1);
  });

  it('recorta la pila al tope aunque los avisos sean distintos', () => {
    for (let i = 0; i < 10; i += 1) {
      service.show({ message: `Aviso ${i}`, duration: 0 });
    }

    const pila = service.toasts();
    expect(pila.length).toBe(4);
    // Se conservan los ULTIMOS: lo recien ocurrido es lo que el usuario
    // necesita leer.
    expect(pila.map(t => t.message)).toEqual(['Aviso 6', 'Aviso 7', 'Aviso 8', 'Aviso 9']);
  });
});
