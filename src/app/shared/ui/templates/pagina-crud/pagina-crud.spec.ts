import { TestBed, ComponentFixture } from '@angular/core/testing';
import { PaginaCrud } from './pagina-crud';
import { provideTranslateService } from '@ngx-translate/core';
import { By } from '@angular/platform-browser';
import { Input } from '../../atoms/form-input/input';
import { DataTable } from '../../organisms/data-table/data-table';
import { ActionGroupComponent } from '../../molecules/action-group/action-group.component';
import { ButtonComponent } from '../../atoms/button/button.component';

describe('PaginaCrud: catálogo compatible', () => {
  it('bloquearCierre impide cierre aun fuera de guardando', () => {
    fixture.componentInstance.abrirDialogo();
    fixture.componentRef.setInput('bloquearCierre', true);
    fixture.detectChanges();
    dialogos()[0].dispatchEvent(new Event('cancel', { cancelable: true }));
    fixture.componentInstance.cerrarDialogo();
    expect(dialogos()[0].open).toBeTrue();
    expect((dialogos()[0].querySelector('app-icon-button button') as HTMLButtonElement).disabled).toBeTrue();
    expect((dialogos()[0].querySelector('footer button') as HTMLButtonElement).disabled).toBeTrue();
    fixture.componentRef.setInput('bloquearCierre', false);
    fixture.detectChanges();
    fixture.componentInstance.cerrarDialogo();
    expect(dialogos()[0].open).toBeFalse();
  });
  let fixture: ComponentFixture<PaginaCrud<{ id: string; nombre: string }>>;
  const fila = { id: 'uno', nombre: 'Café Mixto' };
  const confirmar = { titulo: () => 'Dar de baja', mensaje: () => 'Se conservarán las referencias.' };
  const dialogos = (): NodeListOf<HTMLDialogElement> => fixture.nativeElement.querySelectorAll('dialog');

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideTranslateService()] });
    fixture = TestBed.createComponent(PaginaCrud<{ id: string; nombre: string }>);
    fixture.componentRef.setInput('titulo', 'Familias');
    fixture.componentRef.setInput('columnas', [{ key: 'nombre', header: 'Nombre' }]);
    fixture.componentRef.setInput('filas', [fila]);
    fixture.componentRef.setInput('estado', 'success');
    fixture.detectChanges();
  });

  it('centraliza los tres iconos de catálogo sin botones elevados', () => {
    const grupo: HTMLElement = fixture.nativeElement.querySelector('app-action-group');
    expect(grupo.querySelector('.fa-eye')).not.toBeNull();
    expect(grupo.querySelector('.fa-pen')).not.toBeNull();
    expect(grupo.querySelector('.fa-trash')).not.toBeNull();
    expect(grupo.querySelector('app-button')).toBeNull();
    expect(grupo.querySelectorAll('button').length).toBe(3);
  });

  it('muestra detalle semántico y Cerrar neutro; no proyecta edición', () => {
    fixture.componentRef.setInput('modoCrud', 'ver');
    fixture.componentRef.setInput('detalle', [{ label: 'Nombre', value: fila.nombre }]);
    fixture.detectChanges();
    fixture.componentInstance.abrirDialogo();
    const modal = dialogos()[0];
    expect(modal.open).toBeTrue();
    expect(modal.querySelector('dl dd')?.textContent).toBe(fila.nombre);
    expect(modal.querySelector('form,input,textarea')).toBeNull();
    const pie = modal.querySelector('footer')!;
    expect(pie.querySelectorAll('button').length).toBe(1);
    expect(pie.textContent?.trim()).toBe('Cerrar');
    expect(pie.querySelector('app-button')?.getAttribute('variant')).toBe('outline');
    expect(modal.querySelector('app-icon-button')?.getAttribute('variant')).toBe('hanging-close');
  });

  it('cambia la tercera acción declarada sin añadir botones ni abrir el editor', () => {
    const evento = jasmine.createSpy('evento');
    fixture.componentInstance.alAccionFila.subscribe(evento);
    for (const activo of [true, false]) {
      fixture.componentRef.setInput('accionesPorFila', () => [
        { id: 'ver', action: 'view', label: 'Ver detalle' },
        { id: 'editar', action: 'edit', label: 'Editar' },
        { id: 'estado', action: activo ? 'deactivate' : 'activate', label: activo ? 'Desactivar' : 'Activar' },
      ]);
      fixture.detectChanges();
      const botones = fixture.nativeElement.querySelectorAll('app-action-group button');
      expect(botones.length).toBe(3);
      expect(botones[2].getAttribute('aria-label')).toBe(activo ? 'Desactivar' : 'Activar');
      expect(botones[2].querySelector(activo ? '.fa-trash' : '.fa-circle-check')).not.toBeNull();
      botones[2].click();
      expect(evento).toHaveBeenCalledWith({ accion: 'estado', entidad: fila });
      expect(dialogos()[0].open).toBeFalse();
    }
    expect(evento).toHaveBeenCalledTimes(2);
    fixture.componentRef.setInput('guardando', true);
    fixture.detectChanges();
    const grupo = fixture.debugElement.query(By.directive(ActionGroupComponent)).componentInstance as ActionGroupComponent;
    // La guarda también bloquea una emisión programática; no depende solo del atributo disabled.
    grupo.actionClick.emit('estado');
    grupo.actionClick.emit('accion-no-declarada');
    expect(evento).toHaveBeenCalledTimes(2);
  });

  it('solo emite Guardar cuando el consumidor habilita cambios y no hay envío en curso', () => {
    const guardar = jasmine.createSpy('guardar');
    fixture.componentInstance.alGuardar.subscribe(guardar);
    const botonGuardar = () => fixture.debugElement.queryAll(By.directive(ButtonComponent))
      .find(elemento => elemento.nativeElement.textContent.trim() === 'Guardar')!;
    fixture.componentRef.setInput('guardarHabilitado', false);
    fixture.detectChanges();
    expect(botonGuardar().nativeElement.querySelector('button').disabled).toBeTrue();
    (botonGuardar().componentInstance as ButtonComponent).buttonClick.emit(new MouseEvent('click'));
    expect(guardar).not.toHaveBeenCalled();
    fixture.componentRef.setInput('guardarHabilitado', true);
    fixture.detectChanges();
    botonGuardar().nativeElement.querySelector('button').click();
    expect(guardar).toHaveBeenCalledTimes(1);
    const instanciaGuardar = botonGuardar().componentInstance as ButtonComponent;
    fixture.componentRef.setInput('guardando', true);
    fixture.detectChanges();
    instanciaGuardar.buttonClick.emit(new MouseEvent('click'));
    expect(guardar).toHaveBeenCalledTimes(1);
  });

  it('bloquea Cancelar y Escape durante guardado y emite un solo cierre', () => {
    const cierre = jasmine.createSpy('cierre');
    fixture.componentInstance.alCerrarDialogo.subscribe(cierre);
    fixture.componentInstance.abrirDialogo();
    fixture.componentRef.setInput('guardando', true);
    fixture.detectChanges();
    dialogos()[0].dispatchEvent(new Event('cancel', { cancelable: true }));
    fixture.componentInstance.cerrarDialogo();
    expect(dialogos()[0].open).toBeTrue();
    expect(cierre).not.toHaveBeenCalled();
    fixture.componentRef.setInput('guardando', false);
    fixture.detectChanges();
    fixture.componentInstance.cerrarDialogo();
    fixture.componentInstance.cerrarDialogo();
    expect(cierre).toHaveBeenCalledTimes(1);
  });

  it('espera el resultado, evita doble envío y conserva contexto tras error', () => {
    fixture.componentRef.setInput('confirmacionControlada', true);
    fixture.detectChanges();
    const baja = jasmine.createSpy('baja');
    fixture.componentInstance.alEliminar.subscribe(baja);
    fixture.componentInstance.abrirConfirmacion(fila, confirmar);
    fixture.detectChanges();
    const modal = dialogos()[1];
    const botones = modal.querySelectorAll('footer button');
    expect(document.activeElement).toBe(botones[0]);
    (botones[1] as HTMLButtonElement).click();
    (botones[1] as HTMLButtonElement).click();
    expect(baja).toHaveBeenCalledOnceWith(fila);
    modal.dispatchEvent(new Event('cancel', { cancelable: true }));
    expect(modal.open).toBeTrue();
    fixture.componentRef.setInput('errorOperacion', 'No se pudo procesar');
    fixture.componentInstance.resolverConfirmacion(false);
    fixture.detectChanges();
    expect(modal.open).toBeTrue();
    expect(modal.textContent).toContain('No se pudo procesar');
    (botones[1] as HTMLButtonElement).click();
    expect(baja).toHaveBeenCalledTimes(2);
    fixture.componentInstance.resolverConfirmacion(true);
    expect(modal.open).toBeFalse();
  });

  it('permite activación explícita sin deducirla del registro ni emitir baja', () => {
    const evento = jasmine.createSpy('evento');
    const baja = jasmine.createSpy('baja');
    fixture.componentInstance.alConfirmarAccion.subscribe(evento);
    fixture.componentInstance.alEliminar.subscribe(baja);
    fixture.componentRef.setInput('confirmacionControlada', true);
    fixture.componentInstance.abrirConfirmacion(fila, { ...confirmar, varianteConfirmar: 'success', etiquetaConfirmar: 'Activar' }, 'activar');
    fixture.detectChanges();
    const botones = dialogos()[1].querySelectorAll('footer button');
    (botones[1] as HTMLButtonElement).click();
    expect(evento).toHaveBeenCalledOnceWith({ accion: 'activar', entidad: fila });
    expect(baja).not.toHaveBeenCalled();
  });

  it('conserva el cierre automático histórico cuando no se activa el modo controlado', () => {
    const baja = jasmine.createSpy('baja');
    fixture.componentInstance.alEliminar.subscribe(baja);
    fixture.componentInstance.abrirConfirmacion(fila, confirmar);
    fixture.detectChanges();
    const modal = dialogos()[1];
    (modal.querySelectorAll('footer button')[1] as HTMLButtonElement).click();
    expect(baja).toHaveBeenCalledOnceWith(fila);
    expect(modal.open).toBeFalse();
  });

  it('no borra búsqueda o tamaño de página al resolver una confirmación', () => {
    const pagina = jasmine.createSpy('pagina');
    fixture.componentInstance.alSolicitarPagina.subscribe(pagina);
    fixture.componentRef.setInput('tamanioPagina', 25);
    fixture.detectChanges();
    const filtro: Input = fixture.debugElement.query(By.directive(Input)).componentInstance;
    filtro.valueChange.emit('Café');
    fixture.componentInstance.abrirConfirmacion(fila, confirmar);
    fixture.componentInstance.resolverConfirmacion(true);
    const tabla: DataTable<{ id: string; nombre: string }> = fixture.debugElement.query(By.directive(DataTable)).componentInstance;
    tabla.pageChange.emit(2);
    expect(fixture.componentInstance.tamanioPagina()).toBe(25);
    expect(pagina).toHaveBeenCalledWith({ pagina: 2, tamano: 25, busqueda: 'Café' });
  });

  it('el buscador flotante oculta el marcador en reposo y lo muestra al enfocar', () => {
    const campoBusqueda = fixture.nativeElement.querySelector(
      'app-query-toolbar app-input input.field__input',
    ) as HTMLInputElement;
    const etiquetaFlotante = fixture.nativeElement.querySelector(
      'app-query-toolbar app-input label.fl-label--floating',
    ) as HTMLLabelElement;
    expect(etiquetaFlotante).not.toBeNull();
    expect(etiquetaFlotante.classList.contains('fl-label--floated')).toBeFalse();
    expect(campoBusqueda.hasAttribute('placeholder')).toBeFalse();

    campoBusqueda.dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    expect(etiquetaFlotante.classList.contains('fl-label--floated')).toBeTrue();
    expect(campoBusqueda.getAttribute('placeholder')).toBeTruthy();
  });
});
