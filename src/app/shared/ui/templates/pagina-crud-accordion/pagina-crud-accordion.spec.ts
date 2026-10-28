import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
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
});
