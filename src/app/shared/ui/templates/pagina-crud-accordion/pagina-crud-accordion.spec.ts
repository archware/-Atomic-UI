import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideTranslateService } from '@ngx-translate/core';
import { ButtonComponent } from '../../atoms/button/button.component';
import { PaginaCrudAccordion } from './pagina-crud-accordion';

describe('PaginaCrudAccordion', () => {
  let fixture: ComponentFixture<PaginaCrudAccordion<{ id: string; nombre: string }>>;

  const entidades = [
    {
      clave: 'bancos',
      titulo: 'Entidades financieras',
      abiertoInicial: true,
    },
  ];
  const columnasPorEntidad = {
    bancos: [{ key: 'nombre' as const, header: 'Nombre' }],
  };
  const filasPorEntidad = {
    bancos: [{ id: '1', nombre: 'Banco Central' }],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideTranslateService()],
    });
    fixture = TestBed.createComponent(PaginaCrudAccordion<{ id: string; nombre: string }>);
    fixture.componentRef.setInput('titulo', 'Recaudación');
    fixture.componentRef.setInput('entidades', entidades);
    fixture.componentRef.setInput('columnasPorEntidad', columnasPorEntidad);
    fixture.componentRef.setInput('filasPorEntidad', filasPorEntidad);
    fixture.componentRef.setInput('claveEntidadActiva', 'bancos');
    fixture.componentRef.setInput('estadoPorEntidad', { bancos: 'success' });
    fixture.componentRef.setInput('totalPorEntidad', { bancos: 1 });
    fixture.detectChanges();
  });

  it('cierra el diálogo y emite alCerrarDialogo una sola vez al pulsar Cancelar mediante (buttonClick)', async () => {
    const alCerrar = jasmine.createSpy('alCerrarDialogo');
    fixture.componentInstance.alCerrarDialogo.subscribe(alCerrar);
    fixture.componentRef.setInput('modoCrud', 'crear');
    fixture.detectChanges();

    fixture.componentInstance.abrirDialogo();
    fixture.detectChanges();

    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    expect(dialog.open).toBeTrue();

    const pie = dialog.querySelector('.pagina-crud-accordion__dialogo-pie') as HTMLElement;
    expect(pie).not.toBeNull();
    const botones = pie.querySelectorAll('button');
    expect(botones.length).toBe(2);
    expect(botones[0].textContent?.trim()).toBe('Cancelar');
    expect(botones[1].textContent?.trim()).toBe('Guardar');

    (botones[0] as HTMLButtonElement).click();
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 0));
    fixture.componentInstance.cerrarDialogo();

    expect(dialog.open).toBeFalse();
    expect(alCerrar).toHaveBeenCalledTimes(1);
  });

  it('renderiza pie de diálogo con botón Cerrar y oculta Guardar en modo ver (esModoPrevisualizacion)', async () => {
    const alCerrar = jasmine.createSpy('alCerrarDialogo');
    fixture.componentInstance.alCerrarDialogo.subscribe(alCerrar);
    fixture.componentRef.setInput('modoCrud', 'ver');
    fixture.detectChanges();

    fixture.componentInstance.abrirDialogo();
    fixture.detectChanges();

    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    expect(dialog.open).toBeTrue();

    const pie = dialog.querySelector('.pagina-crud-accordion__dialogo-pie') as HTMLElement;
    expect(pie).not.toBeNull();
    const botones = pie.querySelectorAll('button');
    expect(botones.length).toBe(1);
    expect(botones[0].textContent?.trim()).toBe('Cerrar');

    (botones[0] as HTMLButtonElement).click();
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(dialog.open).toBeFalse();
    expect(alCerrar).toHaveBeenCalledTimes(1);
  });

  function abrirConfirmacion(): { disparador: HTMLButtonElement; dialogo: HTMLDialogElement; cancelar: HTMLButtonElement; confirmar: HTMLButtonElement } {
    const disparador = fixture.nativeElement.querySelector('app-table-action button[aria-label="Desactivar"]') as HTMLButtonElement;
    expect(disparador).not.toBeNull();
    disparador.focus();
    disparador.click();
    fixture.detectChanges();
    const dialogo = fixture.nativeElement.querySelector('dialog[role="alertdialog"]') as HTMLDialogElement;
    expect(dialogo).not.toBeNull();
    expect(dialogo.open).toBeTrue();
    const botones = dialogo.querySelectorAll<HTMLButtonElement>('.pagina-crud-accordion__confirmacion-pie button');
    return { disparador, dialogo, cancelar: botones[0], confirmar: botones[1] };
  }

  async function esperarCierre(): Promise<void> {
    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve, 0));
  }

  it('enfoca Cancelar y resuelve título y descripción locales con IDs distintos y únicos por instancia', () => {
    const { dialogo, cancelar } = abrirConfirmacion();
    expect(document.activeElement).toBe(cancelar);
    expect(cancelar.textContent?.trim()).toBe('Cancelar');
    expect(dialogo.getAttribute('aria-modal')).toBe('true');
    const titulo = dialogo.getAttribute('aria-labelledby')!;
    const mensaje = dialogo.getAttribute('aria-describedby')!;
    expect(titulo).not.toBe(mensaje);
    expect(dialogo.querySelector(`[id="${titulo}"]`)?.textContent?.trim()).toBeTruthy();
    expect(dialogo.querySelector(`[id="${mensaje}"]`)?.textContent?.trim()).toBeTruthy();
    const otra = TestBed.createComponent(PaginaCrudAccordion<{ id: string; nombre: string }>);
    otra.componentRef.setInput('titulo', 'Otra página');
    otra.componentRef.setInput('entidades', entidades);
    otra.componentRef.setInput('columnasPorEntidad', columnasPorEntidad);
    otra.componentRef.setInput('filasPorEntidad', filasPorEntidad);
    otra.detectChanges();
    const otroDialogo = otra.nativeElement.querySelector('dialog[role="alertdialog"]') as HTMLDialogElement;
    expect(otroDialogo.getAttribute('aria-labelledby')).not.toBe(titulo);
    expect(otroDialogo.getAttribute('aria-describedby')).not.toBe(mensaje);
    otra.destroy();
  });

  for (const cierre of ['Cancelar', 'X', 'fondo', 'Escape']) {
    it(`${cierre} cierra sin emitir baja ni afectar el formulario y devuelve el foco`, async () => {
      const eliminar = jasmine.createSpy('alEliminar');
      const guardar = jasmine.createSpy('alGuardar');
      const cerrarFormulario = jasmine.createSpy('alCerrarDialogo');
      fixture.componentInstance.alEliminar.subscribe(eliminar);
      fixture.componentInstance.alGuardar.subscribe(guardar);
      fixture.componentInstance.alCerrarDialogo.subscribe(cerrarFormulario);
      const { dialogo, disparador, cancelar } = abrirConfirmacion();
      const mensaje = dialogo.querySelector('.pagina-crud-accordion__confirmacion-mensaje')!;
      mensaje.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, isPrimary: true, button: 0 }));
      (mensaje as HTMLElement).click();
      expect(dialogo.open).toBeTrue();
      if (cierre === 'Cancelar') cancelar.click();
      if (cierre === 'X') dialogo.querySelector<HTMLButtonElement>('app-icon-button button')!.click();
      if (cierre === 'Escape') dialogo.dispatchEvent(new Event('cancel', { cancelable: true }));
      if (cierre === 'fondo') {
        const limites = dialogo.getBoundingClientRect();
        dialogo.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, isPrimary: true, button: 0, clientX: limites.left - 1, clientY: limites.top - 1 }));
      }
      await esperarCierre();
      expect(dialogo.open).toBeFalse();
      expect(document.activeElement).toBe(disparador);
      expect(eliminar).not.toHaveBeenCalled();
      expect(guardar).not.toHaveBeenCalled();
      expect(cerrarFormulario).not.toHaveBeenCalled();
      expect(fixture.componentInstance.claveEntidadActiva()).toBe('bancos');
      expect(fixture.componentInstance.modoCrud()).toBe('crear');
      expect(fixture.nativeElement.querySelector('dialog[role="dialog"]').open).toBeFalse();
      cancelar.click();
      await esperarCierre();
      expect(eliminar).not.toHaveBeenCalled();
    });
  }

  it('consume la intención antes de emitir para impedir reentrada y activación repetida', async () => {
    const { dialogo, confirmar, disparador } = abrirConfirmacion();
    const botonConfirmar = fixture.debugElement.query(By.css('.pagina-crud-accordion__confirmacion-pie app-button:last-child')).componentInstance as ButtonComponent;
    const eliminar = jasmine.createSpy('alEliminar');
    fixture.componentInstance.alEliminar.subscribe(evento => {
      eliminar(evento);
      // click() nativo bloquea la recursión sobre sí mismo. La salida pública
      // acredita una segunda solicitud programática durante la emisión.
      if (eliminar.calls.count() === 1) botonConfirmar.buttonClick.emit(new MouseEvent('click'));
    });
    confirmar.click();
    confirmar.click();
    await esperarCierre();
    expect(eliminar).toHaveBeenCalledOnceWith({ clave: 'bancos', datos: filasPorEntidad.bancos[0] });
    expect(dialogo.open).toBeFalse();
    expect(document.activeElement).toBe(disparador);

    const billetera = { id: '2', nombre: 'Billetera de demostración' };
    fixture.componentRef.setInput('entidades', [{ clave: 'billeteras', titulo: 'Billeteras', abiertoInicial: true }]);
    fixture.componentRef.setInput('columnasPorEntidad', { billeteras: columnasPorEntidad.bancos });
    fixture.componentRef.setInput('filasPorEntidad', { billeteras: [billetera] });
    fixture.componentRef.setInput('estadoPorEntidad', { billeteras: 'success' });
    fixture.componentRef.setInput('totalPorEntidad', { billeteras: 1 });
    fixture.detectChanges();
    const segunda = abrirConfirmacion();
    segunda.confirmar.click();
    await esperarCierre();
    expect(eliminar).toHaveBeenCalledTimes(2);
    expect(eliminar.calls.mostRecent().args[0]).toEqual({ clave: 'billeteras', datos: billetera });
  });

  it('cierra las demás secciones al abrir otra entidad con varianteAccordion="single" y propaga colapsable, icono y deshabilitada', () => {
    fixture.componentRef.setInput('varianteAccordion', 'single');
    fixture.componentRef.setInput('colapsable', false);
    fixture.componentRef.setInput('entidades', [
      {
        clave: 'bancos',
        titulo: 'Entidades financieras',
        icono: 'fa-solid fa-building-columns',
        abiertoInicial: true,
      },
      { clave: 'billeteras', titulo: 'Billeteras', abiertoInicial: false },
      { clave: 'bloqueada', titulo: 'En auditoría', deshabilitada: true },
    ]);
    fixture.componentRef.setInput('columnasPorEntidad', {
      bancos: columnasPorEntidad.bancos,
      billeteras: columnasPorEntidad.bancos,
      bloqueada: columnasPorEntidad.bancos,
    });
    fixture.componentRef.setInput('filasPorEntidad', {
      bancos: filasPorEntidad.bancos,
      billeteras: [{ id: '2', nombre: 'Billetera Central' }],
      bloqueada: [],
    });
    fixture.detectChanges();

    const cabeceras = fixture.nativeElement.querySelectorAll(
      '.accordion-header',
    ) as NodeListOf<HTMLButtonElement>;
    const icono = fixture.nativeElement.querySelector(
      '.accordion-leading-icon',
    ) as HTMLElement | null;
    expect(cabeceras.length).toBe(3);
    expect(icono?.classList.contains('fa-building-columns')).toBeTrue();
    expect(cabeceras[0].getAttribute('aria-expanded')).toBe('true');
    expect(cabeceras[1].getAttribute('aria-expanded')).toBe('false');
    expect(cabeceras[2].disabled).toBeTrue();

    // Con [colapsable]="false", pulsar la entidad abierta no la pliega
    cabeceras[0].click();
    fixture.detectChanges();
    expect(cabeceras[0].getAttribute('aria-expanded')).toBe('true');

    cabeceras[1].click();
    fixture.detectChanges();

    expect(cabeceras[0].getAttribute('aria-expanded')).toBe('false');
    expect(cabeceras[1].getAttribute('aria-expanded')).toBe('true');
  });

});
